import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { brands } from '../lib/categories';
import { useStore } from '../context/StoreContext';
import { ProductGrid } from '../components/ProductGrid';
import { DEFAULT_SITE_SETTINGS } from '../lib/storage';
import type { PreferredLanguage } from '../lib/types';

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

const PAGE_COPY_TRANSLATIONS: Record<'Arabic' | 'Hebrew', Record<string, string>> = {
  Arabic: {
    about: 'متجر BLITZ Gaming هو وجهتك الموثوقة لمكوّنات الكمبيوتر الأصلية ومستلزمات الألعاب في فلسطين، ومقره في {location}.\n\nنوفّر منتجات أصلية وأسعاراً منافسة والدفع عند الاستلام في مناطق التوصيل المحددة. سواء كنت تحتاج إلى ترقية واحدة أو تجميعة مخصصة كاملة، فريقنا جاهز لمساعدتك.\n\nتواصل معنا عبر واتساب على {whatsapp} أو البريد الإلكتروني {email}.',
    shipping: 'نستقبل طلبات التوصيل إلى الضفة الغربية والقدس ومناطق 1948 من مقرنا في الخليل. رسوم التوصيل ثابتة حسب المنطقة: الضفة الغربية 20 شيكل، القدس 50 شيكل، ومناطق 1948 بقيمة 70 شيكل.\n\n- الدفع عند الاستلام — ادفع عند وصول طلبك\n- الضفة الغربية: 20 شيكل للتوصيل\n- القدس: 50 شيكل للتوصيل\n- مناطق 1948: 70 شيكل للتوصيل\n- ستحصل على رقم طلب (BG######) لتتبّع طلبك\n\nتعتمد مدة التوصيل على مدينتك وتوفّر المنتج. تواصل معنا للطلبات المستعجلة.',
    returns: 'إذا وصلك منتج معيب أو غير مطابق، تواصل معنا خلال 48 ساعة وأرفق رقم الطلب والصور. سنرتّب الاستبدال وفقاً لشروط كفالة الشركة المصنّعة.\n\nقد تكون خيارات إرجاع البرامج المفتوحة والمواد الاستهلاكية وأجهزة الكمبيوتر المُجمّعة حسب الطلب محدودة.',
    warranty: 'جميع المنتجات التي يبيعها BLITZ Gaming أصلية ومشمولة بكفالة الشركة المصنّعة المعتمدة حيثما ينطبق ذلك. احتفظ برقم الطلب والفاتورة عند تقديم طلب كفالة.\n\nلخدمة الكفالة، راسلنا عبر واتساب مع رقم الطلب (BG######) وتفاصيل المنتج.',
    privacy: 'نستخدم الاسم ورقم الهاتف والعنوان وتفاصيل الطلب التي تقدمها لتجهيز الطلب وتقديم الدعم. في النسخة التجريبية الحالية، تُحفظ معلومات الطلب في هذا المتصفح بدلاً من قاعدة بيانات متجر مشتركة.\n\nقبل استقبال طلبات فعلية، يجب على صاحب المتجر إعداد تخزين آمن على الخادم ونشر سياسة خصوصية واحتفاظ بالبيانات توضّح كيفية التعامل مع معلومات العملاء.',
    terms: 'عند تقديم طلب عبر BLITZ Gaming، فإنك توافق على الدفع عند الاستلام وتقديم تفاصيل توصيل صحيحة وسياسات الإرجاع والكفالة. الأسعار بالشيكل الإسرائيلي (₪) وقد تتغير قبل تأكيد الطلب.\n\nيعتمد توفر المنتجات على المخزون. قد نلغي الطلب إذا أصبح المنتج غير متوفر.',
    support: 'هل تحتاج إلى مساعدة؟ تواصل معنا في أي وقت:',
    brands: 'تسوّق منتجات أصلية من علامات تجارية رائدة.',
    offers: 'عروض مميزة ومنتجات مختارة.',
  },
  Hebrew: {
    about: 'BLITZ Gaming היא החנות שלכם לרכיבי מחשב מקוריים ולציוד גיימינג בפלסטין, וממוקמת ב־{location}.\n\nאנו מציעים מוצרים מקוריים, מחירים תחרותיים ותשלום בעת המסירה באזורי המשלוח שלנו. בין אם אתם צריכים שדרוג אחד או מחשב בהתאמה אישית, הצוות שלנו כאן כדי לעזור.\n\nאפשר ליצור איתנו קשר ב־WhatsApp במספר {whatsapp} או בדוא״ל {email}.',
    shipping: 'אנו מקבלים בקשות משלוח לגדה המערבית, לירושלים ולאזורי 1948 מהסניף שלנו בחברון. דמי המשלוח קבועים לפי האזור: הגדה המערבית 20 ₪, ירושלים 50 ₪ ואזורי 1948 ‏70 ₪.\n\n- תשלום בעת המסירה — משלמים כשההזמנה מגיעה\n- הגדה המערבית: משלוח ב־20 ₪\n- ירושלים: משלוח ב־50 ₪\n- אזורי 1948: משלוח ב־70 ₪\n- תקבלו מספר הזמנה (BG######) למעקב אחר ההזמנה\n\nזמני המשלוח תלויים בעיר ובזמינות המוצר. להזמנות דחופות פנו אלינו.',
    returns: 'אם קיבלתם מוצר פגום או שגוי, פנו אלינו בתוך 48 שעות עם מספר ההזמנה ותמונות. נתאם החלפה בהתאם לתנאי אחריות היצרן.\n\nאפשרויות ההחזרה של תוכנה שנפתחה, מוצרים מתכלים ומחשבים שנבנו בהתאמה אישית עשויות להיות מוגבלות.',
    warranty: 'כל המוצרים הנמכרים על ידי BLITZ Gaming מקוריים ומכוסים באחריות יצרן מורשית, במקרים שבהם הדבר חל. שמרו את מספר ההזמנה והחשבונית לצורך מימוש האחריות.\n\nלקבלת שירות אחריות, פנו אלינו ב־WhatsApp עם מספר ההזמנה (BG######) ופרטי המוצר.',
    privacy: 'אנו משתמשים בשם, במספר הטלפון, בכתובת ובפרטי ההזמנה שסיפקתם כדי להכין את ההזמנה ולתמוך בכם. בגרסת התצוגה הנוכחית, פרטי ההזמנה נשמרים בדפדפן הזה ולא במסד נתונים משותף.\n\nלפני קבלת הזמנות אמיתיות, בעל החנות צריך להגדיר אחסון מאובטח בצד השרת ולפרסם מדיניות פרטיות ושמירת נתונים מדויקת.',
    terms: 'בעת ביצוע הזמנה ב־BLITZ Gaming אתם מסכימים לתשלום בעת המסירה, למסירת פרטי משלוח נכונים ולמדיניות ההחזרות והאחריות שלנו. המחירים בשקלים חדשים (₪) ועשויים להשתנות עד לאישור ההזמנה.\n\nזמינות המוצרים תלויה במלאי. ייתכן שנבטל הזמנה אם מוצר אינו זמין עוד.',
    support: 'צריכים עזרה? אפשר ליצור איתנו קשר בכל עת:',
    brands: 'קנו מוצרים מקוריים ממותגים מובילים.',
    offers: 'מבצעים נבחרים ומוצרים מומלצים.',
  },
};

function PageCopy({ pageKey, text, values = {}, language = 'English' }: { pageKey?: string; text: string; values?: Record<string, string>; language?: PreferredLanguage }) {
  let source = text;
  if (pageKey && language !== 'English' && text === DEFAULT_SITE_SETTINGS.pageContent[pageKey]) {
    source = PAGE_COPY_TRANSLATIONS[language][pageKey] ?? text;
  }
  const rendered = source.replace(/\{([a-zA-Z]+)\}/g, (match, key: string) => values[key] ?? match);
  const blocks = rendered.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  return <>{blocks.map((block, index) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length && lines.every((line) => line.startsWith('- '))) {
      return <ul key={index} className="list-disc pl-5 space-y-2">{lines.map((line, lineIndex) => <li key={lineIndex}>{line.slice(2)}</li>)}</ul>;
    }
    return <p key={index}>{lines.map((line, lineIndex) => <Fragment key={lineIndex}>{lineIndex > 0 && <br />}{line}</Fragment>)}</p>;
  })}</>;
}

export function AboutPage() {
  const { storeInfo, siteSettings, language } = useStore();
  return <Shell title="About Blitz Gaming"><PageCopy pageKey="about" language={language} text={siteSettings.pageContent.about} values={{ location: storeInfo.location, whatsapp: storeInfo.whatsapp, email: storeInfo.email, storeName: storeInfo.storeName }} /></Shell>;
}

export function ShippingPage() {
  const { siteSettings, storeInfo, language } = useStore();
  return <Shell title="Shipping & delivery"><PageCopy pageKey="shipping" language={language} text={siteSettings.pageContent.shipping} values={{ location: storeInfo.location, whatsapp: storeInfo.whatsapp, email: storeInfo.email, storeName: storeInfo.storeName }} /></Shell>;
}

export function ReturnsPage() {
  const { siteSettings, storeInfo, language } = useStore();
  return <Shell title="Returns & exchanges"><PageCopy pageKey="returns" language={language} text={siteSettings.pageContent.returns} values={{ location: storeInfo.location, whatsapp: storeInfo.whatsapp, email: storeInfo.email, storeName: storeInfo.storeName }} /></Shell>;
}

export function WarrantyPage() {
  const { siteSettings, storeInfo, language } = useStore();
  return <Shell title="Warranty"><PageCopy pageKey="warranty" language={language} text={siteSettings.pageContent.warranty} values={{ location: storeInfo.location, whatsapp: storeInfo.whatsapp, email: storeInfo.email, storeName: storeInfo.storeName }} /></Shell>;
}

export function PrivacyPage() {
  const { siteSettings, storeInfo, language } = useStore();
  return <Shell title="Privacy policy"><PageCopy pageKey="privacy" language={language} text={siteSettings.pageContent.privacy} values={{ location: storeInfo.location, whatsapp: storeInfo.whatsapp, email: storeInfo.email, storeName: storeInfo.storeName }} /></Shell>;
}

export function TermsPage() {
  const { siteSettings, storeInfo, language } = useStore();
  return <Shell title="Terms & conditions"><PageCopy pageKey="terms" language={language} text={siteSettings.pageContent.terms} values={{ location: storeInfo.location, whatsapp: storeInfo.whatsapp, email: storeInfo.email, storeName: storeInfo.storeName }} /></Shell>;
}

export function SupportPage() {
  const { storeInfo, siteSettings, language } = useStore();
  return (
    <Shell title="Customer support">
      <PageCopy pageKey="support" language={language} text={siteSettings.pageContent.support} values={{ location: storeInfo.location, whatsapp: storeInfo.whatsapp, email: storeInfo.email, storeName: storeInfo.storeName }} />
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
            {storeInfo.storeName}
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
  const { siteSettings, language } = useStore();
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Brands</h1>
      <div className="text-zinc-400 text-sm mb-8"><PageCopy pageKey="brands" language={language} text={siteSettings.pageContent.brands} /></div>
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
  const { products, siteSettings, language } = useStore();
  const offers = products.filter((p) => p.label || p.compareAtPrice || p.featured).slice(0, 24);
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Offers</h1>
      <div className="text-zinc-400 text-sm mb-8"><PageCopy pageKey="offers" language={language} text={siteSettings.pageContent.offers} /></div>
      <ProductGrid products={offers} empty="No special offers right now — check back soon." />
    </div>
  );
}
