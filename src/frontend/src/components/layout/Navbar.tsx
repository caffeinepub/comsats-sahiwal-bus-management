import { NotificationSystem } from "@/components/notifications/NotificationSystem";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Activity,
  Bus,
  HelpCircle,
  Map as MapIcon,
  Phone,
  Settings,
  UserPlus,
} from "lucide-react";

const navLinks = [
  { to: "/routes", label: "Routes", icon: Bus },
  { to: "/map", label: "Map", icon: MapIcon },
  { to: "/drivers", label: "Drivers", icon: Phone },
  { to: "/status", label: "Status", icon: Activity },
  { to: "/register", label: "Register", icon: UserPlus },
  { to: "/help", label: "Help", icon: HelpCircle },
];

export function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Main navbar */}
      <nav className="gradient-hero border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            {/* Logo & Brand */}
            <Link
              to="/"
              className="flex items-center gap-3 shrink-0 group"
              data-ocid="nav.home.link"
            >
              <img
                src="/assets/generated/comsats-logo-transparent.dim_120x120.png"
                alt="COMSATS Logo"
                className="h-10 w-10 rounded-lg object-contain bg-white/10 p-1"
              />
              <div className="hidden sm:block">
                <div className="text-white font-display font-bold text-sm leading-tight">
                  COMSATS Sahiwal
                </div>
                <div className="text-white/70 text-xs leading-tight">
                  Bus Management
                </div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1 ml-6 flex-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/75 hover:text-white hover:bg-white/10",
                    )}
                    data-ocid={`nav.${link.label.toLowerCase()}.link`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 ml-auto">
              <NotificationSystem />
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/75 hover:text-white hover:bg-white/10 transition-all"
                data-ocid="nav.admin.link"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-xl">
        <div className="flex items-center justify-around px-2 py-2">
          {navLinks.slice(0, 5).map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all min-w-0",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
                data-ocid={`nav.mobile.${link.label.toLowerCase()}.link`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium truncate">
                  {link.label}
                </span>
              </Link>
            );
          })}
          <Link
            to="/admin"
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all",
              location.pathname === "/admin"
                ? "text-primary"
                : "text-muted-foreground",
            )}
            data-ocid="nav.mobile.admin.link"
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] font-medium">Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
