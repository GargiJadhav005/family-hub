import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiCall } from "@/lib/api";
import { downloadPersonalAttendanceMonthPdf } from "@/lib/schoolPdf";
import { toast } from "sonner";

function monthBounds(ym: string): { from: string; to: string } {
  const [y, m] = ym.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return {
    from: `${ym}-01`,
    to: `${ym}-${String(last).padStart(2, "0")}`,
  };
}

export default function ParentAttendance() {
  const [ym, setYm] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [childId, setChildId] = useState<string | null>(null);

  const { data: stuData } = useQuery({
    queryKey: ["parent-children"],
    queryFn: () => apiCall("/students?limit=50"),
  });

  const children: any[] = stuData?.students ?? [];

  useEffect(() => {
    if (!childId && children[0]?.id) setChildId(children[0].id);
  }, [children, childId]);

  const { from, to } = useMemo(() => monthBounds(ym), [ym]);

  const { data: attData, isLoading } = useQuery({
    queryKey: ["parent-attendance", from, to],
    queryFn: () => apiCall(`/attendance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&limit=400`),
  });

  const rows = useMemo(() => {
    const list: any[] = attData?.attendance ?? attData?.records ?? [];
    const filtered = childId ? list.filter((a) => a.studentId === childId) : list;
    return filtered
      .map((a) => ({
        date: typeof a.date === "string" ? a.date.slice(0, 10) : String(a.date || "").slice(0, 10),
        status: a.status,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [attData, childId]);

  const child = children.find((c) => c.id === childId);

  const handlePdf = () => {
    if (!child) {
      toast.error("विद्यार्थी निवडा");
      return;
    }
    downloadPersonalAttendanceMonthPdf({
      ym,
      studentName: child.name,
      roll: child.roll,
      rows,
    });
    toast.success("PDF तयार");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">मुलाची उपस्थिती</h1>
        <p className="text-sm text-muted-foreground">मासिक दृश्य — फक्त आपल्या मुलासाठी</p>
      </div>

      <div className="portal-card p-5 space-y-4">
        {children.length > 1 && (
          <div className="space-y-2">
            <Label>विद्यार्थी</Label>
            <Select value={childId || ""} onValueChange={setChildId}>
              <SelectTrigger>
                <SelectValue placeholder="निवडा" />
              </SelectTrigger>
              <SelectContent>
                {children.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.roll})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
