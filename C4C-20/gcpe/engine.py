"""
Guided Clinical Protocol Engine (GCPE) — v2.

Drives dynamic branching clinical assessment flows from JSON protocol definitions.
Branching logic is entirely data-driven: no disease-specific code lives here.

Condition operators supported in protocol JSON:
  ==   !=   >   >=   <   <=   in
"""
import json
import os

PROTOCOL_DIR = os.path.join(os.path.dirname(__file__), 'protocols')


# ── Protocol loading ──────────────────────────────────────────────────────────

def load_protocol(protocol_id: str) -> dict:
    """Load a protocol JSON by protocol_id (e.g. 'hypertension_protocol')."""
    path = os.path.join(PROTOCOL_DIR, f"{protocol_id}.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Protocol '{protocol_id}' not found at {path}")
    with open(path, 'r') as f:
        return json.load(f)


def get_step(protocol: dict, step_id: str) -> dict | None:
    """Return a specific step from a protocol by step ID."""
    for step in protocol.get('steps', []):
        if step['id'] == step_id:
            return step
    return None


def get_entry_step(protocol: dict) -> dict:
    """Return the entry step of the protocol."""
    entry_id = protocol.get('entry_step')
    if entry_id:
        step = get_step(protocol, entry_id)
        if step:
            return step
    steps = protocol.get('steps', [])
    if not steps:
        raise ValueError("Protocol has no steps")
    return steps[0]


# ── Condition evaluation ──────────────────────────────────────────────────────

def evaluate_conditions(conditions: list, answers: dict) -> str | None:
    """
    Evaluate a conditions array against accumulated answers (left-to-right).
    Returns the next step ID of the first matching condition, or None.

    A condition with no 'field' key is treated as the unconditional default
    and must be placed last in the array.

    Supported operators: ==  !=  >  >=  <  <=  in
    """
    for cond in conditions:
        if 'field' not in cond:
            # Default fallthrough — return whatever next is defined
            return cond.get('next')

        field  = cond['field']
        op     = cond.get('op', '==')
        target = cond['value']
        actual = answers.get(field)

        if actual is None:
            continue

        match = False
        try:
            if op == '==':  match = (actual == target)
            elif op == '!=': match = (actual != target)
            elif op == '>':  match = (float(actual) > float(target))
            elif op == '>=': match = (float(actual) >= float(target))
            elif op == '<':  match = (float(actual) < float(target))
            elif op == '<=': match = (float(actual) <= float(target))
            elif op == 'in': match = (actual in target)
        except (TypeError, ValueError):
            continue

        if match:
            return cond.get('next')

    return None


# ── Step navigation ───────────────────────────────────────────────────────────

def advance_step(protocol: dict, current_step_id: str,
                 answer, answers: dict) -> dict | None:
    """
    Given the current step ID and the answer provided, return the next step dict.
    `answers` must include ALL previously recorded answers PLUS the current one
    so that conditions referencing earlier fields resolve correctly.

    Resolution order:
      1. `conditions` array  (numeric / cross-field branching)
      2. `yes_next` / `no_next` for boolean steps
      3. `next` field

    Returns None when the protocol is complete.
    """
    step = get_step(protocol, current_step_id)
    if not step:
        return None

    next_id = None

    # 1. Conditions take priority — evaluated against the full answers dict
    if step.get('conditions'):
        next_id = evaluate_conditions(step['conditions'], answers)

    # 2. Boolean yes/no fallback
    if next_id is None and step['type'] == 'boolean':
        next_id = step['yes_next'] if answer else step['no_next']

    # 3. Simple next pointer
    if next_id is None:
        next_id = step.get('next')

    if not next_id or next_id == 'complete':
        return None

    return get_step(protocol, next_id)


def validate_answer(step: dict, answer) -> tuple[bool, str]:
    """Validate that an answer satisfies the step's constraints."""
    if step.get('optional') and (answer is None or answer == ''):
        return True, 'ok'

    if answer is None or answer == '':
        return False, f"Answer is required for '{step['field']}'"

    if step['type'] == 'number':
        try:
            val = float(answer)
        except (TypeError, ValueError):
            return False, f"Expected a number for '{step['field']}'"
        r = step.get('range', {})
        if 'min' in r and val < r['min']:
            return False, f"Value {val} is below minimum {r['min']}"
        if 'max' in r and val > r['max']:
            return False, f"Value {val} exceeds maximum {r['max']}"

    if step['type'] == 'boolean':
        if not isinstance(answer, bool):
            if str(answer).lower() not in ('true', 'false', '1', '0', 'yes', 'no'):
                return False, f"Expected yes/no for '{step['field']}'"

    if step['type'] == 'choice':
        if answer not in step.get('options', []):
            return False, f"'{answer}' is not a valid option for '{step['field']}'"

    return True, 'ok'


# ── Session helpers ───────────────────────────────────────────────────────────

def build_session(protocol: dict) -> dict:
    """Create a fresh GCPE session state dict."""
    entry = get_entry_step(protocol)
    return {
        'protocol_id':    protocol['protocol_id'],
        'current_step_id': entry['id'],
        'answers':        {},
        'branch_path':    [],     # ordered list of step IDs visited
        'pathways':       [],     # clinical pathways triggered
        'risk_flags':     [],     # CRITICAL / HIGH flags raised
        'alerts':         [],     # alert messages shown to ASHA worker
        'completed':      False,
    }


def record_answer(session: dict, protocol: dict, answer) -> dict:
    """
    Record an answer to the current step, advance the session to the next step,
    and return the updated session.

    Mutates and returns `session`.
    """
    step_id = session['current_step_id']
    step    = get_step(protocol, step_id)
    if not step:
        return session

    # Store the answer
    field = step.get('field')
    if field:
        session['answers'][field] = answer

    # Track traversal
    session['branch_path'].append(step_id)
    if step.get('pathway') and step['pathway'] not in session['pathways']:
        session['pathways'].append(step['pathway'])
    if step.get('risk_flag') and step['risk_flag'] not in session['risk_flags']:
        session['risk_flags'].append(step['risk_flag'])
    if step.get('alert'):
        session['alerts'].append(step['alert'])

    # Advance
    next_step = advance_step(protocol, step_id, answer, session['answers'])
    if next_step is None:
        session['completed'] = True
        session['current_step_id'] = 'complete'
    else:
        session['current_step_id'] = next_step['id']

    return session


# ── Clinical summary ──────────────────────────────────────────────────────────

def build_summary(protocol: dict, session: dict) -> dict:
    """
    Build a structured doctor-ready assessment summary from the session.

    Returns a dict with both a machine-readable `fields` section and a
    human-readable `narrative` string.
    """
    answers   = session.get('answers', {})
    pathways  = session.get('pathways', [])
    risk_flags = session.get('risk_flags', [])
    alerts    = session.get('alerts', [])

    bp_s = answers.get('bp_systolic')
    bp_d = answers.get('bp_diastolic')

    # ── BP classification ────────────────────────────────────────────
    bp_class = 'Not recorded'
    if bp_s is not None:
        bp_s = int(bp_s)
        bp_d = int(bp_d) if bp_d is not None else 0
        if bp_s >= 180 or bp_d >= 110:
            bp_class = 'Hypertensive Crisis (Stage 3)'
        elif bp_s >= 160 or bp_d >= 100:
            bp_class = 'Stage 2 Hypertension'
        elif bp_s >= 140 or bp_d >= 90:
            bp_class = 'Stage 1 Hypertension'
        elif bp_s >= 130 or bp_d >= 80:
            bp_class = 'Elevated BP (Pre-hypertension)'
        else:
            bp_class = 'Normal / Controlled'

    # ── Narrative lines ──────────────────────────────────────────────
    lines = [f"=== {protocol['name']} — Clinical Assessment Summary ==="]

    bp_str = f"{bp_s}/{bp_d} mmHg" if bp_s is not None else "Not recorded"
    lines.append(f"Blood Pressure  : {bp_str}  [{bp_class}]")
    lines.append(f"Pulse           : {answers.get('pulse', 'Not recorded')} bpm")
    if answers.get('temperature'):
        lines.append(f"Temperature     : {answers['temperature']} °C")

    lines.append("")
    lines.append("Symptoms:")
    lines.append(f"  Dizziness          : {'Yes' if answers.get('dizziness') else 'No'}")
    lines.append(f"  Chest Pain         : {'Yes' if answers.get('chest_pain') else 'No'}")
    if answers.get('chest_pain'):
        lines.append(f"  Chest Severity     : {answers.get('chest_severity', '—')}")
    if answers.get('breathing_difficulty') is not None:
        lines.append(f"  Breathing Difficulty: {'Yes' if answers.get('breathing_difficulty') else 'No'}")
    if answers.get('crisis_symptoms') is not None:
        lines.append(f"  Crisis Symptoms    : {'Yes' if answers.get('crisis_symptoms') else 'No'}")

    lines.append("")
    lines.append("Medication Adherence:")
    lines.append(f"  Missed Medication  : {'Yes' if answers.get('medicine_missed') else 'No'}")
    if answers.get('medicine_missed_days'):
        lines.append(f"  Days Missed        : {answers['medicine_missed_days']}")
    if answers.get('missed_reason'):
        lines.append(f"  Reason             : {answers['missed_reason']}")

    if pathways:
        lines.append("")
        lines.append(f"Clinical Pathways  : {', '.join(pathways)}")

    if risk_flags:
        lines.append(f"Risk Flags Raised  : {', '.join(risk_flags)}")

    if alerts:
        lines.append("")
        lines.append("Clinical Alerts:")
        for a in alerts:
            lines.append(f"  ⚠ {a}")

    if answers.get('notes'):
        lines.append("")
        lines.append(f"ASHA Notes: {answers['notes']}")

    lines.append("")
    steps_total  = len(protocol.get('steps', []))
    steps_visited = len(session.get('branch_path', []))
    lines.append(f"Steps completed: {steps_visited} of {steps_total} (branched path)")

    return {
        'bp_classification': bp_class,
        'pathways':          pathways,
        'risk_flags':        risk_flags,
        'alerts':            alerts,
        'narrative':         '\n'.join(lines),
        'fields': {
            'bp_systolic':         answers.get('bp_systolic'),
            'bp_diastolic':        answers.get('bp_diastolic'),
            'pulse':               answers.get('pulse'),
            'temperature':         answers.get('temperature'),
            'dizziness':           answers.get('dizziness', False),
            'chest_pain':          answers.get('chest_pain', False),
            'medicine_missed':     answers.get('medicine_missed', False),
            'notes':               answers.get('notes', ''),
        },
    }
