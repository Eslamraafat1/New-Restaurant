import type { OptionGroup } from "@/lib/api/types";

const n = (en: string, ar: string) => ({ en, ar });

export const pizzaOptions: OptionGroup[] = [
  { id: "size", kind: "single", required: true, name: n("Size", "الحجم"), choices: [
    { id: "small", name: n('Small 8"', 'صغير ٨"'), price: -30 },
    { id: "medium", name: n('Medium 11"', 'وسط ١١"'), price: 0 },
    { id: "large", name: n('Large 14"', 'كبير ١٤"'), price: 55 },
  ] },
  { id: "crust", kind: "single", required: true, name: n("Crust", "العجينة"), choices: [
    { id: "classic", name: n("Classic", "كلاسيك"), price: 0 },
    { id: "thin", name: n("Thin & crisp", "رفيعة ومقرمشة"), price: 0 },
    { id: "sourdough", name: n("Sourdough", "ساوردو"), price: 15 },
    { id: "stuffed", name: n("Cheese-stuffed", "محشوة جبنة"), price: 30 },
  ] },
  { id: "sauce", kind: "single", required: true, name: n("Sauce", "الصلصة"), choices: [
    { id: "marinara", name: n("Marinara", "مارينارا"), price: 0 },
    { id: "ranch", name: n("Ranch", "رانش"), price: 10 },
    { id: "bbq", name: n("Smoky BBQ", "باربكيو"), price: 10 },
    { id: "pesto", name: n("Basil pesto", "بيستو الريحان"), price: 14 },
  ] },
  { id: "cheese", kind: "single", required: true, name: n("Cheese", "الجبن"), choices: [
    { id: "regular", name: n("Mozzarella", "موتزاريلا"), price: 0 },
    { id: "extra", name: n("Extra cheese", "جبنة إضافية"), price: 25 },
  ] },
  { id: "toppings", kind: "multi", max: 6, name: n("Toppings", "الإضافات"), choices: [
    { id: "pepperoni", name: n("Pepperoni", "ببروني"), price: 18 },
    { id: "mushroom", name: n("Mushrooms", "مشروم"), price: 12 },
    { id: "olive", name: n("Black olives", "زيتون أسود"), price: 10 },
    { id: "pepper", name: n("Green peppers", "فلفل أخضر"), price: 10 },
    { id: "onion", name: n("Red onion", "بصل أحمر"), price: 8 },
    { id: "basil", name: n("Fresh basil", "ريحان طازج"), price: 6 },
  ] },
  { id: "extras", kind: "multi", max: 3, name: n("Double up", "ضاعف"), choices: [
    { id: "x-pepperoni", name: n("Extra pepperoni", "ببروني إضافي"), price: 15 },
    { id: "x-mushroom", name: n("Extra mushrooms", "مشروم إضافي"), price: 10 },
    { id: "x-olive", name: n("Extra olives", "زيتون إضافي"), price: 8 },
  ] },
  { id: "spice", kind: "single", name: n("Heat", "الحرارة"), choices: [
    { id: "mild", name: n("Mild", "عادي"), price: 0 },
    { id: "hot", name: n("Chili flakes", "فلفل حار"), price: 0 },
  ] },
];

export const crepeSweetOptions: OptionGroup[] = [
  { id: "size", kind: "single", required: true, name: n("Size", "الحجم"), choices: [
    { id: "regular", name: n("Regular", "عادي"), price: 0 },
    { id: "large", name: n("Large", "كبير"), price: 30 },
  ] },
  { id: "chocolate", kind: "single", required: true, name: n("Chocolate", "الشوكولاتة"), choices: [
    { id: "milk", name: n("Milk chocolate", "شوكولاتة بالحليب"), price: 0 },
    { id: "dark", name: n("Dark chocolate", "شوكولاتة داكنة"), price: 0 },
    { id: "white", name: n("White chocolate", "شوكولاتة بيضاء"), price: 8 },
    { id: "none", name: n("No chocolate", "بدون شوكولاتة"), price: -10 },
  ] },
  { id: "fruit", kind: "multi", max: 3, name: n("Fruit", "الفاكهة"), choices: [
    { id: "banana", name: n("Banana", "موز"), price: 10 },
    { id: "strawberry", name: n("Strawberry", "فراولة"), price: 14 },
  ] },
  { id: "crunch", kind: "multi", max: 2, name: n("Crunch", "المقرمشات"), choices: [
    { id: "nuts", name: n("Crushed nuts", "مكسرات مجروشة"), price: 12 },
    { id: "biscuit", name: n("Biscuit crumbs", "فتات البسكويت"), price: 8 },
  ] },
  { id: "filling", kind: "single", name: n("Filling", "الحشو"), choices: [
    { id: "standard", name: n("Standard", "عادي"), price: 0 },
    { id: "extra", name: n("Extra filling", "حشو إضافي"), price: 15 },
  ] },
];

export const crepeSavoryOptions: OptionGroup[] = [
  { id: "size", kind: "single", required: true, name: n("Size", "الحجم"), choices: [
    { id: "regular", name: n("Regular", "عادي"), price: 0 },
    { id: "large", name: n("Large", "كبير"), price: 30 },
  ] },
  { id: "fillings", kind: "multi", max: 4, name: n("Fillings", "الحشوات"), choices: [
    { id: "chicken", name: n("Chicken", "دجاج"), price: 20 },
    { id: "cheese", name: n("Cheese", "جبنة"), price: 12 },
    { id: "mushroom", name: n("Mushrooms", "مشروم"), price: 12 },
    { id: "spinach", name: n("Spinach", "سبانخ"), price: 8 },
  ] },
  { id: "filling", kind: "single", name: n("Filling", "الحشو"), choices: [
    { id: "standard", name: n("Standard", "عادي"), price: 0 },
    { id: "extra", name: n("Extra filling", "حشو إضافي"), price: 15 },
  ] },
];

export const burgerOptions: OptionGroup[] = [
  { id: "patty", kind: "single", required: true, name: n("Patty", "الشريحة"), choices: [
    { id: "single", name: n("Single", "واحدة"), price: 0 },
    { id: "double", name: n("Double", "مزدوجة"), price: 45 },
  ] },
  { id: "cheese", kind: "single", name: n("Cheese", "الجبن"), choices: [
    { id: "none", name: n("No cheese", "بدون جبن"), price: 0 },
    { id: "cheddar", name: n("Cheddar", "شيدر"), price: 10 },
  ] },
  { id: "extras", kind: "multi", max: 3, name: n("Extras", "إضافات"), choices: [
    { id: "lettuce", name: n("Lettuce", "خس"), price: 0 },
    { id: "tomato", name: n("Tomato", "طماطم"), price: 0 },
    { id: "bacon", name: n("Beef bacon", "بيف بيكون"), price: 25 },
  ] },
];

export const addonOptions: OptionGroup[] = [
  { id: "note", kind: "multi", max: 2, name: n("Add-ons", "إضافات"), choices: [
    { id: "extra-sauce", name: n("Extra sauce", "صلصة إضافية"), price: 6 },
    { id: "extra-cheese", name: n("Extra cheese", "جبنة إضافية"), price: 12 },
  ] },
];

export const drinkOptions: OptionGroup[] = [
  { id: "size", kind: "single", required: true, name: n("Size", "الحجم"), choices: [
    { id: "regular", name: n("Regular", "عادي"), price: 0 },
    { id: "large", name: n("Large", "كبير"), price: 10 },
  ] },
];
