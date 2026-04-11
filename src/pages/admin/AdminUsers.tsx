import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { apiCall } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Pencil, Trash2, UserPlus } from 'lucide-react';

type RoleOpt = 'teacher' | 'student' | 'parent';

// Student fields as per the school requirement
type StudentFields = {
  studentName: string;
  idNumber: string;      // आय.डी. क्रमांक
  dateOfBirth: string;   // जन्मतारीख
  regNumber: string;     // नोंदणी क्रमांक
  rollNumber: string;    // रोल नंबर
  fatherName: string;    // वडिलांचे नाव
  motherName: string;    // आईचे नाव
  motherTongue: string;  // मातृभाषा
  medium: string;        // माध्यम
  address: string;       // पत्ता
  studentEmail: string;  // ईमेल
  mobileNumber: string;  // मोबाईल क्रमांक
  udiseNumber: string;   // UDISE क्रमांक
  className: string;
  parentEmail: string;
};

const emptyStudent: StudentFields = {
  studentName: '',
  idNumber: '',
  dateOfBirth: '',
  regNumber: '',
  rollNumber: '',
  fatherName: '',
  motherName: '',
  motherTongue: '',
  medium: '',
  address: '',
  studentEmail: '',
  mobileNumber: '',
  udiseNumber: '',
  className: '',
  parentEmail: '',
};

export default function AdminUsers() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // For teacher/parent creation
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newRole, setNewRole] = useState<RoleOpt>('teacher');
  const [assignedClass, setAssignedClass] = useState('');

  // For student creation
  const [studentFields, setStudentFields] = useState<StudentFields>(emptyStudent);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editActive, setEditActive] = useState(true);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiCall('/admin/users?limit=100'),
  });

  const users: any[] = data?.users ?? [];

  // ALL HOOKS must be called before any conditional returns
  const resetCreate = () => {
    setNewName('');
    setNewEmail('');
    setNewMobile('');
    setAssignedClass('');
    setStudentFields(emptyStudent);
  };

  const createMut = useMutation({
    mutationFn: () => {
      if (newRole === 'student') {
        return apiCall('/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            name: studentFields.studentName,
            email: studentFields.studentEmail,
            role: 'student',
            studentDetails: {
              idNumber: studentFields.idNumber,
              dateOfBirth: studentFields.dateOfBirth,
              regNumber: studentFields.regNumber,
              rollNumber: studentFields.rollNumber,
              fatherName: studentFields.fatherName,
              motherName: studentFields.motherName,
              motherTongue: studentFields.motherTongue,
              medium: studentFields.medium,
              address: studentFields.address,
              mobileNumber: studentFields.mobileNumber,
              udiseNumber: studentFields.udiseNumber,
              className: studentFields.className,
              parentEmail: studentFields.parentEmail,
            },
          }),
        });
      }
      return apiCall('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          mobileNumber: newMobile || undefined,
          ...(newRole === 'teacher' && assignedClass.trim() ? { assignedClass: assignedClass.trim() } : {}),
        }),
      });
    },
    onSuccess: (res: any) => {
      toast.success(
        res?.temporaryPassword
          ? `तयार — तात्पुरता पासवर्ड: ${res.temporaryPassword}`
          : 'वापरकर्ता तयार'
      );
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setCreateOpen(false);
      resetCreate();
    },
    onError: () => toast.error('तयार करणे अयशस्वी'),
  });

  const patchMut = useMutation({
    mutationFn: () =>
      apiCall(`/admin/users/${editUser!.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editName, email: editEmail, isActive: editActive }),
      }),
    onSuccess: () => {
      toast.success('अद्यतन केले');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setEditUser(null);
    },
    onError: () => toast.error('अद्यतन अयशस्वी'),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => apiCall(`/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('हटवले');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message || 'हटवणे अयशस्वी'),
  });

  const sf = (field: keyof StudentFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setStudentFields((prev) => ({ ...prev, [field]: e.target.value }));

  const studentValid =
    studentFields.studentName.trim() &&
    studentFields.studentEmail.trim() &&
    studentFields.className.trim() &&
    studentFields.rollNumber.trim();

  const teacherParentValid = newName.trim() && newEmail.trim();

  // ── Conditional returns AFTER all hooks ──────────────────────────────────────
  if (isLoading) return <div className="text-center py-8">लोड होत आहे...</div>;
  if (error) return <div className="text-center py-8 text-destructive">वापरकर्ते लोड करता आले नाही</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">वापरकर्ते</h1>
          <p className="text-sm text-muted-foreground">नवीन तयार करा, संपादित करा किंवा हटवा</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" /> नवीन वापरकर्ता
        </Button>
      </div>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) resetCreate(); setCreateOpen(o); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>नवीन वापरकर्ता</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Role selector */}
            <div className="space-y-1">
              <Label>भूमिका</Label>
              <Select value={newRole} onValueChange={(v) => { setNewRole(v as RoleOpt); resetCreate(); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">शिक्षक</SelectItem>
                  <SelectItem value="student">विद्यार्थी</SelectItem>
                  <SelectItem value="parent">पालक</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* STUDENT FORM */}
            {newRole === 'student' && (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide py-1 border-b border-border">
                  विद्यार्थी माहिती
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>नाव (Name) *</Label>
                    <Input value={studentFields.studentName} onChange={sf('studentName')} placeholder="विद्यार्थ्याचे नाव" />
                  </div>
                  <div className="space-y-1">
                    <Label>आय.डी. क्रमांक (ID No.)</Label>
                    <Input value={studentFields.idNumber} onChange={sf('idNumber')} placeholder="ID क्रमांक" />
                  </div>
                  <div className="space-y-1">
                    <Label>जन्मतारीख (DOB)</Label>
                    <Input type="date" value={studentFields.dateOfBirth} onChange={sf('dateOfBirth')} />
                  </div>
                  <div className="space-y-1">
                    <Label>नोंदणी क्रमांक (Reg. No.)</Label>
                    <Input value={studentFields.regNumber} onChange={sf('regNumber')} placeholder="नोंदणी क्रमांक" />
                  </div>
                  <div className="space-y-1">
                    <Label>रोल नंबर (Roll No.) *</Label>
                    <Input value={studentFields.rollNumber} onChange={sf('rollNumber')} placeholder="रोल नंबर" />
                  </div>
                  <div className="space-y-1">
                    <Label>इयत्ता (Class) *</Label>
                    <Input value={studentFields.className} onChange={sf('className')} placeholder="उदा. इयत्ता ५-अ" />
                  </div>
                  <div className="space-y-1">
                    <Label>वडिलांचे नाव (Father's Name)</Label>
                    <Input value={studentFields.fatherName} onChange={sf('fatherName')} placeholder="वडिलांचे नाव" />
                  </div>
                  <div className="space-y-1">
                    <Label>आईचे नाव (Mother's Name)</Label>
                    <Input value={studentFields.motherName} onChange={sf('motherName')} placeholder="आईचे नाव" />
                  </div>
                  <div className="space-y-1">
                    <Label>मातृभाषा (Mother Tongue)</Label>
                    <Input value={studentFields.motherTongue} onChange={sf('motherTongue')} placeholder="उदा. मराठी" />
                  </div>
                  <div className="space-y-1">
                    <Label>माध्यम (Medium)</Label>
                    <Input value={studentFields.medium} onChange={sf('medium')} placeholder="उदा. मराठी माध्यम" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label>पत्ता (Address)</Label>
                    <Input value={studentFields.address} onChange={sf('address')} placeholder="पूर्ण पत्ता" />
                  </div>
                  <div className="space-y-1">
                    <Label>ईमेल (विद्यार्थी) *</Label>
                    <Input type="email" value={studentFields.studentEmail} onChange={sf('studentEmail')} placeholder="student@email.com" />
                  </div>
                  <div className="space-y-1">
                    <Label>ईमेल (पालक)</Label>
                    <Input type="email" value={studentFields.parentEmail} onChange={sf('parentEmail')} placeholder="parent@email.com" />
                  </div>
                  <div className="space-y-1">
                    <Label>मोबाईल क्रमांक (Mobile No.)</Label>
                    <Input value={studentFields.mobileNumber} onChange={sf('mobileNumber')} placeholder="१०-अंकी मोबाईल नंबर" />
                  </div>
                  <div className="space-y-1">
                    <Label>UDISE क्रमांक</Label>
                    <Input value={studentFields.udiseNumber} onChange={sf('udiseNumber')} placeholder="UDISE ID" />
                  </div>
                </div>
              </div>
            )}

            {/* TEACHER / PARENT FORM */}
            {newRole !== 'student' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>नाव</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>ईमेल</Label>
                  <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>मोबाईल क्रमांक</Label>
                  <Input
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    placeholder="१०-अंकी मोबाईल नंबर"
                  />
                </div>
                {newRole === 'teacher' && (
                  <div className="space-y-1">
                    <Label>वर्ग (इयत्ता)</Label>
                    <Input
                      placeholder="उदा. इयत्ता ४-ब"
                      value={assignedClass}
                      onChange={(e) => setAssignedClass(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreate(); }}>
              रद्द
            </Button>
            <Button
              onClick={() => createMut.mutate()}
              disabled={
                createMut.isPending ||
                (newRole === 'student' ? !studentValid : !teacherParentValid)
              }
            >
              तयार करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={!!editUser}
        onOpenChange={(o) => {
          if (!o) setEditUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>वापरकर्ता संपादन</DialogTitle>
          </DialogHeader>
          {editUser && (
            <>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>नाव</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>ईमेल</Label>
                  <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editActive} onCheckedChange={setEditActive} id="active" />
                  <Label htmlFor="active">सक्रिय</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditUser(null)}>
                  रद्द
                </Button>
                <Button onClick={() => patchMut.mutate()} disabled={patchMut.isPending}>
                  जतन
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>हटवायचे?</AlertDialogTitle>
            <AlertDialogDescription>
              ही क्रिया परत घेता येत नाही. विद्यार्थी/पालक नोंदणीशी जोडलेल्या वापरकर्त्यांना प्रथम डेटाबेसमधून सोडवा.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>रद्द</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && delMut.mutate(deleteId)}>हटवा</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="portal-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left p-3">नाव</th>
              <th className="text-left p-3">ईमेल</th>
              <th className="text-left p-3">भूमिका</th>
              <th className="text-right p-3 w-28">कृती</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  लोड होत आहे…
                </td>
              </tr>
            )}
            {!isLoading &&
              users.map((u: any) => (
                <tr key={u.id} className="border-b border-border/50">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3">
                    {u.role}
                    {u.meta?.class ? ` · ${u.meta.class}` : ''}
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditUser({ id: u.id, name: u.name, email: u.email });
                        setEditName(u.name);
                        setEditEmail(u.email);
                        setEditActive(u.isActive !== false);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      disabled={u.id === me?.id}
                      onClick={() => setDeleteId(u.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
