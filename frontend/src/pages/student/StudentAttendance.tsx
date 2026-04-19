import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiCall } from "@/lib/api";
import { downloadPersonalAttendanceMonthPdf } from "@/lib/schoolPdf";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

function monthBounds(ym: string): { from: string; to: string } {
  const [y, m] = ym.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return {
    from: `${ym}-01`,
    to: `${ym}-${String(last).padStart(2, "0")}`,
  };
}

export default function StudentAttendance() {
  const { user } = useAuth();
  const [ym, setYm] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const { from, to } = useMemo(() => monthBounds(ym), [ym]);

  const { data: stuData } = useQuery({
    queryKey: ["student-self"],
    queryFn: () => apiCall("/students?limit=5"),
  });
  const me = stuData?.students?.[0];

  const { data: attData, isLoading } = useQuery({
    queryKey: ["student-attendance", from, to],
    queryFn: () => apiCall(`/attendance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&limit=400`),
  });

  const rows = useMemo(() => {
    const list: any[] = attData?.attendance ?? attData?.records ?? [];
    return list
      .map((a) => ({
        date: typeof a.date === "string" ? a.date.slice(0, 10) : String(a.date || "").slice(0, 10),
        status: a.status,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [attData]);

  const handlePdf = () => {
    if (!me) {
      toast.error("प्रोफाइल मिळाला नाही");
      return;
    }
    downloadPersonalAttendanceMonthPdf({
      ym,
      studentName: me.name,
      roll: me.roll,
      rows,
    });
    toast.success("PDF तयार");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">माझी उपस्थिती</h1>
        <p className="text-sm text-muted-foreground">
          {user?.name} · मासिक दृश्य
        </p>
      </div>

      <div className="portal-card p-5 space-y-4">
        <div className="space-y-2">
          <Label>महिना (YYYY-MM)</Label>
          <div className="flex flex-wrap gap-2">
            <Input className="w-36" value={ym} onChange={(e) => setYm(e.target.value)} />
            <Button variant="outline" size="sm" onClick={handlePdf}>
              PDF डाउनलोड
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">लोड होत आहे…</p>
        ) : (
          <ul className="space-y-2 text-sm border rounded-md divide-y max-h-[420px] overflow-y-auto">
            {rows.map((r) => (
              <li key={r.date} className="px-3 py-2 flex justify-between">
                <span>{r.date}</span>
                <span className="text-muted-foreground">
                  {r.status === "present" ? "उपस्थित" : r.status === "absent" ? "अनुपस्थित" : r.status === "late" ? "उशिरा" : r.status}
                </span>
              </li>
            ))}
            {rows.length === 0 && (
              <li className="px-3 py-6 text-center text-muted-foreground">या महिन्यात नोंद नाही.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
