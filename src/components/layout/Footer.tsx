import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[hsl(var(--brand-primary))] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">Pangisa</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Find your next home — verified listings, real availability, transparent fees. No more wasted trips.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white/90">For Tenants</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/browse" className="hover:text-white transition-colors">Browse Rentals</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">My Dashboard</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white/90">For Landlords</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/list-property" className="hover:text-white transition-colors">List Your Property</Link></li>
              <li><Link to="/landlord" className="hover:text-white transition-colors">Landlord Dashboard</Link></li>
              <li><Link to="/signup?role=landlord" className="hover:text-white transition-colors">Register as Landlord</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">© 2026 Pangisa. All rights reserved.</p>
          <p className="text-white/60 text-sm">Made for Uganda 🇺🇬</p>
        </div>
      </div>
    </footer>
  );
}
