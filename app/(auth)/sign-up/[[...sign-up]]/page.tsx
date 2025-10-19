import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div>
      <h2 className="text-center text-3xl font-extrabold text-foreground">
        Create your account
      </h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Join ForexMentor and start your trading journey
      </p>
      <div className="mt-8">
        <SignUp 
          redirectUrl="/dashboard"
          appearance={{
            baseTheme: undefined,
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground text-sm normal-case",
              card: "bg-card border-border shadow-lg",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border",
              formFieldInput: "bg-background border-border text-foreground",
              formFieldLabel: "text-foreground",
              footerActionLink: "text-primary hover:text-primary/80",
              identityPreviewText: "text-foreground",
              formFieldSuccessText: "text-green-600 dark:text-green-400",
              formFieldErrorText: "text-red-600 dark:text-red-400",
            },
            variables: {
              colorPrimary: "hsl(var(--primary))",
              colorBackground: "hsl(var(--background))",
              colorText: "hsl(var(--foreground))",
              colorTextSecondary: "hsl(var(--muted-foreground))",
              colorInputBackground: "hsl(var(--background))",
              colorInputText: "hsl(var(--foreground))",
              borderRadius: "0.5rem",
            }
          }}
        />
      </div>
    </div>
  )
}