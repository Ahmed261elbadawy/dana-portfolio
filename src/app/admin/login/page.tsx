"use client";

import { useActionState } from "react";
import { signIn } from "@/app/admin/actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className="w-full max-w-sm space-y-6 rounded-card-lg bg-paper p-8 shadow-sm">
        <div className="space-y-1">
          <h1 className="font-wordmark text-2xl">Dana Badawy</h1>
          <p className="text-sm text-ink/60">Admin dashboard</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-ink/80">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-ink/80"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-ink/15 px-3.5 py-3 text-base outline-none focus:border-burgundy"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-burgundy" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-pill bg-burgundy px-6 py-3 text-sm font-semibold text-cream transition-opacity disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
