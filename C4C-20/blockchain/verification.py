"""
Chain verification: validates every block's hash, linkage, PoW, and ECDSA signature.
Detects tampering by checking:
  1. Each block's current_hash matches its computed hash.
  2. Each block's previous_hash equals the preceding block's current_hash.
  3. Each hash satisfies proof-of-work (starts with TARGET_PREFIX).
  4. Each block's ECDSA signature (where present) verifies against the persisted public key.
"""
import os
from blockchain.mining import validate_hash, TARGET_PREFIX
from blockchain.hashing import hash_block
from blockchain.block import verify_signature, PUBLIC_KEY_PATH


def _load_public_pem() -> str | None:
    """Load the persisted ECDSA public key for signature verification."""
    try:
        with open(PUBLIC_KEY_PATH, 'r') as f:
            return f.read()
    except Exception:
        return None


def verify_chain(blocks: list) -> dict:
    """
    Verify an entire chain of block dicts (as returned by the DB).

    Returns:
        {
            'valid': bool,
            'errors': list[str],
            'block_results': list[{index, valid, error}]
        }
    """
    errors = []
    block_results = []

    if not blocks:
        return {'valid': True, 'errors': [], 'block_results': []}

    for i, block in enumerate(blocks):
        block_valid = True
        block_error = None

        # 1. Verify current_hash matches computed hash
        computed = hash_block(
            block['block_index'], block['timestamp'], block['visit_hash'],
            block['previous_hash'], block['nonce'], block.get('data') or {}
        )
        if computed != block['current_hash']:
            block_valid = False
            block_error = f"Block {block['block_index']}: hash mismatch (tampered?)"
            errors.append(block_error)

        # 2. Verify proof-of-work (skip genesis nonce=0 check for prefix)
        elif block['block_index'] > 0 and not computed.startswith(TARGET_PREFIX):
            block_valid = False
            block_error = f"Block {block['block_index']}: hash does not satisfy PoW"
            errors.append(block_error)

        # 3. Verify chain linkage (previous_hash == preceding block's current_hash)
        if i > 0:
            prev_block = blocks[i - 1]
            if block['previous_hash'] != prev_block['current_hash']:
                block_valid = False
                block_error = f"Block {block['block_index']}: chain broken — previous_hash mismatch"
                errors.append(block_error)

        # 4. Verify ECDSA signature (skip genesis block which has no signature)
        #    FIX: previously signatures were stored but never verified — a tampered
        #    signature would have passed chain validation silently.
        if block.get('signature') and block['block_index'] > 0:
            public_pem = _load_public_pem()
            if public_pem is None:
                pass  # Key file absent (e.g. fresh environment) — skip sig check
            elif not verify_signature(public_pem, block['current_hash'], block['signature']):
                block_valid = False
                block_error = f"Block {block['block_index']}: ECDSA signature invalid — data integrity compromised"
                errors.append(block_error)

        block_results.append({
            'index': block['block_index'],
            'valid': block_valid,
            'error': block_error,
        })

    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'block_results': block_results,
    }
