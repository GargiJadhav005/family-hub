import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';

type StudentRow = Record<string, unknown>;

export default function TeacherEnrollDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-detail', studentId],
    queryFn: () => apiCall(`/students/${studentId}`),
    enabled: !!studentId,
  });

  const student = (data?.student ?? null) as StudentRow | null;

  const [form, setForm] = useState({
    name: '',
    roll: '',
    idNumber: '',
    regNumber: '',
    className: '',
    parentName: '',
    motherName: '',
    fatherName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    studentPhone: '',
    parentPhone: '',
    admissionDate: '',
    bloodGroup: '',
    previousSchool: '',
    alternateGuardianName: '',
    alternateGuardianPhone: '',
    notes: '',
    mailLine1: '',
    mailLine2: '',
    mailCity: '',
    mailState: '',
    mailPin: '',
    emergName: '',
    emergPhone: '',
    emergRelation: '',
    motherTongue: '',
    medium: '',
    udiseNumber: '',
  });

  useEffect(() => {
    if (!student) return;
    const m = (student.mailingAddress as Record<string, string>) || {};
    const e = (student.emergencyContact as Record<string, string>) || {};
    setForm({
      name: String(student.name ?? ''),
      roll: String(student.roll ?? ''),
      idNumber: String(student.idNumber ?? ''),
      regNumber: String(student.regNumber ?? ''),
      className: String(student.class ?? student.className ?? ''),
      parentName: String(student.parentName ?? ''),
      motherName: String(student.motherName ?? ''),
      fatherName: String(student.fatherName ?? ''),
      dateOfBirth: String(student.dateOfBirth ?? ''),
      gender: String(student.gender ?? ''),
      address: String(student.address ?? ''),
      studentPhone: String(student.studentPhone ?? ''),
      parentPhone: String(student.parentPhone ?? ''),
      admissionDate: String(student.admissionDate ?? ''),
      bloodGroup: String(student.bloodGroup ?? ''),
      previousSchool: String(student.previousSchool ?? ''),
      alternateGuardianName: String(student.alternateGuardianName ?? ''),
      alternateGuardianPhone: String(student.alternateGuardianPhone ?? ''),
      notes: String(student.notes ?? ''),
      mailLine1: m.line1 || '',
      mailLine2: m.line2 || '',
      mailCity: m.city || '',
      mailState: m.state || '',
      mailPin: m.pincode || '',
      emergName: e.name || '',
      emergPhone: e.phone || '',
      emergRelation: e.relation || '',
      motherTongue: String(student.motherTongue ?? ''),
      medium: String(student.medium ?? ''),
      udiseNumber: String(student.udiseNumber ?? ''),
    });
  }, [student]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiCall(`/students/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          roll: form.roll,
          idNumber: form.idNumber,
          regNumber: form.regNumber,
          className: form.className,
          parentName: form.parentName,
          motherName: form.motherName,
          fatherName: form.fatherName,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender || '',
          address: form.address,
          studentPhone: form.studentPhone,
          parentPhone: form.parentPhone,
          admissionDate: form.admissionDate,
          bloodGroup: form.bloodGroup,
          previousSchool: form.previousSchool,
          alternateGuardianName: form.alternateGuardianName,
          alternateGuardianPhone: form.alternateGuardianPhone,
          notes: form.notes,
          motherTongue: form.motherTongue,
          medium: form.medium,
          udiseNumber: form.udiseNumber,
          mailingAddress: {
            line1: form.mailLine1,
            line2: form.mailLine2,
            city: form.mailCity,
            state: form.mailState,
            pincode: form.mailPin,
          },
          emergencyContact: {
            name: form.emergName,
            phone: form.emergPhone,
            relation: form.emergRelation,
          },
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-detail', studentId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-enroll-students'] });
      toast.success('माहिती जतन केली');
    },
    onError: () => toast.error('जतन अयशस्वी'),
  });

  if (!studentId) {
    return <p className="text-sm text-muted-foreground">विद्यार्थी निवडा.</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">लोड होत आहे…</p>;
  }

  if (error || !student) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">विद्यार्थी सापडला नाही.</p>
        <Button variant="outline" asChild>
          <Link to="/teacher/enroll">
            <ArrowLeft className="w-4 h-4 mr-2" /> परत
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/teacher/enroll">
            <ArrowLeft className="w-4 h-4 mr-2" /> यादी
          </Link>
        </Button>
        <h1 className="text-xl font-bold">{form.name || 'विद्यार्थी तपशील'}</h1>
      </div>

      <div className="portal-card p-6 space-y-4">
        <h3 className="font-semibold">संपूर्ण नोंदणी माहिती</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>नाव</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>अनुक्रमांक</Label>
            <Input value={form.roll} onChange={(e) => setForm((f) => ({ ...f, roll: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>आय.डी. क्रमांक</Label>
            <Input value={form.idNumber} onChange={(e) => setForm((f) => ({ ...f, idNumber: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>नोंदणी क्रमांक</Label>
            <Input value={form.regNumber} onChange={(e) => setForm((f) => ({ ...f, regNumber: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>UDISE क्रमांक</Label>
            <Input value={form.udiseNumber} onChange={(e) => setForm((f) => ({ ...f, udiseNumber: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>इयत्ता</Label>
            <Input value={form.className} onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>पालकाचे नाव</Label>
            <Input value={form.parentName} onChange={(e) => setForm((f) => ({ ...f, parentName: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>आईचे नाव</Label>
            <Input value={form.motherName} onChange={(e) => setForm((f) => ({ ...f, motherName: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>वडिलांचे नाव</Label>
            <Input value={form.fatherName} onChange={(e) => setForm((f) => ({ ...f, fatherName: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>जन्मतारीख</Label>
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>लिंग (male / female / other / रिकामे)</Label>
            <Input value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>मातृभाषा</Label>
            <Input value={form.motherTongue} onChange={(e) => setForm((f) => ({ ...f, motherTongue: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>माध्यम</Label>
            <Input value={form.medium} onChange={(e) => setForm((f) => ({ ...f, medium: e.target.value }))} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>पत्ता</Label>
            <Textarea rows={2} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>विद्यार्थी फोन</Label>
            <Input value={form.studentPhone} onChange={(e) => setForm((f) => ({ ...f, studentPhone: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>पालक फोन</Label>
            <Input value={form.parentPhone} onChange={(e) => setForm((f) => ({ ...f, parentPhone: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>प्रवेश तारीख</Label>
            <Input
              type="date"
              value={form.admissionDate}
              onChange={(e) => setForm((f) => ({ ...f, admissionDate: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>रक्तगट</Label>
            <Input value={form.bloodGroup} onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>मागील शाळा</Label>
            <Input
              value={form.previousSchool}
              onChange={(e) => setForm((f) => ({ ...f, previousSchool: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>पर्यायी पालक नाव</Label>
            <Input
              value={form.alternateGuardianName}
              onChange={(e) => setForm((f) => ({ ...f, alternateGuardianName: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>पर्यायी पालक फोन</Label>
            <Input
              value={form.alternateGuardianPhone}
              onChange={(e) => setForm((f) => ({ ...f, alternateGuardianPhone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>टिपा</Label>
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>

        <h4 className="font-medium text-sm text-muted-foreground pt-2">पत्र पत्ता</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Input placeholder="ओळ 1" value={form.mailLine1} onChange={(e) => setForm((f) => ({ ...f, mailLine1: e.target.value }))} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Input placeholder="ओळ 2" value={form.mailLine2} onChange={(e) => setForm((f) => ({ ...f, mailLine2: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Input placeholder="शहर" value={form.mailCity} onChange={(e) => setForm((f) => ({ ...f, mailCity: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Input placeholder="राज्य" value={form.mailState} onChange={(e) => setForm((f) => ({ ...f, mailState: e.target.value }))} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Input placeholder="पिन" value={form.mailPin} onChange={(e) => setForm((f) => ({ ...f, mailPin: e.target.value }))} />
          </div>
        </div>

        <h4 className="font-medium text-sm text-muted-foreground pt-2">आपत्कालीन संपर्क</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Input placeholder="नाव" value={form.emergName} onChange={(e) => setForm((f) => ({ ...f, emergName: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Input placeholder="फोन" value={form.emergPhone} onChange={(e) => setForm((f) => ({ ...f, emergPhone: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Input
              placeholder="नाते"
              value={form.emergRelation}
              onChange={(e) => setForm((f) => ({ ...f, emergRelation: e.target.value }))}
            />
          </div>
        </div>

        {(student.studentEmail || student.parentEmail) && (
          <div className="rounded-lg bg-secondary/40 p-4 text-sm space-y-1">
            <p className="font-medium">लॉगिन ईमेल (फक्त संदर्भ)</p>
            {student.studentEmail != null && (
              <p className="font-mono text-xs">विद्यार्थी: {String(student.studentEmail)}</p>
            )}
            {student.parentEmail != null && (
              <p className="font-mono text-xs">पालक: {String(student.parentEmail)}</p>
            )}
          </div>
        )}

        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="w-4 h-4 mr-2" /> जतन करा
        </Button>
      </div>
    </div>
  );
}
