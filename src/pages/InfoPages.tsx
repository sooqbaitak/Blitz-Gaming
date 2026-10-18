import { Link } from 'react-router-dom';
import { brands } from '../lib/categories';
import { useStore } from '../context/StoreContext';
import { ProductGrid } from '../components/ProductGrid';

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <div className="prose prose-invert prose-sm max-w-none text-zinc-300 space-y-4 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function AboutPage() {
  const { storeInfo } = useStore();
  return (
    <Shell title="About Blitz Gaming">
      <p>
        Blitz Gaming is your trusted store for genuine PC components and gaming gear in Palestine,
        based in <strong>{storeInfo.location}</strong>.
      </p>
      <p>
        We offer authentic products, competitive prices, and cash on delivery across our listed delivery areas.
        Whether you need a single upgrade or a full custom build, our team is here to help.
      </p>
      <p>
        Contact us on WhatsApp at {storeInfo.whatsapp} or email {storeInfo.email}.
      </p>
    </Shell>
  );
}

export function ShippingPage() {
  return (
    <Shell title="Shipping & delivery">
      <p>We accept delivery requests for the West Bank, Jerusalem and 1948 Areas from our base in Hebron. Availability, fees and timing may vary by location; contact us to confirm details for your area.</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Cash on delivery (COD) — pay when you receive your order</li>
        <li>Free delivery on orders from 1,000.00 ₪</li>
        <li>Standard delivery fee applies below the free-shipping threshold</li>
        <li>You will receive an order code (BG######) to track your order</li>
      </ul>
      <p>Delivery times depend on your city and product availability. Contact us for urgent orders.</p>
    </Shell>
  );
}

export function ReturnsPage() {
  return (
    <Shell title="Returns & exchanges">
      <p>
        If you receive a defective or incorrect product, contact us within 48 hours with your order
        code and photos. We will arrange a replacement or exchange according to manufacturer warranty
        terms.
      </p>
      <p>Opened software, consumables, and custom-built PCs may have limited return options.</p>
    </Shell>
  );
}

export function WarrantyPage() {
  return (
    <Shell title="Warranty">
      <p>
        All products sold by Blitz Gaming are genuine and covered by the manufacturer&apos;s authorized
        warranty where applicable. Keep your order code and invoice for warranty claims.
      </p>
      <p>
        For warranty service, WhatsApp us with your order code (BG######) and product details.
      </p>
    </Shell>
  );
}

export function PrivacyPage() {
  return (
    <Shell title="Privacy policy">
      <p>
        We collect only the information needed to process and deliver your orders (name, phone,
        address, and optional email). Order data is stored securely for fulfillment and support.
      </p>
      <p>We do not sell your personal data. Contact sooqbaitak@gmail.com for privacy requests.</p>
    </Shell>
  );
}

export function TermsPage() {
  return (
    <Shell title="Terms & conditions">
      <p>
        By placing an order on Blitz Gaming you agree to cash-on-delivery payment, accurate delivery
        details, and our return/warranty policies. Prices are in Israeli Shekels (₪) and may change
        without notice until an order is confirmed.
      </p>
      <p>Product availability is subject to stock. We may cancel orders if items become unavailable.</p>
    </Shell>
  );
}

export function SupportPage() {
  const { storeInfo } = useStore();
  return (
    <Shell title="Customer support">
      <p>Need help? Reach us anytime:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          WhatsApp:{' '}
          <a className="text-violet-400" href={`https://wa.me/${storeInfo.whatsappDigits}`}>
            {storeInfo.whatsapp}
          </a>
        </li>
        <li>
          Email:{' '}
          <a className="text-violet-400" href={`mailto:${storeInfo.email}`}>
            {storeInfo.email}
          </a>
        </li>
        <li>
          Facebook:{' '}
          <a className="text-violet-400" href={storeInfo.facebook} target="_blank" rel="noreferrer">
            Blitz Gaming
          </a>
        </li>
        <li>
          Instagram:{' '}
          <a className="text-violet-400" href={storeInfo.instagram} target="_blank" rel="noreferrer">
            @blitzyard
          </a>
        </li>
        <li>Location: {storeInfo.location}</li>
      </ul>
      <p>
        <Link to="/track" className="text-violet-400">
          Track an order
        </Link>{' '}
        with your BG code.
      </p>
    </Shell>
  );
}

export function BrandsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Brands</h1>
      <p className="text-zinc-400 text-sm mb-8">Shop authentic products from leading brands</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {brands.map((b) => (
          <Link
            key={b}
            to={`/shop?brand=${encodeURIComponent(b)}`}
            className="p-6 rounded-2xl border border-white/8 bg-[#12141c] text-center font-semibold hover:border-violet-500/40 hover:bg-violet-500/5 transition"
          >
            {b}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function OffersPage() {
  const { products } = useStore();
  const offers = products.filter((p) => p.label || p.compareAtPrice || p.featured).slice(0, 24);
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Offers</h1>
      <p className="text-zinc-400 text-sm mb-8">Featured deals and highlighted products</p>
      <ProductGrid products={offers} empty="No special offers right now — check back soon." />
    </div>
  );
}
