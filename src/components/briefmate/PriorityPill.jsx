export default function PriorityPill({ priority, size = "sm" }) {
  const map = {
    "Check Today": {
      bg: "bg-[#10B981]/15",
      border: "border-[#10B981]/40",
      text: "text-[#10B981]",
      dot: "bg-[#10B981]",
    },
    "Review This Week": {
      bg: "bg-[#3B82F6]/15",
      border: "border-[#3B82F6]/40",
      text: "text-[#60A5FA]",
      dot: "bg-[#3B82F6]",
    },
    "Save for Later": {
      bg: "bg-slate-500/15",
      border: "border-slate-500/40",
      text: "text-slate-300",
      dot: "bg-slate-400",
    },
    "Ignore for Now": {
      bg: "bg-slate-700/40",
      border: "border-slate-600/40",
      text: "text-slate-400",
      dot: "bg-slate-500",
    },
  };
  const s = map[priority] || map["Save for Later"];
  const sizing =
    size === "lg" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${s.bg} ${s.border} ${s.text} ${sizing} font-medium`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {priority}
    </span>
  );
}
