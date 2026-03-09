import { Header } from "@/src/locals/components/Header";

function LocalLayout({ children }: { children: Readonly<React.ReactNode> }) {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>
    </>
  )
}

export default LocalLayout