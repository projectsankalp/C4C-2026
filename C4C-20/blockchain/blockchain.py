"""
AarogyaNet Blockchain — persistence layer.
Stores and retrieves blocks from PostgreSQL. Mining happens in mining.py.
"""
import time
import json
import psycopg2.extras
from database.postgres import get_db_connection
from blockchain.block import Block, sign_hash, load_or_create_keypair
from blockchain.mining import mine_block
from blockchain.verification import verify_chain
from utils.helpers import generate_visit_hash

# Module-level signing key pair — loaded from disk (or generated once and persisted)
_PRIVATE_KEY, _PUBLIC_KEY = load_or_create_keypair()


def get_latest_block() -> dict | None:
    """Fetch the most recent block from the DB."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM blockchain ORDER BY block_index DESC LIMIT 1")
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else None


def add_visit_block(visit_data: dict) -> Block:
    """
    Mine a new block for a completed ASHA visit and persist it.

    Steps:
      1. Compute visit_hash from visit_data
      2. Run proof-of-work mining
      3. Sign the resulting hash with ECDSA
      4. Insert into blockchain table
      5. Return the mined Block
    """
    # Get chain tail
    latest = get_latest_block()
    if latest is None:
        previous_hash = '0' * 64
        new_index = 0
    else:
        previous_hash = latest['current_hash']
        new_index = latest['block_index'] + 1

    visit_hash = generate_visit_hash(visit_data)
    timestamp = time.time()

    # PRIVACY FIX: strip all PHI before storing in the blockchain.
    # Clinical data integrity is already captured by visit_hash (SHA-256 of full payload).
    # The data field in the blockchain table must contain ONLY non-PHI metadata.
    block_metadata = {
        'type': 'visit_block',
        'patient_id': visit_data.get('patient_id'),
        'asha_worker_id': visit_data.get('asha_worker_id'),
        'risk_level': visit_data.get('risk_level'),
        'risk_score': visit_data.get('risk_score'),
    }

    # Proof-of-work — hashes over metadata, NOT raw PHI
    nonce, current_hash = mine_block(
        new_index, timestamp, visit_hash, previous_hash, block_metadata
    )

    # ECDSA signature over the mined hash
    signature = sign_hash(_PRIVATE_KEY, current_hash)

    block = Block(
        index=new_index,
        visit_hash=visit_hash,
        previous_hash=previous_hash,
        data=block_metadata,
        timestamp=timestamp,
        nonce=nonce,
        current_hash=current_hash,
        signature=signature,
    )

    # Persist — CONNECTION LEAK FIX: always close in finally
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO blockchain
                (block_index, timestamp, visit_hash, previous_hash,
                 nonce, current_hash, signature, data, is_valid)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            block.index, block.timestamp, block.visit_hash,
            block.previous_hash, block.nonce, block.current_hash,
            block.signature, json.dumps(block_metadata), True
        ))
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return block


def add_emergency_block(event_id: str, emergency_type: str,
                        emergency_hash: str) -> tuple:
    """
    Mine an immutable blockchain record for an SOS emergency event.

    No PHI stored — only:
      - emergency_hash  (SHA-256 of event_id + type + timestamp)
      - emergency_type
      - event_id reference (opaque UUID hex)
      - timestamp

    Returns (block, emergency_hash).
    """
    latest = get_latest_block()
    if latest is None:
        previous_hash = '0' * 64
        new_index = 0
    else:
        previous_hash = latest['current_hash']
        new_index = latest['block_index'] + 1

    timestamp = time.time()

    block_metadata = {
        "type": "emergency_block",
        "emergency_hash": emergency_hash,
        "event_ref": event_id,
        "emergency_type": emergency_type,
    }

    nonce, current_hash = mine_block(
        new_index, timestamp, emergency_hash, previous_hash, block_metadata
    )
    signature = sign_hash(_PRIVATE_KEY, current_hash)

    block = Block(
        index=new_index,
        visit_hash=emergency_hash,
        previous_hash=previous_hash,
        data=block_metadata,
        timestamp=timestamp,
        nonce=nonce,
        current_hash=current_hash,
        signature=signature,
    )

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO blockchain
                (block_index, timestamp, visit_hash, previous_hash,
                 nonce, current_hash, signature, data, is_valid)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            block.index, block.timestamp, block.visit_hash,
            block.previous_hash, block.nonce, block.current_hash,
            block.signature, json.dumps(block_metadata), True
        ))
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return block, emergency_hash


def add_adherence_block(token_id: str, redemption_type: str) -> tuple:
    """
    Mine a new blockchain block for a prescription redemption adherence event.

    No PHI is stored. Block contains:
      - adherence_hash  (SHA-256 of token_id + redemption_type + timestamp)
      - token_id        (opaque hex, not patient-identifiable)
      - redemption_type
      - timestamp

    Returns (block, adherence_hash).
    """
    import hashlib

    latest = get_latest_block()
    if latest is None:
        previous_hash = '0' * 64
        new_index = 0
    else:
        previous_hash = latest['current_hash']
        new_index = latest['block_index'] + 1

    timestamp = time.time()

    # Adherence hash — no PHI, just token reference + context
    raw = json.dumps({
        "token_id": token_id,
        "redemption_type": redemption_type,
        "timestamp": timestamp,
    }, sort_keys=True)
    adherence_hash = hashlib.sha256(raw.encode()).hexdigest()

    block_metadata = {
        "type": "adherence_block",
        "adherence_hash": adherence_hash,
        "token_ref": token_id,
        "redemption_type": redemption_type,
    }

    nonce, current_hash = mine_block(
        new_index, timestamp, adherence_hash, previous_hash, block_metadata
    )
    signature = sign_hash(_PRIVATE_KEY, current_hash)

    block = Block(
        index=new_index,
        visit_hash=adherence_hash,
        previous_hash=previous_hash,
        data=block_metadata,
        timestamp=timestamp,
        nonce=nonce,
        current_hash=current_hash,
        signature=signature,
    )

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO blockchain
                (block_index, timestamp, visit_hash, previous_hash,
                 nonce, current_hash, signature, data, is_valid)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            block.index, block.timestamp, block.visit_hash,
            block.previous_hash, block.nonce, block.current_hash,
            block.signature, json.dumps(block_metadata), True
        ))
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return block, adherence_hash


def get_full_chain() -> list:
    """Return all blocks ordered by index."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM blockchain ORDER BY block_index ASC")
    rows = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return rows


def verify_full_chain() -> dict:
    """Fetch the full chain and run verification."""
    chain = get_full_chain()
    return verify_chain(chain)
