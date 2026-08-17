import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Role = "tenant" | "landlord";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginAsLandlord } = useAuth();
  const [role, setRole] = useState<Role>((searchParams.get("role") as Role) ?? "tenant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (role === "landlord") {
        loginAsLandlord(email);
      } else {
        login(email, password);
      }
      setLoading(false);
      toast.success("Account created! Welcome to Pangisa.");
      navigate(role === "landlord" ? "/landlord" : "/");
    }, 1000);
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
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Create your account</h1>
          <p className="text-[hsl(var(--text-muted))] mt-1">Join Uganda's rental marketplace</p>
        </div>

        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm p-6">
          {/* Role toggle */}
          <div className="flex rounded-xl border border-[hsl(var(--border))] p-1 mb-5">
            {(["tenant", "landlord"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  role === r
                    ? "bg-[hsl(var(--brand-primary))] text-white shadow-sm"
                    : "text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]"
                }`}
              >
                {r === "tenant" ? "I'm Looking for a Rental" : "I'm a Landlord"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-11"
              />
            </div>
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. 0701234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 h-11"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
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
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-[hsl(var(--text-muted))] mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-[hsl(var(--brand-primary))] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
