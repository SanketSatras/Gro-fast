import { ChevronDown } from "lucide-react";

export function FilterPills() {
    const pills = [
        { label: "Sort", hasDropdown: true },
        { label: "Filters", hasDropdown: true },
        { label: "Ratings", hasDropdown: false },
        { label: "Delivery Time", hasDropdown: false },
        { label: "Distance", hasDropdown: false },
    ];

    return (
        <div className="w-full overflow-x-auto no-scrollbar pb-2 pt-1 mt-4">
            <div className="flex items-center gap-2 px-6 pb-2 min-w-max">
                {pills.map((pill, idx) => (
                    <button
                        key={idx}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-100 rounded-[1.25rem] text-xs font-semibold text-slate-600 shadow-[0_4px_10px_rgba(0,0,0,0.02)] hover:border-primary/30 transition-colors"
                    >
                        {pill.label}
                        {pill.hasDropdown && <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                ))}
            </div>
        </div>
    );
}
