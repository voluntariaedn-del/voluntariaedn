import {
  Baby,
  GraduationCap,
  HandHeart,
  Heart,
  Laptop,
  Leaf,
  Palette,
  PawPrint,
  Stethoscope,
  UtensilsCrossed,
  Users,
} from "lucide-react";

const icons = {
  Baby,
  GraduationCap,
  HandHeart,
  Heart,
  Laptop,
  Leaf,
  Palette,
  PawPrint,
  Stethoscope,
  UtensilsCrossed,
  Users,
} as const;

export function CauseIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name as keyof typeof icons] ?? Heart;
  return <Icon className={className} />;
}
