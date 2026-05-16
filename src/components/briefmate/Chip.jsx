export default function Chip({
  active,
  onClick,
  children,
  size = "md",
  as = "button",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-full border transition-colors select-none whitespace-nowrap";
  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };
  const activeCls = "bg-[#3B82F6] border-[#3B82F6] text-white";
  const idleCls =
    "bg-[#1E293B]/60 border-[#1E293B] text-slate-300 hover:border-[#3B82F6]/60 hover:text-white";
  const cls = `${base} ${sizes[size]} ${active ? activeCls : idleCls}`;

  if (as === "div" || !onClick) {
    return <div className={cls} {...props}>{children}</div>;
  }
  return (
    <button type="button" onClick={onClick} className={cls} {...props}>
      {children}
    </button>
  );
}
