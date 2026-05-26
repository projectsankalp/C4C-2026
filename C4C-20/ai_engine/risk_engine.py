"""
AarogyaNet Risk Engine — v2.0: Pathway-Aware Clinical Prioritisation.

Scoring is now a three-layer pipeline:

  Layer 1 — Base vitals score (rule-based, same as before)
  Layer 2 — GCPE pathway integration (pathway boosts + score/level floors)
  Layer 3 — Clinical contradiction guards (hard safety nets)

Layer 2 is data-driven: PATHWAY_RULES maps each GCPE pathway to its
risk implications. Adding a new disease protocol only requires adding
new pathway keys here — no logic changes needed in the engine.

Layer 3 ensures clinical contradictions can never occur regardless of
what pathway data is available (e.g. chest pain is always HIGH risk).

API surface is preserved:
  calculate_risk_score(visit_data) → (score: int, level: str)
  get_risk_summary(score, level, visit_data) → dict
"""

from ai_engine.preprocessing import preprocess_visit

# ── Layer 1: Base vitals scoring rules ───────────────────────────────────────
# Each rule: (test_function, points)
# Applied to the preprocessed feature dict.

VITALS_RULES = [
    (lambda f: f['bp_systolic'] >= 180,  40),  # Very high BP
    (lambda f: 160 <= f['bp_systolic'] < 180, 30),  # High BP
    (lambda f: f['bp_diastolic'] >= 110, 15),  # Diastolic crisis (additive)
    (lambda f: f['chest_pain'],          25),  # Chest pain — urgent
    (lambda f: f['medicine_missed'],     20),  # Missed medication
    (lambda f: f['dizziness'],           10),  # Dizziness
    (lambda f: f['pulse'] > 120,         10),  # Tachycardia (severe)
    (lambda f: 100 < f['pulse'] <= 120,   5),  # Tachycardia (mild)
]


# ── Layer 2: GCPE pathway rules ───────────────────────────────────────────────
# Keys match the `pathway` values in the GCPE protocol JSON.
# score_floor  : minimum score after pathway integration
# level_floor  : minimum risk level after pathway integration
# score_boost  : additive boost applied on top of the base vitals score
# referral_urgency : machine-readable urgency label
# escalation_reason: used in the doctor summary

PATHWAY_RULES = {
    'cardiac_emergency': {
        'score_floor':       80,
        'level_floor':       'HIGH',
        'score_boost':       30,
        'referral_urgency':  'IMMEDIATE',
        'escalation_reason': (
            'Chest pain with breathing difficulty — possible acute cardiac event. '
            'Immediate PHC/hospital referral required. Do not send home.'
        ),
    },
    'hypertensive_crisis': {
        'score_floor':       75,
        'level_floor':       'HIGH',
        'score_boost':       25,
        'referral_urgency':  'URGENT',
        'escalation_reason': (
            'Hypertensive crisis — systolic ≥ 180 mmHg or diastolic ≥ 110 mmHg. '
            'Refer to district hospital for urgent BP management.'
        ),
    },
    'crisis_escalation': {
        'score_floor':       85,
        'level_floor':       'HIGH',
        'score_boost':       35,
        'referral_urgency':  'IMMEDIATE',
        'escalation_reason': (
            'Patient refused hospital referral during hypertensive crisis. '
            'Supervisor has been notified. Document refusal formally.'
        ),
    },
    'chest_pain_monitoring': {
        'score_floor':       55,
        'level_floor':       'HIGH',
        'score_boost':       15,
        'referral_urgency':  'URGENT',
        'escalation_reason': (
            'Chest pain present without respiratory compromise — PHC evaluation '
            'required within 2 hours. Monitor for symptom progression.'
        ),
    },
    'hypertensive_urgency': {
        'score_floor':       40,
        'level_floor':       'MEDIUM',
        'score_boost':       10,
        'referral_urgency':  'WITHIN_24H',
        'escalation_reason': (
            'Elevated BP (≥ 160 mmHg) with associated symptoms — '
            'schedule doctor review within 24 hours.'
        ),
    },
    'adherence_assessment': {
        'score_floor':       30,
        'level_floor':       'MEDIUM',
        'score_boost':        8,
        'referral_urgency':  'WITHIN_7D',
        'escalation_reason': (
            'Prolonged antihypertensive medication non-adherence identified. '
            'Adherence counselling and medication review required.'
        ),
    },
}

# Risk flag floors (from GCPE risk_flags field)
RISK_FLAG_FLOORS = {
    'CRITICAL': (75, 'HIGH'),
    'HIGH':     (55, 'HIGH'),
}

# Referral urgency human-readable labels
REFERRAL_LABELS = {
    'IMMEDIATE':  'Immediate — refer to hospital now',
    'URGENT':     'Urgent — refer to PHC within 2 hours',
    'WITHIN_24H': 'Within 24 hours — schedule doctor review',
    'WITHIN_7D':  'Within 7 days — follow-up appointment',
    'ROUTINE':    'Routine — standard follow-up schedule',
}


# ── Layer 3: Clinical contradiction guards ────────────────────────────────────
# Each guard: (condition_fn, score_floor, level_floor, guard_reason)
# condition_fn receives (features_dict, gcpe_answers_dict)
# Applied AFTER layers 1 and 2; these cannot be overridden.

CLINICAL_GUARDS = [
    (
        lambda f, g: f['chest_pain'] and g.get('breathing_difficulty'),
        80, 'HIGH',
        'Chest pain with breathing difficulty can never be LOW or MEDIUM risk — '
        'possible acute coronary syndrome.'
    ),
    (
        lambda f, g: f['bp_systolic'] >= 180,
        75, 'HIGH',
        'Systolic BP ≥ 180 mmHg is always HIGH risk — hypertensive crisis threshold.'
    ),
    (
        lambda f, g: f['bp_diastolic'] >= 110,
        75, 'HIGH',
        'Diastolic BP ≥ 110 mmHg is always HIGH risk — hypertensive crisis threshold.'
    ),
    (
        lambda f, g: f['chest_pain'] and f['bp_systolic'] >= 140,
        62, 'HIGH',
        'Chest pain with elevated BP requires HIGH risk classification.'
    ),
    (
        lambda f, g: f['chest_pain'],
        52, 'HIGH',
        'Chest pain alone is always HIGH risk — requires immediate clinical evaluation.'
    ),
]


# ── Level utilities ───────────────────────────────────────────────────────────

_LEVEL_ORDER = {'LOW': 0, 'MEDIUM': 1, 'HIGH': 2}

_LEVEL_THRESHOLDS = [
    (51, 'HIGH'),
    (21, 'MEDIUM'),
    (0,  'LOW'),
]


def _score_to_level(score: int) -> str:
    for threshold, level in _LEVEL_THRESHOLDS:
        if score >= threshold:
            return level
    return 'LOW'


def _max_level(a: str, b: str) -> str:
    return a if _LEVEL_ORDER.get(a, 0) >= _LEVEL_ORDER.get(b, 0) else b


def _classify_bp(bp_s: int, bp_d: int) -> str:
    if bp_s >= 180 or bp_d >= 110:
        return 'Hypertensive Crisis (≥ 180/110)'
    if bp_s >= 160 or bp_d >= 100:
        return 'Stage 2 Hypertension (≥ 160/100)'
    if bp_s >= 140 or bp_d >= 90:
        return 'Stage 1 Hypertension (≥ 140/90)'
    if bp_s >= 130 or bp_d >= 80:
        return 'Elevated / Pre-hypertension'
    if bp_s > 0:
        return 'Normal / Controlled'
    return 'Not recorded'


# ── GCPE context extraction ───────────────────────────────────────────────────

def extract_gcpe_context(visit_data: dict) -> dict:
    """
    Extract GCPE pathway information from the visit payload.

    visit_data may contain a `gcpe_data` dict (from the GCPE wizard) with:
      - pathways: list of clinical pathway IDs triggered
      - risk_flags: list of 'CRITICAL' / 'HIGH' flags
      - alerts: list of alert message strings
      - answers: all collected GCPE answers

    Returns a normalised context dict — always safe to access, even if
    gcpe_data is absent (backward-compatible with pre-GCPE visits).
    """
    gcpe_data = visit_data.get('gcpe_data') or {}
    return {
        'pathways':   gcpe_data.get('pathways', []),
        'risk_flags': gcpe_data.get('risk_flags', []),
        'alerts':     gcpe_data.get('alerts', []),
        'answers':    gcpe_data.get('answers', {}),
        'gcpe_driven': bool(gcpe_data),
    }


# ── Main scoring function ─────────────────────────────────────────────────────

def calculate_risk_score(visit_data: dict) -> tuple[int, str]:
    """
    Calculate pathway-aware risk score from a visit payload.

    Compatible with pre-GCPE visits (gcpe_data absent → pure vitals scoring).
    With GCPE data: pathways, risk_flags, and clinical guards all participate.

    Args:
        visit_data: dict from the visit POST body — may contain gcpe_data.

    Returns:
        (score: int, level: str)  — level is 'LOW', 'MEDIUM', or 'HIGH'
    """
    features = preprocess_visit(visit_data)
    ctx      = extract_gcpe_context(visit_data)

    # ── Layer 1: base vitals score ────────────────────────────────────────
    score = 0
    for rule_fn, points in VITALS_RULES:
        try:
            if rule_fn(features):
                score += points
        except Exception:
            pass

    # ── Layer 2a: pathway boosts + collect floors ─────────────────────────
    score_floor = 0
    level_floor = 'LOW'

    for pathway_id in ctx['pathways']:
        rule = PATHWAY_RULES.get(pathway_id)
        if not rule:
            continue
        score       += rule.get('score_boost', 0)
        score_floor  = max(score_floor, rule.get('score_floor', 0))
        level_floor  = _max_level(level_floor, rule.get('level_floor', 'LOW'))

    # ── Layer 2b: risk_flag floors ────────────────────────────────────────
    for flag in ctx['risk_flags']:
        floor_score, floor_level = RISK_FLAG_FLOORS.get(flag, (0, 'LOW'))
        score_floor = max(score_floor, floor_score)
        level_floor = _max_level(level_floor, floor_level)

    # Clamp base + pathway score
    score = min(100, max(0, score))

    # Apply pathway/flag floors
    score = max(score, score_floor)

    # ── Layer 3: clinical contradiction guards ────────────────────────────
    gcpe_answers = ctx['answers']
    for guard_fn, g_score_floor, g_level_floor, _ in CLINICAL_GUARDS:
        try:
            if guard_fn(features, gcpe_answers):
                score       = max(score, g_score_floor)
                level_floor = _max_level(level_floor, g_level_floor)
        except Exception:
            pass

    # Final clamp (guard boosts may push past 100)
    score = min(100, score)

    # Derive level and enforce floor
    level = _max_level(_score_to_level(score), level_floor)

    return score, level


# ── Doctor-facing summary ─────────────────────────────────────────────────────

def get_risk_summary(score: int, level: str, visit_data: dict) -> dict:
    """
    Build a structured, pathway-aware clinical summary for the doctor dashboard.

    Backward-compatible: all new fields are additive; existing fields preserved.
    """
    features = preprocess_visit(visit_data)
    ctx      = extract_gcpe_context(visit_data)
    gcpe_ans = ctx['answers']

    bp_s = features['bp_systolic']
    bp_d = features['bp_diastolic']

    # ── Collect escalation reasons from triggered pathways ─────────────────
    escalation_reasons = []
    referral_urgency   = 'ROUTINE'
    pathways_triggered = ctx['pathways']
    _urgency_order     = ['ROUTINE','WITHIN_7D','WITHIN_24H','URGENT','IMMEDIATE']

    for pid in pathways_triggered:
        rule = PATHWAY_RULES.get(pid)
        if not rule:
            continue
        reason = rule.get('escalation_reason', '')
        if reason and reason not in escalation_reasons:
            escalation_reasons.append(reason)
        urg = rule.get('referral_urgency', 'ROUTINE')
        if _urgency_order.index(urg) > _urgency_order.index(referral_urgency):
            referral_urgency = urg

    # ── Adherence concerns ─────────────────────────────────────────────────
    adherence_concerns = []
    if gcpe_ans.get('medicine_missed') or features['medicine_missed']:
        days   = gcpe_ans.get('medicine_missed_days', '')
        reason = gcpe_ans.get('missed_reason', '')
        concern = 'Antihypertensive medication missed'
        if days:
            concern += f' — {days}'
        if reason:
            concern += f'. Reason: {reason}'
        adherence_concerns.append(concern + '. Counsel on adherence and assess barriers.')

    # ── Clinical contradiction guard explanations ─────────────────────────
    guard_notes = []
    for guard_fn, _, _, guard_reason in CLINICAL_GUARDS:
        try:
            if guard_fn(features, gcpe_ans):
                guard_notes.append(guard_reason)
        except Exception:
            pass

    # ── Classic suggestions (always present for backward compat) ──────────
    suggestions = []
    if level == 'HIGH':
        if 'cardiac_emergency' in pathways_triggered or 'crisis_escalation' in pathways_triggered:
            suggestions.append('⚠ IMMEDIATE REFERRAL — Acute cardiac/hypertensive emergency protocol.')
        elif 'hypertensive_crisis' in pathways_triggered or 'chest_pain_monitoring' in pathways_triggered:
            suggestions.append('⚠ URGENT — Refer to PHC/hospital within 2 hours.')
        elif bp_s >= 180:
            suggestions.append('BP critically elevated — refer to PHC immediately for IV management.')
        elif features['chest_pain']:
            suggestions.append('Chest pain: immediate ECG and doctor evaluation required.')
    if bp_s >= 160:
        suggestions.append(f'BP {bp_s}/{bp_d} mmHg — {_classify_bp(bp_s, bp_d)}. Intensive management needed.')
    elif 140 <= bp_s < 160:
        suggestions.append(f'BP {bp_s}/{bp_d} mmHg — Stage 1 HTN. Review medication and lifestyle.')
    if features['medicine_missed']:
        suggestions.append('Missed antihypertensive medication — counsel on adherence, check supply.')
    if features['dizziness'] and bp_s > 0:
        suggestions.append('Dizziness with elevated BP — check for orthostatic hypotension or cerebral hypoperfusion.')
    if features['pulse'] > 100:
        suggestions.append(f'Tachycardia ({features["pulse"]} bpm) — assess for pain, anxiety, or arrhythmia.')
    if not suggestions:
        suggestions.append('No immediate clinical concerns. Continue routine monthly monitoring.')

    # ── GCPE-specific additional context ──────────────────────────────────
    if ctx['gcpe_driven']:
        chest_sev = gcpe_ans.get('chest_severity')
        if chest_sev:
            suggestions.append(f'Chest pain severity assessed as: {chest_sev}.')
        if gcpe_ans.get('breathing_difficulty'):
            suggestions.append('Breathing difficulty confirmed during assessment — escalate to emergency pathway.')
        if gcpe_ans.get('crisis_symptoms'):
            suggestions.append('Crisis symptoms (headache, vision changes, confusion) reported — immediate specialist review.')
        if gcpe_ans.get('dizziness_with_high_bp'):
            suggestions.append('Dizziness co-occurring with elevated BP — consider hypertensive urgency.')

    # ── Assemble output ────────────────────────────────────────────────────
    return {
        # Existing fields (preserved for backward compat)
        'score':   score,
        'level':   level,
        'color':   {'LOW': 'success', 'MEDIUM': 'warning', 'HIGH': 'danger'}[level],
        'suggestions': suggestions,

        # New pathway-aware fields
        'gcpe_driven':          ctx['gcpe_driven'],
        'pathways_triggered':   pathways_triggered,
        'escalation_reasons':   escalation_reasons,
        'adherence_concerns':   adherence_concerns,
        'guard_notes':          guard_notes,
        'referral_urgency':     referral_urgency,
        'referral_urgency_label': REFERRAL_LABELS.get(referral_urgency, ''),
        'bp_classification':    _classify_bp(bp_s, bp_d),
        'alerts_raised':        ctx['alerts'],
    }
