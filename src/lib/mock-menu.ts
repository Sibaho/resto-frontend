/**
 * Menu domain types (mirror the Laravel API resources) + demo data so the diner
 * UI runs standalone. In production these come from `GET /api/v1/menu`.
 */

export type ModifierOption = {
  id: string;
  name: string;
  priceDelta: number;
};

export type ModifierGroup = {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  options: ModifierOption[];
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  tags: string[];
  modifierGroups: ModifierGroup[];
};

export type Category = {
  id: string;
  name: string;
};

export type Restaurant = {
  name: string;
  tableLabel: string;
  currency: string;
  taxRate: number;
};

export const restaurant: Restaurant = {
  name: "Sakura Tei",
  tableLabel: "Table 12",
  currency: "IDR",
  taxRate: 0.11,
};

export const categories: Category[] = [
  { id: "c-sushi", name: "Sushi" },
  { id: "c-ramen", name: "Ramen" },
  { id: "c-grill", name: "Robatayaki" },
  { id: "c-drinks", name: "Drinks" },
  { id: "c-dessert", name: "Dessert" },
];

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const spiceGroup: ModifierGroup = {
  id: "g-spice",
  name: "Spice level",
  minSelect: 1,
  maxSelect: 1,
  isRequired: true,
  options: [
    { id: "o-mild", name: "Mild", priceDelta: 0 },
    { id: "o-medium", name: "Medium", priceDelta: 0 },
    { id: "o-hot", name: "Extra hot", priceDelta: 0 },
  ],
};

const addonsGroup: ModifierGroup = {
  id: "g-addons",
  name: "Add-ons",
  minSelect: 0,
  maxSelect: 3,
  isRequired: false,
  options: [
    { id: "o-egg", name: "Soft-boiled egg", priceDelta: 12000 },
    { id: "o-nori", name: "Extra nori", priceDelta: 8000 },
    { id: "o-chashu", name: "Extra chashu", priceDelta: 25000 },
  ],
};

export const menuItems: MenuItem[] = [
  {
    id: "i-salmon-nigiri",
    categoryId: "c-sushi",
    name: "Salmon Nigiri",
    description: "Two pieces of buttery Norwegian salmon over seasoned rice.",
    price: 42000,
    imageUrl: img("photo-1579584425555-c3ce17fd4351"),
    tags: ["Chef's pick", "Raw"],
    modifierGroups: [],
  },
  {
    id: "i-dragon-roll",
    categoryId: "c-sushi",
    name: "Dragon Roll",
    description: "Tempura prawn, avocado and unagi glaze, eight pieces.",
    price: 98000,
    imageUrl: img("photo-1617196034796-73dfa7b1fd56"),
    tags: ["Signature"],
    modifierGroups: [],
  },
  {
    id: "i-tonkotsu",
    categoryId: "c-ramen",
    name: "Tonkotsu Ramen",
    description: "12-hour pork bone broth, chashu, ajitama, black garlic oil.",
    price: 78000,
    imageUrl: img("photo-1569718212165-3a8278d5f624"),
    tags: ["Popular", "Hot"],
    modifierGroups: [spiceGroup, addonsGroup],
  },
  {
    id: "i-spicy-miso",
    categoryId: "c-ramen",
    name: "Spicy Miso Ramen",
    description: "Fermented miso, chili tare, corn and scallion.",
    price: 72000,
    imageUrl: img("photo-1591814468924-caf88d1232e1"),
    tags: ["Spicy"],
    modifierGroups: [spiceGroup, addonsGroup],
  },
  {
    id: "i-wagyu-skewer",
    categoryId: "c-grill",
    name: "Wagyu Skewers",
    description: "Charcoal-grilled A5 wagyu, sea salt and yuzu kosho.",
    price: 135000,
    imageUrl: img("photo-1633436375153-d7045cb93e38"),
    tags: ["Premium"],
    modifierGroups: [],
  },
  {
    id: "i-yakitori",
    categoryId: "c-grill",
    name: "Chicken Yakitori",
    description: "Thigh skewers glazed in house tare, three per order.",
    price: 55000,
    imageUrl: img("photo-1519984388953-d2406bc725e1"),
    tags: [],
    modifierGroups: [],
  },
  {
    id: "i-matcha-latte",
    categoryId: "c-drinks",
    name: "Iced Matcha Latte",
    description: "Ceremonial-grade matcha, oat milk, lightly sweetened.",
    price: 38000,
    imageUrl: img("photo-1536256263959-770b48d82b0a"),
    tags: ["Vegan"],
    modifierGroups: [],
  },
  {
    id: "i-yuzu-soda",
    categoryId: "c-drinks",
    name: "Yuzu Soda",
    description: "Sparkling yuzu with a hint of shiso.",
    price: 32000,
    imageUrl: img("photo-1513558161293-cdaf765ed2fd"),
    tags: ["Refreshing"],
    modifierGroups: [],
  },
  {
    id: "i-mochi",
    categoryId: "c-dessert",
    name: "Mochi Ice Cream",
    description: "Trio of matcha, black sesame and mango mochi.",
    price: 45000,
    imageUrl: img("photo-1631206753348-db44968fd440"),
    tags: ["Cold"],
    modifierGroups: [],
  },
];

export function itemsByCategory(categoryId: string): MenuItem[] {
  return menuItems.filter((item) => item.categoryId === categoryId);
}
