function addr(m) {
  if (!m || typeof m !== 'object') {
    return { line1: '', line2: '', city: '', state: '', pincode: '' };
  }
  return {
    line1: m.line1 || '',
    line2: m.line2 || '',
    city: m.city || '',
    state: m.state || '',
    pincode: m.pincode || '',
  };
}

function emerg(e) {
  if (!e || typeof e !== 'object') {
    return { name: '', phone: '', relation: '' };
  }
  return {
    name: e.name || '',
    phone: e.phone || '',
    relation: e.relation || '',
  };
}

function enrollmentSnapshotFromStudent(student) {
  const mailing = addr(student.mailingAddress);
  const ec = emerg(student.emergencyContact);
  return {
    name: String(student.name || ''),
    roll: String(student.roll || ''),
    className: String(student.className || ''),
    parentName: String(student.parentName || ''),
    studentEmail: String(student.studentEmail || ''),
    parentEmail: String(student.parentEmail || ''),
    dateOfBirth: String(student.dateOfBirth || ''),
    gender: String(student.gender || ''),
    address: String(student.address || ''),
    studentPhone: String(student.studentPhone || ''),
    parentPhone: String(student.parentPhone || ''),
    motherName: String(student.motherName || ''),
    fatherName: String(student.fatherName || ''),
    admissionDate: String(student.admissionDate || ''),
    bloodGroup: String(student.bloodGroup || ''),
    previousSchool: String(student.previousSchool || ''),
    alternateGuardianName: String(student.alternateGuardianName || ''),
    alternateGuardianPhone: String(student.alternateGuardianPhone || ''),
    notes: String(student.notes || ''),
    mailingAddress: { ...mailing },
    emergencyContact: { ...ec },
  };
}

function snapshotToClient(snap) {
  if (!snap) return null;
  const o = typeof snap.toObject === 'function' ? snap.toObject() : snap;
  return {
    ...enrollmentSnapshotFromStudent(o),
  };
}

function mergeEnrollmentForReport(liveStudent, snapshot) {
  const fromSnap = snapshotToClient(snapshot);
  if (fromSnap) return fromSnap;
  return enrollmentSnapshotFromStudent(liveStudent);
}

module.exports = {
  enrollmentSnapshotFromStudent,
  snapshotToClient,
  mergeEnrollmentForReport,
};
