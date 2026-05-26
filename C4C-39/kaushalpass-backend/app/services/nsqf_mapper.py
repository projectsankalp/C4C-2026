from Levenshtein import ratio as levenshtein_ratio

NSQF_DICT: dict[str, int] = {
    "domestic cleaning": 2,
    "housekeeping": 2,
    "cooking basic": 3,
    "home cooking": 3,
    "tailoring basic": 3,
    "hand embroidery": 4,
    "machine embroidery": 4,
    "bridal mehendi": 5,
    "advanced mehendi": 5,
    "bridal makeup": 5,
    "masonry helper": 3,
    "plumbing helper": 3,
    "carpentry basic": 3,
    "garment stitching": 4,
    "fabric cutting": 4,
}

FUZZY_THRESHOLD = 0.72


def map_skill_to_nsqf(skill_name: str) -> tuple[int | None, str | None]:
    normalized = skill_name.strip().lower()
    if normalized in NSQF_DICT:
        return NSQF_DICT[normalized], normalized

    best_key: str | None = None
    best_score = 0.0
    for key in NSQF_DICT:
        score = levenshtein_ratio(normalized, key)
        if score > best_score:
            best_score = score
            best_key = key

    if best_key and best_score >= FUZZY_THRESHOLD:
        return NSQF_DICT[best_key], best_key
    return None, None
