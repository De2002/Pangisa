import { Link } from "react-router-dom";
import { Bed, Bath, MapPin, ShieldCheck, Bookmark, BookmarkCheck, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatUGX, calcTenantFee } from "@/constants/fees";
import AvailabilityBadge from "./AvailabilityBadge";
import { getPropertyTypeIcon } from "@/constants/propertyTypes";
import type { Listing } from "@/types";

interface ListingCardProps {
  listing: Listing;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  className?: string;
}

export default function ListingCard({ listing, isSaved, onToggleSave, className }: ListingCardProps) {
  const fee = calcTenantFee(listing.monthlyRent);
  const typeIcon = getPropertyTypeIcon(listing.propertyType);

  return (
    <div className={cn(
      "group bg-white rounded-2xl overflow-hidden border border-[hsl(var(--border))] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5",
      className
    )}>
      {/* Photo */}
      <Link to={`/listing/${listing.id}`} className="block relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <img
          src={listing.photos[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Availability badge */}
        <div className="absolute top-3 left-3">
          <AvailabilityBadge
            lastConfirmedAt={listing.lastConfirmedAt}
            availableUnits={listing.availableUnits}
            totalUnits={listing.totalUnits}
            size="sm"
            showConfidence={false}
          />
        </div>

        {/* Verified badge */}
        {listing.isVerified && (
          <div className="absolute top-3 right-10 bg-white/95 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-3 h-3 text-[hsl(var(--brand-primary))]" />
            <span className="text-xs font-semibold text-[hsl(var(--brand-primary))]">Verified</span>
          </div>
        )}

        {/* Video indicator */}
        {listing.videoUrl && (
          <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Play className="w-3 h-3 fill-white" />
            Video
          </div>
        )}

        {/* Save button */}
        {onToggleSave && (
          <button
            onClick={(e) => { e.preventDefault(); onToggleSave(listing.id); }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/95 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            {isSaved
              ? <BookmarkCheck className="w-4 h-4 text-[hsl(var(--brand-primary))]" />
              : <Bookmark className="w-4 h-4 text-[hsl(var(--text-muted))]" />}
          </button>
        )}
      </Link>

      {/* Card body */}
      <Link to={`/listing/${listing.id}`} className="block p-4">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-semibold text-[hsl(var(--text-primary))] text-[15px] leading-snug line-clamp-1 flex-1">
            {listing.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-[hsl(var(--text-muted))] text-xs mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{listing.location}</span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-[hsl(var(--text-secondary))] mb-3.5">
          <span className="flex items-center gap-1">
            <Bed className="w-3 h-3" />
            {listing.bedrooms}bd
          </span>
          <span className="w-[3px] h-[3px] rounded-full bg-[hsl(var(--text-muted)/0.4)]" />
          <span className="flex items-center gap-1">
            <Bath className="w-3 h-3" />
            {listing.bathrooms}ba
          </span>
          <span className="w-[3px] h-[3px] rounded-full bg-[hsl(var(--text-muted)/0.4)]" />
          <span className="flex items-center gap-1">
            <span>{typeIcon}</span>
            <span className="capitalize">{listing.propertyType}</span>
          </span>
          {listing.isFurnished !== undefined && (
            <>
              <span className="w-[3px] h-[3px] rounded-full bg-[hsl(var(--text-muted)/0.4)]" />
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[11px] font-medium",
                listing.isFurnished
                  ? "bg-purple-50 text-purple-700"
                  : "bg-gray-100 text-gray-500"
              )}>
                {listing.isFurnished ? "Furnished" : "Unfurnished"}
              </span>
            </>
          )}
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-[hsl(var(--border))]">
          <div>
            <p className="text-lg font-bold text-[hsl(var(--brand-primary))] leading-none">
              {formatUGX(listing.monthlyRent)}
            </p>
            <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">/month</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[hsl(var(--text-muted))]">Get It Now</p>
            <p className="text-sm font-bold text-[hsl(var(--brand-accent))]">{formatUGX(fee)}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
