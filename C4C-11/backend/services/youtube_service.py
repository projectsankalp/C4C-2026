# backend/services/youtube_service.py
import re
import os
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def extract_video_id(url: str) -> str:
    pattern = r"(?:v=|\/|embed\/|youtu\.be\/)([0-9A-Za-z_-]{11})"
    match = re.search(pattern, url)
    if not match:
        raise ValueError("Invalid YouTube URL")
    return match.group(1)

def fetch_comments(video_id: str, max_results: int = 50) -> list:
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "YOUR_YOUTUBE_API_KEY_HERE":
        # Return mock data if API key is missing for testing
        return [
            {
                "comment_id": "mock1", 
                "text": "This is a great video!", 
                "author": "User A",
                "author_channel_url": "https://youtube.com/@UserA",
                "author_profile_img": "https://api.dicebear.com/7.x/avataaars/svg?seed=UserA",
                "like_count": 10
            },
            {
                "comment_id": "mock2", 
                "text": "You are so stupid and I hate you.", 
                "author": "User B",
                "author_channel_url": "https://youtube.com/@UserB",
                "author_profile_img": "https://api.dicebear.com/7.x/avataaars/svg?seed=UserB",
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
        "text": "This is garbage. Shut up and delete your channel.",
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
    
    youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
    try:
        response = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=max_results,
            textFormat="plainText"
        ).execute()

        comments = []
        for item in response.get("items", []):
            snippet = item["snippet"]["topLevelComment"]["snippet"]
            comments.append({
                "comment_id": item["id"],
                "text": snippet["textDisplay"],
                "author": snippet["authorDisplayName"],
                "author_channel_url": snippet.get("authorChannelUrl", ""),
                "author_profile_img": snippet.get("authorProfileImageUrl", ""),
                "like_count": snippet.get("likeCount", 0)
            })
        return comments
    except Exception as e:
        raise Exception(f"YouTube API Error: {str(e)}")

def get_video_details(video_id: str) -> dict:
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "YOUR_YOUTUBE_API_KEY_HERE":
        return {"title": "Mock Video Title"}
    
    youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
    try:
        response = youtube.videos().list(
            part="snippet",
            id=video_id
        ).execute()
        
        if not response.get("items"):
            return {"title": "Unknown Video"}
            
        return {"title": response["items"][0]["snippet"]["title"]}
    except Exception:
        return {"title": "Unknown Video"}