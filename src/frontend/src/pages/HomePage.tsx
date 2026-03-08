import { Badge } from "@/components/ui/badge";
import { useNotifications, useReadNotifications } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  Bus,
  ChevronRight,
  HelpCircle,
  Map as MapIcon,
  Phone,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";

const navCards = [
  {
    to: "/routes",
    label: "Bus Routes",
    desc: "Browse city-wise bus routes and timetables",
    icon: Bus,
    color: "from-emerald-600 to-emerald-700",
    ocid: "home.routes.card",
  },
  {
    to: "/map",
    label: "Route Map",
    desc: "Visual map of all routes to COMSATS Sahiwal",
    icon: MapIcon,
    color: "from-teal-600 to-teal-700",
    ocid: "home.map.card",
  },
  {
    to: "/status",
    label: "Shuttle Status",
    desc: "Live status of running, delayed or cancelled buses",
    icon: Activity,
    color: "from-amber-600 to-orange-600",
    ocid: "home.status.card",
  },
  {
    to: "/drivers",
    label: "Driver Contacts",
    desc: "Phone numbers of all bus drivers",
    icon: Phone,
    color: "from-blue-600 to-blue-700",
    ocid: "home.drivers.card",
  },
  {
    to: "/register",
    label: "Register",
    desc: "Register yourself for a university bus",
    icon: UserPlus,
    color: "from-violet-600 to-violet-700",
    ocid: "home.register.card",
  },
  {
    to: "/help",
    label: "Help Center",
    desc: "Contact transport office and get assistance",
    icon: HelpCircle,
    color: "from-rose-600 to-rose-700",
    ocid: "home.help.card",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1 as number,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export function HomePage() {
  const { data: notifications = [] } = useNotifications();
  const { data: readIds = [] } = useReadNotifications();

  const readIdStrings = new Set(readIds.map((id) => id.toString()));
  const importantUnread = notifications.filter(
    (n) => n.isImportant && !readIdStrings.has(n.id.toString()),
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, oklch(0.7 0.2 145 / 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, oklch(0.6 0.15 160 / 0.2) 0%, transparent 40%)`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <img
                src="/assets/generated/comsats-logo-transparent.dim_120x120.png"
                alt="COMSATS Logo"
                className="h-24 w-24 rounded-2xl object-contain shadow-2xl bg-white/10 p-2"
              />
            </div>
            <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/25">
              COMSATS University Islamabad
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4 leading-tight">
              Sahiwal Campus
              <br />
              <span className="text-emerald-300">Bus Management</span>
            </h1>
            <p className="text-white/75 text-lg max-w-xl mx-auto">
              Your complete guide to university bus routes, timings, and
              real-time shuttle status for COMSATS Sahiwal Campus.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Important Notifications Banner */}
      {importantUnread.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-b border-red-200 px-4 py-3"
          data-ocid="home.notifications.section"
        >
          <div className="max-w-7xl mx-auto flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-red-800 text-sm">
                Important: {importantUnread[0].title}
              </p>
              <p className="text-red-700 text-sm mt-0.5">
                {importantUnread[0].message}
              </p>
            </div>
            {importantUnread.length > 1 && (
              <Badge variant="destructive" className="shrink-0">
                +{importantUnread.length - 1} more
              </Badge>
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.to} variants={item}>
                <Link
                  to={card.to}
                  className="group block h-full"
                  data-ocid={card.ocid}
                >
                  <div className="h-full bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div
                      className={`bg-gradient-to-br ${card.color} p-5 flex items-center justify-between`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                      <ChevronRight className="h-5 w-5 text-white/60 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-foreground text-base mb-1">
                        {card.label}
                      </h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Info strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-4xl shrink-0">🚌</div>
          <div>
            <h3 className="font-display font-bold text-foreground mb-1">
              COMSATS Sahiwal Campus — Transport Services
            </h3>
            <p className="text-muted-foreground text-sm">
              Serving students from Okara, Lahore, Pakpattan, Arif Wala,
              Haroonabad, Sahiwal, Chichawatni, and Burewala. University buses
              operate Monday–Friday, 6:00 AM onwards.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
