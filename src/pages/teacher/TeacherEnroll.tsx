import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth, type EnrollPayload } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Copy, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';

const CLASS_OPTIONS = [
  'इयत्ता १-अ',
  'इयत्ता १-ब',
  'इयत्ता २-अ',
  'इयत्ता २-ब',
  'इयत्ता ३-अ',
  'इयत्ता ३-ब',
  'इयत्ता ४-अ',
  'इयत्ता ४-ब',
];

export default function TeacherEnroll() {
  const { enrollStudent, user } = useAuth();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastEnrolled, setLastEnrolled] = useState<{
    name: string;
    studentEmail: string;
    studentPassword: string;
    parentEmail: string;
    parentPassword: string;
  } | null>(null);

  const [form, setForm] = useState<EnrollPayload & { studentEmail?: string; parentEmail?: string; studentPassword?: string; parentPassword?: string }>({
    name: '',
    parentName: '',
    className: user?.meta?.class || '',
    motherName: '',
    fatherName: '',
    roll: '',
    idNumber: '',
    regNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    parentPhone: '',
    admissionDate: '',
    bloodGroup: '',
    previousSchool: '',
    notes: '',
    studentPhone: '',
    motherTongue: '',
    medium: '',
    udiseNumber: '',
    studentEmail: '',
    parentEmail: '',
    studentPassword: '',
    parentPassword: '',
    mailingAddress: { line1: '', line2: '', city: '', state: '', pincode: '' },
    emergencyContact: { name: '', phone: '', relation: '' },
    alternateGuardianName: '',
    alternateGuardianPhone: '',
  });

  useEffect(() => {
    const c = user?.meta?.class;
    if (c) setForm((f) => ({ ...f, className: c }));
  }, [user?.meta?.class]);

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-enroll-students'],
    queryFn: () => apiCall('/students?limit=100'),
  });

  // Fetch existing report cards to highlight students  
  const { data: rcData } = useQuery({
    queryKey: ['teacher-report-cards-ids'],
    queryFn: () => apiCall('/report-cards'),
  });

  const students: { id: string; name: string; roll: string; class?: string }[] =
    data?.students ?? [];

  // Build set of student IDs that have a report card
  const reportCardStudentIds = new Set<string>(
    (rcData?.reportCards ?? []).map((rc: any) => rc.studentId?.toString())
  );

  const resetForm = () => {
    setForm({
      name: '',
      parentName: '',
      className: user?.meta?.class || '',
      motherName: '',
      fatherName: '',
      roll: '',
      idNumber: '',
      regNumber: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      parentPhone: '',
      admissionDate: '',
      bloodGroup: '',
      previousSchool: '',
      notes: '',
      studentPhone: '',
      motherTongue: '',
      medium: '',
      udiseNumber: '',
      studentEmail: '',
      parentEmail: '',
      studentPassword: '',
      parentPassword: '',
      mailingAddress: { line1: '', line2: '', city: '', state: '', pincode: '' },
      emergencyContact: { name: '', phone: '', relation: '' },
      alternateGuardianName: '',
      alternateGuardianPhone: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const className = (form.className || user?.meta?.class || '').trim();
    if (!form.name?.trim() || !form.parentName?.trim() || !className) {
      toast.error('कृपया नाव, पालक आणि वर्ग भरा');
      return;
    }
    try {
      const payload: EnrollPayload = {
        ...form,
        className,
        roll: form.roll?.trim() || undefined,
        gender: form.gender || undefined,
      };
      const result = await enrollStudent(payload);
      setLastEnrolled({
        name: result.name,
        studentEmail: result.studentEmail,
        studentPassword: result.studentPassword,
        parentEmail: result.parentEmail,
        parentPassword: result.parentPassword,
      });
      qc.invalidateQueries({ queryKey: ['teacher-enroll-students'] });
      setDialogOpen(false);
      resetForm();
      toast.success(`${result.name} यशस्वीरित्या नोंदणी झाली!`);
    } catch {
      toast.error('नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('कॉपी झाले!');
  };

  const classLocked = !!user?.meta?.class;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" onClick={() => setDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" /> नवीन जोडा
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>नवीन विद्यार्थी — संपूर्ण फॉर्म</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>विद्यार्थ्याचे नाव *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>पालकाचे नाव *</Label>
                <Input
                  value={form.parentName}
                  onChange={(e) => setForm((f) => ({ ...f, parentName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>आईचे नाव</Label>
                <Input
                  value={form.motherName || ''}
                  onChange={(e) => setForm((f) => ({ ...f, motherName: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>वडिलांचे नाव</Label>
                <Input
                  value={form.fatherName || ''}
                  onChange={(e) => setForm((f) => ({ ...f, fatherName: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>अनुक्रमांक (रिकामे = आपोआप)</Label>
                <Input
                  value={form.roll || ''}
                  onChange={(e) => setForm((f) => ({ ...f, roll: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>आय.डी. क्रमांक</Label>
                <Input
                  value={form.idNumber || ''}
                  onChange={(e) => setForm((f) => ({ ...f, idNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>नोंदणी क्रमांक</Label>
                <Input
                  value={form.regNumber || ''}
                  onChange={(e) => setForm((f) => ({ ...f, regNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>UDISE क्रमांक</Label>
                <Input
                  value={form.udiseNumber || ''}
                  onChange={(e) => setForm((f) => ({ ...f, udiseNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>वर्ग *</Label>
                <Select
                  value={form.className}
                  onValueChange={(v) => setForm((f) => ({ ...f, className: v }))}
                  disabled={classLocked}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="इयत्ता" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>जन्मतारीख</Label>
                <Input
                  type="date"
                  value={form.dateOfBirth || ''}
                  onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>लिंग</Label>
                <Select
                  value={form.gender || '__none__'}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, gender: v === '__none__' ? '' : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">—</SelectItem>
                    <SelectItem value="male">पुरुष</SelectItem>
                    <SelectItem value="female">स्त्री</SelectItem>
                    <SelectItem value="other">इतर</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>मातृभाषा</Label>
                <Input
                  value={form.motherTongue || ''}
                  onChange={(e) => setForm((f) => ({ ...f, motherTongue: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>माध्यम</Label>
                <Input
                  value={form.medium || ''}
                  onChange={(e) => setForm((f) => ({ ...f, medium: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>रक्तगट</Label>
                <Input
                  value={form.bloodGroup || ''}
                  onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>प्रवेश तारीख</Label>
                <Input
                  type="date"
                  value={form.admissionDate || ''}
                  onChange={(e) => setForm((f) => ({ ...f, admissionDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>पत्ता</Label>
                <Textarea
                  rows={2}
                  value={form.address || ''}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>पालक फोन</Label>
                <Input
                  value={form.parentPhone || ''}
                  onChange={(e) => setForm((f) => ({ ...f, parentPhone: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>विद्यार्थी फोन</Label>
                <Input
                  value={form.studentPhone || ''}
                  onChange={(e) => setForm((f) => ({ ...f, studentPhone: e.target.value }))}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>मागील शाळा</Label>
                <Input
                  value={form.previousSchool || ''}
                  onChange={(e) => setForm((f) => ({ ...f, previousSchool: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>पर्यायी पालक / संरक्षक</Label>
                <Input
                  value={form.alternateGuardianName || ''}
                  onChange={(e) => setForm((f) => ({ ...f, alternateGuardianName: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>त्यांचा फोन</Label>
                <Input
                  value={form.alternateGuardianPhone || ''}
                  onChange={(e) => setForm((f) => ({ ...f, alternateGuardianPhone: e.target.value }))}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-muted-foreground">पत्र पत्ता</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="ओळ 1"
                    value={form.mailingAddress?.line1 || ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        mailingAddress: { ...f.mailingAddress!, line1: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder="ओळ 2"
                    value={form.mailingAddress?.line2 || ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        mailingAddress: { ...f.mailingAddress!, line2: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder="शहर"
                    value={form.mailingAddress?.city || ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        mailingAddress: { ...f.mailingAddress!, city: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder="राज्य"
                    value={form.mailingAddress?.state || ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        mailingAddress: { ...f.mailingAddress!, state: e.target.value },
                      }))
                    }
                  />
                  <Input
                    className="col-span-2"
                    placeholder="पिन कोड"
                    value={form.mailingAddress?.pincode || ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        mailingAddress: { ...f.mailingAddress!, pincode: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>आपत्कालीन संपर्क</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="नाव"
                    value={form.emergencyContact?.name || ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        emergencyContact: { ...f.emergencyContact!, name: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder="फोन"
                    value={form.emergencyContact?.phone || ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        emergencyContact: { ...f.emergencyContact!, phone: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder="नाते"
                    value={form.emergencyContact?.relation || ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        emergencyContact: { ...f.emergencyContact!, relation: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-primary font-semibold">लॉगिन माहिती (ऐच्छिक)</Label>
                <p className="text-xs text-muted-foreground mb-2">रिकामे सोडल्यास प्रणाली आपोआप ईमेल व पासवर्ड तयार करेल</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">विद्यार्थी ईमेल</Label>
                    <Input
                      type="email"
                      placeholder="student@example.com"
                      value={(form as any).studentEmail || ''}
                      onChange={(e) => setForm((f) => ({ ...f, studentEmail: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">विद्यार्थी पासवर्ड</Label>
                    <Input
                      type="text"
                      placeholder="किमान 4 अक्षरे"
                      value={(form as any).studentPassword || ''}
                      onChange={(e) => setForm((f) => ({ ...f, studentPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">पालक ईमेल</Label>
                    <Input
                      type="email"
                      placeholder="parent@example.com (विद्यार्थ्यासारखाच चालेल)"
                      value={(form as any).parentEmail || ''}
                      onChange={(e) => setForm((f) => ({ ...f, parentEmail: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">पालक पासवर्ड</Label>
                    <Input
                      type="text"
                      placeholder="किमान 4 अक्षरे"
                      value={(form as any).parentPassword || ''}
                      onChange={(e) => setForm((f) => ({ ...f, parentPassword: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>टिपा</Label>
                <Textarea
                  rows={2}
                  value={form.notes || ''}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                रद्द
              </Button>
              <Button type="submit">नोंदणी करा</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {lastEnrolled && (
        <div className="portal-card p-4 border-success/30 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium flex items-center gap-2 text-success">
              <CheckCircle2 className="w-4 h-4" /> {lastEnrolled.name} — लॉगिन तपशील
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              विद्यार्थी: {lastEnrolled.studentEmail} / {lastEnrolled.studentPassword}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              पालक: {lastEnrolled.parentEmail} / {lastEnrolled.parentPassword}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              copyToClipboard(
                `Student: ${lastEnrolled.studentEmail} / ${lastEnrolled.studentPassword}\nParent: ${lastEnrolled.parentEmail} / ${lastEnrolled.parentPassword}`
              )
            }
          >
            <Copy className="w-4 h-4 mr-1" /> कॉपी
          </Button>
        </div>
      )}

      <div className="portal-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex justify-between items-center">
          <span className="font-medium text-sm">नोंदणीकृत विद्यार्थी</span>
          <span className="text-xs text-muted-foreground">
            {isLoading ? '…' : `${students.length} एकूण`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left p-3 font-medium text-muted-foreground w-24">रोल</th>
                <th className="text-left p-3 font-medium text-muted-foreground">नाव</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {students.map((s: any) => (
                <tr key={s.id} className={`border-b border-border/50 hover:bg-muted/30 ${reportCardStudentIds.has(s.id) ? 'bg-success/5' : ''}`}>
                  <td className="p-3 text-muted-foreground font-mono">{s.roll}</td>
                  <td className="p-3">
                    <Link
                      to={`/teacher/enroll/${s.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {s.name}
                    </Link>
                    {reportCardStudentIds.has(s.id) && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-success/20 text-success font-medium">✓ प्रगती पुस्तिका</span>
                    )}
                  </td>
                  <td className="p-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link to={`/teacher/enroll/${s.id}`} aria-label="तपशील">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && students.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">अजून कोणतेही विद्यार्थी नाहीत.</p>
          )}
        </div>
      </div>
    </div>
  );
}
