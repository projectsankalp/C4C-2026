import os
import json
from groq import Groq
from dotenv import load_dotenv
from schemes import SCHEMES, get_scheme_by_id, fallback_keyword_match

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# -----------------------------
# 🔍 PREFILTER FUNCTION
# -----------------------------
def prefilter_schemes(user_problem, top_n=8):
    keywords = user_problem.lower().split()

    scored = []
    for scheme in SCHEMES:
        text = (scheme['name'] + " " + scheme.get('description', '')).lower()

        score = sum(1 for word in keywords if word in text)

        if score > 0:
            scored.append((score, scheme))

    # sort by score descending
    scored.sort(reverse=True, key=lambda x: x[0])

    return [s[1] for s in scored[:top_n]]


# -----------------------------
# 🤖 MAIN AI MATCH FUNCTION
# -----------------------------
def match_schemes_with_ai(user_problem):
    # STEP 1: Prefilter (NO TOKENS USED)
    filtered_schemes = prefilter_schemes(user_problem)

    # fallback if nothing matched
    if not filtered_schemes:
        return {
            "analysis": "Showing general relevant schemes",
            "schemes": fallback_keyword_match(user_problem)
        }

    # STEP 2: Compact scheme list (LOW TOKEN USAGE)
    scheme_list = "\n".join([
        f"{s['id']}|{s['name']}"
        for s in filtered_schemes
    ])

    prompt = f"""
You are an expert in Indian Government Schemes.

User problem:
"{user_problem}"

Schemes:
{scheme_list}

Select the BEST 3 scheme IDs.

Respond ONLY in JSON:
{{
  "analysis": "short reason",
  "ids": [id1, id2, id3]
}}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=200
        )

        result = json.loads(response.choices[0].message.content)

        # STEP 3: Fetch full scheme data locally
        matched_schemes = []
        for sid in result.get("ids", []):
            scheme = get_scheme_by_id(sid)
            if scheme:
                scheme_copy = scheme.copy()

                # STEP 4: Attach media locally (NO AI CALL)
                scheme_copy["poster"] = f"/static/posters/{sid}.png"
                scheme_copy["video"] = f"/static/videos/{sid}.mp4"

                matched_schemes.append(scheme_copy)

        # fallback safety
        if not matched_schemes:
            matched_schemes = fallback_keyword_match(user_problem)

        return {
            "analysis": result.get("analysis", ""),
            "schemes": matched_schemes
        }

    except Exception as e:
        print("AI ERROR:", e)

        return {
            "analysis": "Here are some helpful schemes",
            "schemes": fallback_keyword_match(user_problem)
        }