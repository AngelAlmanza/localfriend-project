import { MyReviewsPageClient } from "@/src/reviews/components/MyReviewsPageClient"
import { ReviewsService } from "@/src/reviews/services/ReviewsService"
import { createClient } from "@/src/shared/lib/supabase/server"

async function LocalsReviewsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const result = await ReviewsService.getUserReviews(user?.id ?? "", supabase)

  return <MyReviewsPageClient initialReviews={result.right ?? []} />
}

export default LocalsReviewsPage
