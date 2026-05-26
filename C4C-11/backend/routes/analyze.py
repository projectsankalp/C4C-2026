from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeRequest, AnalyzeResponse, CommentResult
from services.youtube_service import extract_video_id, fetch_comments, get_video_details
from services.ml_service import analyze_comment
from services.resource_service import get_resources

router = APIRouter()

MOCK_COMMENTS = [
    {
        "comment_id": "m1",
        "text": "You are so stupid, why do you even post videos? Nobody likes you.",
        "author": "@ToxicUser1",
        "author_channel_url": "https://youtube.com/@toxic1",
        "author_profile_img": "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
        "like_count": 12
    },
    {
        "comment_id": "m2",
        "text": "I know where you live, I'm coming for you tonight. You better watch your back.",
        "author": "@ThreatMaster",
        "author_channel_url": "https://youtube.com/@threat",
        "author_profile_img": "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
        "like_count": 0
    },
    {
        "comment_id": "m3",
        "text": "People like you shouldn't be allowed on the internet. Go back to your own country.",
        "author": "@HateSpeaker99",
        "author_channel_url": "https://youtube.com/@hate",
        "author_profile_img": "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
        "like_count": 5
    },
    {
        "comment_id": "m4",
        "text": "This is f***ing garbage. Shut the f*** up and delete your channel.",
        "author": "@AngryRanter",
        "author_channel_url": "https://youtube.com/@angry",
        "author_profile_img": "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
        "like_count": 24
    },
    {
        "comment_id": "m5",
        "text": "Wow, this was really helpful! Thank you for sharing such a great video.",
        "author": "@KindSoul",
        "author_channel_url": "https://youtube.com/@kind",
        "author_profile_img": "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
        "like_count": 150
    }
]

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    # Check for mock/demo mode
    use_mock = request.youtube_url.lower() == "mock" or request.youtube_url.lower() == "demo"
    
    try:
        if use_mock:
            video_id = "mock_id_123"
            video_details = {"title": "DEMO VIDEO: Understanding Cyberbullying Impact"}
            comments = MOCK_COMMENTS
        else:
            video_id = extract_video_id(request.youtube_url)
            comments = fetch_comments(video_id, request.max_comments)
            video_details = get_video_details(video_id)
    except ValueError as e:
        if not use_mock:
            raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # If API fails (e.g. no key), fall back to mock for demo purposes if it looks like a demo request
        if "API key" in str(e) or "quota" in str(e):
             video_id = "demo_fallback"
             video_details = {"title": "Demo Mode (API Offline)"}
             comments = MOCK_COMMENTS
        else:
            raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    results = []
    harmful_count = 0
    category_breakdown = {}
    
    for comment in comments:
        analysis = analyze_comment(comment["text"])
        resources = get_resources(analysis["category"]) if analysis["is_harmful"] else []
        
        if analysis["is_harmful"]:
            harmful_count += 1
            cat = analysis["category"]
            category_breakdown[cat] = category_breakdown.get(cat, 0) + 1

        result = CommentResult(
            comment_id=comment["comment_id"],
            text=comment["text"],
            author=comment["author"],
            author_channel_url=comment["author_channel_url"],
            author_profile_img=comment["author_profile_img"],
            like_count=comment["like_count"],
            resources=resources,
            **analysis
        )
        results.append(result)

    return AnalyzeResponse(
        video_id=video_id,
        video_title=video_details["title"],
        youtube_url=request.youtube_url,
        total_comments=len(results),
        harmful_count=harmful_count,
        category_breakdown=category_breakdown,
        results=results
    )
