import { login, signup, signInWithGoogle } from "./actions";

export default function LoginPage() {
  console.log("Page: app/login");

  return (
    <div className="mx-auto mt-16 max-w-sm">
      {/* Google Sign-In Form */}
      <form className="mb-6" action={signInWithGoogle}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded border bg-white py-2 font-semibold hover:bg-gray-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.4H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.2-.4-3.6z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 16.2 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.2 35.2 26.7 36 24 36c-5.3 0-9.7-3.6-11.3-8.5l-6.5 5C9.4 39.5 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.4H42V20H24v8h11.3c-.8 2.3-2.4 4.2-4.4 5.6l6.2 5.2C39.9 36 44 30.7 44 24c0-1.3-.1-2.2-.4-3.6z"
            />
          </svg>
          Continue with Google
        </button>
      </form>

      <div className="relative text-center mb-6">
        <span className="bg-gray-100 px-2 text-sm text-gray-500">or</span>
      </div>

      {/* Email / Password Form */}
      <form className="space-y-4" action={login}>
        <h1 className="text-center text-2xl font-semibold">Sign in</h1>

        <div>
          <label htmlFor="email" className="block font-semibold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-semibold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded bg-blue-600 py-2 font-semibold text-white"
          >
            Log in
          </button>
          <button
            type="button"
            formAction={signup} // Optional: separate server action
            className="flex-1 rounded bg-gray-300 py-2 font-semibold"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
