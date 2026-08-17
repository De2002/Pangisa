import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") ?? "/";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password);
      setLoading(false);
      if (ok) {
        toast.success("Welcome back!");
        navigate(redirect);
      }
    }, 800);
  };

  const demoTenant = () => {
    login("james.mutebi@gmail.com", "demo");
    toast.success("Signed in as demo tenant");
    navigate(redirect);
  };

  const demoLandlord = () => {
    login("david.ssemwanga@gmail.com", "demo");
    toast.success("Signed in as demo landlord");
    navigate(redirect);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-warm))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand-primary))] flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[hsl(var(--brand-primary))]">Pangisa</span>
          </Link>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Welcome back</h1>
          <p className="text-[hsl(var(--text-muted))] mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-11"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-11"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white font-semibold"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(var(--border))]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-[hsl(var(--text-muted))]">Demo accounts</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" onClick={demoTenant} className="text-xs">
              Demo: Tenant
            </Button>
            <Button variant="outline" size="sm" onClick={demoLandlord} className="text-xs">
              Demo: Landlord
            </Button>
          </div>

          <p className="text-center text-sm text-[hsl(var(--text-muted))] mt-5">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[hsl(var(--brand-primary))] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
