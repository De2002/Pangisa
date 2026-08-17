import type { PropertyType } from "@/types";

export interface PropertyTypeOption {
  value: PropertyType;
  label: string;
  icon: string;
  description: string;
  hasSubtype?: boolean;
}

export const PROPERTY_TYPES: PropertyTypeOption[] = [
  {
    value: "room",
    label: "Room",
    icon: "🚪",
    description: "Single room, self-contained or shared",
  },
  {
    value: "apartment",
    label: "Apartment / Flat",
    icon: "🏢",
    description: "Unit in a block or building",
  },
  {
    value: "house",
    label: "House",
    icon: "🏠",
    description: "Standalone or semi-detached",
    hasSubtype: true,
  },
  {
    value: "townhouse",
    label: "Townhouse",
    icon: "🏘️",
    description: "Multi-floor attached home",
  },
  {
    value: "bungalow",
    label: "Bungalow",
    icon: "🏡",
    description: "Single-storey detached home",
  },
  {
    value: "villa",
    label: "Villa",
    icon: "🏰",
    description: "Upscale detached home with garden",
  },
  {
    value: "maisonette",
    label: "Maisonette",
    icon: "🏛️",
    description: "Two-storey flat with own entrance",
  },
  {
    value: "hostel",
    label: "Hostel / Student Housing",
    icon: "🏫",
    description: "Shared accommodation, student-friendly",
  },
  {
    value: "studio",
    label: "Studio",
    icon: "🛋️",
    description: "Open-plan living & sleeping space",
  },
];

export const HOUSE_SUBTYPES = [
  { value: "standalone", label: "Standalone" },
  { value: "semi-detached", label: "Semi-detached" },
];

export function getPropertyTypeLabel(type: PropertyType): string {
  return PROPERTY_TYPES.find((p) => p.value === type)?.label ?? type;
}

export function getPropertyTypeIcon(type: PropertyType): string {
  return PROPERTY_TYPES.find((p) => p.value === type)?.icon ?? "🏠";
}
