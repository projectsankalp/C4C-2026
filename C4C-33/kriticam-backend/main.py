"""
HaathSe — KritiCam AI Backend
Person 1: AI & Data Engineer pipeline

Endpoints:
  POST /api/upload         — Receives image, runs GPT-4o Vision, saves to Supabase
  GET  /api/products       — Returns all products from Supabase (for live buyer catalog)
  GET  /api/products/{id}  — Returns single product by ID
  GET  /api/health         — Health check
"""

import os
import base64
import json
import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
# Initialize app
# ─────────────────────────────────────────────
app = FastAPI(
    title="HaathSe KritiCam AI API",
    description="AI-powered artisan craft cataloguing backend for HaathSe.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon: allow all. Tighten in prod.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Lazy-load optional clients (avoids crash if keys missing)
# ─────────────────────────────────────────────
def get_supabase():
    from supabase import create_client
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        raise HTTPException(status_code=503, detail="Supabase credentials not configured.")
    return create_client(url, key)


def get_openai():
    from openai import OpenAI
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="OpenAI API key not configured.")
    return OpenAI(api_key=api_key)


# ─────────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────────

class ProductMetadata(BaseModel):
    """Strict JSON schema enforced on GPT-4o structured output."""
    product_name: str = Field(..., description="Short commercial name of the craft item")
    craft_style: str = Field(..., description="Traditional Indian craft classification, e.g. 'Madhubani Painting', 'Dhokra Art', 'Kanjivaram Silk'")
    estimated_dimensions: str = Field(..., description="Physical size estimate from visual inspection, e.g. '30cm x 20cm'")
    materials_detected: str = Field(..., description="Comma-separated list of materials visually identified")
    craftsmanship_score: float = Field(..., ge=0.0, le=100.0, description="Quality and authenticity score out of 100")
    fair_price_inr: int = Field(..., description="Recommended fair wholesale price in Indian Rupees")
    fair_price_usd: int = Field(..., description="Recommended fair wholesale price in USD")
    artisan_cut_percentage: int = Field(default=62, description="Percentage of sale price that goes directly to the artisan")
    marketing_story: str = Field(..., description="Evocative 3-4 sentence luxury catalog story for global B2B buyers")
    heritage_region: str = Field(..., description="Most likely Indian state or craft district of origin")
    tags: List[str] = Field(default=[], description="Up to 5 SEO/catalog tags for the product")


class ProductRecord(BaseModel):
    """Full product record returned from the API (after DB insert)."""
    id: str
    created_at: str
    product_name: str
    craft_style: str
    estimated_dimensions: Optional[str]
    materials_detected: Optional[str]
    craftsmanship_score: Optional[float]
    fair_price_inr: Optional[int]
    fair_price_usd: Optional[int]
    artisan_cut_percentage: Optional[int]
    marketing_story: Optional[str]
    heritage_region: Optional[str]
    tags: Optional[List[str]]
    image_url: Optional[str]
    status: str  # 'pending' | 'verified' | 'published'


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.get("/api/health", tags=["System"])
def health_check():
    """Quick health check. Confirms backend is live."""
    return {
        "status": "ok",
        "service": "HaathSe KritiCam API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "supabase_configured": bool(os.getenv("SUPABASE_URL")),
    }


@app.post("/api/upload", tags=["KritiCam Pipeline"])
async def upload_artisan_craft(file: UploadFile = File(...)):
    """
    Core pipeline endpoint.
    1. Receives image file from WhatsApp mock (Person 3's frontend)
    2. Base64-encodes and sends to GPT-4o Vision
    3. Parses structured JSON output (ProductMetadata)
    4. Saves listing to Supabase
    5. Returns the full product record

    Demo note: if OPENAI_API_KEY is not set, returns a rich mock response
    so the demo still works end-to-end without API credits.
    """

    # Validate file type
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Only image files are accepted. Received: {content_type}"
        )

    # Read & encode image
    try:
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")
        base64_image = base64.b64encode(contents).decode("utf-8")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File read error: {str(e)}")

    # Run GPT-4o Vision pipeline (or use mock fallback)
    if os.getenv("OPENAI_API_KEY"):
        parsed_data = await _run_kriticam_vision_pipeline(base64_image, content_type)
    else:
        # Hackathon demo fallback — returns rich mock so demo works without API credits
        parsed_data = _get_mock_analysis()

    # Save to database
    record = await _save_to_database(parsed_data)
    return record


async def _run_kriticam_vision_pipeline(base64_image: str, content_type: str) -> ProductMetadata:
    """Runs the GPT-4o structured vision analysis against the uploaded craft image."""
    client = get_openai()

    SYSTEM_PROMPT = """You are KritiCam — an expert AI appraiser of traditional Indian handicrafts with deep knowledge of:
- Craft heritage styles (Madhubani, Warli, Dhokra, Kanjivaram, Blue Pottery, Pashmina, Bidriware, etc.)
- Material analysis from visual patterns (silk thread count, metal ratios, clay composition markers)
- Fair trade pricing models based on Indian craft markets

When analyzing an image:
1. Identify the craft style with confidence
2. Estimate physical dimensions from visual proportions
3. List visible materials
4. Score craftsmanship quality (symmetry, density, finish)
5. Recommend a fair wholesale price (ensuring 60%+ goes to artisan)
6. Write a luxury catalog story that evokes emotional connection for premium global B2B buyers (hotel interior designers, boutique curators)

Always respond in the exact JSON schema provided. Be specific and professional."""

    USER_PROMPT = """Analyze this traditional Indian handicraft item and provide a complete catalog assessment.
Focus on:
- The specific craft tradition and heritage lineage
- Material composition from visual analysis
- Craftsmanship quality indicators
- Fair pricing that ensures artisan gets 60%+ of revenue
- A compelling luxury narrative for international B2B buyers

Output must strictly match the provided JSON schema."""

    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": USER_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{content_type};base64,{base64_image}",
                                "detail": "high"
                            }
                        }
                    ]
                }
            ],
            response_format=ProductMetadata,
            max_tokens=1000,
            temperature=0.4,  # Lower temp = more consistent structured outputs
        )
        return response.choices[0].message.parsed

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"GPT-4o Vision pipeline error: {str(e)}"
        )


def _get_mock_analysis() -> ProductMetadata:
    """
    Returns a rich mock ProductMetadata for hackathon demo when no OpenAI key is set.
    This allows the full demo flow to work without API costs.
    """
    return ProductMetadata(
        product_name="Hand-Painted Madhubani Folk Art Panel",
        craft_style="Madhubani Painting",
        estimated_dimensions="45cm x 30cm",
        materials_detected="Handmade paper, natural mineral pigments, black ink outlines, vegetable dyes",
        craftsmanship_score=94.7,
        fair_price_inr=8500,
        fair_price_usd=112,
        artisan_cut_percentage=63,
        marketing_story=(
            "Born from the ancient mud walls of Mithila, this Madhubani panel carries the unbroken "
            "artistic lineage of women painters who for centuries used rice paste and natural earth "
            "pigments to tell stories of the divine. The intricate double-line borders, symbolic fish "
            "motifs for prosperity, and the cosmic tree of life are rendered in vibrant mineral hues "
            "that will never fade—each stroke a silent prayer passed from grandmother to granddaughter "
            "across five thousand years of living tradition."
        ),
        heritage_region="Madhubani District, Bihar",
        tags=["Madhubani", "Folk Art", "Bihar", "Natural Pigments", "Handmade Paper"]
    )


async def _save_to_database(data: ProductMetadata) -> dict:
    """Inserts the parsed product data into Supabase and returns the full record."""

    # Generate a deterministic record ID for easy referencing
    record_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()

    db_payload = {
        "id": record_id,
        "created_at": timestamp,
        "product_name": data.product_name,
        "craft_style": data.craft_style,
        "estimated_dimensions": data.estimated_dimensions,
        "materials_detected": data.materials_detected,
        "craftsmanship_score": round(data.craftsmanship_score, 1),
        "fair_price_inr": data.fair_price_inr,
        "fair_price_usd": data.fair_price_usd,
        "artisan_cut_percentage": data.artisan_cut_percentage,
        "marketing_story": data.marketing_story,
        "heritage_region": data.heritage_region,
        "tags": data.tags,
        # Placeholder image — in production, we'd upload the image to Supabase Storage
        "image_url": "https://images.unsplash.com/photo-1582721478779-0ae163c05a60?auto=format&fit=crop&q=80&w=600",
        "status": "published",
    }

    if os.getenv("SUPABASE_URL"):
        try:
            supabase = get_supabase()
            response = supabase.table("products").insert(db_payload).execute()
            return {"status": "success", "product": response.data[0] if response.data else db_payload}
        except Exception as db_err:
            # Graceful degradation: return data even if DB fails during demo
            print(f"[WARNING] Database insertion failed: {db_err}")
            return {"status": "success_no_db", "product": db_payload, "db_error": str(db_err)}
    else:
        # No Supabase configured — return the payload directly (still demo-able)
        return {"status": "success_mock_db", "product": db_payload}


@app.get("/api/products", tags=["Marketplace"])
async def get_all_products(
    limit: int = Query(default=20, le=100, description="Max results to return"),
    status: str = Query(default="published", description="Filter by status: published, pending, verified"),
):
    """
    Returns all products from Supabase for the live B2B buyer catalog.
    Person 2's frontend calls this endpoint to populate the marketplace grid.
    Falls back to mock data if Supabase is not configured.
    """
    if not os.getenv("SUPABASE_URL"):
        return {"status": "mock", "products": _get_mock_catalog()}

    try:
        supabase = get_supabase()
        response = (
            supabase.table("products")
            .select("*")
            .eq("status", status)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return {"status": "ok", "count": len(response.data), "products": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")


@app.get("/api/products/{product_id}", tags=["Marketplace"])
async def get_product_by_id(product_id: str):
    """Returns a single product record by its UUID. Used for the provenance story page."""
    if not os.getenv("SUPABASE_URL"):
        mock = _get_mock_catalog()
        match = next((p for p in mock if p["id"] == product_id), None)
        if not match:
            raise HTTPException(status_code=404, detail="Product not found in mock catalog.")
        return {"status": "mock", "product": match}

    try:
        supabase = get_supabase()
        response = supabase.table("products").select("*").eq("id", product_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Product not found.")
        return {"status": "ok", "product": response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")


def _get_mock_catalog() -> list:
    """Returns seed catalog data for when Supabase is not configured."""
    return [
        {
            "id": "mock-001",
            "created_at": "2026-05-24T10:30:00Z",
            "product_name": "Imperial Cobalt Ceramic Vase",
            "craft_style": "Blue Pottery",
            "estimated_dimensions": "14\" Height x 8\" Diameter",
            "materials_detected": "Quartz Stone Powder, Glass Powder, Cobalt oxide, Copper oxide, Natural glaze",
            "craftsmanship_score": 98.4,
            "fair_price_inr": 12500,
            "fair_price_usd": 165,
            "artisan_cut_percentage": 60,
            "marketing_story": "Woven in time, this ceramic vase boasts the majestic Cobalt Blue hue that was historically favored by Jaipur royalty. Hand-molded and glazed with melted glass powder, this vase is a testament to 36-year mastery.",
            "heritage_region": "Kot Jewar, Jaipur, Rajasthan",
            "tags": ["Ceramic", "Blue Pottery", "Jaipur", "Natural Dyes", "Lead-Free"],
            "image_url": "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=600",
            "status": "published"
        },
        {
            "id": "mock-002",
            "created_at": "2026-05-24T12:00:00Z",
            "product_name": "Royal Gopuram Mulberry Silk Saree",
            "craft_style": "Kanjivaram Silk Weaving",
            "estimated_dimensions": "5.5 meters x 1.2 meters",
            "materials_detected": "100% pure Mulberry Silk, Pure silver zari plated with 24k gold",
            "craftsmanship_score": 99.2,
            "fair_price_inr": 84000,
            "fair_price_usd": 1099,
            "artisan_cut_percentage": 64,
            "marketing_story": "Woven over 15 days on a traditional throw-shuttle pit loom, this saree showcases the signature heavy silk weight and features the Gopuram temple tower motif — a living architectural document.",
            "heritage_region": "Kanchipuram, Tamil Nadu",
            "tags": ["Textiles", "Kanjivaram Silk", "Gold Zari", "Handloom", "Royal Wear"],
            "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
            "status": "published"
        }
    ]


# ─────────────────────────────────────────────
# Entry point (for local dev)
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
