"""
Blockchain routes — chain explorer, block lookup, chain verification.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
import psycopg2.extras
from database.postgres import get_db_connection
from blockchain.blockchain import get_full_chain, verify_full_chain, get_latest_block
from utils.helpers import serialize_row, rows_to_list

blockchain_bp = Blueprint('blockchain', __name__, url_prefix='/api/blockchain')


@blockchain_bp.route('/chain', methods=['GET'])
@jwt_required()
def get_chain():
    """Return all blocks in the chain, newest first."""
    chain = get_full_chain()
    # Convert datetimes
    result = [serialize_row(b) for b in chain]
    return jsonify({'chain': result, 'length': len(result)})


@blockchain_bp.route('/block/<int:index>', methods=['GET'])
@jwt_required()
def get_block(index):
    """Look up a single block by its index."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM blockchain WHERE block_index = %s", (index,))
    block = cur.fetchone()
    cur.close()
    conn.close()
    if not block:
        return jsonify({'error': f'Block {index} not found'}), 404
    return jsonify(serialize_row(block))


@blockchain_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_chain():
    """Run full chain verification and return integrity report."""
    result = verify_full_chain()
    return jsonify(result)


@blockchain_bp.route('/latest', methods=['GET'])
@jwt_required()
def latest_block():
    """Return the most recent block."""
    block = get_latest_block()
    if not block:
        return jsonify({'message': 'Chain is empty'}), 200
    return jsonify(serialize_row(block))


@blockchain_bp.route('/stats', methods=['GET'])
@jwt_required()
def chain_stats():
    """Return summary stats about the chain."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT
            COUNT(*) as total_blocks,
            MAX(block_index) as latest_index,
            SUM(CASE WHEN is_valid THEN 1 ELSE 0 END) as valid_blocks,
            MIN(timestamp) as genesis_time,
            MAX(timestamp) as latest_time
        FROM blockchain
    """)
    stats = dict(cur.fetchone())
    cur.close()
    conn.close()
    return jsonify(stats)
