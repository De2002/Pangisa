import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const pages = {
  about: {
    eyebrow: "The clearer way home",
    title: "Pangisa connects people to places.",
    intro: "We make rental discovery easier by bringing tenants, landlords, and trusted referrers into one simple experience.",
    sections: [
      ["For tenants", "Search with more confidence, see real availability signals, and contact landlords without wasting time on listings that are no longer useful."],
      ["For landlords", "Publish your property, keep availability visible, and meet people who are actively looking for a home."],
      ["For affiliates", "Share useful rental opportunities and earn when your referrals use Pangisa."],
    ],
  },
  terms: {
    eyebrow: "Plain-language terms",
    title: "Use Pangisa clearly and fairly.",
    intro: "These terms explain the role Pangisa plays when people discover listings, contact one another, and use our services.",
    sections: [
      ["A connection platform", "Pangisa helps tenants and property owners find and contact each other. We are not a landlord, tenant, estate agent, property manager, insurer, or party to a rental agreement."],
      ["Your responsibility", "Use accurate information, communicate respectfully, inspect properties, confirm ownership and identity, and make your own decisions before paying or signing anything."],
      ["Payments and access", "Any service fee shown before an action should be reviewed before you proceed. Pangisa may suspend accounts or listings that appear misleading, abusive, fraudulent, or unsafe."],
    ],
  },
  privacy: {
    eyebrow: "Your information",
    title: "Privacy should be understandable.",
    intro: "We use information needed to operate Pangisa, improve the experience, support users, and help prevent abuse.",
    sections: [
      ["Information we use", "This may include account details, contact information, listing details, activity, and messages or support requests you choose to send us."],
      ["How we use it", "We use information to provide the service, show relevant listings, process requested actions, communicate with you, and maintain safety and platform integrity."],
      ["Your choices", "Keep your account details accurate and contact us if you want to understand, correct, or discuss information associated with your account."],
    ],
  },
  disclaimer: {
    eyebrow: "Before you proceed",
    title: "A Pangisa connection is not a guarantee.",
    intro: "We work to make rental discovery safer and clearer, but every person should still verify the details of a property and the person offering it.",
    sections: [
      ["What the badge means", "A verified badge means Pangisa has completed the verification step shown for that listing or owner. We strive to verify identity and property ownership, but verification is not a guarantee of future conduct, property condition, availability, or a successful tenancy."],
      ["No badge means not yet verified", "Listings and owners without a verified badge have not completed that verification with Pangisa at the time shown. Treat them as unverified and take extra care before sharing information, visiting, or making any payment."],
      ["Stay in control", "Inspect the property, ask for documents, confirm ownership independently, meet safely, use written agreements, and never pay because a listing appears on Pangisa alone. Pangisa connects you; it does not assume responsibility for what happens between connected parties."],
    ],
  },
} as const;

export default function InfoPage() {
  const key = useLocation().pathname.slice(1) as keyof typeof pages;
  const page = pages[key] ?? pages.about;

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary))]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
        <Link to="/" className="mb-12 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]"><ArrowLeft className="size-4" /> Back home</Link>
        <div className="mb-12 border-b border-[hsl(var(--border))] pb-10">
          <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--brand-primary))]">{page.eyebrow}</p>
          <h1 className="max-w-2xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">{page.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[hsl(var(--text-secondary))]">{page.intro}</p>
        </div>
        <div className="flex flex-col gap-8">
          {page.sections.map(([title, body], index) => (
            <section key={title} className="grid gap-3 border-b border-[hsl(var(--border))] pb-8 sm:grid-cols-[150px_1fr] sm:gap-8">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--text-muted))]">0{index + 1} / {title}</p>
              <p className="text-base leading-7 text-[hsl(var(--text-secondary))]">{body}</p>
            </section>
          ))}
        </div>
        {key === "disclaimer" && <div className="mt-10 flex gap-3 rounded-2xl bg-[hsl(var(--brand-primary))] p-5 text-white"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[hsl(var(--accent-lime))]" /><p className="text-sm leading-6">Look for the verified badge, ask questions, and trust your own checks before you proceed.</p></div>}
      </main>
      <Footer />
    </div>
  );
}

export function About() { return <InfoPage />; }
export function Terms() { return <InfoPage />; }
export function Privacy() { return <InfoPage />; }
export function Disclaimer() { return <InfoPage />; }
