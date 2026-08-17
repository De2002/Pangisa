import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Home, Menu, X, User, LogOut, LayoutDashboard, PlusCircle, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-[hsl(var(--border))] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-[hsl(var(--brand-primary))] flex items-center justify-center shadow-sm">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-[1.1rem] font-bold text-[hsl(var(--brand-primary))] tracking-tight">Pangisa</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/browse"
              className="px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary)/0.06)] transition-all"
            >
              Browse Rentals
            </Link>
            <Link
              to="/list-property"
              className="px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary)/0.06)] transition-all"
            >
              List Property
            </Link>
          </nav>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-[hsl(var(--border))] hover:border-[hsl(var(--brand-primary)/0.4)] hover:bg-[hsl(var(--brand-primary)/0.04)] transition-all">
                    <div className="w-7 h-7 rounded-full bg-[hsl(var(--brand-primary))] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">{user.name.split(" ")[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--text-muted))]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-lg border-[hsl(var(--border))]">
                  <div className="px-3 py-2.5 border-b border-[hsl(var(--border))]">
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{user.name}</p>
                    <p className="text-xs text-[hsl(var(--text-muted))] capitalize">{user.role}</p>
                  </div>
                  {user.role === "tenant" && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard")} className="rounded-lg mx-1 my-0.5">
                      <LayoutDashboard className="w-4 h-4 mr-2 text-[hsl(var(--brand-primary))]" /> My Dashboard
                    </DropdownMenuItem>
                  )}
                  {user.role === "landlord" && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/landlord")} className="rounded-lg mx-1 my-0.5">
                        <LayoutDashboard className="w-4 h-4 mr-2 text-[hsl(var(--brand-primary))]" /> My Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/list-property")} className="rounded-lg mx-1 my-0.5">
                        <PlusCircle className="w-4 h-4 mr-2 text-[hsl(var(--brand-primary))]" /> Add Listing
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="mx-2" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-lg mx-1 mb-1">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth?role=tenant&mode=login")}
                  className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--brand-primary))]"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/onboarding?role=tenant")}
                  className="bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary-dark))] text-white rounded-xl shadow-sm text-sm font-semibold px-4"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-2))] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[hsl(var(--border))] bg-white px-4 py-4 flex flex-col gap-1">
          <Link
            to="/browse"
            className="flex items-center gap-2 text-sm font-medium py-2.5 px-3 rounded-xl hover:bg-[hsl(var(--surface-2))] text-[hsl(var(--text-secondary))]"
            onClick={() => setMobileOpen(false)}
          >
            Browse Rentals
          </Link>
          <Link
            to="/list-property"
            className="flex items-center gap-2 text-sm font-medium py-2.5 px-3 rounded-xl hover:bg-[hsl(var(--surface-2))] text-[hsl(var(--text-secondary))]"
            onClick={() => setMobileOpen(false)}
          >
            List Property
          </Link>
          {user ? (
            <>
              {user.role === "tenant" && (
                <Link
                  to="/dashboard"
                  className="text-sm font-medium py-2.5 px-3 rounded-xl hover:bg-[hsl(var(--surface-2))] text-[hsl(var(--text-secondary))]"
                  onClick={() => setMobileOpen(false)}
                >
                  My Dashboard
                </Link>
              )}
              {user.role === "landlord" && (
                <Link
                  to="/landlord"
                  className="text-sm font-medium py-2.5 px-3 rounded-xl hover:bg-[hsl(var(--surface-2))] text-[hsl(var(--text-secondary))]"
                  onClick={() => setMobileOpen(false)}
                >
                  Landlord Dashboard
                </Link>
              )}
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="text-sm font-medium py-2.5 px-3 rounded-xl text-red-600 hover:bg-red-50 text-left mt-1"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl"
                onClick={() => { navigate("/auth?role=tenant&mode=login"); setMobileOpen(false); }}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-[hsl(var(--brand-primary))] text-white rounded-xl"
                onClick={() => { navigate("/onboarding?role=tenant"); setMobileOpen(false); }}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
