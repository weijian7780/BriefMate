import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import Chip from "./Chip";
import {
  SKILL_LEVELS,
  ROLES,
  TECH_STACK_OPTIONS,
  LEARNING_GOALS,
  DEADLINES,
  SIGNAL_TYPE_OPTIONS,
  MUTED_TOPIC_OPTIONS,
  PROJECT_STAGES,
  ACTION_STYLES,
} from "../../data/signals";

export default function ProfileSetupScreen({ initial, onComplete, onBack }) {
  const [step, setStep] = useState(1);
  const [skillLevel, setSkillLevel] = useState(initial?.skillLevel || "");
  const [role, setRole] = useState(initial?.role || "");
  const [stack, setStack] = useState(initial?.stack || []);
  const [primaryStack, setPrimaryStack] = useState(
    initial?.primaryStack?.length
      ? initial.primaryStack
      : (initial?.stack || []).slice(0, 3),
  );
  const [signalPreferences, setSignalPreferences] = useState(
    initial?.signalPreferences || [],
  );
  const [mutedTopics, setMutedTopics] = useState(initial?.mutedTopics || []);
  const [currentProject, setCurrentProject] = useState(
    initial?.currentProject || "",
  );
  const [learningGoal, setLearningGoal] = useState(initial?.learningGoal || "");
  const [deadline, setDeadline] = useState(initial?.deadline || "");
  const [projectStage, setProjectStage] = useState(
    initial?.projectStage || "",
  );
  const [actionStyle, setActionStyle] = useState(initial?.actionStyle || "");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleStack = (item) => {
    setStack((items) => {
      if (items.includes(item)) {
        setPrimaryStack((primary) => primary.filter((x) => x !== item));
        return items.filter((x) => x !== item);
      }
      return [...items, item];
    });
  };

  const togglePrimaryStack = (item) => {
    setPrimaryStack((items) => {
      if (items.includes(item)) {
        return items.filter((x) => x !== item);
      }
      if (items.length >= 3) return items;
      setStack((selected) =>
        selected.includes(item) ? selected : [...selected, item],
      );
      return [...items, item];
    });
  };

  const toggleSignalPreference = (item) => {
    setSignalPreferences((items) =>
      items.includes(item) ? items.filter((x) => x !== item) : [...items, item],
    );
  };

  const toggleMutedTopic = (item) => {
    setMutedTopics((items) =>
      items.includes(item) ? items.filter((x) => x !== item) : [...items, item],
    );
  };

  const canContinue =
    (step === 1 && skillLevel && role) ||
    (step === 2 && primaryStack.length > 0) ||
    (step === 3 && signalPreferences.length > 0) ||
    (step === 4 && learningGoal && deadline && projectStage && actionStyle);

  const handleNext = async () => {
    setSubmitError("");
    if (step < 4) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    try {
      await onComplete?.({
        skillLevel,
        role,
        stack,
        primaryStack,
        signalPreferences,
        mutedTopics,
        currentProject,
        learningGoal,
        deadline,
        projectStage,
        actionStyle,
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
              Step {step} of 4
            </span>
            <div className="w-7" />
          </div>
          <div className="mt-3 flex gap-1.5">
            {[1, 2, 3, 4].map((i) => (
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
              <h2 className="text-2xl font-bold text-white">Stack Focus</h2>
              <p className="mt-1 text-sm text-slate-400">
                Pick the tools that should affect your score most.
              </p>

              <div className="mt-6">
                <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                  Primary Stack, max 3
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TECH_STACK_OPTIONS.map((item) => (
                    <Chip
                      key={item}
                      active={primaryStack.includes(item)}
                      onClick={() => togglePrimaryStack(item)}
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
                <p className="mt-3 font-mono text-[11px] text-slate-500">
                  {primaryStack.length}/3 primary selected
                </p>
              </div>

              <div className="mt-6">
                <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                  Also Track
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
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
              </div>

              <p className="mt-4 font-mono text-[11px] text-slate-500">
                {stack.length} total tracked
              </p>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white">Signal Priority</h2>
              <p className="mt-1 text-sm text-slate-400">
                Choose what should be boosted or muted.
              </p>

              <div className="mt-6">
                <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                  Boost Signal Types
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SIGNAL_TYPE_OPTIONS.map((item) => (
                    <Chip
                      key={item}
                      active={signalPreferences.includes(item)}
                      onClick={() => toggleSignalPreference(item)}
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                  Mute Topics
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {MUTED_TOPIC_OPTIONS.map((item) => (
                    <Chip
                      key={item}
                      active={mutedTopics.includes(item)}
                      onClick={() => toggleMutedTopic(item)}
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Muted topics can still appear, but their relevance score drops.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white">Your Goal</h2>
              <p className="mt-1 text-sm text-slate-400">
                What are you building and how should BriefMate respond?
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
                  Project Stage
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PROJECT_STAGES.map((stage) => (
                    <Chip
                      key={stage}
                      active={projectStage === stage}
                      onClick={() => setProjectStage(stage)}
                    >
                      {stage}
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

              <div className="mt-6">
                <label className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                  Action Style
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ACTION_STYLES.map((style) => (
                    <Chip
                      key={style}
                      active={actionStyle === style}
                      onClick={() => setActionStyle(style)}
                    >
                      {style}
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
            {step === 4 ? (
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
