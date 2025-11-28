export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  isNew?: boolean;
  isOrganic?: boolean;
  isWeighted?: boolean;
  weight: string;
}

export interface NavItem {
  label: string;
  href: string;
  subCategories?: {
    title: string;
    items: string[];
  }[];
}

export interface FilterState {
  priceRange: [number, number];
  organic: boolean;
  brands: string[];
  categories: string[];
}