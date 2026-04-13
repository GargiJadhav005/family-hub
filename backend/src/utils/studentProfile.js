function asRecord(student) {
  if (!student) return {};
  if (typeof student === 'object') {
    if (typeof student.toObject === 'function') {
      return student.toObject();
    }
  }
  return student || {};
}

function buildStudentReportProfile(student) {
  const s = asRecord(student);
  const str = (k) => (typeof s[k] === 'string' ? s[k] : s[k] != null ? String(s[k]) : '');

  const m = s.mailingAddress || {};
  const e = s.emergencyContact || {};

  return {
    name: str('name'),
    roll: str('roll'),
    className: str('className'),
    parentName: str('parentName'),
    studentEmail: str('studentEmail'),
    parentEmail: str('parentEmail'),
    motherName: str('motherName'),
    fatherName: str('fatherName'),
    dateOfBirth: str('dateOfBirth'),
    gender: str('gender'),
    address: str('address'),
    mailingAddress: {
      line1: typeof m.line1 === 'string' ? m.line1 : '',
      line2: typeof m.line2 === 'string' ? m.line2 : '',
      city: typeof m.city === 'string' ? m.city : '',
      state: typeof m.state === 'string' ? m.state : '',
      pincode: typeof m.pincode === 'string' ? m.pincode : '',
    },
    studentPhone: str('studentPhone'),
    parentPhone: str('parentPhone'),
    alternateGuardianName: str('alternateGuardianName'),
    alternateGuardianPhone: str('alternateGuardianPhone'),
    admissionDate: str('admissionDate'),
    bloodGroup: str('bloodGroup'),
    previousSchool: str('previousSchool'),
    notes: str('notes'),
    emergencyContact: {
      name: typeof e.name === 'string' ? e.name : '',
      phone: typeof e.phone === 'string' ? e.phone : '',
      relation: typeof e.relation === 'string' ? e.relation : '',
    },
  };
}

function studentProfileForReportCard(liveStudent, enrollmentSnapshot) {
  let snap = null;
  if (enrollmentSnapshot && typeof enrollmentSnapshot === 'object') {
    snap =
      typeof enrollmentSnapshot.toObject === 'function'
        ? enrollmentSnapshot.toObject()
        : enrollmentSnapshot;
  }
  if (snap && (String(snap.name || '').length > 0 || String(snap.roll || '').length > 0)) {
    return buildStudentReportProfile(snap);
  }
  return buildStudentReportProfile(liveStudent);
}

module.exports = {
  buildStudentReportProfile,
  studentProfileForReportCard,
};
