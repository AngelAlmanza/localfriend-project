import { SearchPageClient } from "@/src/locals-search/components/SearchPageClient";
import { CategoriesService } from "@/src/locals-search/services/CategoriesService";
import { FavoritesService } from "@/src/locals-search/services/FavoritesService";
import { createClient } from "@/src/shared/lib/supabase/server";

async function LocalsSearchPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [prodCats, svcCats, favorites] = await Promise.all([
    CategoriesService.getProductCategories(supabase),
    CategoriesService.getServiceCategories(supabase),
    FavoritesService.getFavoritesId(user?.id ?? "", supabase),
  ]);

  return (
    <SearchPageClient
      initialProductCategories={prodCats.right ?? []}
      initialServiceCategories={svcCats.right ?? []}
      initialFavoriteProductIds={favorites.right?.productIds ?? []}
      initialFavoriteServiceIds={favorites.right?.serviceIds ?? []}
    />
  );
}

export default LocalsSearchPage;
