import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Save, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { apiCall } from '@/lib/api';
import { downloadClassMonthlyAttendancePdf } from '@/lib/schoolPdf';

type Row = { id: string; name: string; roll: string; status: string };

function ymNow(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [monthYm, setMonthYm] = useState(ymNow);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  // Track which studentIds have 100% attendance this month
  const [perfectAttendanceIds, setPerfectAttendanceIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ym = monthYm;
      const [y, mo] = ym.split('-').map(Number);
      const lastDay = new Date(y, mo, 0).getDate();
      const fromDate = `${ym}-01`;
      const toDate = `${ym}-${String(lastDay).padStart(2, '0')}`;

      const [stuRes, attRes, monthAttRes] = await Promise.all([
        apiCall('/students?limit=200'),
        apiCall(`/attendance?date=${encodeURIComponent(date)}&limit=500`),
        apiCall(`/attendance?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}&limit=5000`),
      ]);
      const students: any[] = stuRes.students ?? [];
      const attendance: any[] = attRes.attendance ?? attRes.records ?? [];
      const monthAttendance: any[] = monthAttRes.attendance ?? monthAttRes.records ?? [];

      // Build today's status map
      const byId: Record<string, string> = {};
      for (const a of attendance) {
        if (a.studentId) byId[a.studentId] = a.status;
      }

      // Calculate perfect attendance: student has >= 15 records and ALL are 'present'
      const monthByStudent: Record<string, string[]> = {};
      for (const a of monthAttendance) {
        const sid = a.studentId?.toString();
        if (!sid) continue;
        if (!monthByStudent[sid]) monthByStudent[sid] = [];
        monthByStudent[sid].push(a.status);
      }
      const perfect = new Set<string>();
      for (const [sid, statuses] of Object.entries(monthByStudent)) {
        if (statuses.length >= 1 && statuses.every(s => s === 'present')) {
          perfect.add(sid);
        }
      }
      setPerfectAttendanceIds(perfect);

      setRows(
        students.map((s: any) => ({
          id: s.id,
          name: s.name,
          roll: s.roll || '—',
          status: byId[s.id] || 'present',
        }))
      );
    } catch {
      toast.error('माहिती लोड करता आली नाही');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [date, monthYm]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = (id: string, status: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const markAll = (status: string) => {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  const stats = useMemo(
    () => ({
      present: rows.filter((r) => r.status === 'present').length,
      absent: rows.filter((r) => r.status === 'absent').length,
      late: rows.filter((r) => r.status === 'late').length,
    }),
    [rows]
  );

  const handleSave = async () => {
    if (rows.length === 0) {
      toast.error('विद्यार्थी नाहीत');
      return;
    }
    try {
      await apiCall('/attendance', {
        method: 'POST',
        body: JSON.stringify({
          date,
          records: rows.map((r) => ({ studentId: r.id, status: r.status })),
        }),
      });
      toast.success('हजेरी जतन केली!');
    } catch {
      toast.error('जतन अयशस्वी');
    }
  };

  const handleMonthPdf = async () => {
    try {
      const data = await apiCall(`/attendance/month?ym=${encodeURIComponent(monthYm)}`);
      const [y, mo] = monthYm.split('-').map(Number);
      const last = new Date(y, mo, 0).getDate();
      const dates = Array.from(
        { length: last },
        (_, i) => `${monthYm}-${String(i + 1).padStart(2, '0')}`
      );
      downloadClassMonthlyAttendancePdf({
        ym: data.ym || monthYm,
        className: data.className || user?.meta?.class || '',
        dates: data.dates ?? dates,
        students: data.students || [],
        records: data.records || [],
      });
      toast.success('PDF डाउनलोड सुरू');
    } catch {
      toast.error('मासिक PDF तयार करता आले नाही');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">वर्ग उपस्थिती</h1>
          <p className="text-sm text-muted-foreground">{user?.meta?.class || 'आपला वर्ग'}</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">तारीख</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[11rem]" />
          </div>
          <Button variant="outline" size="sm" onClick={() => markAll('present')}>
            सर्व हजर
          </Button>
          <Button size="sm" onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-1" /> जतन
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 p-4 rounded-lg border border-border bg-card">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">मासिक PDF (YYYY-MM)</label>
          <Input
            type="month"
            value={monthYm}
            onChange={(e) => setMonthYm(e.target.value)}
            className="w-[11rem]"
          />
        </div>
        <Button variant="secondary" size="sm" onClick={handleMonthPdf}>
          <FileDown className="w-4 h-4 mr-1" /> मासिक PDF
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card text-center py-3">
          <div className="text-xl font-bold text-success">{stats.present}</div>
          <p className="text-[10px] text-muted-foreground">उपस्थित</p>
        </div>
        <div className="stat-card text-center py-3">
          <div className="text-xl font-bold text-destructive">{stats.absent}</div>
          <p className="text-[10px] text-muted-foreground">अनुपस्थित</p>
        </div>
        <div className="stat-card text-center py-3">
          <div className="text-xl font-bold text-warning">{stats.late}</div>
          <p className="text-[10px] text-muted-foreground">उशिरा</p>
        </div>
      </div>

      <div className="portal-card overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground w-14">रोल</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">नाव</th>
              <th className="text-center p-3 text-xs font-medium text-muted-foreground">स्थिती</th>
              <th className="text-center p-3 text-xs font-medium text-muted-foreground w-36">कृती</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={`border-b border-border/50 hover:bg-secondary/30 ${perfectAttendanceIds.has(r.id) ? 'bg-success/5' : ''}`}>
                <td className="p-3 text-sm">{r.roll}</td>
                <td className="p-3 text-sm font-medium">
                  {r.name}
                  {perfectAttendanceIds.has(r.id) && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-success/20 text-success font-medium">★ पूर्ण हजेरी</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${
                      r.status === 'present'
                        ? 'bg-success/10 text-success'
                        : r.status === 'absent'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {r.status === 'present' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : r.status === 'absent' ? (
                      <XCircle className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {r.status === 'present' ? 'हजर' : r.status === 'absent' ? 'अनुपस्थित' : 'उशिरा'}
                  </span>
                </td>
                <td className="p-2">
                  <div className="flex justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => setStatus(r.id, 'present')}
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        r.status === 'present'
                          ? 'bg-success text-success-foreground'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(r.id, 'absent')}
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        r.status === 'absent'
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(r.id, 'late')}
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        r.status === 'late'
                          ? 'bg-warning text-warning-foreground'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">या वर्गात विद्यार्थी नाहीत.</p>
        )}
      </div>
    </div>
  );
}
