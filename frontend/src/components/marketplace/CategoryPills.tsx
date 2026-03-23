import { motion } from 'framer-motion';
import { categories } from '@/lib/data';

interface CategoryPillsProps {
  active: string;
  onChange: (id: string) => void;
}

export function CategoryPills({ active, onChange }: CategoryPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto py-4 px-4 scrollbar-none">
      {categories.map((cat, i) => (
        <motion.button
          key={cat.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(cat.id)}
          className={`category-pill whitespace-nowrap ${
            active === cat.id ? 'category-pill-active' : 'category-pill-inactive'
          }`}
        >
          <span className="mr-1.5">{cat.emoji}</span>
          {cat.label}
        </motion.button>
      ))}
    </div>
  );
}
