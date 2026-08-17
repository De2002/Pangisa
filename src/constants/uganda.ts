export type UgandaRegion = "Central" | "Eastern" | "Northern" | "Western";

export interface District {
  name: string;
  region: UgandaRegion;
  areas: string[];
}

export const UGANDA_REGIONS: UgandaRegion[] = ["Central", "Eastern", "Northern", "Western"];

export const REGION_DESCRIPTIONS: Record<UgandaRegion, string> = {
  Central: "Kampala, Wakiso, Mukono & nearby",
  Eastern: "Jinja, Mbale, Soroti & nearby",
  Northern: "Gulu, Lira, Arua & nearby",
  Western: "Mbarara, Fort Portal, Kabale & nearby",
};

export const REGION_EMOJI: Record<UgandaRegion, string> = {
  Central: "🏙️",
  Eastern: "🌄",
  Northern: "🌾",
  Western: "⛰️",
};

export const DISTRICTS_BY_REGION: Record<UgandaRegion, District[]> = {
  Central: [
    {
      name: "Kampala",
      region: "Central",
      areas: [
        "Ntinda", "Bukoto", "Kololo", "Naguru", "Kamwokya",
        "Wandegeya", "Makerere", "Mulago", "Nakawa", "Muyenga",
        "Bugolobi", "Makindye", "Ggaba", "Munyonyo", "Katwe",
        "Kawempe", "Kisaasi",
      ],
    },
    {
      name: "Wakiso",
      region: "Central",
      areas: [
        "Kira", "Najjera", "Kyanja", "Naalya", "Bweyogerere",
        "Matugga", "Gayaza", "Namugongo", "Entebbe", "Kakiri",
        "Kasangati", "Bulindo", "Namulanda",
      ],
    },
    {
      name: "Mukono",
      region: "Central",
      areas: ["Mukono Town", "Seeta", "Namanve", "Kyampisi", "Ntenjeru"],
    },
    {
      name: "Masaka",
      region: "Central",
      areas: ["Masaka Town", "Nyendo", "Bukakata", "Kalisizo"],
    },
  ],
  Eastern: [
    {
      name: "Jinja",
      region: "Eastern",
      areas: ["Jinja Town", "Walukuba", "Mpumudde", "Bugembe", "Kakira"],
    },
    {
      name: "Mbale",
      region: "Eastern",
      areas: ["Mbale Town", "Namatala", "Wanale", "Industrial Area"],
    },
    {
      name: "Soroti",
      region: "Eastern",
      areas: ["Soroti Town", "Opuyo", "Asuret"],
    },
    {
      name: "Iganga",
      region: "Eastern",
      areas: ["Iganga Town", "Nakalama", "Bulumba"],
    },
  ],
  Northern: [
    {
      name: "Gulu",
      region: "Northern",
      areas: ["Gulu Town", "Layibi", "Pece", "Bardege", "Laroo"],
    },
    {
      name: "Lira",
      region: "Northern",
      areas: ["Lira Town", "Ojwina", "Railway", "North Gate"],
    },
    {
      name: "Arua",
      region: "Northern",
      areas: ["Arua Town", "River Oli", "Adumi", "Pajulu"],
    },
  ],
  Western: [
    {
      name: "Mbarara",
      region: "Western",
      areas: ["Kakoba", "Kamukuzi", "Nyamitanga", "Biharwe", "Ruti"],
    },
    {
      name: "Fort Portal",
      region: "Western",
      areas: ["Fort Portal Town", "Buhinga", "Kichwamba", "Bunyangabu"],
    },
    {
      name: "Kabale",
      region: "Western",
      areas: ["Kabale Town", "Kitumba", "Kamwezi"],
    },
    {
      name: "Kasese",
      region: "Western",
      areas: ["Kasese Town", "Bwera", "Hima", "Kilembe"],
    },
  ],
};
