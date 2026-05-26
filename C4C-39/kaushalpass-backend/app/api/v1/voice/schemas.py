"""Voice assessment request/response schemas."""

from typing import Literal

from pydantic import BaseModel, Field

LangCode = Literal["hi-IN", "ta-IN", "te-IN", "kn-IN", "bn-IN", "en-IN"]
SkillLevel = Literal["beginner", "intermediate", "expert"]


class TranscribeResult(BaseModel):
    transcript: str
    language_code: LangCode


class VoiceAssessResult(BaseModel):
    skill_name: str
    level: SkillLevel
    confidence: float = Field(ge=0, le=1)
    reasoning: str
    nsqf_level: int = Field(ge=1, le=8)
    suggested_documents: list[str] = Field(default_factory=list)
    transcribed_text: str
    tts_audio_url: str


class VoiceAssessResponse(BaseModel):
    """Final assessment payload sent in SSE [DONE] event."""

    skillName: str
    level: SkillLevel
    confidence: float
    reasoning: str
    nsqfLevel: int
    suggestedDocuments: list[str]
    transcribedText: str
    ttsAudioUrl: str

    @classmethod
    def from_assess_dict(cls, data: dict[str, object]) -> "VoiceAssessResponse":
        return cls(
            skillName=str(data["skillName"]),
            level=data["level"],  # type: ignore[arg-type]
            confidence=float(data["confidence"]),
            reasoning=str(data["reasoning"]),
            nsqfLevel=int(data["nsqfLevel"]),
            suggestedDocuments=list(data.get("suggestedDocuments", [])),
            transcribedText=str(data["transcribedText"]),
            ttsAudioUrl=str(data["ttsAudioUrl"]),
        )
