import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { apiCall } from "@/lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("पासवर्ड किमान 6 वर्णांचा असणे आवश्यक आहे");
      return;
    }

    if (password !== confirmPassword) {
      setError("पासवर्ड जुळत नाहीत");
      return;
    }

    if (!token) {
      setError("अवैध रीसेट टोकन");
      return;
    }

    setLoading(true);
    try {
      await apiCall("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      });
      setSuccess(true);
      toast.success("पासवर्ड यशस्वीरित्या रीसेट झाला!");
    } catch (err: any) {
      setError(err.message || "रीसेट टोकन अवैध किंवा कालबाह्य आहे");
      toast.error("पासवर्ड रीसेट अयशस्वी");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl max-w-md w-full text-center"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">अवैध लिंक</h1>
          <p className="text-slate-500 mb-6">
            ही रीसेट लिंक अवैध आहे. कृपया पुन्हा विनंती करा.
          </p>
          <Link to="/login">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
              लॉगिन पृष्ठावर जा
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl max-w-md w-full text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">पासवर्ड रीसेट यशस्वी!</h1>
          <p className="text-slate-500 mb-6">
            आपला पासवर्ड यशस्वीरित्या बदलला गेला आहे. आता आपण नवीन पासवर्डने लॉगिन करू शकता.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            लॉगिन करा
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 px-4 py-10">
      {/* Background orbs */}
      <div className="orb w-[600px] h-[600px] bg-indigo-200/50 top-[-200px] left-[-150px] animate-float-slow" />
      <div className="orb w-[450px] h-[450px] bg-violet-200/35 bottom-[-150px] right-[-120px] animate-float-medium" style={{ animationDelay: '1.8s' }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-indigo-500 to-purple-600" />

        <div className="bg-white/90 backdrop-blur-xl rounded-b-3xl rounded-tr-3xl p-8 shadow-xl shadow-indigo-100/80 border border-white/80">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200/50">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 leading-snug">
              नवीन पासवर्ड सेट करा
            </h1>
            <p className="text-slate-400 text-xs mt-1">आपला नवीन पासवर्ड प्रविष्ट करा</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                नवीन पासवर्ड
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="किमान 6 वर्ण"
                  required
                  minLength={6}
                  className="pl-10 h-11 rounded-xl bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100 pr-11"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                पासवर्ड पुन्हा टाका
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="पासवर्ड पुन्हा टाका"
                  required
                  className="pl-10 h-11 rounded-xl bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100 pr-11"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl gap-2 text-sm font-bold shadow-lg border-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl bg-gradient-to-r from-indigo-500 to-purple-600 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  प्रक्रिया होत आहे...
                </span>
              ) : (
                "पासवर्ड रीसेट करा"
              )}
            </Button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-3 h-3" />
              लॉगिन पृष्ठावर परत जा
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
