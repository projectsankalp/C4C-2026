from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.api.v1.verifier.schemas import (
    AdminRubricRequest,
    AdminRubricResponse,
    AssessmentDetailResponse,
    QueueItem,
    RubricCriteria,
    VerifierSubmission,
    VerifierSubmitResponse,
)
from app.db.queries import assessments as assessments_queries
from app.db.queries import users as users_queries
from app.api.v1.auth.router import CurrentUserId

router = APIRouter(prefix="/verifier", tags=["verifier"])

CONSENSUS_DELTA = 0.3

# Roles that are allowed to access verifier endpoints
VERIFIER_ROLES = frozenset({"verifier", "admin"})
ADMIN_ROLES = frozenset({"admin"})


async def _require_verifier_role(user_id: UUID) -> None:
    """Raise 403 if the authenticated user does not have a verifier or admin role."""
    user = await users_queries.get_user_by_id(user_id)
    if not user or user.get("role") not in VERIFIER_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: verifier or admin role required",
        )


async def _require_admin_role(user_id: UUID) -> None:
    """Raise 403 if the authenticated user does not have admin role."""
    user = await users_queries.get_user_by_id(user_id)
    if not user or user.get("role") not in ADMIN_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: admin role required",
        )


# ---------------------------------------------------------------------------
# Existing verifier endpoints
# ---------------------------------------------------------------------------

@router.get("/queue", response_model=list[QueueItem])
async def verifier_queue(user_id: CurrentUserId) -> list[QueueItem]:
    await _require_verifier_role(user_id)
    rows = await assessments_queries.get_pending_queue()
    items: list[QueueItem] = []
    for row in rows:
        users = row.get("users") or {}
        skills = row.get("skills") or {}
        items.append(
            QueueItem(
                assessment_id=UUID(row["id"]),
                user_id=UUID(row["user_id"]),
                holder_name=users.get("full_name"),
                skill_name=skills.get("skill_name"),
                input_type=row["input_type"],
                language_code=row.get("language_code"),
                transcribed_text=row.get("transcribed_text"),
                verification_status=skills.get("verification_status"),
                created_at=row.get("created_at"),
            )
        )
    return items


@router.post("/submit/{assessment_id}", response_model=VerifierSubmitResponse)
async def submit_verification(
    assessment_id: UUID,
    body: VerifierSubmission,
    verifier_user_id: CurrentUserId,
) -> VerifierSubmitResponse:
    await _require_verifier_role(verifier_user_id)

    assessment = await assessments_queries.get_assessment_by_id(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    review = await assessments_queries.insert_verifier_review(
        assessment_id,
        verifier_user_id,
        rubric_scores=body.rubric_scores,
        overall_score=body.overall_score,
        notes=body.notes,
    )

    reviews = await assessments_queries.get_assessment_reviews(assessment_id)
    consensus_reached = False
    escalated = False
    verification_status: str | None = None

    # Re-evaluate consensus on every submission once at least 2 reviews exist.
    # Use the two most recent reviews to determine agreement.
    if len(reviews) >= 2:
        last_two = reviews[-2:]
        score_delta = abs(
            float(last_two[0]["overall_score"]) - float(last_two[1]["overall_score"])
        )
        skill_id = assessment.get("skill_id")
        if score_delta < CONSENSUS_DELTA and skill_id:
            await assessments_queries.update_skill_verification_status(
                UUID(skill_id), "community_verified"
            )
            consensus_reached = True
            verification_status = "community_verified"
        elif not consensus_reached:
            await assessments_queries.flag_for_escalation(assessment_id)
            escalated = True

    return VerifierSubmitResponse(
        review_id=UUID(review["id"]),
        assessment_id=assessment_id,
        consensus_reached=consensus_reached,
        verification_status=verification_status,
        escalated=escalated,
    )


# ---------------------------------------------------------------------------
# Admin Layer 2 endpoints
# ---------------------------------------------------------------------------

@router.get("/assessment/{assessment_id}", response_model=AssessmentDetailResponse)
async def get_assessment_detail(
    assessment_id: UUID,
    user_id: CurrentUserId,
) -> AssessmentDetailResponse:
    """
    Full detail view of a single assessment for the admin review panel.
    Returns AI result, transcript, existing reviews, and skill info.
    """
    await _require_verifier_role(user_id)

    assessment = await assessments_queries.get_assessment_by_id(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Fetch related user and skill info
    holder_name: str | None = None
    skill_name: str | None = None
    verification_status: str | None = None

    try:
        user = await users_queries.get_user_by_id(UUID(assessment["user_id"]))
        if user:
            holder_name = user.get("full_name")
    except Exception:
        pass

    skill_id_raw = assessment.get("skill_id")
    skill_id: UUID | None = None
    if skill_id_raw:
        try:
            from app.db.queries import passport as passport_queries
            skill_id = UUID(skill_id_raw)
            # Fetch skill name + status from skills table
            from app.db.queries.users import get_supabase_admin
            client = get_supabase_admin()
            skill_row = (
                client.table("skills")
                .select("skill_name, verification_status")
                .eq("id", str(skill_id))
                .maybe_single()
                .execute()
            )
            if skill_row.data:
                skill_name = skill_row.data.get("skill_name")
                verification_status = skill_row.data.get("verification_status")
        except Exception:
            pass

    existing_reviews = await assessments_queries.get_assessment_reviews(assessment_id)

    return AssessmentDetailResponse(
        assessment_id=UUID(assessment["id"]),
        user_id=UUID(assessment["user_id"]),
        holder_name=holder_name,
        skill_name=skill_name,
        skill_id=skill_id,
        input_type=assessment["input_type"],
        language_code=assessment.get("language_code"),
        transcribed_text=assessment.get("transcribed_text"),
        glm_raw_response=assessment.get("glm_raw_response"),
        parsed_result=assessment.get("parsed_result"),
        tts_audio_path=assessment.get("tts_audio_path"),
        tokens_used=assessment.get("tokens_used"),
        verification_status=verification_status,
        existing_reviews=existing_reviews,
        created_at=assessment.get("created_at"),
    )


@router.post("/override/{assessment_id}", response_model=AdminRubricResponse)
async def admin_rubric_override(
    assessment_id: UUID,
    body: AdminRubricRequest,
    admin_user_id: CurrentUserId,
) -> AdminRubricResponse:
    """
    Admin Layer 2 — submit a full rubric with per-criterion marks.
    Bypasses the 2-reviewer consensus and directly sets the final
    verification status on the linked skill.

    The overall_score (0.0–1.0) is auto-computed from the rubric totals.
    """
    await _require_admin_role(admin_user_id)

    assessment = await assessments_queries.get_assessment_by_id(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Validate awarded marks don't exceed max marks per criterion
    for criterion in body.rubric:
        if criterion.awarded_marks > criterion.max_marks:
            raise HTTPException(
                status_code=422,
                detail=f"Awarded marks ({criterion.awarded_marks}) exceed max marks "
                       f"({criterion.max_marks}) for criterion '{criterion.criterion}'",
            )

    # Compute totals
    total_max = sum(c.max_marks for c in body.rubric)
    total_awarded = sum(c.awarded_marks for c in body.rubric)
    overall_score = round(total_awarded / total_max, 4) if total_max > 0 else 0.0
    percentage = round((total_awarded / total_max) * 100, 2) if total_max > 0 else 0.0

    # Validate final_status value
    allowed_statuses = {"admin_verified", "needs_improvement", "rejected", "community_verified"}
    if body.final_status not in allowed_statuses:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid final_status. Must be one of: {', '.join(sorted(allowed_statuses))}",
        )

    # Persist as a verifier review with the rubric stored in rubric_scores
    rubric_scores_payload = {
        c.criterion: {
            "max_marks": c.max_marks,
            "awarded_marks": c.awarded_marks,
            "notes": c.notes,
        }
        for c in body.rubric
    }

    review = await assessments_queries.insert_verifier_review(
        assessment_id,
        admin_user_id,
        rubric_scores=rubric_scores_payload,
        overall_score=overall_score,
        notes=body.admin_notes,
    )

    # Admin override — directly set the final verification status on the skill
    skill_id_raw = assessment.get("skill_id")
    skill_id: UUID | None = None
    if skill_id_raw:
        skill_id = UUID(skill_id_raw)
        await assessments_queries.update_skill_verification_status(skill_id, body.final_status)

    return AdminRubricResponse(
        assessment_id=assessment_id,
        review_id=UUID(review["id"]),
        rubric=body.rubric,
        total_marks=total_awarded,
        max_marks=total_max,
        percentage=percentage,
        overall_score=overall_score,
        final_status=body.final_status,
        skill_id=skill_id,
    )

