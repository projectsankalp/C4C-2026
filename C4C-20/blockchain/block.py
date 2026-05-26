"""Block data class for the AarogyaNet custom blockchain."""
import os
import time
import json
from blockchain.hashing import hash_block
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature
import base64

KEYS_DIR         = 'keys'
PRIVATE_KEY_PATH = os.path.join(KEYS_DIR, 'ecdsa_private.pem')
PUBLIC_KEY_PATH  = os.path.join(KEYS_DIR, 'ecdsa_public.pem')

class Block:
    """
    Represents a single block in the AarogyaNet blockchain.

    Fields:
        index        — sequential position in the chain
        timestamp    — Unix time when the block was mined
        visit_hash   — SHA-256 hash of the ASHA visit data (proof of visit)
        previous_hash— hash of the preceding block (chain integrity)
        nonce        — proof-of-work nonce found during mining
        current_hash — SHA-256 hash of the block itself (after mining)
        signature    — ECDSA base64 signature over current_hash (optional)
        data         — raw visit payload stored in the block
    """

    def __init__(self, index: int, visit_hash: str, previous_hash: str, data: dict,
                 timestamp: float = None, nonce: int = 0, current_hash: str = None,
                 signature: str = None):
        self.index = index
        self.timestamp = timestamp or time.time()
        self.visit_hash = visit_hash
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.data = data
        self.signature = signature
        # Compute hash if not provided (e.g. when loading from DB)
        self.current_hash = current_hash or self._compute_hash()

    def _compute_hash(self) -> str:
        return hash_block(
            self.index, self.timestamp, self.visit_hash,
            self.previous_hash, self.nonce, self.data
        )

    def to_dict(self) -> dict:
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'visit_hash': self.visit_hash,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce,
            'current_hash': self.current_hash,
            'signature': self.signature,
            'data': self.data,
        }

    @classmethod
    def from_dict(cls, d: dict) -> 'Block':
        return cls(
            index=d['index'],
            visit_hash=d['visit_hash'],
            previous_hash=d['previous_hash'],
            data=d.get('data', {}),
            timestamp=d['timestamp'],
            nonce=d['nonce'],
            current_hash=d['current_hash'],
            signature=d.get('signature'),
        )


def generate_ecdsa_keypair() -> tuple[str, str]:
    """Generate a new ECDSA (SECP256K1) key pair. Returns (private_pem, public_pem)."""
    private_key = ec.generate_private_key(ec.SECP256K1())
    public_key  = private_key.public_key()

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode()

    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode()

    return private_pem, public_pem


def load_or_create_keypair() -> tuple[str, str]:
    """
    Load the ECDSA keypair from disk (keys/ecdsa_private.pem + keys/ecdsa_public.pem).
    If the files don't exist or are corrupt, generate a fresh pair and persist it.

    FIX: Replaces the former generate_ecdsa_keypair() call at module level in
    blockchain.py, which created a new transient keypair on every process restart,
    making all previously-stored block signatures permanently unverifiable.
    """
    os.makedirs(KEYS_DIR, exist_ok=True)

    if os.path.exists(PRIVATE_KEY_PATH) and os.path.exists(PUBLIC_KEY_PATH):
        try:
            with open(PRIVATE_KEY_PATH, 'r') as f:
                private_pem = f.read()
            with open(PUBLIC_KEY_PATH, 'r') as f:
                public_pem = f.read()
            serialization.load_pem_private_key(private_pem.encode(), password=None)
            serialization.load_pem_public_key(public_pem.encode())
            return private_pem, public_pem
        except Exception:
            pass

    private_pem, public_pem = generate_ecdsa_keypair()
    with open(PRIVATE_KEY_PATH, 'w') as f:
        f.write(private_pem)
    with open(PUBLIC_KEY_PATH, 'w') as f:
        f.write(public_pem)
    print('[AarogyaNet] ECDSA keypair generated and persisted to keys/')
    return private_pem, public_pem


def sign_hash(private_pem: str, data_hash: str) -> str:
    """Sign a hash string with an ECDSA private key. Returns base64 signature."""
    private_key = serialization.load_pem_private_key(private_pem.encode(), password=None)
    signature = private_key.sign(data_hash.encode(), ec.ECDSA(hashes.SHA256()))
    return base64.b64encode(signature).decode()


def verify_signature(public_pem: str, data_hash: str, signature_b64: str) -> bool:
    """Verify an ECDSA signature. Returns True if valid."""
    try:
        public_key = serialization.load_pem_public_key(public_pem.encode())
        signature = base64.b64decode(signature_b64)
        public_key.verify(signature, data_hash.encode(), ec.ECDSA(hashes.SHA256()))
        return True
    except (InvalidSignature, Exception):
        return False
