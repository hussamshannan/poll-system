import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            // Hide the "Don't have an account? Sign up" footer
            footerAction: { display: "none" },
          },
        }}
      />
    </div>
  );
}
