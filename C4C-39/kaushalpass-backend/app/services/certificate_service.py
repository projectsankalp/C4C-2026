import io
from uuid import UUID

import qrcode
from fastapi import HTTPException
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Image as RLImage
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.db.queries import passport as passport_queries
from app.db.queries import users as users_queries
from app.db.queries.users import get_settings
from app.services.document_service import get_signed_url, upload_to_storage

_certificate_jobs: dict[str, dict] = {}


async def generate_certificate(user_id: UUID) -> dict:
    settings = get_settings()
    passport = await passport_queries.get_passport_by_user(user_id)
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")

    user = await users_queries.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    skills = await passport_queries.get_skills(UUID(passport["id"]))
    passport_id = UUID(passport["id"])
    verify_url = f"{settings['app_url']}/verify/{passport_id}"

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2 * cm, leftMargin=2 * cm)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("<b>KaushalPass</b>", styles["Title"]),
        Paragraph("Digital Skill Passport", styles["Heading2"]),
        Paragraph(f"Passport Code: <b>{passport['passport_code']}</b>", styles["Normal"]),
        Spacer(1, 0.5 * cm),
        Paragraph(f"<b>{user['full_name']}</b>", styles["Heading1"]),
        Paragraph(
            f"Issued: {str(passport.get('issued_at', passport.get('created_at', '')))[:10]}",
            styles["Normal"],
        ),
        Paragraph(
            f"Occupation: {user.get('occupation_category') or 'Informal Sector'}",
            styles["Normal"],
        ),
        Spacer(1, 0.5 * cm),
    ]

    table_data = [["Skill Name", "Level", "NSQF Level", "Verified By"]]
    for skill in skills:
        verified_by = skill.get("verification_status", "pending")
        table_data.append(
            [
                skill.get("skill_name", ""),
                skill.get("skill_level") or "-",
                str(skill.get("nsqf_level") or "-"),
                verified_by.replace("_", " ").title(),
            ]
        )

    table = Table(table_data, colWidths=[6 * cm, 3 * cm, 3 * cm, 4 * cm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E3A5F")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ]
        )
    )
    story.append(table)

    qr = qrcode.QRCode(version=1, box_size=4, border=2)
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_image = qr.make_image(fill_color="black", back_color="white")
    qr_buffer = io.BytesIO()
    qr_image.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)

    story.append(Spacer(1, 1 * cm))
    story.append(RLImage(qr_buffer, width=3 * cm, height=3 * cm))
    story.append(
        Paragraph(
            f"Verify at kaushalpass.in/verify/{passport['passport_code']}",
            styles["Normal"],
        )
    )

    doc.build(story)
    pdf_bytes = buffer.getvalue()

    storage_path = f"{passport_id}.pdf"
    await upload_to_storage(
        settings["storage_bucket_certificates"],
        storage_path,
        pdf_bytes,
        "application/pdf",
    )
    signed_url = await get_signed_url(
        settings["storage_bucket_certificates"],
        storage_path,
        expires_in=60 * 60 * 24 * 365,
    )

    job_id = str(passport_id)
    _certificate_jobs[job_id] = {
        "status": "completed",
        "download_url": signed_url,
        "passport_id": str(passport_id),
    }

    return {
        "job_id": job_id,
        "status": "completed",
        "download_url": signed_url,
        "passport_code": passport["passport_code"],
    }


def get_certificate_status(job_id: str) -> dict | None:
    return _certificate_jobs.get(job_id)
