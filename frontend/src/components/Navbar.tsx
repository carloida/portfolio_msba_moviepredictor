import { BarChart3 } from "lucide-react";

const navItems = [
  ["Prediction", "#prediction"],
  ["Scenario Simulator", "#scenario"],
  ["Genre Trends", "#genre-trends"],
  ["Methodology", "#methodology"],
  ["About", "#about"]
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <nav className="section-shell flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2 font-bold text-nusNavy">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-nusNavy text-white">
            <BarChart3 size={20} />
          </span>
          <span>Movie Hit Predictor</span>
        </a>
        <div className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          {navItems.map(([label, href]) => (
            <a key={label} href={href} className="transition hover:text-nusOrange">
              {label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
