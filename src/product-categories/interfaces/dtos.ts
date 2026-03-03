export interface CreateProductCategoryDTO {
  name: string;
  description: string;
  imageUrl: string;
}

export interface UpdateProductCategoryDTO {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}