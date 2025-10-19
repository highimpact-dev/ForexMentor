import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            ForexMentor
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your gateway to forex trading success
          </p>
        </div>
        <div className="mt-8">
          {children}
        </div>
      </div>
    </div>
  )
}
