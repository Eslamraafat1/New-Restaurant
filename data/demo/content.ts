import type { Branch, Ingredient, L10n, Offer } from "@/lib/api/types";

const n = (en: string, ar: string): L10n => ({ en, ar });

export const ingredients: Ingredient[] = [
  { id: "tomato", name: n("Tomatoes", "الطماطم"), note: n("Crushed the day they arrive.", "تُهرس يوم وصولها."), color: "#d63a22" },
  { id: "mozzarella", name: n("Mozzarella", "الموتزاريلا"), note: n("Milky, stretchy and melted slowly.", "كريمية وممطوطة وتذوب ببطء."), color: "#f6e9c8" },
  { id: "basil", name: n("Basil", "الريحان"), note: n("Torn, never chopped.", "يُقطّع باليد لا بالسكين."), color: "#3f7a2c" },
  { id: "pepperoni", name: n("Pepperoni", "الببروني"), note: n("Thin-sliced so it cups and crisps.", "شرائح رفيعة تتقعّر وتقرمش."), color: "#b02a1b" },
  { id: "mushroom", name: n("Mushrooms", "المشروم"), note: n("Seared before they meet the dough.", "يُحمّر قبل أن يلتقي بالعجين."), color: "#b79c7c" },
  { id: "chocolate", name: n("Chocolate", "الشوكولاتة"), note: n("Melted to order for every crepe.", "تُذاب عند الطلب لكل كريب."), color: "#4a2616" },
];

export const offers: Offer[] = [
  { id: "welcome", title: n("Welcome offer", "عرض الترحيب"),
    body: n("Use code WELCOME30 at checkout for EGP 30 off your first demo order.", "استخدم الكود WELCOME30 للحصول على خصم ٣٠ جنيه في طلبك التجريبي."), code: "WELCOME30" },
  { id: "crave10", title: n("Crave 10", "كريف ١٠"),
    body: n("Use code CRAVE10 for 10% off any order.", "استخدم الكود CRAVE10 لخصم ١٠٪ على أي طلب."), code: "CRAVE10" },
  { id: "free-delivery", title: n("Free delivery", "توصيل مجاني"),
    body: n("Delivery is free on orders over EGP 400.", "التوصيل مجاني على الطلبات فوق ٤٠٠ جنيه.") },
];

export const branches: Branch[] = [
  { id: "sample-1", sample: true, name: n("Sample Branch A", "فرع تجريبي أ"), area: n("City centre (placeholder)", "وسط المدينة (مثال)") },
  { id: "sample-2", sample: true, name: n("Sample Branch B", "فرع تجريبي ب"), area: n("Riverside (placeholder)", "الكورنيش (مثال)") },
];

export const faqs: { q: L10n; a: L10n }[] = [
  { q: n("Is this a real restaurant?", "هل هذا مطعم حقيقي؟"),
    a: n("CRUST & CRAVE is a fictional brand and this is a demo storefront. Orders are simulated in your browser and do not reach a kitchen.", "كراست آند كريف علامة خيالية وهذا متجر تجريبي. الطلبات تُحاكى داخل المتصفح ولا تصل لأي مطبخ.") },
  { q: n("Can I customise my pizza?", "هل يمكنني تخصيص البيتزا؟"),
    a: n("Yes. Choose size, crust, sauce, cheese and up to six toppings. The pizza preview and price update as you choose.", "نعم. اختر الحجم والعجينة والصلصة والجبن وحتى ستة إضافات، وتتغير الصورة والسعر فوراً.") },
  { q: n("How is the delivery fee calculated?", "كيف تُحسب رسوم التوصيل؟"),
    a: n("A flat demo fee applies to delivery orders and is waived above the free-delivery threshold shown in your cart.", "تُطبق رسوم تجريبية ثابتة وتُلغى فوق حد التوصيل المجاني الظاهر في السلة.") },
  { q: n("Do you list allergens?", "هل تذكرون مسببات الحساسية؟"),
    a: n("Allergens are listed on each product where data exists. Always confirm with the restaurant if you have a serious allergy.", "تظهر المسببات في كل منتج عند توفر البيانات. تأكد دائماً مع المطعم إن كانت لديك حساسية شديدة.") },
  { q: n("Which payment methods work?", "ما وسائل الدفع المتاحة؟"),
    a: n("The demo supports cash-on-delivery and a card UI preview only. No payment is taken.", "يدعم العرض التجريبي الدفع عند الاستلام وواجهة بطاقة فقط. لا يتم تحصيل أي مبلغ.") },
];

export const reviews: { id: string; name: L10n; text: L10n; stars: number }[] = [
  { id: "r1", stars: 5, name: n("Sample reviewer 1", "عميل تجريبي ١"),
    text: n("The crust had that blistered crunch and the basil smelled incredible.", "العجينة مقرمشة والريحان رائحته رائعة.") },
  { id: "r2", stars: 5, name: n("Sample reviewer 2", "عميل تجريبي ٢"),
    text: n("The choco-banana crepe disappeared in two minutes flat.", "كريب الشوكولاتة والموز اختفى في دقيقتين.") },
  { id: "r3", stars: 4, name: n("Sample reviewer 3", "عميل تجريبي ٣"),
    text: n("Double Stack is huge. Bring a friend or a very empty stomach.", "الدبل ستاك ضخم. أحضر صديقاً أو معدة فارغة.") },
];
