export function normalizeScreening(item = {}) {
  if (!item) return null;
  const patient = item.patient || {};

  const bp =
    item.bp ||
    item.bloodPressure ||
    item.vitals?.bp ||
    (item.bpSystolic && item.bpDiastolic
      ? `${item.bpSystolic}/${item.bpDiastolic}`
      : "—");

  return {
    ...item,
    id: item.id || item.screeningId,
    patientId: item.patientId || patient.id || "",
    name: item.name || item.patientName || patient.name || "Unknown Patient",
    age: item.age || patient.age || "—",
    gender: item.gender || patient.gender || "—",
    village: item.village || patient.village || "Unassigned",
    houseNumber: item.houseNumber || patient.houseNumber || "—",
    phone: item.phone || patient.phone || "",
    bp,
    sugar:
      item.sugar ||
      item.rbs ||
      item.randomBloodSugar ||
      item.vitals?.sugar ||
      "—",
    riskLevel: item.riskLevel || item.risk || "GREEN",
    status: item.status || "NEW",
    ashaName:
      item.ashaName ||
      item.asha?.name ||
      item.ashaWorker?.name ||
      "Unassigned ASHA",
    phcName:
      item.phcName ||
      item.phc?.name ||
      "Unassigned PHC",
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || "",
    doctorNotes: item.doctorNotes || "",
    diagnosis: item.diagnosis || "",
    prescription: item.prescription || "",
    resolvedAt: item.resolvedAt || null,
    resolvedBy: item.resolvedBy || item.resolvedByName || null,
  };
}

export function normalizeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    username: u.username || u.loginId || u.email,
    loginId: u.loginId || u.username || u.email,
    email: u.email,
    role: u.role,
    status: u.status,
    phcId: u.phcId,
    phcName: u.phcName || u.phc?.name || null,
    village: u.village,
    lastActive: u.lastActive || u.updatedAt,
  };
}

export function normalizePhc(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    district: p.district,
    status: p.status || p.active ? 'ACTIVE' : 'INACTIVE',
    doctorsCount: p.doctorsCount || 0,
    ashaCount: p.ashaCount || 0,
    villagesCovered: p.villagesCovered || 0,
  };
}

export function normalizeNotification(n) {
  if (!n) return null;
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    severity: n.severity || 'INFO',
    targetType: n.targetType || null,
    targetId: n.targetId || null,
    action: n.action || null,
    read: n.read || false,
    createdAt: n.createdAt || n.timestamp,
  };
}
