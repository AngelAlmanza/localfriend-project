import { ListingDetailPageClient } from "@/src/locals-search/components/ListingDetailPageClient"

interface Props {
  params: Promise<{ id: string }>
}

async function LocalsProductDetailPage({ params }: Props) {
  const { id } = await params
  return <ListingDetailPageClient id={id} type="product" />
}

export default LocalsProductDetailPage
