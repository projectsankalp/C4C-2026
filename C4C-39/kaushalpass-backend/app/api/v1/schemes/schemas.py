from pydantic import BaseModel, Field


class SchemeRecommendRequest(BaseModel):
    problem: str = Field(
        min_length=5,
        description="Describe your situation or what kind of support you need",
        examples=["I am a welder looking for a loan to buy equipment"],
    )


class SchemeItem(BaseModel):
    id: int
    name: str
    tagline: str
    icon: str
    benefits: str
    eligibility: str
    description: str
    documents: list[str]
    link: str
    color: str
    gradient: list[str]
    ministry: str
    ai_reasoning: str


class SchemeRecommendResponse(BaseModel):
    analysis: str
    schemes: list[SchemeItem]
