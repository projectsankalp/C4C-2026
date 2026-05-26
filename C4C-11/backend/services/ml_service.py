import torch
from transformers import BertTokenizer, BertForSequenceClassification
import numpy as np

# ── Device ────────────────────────────────────────────────────────────────────
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ── Model Config ──────────────────────────────────────────────────────────────
MODEL_NAME = "unitary/toxic-bert"

# ── Category & Reason Maps ────────────────────────────────────────────────────
# unitary/toxic-bert outputs exactly these 6 labels in this order
CATEGORIES = [
    "toxicity",
    "severe_toxicity",
    "obscene",
    "threat",
    "insult",
    "identity_attack",
]

REASONS = {
    "toxicity":        "This comment contains language that is rude or disrespectful.",
    "severe_toxicity": "This comment contains extremely harmful language.",
    "obscene":         "This comment uses explicit or offensive language.",
    "threat":          "This comment appears to threaten harm to someone.",
    "insult":          "This comment personally attacks or demeans an individual.",
    "identity_attack": "This comment targets someone based on their identity (race, religion, gender, etc.).",
}

THRESHOLD = 0.5

# ── Load Model & Tokenizer ────────────────────────────────────────────────────
print("⏳ Loading unitary/toxic-bert...")
tokenizer = BertTokenizer.from_pretrained(MODEL_NAME)
model     = BertForSequenceClassification.from_pretrained(MODEL_NAME)
model.to(DEVICE)
model.eval()
print("✅ toxic-bert loaded successfully!")


# ── Inference ─────────────────────────────────────────────────────────────────
def analyze_comment(text: str) -> dict:
    """
    Runs a comment through unitary/toxic-bert.
    
    This model is fine-tuned on the Jigsaw dataset and outputs
    6 toxicity scores directly — no extra training needed.
    Works correctly out of the box for both good and bad comments.
    """
    # Tokenize
    encoding = tokenizer(
        text,
        max_length=128,
        padding="max_length",
        truncation=True,
        return_tensors="pt"
    )

    input_ids      = encoding["input_ids"].to(DEVICE)
    attention_mask = encoding["attention_mask"].to(DEVICE)
    token_type_ids = encoding["token_type_ids"].to(DEVICE)  # BERT uses token_type_ids

    # Forward pass
    with torch.no_grad():
        output = model(
            input_ids=input_ids,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids
        )

    # Sigmoid to get probabilities per category (model outputs raw logits)
    probs     = torch.sigmoid(output.logits).squeeze(0).cpu().numpy()
    score_map = dict(zip(CATEGORIES, probs.tolist()))

    top_category = max(score_map, key=score_map.get)
    top_score    = float(score_map[top_category])
    is_harmful   = top_score >= THRESHOLD

    return {
        "is_harmful":     is_harmful,
        "toxicity_score": round(top_score, 3),
        "all_scores":     {k: round(float(v), 3) for k, v in score_map.items()},
        "category":       top_category if is_harmful else "clean",
        "reason":         REASONS.get(top_category, "No issues detected.") if is_harmful else "This comment appears safe.",
    }