import { useState } from "react";
import { KeyRound, LogOut, Pencil, RotateCcw } from "lucide-react";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-[#1E293B] last:border-b-0">
      <span className="font-mono text-[11px] uppercase tracking-wide text-slate-500 pt-0.5">
        {label}
      </span>
      <span className="text-right text-sm text-white max-w-[60%] break-words">
        {value || <span className="text-slate-500">—</span>}
      </span>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#1E293B]/30 p-3">
      <div className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

export default function ProfileScreen({
  profile,
  stats,
  hasBriefMatePassword = false,
  onEdit,
  onReset,
  onLogout,
  onSetPassword = async () => {},
}) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [briefMatePassword, setBriefMatePassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const passwordActionLabel = hasBriefMatePassword
    ? "Update BriefMate password"
    : "Set BriefMate password";
  const passwordSuccessMessage = hasBriefMatePassword
    ? "BriefMate password updated. Your Google password stays unchanged."
    : "BriefMate password set. You can now sign in with email and password.";

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordNotice("");

    if (briefMatePassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setPasswordSaving(true);
    try {
      await onSetPassword(briefMatePassword);
      setBriefMatePassword("");
      setShowPasswordForm(false);
      setPasswordNotice(passwordSuccessMessage);
    } catch (error) {
      setPasswordError(error?.message || "Unable to set BriefMate password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your developer brief settings
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#1E293B] bg-[#1E293B]/30 p-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#3B82F6]/20 text-[#3B82F6] font-bold text-lg">
            {(profile?.role?.[0] || "D").toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-white">
              {profile?.role || "Developer"}
            </div>
            <div className="text-xs text-slate-400">
              {profile?.skillLevel || "—"}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <StatCard label="Decoded" value={stats.decoded} accent="#3B82F6" />
          <StatCard label="Saved" value={stats.saved} accent="#10B981" />
          <StatCard label="Useful" value={stats.useful} accent="#60A5FA" />
        </div>

        <div className="mt-5 rounded-2xl border border-[#1E293B] bg-[#1E293B]/30 p-4">
          <Row label="Skill Level" value={profile?.skillLevel} />
          <Row label="Role" value={profile?.role} />
          <Row label="Current Project" value={profile?.currentProject} />
          <Row label="Learning Goal" value={profile?.learningGoal} />
          <Row label="Deadline" value={profile?.deadline} />
        </div>

        <div className="mt-4 rounded-2xl border border-[#1E293B] bg-[#1E293B]/30 p-4">
          <div className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
            Tech Stack
          </div>
          {profile?.stack?.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.stack.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-[#1E293B] bg-[#0F1117] px-2 py-0.5 font-mono text-[11px] text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No stack selected.</p>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-[#1E293B] bg-[#1E293B]/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                Account Security
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Create or update a BriefMate password. Your Google password
                stays unchanged.
              </p>
            </div>
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/15 text-[#93C5FD]">
              <KeyRound className="h-4 w-4" />
            </div>
          </div>

          {passwordNotice ? (
            <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {passwordNotice}
            </p>
          ) : null}

          {showPasswordForm ? (
            <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
              <div>
                <label
                  htmlFor="briefmate-password"
                  className="font-mono text-[11px] uppercase tracking-wide text-slate-500"
                >
                  New BriefMate password
                </label>
                <input
                  id="briefmate-password"
                  type="password"
                  value={briefMatePassword}
                  onChange={(event) => setBriefMatePassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#1E293B] bg-[#0F1117] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-[#3B82F6]"
                  placeholder="At least 8 characters"
                />
              </div>

              {passwordError ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {passwordError}
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#3B82F6] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordSaving ? "Saving..." : "Save password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setBriefMatePassword("");
                    setPasswordError("");
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#1E293B] bg-transparent px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-[#1E293B]/40"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(true);
                setPasswordNotice("");
              }}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1E293B] bg-transparent py-3 font-semibold text-slate-200 transition-colors hover:bg-[#1E293B]/40"
            >
              <KeyRound className="h-4 w-4" />
              {passwordActionLabel}
            </button>
          )}
        </div>

        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={onEdit}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-3 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1E293B] bg-transparent hover:bg-[#1E293B]/40 text-slate-300 font-semibold py-3 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Preferences
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 text-red-200 font-semibold py-3 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
