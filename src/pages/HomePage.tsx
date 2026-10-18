import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Cpu,
  Snowflake,
  LayoutGrid,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { homeCategoryTiles } from '../lib/categories';
import { ProductGrid } from '../components/ProductGrid';
import { SectionHeader } from '../components/SectionHeader';
import { brands } from '../lib/categories';

export function HomePage() {
  const { products } = useStore();

  const byCat = (cat: string, sub?: string) =>
    products.filter(
      (p) =>
        p.category === cat ||
        p.subcategory === cat ||
        (sub && (p.subcategory === sub || p.category === sub)),
    );

  const processors = byCat('processors').slice(0, 8);
  const motherboards = byCat('motherboards').slice(0, 8);
  const gpus = byCat('graphics-cards').slice(0, 4);
  const monitors = byCat('monitors').slice(0, 4);
  const cases = byCat('pc-cases').slice(0, 4);
  const airCool = byCat('air-coolers').slice(0, 4);
  const liquid = byCat('aio-liquid-cooling').slice(0, 4);
  const fans = byCat('case-fans').slice(0, 4);
  const psuLow = products.filter((p) => p.category === 'power-supplies' && p.price < 300).slice(0, 4);
  const psuMid = products.filter((p) => p.category === 'power-supplies' && p.price >= 300 && p.price < 600).slice(0, 4);
  const psuHigh = products.filter((p) => p.category === 'power-supplies' && p.price >= 600).slice(0, 4);
  const headsets = byCat('headsets').slice(0, 4);
  const mice = byCat('mice').slice(0, 4);
  const keyboards = byCat('keyboards').slice(0, 4);
  const chairs = byCat('gaming-chairs').slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-gaming.jpg"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b0f] via-[#0a0b0f]/90 to-[#0a0b0f]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0f] via-transparent to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-medium mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Hebron · Cash on delivery
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
              Your next PC{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300">
                starts here
              </span>
            </h1>
            <p className="mt-5 text-lg text-zinc-400 max-w-lg">
              PC components and accessories — find the right fit for your setup. Genuine products
              with authorized warranty.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold hover:opacity-90 transition shadow-lg shadow-violet-900/40"
              >
                Shop now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/build"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 bg-white/5 font-semibold hover:bg-white/10 transition"
              >
                Build your PC
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Promo tiles */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: Cpu,
              title: 'Find your build',
              desc: 'Economy · Balanced · Performance',
              to: '/build',
              color: 'from-violet-600/20 to-violet-900/10',
            },
            {
              icon: Snowflake,
              title: 'Upgrade your cooling',
              desc: 'Explore cooling solutions',
              to: '/category/air-coolers',
              color: 'from-sky-600/20 to-sky-900/10',
            },
            {
              icon: LayoutGrid,
              title: 'Find your PC style',
              desc: 'Cases and colors for your setup',
              to: '/category/pc-cases',
              color: 'from-fuchsia-600/20 to-fuchsia-900/10',
            },
            {
              icon: Truck,
              title: 'Free delivery',
              desc: 'On orders from 1,000.00 ₪',
              to: '/shipping',
              color: 'from-amber-600/20 to-amber-900/10',
            },
          ].map((t) => (
            <Link
              key={t.title}
              to={t.to}
              className={`rounded-2xl border border-white/8 bg-gradient-to-br ${t.color} backdrop-blur p-5 hover:border-white/20 transition group`}
            >
              <t.icon className="w-6 h-6 text-white mb-3 opacity-80 group-hover:scale-110 transition" />
              <div className="font-semibold">{t.title}</div>
              <div className="text-xs text-zinc-400 mt-1">{t.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <SectionHeader title="Shop by category" to="/shop" linkLabel="All categories" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {homeCategoryTiles.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="group rounded-2xl overflow-hidden border border-white/8 bg-[#12141c] hover:border-violet-500/40 transition"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-80"
                />
              </div>
              <div className="p-2.5 text-center text-xs font-medium">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Processors */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionHeader
          title="Processors"
          subtitle="Choose the suitable platform between Intel and AMD."
          to="/category/processors"
        />
        <ProductGrid products={processors} />
      </section>

      {/* Motherboards */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionHeader
          title="Motherboards"
          subtitle="Motherboards compatible with Intel and AMD platforms."
          to="/category/motherboards"
        />
        <ProductGrid products={motherboards} />
      </section>

      {/* GPUs */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded-3xl border border-white/8 overflow-hidden bg-gradient-to-br from-violet-950/40 to-[#12141c] mb-8">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12 flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl font-bold">Uncompromised graphics performance</h2>
              <p className="text-zinc-400 mt-3 max-w-md">
                Options now available for gaming and design with performance that suits your build.
              </p>
              <Link
                to="/category/graphics-cards"
                className="mt-6 inline-flex items-center gap-2 text-violet-300 font-medium hover:text-white"
              >
                GPU options <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative min-h-[220px]">
              <img src="/images/cat-gpu.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            </div>
          </div>
        </div>
        <ProductGrid products={gpus} />
      </section>

      {/* Monitors */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionHeader
          title="Monitors"
          subtitle="The image your games deserve — resolutions and refresh rates for gaming and work."
          to="/category/monitors"
        />
        <ProductGrid products={monitors} />
      </section>

      {/* Cases */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionHeader
          title="Gaming cases"
          subtitle="Choose the right case for your build!"
          to="/category/pc-cases"
        />
        <ProductGrid products={cases} />
      </section>

      {/* Cooling */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionHeader
          title="Cooling and fans"
          subtitle="Air and liquid solutions and fans that maintain your device's performance."
          to="/category/air-coolers"
        />
        <h3 className="text-sm font-semibold text-zinc-400 mb-4">Air cooling</h3>
        <ProductGrid products={airCool} />
        <h3 className="text-sm font-semibold text-zinc-400 mb-4 mt-10">Liquid cooling</h3>
        <ProductGrid products={liquid} />
        <h3 className="text-sm font-semibold text-zinc-400 mb-4 mt-10">Fans</h3>
        <ProductGrid products={fans} />
      </section>

      {/* PSU */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionHeader
          title="Power supplies by wattage"
          subtitle="Choose the right power supply for your build and future upgrades."
          to="/category/power-supplies"
        />
        <h3 className="text-sm font-semibold text-zinc-400 mb-4">500–650W</h3>
        <ProductGrid products={psuLow} />
        <h3 className="text-sm font-semibold text-zinc-400 mb-4 mt-10">700–800W</h3>
        <ProductGrid products={psuMid} />
        <h3 className="text-sm font-semibold text-zinc-400 mb-4 mt-10">850W or more</h3>
        <ProductGrid products={psuHigh} />
      </section>

      {/* Accessories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionHeader
          title="Gaming accessories"
          subtitle="Control, sound and comfort for a complete gaming setup."
          to="/category/gaming-accessories"
        />
        <h3 className="text-sm font-semibold text-zinc-400 mb-4">Headsets</h3>
        <ProductGrid products={headsets} />
        <h3 className="text-sm font-semibold text-zinc-400 mb-4 mt-10">Mice</h3>
        <ProductGrid products={mice} />
        <h3 className="text-sm font-semibold text-zinc-400 mb-4 mt-10">Keyboards</h3>
        <ProductGrid products={keyboards} />
      </section>

      {/* Furniture */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionHeader
          title="Furniture & room setup"
          subtitle="Chairs, desks and accessories for an organized gaming and work space."
          to="/category/furniture-room-setup"
        />
        <ProductGrid products={chairs} />
      </section>

      {/* Brands */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <SectionHeader title="Shop by brand" to="/brands" />
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <Link
              key={b}
              to={`/shop?brand=${encodeURIComponent(b)}`}
              className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm hover:border-violet-500/50 hover:bg-violet-500/10 transition"
            >
              {b}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
