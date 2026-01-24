import type { BoltMenuItem } from "./types";

// Unsplash placeholders (no auth). These are intentionally generic food shots.
export const initialBoltMenu: BoltMenuItem[] = [
  {
    id: "mp-1",
    category: "Most Popular",
    name: "Truffle Burger",
    shortDescription: "Beef patty, truffle mayo, cheddar",
    description:
      "Juicy beef patty with melted cheddar, crispy lettuce, and truffle mayo on a toasted brioche bun.",
    priceCents: 32900,
    imageUrl:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
    isPopular: true,
  },
  {
    id: "mp-2",
    category: "Most Popular",
    name: "Chicken Caesar Salad",
    shortDescription: "Grilled chicken, parmesan, croutons",
    description:
      "Classic Caesar with grilled chicken, shaved parmesan, crunchy croutons, and creamy dressing.",
    priceCents: 24900,
    imageUrl:
      "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=1200&q=80",
    isPopular: true,
  },
  {
    id: "mp-3",
    category: "Most Popular",
    name: "Margherita Pizza",
    shortDescription: "Tomato, mozzarella, basil",
    description:
      "Wood-fired style margherita with rich tomato sauce, fresh mozzarella, and basil.",
    priceCents: 28900,
    imageUrl:
      "https://images.unsplash.com/photo-1548365328-9f547f8d2b8c?auto=format&fit=crop&w=1200&q=80",
    isVegetarian: true,
    isPopular: true,
  },
  {
    id: "st-1",
    category: "Starters",
    name: "Crispy Fries",
    shortDescription: "Sea salt, house seasoning",
    description:
      "Golden crispy fries tossed with sea salt and our signature house seasoning.",
    priceCents: 10900,
    imageUrl:
      "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80",
    isVegetarian: true,
  },
  {
    id: "st-2",
    category: "Starters",
    name: "Garlic Bread",
    shortDescription: "Buttery, toasted, garlic & herbs",
    description:
      "Toasted bread with garlic butter and herbs. Perfect for sharing (or not).",
    priceCents: 9900,
    imageUrl:
      "https://images.unsplash.com/photo-1619985632461-f33748ef8d27?auto=format&fit=crop&w=1200&q=80",
    isVegetarian: true,
  },
  {
    id: "st-3",
    category: "Starters",
    name: "Spicy Wings",
    shortDescription: "Hot glaze, sesame, lime",
    description:
      "Crispy chicken wings coated in a spicy glaze, finished with sesame and lime.",
    priceCents: 19900,
    imageUrl:
      "https://images.unsplash.com/photo-1604909053196-4c0216d8e7c6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sa-1",
    category: "Salads",
    name: "Greek Salad",
    shortDescription: "Feta, olives, cucumber, tomato",
    description:
      "Fresh chopped veggies with feta, olives, oregano, and a bright olive oil dressing.",
    priceCents: 18900,
    imageUrl:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80",
    isVegetarian: true,
  },
  {
    id: "sa-2",
    category: "Salads",
    name: "Avocado Quinoa Bowl",
    shortDescription: "Quinoa, avocado, mixed greens",
    description:
      "A hearty, wholesome bowl with quinoa, avocado, greens, and a lemon tahini drizzle.",
    priceCents: 22900,
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
    isVegetarian: true,
  },
  {
    id: "mc-1",
    category: "Main Courses",
    name: "Grilled Salmon",
    shortDescription: "Lemon butter, seasonal greens",
    description:
      "Perfectly grilled salmon served with lemon butter sauce and seasonal greens.",
    priceCents: 39900,
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "mc-2",
    category: "Main Courses",
    name: "Pasta Alfredo",
    shortDescription: "Creamy parmesan sauce",
    description:
      "Silky alfredo sauce with parmesan over fresh pasta. Comfort food, done right.",
    priceCents: 27900,
    imageUrl:
      "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?auto=format&fit=crop&w=1200&q=80",
    isVegetarian: true,
  },
  {
    id: "mc-3",
    category: "Main Courses",
    name: "Steak & Pepper Sauce",
    shortDescription: "Grilled steak, peppercorn sauce",
    description:
      "Tender grilled steak finished with a rich peppercorn sauce and a side of greens.",
    priceCents: 54900,
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "dr-1",
    category: "Drinks",
    name: "Homemade Lemonade",
    shortDescription: "Fresh lemon, mint",
    description: "Refreshing lemonade made with fresh lemon juice and mint.",
    priceCents: 7900,
    imageUrl:
      "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "dr-2",
    category: "Drinks",
    name: "Iced Coffee",
    shortDescription: "Cold brew, milk, ice",
    description: "Smooth cold brew served over ice with a splash of milk.",
    priceCents: 8900,
    imageUrl:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
  },
];

