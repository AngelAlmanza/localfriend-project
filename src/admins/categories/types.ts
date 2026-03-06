export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySaveDTO {
  id: string | null;
  name: string;
  description: string;
  imageUrl: string;
}
