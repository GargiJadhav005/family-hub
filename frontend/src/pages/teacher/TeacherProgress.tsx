import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Download, Plus, X } from "lucide-react";
import { apiCall } from "@/lib/api";
import { downloadReportCardPdf } from "@/lib/schoolPdf";
import { toast } from "sonner";

type SubjectRow = {
  subject: string;
  grade: string;
  scorePercent: number;
  effort: string;
  remark: string;
};

const TERMS = ["सत्र १", "सत्र २", "वार्षिक"] as const;
const EFFORTS = ["उत्कृष्ट", "चांगले", "समाधानकारक", "सुधारणा आवश्यक"] as const;
const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C"];
const PREDEFINED_SUBJECTS = [
  "मराठी",
  "इंग्रजी",
  "गणित",
  "विज्ञान",
  "परिसर अभ्यास",
  "संगीत",
  "कला",
  "शारीरिक शिक्षा",
];

export default function TeacherProgress() {
  const queryClient = useQueryClient();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [term, setTerm] = useState<string>("वार्षिक");
  const [academicYear] = useState("२०२४-२५");
  const [subjectRows, setSubjectRows] = useState<SubjectRow[]>([]);
  const [teacherComment, setTeacherComment] = useState("");
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form state for adding/editing subject
  const [formSubject, setFormSubject] = useState("");
  const [formGrade, setFormGrade] = useState("");
  const [formScore, setFormScore] = useState("");
  const [formEffort, setFormEffort] = useState("");
  const [formRemark, setFormRemark] = useState("");

  const { data: studentsData } = useQuery({
    queryKey: ["progress-students"],
    queryFn: () => apiCall("/students?limit=100"),
  });

  const students: any[] = studentsData?.students ?? [];
  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? students[0] ?? null;

  useEffect(() => {
    if (!selectedStudentId && students[0]?.id) setSelectedStudentId(students[0].id);
  }, [students, selectedStudentId]);

  const { data: scoresData } = useQuery({
    queryKey: ["progress-scores", selectedStudent?.id],
    queryFn: () => apiCall(`/scores?studentId=${selectedStudent?.id}`),
    enabled: !!selectedStudent?.id,
  });

  const { data: reportData, isFetching: reportLoading } = useQuery({
    queryKey: ["report-card", selectedStudent?.id, term],
    queryFn: () =>
      apiCall(`/report-cards/${selectedStudent!.id}?term=${encodeURIComponent(term)}`),
    enabled: !!selectedStudent?.id,
  });

  const scores: any[] = scoresData?.scores ?? [];
  const reportCard = reportData?.reportCard;

  const scoresSummary = useMemo(() => {
    const subjectSummary: Record<string, { grade: string; score: number }> = {};
    for (const s of scores) {
      if (!subjectSummary[s.subject]) {
        const pct = Number(s.score ?? s.scorePercent ?? 0);
        const grade =
          pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "A-" : pct >= 60 ? "B+" : pct >= 50 ? "B" : "C";
        subjectSummary[s.subject] = { grade, score: pct };
      }
    }
    return Object.entries(subjectSummary).map(([subject, v]) => ({
      subject,
      grade: v.grade,
      scorePercent: v.score,
      effort: v.score >= 85 ? "उत्कृष्ट" : v.score >= 70 ? "चांगले" : "समाधानकारक",
      remark: "",
    }));
  }, [scores]);

  useEffect(() => {
    const rc = reportCard;
    if (rc?.subjectGrades?.length) {
      setSubjectRows(
        rc.subjectGrades.map((g: any) => ({
          subject: g.subject,
          grade: g.grade,
          scorePercent: g.scorePercent,
          effort: g.effort || "चांगले",
          remark: g.remark || "",
        }))
      );
      setTeacherComment(rc.teacherComment || "");
    } else if (scoresSummary.length) {
      setSubjectRows(scoresSummary);
      setTeacherComment("");
    } else {
      setSubjectRows([]);
      setTeacherComment("");
    }
  }, [reportCard, scoresSummary, term, selectedStudent?.id]);

  const resetForm = () => {
    setFormSubject("");
    setFormGrade("");
    setFormScore("");
    setFormEffort("");
    setFormRemark("");
    setEditingIndex(null);
  };

  const handleOpenAddSubject = () => {
    resetForm();
    setAddSubjectOpen(true);
  };

  const handleEditSubject = (index: number) => {
    const subject = subjectRows[index];
    setFormSubject(subject.subject);
    setFormGrade(subject.grade);
    setFormScore(String(subject.scorePercent));
    setFormEffort(subject.effort);
    setFormRemark(subject.remark);
    setEditingIndex(index);
    setAddSubjectOpen(true);
  };

  const handleDeleteSubject = (index: number) => {
    setSubjectRows((rows) => rows.filter((_, i) => i !== index));
    toast.success("विषय हटवला");
  };

  const handleSubmitSubject = () => {
    if (!formSubject.trim()) {
      toast.error("कृपया विषय निवडा");
      return;
    }
    if (!formGrade) {
      toast.error("कृपया श्रेणी निवडा");
      return;
    }
    if (!formScore || isNaN(Number(formScore)) || Number(formScore) < 0 || Number(formScore) > 100) {
      toast.error("कृपया वैध गुण (०-१००) भरा");
      return;
    }
    if (!formEffort) {
      toast.error("कृपया प्रयत्न निवडा");
      return;
    }

    const newRow: SubjectRow = {
      subject: formSubject,
      grade: formGrade,
      scorePercent: Number(formScore),
      effort: formEffort,
      remark: formRemark,
    };

    if (editingIndex !== null) {
      setSubjectRows((rows) =>
        rows.map((r, i) => (i === editingIndex ? newRow : r))
      );
      toast.success("विषय अद्यतनित केला");
    } else {
      setSubjectRows((rows) => [...rows, newRow]);
      toast.success("विषय जोडला");
    }

    resetForm();
    setAddSubjectOpen(false);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStudent?.id) throw new Error("no student");
      return apiCall("/report-cards/save", {
        method: "POST",
        body: JSON.stringify({
          studentId: selectedStudent.id,
          term,
          academicYear,
          subjectGrades: subjectRows.map((r) => ({
            subject: r.subject,
            grade: r.grade,
            scorePercent: r.scorePercent,
            effort: r.effort,
            remark: r.remark,
          })),
          teacherComment,
        }),
      });
    },
    onSuccess: () => {
      toast.success("प्रगती पुस्तिका जतन केली");
      queryClient.invalidateQueries({ queryKey: ["report-card", selectedStudent?.id, term] });
    },
    onError: () => toast.error("जतन अयशस्वी"),
  });

  const handlePdf = () => {
    if (!selectedStudent || subjectRows.length === 0) {
      toast.error("प्रथम विषय गुण भरा किंवा गुण मिळवा");
      return;
    }
    const profile = (reportCard?.studentProfile || {
      name: selectedStudent.name,
      roll: selectedStudent.roll,
      className: selectedStudent.class,
      parentName: selectedStudent.parentName,
      studentEmail: selectedStudent.studentEmail,
      parentEmail: selectedStudent.parentEmail,
    }) as Record<string, unknown>;

    const overallPercent =
      subjectRows.length > 0
        ? Math.round(subjectRows.reduce((a, r) => a + r.scorePercent, 0) / subjectRows.length)
        : 0;
    const overallGrade =
      overallPercent >= 90
        ? "A+"
        : overallPercent >= 80
          ? "A"
          : overallPercent >= 70
            ? "A-"
            : overallPercent >= 60
              ? "B+"
              : overallPercent >= 50
                ? "B"
                : "C";

    downloadReportCardPdf({
      academicYear: reportCard?.academicYear || academicYear,
      term: reportCard?.term || term,
      overallGrade: reportCard?.overallGrade || overallGrade,
      overallPercent: reportCard?.overallPercent ?? overallPercent,
      subjectGrades: subjectRows,
      teacherComment: reportCard?.teacherComment ?? teacherComment,
      attendanceSummary: reportCard?.attendanceSummary,
      homeworkCompletion: reportCard?.homeworkCompletion,
      studentProfile: profile,
    });
    toast.success("PDF डाउनलोड सुरू");
  };

  const updateRow = (i: number, patch: Partial<SubjectRow>) => {
    setSubjectRows((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">प्रगती पुस्तिका</h1>
          <p className="text-sm text-muted-foreground">शैक्षणिक वर्ष {academicYear}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TERMS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handlePdf}>
            <Download className="w-4 h-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="portal-card p-5">
          <h3 className="font-bold mb-3">विद्यार्थी</h3>
          <div className="space-y-2">
            {students.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStudentId(s.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                  (selectedStudentId ?? students[0]?.id) === s.id
                    ? "bg-primary/5 border border-primary/20"
                    : "hover:bg-secondary"
                }`}
              >
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {s.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">अ.क्र. {s.roll}</p>
                </div>
                {(selectedStudentId ?? students[0]?.id) === s.id && (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>
            ))}
            {students.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">विद्यार्थी नाहीत.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="portal-card p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-bold">शैक्षणिक गुण — {selectedStudent?.name ?? "—"}</h3>
              {reportLoading && <span className="text-xs text-muted-foreground">लोड…</span>}
            </div>

            {subjectRows.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  या विद्यार्थ्यासाठी अजून गुण जोडले नाहीत.
                </p>
                <Button onClick={handleOpenAddSubject}>
                  <Plus className="w-4 h-4 mr-2" /> विषय जोडा
                </Button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {subjectRows.map((row, i) => (
                    <div
                      key={`${row.subject}-${i}`}
                      className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <h4 className="font-semibold text-primary">{row.subject}</h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubject(i)}
                          className="p-1 hover:bg-destructive/10 rounded text-destructive"
                          title="हटवा"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">गुण:</span>
                          <span className="font-semibold">{row.scorePercent}/१००</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">श्रेणी:</span>
                          <span className="font-semibold text-primary">{row.grade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">प्रयत्न:</span>
                          <span className="font-semibold">{row.effort}</span>
                        </div>
                      </div>

                      {row.remark && (
                        <div className="bg-white/50 rounded p-2 mb-3">
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">टिप:</p>
                          <p className="text-xs">{row.remark}</p>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleEditSubject(i)}
                      >
                        संपादित करा
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleOpenAddSubject}>
                    <Plus className="w-4 h-4 mr-2" /> नवीन विषय जोडा
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="portal-card p-5">
            <h3 className="font-bold mb-3">एकूण शिक्षक अभिप्राय</h3>
            <Textarea
              rows={4}
              value={teacherComment}
              onChange={(e) => setTeacherComment(e.target.value)}
              placeholder="सत्राबद्दल अभिप्राय…"
            />
            <Button className="mt-3" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "जतन…" : "अभिप्राय व गुण जतन करा"}
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Subject Dialog */}
      <Dialog open={addSubjectOpen} onOpenChange={setAddSubjectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "विषय संपादित करा" : "नवीन विषय जोडा"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>विषय *</Label>
              <Select value={formSubject} onValueChange={setFormSubject}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="विषय निवडा" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>गुण (०-१००) *</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formScore}
                  onChange={(e) => setFormScore(e.target.value)}
                  placeholder="०-१००"
                />
              </div>
              <div>
                <Label>श्रेणी *</Label>
                <Select value={formGrade} onValueChange={setFormGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="श्रेणी" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>प्रयत्न *</Label>
              <Select value={formEffort} onValueChange={setFormEffort}>
                <SelectTrigger>
                  <SelectValue placeholder="प्रयत्न निवडा" />
                </SelectTrigger>
                <SelectContent>
                  {EFFORTS.map((effort) => (
                    <SelectItem key={effort} value={effort}>
                      {effort}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>शिक्षक टिप (पर्यायी)</Label>
              <Textarea
                rows={3}
                value={formRemark}
                onChange={(e) => setFormRemark(e.target.value)}
                placeholder="विषयाबद्दल टिप जोडा…"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSubjectOpen(false)}>
              रद्द करा
            </Button>
            <Button onClick={handleSubmitSubject}>
              {editingIndex !== null ? "अद्यतनित करा" : "जोडा"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
