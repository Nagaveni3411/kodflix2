import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import InputField from "./components/InputField";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const POST_LOGIN_URL = import.meta.env.VITE_POST_LOGIN_URL || "/home";

function toUserMessage(error) {
  if (error?.name === "TypeError" && /fetch/i.test(error?.message || "")) {
    return "Cannot reach backend API. Ensure server is running on http://localhost:5000 and restart both apps.";
  }
  return error?.message || "Request failed";
}

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Login failed");
      }

      setMessage("Login successful. Redirecting...");
      setTimeout(() => {
        if (/^https?:\/\//.test(POST_LOGIN_URL)) {
          window.location.href = POST_LOGIN_URL;
        } else {
          window.location.assign(POST_LOGIN_URL);
        }
      }, 800);
    } catch (error) {
      setMessage(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Welcome back. Continue your stream."
      footerText="New to Kodflix?"
      footerLinkText="Create an account"
      footerLinkTo="/register"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <InputField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Enter your email"
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Enter your password"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-netflixRed py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {message ? <p className="text-sm text-zinc-200">{message}</p> : null}
      </form>
    </AuthLayout>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setMessage("Account already exists. Redirecting to sign in...");
          setTimeout(() => navigate("/login"), 900);
          return;
        }
        throw new Error(data.error || data.message || "Registration failed");
      }

      setMessage("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 900);
    } catch (error) {
      setMessage(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Kodflix to start your watchlist."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <InputField
          label="Name"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Enter your full name"
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Enter your email"
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Create a password"
        />
        <InputField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={onChange}
          placeholder="Confirm your password"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-netflixRed py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        {message ? <p className="text-sm text-zinc-200">{message}</p> : null}
      </form>
    </AuthLayout>
  );
}

function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-netflixBlack text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black" />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
        <section className="w-full rounded-md bg-black/70 p-10 text-center shadow-panel">
          <h2 className="text-4xl font-bold">Welcome to Kodflix</h2>
          <p className="mt-4 text-zinc-300">Login successful. Your session is active on this domain.</p>
        </section>
      </main>
    </div>
  );
}

export { LoginPage, RegisterPage, HomePage };
