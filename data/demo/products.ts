import type { Allergen, ArtKind, Badge, CategoryId, Config, CustomizerKind, DietaryTag, L10n, OptionGroup, Product } from "@/lib/api/types";
import {
  addonOptions, burgerOptions, crepeSavoryOptions, crepeSweetOptions, drinkOptions, pizzaOptions,
} from "./options";

const n = (en: string, ar: string): L10n => ({ en, ar });

interface P {
  id: string;
  cat: CategoryId;
  name: L10n;
  desc: L10n;
  price: number;
  art: ArtKind;
  cust?: CustomizerKind;
  options?: OptionGroup[];
  defaults?: Config;
  badges?: Badge[];
  tags?: DietaryTag[];
  ing: L10n[];
  allergens?: Allergen[];
  prep?: number;
  rating?: number;
  count?: number;
  pop: number;
  featured?: boolean;
  comboOf?: string[];
  calories?: number;
}

const p = (x: P): Product => {
  const options = x.options ?? [];
  const defaults: Config = {};
  for (const g of options) {
    if (g.kind === "single") defaults[g.id] = [g.choices.find((c) => c.price === 0)?.id ?? g.choices[0].id];
    else defaults[g.id] = [];
  }
  // size defaults to the middle/regular choice
  if (options.some((g) => g.id === "size")) {
    defaults.size = [x.cust === "pizza" ? "medium" : "regular"];
  }
  Object.assign(defaults, x.defaults);
  return {
    id: x.id,
    slug: x.id,
    category: x.cat,
    name: x.name,
    description: x.desc,
    basePrice: x.price,
    art: x.art,
    customizer: x.cust ?? null,
    options,
    defaults,
    badges: x.badges ?? [],
    tags: x.tags ?? [],
    ingredients: x.ing,
    allergens: x.allergens,
    prepMinutes: x.prep,
    calories: x.calories,
    rating: x.rating,
    ratingCount: x.count,
    popularity: x.pop,
    featured: x.featured,
    available: true,
    comboOf: x.comboOf,
  };
};

const pz = (id: string, name: L10n, desc: L10n, price: number, d: Config, extra: Partial<P> & { pop: number }) =>
  p({ id, cat: "pizza", name, desc, price, art: "pizza", cust: "pizza", options: pizzaOptions,
      defaults: d, allergens: ["gluten", "dairy"], prep: 15, ...extra, ing: extra.ing ?? [] });

export const products: Product[] = [
  pz("margherita", n("Margherita", "مارجريتا"),
    n("San Marzano tomato, creamy mozzarella and torn basil on a blistered crust.", "طماطم سان مارزانو وموتزاريلا كريمية وريحان على عجينة محمّصة."),
    140, { sauce: ["marinara"], toppings: ["basil"] },
    { badges: ["bestseller", "vegetarian"], tags: ["vegetarian"], pop: 98, rating: 4.8, count: 214, featured: true,
      ing: [n("Tomato", "طماطم"), n("Mozzarella", "موتزاريلا"), n("Basil", "ريحان"), n("Olive oil", "زيت زيتون")] }),
  pz("pepperoni-classic", n("Pepperoni Classic", "ببروني كلاسيك"),
    n("Generous cupped pepperoni, double-baked until the edges curl and crisp.", "شرائح ببروني سخية تُخبز حتى تتقعّر وتقرمش."),
    175, { sauce: ["marinara"], toppings: ["pepperoni"] },
    { badges: ["bestseller", "spicy"], tags: ["spicy"], pop: 96, rating: 4.9, count: 301, featured: true,
      ing: [n("Pepperoni", "ببروني"), n("Mozzarella", "موتزاريلا"), n("Tomato sauce", "صلصة طماطم")] }),
  pz("garden-harvest", n("Garden Harvest", "حصاد الحديقة"),
    n("Mushrooms, olives, green peppers and red onion over bright marinara.", "مشروم وزيتون وفلفل أخضر وبصل أحمر فوق مارينارا منعشة."),
    165, { sauce: ["marinara"], toppings: ["mushroom", "olive", "pepper", "onion"] },
    { badges: ["vegetarian"], tags: ["vegetarian"], pop: 70, rating: 4.6, count: 98,
      ing: [n("Mushrooms", "مشروم"), n("Olives", "زيتون"), n("Peppers", "فلفل"), n("Onion", "بصل")] }),
  pz("ranch-supreme", n("Ranch Supreme", "رانش سوبريم"),
    n("Cool ranch base, pepperoni, mushrooms and peppers – our signature twist.", "قاعدة رانش باردة مع ببروني ومشروم وفلفل – لمستنا المميزة."),
    185, { sauce: ["ranch"], toppings: ["pepperoni", "mushroom", "pepper"] },
    { badges: ["signature", "new"], pop: 88, rating: 4.7, count: 77, featured: true,
      ing: [n("Ranch", "رانش"), n("Pepperoni", "ببروني"), n("Mushrooms", "مشروم"), n("Peppers", "فلفل")] }),
  pz("bbq-fire", n("BBQ Fire", "باربكيو فاير"),
    n("Smoky BBQ sauce, red onion, peppers and a dusting of chili flakes.", "صلصة باربكيو مدخنة مع بصل وفلفل ورشة فلفل حار."),
    170, { sauce: ["bbq"], toppings: ["onion", "pepper"], spice: ["hot"] },
    { badges: ["spicy", "signature"], tags: ["spicy"], pop: 74, rating: 4.5, count: 64,
      ing: [n("BBQ sauce", "صلصة باربكيو"), n("Onion", "بصل"), n("Peppers", "فلفل"), n("Chili", "فلفل حار")] }),
  pz("pesto-verde", n("Pesto Verde", "بيستو فيردي"),
    n("Basil pesto, olives and fresh basil – green, fragrant and vegetarian.", "بيستو الريحان والزيتون وريحان طازج – أخضر وعطري ونباتي."),
    168, { sauce: ["pesto"], toppings: ["olive", "basil"] },
    { badges: ["seasonal", "vegetarian"], tags: ["vegetarian"], pop: 52, rating: 4.4, count: 31,
      allergens: ["gluten", "dairy", "nuts"],
      ing: [n("Pesto", "بيستو"), n("Olives", "زيتون"), n("Basil", "ريحان")] }),

  p({ id: "nutella-banana", cat: "crepes", name: n("Choco Banana Crepe", "كريب شوكولاتة وموز"),
    desc: n("Warm milk chocolate, sliced banana and toasted nuts, folded to order.", "شوكولاتة دافئة وموز وفستق محمّص، يُطوى عند الطلب."),
    price: 85, art: "crepe", cust: "crepe", options: crepeSweetOptions,
    defaults: { chocolate: ["milk"], fruit: ["banana"], crunch: ["nuts"] },
    badges: ["bestseller"], tags: ["vegetarian"], allergens: ["gluten", "dairy", "egg", "nuts"], prep: 10,
    ing: [n("Crepe", "كريب"), n("Chocolate", "شوكولاتة"), n("Banana", "موز"), n("Nuts", "مكسرات")],
    pop: 92, rating: 4.9, count: 188, featured: true }),
  p({ id: "strawberry-dream", cat: "crepes", name: n("Strawberry Dream Crepe", "كريب حلم الفراولة"),
    desc: n("White chocolate, ripe strawberries and biscuit crumb.", "شوكولاتة بيضاء وفراولة ناضجة وفتات بسكويت."),
    price: 95, art: "crepe", cust: "crepe", options: crepeSweetOptions,
    defaults: { chocolate: ["white"], fruit: ["strawberry"], crunch: ["biscuit"] },
    badges: ["new"], tags: ["vegetarian"], allergens: ["gluten", "dairy", "egg"], prep: 10,
    ing: [n("Crepe", "كريب"), n("White chocolate", "شوكولاتة بيضاء"), n("Strawberry", "فراولة")],
    pop: 80, rating: 4.7, count: 120 }),
  p({ id: "chicken-mushroom-crepe", cat: "crepes", name: n("Chicken & Mushroom Crepe", "كريب دجاج ومشروم"),
    desc: n("Savory crepe with grilled chicken, mushrooms and melted cheese.", "كريب مالح بدجاج مشوي ومشروم وجبنة ذائبة."),
    price: 110, art: "crepe", cust: "crepe", options: crepeSavoryOptions,
    defaults: { fillings: ["chicken", "mushroom", "cheese"] },
    allergens: ["gluten", "dairy", "egg"], prep: 12,
    ing: [n("Chicken", "دجاج"), n("Mushrooms", "مشروم"), n("Cheese", "جبنة")], pop: 66, rating: 4.5, count: 54 }),
  p({ id: "dark-nut-crepe", cat: "crepes", name: n("Dark Crunch Crepe", "كريب دارك كرنش"),
    desc: n("Dark chocolate with crushed nuts and biscuit crumb.", "شوكولاتة داكنة مع مكسرات وفتات بسكويت."),
    price: 90, art: "crepe", cust: "crepe", options: crepeSweetOptions,
    defaults: { chocolate: ["dark"], fruit: [], crunch: ["nuts", "biscuit"] },
    tags: ["vegetarian"], allergens: ["gluten", "dairy", "egg", "nuts"], prep: 10,
    ing: [n("Dark chocolate", "شوكولاتة داكنة"), n("Nuts", "مكسرات")], pop: 58 }),

  p({ id: "classic-smash", cat: "burgers", name: n("Classic Smash", "كلاسيك سماش"),
    desc: n("Smashed beef patty, cheddar, crisp lettuce, tomato and house sauce.", "شريحة لحم سماش وشيدر وخس وطماطم وصلصة خاصة."),
    price: 120, art: "burger", cust: "burger", options: burgerOptions,
    defaults: { cheese: ["cheddar"], extras: ["lettuce", "tomato"] },
    badges: ["bestseller"], allergens: ["gluten", "dairy", "egg", "sesame"], prep: 12,
    ing: [n("Beef patty", "لحم بقري"), n("Cheddar", "شيدر"), n("Lettuce", "خس"), n("Tomato", "طماطم")],
    pop: 90, rating: 4.8, count: 166, featured: true }),
  p({ id: "double-stack", cat: "burgers", name: n("Double Stack", "دبل ستاك"),
    desc: n("Two patties, double cheddar and beef bacon. Hungry-only.", "شريحتان وشيدر مضاعف وبيف بيكون. للجائعين فقط."),
    price: 150, art: "burger", cust: "burger", options: burgerOptions,
    defaults: { patty: ["double"], cheese: ["cheddar"], extras: ["lettuce", "tomato", "bacon"] },
    badges: ["signature"], allergens: ["gluten", "dairy", "egg", "sesame"], prep: 14,
    ing: [n("Two patties", "شريحتان"), n("Cheddar", "شيدر"), n("Beef bacon", "بيف بيكون")], pop: 84, rating: 4.7, count: 91 }),
  p({ id: "veggie-crunch", cat: "burgers", name: n("Veggie Crunch", "فيجي كرنش"),
    desc: n("Crisp vegetable patty with lettuce, tomato and herb mayo.", "برجر خضار مقرمش مع خس وطماطم ومايونيز بالأعشاب."),
    price: 105, art: "burger", cust: "burger", options: burgerOptions,
    defaults: { cheese: ["none"], extras: ["lettuce", "tomato"] }, tags: ["vegetarian"],
    allergens: ["gluten", "egg", "sesame"], prep: 12, ing: [n("Veggie patty", "برجر خضار"), n("Lettuce", "خس")], pop: 48 }),
  p({ id: "spicy-chicken", cat: "burgers", name: n("Spicy Chicken Crisp", "دجاج مقرمش حار"),
    desc: n("Buttermilk-crisp chicken, chili sauce and cooling slaw.", "دجاج مقرمش مع صلصة حارة وسلطة كرنب."),
    price: 115, art: "burger", cust: "burger", options: burgerOptions,
    defaults: { cheese: ["none"], extras: ["lettuce"] }, badges: ["spicy"], tags: ["spicy"],
    allergens: ["gluten", "dairy", "egg"], prep: 13, ing: [n("Crispy chicken", "دجاج مقرمش"), n("Chili sauce", "صلصة حارة")], pop: 76, rating: 4.6, count: 72 }),

  p({ id: "penne-arrabbiata", cat: "pasta", name: n("Penne Arrabbiata", "بيني أرابياتا"),
    desc: n("Penne in a fiery tomato-garlic sauce.", "بيني بصلصة طماطم وثوم حارة."),
    price: 105, art: "pasta", options: addonOptions, tags: ["vegetarian", "spicy"], badges: ["spicy", "vegetarian"],
    allergens: ["gluten"], ing: [n("Penne", "بيني"), n("Tomato", "طماطم"), n("Chili", "فلفل حار")], pop: 60 }),
  p({ id: "alfredo-chicken", cat: "pasta", name: n("Chicken Alfredo", "دجاج ألفريدو"),
    desc: n("Fettuccine, grilled chicken, parmesan cream.", "فيتوتشيني ودجاج مشوي وصلصة كريمة بالبارميزان."),
    price: 135, art: "pasta", options: addonOptions, allergens: ["gluten", "dairy"], badges: ["bestseller"],
    ing: [n("Fettuccine", "فيتوتشيني"), n("Chicken", "دجاج"), n("Parmesan", "بارميزان")], pop: 82, rating: 4.6, count: 83 }),
  p({ id: "pesto-pasta", cat: "pasta", name: n("Pesto Fusilli", "فوسيلي بيستو"),
    desc: n("Fusilli tossed in basil pesto and roasted tomatoes.", "فوسيلي مع بيستو الريحان وطماطم محمّصة."),
    price: 118, art: "pasta", options: addonOptions, tags: ["vegetarian"], allergens: ["gluten", "dairy", "nuts"],
    ing: [n("Fusilli", "فوسيلي"), n("Pesto", "بيستو")], pop: 44 }),

  p({ id: "garlic-knots", cat: "appetizers", name: n("Garlic Knots", "عقد الثوم"),
    desc: n("Soft knots brushed with garlic butter and herbs.", "عقد طرية بزبدة الثوم والأعشاب."),
    price: 55, art: "appetizer", options: addonOptions, tags: ["vegetarian"], allergens: ["gluten", "dairy"],
    ing: [n("Dough", "عجين"), n("Garlic", "ثوم"), n("Herbs", "أعشاب")], pop: 72 }),
  p({ id: "mozzarella-sticks", cat: "appetizers", name: n("Mozzarella Sticks", "أصابع الموتزاريلا"),
    desc: n("Golden, stretchy and served with marinara.", "ذهبية وممطوطة تُقدَّم مع المارينارا."),
    price: 70, art: "appetizer", options: addonOptions, tags: ["vegetarian"], allergens: ["gluten", "dairy", "egg"],
    ing: [n("Mozzarella", "موتزاريلا"), n("Breadcrumbs", "بقسماط")], pop: 68 }),

  p({ id: "choco-lava", cat: "desserts", name: n("Choco Lava Cake", "كيكة الحمم"),
    desc: n("Warm cake with a molten chocolate heart.", "كيكة دافئة بقلب شوكولاتة سائل."),
    price: 75, art: "dessert", tags: ["vegetarian"], badges: ["bestseller"], allergens: ["gluten", "dairy", "egg"],
    ing: [n("Chocolate", "شوكولاتة"), n("Butter", "زبدة")], pop: 86, rating: 4.9, count: 143, featured: true }),
  p({ id: "tiramisu", cat: "desserts", name: n("Tiramisu", "تيراميسو"),
    desc: n("Espresso-soaked layers with mascarpone cream.", "طبقات مشبعة بالإسبريسو مع كريمة الماسكاربوني."),
    price: 80, art: "dessert", tags: ["vegetarian"], allergens: ["gluten", "dairy", "egg"],
    ing: [n("Mascarpone", "ماسكاربوني"), n("Espresso", "إسبريسو")], pop: 64 }),
  p({ id: "cinnamon-rolls", cat: "desserts", name: n("Cinnamon Rolls", "رولز القرفة"),
    desc: n("Pull-apart rolls with vanilla glaze.", "رولز طرية بصلصة الفانيليا."),
    price: 65, art: "dessert", tags: ["vegetarian"], allergens: ["gluten", "dairy", "egg"],
    ing: [n("Cinnamon", "قرفة"), n("Vanilla glaze", "جلاز الفانيليا")], pop: 55 }),

  p({ id: "lemon-mint", cat: "drinks", name: n("Lemon Mint", "ليمون بالنعناع"),
    desc: n("Freshly squeezed lemon, mint and crushed ice.", "ليمون طازج ونعناع وثلج مجروش."),
    price: 40, art: "drink", options: drinkOptions, tags: ["vegan", "vegetarian"], badges: ["bestseller"],
    ing: [n("Lemon", "ليمون"), n("Mint", "نعناع")], pop: 78 }),
  p({ id: "strawberry-fizz", cat: "drinks", name: n("Strawberry Fizz", "فيز الفراولة"),
    desc: n("Strawberry purée topped with sparkling water.", "هريس الفراولة مع مياه غازية."),
    price: 48, art: "drink", options: drinkOptions, tags: ["vegan", "vegetarian"], badges: ["new"],
    ing: [n("Strawberry", "فراولة"), n("Sparkling water", "مياه غازية")], pop: 62 }),
  p({ id: "iced-latte", cat: "drinks", name: n("Iced Latte", "آيس لاتيه"),
    desc: n("Double espresso over cold milk.", "إسبريسو مزدوج فوق حليب بارد."),
    price: 52, art: "drink", options: drinkOptions, tags: ["vegetarian"], allergens: ["dairy"],
    ing: [n("Espresso", "إسبريسو"), n("Milk", "حليب")], pop: 58 }),

  p({ id: "pizza-duo", cat: "combos", name: n("Pizza Duo Combo", "كومبو بيتزا دو"),
    desc: n("Margherita + Pepperoni Classic + two drinks.", "مارجريتا + ببروني كلاسيك + مشروبان."),
    price: 330, art: "combo", comboOf: ["margherita", "pepperoni-classic", "lemon-mint", "lemon-mint"],
    options: addonOptions, allergens: ["gluten", "dairy"], badges: ["bestseller"],
    ing: [n("2 pizzas", "بيتزتان"), n("2 drinks", "مشروبان")], pop: 85, rating: 4.7, count: 59 }),
  p({ id: "burger-meal", cat: "combos", name: n("Burger Meal", "وجبة برجر"),
    desc: n("Classic Smash + garlic knots + a drink.", "كلاسيك سماش + عقد الثوم + مشروب."),
    price: 195, art: "combo", comboOf: ["classic-smash", "garlic-knots", "lemon-mint"],
    options: addonOptions, allergens: ["gluten", "dairy", "egg", "sesame"],
    ing: [n("Burger", "برجر"), n("Starter", "مقبلات"), n("Drink", "مشروب")], pop: 70 }),

  p({ id: "truffle-mushroom", cat: "seasonal", name: n("Autumn Mushroom Pizza", "بيتزا مشروم الخريف"),
    desc: n("Seasonal pizza with roasted mushrooms and cream base.", "بيتزا موسمية بالمشروم المحمّص وقاعدة كريمية."),
    price: 195, art: "pizza", cust: "pizza", options: pizzaOptions,
    defaults: { sauce: ["ranch"], toppings: ["mushroom", "onion", "basil"] },
    badges: ["seasonal", "new", "vegetarian"], tags: ["vegetarian"], allergens: ["gluten", "dairy"], prep: 16,
    ing: [n("Mushrooms", "مشروم"), n("Onion", "بصل")], pop: 50 }),
];

export const productById = (id: string) => products.find((x) => x.id === id);
