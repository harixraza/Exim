import { PublicProfilePage } from "@/components/public/public-profile-page"

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PublicProfilePage id={id} />
}
