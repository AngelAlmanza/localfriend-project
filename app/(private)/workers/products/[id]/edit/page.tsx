import { ProductCategoriesService } from "@/src/product-categories/services/ProductCategoriesService";
import { EntityStatus } from "@/src/shared/constants/EntityStatus";
import { createClient } from "@/src/shared/lib/supabase/server";
import { ProductForm } from "@/src/workers-listings/components/products/ProductForm";
import { ProductsService } from "@/src/workers-listings/services/ProductsService";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [productResult, categoriesResult] = await Promise.all([
    ProductsService.getProductById(id, supabase),
    ProductCategoriesService.getProductCategories(supabase),
  ]);

  if (productResult.left) {
    notFound();
  }

  const product = productResult.right!;

  if (product.status === EntityStatus.HIDDEN_HARD) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
          <p className="font-medium">
            This product was deactivated by an administrator and cannot be
            edited.
          </p>
        </div>
      </div>
    );
  }

  if (categoriesResult.left) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive">
          <p className="font-medium">{categoriesResult.left.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6">
      <ProductForm
        product={product}
        categories={categoriesResult.right ?? []}
      />
    </div>
  );
}
