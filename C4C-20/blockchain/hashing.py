"""SHA-256 hashing utilities for AarogyaNet blockchain."""
import hashlib
import json

def sha256(data: str) -> str:
    """Compute SHA-256 hash of a string."""
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def hash_block(index: int, timestamp: float, visit_hash: str,
               previous_hash: str, nonce: int, data: dict) -> str:
    """
    Compute the SHA-256 hash of a block's canonical representation.
    All fields are concatenated deterministically before hashing.
    """
    block_string = json.dumps({
        'index': index,
        'timestamp': timestamp,
        'visit_hash': visit_hash,
        'previous_hash': previous_hash,
        'nonce': nonce,
        'data': data,
    }, sort_keys=True, default=str)
    return sha256(block_string)
