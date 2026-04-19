/**
 * schoolPdf.ts
 * 
 * Generates formatted PDFs using browser print dialog — supports Devanagari Unicode
 * without needing custom fonts. The browser uses system fonts which include Marathi/Hindi.
 */

type Mail = { line1?: string; line2?: string; city?: string; state?: string; pincode?: string };
type Emerg = { name?: string; phone?: string; relation?: string };

function formatMailing(m?: Mail): string {
  if (!m) return "";
  const parts = [m.line1, m.line2, [m.city, m.state].filter(Boolean).join(", "), m.pincode].filter(Boolean);
  return parts.join(", ");
}

function classLabel(p: Record<string, unknown>): string {
  return String(p.className ?? p.class ?? "");
}

/** Opens a styled HTML print window — supports Marathi/Devanagari natively */
function printHtml(html: string, fileName = "document"): void {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) { alert("Popup blocked — allow popups to download PDF"); return; }
  win.document.write(`<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="UTF-8"/>
  <title>${fileName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Noto Sans Devanagari', 'Arial Unicode MS', Arial, sans-serif;
      font-size: 11pt;
      color: #111;
      padding: 18mm 20mm;
      line-height: 1.6;
    }
    h1 { font-size: 16pt; font-weight: 700; margin-bottom: 4px; color: #1a3a6b; border-bottom: 2px solid #1a3a6b; padding-bottom: 6px; }
    h2 { font-size: 12pt; font-weight: 600; margin: 12px 0 6px; color: #1a3a6b; }
    .school-header { text-align: center; margin-bottom: 20px; }
    .school-header h2 { font-size: 14pt; color: #1a3a6b; }
    .school-header p { font-size: 10pt; color: #555; margin-top: 2px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; margin: 10px 0; }
    .info-row { display: flex; gap: 8px; font-size: 10.5pt; padding: 2px 0; }
    .info-row .lbl { color: #555; min-width: 120px; }
    .info-row .val { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10.5pt; }
    th { background: #1a3a6b; color: white; padding: 7px 10px; text-align: left; font-weight: 600; }
    td { padding: 6px 10px; border-bottom: 1px solid #ddd; }
    tr:nth-child(even) td { background: #f5f7ff; }
    .grade-A { color: #16a34a; font-weight: 700; }
    .grade-B { color: #2563eb; font-weight: 700; }
    .grade-C { color: #ea580c; font-weight: 700; }
    .summary-box { display: flex; gap: 16px; margin: 12px 0; flex-wrap: wrap; }
    .stat { background: #f0f4ff; border-radius: 8px; padding: 10px 16px; text-align: center; min-width: 90px; }
    .stat-val { font-size: 20pt; font-weight: 700; color: #1a3a6b; }
    .stat-lbl { font-size: 9pt; color: #555; margin-top: 2px; }
    .comment-box { background: #f8f9fa; border-left: 4px solid #1a3a6b; padding: 10px 14px; margin: 10px 0; border-radius: 0 6px 6px 0; font-style: italic; }
    .footer { text-align: right; margin-top: 30px; font-size: 10pt; color: #555; border-top: 1px solid #ccc; padding-top: 10px; }
    .signature-line { display: inline-block; width: 180px; border-bottom: 1px solid #333; margin-left: 10px; }
    @media print {
      body { padding: 10mm 14mm; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  <button onclick="window.print()" style="position:fixed;top:12px;right:12px;padding:8px 18px;background:#1a3a6b;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;z-index:999;">🖨️ PDF / Print</button>
  ${html}
</body>
</html>`);
  win.document.close();
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReportCardPdfInput = {
  academicYear: string;
  term: string;
  overallGrade?: string;
  overallPercent?: number;
  subjectGrades: Array<{
    subject: string;
    grade: string;
    scorePercent: number;
    effort?: string;
    remark?: string;
  }>;
  teacherComment?: string;
  attendanceSummary?: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
  };
  homeworkCompletion?: { total: number; completed: number };
  studentProfile: Record<string, unknown>;
};

// ── Report Card PDF ───────────────────────────────────────────────────────────

export function downloadReportCardPdf(opts: ReportCardPdfInput): void {
  const p = opts.studentProfile;
  const mail = formatMailing(p.mailingAddress as Mail | undefined);
  const e = p.emergencyContact as Emerg | undefined;

  const gradeClass = (g: string) => {
    if (g.startsWith("A")) return "grade-A";
    if (g.startsWith("B")) return "grade-B";
    return "grade-C";
  };

  const subjectRows = opts.subjectGrades.map(g => `
    <tr>
      <td>${g.subject}</td>
      <td class="${gradeClass(g.grade)}">${g.grade}</td>
      <td>${g.scorePercent}%</td>
      <td>${g.effort || "—"}</td>
      <td>${g.remark || "—"}</td>
    </tr>`).join("");

  const att = opts.attendanceSummary;
  const hw = opts.homeworkCompletion;

  const html = `
    <div class="school-header">
      <h2>वैनतेय प्राथमिक विद्या मंदिर</h2>
      <p>प्रगती पुस्तिका — ${opts.academicYear} | सत्र: ${opts.term}</p>
    </div>

    <h1>📋 प्रगती पुस्तिका / Report Card</h1>

    <h2>विद्यार्थी माहिती</h2>
    <div class="info-grid">
      <div class="info-row"><span class="lbl">नाव:</span><span class="val">${p.name || "—"}</span></div>
      <div class="info-row"><span class="lbl">अनु. क्र.:</span><span class="val">${p.roll || "—"}</span></div>
      <div class="info-row"><span class="lbl">इयत्ता:</span><span class="val">${classLabel(p)}</span></div>
      <div class="info-row"><span class="lbl">पालकाचे नाव:</span><span class="val">${p.parentName || "—"}</span></div>
      ${p.motherName ? `<div class="info-row"><span class="lbl">आईचे नाव:</span><span class="val">${p.motherName}</span></div>` : ""}
      ${p.fatherName ? `<div class="info-row"><span class="lbl">वडिलांचे नाव:</span><span class="val">${p.fatherName}</span></div>` : ""}
      ${p.dateOfBirth ? `<div class="info-row"><span class="lbl">जन्मतारीख:</span><span class="val">${p.dateOfBirth}</span></div>` : ""}
      ${p.gender ? `<div class="info-row"><span class="lbl">लिंग:</span><span class="val">${p.gender}</span></div>` : ""}
      ${p.bloodGroup ? `<div class="info-row"><span class="lbl">रक्तगट:</span><span class="val">${p.bloodGroup}</span></div>` : ""}
      ${p.admissionDate ? `<div class="info-row"><span class="lbl">प्रवेश तारीख:</span><span class="val">${p.admissionDate}</span></div>` : ""}
      ${p.studentEmail ? `<div class="info-row"><span class="lbl">ईमेल (विद्यार्थी):</span><span class="val">${p.studentEmail}</span></div>` : ""}
      ${p.parentEmail ? `<div class="info-row"><span class="lbl">ईमेल (पालक):</span><span class="val">${p.parentEmail}</span></div>` : ""}
      ${p.parentPhone ? `<div class="info-row"><span class="lbl">पालक फोन:</span><span class="val">${p.parentPhone}</span></div>` : ""}
      ${mail ? `<div class="info-row"><span class="lbl">पत्ता:</span><span class="val">${mail}</span></div>` : (p.address ? `<div class="info-row"><span class="lbl">पत्ता:</span><span class="val">${p.address}</span></div>` : "")}
      ${e?.name ? `<div class="info-row"><span class="lbl">आपत्कालीन संपर्क:</span><span class="val">${e.name} (${e.relation || "—"}) ${e.phone || ""}</span></div>` : ""}
      ${p.previousSchool ? `<div class="info-row"><span class="lbl">मागील शाळा:</span><span class="val">${p.previousSchool}</span></div>` : ""}
      ${p.notes ? `<div class="info-row"><span class="lbl">टिपा:</span><span class="val">${p.notes}</span></div>` : ""}
    </div>

    <h2>विषयनिहाय गुण</h2>
    <table>
      <thead>
        <tr>
          <th>विषय</th>
          <th>श्रेणी</th>
          <th>गुण %</th>
          <th>प्रयत्न</th>
          <th>शेरा</th>
        </tr>
      </thead>
      <tbody>${subjectRows}</tbody>
    </table>

    ${opts.overallGrade ? `
    <div class="summary-box">
      <div class="stat"><div class="stat-val">${opts.overallGrade}</div><div class="stat-lbl">एकूण श्रेणी</div></div>
      ${opts.overallPercent != null ? `<div class="stat"><div class="stat-val">${opts.overallPercent}%</div><div class="stat-lbl">एकूण टक्केवारी</div></div>` : ""}
      ${att ? `
        <div class="stat"><div class="stat-val">${att.presentDays}</div><div class="stat-lbl">उपस्थित दिवस</div></div>
        <div class="stat"><div class="stat-val">${att.absentDays}</div><div class="stat-lbl">अनुपस्थित</div></div>
      ` : ""}
      ${hw ? `<div class="stat"><div class="stat-val">${hw.completed}/${hw.total}</div><div class="stat-lbl">गृहपाठ पूर्ण</div></div>` : ""}
    </div>` : ""}

    ${opts.teacherComment ? `
    <h2>शिक्षकाचा अभिप्राय</h2>
    <div class="comment-box">${opts.teacherComment}</div>` : ""}

    <div class="footer">
      <p>शिक्षक स्वाक्षरी: <span class="signature-line"></span>&nbsp;&nbsp;&nbsp;
         मुख्याध्यापक स्वाक्षरी: <span class="signature-line"></span>&nbsp;&nbsp;&nbsp;
         तारीख: ${new Date().toLocaleDateString("mr-IN")}</p>
    </div>`;

  printHtml(html, `pragati-pustika-${String(p.roll || "student")}`);
}

// ── Monthly Class Attendance PDF ──────────────────────────────────────────────

const statusLabel = (s: string) => {
  if (s === "present") return "P";
  if (s === "absent") return "A";
  if (s === "late") return "L";
  return "";
};
const statusColor = (s: string) => {
  if (s === "P") return "color:#16a34a;font-weight:700";
  if (s === "A") return "color:#dc2626;font-weight:700";
  if (s === "L") return "color:#d97706;font-weight:700";
  return "";
};

function ymdKey(d: string | Date): string {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d).slice(0, 10);
  return dt.toISOString().slice(0, 10);
}

export function downloadClassMonthlyAttendancePdf(opts: {
  ym: string;
  className: string;
  dates: string[];
  students: Array<{ id: string; name: string; roll: string }>;
  records: Array<{ studentId: string; date: string | Date; status: string }>;
}): void {
  const byStudent: Record<string, Record<string, string>> = {};
  for (const r of opts.records) {
    if (!byStudent[r.studentId]) byStudent[r.studentId] = {};
    byStudent[r.studentId][ymdKey(r.date)] = statusLabel(r.status);
  }

  const dateHeaders = opts.dates.map(d => `<th style="min-width:22px;padding:4px 2px;font-size:8pt">${d.slice(-2)}</th>`).join("");

  const studentRows = opts.students.map((s, idx) => {
    const row = byStudent[s.id] || {};
    let present = 0, absent = 0, late = 0;
    const cells = opts.dates.map(d => {
      const v = row[d] || "";
      if (v === "P") present++;
      if (v === "A") absent++;
      if (v === "L") late++;
      return `<td style="text-align:center;font-size:8pt;padding:3px 2px;${statusColor(v)}">${v}</td>`;
    }).join("");
    const pct = opts.dates.length > 0 ? Math.round((present / opts.dates.length) * 100) : 0;
    return `<tr style="background:${idx % 2 === 0 ? "#f8faff" : "white"}">
      <td style="padding:4px 6px;font-size:9pt">${s.roll}</td>
      <td style="padding:4px 6px;font-size:9pt;white-space:nowrap">${s.name}</td>
      ${cells}
      <td style="text-align:center;font-size:8.5pt;color:#16a34a;font-weight:700">${present}</td>
      <td style="text-align:center;font-size:8.5pt;color:#dc2626;font-weight:700">${absent}</td>
      <td style="text-align:center;font-size:8.5pt;color:#d97706">${late}</td>
      <td style="text-align:center;font-size:8.5pt;font-weight:600">${pct}%</td>
    </tr>`;
  }).join("");

  const html = `
    <div class="school-header">
      <h2>वैनतेय प्राथमिक विद्या मंदिर</h2>
      <p>मासिक उपस्थिती पत्रक</p>
    </div>

    <h1>📅 उपस्थिती पत्रक / Attendance Register</h1>

    <div class="info-grid" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:16px">
      <div class="info-row"><span class="lbl">वर्ग:</span><span class="val">${opts.className}</span></div>
      <div class="info-row"><span class="lbl">महिना:</span><span class="val">${opts.ym}</span></div>
      <div class="info-row"><span class="lbl">एकूण विद्यार्थी:</span><span class="val">${opts.students.length}</span></div>
    </div>

    <div style="overflow-x:auto">
      <table style="font-size:9pt">
        <thead>
          <tr>
            <th style="padding:6px 8px">रोल</th>
            <th style="padding:6px 8px">नाव</th>
            ${dateHeaders}
            <th style="padding:6px 4px;color:#16a34a">P</th>
            <th style="padding:6px 4px;color:#dc2626">A</th>
            <th style="padding:6px 4px;color:#d97706">L</th>
            <th style="padding:6px 4px">%</th>
          </tr>
        </thead>
        <tbody>${studentRows}</tbody>
      </table>
    </div>

    <p style="margin-top:10px;font-size:9pt;color:#555">
      P = उपस्थित (Present) &nbsp;|&nbsp; A = अनुपस्थित (Absent) &nbsp;|&nbsp; L = उशिरा (Late)
    </p>

    <div class="footer" style="margin-top:40px">
      <p>
        शिक्षक स्वाक्षरी: <span class="signature-line"></span>&nbsp;&nbsp;&nbsp;
        मुख्याध्यापक स्वाक्षरी: <span class="signature-line"></span>&nbsp;&nbsp;&nbsp;
        तारीख: ${new Date().toLocaleDateString("mr-IN")}
      </p>
    </div>`;

  printHtml(html, `upasthiti-${opts.ym}-${opts.className.replace(/\s/g, "_")}`);
}

// ── Personal Monthly Attendance (Parent/Student) ──────────────────────────────

export function downloadPersonalAttendanceMonthPdf(opts: {
  ym: string;
  studentName: string;
  roll: string;
  rows: Array<{ date: string; status: string }>;
}): void {
  let present = 0, absent = 0, late = 0;

  const tableRows = opts.rows.map((r, i) => {
    const lbl = r.status === "present" ? "उपस्थित" : r.status === "absent" ? "अनुपस्थित" : r.status === "late" ? "उशिरा" : r.status;
    const color = r.status === "present" ? "#16a34a" : r.status === "absent" ? "#dc2626" : "#d97706";
    if (r.status === "present") present++;
    if (r.status === "absent") absent++;
    if (r.status === "late") late++;
    return `<tr style="background:${i % 2 === 0 ? "#f8faff" : "white"}">
      <td style="padding:6px 10px">${r.date}</td>
      <td style="padding:6px 10px;color:${color};font-weight:600">${lbl}</td>
    </tr>`;
  }).join("");

  const total = opts.rows.length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  const html = `
    <div class="school-header">
      <h2>वैनतेय प्राथमिक विद्या मंदिर</h2>
      <p>वैयक्तिक मासिक उपस्थिती</p>
    </div>

    <h1>📅 मासिक उपस्थिती — ${opts.ym}</h1>

    <div class="info-grid" style="margin-bottom:16px">
      <div class="info-row"><span class="lbl">विद्यार्थी:</span><span class="val">${opts.studentName}</span></div>
      <div class="info-row"><span class="lbl">अनु. क्र.:</span><span class="val">${opts.roll}</span></div>
    </div>

    <div class="summary-box">
      <div class="stat"><div class="stat-val" style="color:#16a34a">${present}</div><div class="stat-lbl">उपस्थित</div></div>
      <div class="stat"><div class="stat-val" style="color:#dc2626">${absent}</div><div class="stat-lbl">अनुपस्थित</div></div>
      <div class="stat"><div class="stat-val" style="color:#d97706">${late}</div><div class="stat-lbl">उशिरा</div></div>
      <div class="stat"><div class="stat-val">${pct}%</div><div class="stat-lbl">उपस्थिती %</div></div>
    </div>

    <table>
      <thead>
        <tr><th>तारीख</th><th>स्थिती</th></tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>

    <div class="footer">
      <p>
        पालक स्वाक्षरी: <span class="signature-line"></span>&nbsp;&nbsp;&nbsp;
        तारीख: ${new Date().toLocaleDateString("mr-IN")}
      </p>
    </div>`;

  printHtml(html, `upasthiti-${opts.ym}-${opts.roll}`);
}
