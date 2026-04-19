function normAddr(v) {
  if (v && typeof v === 'object') {
    return {
      line1: v.line1 || '',
      line2: v.line2 || '',
      city: v.city || '',
      state: v.state || '',
      pincode: v.pincode || '',
    };
  }
  return { line1: '', line2: '', city: '', state: '', pincode: '' };
}

function normEmerg(v) {
  if (v && typeof v === 'object') {
    return {
      name: v.name || '',
      phone: v.phone || '',
      relation: v.relation || '',
    };
  }
  return { name: '', phone: '', relation: '' };
}

const STUDENT_UPDATABLE_FIELDS = [
  'name',
  'roll',
  'idNumber',
  'regNumber',
  'className',
  'parentName',
  'motherName',
  'fatherName',
  'dateOfBirth',
  'gender',
  'address',
  'parentPhone',
  'studentPhone',
  'alternateGuardianName',
  'alternateGuardianPhone',
  'admissionDate',
  'bloodGroup',
  'previousSchool',
  'notes',
  'motherTongue',
  'medium',
  'udiseNumber',
  'mailingAddress',
  'emergencyContact',
];

function studentProfileForReport(s) {
  return {
    name: s.name ?? '',
    roll: s.roll ?? '',
    className: s.className ?? '',
    parentName: s.parentName ?? '',
    motherName: s.motherName ?? '',
    fatherName: s.fatherName ?? '',
    dateOfBirth: s.dateOfBirth ?? '',
    gender: s.gender ?? '',
    address: s.address ?? '',
    studentPhone: s.studentPhone ?? '',
    parentPhone: s.parentPhone ?? '',
    mailingAddress: normAddr(s.mailingAddress),
    admissionDate: s.admissionDate ?? '',
    bloodGroup: s.bloodGroup ?? '',
    previousSchool: s.previousSchool ?? '',
    alternateGuardianName: s.alternateGuardianName ?? '',
    alternateGuardianPhone: s.alternateGuardianPhone ?? '',
    notes: s.notes ?? '',
    emergencyContact: normEmerg(s.emergencyContact),
  };
}

function serializeStudentForViewer(s, role, viewerUserId) {
  const id = s._id?.toString?.();
  const studentUserId = s.studentUserId?.toString?.();
  const parentUserId = s.parentUserId?.toString?.();
  const viewerId = viewerUserId != null ? String(viewerUserId) : '';
  const isSelfStudent = role === 'student' && viewerId && studentUserId === viewerId;
  const isParentOf = role === 'parent' && viewerId && parentUserId === viewerId;
  const isStaff = role === 'teacher' || role === 'admin';

  const showEmail = isStaff;
  const showContact = isStaff || isParentOf || isSelfStudent;

  const base = {
    id,
    name: s.name,
    roll: s.roll,
    class: s.className,
    parentName: s.parentName,
    motherName: s.motherName ?? '',
    fatherName: s.fatherName ?? '',
    studentUserId,
    parentUserId,
    createdAt: s.createdAt,
  };

  if (showContact) {
    Object.assign(base, studentProfileForReport(s));
  }

  if (showEmail) {
    base.studentEmail = s.studentEmail;
    base.parentEmail = s.parentEmail;
  }

  return base;
}

module.exports = {
  STUDENT_UPDATABLE_FIELDS,
  studentProfileForReport,
  serializeStudentForViewer,
};
