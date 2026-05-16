import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import Chip from "./Chip";
import {
  SKILL_LEVELS,
  ROLES,
  TECH_STACK_OPTIONS,
  LEARNING_GOALS,
  DEADLINES,
} from "../../data/signals";

export default function ProfileSetupScreen({ initial, onComplete, onBack }) {
  const [step, setStep] = useState(1);
  const [skillLevel, setSkillLevel] = useState(initial?.skillLevel || "");
  const [role, setRole] = useState(initial?.role || "");
  const [stack, setStack] = useState(initial?.stack || []);
  const [currentProject, setCurrentProject] = useState(
    initial?.currentProject || "",
  );
  const [learningGoal, setLearningGoal] = useState(initial?.learningGoal || "");
  const [deadline, setDeadline] = useState(initial?.deadline || "");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleStack = (item) => {
    setStack((s) =>
      s.includes(item) ? s.filter((x) => x !== item) : [...s, item],
    );
  };

  const canContinue =
    (step === 1 && skillLevel && role) ||
    (step === 2 && stack.length > 0) ||
    (step === 3 && learningGoal && deadline);

  const handleNext = async () => {
    setSubmitError("");
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    try {
      await onComplete?.({
        skillLevel,
        role,
        stack,
        currentProject,
        learningGoal,
        deadline,
      });
    } catch (error) {
      setSubmitError(error?.message || "Unable to save preferences.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack?.();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1117]">
      <header className="sticky top-0 z-10 px-5 pt-5 pb-3 bg-[#0F1117]/95 backdrop-blur border-b border-[#1E293B]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B]"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-mono text-xs text-slate-400">
              Step {step} of 3
            </span>
            <div className="w-7" />
          </div>
          <div className="mt-3 flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-[#3B82F6]" : "bg-[#1E293B]"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 px-5 py-6">
        <div className="max-w-md mx-auto">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white">About You</h2>
              <p className="mt-1 text-sm text-slate-400">
                Tell us where you are in your journey.
              </p>

              <div className="mt-6">
                <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                  Skill Level
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SKILL_LEVELS.map((lvl) => (
                    <Chip
                      key={lvl}
                      active={skillLevel === lvl}
                      onClick={() => setSkillLevel(lvl)}
                    >
                      {lvl}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                  Role
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <Chip
                      key={r}
                      active={role === r}
                      onClick={() => setRole(r)}
                    >
                      {r}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white">Your Stack</h2>
              <p className="mt-1 text-sm text-slate-400">
                Pick the tools you actually use. We'll filter signals to match.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {TECH_STACK_OPTIONS.map((item) => (
                  <Chip
                    key={item}
                    active={stack.includes(item)}
                    onClick={() => toggleStack(item)}
                  >
                    {item}
                  </Chip>
                ))}
              </div>

              <p className="mt-4 font-mono text-[11px] text-slate-500">
                {stack.length} selected
              </p>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white">Your Goal</h2>
              <p className="mt-1 text-sm text-slate-400">
                What are you building and by when?
              </p>

              <div className="mt-6">
                <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                  Current Project
                </label>
                <input
                  type="text"
                  value={currentProject}
                  onChange={(e) => setCurrentProject(e.target.value)}
                  placeholder="e.g. AI study buddy app"
                  className="mt-2 w-full rounded-xl border border-[#1E293B] bg-[#1E293B]/40 px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>

              <div className="mt-6">
                <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                  Learning Goal
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LEARNING_GOALS.map((g) => (
                    <Chip
                      key={g}
                      active={learningGoal === g}
                      onClick={() => setLearningGoal(g)}
                    >
                      {g}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                  Deadline
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DEADLINES.map((d) => (
                    <Chip
                      key={d}
                      active={deadline === d}
                      onClick={() => setDeadline(d)}
                    >
                      {d}
                    </Chip>
                  ))}
                </div>
              </div>

              {submitError ? (
                <div
                  role="alert"
                  className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
                >
                  <p className="font-semibold">Unable to save preferences.</p>
                  <p className="mt-1 leading-6">{submitError}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <footer
        className="sticky bottom-0 px-5 py-4 bg-[#0F1117]/95 backdrop-blur border-t border-[#1E293B]"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
      >
        <div className="max-w-md mx-auto">
          <button
            type="button"
            disabled={!canContinue || submitting}
            onClick={handleNext}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#1E293B] disabled:text-slate-500 text-white font-semibold py-3.5 transition-colors"
          >
            {step === 3 ? (
              <>
                <Sparkles className="h-4 w-4" />
                {submitting ? "Saving..." : "Build My Brief"}
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
