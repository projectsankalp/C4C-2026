from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class QueueItem(BaseModel):
    assessment_id: UUID
    user_id: UUID
    holder_name: str | None = None
    skill_name: str | None = None
    input_type: str
    language_code: str | None = None
    transcribed_text: str | None = None
    verification_status: str | None = None
    created_at: datetime | None = None


class VerifierSubmission(BaseModel):
    rubric_scores: dict = Field(default_factory=dict)
    overall_score: float = Field(ge=0.0, le=1.0)
    notes: str | None = None


class VerifierSubmitResponse(BaseModel):
    review_id: UUID
    assessment_id: UUID
    consensus_reached: bool
    verification_status: str | None = None
    escalated: bool = False


# ---------------------------------------------------------------------------
# Admin rubric override (Layer 2 — human marks)
# ---------------------------------------------------------------------------

class RubricCriteria(BaseModel):
    """A single rubric criterion with a name, max marks, and awarded marks."""
    criterion: str = Field(description="Name of the rubric criterion, e.g. 'Technical Accuracy'")
    max_marks: float = Field(ge=0, description="Maximum marks for this criterion")
    awarded_marks: float = Field(ge=0, description="Marks awarded by the admin/verifier")
    notes: str | None = None


class AdminRubricRequest(BaseModel):
    """
    Admin submits a full rubric with per-criterion marks.
    The overall_score is auto-computed as sum(awarded) / sum(max).
    Optionally the admin can override the final verification status.
    """
    rubric: list[RubricCriteria] = Field(min_length=1)
    admin_notes: str | None = None
    final_status: str = Field(
        default="admin_verified",
        description="Verification status to set: admin_verified | needs_improvement | rejected",
    )


class AdminRubricResponse(BaseModel):
    assessment_id: UUID
    review_id: UUID
    rubric: list[RubricCriteria]
    total_marks: float
    max_marks: float
    percentage: float
    overall_score: float          # 0.0–1.0 normalised
    final_status: str
    skill_id: UUID | None = None


class AssessmentDetailResponse(BaseModel):
    """Full detail of a single assessment for the admin review panel."""
    assessment_id: UUID
    user_id: UUID
    holder_name: str | None = None
    skill_name: str | None = None
    skill_id: UUID | None = None
    input_type: str
    language_code: str | None = None
    transcribed_text: str | None = None
    glm_raw_response: dict | None = None
    parsed_result: dict | None = None
    tts_audio_path: str | None = None
    tokens_used: int | None = None
    verification_status: str | None = None
    existing_reviews: list[dict] = Field(default_factory=list)
    created_at: datetime | None = None
