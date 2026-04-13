import { schoolConfig } from '@/config/school';

export type SubjectGradeRow = {
  subject: string;
  grade: string;
  scorePercent?: number;
  effort?: string;
  remark?: string;
};

export type StudentProfilePrint = {
  name?: string;
  roll?: string;
  className?: string;
  parentName?: string;
  motherName?: string;
  fatherName?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  mailingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  studentPhone?: string;
  parentPhone?: string;
  alternateGuardianName?: string;
  alternateGuardianPhone?: string;
  admissionDate?: string;
  bloodGroup?: string;
  previousSchool?: string;
  notes?: string;
  studentEmail?: string;
  parentEmail?: string;
  emergencyContact?: { name?: string; phone?: string; relation?: string };
};

export type ReportCardPrintData = {
  term?: string;
  academicYear?: string;
  subjectGrades?: SubjectGradeRow[];
  attendanceSummary?: {
    totalDays?: number;
    presentDays?: number;
    absentDays?: number;
    lateDays?: number;
  };
  homeworkCompletion?: { total?: number; completed?: number };
  overallGrade?: string;
  overallPercent?: number;
  teacherComment?: string;
  studentProfile?: StudentProfilePrint;
};

function genderLabel(g?: string) {
  if (g === 'male') return 'पुरुष';
  if (g === 'female') return 'स्त्री';
  if (g === 'other') return 'इतर';
  return g || '—';
}

function formatAddr(m?: StudentProfilePrint['mailingAddress']) {
  if (!m) return '—';
  const parts = [m.line1, m.line2, m.city, m.state, m.pincode].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

type Props = {
  data: ReportCardPrintData | null;
  className?: string;
};

/**
 * Print/PDF-oriented layout: includes school header, full enrollment block,
 * attendance, homework stats, subject table (grade, %, effort, remark), and teacher comment.
 */
export function ReportCardPrintTemplate({ data, className = '' }: Props) {
  if (!data?.studentProfile && !data?.subjectGrades?.length) {
    return (
      <div className={`rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground ${className}`}>
        प्रगती पुस्तक दाखवण्यासाठी विद्यार्थी निवडा किंवा अहवाल तयार करा.
      </div>
    );
  }

  const p = data.studentProfile ?? {};
  const att = data.attendanceSummary ?? {};
  const hw = data.homeworkCompletion ?? {};
  const subjects = data.subjectGrades ?? [];

  return (
    <div className={`report-card-print bg-card text-foreground text-sm ${className}`}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          .report-card-print, .report-card-print * { visibility: visible; }
          .report-card-print {
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 12mm; background: white !important; color: black !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
        }
      `}</style>

      <header className="border-b-2 border-primary/40 pb-3 mb-4 text-center">
        <p className="text-xs text-muted-foreground">{schoolConfig.trusteeLineMr}</p>
        <h2 className="text-lg font-bold mt-1">{schoolConfig.displayNameMr}</h2>
        <p className="text-xs whitespace-pre-line">{schoolConfig.fullAddressMr}</p>
        <p className="text-xs mt-1">फोन: {schoolConfig.phoneDisplay} • ईमेल: {schoolConfig.emailGeneral}</p>
        <h3 className="text-base font-semibold mt-3 tracking-wide">प्रगती पुस्तक / गुणपत्रक</h3>
        <p className="text-xs mt-1">
          शैक्षणिक वर्ष: <strong>{data.academicYear ?? '—'}</strong> &nbsp;|&nbsp; सत्र:{' '}
          <strong>{data.term ?? '—'}</strong>
        </p>
      </header>

      <section className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 border-b border-border pb-1">
          विद्यार्थी व प्रवेश माहिती
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <Row label="विद्यार्थ्याचे नाव" value={p.name} />
          <Row label="इयत्ता वर्ग" value={p.className} />
          <Row label="अनुक्रमांक" value={p.roll} />
          <Row label="जन्मतारीख" value={p.dateOfBirth || '—'} />
          <Row label="लिंग" value={genderLabel(p.gender)} />
          <Row label="रक्तगट" value={p.bloodGroup || '—'} />
          <Row label="प्रवेश दिनांक" value={p.admissionDate || '—'} />
          <Row label="मागील शाळा" value={p.previousSchool || '—'} />
          <Row label="पालक / पालकांचे नाव" value={p.parentName} />
          <Row label="आईचे नाव" value={p.motherName || '—'} />
          <Row label="वडिलांचे नाव" value={p.fatherName || '—'} />
          <Row label="पालक फोन" value={p.parentPhone || '—'} />
          <Row label="विद्यार्थी फोन" value={p.studentPhone || '—'} />
          <Row label="पालक ईमेल" value={p.parentEmail || '—'} />
          <Row label="विद्यार्थी ईमेल" value={p.studentEmail || '—'} />
          <Row label="पत्ता (ओळ)" value={p.address || '—'} wide />
          <Row label="पत्र व्यवहार पत्ता" value={formatAddr(p.mailingAddress)} wide />
          <Row label="पर्यायी पालक" value={p.alternateGuardianName || '—'} />
          <Row label="पर्यायी पालक फोन" value={p.alternateGuardianPhone || '—'} />
          <Row
            label="आपत्कालीन संपर्क"
            value={
              p.emergencyContact?.name
                ? `${p.emergencyContact.name} (${p.emergencyContact.relation || '—'}) — ${p.emergencyContact.phone || '—'}`
                : '—'
            }
            wide
          />
          {p.notes ? <Row label="शाळेकडील नोंदी" value={p.notes} wide /> : null}
        </div>
      </section>

      <section className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-md border border-border p-3">
          <h4 className="text-xs font-bold mb-2">हजेरी सारांश</h4>
          <table className="w-full text-xs">
            <tbody>
              <tr><td className="py-0.5">एकूण दिवस</td><td className="font-medium text-right">{att.totalDays ?? 0}</td></tr>
              <tr><td className="py-0.5">हजर</td><td className="font-medium text-right">{att.presentDays ?? 0}</td></tr>
              <tr><td className="py-0.5">अनुपस्थित</td><td className="font-medium text-right">{att.absentDays ?? 0}</td></tr>
              <tr><td className="py-0.5">उशीरा</td><td className="font-medium text-right">{att.lateDays ?? 0}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="rounded-md border border-border p-3">
          <h4 className="text-xs font-bold mb-2">गृहपाठ पूर्णता</h4>
          <table className="w-full text-xs">
            <tbody>
              <tr><td className="py-0.5">एकूण सोपवले</td><td className="font-medium text-right">{hw.total ?? 0}</td></tr>
              <tr><td className="py-0.5">पूर्ण / सादर</td><td className="font-medium text-right">{hw.completed ?? 0}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 border-b border-border pb-1">
          विषयनिहाय गुण व अभिप्राय
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 text-left">विषय</th>
                <th className="border border-border p-2 text-left">श्रेणी</th>
                <th className="border border-border p-2 text-left">%</th>
                <th className="border border-border p-2 text-left">प्रयत्न</th>
                <th className="border border-border p-2 text-left">शिक्षक टीप</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-border p-3 text-center text-muted-foreground">
                    विषय नोंदी नाहीत
                  </td>
                </tr>
              ) : (
                subjects.map((row, i) => (
                  <tr key={`${row.subject}-${i}`}>
                    <td className="border border-border p-2 font-medium">{row.subject}</td>
                    <td className="border border-border p-2">{row.grade}</td>
                    <td className="border border-border p-2">{row.scorePercent ?? '—'}</td>
                    <td className="border border-border p-2">{row.effort ?? '—'}</td>
                    <td className="border border-border p-2">{row.remark ?? ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold">
          <span>एकूण श्रेणी: {data.overallGrade ?? '—'}</span>
          <span>एकूण टक्केवारी: {data.overallPercent != null ? `${data.overallPercent}%` : '—'}</span>
        </div>
      </section>

      <section className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">वर्ग शिक्षकांचा अभिप्राय</h4>
        <p className="text-xs min-h-[4rem] whitespace-pre-wrap rounded-md border border-border p-3 bg-muted/20">
          {data.teacherComment?.trim() ? data.teacherComment : '—'}
        </p>
      </section>

      <footer className="pt-4 border-t border-border text-[10px] text-muted-foreground text-center">
        हा दस्तऐवज {schoolConfig.displayNameMr} यांच्या अभ्यास व्यवस्थापन प्रणालीद्वारे तयार केला आहे.
      </footer>
    </div>
  );
}

function Row({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <span className="text-muted-foreground">{label}:</span>{' '}
      <span className="font-medium">{value?.trim() ? value : '—'}</span>
    </div>
  );
}
