import {
  MessageSquare,
  CreditCard,
  Ship,
  FileCheck,
  Users,
  TrendingUp,
  LucideIcon,
} from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight: string;
}

export const features: Feature[] = [
  {
    icon: MessageSquare,
    title: "Smart Negotiation",
    description:
      "Counter-offer slider works across currencies. Real-time chat auto-translation keeps deals moving.",
    highlight: "Negotiate like you're in the same room",
  },
  {
    icon: CreditCard,
    title: "Global Payments & Rewards",
    description:
      "Lowest FX costs with top payment providers. Earn loyalty coins on every transaction worldwide.",
    highlight: "Save on every conversion",
  },
  {
    icon: Ship,
    title: "Smarter Logistics",
    description:
      "Track rates, port circulars, and customs requirements globally. Your cargo takes the cheapest, fastest route.",
    highlight: "Optimize every shipment",
  },
  {
    icon: FileCheck,
    title: "Compliance Made Easy",
    description:
      "From EU regulations to US FDA approvals. Connect with certified partners for labeling and packaging.",
    highlight: "Market-ready from day one",
  },
  {
    icon: Users,
    title: "Global Community",
    description:
      "Learn from businesses worldwide. Share stories, build trust, and scale together across borders.",
    highlight: "Trust that transcends borders",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Analytics",
    description:
      "Track your trade metrics, supplier performance, and cost savings with comprehensive dashboards.",
    highlight: "Data-driven decisions",
  },
];

export default features;