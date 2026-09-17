import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRIES, CURRENCIES, useShop } from "@/lib/shop-context";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — WET HER SPOON" },
      { name: "description", content: "Sign in or create your Wet Her Spoon account to shop and save." },
      { property: "og:title", content: "Sign in — WET HER SPOON" },
      { property: "og:description", content: "Sign in or create your account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, setCountry, setCurrency } = useShop();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("NG");
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/account" });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        const chosen = COUNTRIES.find((c) => c.code === countryCode);
        if (chosen) {
          setCountry(chosen.code);
          setCurrency(chosen.currency);
        }
        toast.success("Account created. Check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (error) toast.error(error.message);
  };

  const sendPasswordReset = async () => {
    if (!email) {
      toast.error("Enter your email address first");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success("Password reset link sent — check your email");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl tracking-[0.1em]">{mode === "signin" ? "Sign in" : "Create account"}</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {mode === "signup" && (
          <>
            <input
              className="field"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <input
              className="field"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <select
              aria-label="Country"
              className="field"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} · {CURRENCIES[c.currency].label}
                </option>
              ))}
            </select>
          </>
        )}
        <input
          className="field"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative">
          <input
            className="field pr-12 w-full"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {mode === "signin" && (
          <button
            type="button"
            onClick={sendPasswordReset}
            disabled={busy}
            className="label-xs -mt-2 text-left text-muted-foreground underline underline-offset-4"
          >
            {resetSent ? "Reset link sent — check your email" : "Forgot password?"}
          </button>
        )}
        <button type="submit" className="btn-solid w-full" disabled={busy}>
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button type="button" className="btn-outline mt-3 w-full" onClick={google}>
        Continue with Google
      </button>

      <button
        type="button"
        className="label-xs mt-6 underline underline-offset-4"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
