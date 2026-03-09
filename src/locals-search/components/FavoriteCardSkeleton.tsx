import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const FavoriteCardSkeleton = () => {
  return (
  <Card className="animate-pulse">
    <CardHeader>
      <Skeleton className="h-5 w-16 mb-2" />
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3 mt-1" />
    </CardContent>
    <CardFooter>
      <Skeleton className="h-5 w-24" />
    </CardFooter>
  </Card>
)
}