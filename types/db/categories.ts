import { ProdType } from "./products";

export type CategoriesListProps = {
    first: number;
    level: number;
    productType: ProdType;
    parentId?: number
}

export interface Category { 
  id: number;
  name: string; 
  slug: string; 
  level: number; 
  parentId: number | null; 
  productType: ProdType;
  thumbnailUrl?: string | null; 
  productsCount?: number; 
  subcategoriesCount?: number; 
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export interface CategorySubTreeResult {
  ancestor: Category | null;
  parentCategory: Category | null;
  descendants: Category[];
}
