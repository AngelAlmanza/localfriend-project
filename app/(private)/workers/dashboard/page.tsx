'use client'

import { useUserContext } from "@/src/shared/providers/UserProvider"

function DashboardPage() {
  const { user } = useUserContext()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>DashboardPage</h1>
      <h2>Welcome, {user.email}</h2>
    </div>
  )
}
export default DashboardPage