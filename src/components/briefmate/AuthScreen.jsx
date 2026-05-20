import { useState } from 'react';
import { Mail, Lock, Chrome, ArrowRight } from 'lucide-react';
import useAuth from '../../utils/useAuth';

function validateCredentials(email, password) {
  if (!email.trim()) return 'Email is required';
  if (!email.includes('@')) return 'Enter a valid email address';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return '';
}

export default function AuthScreen() {
  const { signInWithCredentials, signUpWithCredentials, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const isSignUp = mode === 'signup';
  const pageTitle = isSignUp ? 'Create your BriefMate account' : 'Welcome back to BriefMate';
  const pageDescription = isSignUp
    ? 'Start saving your profile, decoded signals, and useful updates across devices.'
    : 'Sign in to sync your profile, saved signals, and decoded history across devices.';

  const handleCredentials = async (event) => {
    event.preventDefault();
    const validationError = validateCredentials(email, password);
    if (validationError) {
      setError(validationError);
      setNotice('');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');
    try {
      const action = isSignUp ? signUpWithCredentials : signInWithCredentials;
      await action({ email: email.trim(), password });
      if (isSignUp) {
        setMode('signin');
        setPassword('');
        setNotice('Account created. Sign in with your new account.');
      }
    } catch (err) {
      setError(err?.message || (isSignUp ? 'Unable to create your account' : 'Unable to sign in with those details'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    setNotice('');
    try {
      await signInWithGoogle();
    } catch {
      setError('Unable to start Google sign in');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F1117] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <div className="rounded-[2rem] border border-[#1E293B] bg-[#111827]/80 p-6 shadow-2xl shadow-black/30">
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{pageDescription}</p>

          <form className="mt-6 space-y-3" onSubmit={handleCredentials}>
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Email</span>
              <span className="mt-1.5 flex items-center gap-2 rounded-2xl border border-[#1E293B] bg-[#0F1117] px-3.5 py-3 focus-within:border-[#3B82F6]">
                <Mail className="h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  autoComplete="email"
                />
              </span>
            </label>

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-wide text-slate-500">Password</span>
              <span className="mt-1.5 flex items-center gap-2 rounded-2xl border border-[#1E293B] bg-[#0F1117] px-3.5 py-3 focus-within:border-[#3B82F6]">
                <Lock className="h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
              </span>
            </label>

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {notice ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                {notice}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3B82F6] py-3.5 font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:bg-[#1E293B] disabled:text-slate-500"
            >
              {isSignUp ? 'Create account' : 'Sign in with email'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#1E293B]" />
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-600">or</span>
            <div className="h-px flex-1 bg-[#1E293B]" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1E293B] bg-transparent py-3.5 font-semibold text-slate-200 transition-colors hover:bg-[#1E293B]/50 disabled:cursor-not-allowed disabled:text-slate-600"
          >
            <Chrome className="h-4 w-4" />
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
              setNotice('');
            }}
            className="mt-5 w-full text-center text-sm text-slate-400 hover:text-white"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Create one'}
          </button>
        </div>
      </div>
    </main>
  );
}
