import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import InputField from "./components/InputField";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
        window.location.href = "https://kodflix-flax.vercel.app/";
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

export { LoginPage, RegisterPage };
