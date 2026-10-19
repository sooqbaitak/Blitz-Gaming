import { useEffect } from 'react';
import type { PreferredLanguage } from '../lib/types';

const TRANSLATIONS: Record<'Arabic' | 'Hebrew', Record<string, string>> = {
  Arabic: {
    'Home': 'الرئيسية', 'Shop': 'المتجر', 'Shop now': 'تسوّق الآن', 'Shop by category': 'تسوّق حسب الفئة',
    'All categories': 'كل الفئات', 'Build your PC': 'جمّع جهازك', 'Processors': 'المعالجات',
    'Motherboards': 'اللوحات الأم', 'Graphics cards': 'بطاقات الرسوميات', 'Monitors': 'الشاشات', 'Gaming cases': 'كيسات الألعاب',
    'Cooling and fans': 'التبريد والمراوح', 'Power supplies': 'مزودات الطاقة', 'Gaming accessories': 'إكسسوارات الألعاب',
    'Furniture & room setup': 'الأثاث وتجهيز الغرفة', 'Related products': 'منتجات ذات صلة', 'Product not found': 'المنتج غير موجود',
    'Back to shop': 'العودة إلى المتجر', 'Search the store...': 'ابحث في المتجر...', 'Search products...': 'ابحث عن المنتجات...',
    'Track order': 'تتبّع الطلب', 'Support': 'الدعم', 'Favorites': 'المفضلة', 'Cart': 'السلة', 'Your account': 'حسابك',
    'Your next PC': 'جهازك القادم', 'starts here': 'يبدأ من هنا', 'Cash on delivery': 'الدفع عند الاستلام', 'Genuine products': 'منتجات أصلية',
    'Delivery areas available at checkout': 'مناطق التوصيل متاحة عند إتمام الطلب', 'Cash on Delivery': 'الدفع عند الاستلام',
    'In stock — ready to ship': 'متوفر — جاهز للتوصيل', 'Out of stock': 'نفد من المخزون', 'Available for pre-order': 'متاح للطلب المسبق',
    'Add to cart': 'أضف إلى السلة', 'Added!': 'تمت الإضافة!', 'Buy now — Cash on Delivery': 'اشترِ الآن — الدفع عند الاستلام',
    'Ask about availability': 'استفسر عن التوفر', 'Specifications': 'المواصفات', 'Shipping & warranty': 'الشحن والكفالة',
    'No ratings yet': 'لا توجد تقييمات بعد', 'Rate it:': 'قيّمه:', 'Rate this product': 'قيّم هذا المنتج',
    'Checkout': 'إتمام الطلب', 'Delivery details': 'تفاصيل التوصيل', 'Full name *': 'الاسم الكامل *', 'Phone *': 'رقم الهاتف *',
    'City / delivery area *': 'المدينة / منطقة التوصيل *', 'Preferred language *': 'اللغة المفضلة *', 'Full address *': 'العنوان الكامل *',
    'Order notes': 'ملاحظات الطلب', 'Optional notes for delivery': 'ملاحظات إضافية للتوصيل (اختياري)', 'Your order': 'طلبك',
    'Subtotal': 'المجموع الفرعي', 'Delivery': 'التوصيل', 'Total': 'الإجمالي', 'Place order': 'تأكيد الطلب',
    'Place order —': 'تأكيد الطلب —', 'Your cart is empty': 'سلة التسوق فارغة', 'Go shopping': 'ابدأ التسوق', 'Edit cart': 'تعديل السلة',
    'Order placed successfully!': 'تم إرسال طلبك بنجاح!', 'Your order code': 'رقم طلبك', 'Save your order code to track or inquire about your order.': 'احتفظ برقم الطلب لتتبعه أو للاستفسار عنه.',
    'Confirm via WhatsApp': 'تأكيد عبر واتساب', 'Track this order': 'تتبّع هذا الطلب', 'Back to home': 'العودة للرئيسية',
    'Create an account or sign in with your email address or phone number.': 'أنشئ حساباً أو سجّل الدخول باستخدام بريدك الإلكتروني أو رقم هاتفك.',
    'Create account': 'إنشاء حساب', 'Sign in': 'تسجيل الدخول', 'Sign out': 'تسجيل الخروج', 'Your loyalty points': 'نقاط الولاء الخاصة بك',
    'Products': 'المنتجات', 'Orders': 'الطلبات', 'Settings': 'الإعدادات', 'Add product': 'إضافة منتج', 'Edit product': 'تعديل المنتج',
    'Price (₪) *': 'السعر (₪) *', 'Compare-at price': 'السعر قبل الخصم', 'Brand *': 'العلامة التجارية *', 'Stock status': 'حالة المخزون',
    'Description': 'الوصف', 'Product images (upload or image links)': 'صور المنتج (رفع أو روابط صور)', 'Upload images': 'رفع الصور',
    'Loyalty points earned per unit': 'نقاط الولاء لكل قطعة', 'Homepage section order': 'ترتيب أقسام الصفحة الرئيسية',
    'Site / store name': 'اسم الموقع / المتجر', 'Short tagline': 'عبارة تعريفية قصيرة', 'Typography & colors': 'الخطوط والألوان',
    'Save site settings': 'حفظ إعدادات الموقع', 'Loyalty rewards': 'مكافآت الولاء', 'Reward / prize details': 'تفاصيل المكافأة / الجائزة',
    'Points required to unlock reward': 'عدد النقاط المطلوبة للحصول على المكافأة', 'Admin URL:': 'رابط لوحة الإدارة:',
    'West Bank': 'الضفة الغربية', 'Jerusalem': 'القدس', '1948 Areas': 'مناطق 1948', 'About': 'من نحن', 'Shipping': 'الشحن',
    'Returns': 'الإرجاع', 'Warranty': 'الكفالة', 'Privacy': 'الخصوصية', 'Terms': 'الشروط', 'Offers': 'العروض', 'Brands': 'العلامات التجارية',
    'No orders in this filter': 'لا توجد طلبات ضمن هذا التصنيف', 'Customer:': 'الزبون:', 'Phone:': 'الهاتف:', 'Address:': 'العنوان:',
    'Payment:': 'الدفع:', 'Approve': 'الموافقة', 'Shipped': 'تم الشحن', 'Delivered': 'تم التسليم', 'Cancel': 'إلغاء', 'Delete order': 'حذف الطلب',
    'Search': 'بحث', 'Name': 'الاسم', 'Price': 'السعر', 'Category': 'الفئة', 'Stock': 'المخزون', 'Actions': 'الإجراءات',
    'Admin dashboard': 'لوحة الإدارة', 'Dashboard overview': 'نظرة عامة على لوحة التحكم', 'Order details': 'تفاصيل الطلب',
    'No products found in this category.': 'لا توجد منتجات في هذه الفئة.', 'No products match your search.': 'لا توجد منتجات تطابق بحثك.',
    'Average rating': 'متوسط التقييم', 'Reviews': 'التقييمات', 'Quantity': 'الكمية', 'Product details': 'تفاصيل المنتج',
    'Variants (color / size / other)': 'الخيارات (اللون / الحجم / غير ذلك)', 'Variant name': 'اسم الخيار', 'Options (comma-separated)': 'الخيارات (مفصولة بفواصل)',
    'Specifications (one per line: Name: Value)': 'المواصفات (سطر لكل عنصر: الاسم: القيمة)',
    'Product image URL or upload': 'رابط صورة المنتج أو رفعها', 'Store identity': 'هوية المتجر', 'Homepage layout': 'تخطيط الصفحة الرئيسية',
    'Product cards per row on desktop': 'عدد بطاقات المنتجات في الصف على الكمبيوتر', '2 columns — larger cards': 'عمودان — بطاقات أكبر',
    '3 columns — balanced': '3 أعمدة — متوازن', '4 columns — compact': '4 أعمدة — حجم أصغر',
    'Heading text color': 'لون العناوين', 'Body text color': 'لون النص الأساسي', 'Font family': 'نوع الخط', 'Font size (px)': 'حجم الخط (بكسل)',
    'Accent color': 'اللون الأساسي',
    'Product cards per row': 'عدد بطاقات المنتجات في الصف', 'Move up': 'تحريك للأعلى', 'Move down': 'تحريك للأسفل',
    'Delivery fee': 'رسوم التوصيل', 'Payment method': 'طريقة الدفع', 'Cash on Delivery (COD)': 'الدفع نقداً عند الاستلام',
    'Your order has been placed.': 'تم تسجيل طلبك.', 'Order status': 'حالة الطلب', 'Pending': 'قيد الانتظار', 'Approved': 'تمت الموافقة',
    'Processing': 'قيد التجهيز', 'Completed': 'مكتمل', 'Save changes': 'حفظ التغييرات', 'Save settings': 'حفظ الإعدادات',
    'Logo image URL or upload': 'رابط الشعار أو رفعه', 'Hero / homepage image URL or upload': 'رابط صورة الواجهة أو رفعها',
    'Homepage hero title': 'عنوان واجهة الصفحة الرئيسية', 'Homepage introduction': 'مقدمة الصفحة الرئيسية', 'Contact details': 'معلومات التواصل',
    'Page content editor': 'محرر محتوى الصفحات',
    'About page': 'صفحة من نحن',
    'Shipping & delivery page': 'صفحة الشحن والتوصيل',
    'Returns & exchanges page': 'صفحة الإرجاع والاستبدال',
    'Warranty page': 'صفحة الكفالة',
    'Privacy policy page': 'صفحة سياسة الخصوصية',
    'Terms & conditions page': 'صفحة الشروط والأحكام',
    'Customer support introduction': 'مقدمة دعم العملاء',
    'Brands page introduction': 'مقدمة صفحة العلامات التجارية',
    'Offers page introduction': 'مقدمة صفحة العروض',
    'About Blitz Gaming': 'حول BLITZ Gaming',
    'Shipping & delivery': 'الشحن والتوصيل',
    'Returns & exchanges': 'الإرجاع والاستبدال',
    'Privacy policy': 'سياسة الخصوصية',
    'Terms & conditions': 'الشروط والأحكام',
    'Customer support': 'دعم العملاء',
    'Shop authentic products from leading brands.': 'تسوّق منتجات أصلية من علامات تجارية رائدة.',
    'Featured deals and highlighted products.': 'عروض مميزة ومنتجات مختارة.',
  },
  Hebrew: {
    'Home': 'בית', 'Shop': 'חנות', 'Shop now': 'קנו עכשיו', 'Shop by category': 'קנייה לפי קטגוריה', 'All categories': 'כל הקטגוריות',
    'Build your PC': 'בנו את המחשב שלכם', 'Processors': 'מעבדים', 'Motherboards': 'לוחות אם', 'Graphics cards': 'כרטיסי מסך',
    'Monitors': 'מסכים', 'Gaming cases': 'מארזי גיימינג', 'Cooling and fans': 'קירור ומאווררים', 'Power supplies': 'ספקי כוח',
    'Gaming accessories': 'אביזרי גיימינג', 'Furniture & room setup': 'ריהוט וסביבת משחק', 'Related products': 'מוצרים קשורים',
    'Product not found': 'המוצר לא נמצא', 'Back to shop': 'חזרה לחנות', 'Search the store...': 'חיפוש בחנות...', 'Search products...': 'חיפוש מוצרים...',
    'Track order': 'מעקב הזמנה', 'Support': 'תמיכה', 'Favorites': 'מועדפים', 'Cart': 'עגלה', 'Your account': 'החשבון שלך',
    'Your next PC': 'המחשב הבא שלכם', 'starts here': 'מתחיל כאן', 'Cash on delivery': 'תשלום בעת המסירה', 'Genuine products': 'מוצרים מקוריים',
    'Delivery areas available at checkout': 'אזורי המשלוח זמינים בקופה', 'Cash on Delivery': 'תשלום בעת המסירה',
    'In stock — ready to ship': 'במלאי — מוכן למשלוח', 'Out of stock': 'אזל מהמלאי', 'Available for pre-order': 'זמין להזמנה מוקדמת',
    'Add to cart': 'הוספה לעגלה', 'Added!': 'נוסף!', 'Buy now — Cash on Delivery': 'קנייה עכשיו — תשלום בעת המסירה',
    'Ask about availability': 'שאלו לגבי זמינות', 'Specifications': 'מפרט', 'Shipping & warranty': 'משלוח ואחריות', 'No ratings yet': 'אין דירוגים עדיין',
    'Rate it:': 'דרגו:', 'Checkout': 'לתשלום', 'Delivery details': 'פרטי משלוח', 'Full name *': 'שם מלא *', 'Phone *': 'טלפון *',
    'City / delivery area *': 'עיר / אזור משלוח *', 'Preferred language *': 'שפה מועדפת *', 'Full address *': 'כתובת מלאה *',
    'Order notes': 'הערות להזמנה', 'Optional notes for delivery': 'הערות משלוח (לא חובה)', 'Your order': 'ההזמנה שלכם', 'Subtotal': 'סכום ביניים',
    'Delivery': 'משלוח', 'Total': 'סה״כ', 'Your cart is empty': 'העגלה ריקה', 'Go shopping': 'למעבר לקניות', 'Edit cart': 'עריכת העגלה',
    'Order placed successfully!': 'ההזמנה נשלחה בהצלחה!', 'Your order code': 'מספר ההזמנה', 'Confirm via WhatsApp': 'אישור דרך WhatsApp',
    'Track this order': 'מעקב אחר ההזמנה', 'Back to home': 'חזרה לבית', 'Create an account or sign in with your email address or phone number.': 'צרו חשבון או התחברו באמצעות כתובת אימייל או מספר טלפון.',
    'Create account': 'יצירת חשבון', 'Sign in': 'התחברות', 'Sign out': 'התנתקות', 'Your loyalty points': 'נקודות הנאמנות שלכם',
    'Products': 'מוצרים', 'Orders': 'הזמנות', 'Settings': 'הגדרות', 'Add product': 'הוספת מוצר', 'Edit product': 'עריכת מוצר',
    'Price (₪) *': 'מחיר (₪) *', 'Compare-at price': 'מחיר קודם', 'Brand *': 'מותג *', 'Stock status': 'מצב מלאי', 'Description': 'תיאור',
    'Product images (upload or image links)': 'תמונות מוצר (העלאה או קישורים)', 'Upload images': 'העלאת תמונות', 'Loyalty points earned per unit': 'נקודות נאמנות לכל יחידה',
    'Homepage section order': 'סדר מקטעי דף הבית', 'Site / store name': 'שם האתר / החנות', 'Short tagline': 'כותרת משנה', 'Typography & colors': 'גופנים וצבעים',
    'Save site settings': 'שמירת הגדרות האתר', 'Loyalty rewards': 'תגמולי נאמנות', 'Reward / prize details': 'פרטי הפרס', 'Points required to unlock reward': 'נקודות הנדרשות לקבלת הפרס',
    'West Bank': 'הגדה המערבית', 'Jerusalem': 'ירושלים', '1948 Areas': 'אזורי 1948', 'About': 'אודות', 'Shipping': 'משלוח', 'Returns': 'החזרות',
    'Warranty': 'אחריות', 'Privacy': 'פרטיות', 'Terms': 'תנאים', 'Offers': 'מבצעים', 'Brands': 'מותגים', 'No orders in this filter': 'אין הזמנות בסינון הזה',
    'Customer:': 'לקוח:', 'Phone:': 'טלפון:', 'Address:': 'כתובת:', 'Payment:': 'תשלום:', 'Approve': 'אישור', 'Shipped': 'נשלח', 'Delivered': 'נמסר',
    'Cancel': 'ביטול', 'Delete order': 'מחיקת הזמנה', 'Search': 'חיפוש', 'Name': 'שם', 'Price': 'מחיר', 'Category': 'קטגוריה', 'Stock': 'מלאי', 'Actions': 'פעולות',
    'Admin dashboard': 'לוח ניהול', 'Dashboard overview': 'סקירת לוח הבקרה', 'Order details': 'פרטי ההזמנה',
    'No products found in this category.': 'לא נמצאו מוצרים בקטגוריה זו.', 'No products match your search.': 'לא נמצאו מוצרים התואמים לחיפוש.',
    'Average rating': 'דירוג ממוצע', 'Reviews': 'ביקורות', 'Quantity': 'כמות', 'Product details': 'פרטי מוצר',
    'Variants (color / size / other)': 'אפשרויות (צבע / גודל / אחר)', 'Variant name': 'שם האפשרות', 'Options (comma-separated)': 'אפשרויות (מופרדות בפסיקים)',
    'Specifications (one per line: Name: Value)': 'מפרט (שורה לכל פריט: שם: ערך)', 'Product image URL or upload': 'קישור תמונה או העלאה',
    'Store identity': 'זהות החנות', 'Homepage layout': 'פריסת דף הבית', 'Product cards per row on desktop': 'כרטיסי מוצרים בכל שורה במחשב',
    '2 columns — larger cards': '2 עמודות — כרטיסים גדולים', '3 columns — balanced': '3 עמודות — מאוזן', '4 columns — compact': '4 עמודות — קומפקטי',
    'Heading text color': 'צבע כותרות', 'Body text color': 'צבע טקסט גוף', 'Font family': 'משפחת גופנים', 'Font size (px)': 'גודל גופן (פיקסלים)',
    'Accent color': 'צבע הדגשה',
    'Product cards per row': 'כרטיסי מוצרים בכל שורה', 'Move up': 'הזזה למעלה', 'Move down': 'הזזה למטה',
    'Delivery fee': 'דמי משלוח', 'Payment method': 'אמצעי תשלום', 'Cash on Delivery (COD)': 'תשלום במזומן בעת המסירה',
    'Your order has been placed.': 'ההזמנה נקלטה.', 'Order status': 'סטטוס הזמנה', 'Pending': 'ממתין', 'Approved': 'אושר',
    'Processing': 'בטיפול', 'Completed': 'הושלם', 'Save changes': 'שמירת שינויים', 'Save settings': 'שמירת הגדרות',
    'Logo image URL or upload': 'קישור ללוגו או העלאה', 'Hero / homepage image URL or upload': 'קישור לתמונת דף הבית או העלאה',
    'Homepage hero title': 'כותרת ראשית בדף הבית', 'Homepage introduction': 'מבוא לדף הבית', 'Contact details': 'פרטי יצירת קשר',
    'Page content editor': 'עורך תוכן דפים',
    'About page': 'עמוד אודות',
    'Shipping & delivery page': 'עמוד משלוחים ואספקה',
    'Returns & exchanges page': 'עמוד החזרות והחלפות',
    'Warranty page': 'עמוד אחריות',
    'Privacy policy page': 'עמוד מדיניות פרטיות',
    'Terms & conditions page': 'עמוד תנאים והגבלות',
    'Customer support introduction': 'מבוא לתמיכת לקוחות',
    'Brands page introduction': 'מבוא לעמוד המותגים',
    'Offers page introduction': 'מבוא לעמוד המבצעים',
    'About Blitz Gaming': 'אודות BLITZ Gaming',
    'Shipping & delivery': 'משלוח ואספקה',
    'Returns & exchanges': 'החזרות והחלפות',
    'Privacy policy': 'מדיניות פרטיות',
    'Terms & conditions': 'תנאים והגבלות',
    'Customer support': 'תמיכת לקוחות',
    'Shop authentic products from leading brands.': 'קנו מוצרים מקוריים ממותגים מובילים.',
    'Featured deals and highlighted products.': 'מבצעים נבחרים ומוצרים מומלצים.',
  },
};

const originalText = new WeakMap<Text, string>();
const lastTranslatedText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const lastTranslatedAttributes = new WeakMap<Element, Map<string, string>>();

function translatedText(value: string, language: PreferredLanguage): string {
  if (language === 'English') return value;
  const trimmed = value.trim();
  const translated = TRANSLATIONS[language][trimmed];
  if (!translated) return value;
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  return `${leading}${translated}${trailing}`;
}

export function TranslationRuntime({ language }: { language: PreferredLanguage }) {
  useEffect(() => {
    const documentRoot = document.documentElement;
    documentRoot.lang = language === 'Arabic' ? 'ar' : language === 'Hebrew' ? 'he' : 'en';
    documentRoot.dir = language === 'English' ? 'ltr' : 'rtl';

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node as Text;
        const lastOutput = lastTranslatedText.get(text);
        let original = originalText.get(text);
        // React may reuse a text node for a new English label. Detect that change
        // rather than accidentally translating from the previous route's phrase.
        if (original === undefined || (lastOutput !== undefined && text.data !== lastOutput)) {
          original = text.data;
          originalText.set(text, original);
        }
        const next = translatedText(original, language);
        lastTranslatedText.set(text, next);
        if (text.data !== next) text.data = next;
      } else if (node instanceof Element) {
        for (const attr of ['placeholder', 'title', 'aria-label']) {
          const existing = node.getAttribute(attr);
          if (existing === null) continue;
          let values = originalAttributes.get(node);
          if (!values) {
            values = new Map<string, string>();
            originalAttributes.set(node, values);
          }
          let lastValues = lastTranslatedAttributes.get(node);
          if (!lastValues) {
            lastValues = new Map<string, string>();
            lastTranslatedAttributes.set(node, lastValues);
          }
          let original = values.get(attr);
          if (original === undefined || (lastValues.has(attr) && existing !== lastValues.get(attr))) {
            original = existing;
            values.set(attr, original);
          }
          const next = translatedText(original, language).trim();
          lastValues.set(attr, next);
          if (existing !== next) node.setAttribute(attr, next);
        }
        node.childNodes.forEach(processNode);
      }
    };

    processNode(document.body);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'characterData') processNode(record.target);
        for (const node of record.addedNodes) processNode(node);
        if (record.type === 'attributes') processNode(record.target);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] });
    return () => observer.disconnect();
  }, [language]);

  return null;
}
