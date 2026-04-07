import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, LogIn } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const roleTabs: { role: UserRole; label: string; emoji: string }[] = [
  { role: 'teacher', label: 'शिक्षक', emoji: '👨‍🏫' },
  { role: 'parent', label: 'पालक', emoji: '👪' },
  { role: 'student', label: 'विद्यार्थी', emoji: '🎒' },
  { role: 'admin', label: 'व्यवस्थापक', emoji: '⚙️' },
];

export default function Login() {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get("role") as UserRole) || "teacher";

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(email, password, role);
    setLoading(false);

    if (success) {
      toast.success("यशस्वीरित्या लॉगिन झाले!");
      const redirectMap: Record<UserRole, string> = {
        teacher: '/teacher',
        parent: '/parent',
        student: '/student',
        admin: '/admin',
      };
      navigate(redirectMap[role]);
    } else {
      toast.error("चुकीचा ईमेल किंवा पासवर्ड");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                वैनतेय प्राथमिक विद्या मंदिर
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                शालेय पोर्टलमध्ये लॉगिन करा
              </p>
            </div>
          </Link>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-7 backdrop-blur">
          {/* Role Toggle */}
          <div className="grid grid-cols-4 gap-1.5 mb-6">
            {roleTabs.map((tab) => (
              <button
                key={tab.role}
                type="button"
                onClick={() => setRole(tab.role)}
                className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-xs font-medium transition-all ${
                  role === tab.role
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:bg-muted border border-transparent"
                }`}
              >
                <span className="text-base">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">ईमेल</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">पासवर्ड</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl gap-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  लॉगिन होत आहे...
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> लॉगिन करा
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition">
            ← मुख्यपृष्ठावर परत जा
          </Link>
        </p>
      </motion.div>
    </div>
  );
}