"""
Proof-of-Work mining for AarogyaNet blockchain.
Difficulty = 4 means the hash must begin with '0000'.
"""
from blockchain.hashing import hash_block
from config import Config

DIFFICULTY = Config.BLOCKCHAIN_DIFFICULTY
TARGET_PREFIX = '0' * DIFFICULTY


def mine_block(index: int, timestamp: float, visit_hash: str,
               previous_hash: str, data: dict) -> tuple[int, str]:
    """
    Run proof-of-work: increment nonce until hash starts with TARGET_PREFIX.

    Returns:
        (nonce, valid_hash)
    """
    nonce = 0
    while True:
        candidate_hash = hash_block(index, timestamp, visit_hash,
                                     previous_hash, nonce, data)
        if candidate_hash.startswith(TARGET_PREFIX):
            return nonce, candidate_hash
        nonce += 1


def validate_hash(index: int, timestamp: float, visit_hash: str,
                  previous_hash: str, nonce: int, data: dict,
                  stored_hash: str) -> bool:
    """
    Recompute the block hash and confirm it matches the stored hash
    AND satisfies the proof-of-work requirement.
    """
    computed = hash_block(index, timestamp, visit_hash, previous_hash, nonce, data)
    return computed == stored_hash and computed.startswith(TARGET_PREFIX)
