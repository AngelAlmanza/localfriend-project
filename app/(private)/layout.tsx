import { UserProvider } from "@/src/shared/providers/UserProvider"

export default function PrivateLayout({ children }: { children: Readonly<React.ReactNode> }) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  )
}