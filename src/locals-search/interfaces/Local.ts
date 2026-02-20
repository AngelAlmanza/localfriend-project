export interface Local {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  seller: Seller;
  rating: number;
  reviews: number;
  location: string;
  variants: Variant[];
  fullDescription: string;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export interface Variant {
  id: string;
  name: string;
  price: number;
}