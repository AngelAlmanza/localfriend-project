import { ListingDetailPageClient } from "@/src/locals-search/components/ListingDetailPageClient"

interface Props {
  params: Promise<{ id: string }>
}

async function LocalsServiceDetailPage({ params }: Props) {
  const { id } = await params
  return <ListingDetailPageClient id={id} type="service" />
}

export default LocalsServiceDetailPage
