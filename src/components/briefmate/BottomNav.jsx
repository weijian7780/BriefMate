import { Home, Compass, Bookmark, User } from "lucide-react";

const TABS = [
  { id: "today", label: "Today", icon: Home },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "profile", label: "Profile", icon: User },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-[#1E293B] bg-[#0F1117]/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-screen-md grid grid-cols-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] transition-colors ${
                isActive
                  ? "text-[#3B82F6]"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className={isActive ? "font-semibold" : ""}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
