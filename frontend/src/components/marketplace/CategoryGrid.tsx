import { motion } from "framer-motion";

const CATEGORIES = [
    { label: "All", emoji: "🛒", bg: "from-slate-50 to-slate-100", iconBg: "bg-slate-100", value: "all" },
    { label: "Fruits", emoji: "🍎", bg: "from-red-50 to-orange-50", iconBg: "bg-red-100", value: "fruits" },
    { label: "Vegetables", emoji: "🥦", bg: "from-green-50 to-emerald-50", iconBg: "bg-green-100", value: "vegetables" },
    { label: "Dairy", emoji: "🥛", bg: "from-blue-50 to-cyan-50", iconBg: "bg-blue-100", value: "dairy" },
    { label: "Bakery", emoji: "🥖", bg: "from-amber-50 to-yellow-50", iconBg: "bg-amber-100", value: "bakery" },
    { label: "Meat", emoji: "🥩", bg: "from-rose-50 to-red-50", iconBg: "bg-rose-100", value: "meat" },
    { label: "Snacks", emoji: "🍟", bg: "from-yellow-50 to-lime-50", iconBg: "bg-yellow-100", value: "snacks" },
    { label: "Beverages", emoji: "🥤", bg: "from-purple-50 to-pink-50", iconBg: "bg-purple-100", value: "beverages" },
    { label: "Baby Care", emoji: "🍼", bg: "from-pink-50 to-rose-50", iconBg: "bg-pink-100", value: "baby care" },
    { label: "Personal", emoji: "🧴", bg: "from-sky-50 to-blue-50", iconBg: "bg-sky-100", value: "personal care" },
    { label: "Instant Food", emoji: "🍜", bg: "from-orange-50 to-amber-50", iconBg: "bg-orange-100", value: "instant food" },
];

interface CategoryGridProps {
    selected: string;
    onSelect: (value: string) => void;
}

export function CategoryGrid({ selected, onSelect }: CategoryGridProps) {
    return (
        <div className="mt-8 px-4 sm:px-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Categories</h2>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Browse by type</p>
                </div>
                <button
                    onClick={() => onSelect("all")}
                    className="text-[11px] font-bold text-[#0f9d58] border border-[#0f9d58]/20 px-3 py-1.5 rounded-full hover:bg-[#0f9d58]/5 transition-colors"
                >
                    View all
                </button>
            </div>

            {/* Desktop grid */}
            <div className="hidden sm:grid grid-cols-5 gap-3">
                {CATEGORIES.map((cat, i) => {
                    const isActive = selected === cat.value;
                    return (
                        <motion.button
                            key={cat.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.35 }}
                            whileHover={{ scale: 1.04, translateY: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onSelect(cat.value)}
                            className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-gradient-to-br ${cat.bg} border transition-all cursor-pointer group ${isActive
                                    ? "border-[#0f9d58] shadow-lg shadow-[#0f9d58]/15 ring-2 ring-[#0f9d58]/20"
                                    : "border-white shadow-sm hover:shadow-md"
                                }`}
                        >
                            {/* Active dot indicator */}
                            {isActive && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0f9d58]"
                                />
                            )}
                            <div className={`w-12 h-12 rounded-2xl ${cat.iconBg} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                                {cat.emoji}
                            </div>
                            <span className={`text-[11px] font-bold text-center leading-tight transition-colors ${isActive ? "text-[#0f9d58]" : "text-slate-600"}`}>
                                {cat.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Mobile: 2-row horizontal scroll */}
            <div className="sm:hidden overflow-x-auto no-scrollbar pb-2">
                <div className="grid grid-rows-2 grid-flow-col gap-3 min-w-max">
                    {CATEGORIES.map((cat) => {
                        const isActive = selected === cat.value;
                        return (
                            <button
                                key={cat.label}
                                onClick={() => onSelect(cat.value)}
                                className={`w-24 flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br ${cat.bg} border transition-all ${isActive
                                        ? "border-[#0f9d58] ring-2 ring-[#0f9d58]/20 shadow-md"
                                        : "border-white shadow-sm"
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center text-xl`}>
                                    {cat.emoji}
                                </div>
                                <span className={`text-[9px] font-bold text-center leading-tight ${isActive ? "text-[#0f9d58]" : "text-slate-600"}`}>
                                    {cat.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
export function CategoryGridSkeleton() {
    return (
        <div className="mt-8 px-4 sm:px-6 max-w-7xl mx-auto animate-pulse">
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-2">
                    <div className="h-6 w-32 bg-slate-100 rounded-lg" />
                    <div className="h-3 w-48 bg-slate-50 rounded-lg" />
                </div>
            </div>
            <div className="hidden sm:grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-32 rounded-3xl bg-slate-50 border border-slate-100" />
                ))}
            </div>
            <div className="sm:hidden flex gap-4 overflow-hidden">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-24 h-28 shrink-0 rounded-2xl bg-slate-50 border border-slate-100" />
                ))}
            </div>
        </div>
    );
}
