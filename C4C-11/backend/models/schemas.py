from pydantic import BaseModel
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    youtube_url: str
    max_comments: int = 50

class Resource(BaseModel):
    title: str
    url: str
    description: str

class CommentResult(BaseModel):
    comment_id: str
    text: str
    author: str               # Real YouTube display name
    author_channel_url: str   # Link to commenter's YouTube channel
    author_profile_img: str   # Profile picture URL
    like_count: int           # Number of likes on the comment
    is_harmful: bool
    toxicity_score: float
    category: str             # e.g., "insult", "threat", "identity_attack"
    reason: str               # Human-readable explanation
    resources: List[Resource] # Tailored anti-bullying resources

class AnalyzeResponse(BaseModel):
    video_id: str
    video_title: str          # Actual YouTube video title
    youtube_url: str          # Original URL
    total_comments: int
    harmful_count: int
    category_breakdown: dict # Mapping of category names to counts
    results: List[CommentResult]
