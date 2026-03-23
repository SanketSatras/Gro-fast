import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, MapPin, Clock, Users, Truck } from 'lucide-react';

const floatingProducts = [
  { name: 'Farm Paneer', vendor: 'Sharma Dairy', price: '₹120', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=300&fit=crop', rotate: -3, x: 0, y: 0 },
  { name: 'Sourdough Bread', vendor: 'Baker Street', price: '₹85', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop', rotate: 4, x: 40, y: -30 },
  { name: 'Organic Apples', vendor: 'Fruit Basket', price: '₹180', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop', rotate: -2, x: -20, y: 20 },
];

const headlineWords = ['Doodh,', 'chai', 'thandi', 'hone', 'se', 'pehle', 'ghar', 'pe'];

interface HeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Hero({ searchQuery, onSearchChange }: HeroProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  const wordVariants = {
    hidden: { opacity: 0, y: 25, filter: 'blur(4px)' },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { delay: 0.15 + i * 0.07, duration: 0.5, type: 'spring' as const, stiffness: 120, damping: 14 },
    }),
  };

  return (
    <section ref={ref} className="hero-section relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Organic blurred shapes */}
      <div className="absolute top-10 left-[15%] w-72 h-72 rounded-full bg-primary/8 blur-[80px]" />
      <div className="absolute bottom-0 right-[10%] w-96 h-64 rounded-full bg-accent/10 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />

      {/* Grain texture overlay */}
      <div className="absolute inset-0 hero-grain opacity-[0.035]" />

      <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-24">
        <div className="grid lg:grid-cols-[1fr_0.85fr] gap-10 lg:gap-6 items-center">
          {/* Left: Copy */}
          <div className="space-y-7">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary tracking-wide">Wakad, Pune</span>
              <MapPin className="w-3 h-3 text-primary/60" />
            </motion.div>

            <h1 className="text-foreground leading-[1.08] tracking-tight">
              <span className="block text-3xl sm:text-4xl md:text-[2.85rem] font-extrabold line-clamp-2 md:line-clamp-none">
                {headlineWords.map((word, i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    variants={wordVariants}
                    initial="hidden"
                    animate={inView ? 'visible' : 'hidden'}
                    className={`inline-block mr-[0.3em] ${word === 'chai' ? 'text-accent italic' : ''}`}
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.85, duration: 0.5 }}
              className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed"
            >
              Bad mein chai thandi ho jaati hai, phool murjha jaate hain,
              aur phir mann bhi nahi karta. Fresh, local, and delivered in minutes.
            </motion.p>

            {/* Synced search bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.0, type: 'spring', stiffness: 100, damping: 16 }}
            >
              <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/70" />
                <input
                  id="hero-search"
                  name="hero-search"
                  aria-label="Search products"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder='Try "paneer" or "sourdough bread"'
                  autoComplete="off"
                  className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-card/90 border border-border/60 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all shadow-sm"
                />
              </div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground"
            >
              {[
                { icon: Clock, text: '~28 min avg delivery' },
                { icon: MapPin, text: '2 km radius' },
                { icon: Users, text: '47 local vendors' },
                { icon: Truck, text: 'Free under ₹199' },
              ].map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 1.3 + i * 0.1 }}
                  className="flex items-center gap-1.5"
                >
                  <Icon className="w-3.5 h-3.5 text-primary/70" />
                  <span>{text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Floating product cards */}
          <div className="hidden lg:block relative h-[420px]">
            {floatingProducts.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 40, rotate: 0, scale: 0.9 }}
                animate={inView ? {
                  opacity: 1,
                  y: product.y,
                  rotate: product.rotate,
                  scale: 1,
                  x: product.x,
                } : {}}
                transition={{
                  delay: 0.6 + i * 0.18,
                  type: 'spring',
                  stiffness: 80,
                  damping: 14,
                }}
                whileHover={{
                  y: product.y - 8,
                  rotate: 0,
                  scale: 1.04,
                  boxShadow: '0 20px 50px -15px rgba(0,0,0,0.15)',
                  transition: { type: 'spring', stiffness: 200, damping: 15 },
                }}
                className={`absolute floating-card cursor-pointer ${i === 0 ? 'top-8 right-12 z-30' :
                  i === 1 ? 'top-[120px] right-[180px] z-20' :
                    'bottom-12 right-8 z-10'
                  }`}
                style={{ transformOrigin: 'center center' }}
              >
                <div className="w-52 bg-card rounded-2xl border border-border/40 shadow-lg overflow-hidden">
                  <div className="h-32 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] text-muted-foreground/70">{product.vendor}</p>
                    <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-bold text-foreground text-sm">{product.price}</span>
                      <span className="text-[10px] badge-fresh">🌿 Fresh</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Decorative dotted circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-dashed border-primary/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-dashed border-primary/5" />
          </div>
        </div>
      </div>
    </section>
  );
}
