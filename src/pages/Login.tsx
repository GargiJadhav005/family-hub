import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GraduationCap, LogIn, BookOpen, Users,
  UserCircle2, Settings2, Eye, EyeOff, ArrowLeft, Mail, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { apiCall } from "@/lib/api";

const roles: { role: UserRole; label: string; icon: React.ElementType; grad: string }[] = [
  { role: 'teacher',  label: 'शिक्षक',     icon: BookOpen,    grad: 'from-blue-500 to-indigo-600' },
  { role: 'parent',   label: 'पालक',       icon: Users,       grad: 'from-emerald-500 to-teal-600' },
  { role: 'student',  label: 'विद्यार्थी', icon: UserCircle2, grad: 'from-violet-500 to-purple-600' },
  { role: 'admin',    label: 'व्यवस्थापक', icon: Settings2,   grad: 'from-slate-500 to-slate-700' },
];

export default function Login() {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get("role") as UserRole) || "teacher";

  const [role, setRole]         = useState<UserRole>(defaultRole);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  
  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();
  const activeRole = roles.find(r => r.role === role)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password, role);
    setLoading(false);
    if (success) {
      toast.success("यशस्वीरित्या लॉगिन झाले!");
      const map: Record<UserRole, string> = {
        teacher: '/teacher', parent: '/parent', student: '/student', admin: '/admin',
      };
      navigate(map[role]);
    } else {
      toast.error("चुकीचा ईमेल किंवा पासवर्ड");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("कृपया ईमेल पत्ता प्रविष्ट करा");
      return;
    }
    
    setForgotLoading(true);
    try {
      await apiCall("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: forgotEmail }),
      });
      toast.success("पासवर्ड रीसेट लिंक पाठवली गेली आहे");
      setForgotOpen(false);
      setForgotEmail("");
    } catch (err) {
      toast.error("काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 px-4 py-10">

      {/* ── Floating orbs (light palette) ── */}
      <div className="orb w-[600px] h-[600px] bg-indigo-200/50 top-[-200px] left-[-150px] animate-float-slow" />
      <div className="orb w-[450px] h-[450px] bg-violet-200/35 bottom-[-150px] right-[-120px] animate-float-medium" style={{ animationDelay: '1.8s' }} />
      <div className="orb w-[250px] h-[250px] bg-blue-200/30 top-[35%] right-[5%] animate-drift" style={{ animationDelay: '0.9s' }} />
      <div className="orb w-[180px] h-[180px] bg-indigo-100/50 bottom-[20%] left-[8%] animate-float-fast" style={{ animationDelay: '2.5s' }} />

      {/* ── Subtle dot texture ── */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.08) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Dynamic thin top-bar matching active role */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            className={`h-1 w-full rounded-t-3xl bg-gradient-to-r ${activeRole.grad}`}
            initial={{ scaleX: 0.6, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0.6, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        <div className="bg-white/90 backdrop-blur-xl rounded-b-3xl rounded-tr-3xl p-8 shadow-xl shadow-indigo-100/80 border border-white/80">

          {/* Logo + school name */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeRole.grad} flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200/50 transition-all duration-500`}>
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 leading-snug">
              वैनतेय प्राथमिक विद्या मंदिर
            </h1>
            <p className="text-slate-400 text-xs mt-1">पोर्टलमध्ये आपले स्वागत आहे</p>
          </div>

          {/* Role pills */}
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-7">
            {roles.map((r) => {
              const Icon = r.icon;
              const active = role === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setRole(r.role)}
                  className={`relative flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-semibold transition-all duration-250 ${
                    active ? 'text-white' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-pill"
                      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${r.grad} opacity-90`}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                ईमेल पत्ता
              </label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="h-11 rounded-xl bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100 transition-all duration-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  पासवर्ड
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-[11px] text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  विसरलात?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-xl bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100 transition-all duration-200 pr-11"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full h-11 rounded-xl gap-2 text-sm font-bold shadow-lg border-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl bg-gradient-to-r ${activeRole.grad} mt-2`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  लॉगिन होत आहे...
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {activeRole.label} म्हणून लॉगिन
                </>
              )}
            </Button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-3 h-3" />
              मुख्यपृष्ठावर परत जा
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800">पासवर्ड विसरलात?</DialogTitle>
            <DialogDescription className="text-slate-500">
              आपला ईमेल पत्ता प्रविष्ट करा. आम्ही आपल्याला पासवर्ड रीसेट लिंक पाठवू.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="pl-10 h-11 rounded-xl bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setForgotOpen(false)}
                className="flex-1 h-11 rounded-xl"
              >
                रद्द करा
              </Button>
              <Button
                type="submit"
                disabled={forgotLoading}
                className={`flex-1 h-11 rounded-xl gap-2 bg-gradient-to-r ${activeRole.grad}`}
              >
                {forgotLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "लिंक पाठवा"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
