function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <div className="flex flex-col items-center justify-center">
        {/* TODO: Add logo */}
        {children}
      </div>
    </div>
  )
}
export default AuthLayout