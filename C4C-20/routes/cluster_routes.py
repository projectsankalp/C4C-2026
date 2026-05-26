"""
Disease Cluster Intelligence routes.

GET  /api/clusters              — active clusters (detect on demand)
GET  /api/clusters/summary      — district surveillance summary
GET  /api/clusters/heatmap      — cluster overlay data for Leaflet
POST /api/clusters/recalculate  — force re-detection after offline sync
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt

from services.cluster_engine import detect_clusters, get_surveillance_summary

cluster_bp = Blueprint('clusters', __name__, url_prefix='/api/clusters')


@cluster_bp.route('', methods=['GET'])
@jwt_required()
def list_clusters():
    """
    Return active disease clusters.
    Query params:
      lookback_days — integer, default 30
      type          — filter by cluster_type
      severity      — filter by severity (CRITICAL, HIGH, MEDIUM)
    """
    lookback = int(request.args.get('lookback_days', 30))
    lookback = max(7, min(lookback, 180))  # clamp 7–180 days

    clusters = detect_clusters(lookback)

    ctype = request.args.get('type')
    if ctype:
        clusters = [c for c in clusters if c['cluster_type'] == ctype]

    severity = request.args.get('severity', '').upper()
    if severity:
        clusters = [c for c in clusters if c['severity'] == severity]

    return jsonify({
        'clusters':      clusters,
        'total':         len(clusters),
        'lookback_days': lookback,
    })


@cluster_bp.route('/summary', methods=['GET'])
@jwt_required()
def surveillance_summary():
    """
    District-level surveillance summary for the Health Officer view.
    Requires doctor or admin role.
    """
    claims = get_jwt()
    if claims.get('role') not in ('doctor', 'admin'):
        return jsonify({'error': 'Doctor or admin access required'}), 403

    lookback = int(request.args.get('lookback_days', 30))
    lookback = max(7, min(lookback, 180))

    summary = get_surveillance_summary(lookback)
    return jsonify(summary)


@cluster_bp.route('/heatmap', methods=['GET'])
@jwt_required()
def cluster_heatmap():
    """
    Cluster overlay data for Leaflet heatmap integration.
    Returns clusters with centroid, radius, severity, color.
    """
    lookback = int(request.args.get('lookback_days', 30))
    lookback = max(7, min(lookback, 180))

    clusters = detect_clusters(lookback)
    return jsonify({'clusters': clusters, 'lookback_days': lookback})


@cluster_bp.route('/recalculate', methods=['POST'])
@jwt_required()
def recalculate():
    """
    Force cluster re-detection — typically called after an offline sync
    pushes delayed visit records into PostgreSQL.
    Visits are always loaded ordered oldest→newest so temporal ordering
    is preserved correctly regardless of sync delay.
    """
    claims = get_jwt()
    if claims.get('role') not in ('asha', 'doctor', 'admin'):
        return jsonify({'error': 'Insufficient permissions'}), 403

    body = request.get_json(force=True) or {}
    lookback = int(body.get('lookback_days', 30))
    lookback = max(7, min(lookback, 180))

    clusters = detect_clusters(lookback)
    return jsonify({
        'message':       'Cluster detection recalculated',
        'total_clusters': len(clusters),
        'lookback_days': lookback,
    })
