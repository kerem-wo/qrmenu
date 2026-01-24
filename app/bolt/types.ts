export type BoltCategory =
  | "Most Popular"
  | "Starters"
  | "Salads"
  | "Main Courses"
  | "Drinks";

export type BoltMenuItem = {
  id: string;
  category: BoltCategory;
  name: string;
  shortDescription: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  isVegetarian?: boolean;
  isPopular?: boolean;
};

