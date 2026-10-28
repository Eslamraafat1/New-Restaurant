/** Shared data models. A real backend should return these same shapes (see docs/BACKEND_INTEGRATION.md). */

export type Locale = "en" | "ar";
export type L10n = Record<Locale, string>;

export type CategoryId =
  | "pizza"
  | "crepes"
  | "burgers"
  | "pasta"
  | "appetizers"
  | "desserts"
  | "drinks"
  | "combos"
  | "seasonal";

export interface Category {
  id: CategoryId;
  slug: string;
  name: L10n;
  tagline: L10n;
  /** accent colour used by category-specific scenes */
  accent: string;
  order: number;
}

export type DietaryTag = "vegetarian" | "vegan" | "spicy" | "gluten-free-option";
export type Allergen = "gluten" | "dairy" | "egg" | "nuts" | "soy" | "sesame" | "fish";
export type Badge = "bestseller" | "new" | "signature" | "spicy" | "vegetarian" | "seasonal";

export interface OptionChoice {
  id: string;
  name: L10n;
  /** additional price in the active currency (0 when included) */
  price: number;
  available?: boolean;
}

export interface OptionGroup {
  id: string;
  kind: "single" | "multi";
  name: L10n;
  required?: boolean;
  /** only for multi groups */
  max?: number;
  choices: OptionChoice[];
}

/** groupId -> selected choice ids */
export type Config = Record<string, string[]>;

export type CustomizerKind = "pizza" | "crepe" | "burger" | null;
export type ArtKind = "pizza" | "crepe" | "burger" | "pasta" | "appetizer" | "dessert" | "drink" | "combo";

export interface Product {
  id: string;
  slug: string;
  category: CategoryId;
  name: L10n;
  description: L10n;
  basePrice: number;
  art: ArtKind;
  customizer: CustomizerKind;
  options: OptionGroup[];
  /** the product's default configuration. Choices listed here are included in the base price. */
  defaults: Config;
  badges: Badge[];
  tags: DietaryTag[];
  ingredients: L10n[];
  allergens?: Allergen[];
  /** minutes, only when supplied */
  prepMinutes?: number;
  /** only when real data exists */
  calories?: number;
  rating?: number;
  ratingCount?: number;
  popularity: number;
  featured?: boolean;
  available: boolean;
  /** items inside a combo: product ids */
  comboOf?: string[];
}

export interface Ingredient {
  id: string;
  name: L10n;
  note: L10n;
  color: string;
}

export interface Offer {
  id: string;
  title: L10n;
  body: L10n;
  code?: string;
  /** ISO date. Shown ONLY when a real date is provided. */
  endsAt?: string;
}

export interface Branch {
  id: string;
  name: L10n;
  area: L10n;
  /** sample entries must set this so the UI labels them */
  sample: boolean;
  address?: L10n;
  phone?: string;
  hours?: L10n;
  mapUrl?: string;
}

export interface CartLine {
  key: string;
  productId: string;
  config: Config;
  qty: number;
  unitPrice: number;
  note?: string;
}

export type FulfilmentType = "delivery" | "pickup";
export type PaymentMethod = "cash" | "card-demo";

export interface OrderRequest {
  lines: CartLine[];
  customer: { name: string; phone: string; email?: string };
  fulfilment: FulfilmentType;
  address?: string;
  branchId?: string;
  notes?: string;
  payment: PaymentMethod;
  coupon?: string;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
}

export interface OrderResponse {
  id: string;
  /** true only for locally simulated orders */
  demo: boolean;
  status: "accepted";
  createdAt: string;
  totals: OrderTotals;
  request: OrderRequest;
}

export interface MenuResponse {
  categories: Category[];
  products: Product[];
}
