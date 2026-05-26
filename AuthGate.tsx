import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ShieldCheck, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoSrc from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Mode = 'signin' | 'signup' | 'reset';

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

const evaluatePassword = (pw: string): PasswordStrength => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map: PasswordStrength[] = [
    { score: 0, label: 'Too short', color: 'bg-red-500' },
    { score: 1, label: 'Weak', color: 'bg-orange-500' },
    { score: 2, label: 'Fair', color: 'bg-yellow-500' },
    { score: 3, label: 'Strong', color: 'bg-lime-500' },
    { score: 4, label: 'Excellent', color: 'bg-green-500' },
  ];
  return map[score];
};

const AuthGate = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const strength = evaluatePassword(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (mode === 'reset') {
      if (!email) return toast.error('Enter your email to reset.');
      setSubmitting(true);
      const { error } = await resetPassword(email);
      setSubmitting(false);
      if (error) return toast.error(error);
      toast.success('Password reset link sent. Check your inbox.');
      setMode('signin');
      return;
    }

    if (!email || !password) {
      toast.error('Email and password are required.');
      return;
    }

    if (mode === 'signup') {
      if (!agree) return toast.error('Please accept the Terms to continue.');
      if (strength.score < 2) return toast.error('Please choose a stronger password.');
      setSubmitting(true);
      const { error, needsConfirmation } = await signUp(email, password, displayName || undefined);
      setSubmitting(false);
      if (error) return toast.error(error);
      if (needsConfirmation) {
        setSignupSuccess(true);
        toast.success('Account created! Check your email to confirm.');
      } else {
        toast.success('Welcome to GaGa Chat!');
      }
      return;
    }

    // signin
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) return toast.error(error);
    toast.success('Welcome back!');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#05070a]">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-[#00FF7F] opacity-20 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-[24rem] h-[24rem] rounded-full bg-[#00C853] opacity-25 blur-[110px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute -bottom-32 left-1/3 w-[22rem] h-[22rem] rounded-full bg-[#22D3EE] opacity-15 blur-[120px] animate-pulse" style={{ animationDelay: '0.8s' }} />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-5 py-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center mb-7"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#00FF7F] blur-2xl opacity-50 animate-pulse" />
            <img
              src={logoSrc}
              alt="GaGa Chat"
              className="relative w-24 h-24 rounded-full object-cover ring-2 ring-[#00FF7F]/60 shadow-[0_0_60px_-10px_rgba(0,255,127,0.7)]"
            />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white">
            GaGa <span className="text-[#00FF7F]">Chat</span>
          </h1>
          <p className="mt-1 text-sm text-white/50">Encrypted. Effortless. Always at your side.</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
        >
          {/* Tabs */}
          {mode !== 'reset' && (
            <div className="grid grid-cols-2 mb-6 p-1 rounded-2xl bg-black/40 border border-white/5">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`relative py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  mode === 'signin' ? 'text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                {mode === 'signin' && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00FF7F] to-[#22D3EE]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`relative py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  mode === 'signup' ? 'text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                {mode === 'signup' && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00FF7F] to-[#22D3EE]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">Create Account</span>
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {signupSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6"
              >
                <CheckCircle2 size={56} className="mx-auto text-[#00FF7F] mb-3" />
                <h3 className="text-white text-xl font-bold mb-2">Confirm your email</h3>
                <p className="text-white/60 text-sm mb-6">
                  We sent a confirmation link to <span className="text-white font-medium">{email}</span>.
                  Click it to activate your GaGa Chat account.
                </p>
                <button
                  onClick={() => {
                    setSignupSuccess(false);
                    setMode('signin');
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00FF7F] to-[#22D3EE] text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Back to Sign In
                </button>
              </motion.div>
            ) : (
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {mode === 'reset' && (
                  <div className="text-center mb-2">
                    <h3 className="text-white text-lg font-bold">Reset your password</h3>
                    <p className="text-white/50 text-xs mt-1">We'll email you a secure reset link.</p>
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Display name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 text-sm outline-none focus:border-[#00FF7F]/60 focus:ring-2 focus:ring-[#00FF7F]/20 transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 text-sm outline-none focus:border-[#00FF7F]/60 focus:ring-2 focus:ring-[#00FF7F]/20 transition"
                    />
                  </div>
                </div>

                {mode !== 'reset' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-white/60">Password</label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => setMode('reset')}
                          className="text-xs text-[#00FF7F] hover:underline"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 text-sm outline-none focus:border-[#00FF7F]/60 focus:ring-2 focus:ring-[#00FF7F]/20 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {mode === 'signup' && password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 h-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`flex-1 rounded-full transition-colors ${
                                i < strength.score ? strength.color : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-1 text-[11px] text-white/50">
                          Strength: <span className="text-white/80 font-medium">{strength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'signup' && (
                  <label className="flex items-start gap-2.5 text-xs text-white/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-[#00FF7F] cursor-pointer"
                    />
                    <span>
                      I agree to the{' '}
                      <span className="text-[#00FF7F] hover:underline">Terms of Service</span> and{' '}
                      <span className="text-[#00FF7F] hover:underline">Privacy Policy</span>.
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00FF7F] to-[#22D3EE] text-black font-bold text-sm overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition active:scale-[0.99] shadow-[0_10px_30px_-10px_rgba(0,255,127,0.6)]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Please wait...
                      </>
                    ) : (
                      <>
                        {mode === 'signin' && 'Sign In Securely'}
                        {mode === 'signup' && 'Create My Account'}
                        {mode === 'reset' && 'Send Reset Link'}
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </span>
                </button>

                {mode === 'reset' && (
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="w-full text-center text-xs text-white/60 hover:text-white pt-1"
                  >
                    ← Back to sign in
                  </button>
                )}

                {/* Trust strip */}
                <div className="flex items-center justify-center gap-2 pt-3 text-[11px] text-white/40">
                  <ShieldCheck size={13} className="text-[#00FF7F]" />
                  <span>End-to-end encrypted • Powered by Supabase</span>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="mt-6 text-center text-[11px] text-white/30">
          © {new Date().getFullYear()} GaGa Chat. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthGate;
