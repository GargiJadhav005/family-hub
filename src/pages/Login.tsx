import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const roleTabs: { role: UserRole; label: string }[] = [
  { role: 'teacher', label: 'शिक्षक' },
  { role: 'parent', label: 'पालक' },
  { role: 'student', label: 'विद्यार्थी' },
  { role: 'admin', label: 'व्यवस्थापक' },
];

const demoMap: Record<UserRole, { email: string; password: string }> = {
  teacher: { email: 'teacher@school.edu', password: 'teacher123' },
  parent: { email: 'parent@school.edu', password: 'parent123' },
  student: { email: 'student@school.edu', password: 'student123' },
  admin: { email: 'admin@school.edu', password: 'admin123' },
};

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

  const demoCredentials = demoMap[role];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                वैनतेय प्राथमिक विद्या मंदिर
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                शालेय पोर्टलमध्ये लॉगिन करा
              </p>
            </div>
          </Link>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-8 backdrop-blur">
          {/* Role Toggle */}
          <div className="flex mb-6 rounded-xl bg-muted p-1">
            {roleTabs.map((tab) => (
              <button
                key={tab.role}
                type="button"
                onClick={() => setRole(tab.role)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  role === tab.role
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>ईमेल</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>पासवर्ड</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
              {loading ? "लॉगिन होत आहे..." : "लॉगिन करा"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-xs text-muted-foreground">
            <p className="mb-2 font-medium">
              डेमो लॉगिन ({roleTabs.find(t => t.role === role)?.label})
            </p>
            <p>Email: <span className="font-mono">{demoCredentials.email}</span></p>
            <p>Password: <span className="font-mono">{demoCredentials.password}</span></p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 px-0 text-xs"
              onClick={() => {
                setEmail(demoCredentials.email);
                setPassword(demoCredentials.password);
              }}
            >
              डेमो क्रेडेन्शियल्स भरा →
            </Button>
          </div>
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
