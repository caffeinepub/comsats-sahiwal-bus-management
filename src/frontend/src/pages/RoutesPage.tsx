import { Skeleton } from "@/components/ui/skeleton";
import { useCities } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { Bus, ChevronRight, MapPin } from "lucide-react";
import { motion } from "motion/react";

const cityColors = [
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-cyan-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-600",
  "from-teal-500 to-cyan-600",
  "from-green-500 to-emerald-600",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1 as number,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 24 },
  },
};

export function RoutesPage() {
  const { data: cities = [], isLoading } = useCities();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link
            to="/"
            className="hover:text-primary transition-colors"
            data-ocid="routes.home.link"
          >
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Routes</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Select Your City
        </h1>
        <p className="text-muted-foreground">
          Choose your city to view available buses and timetables.
        </p>
      </motion.div>

      {/* City Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
            <Skeleton
              key={k}
              className="h-36 rounded-2xl"
              data-ocid="routes.loading_state"
            />
          ))}
        </div>
      ) : cities.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="routes.empty_state"
        >
          <Bus className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-display font-medium text-lg">
            No cities available yet.
          </p>
          <p className="text-sm mt-1">
            Please check back later or contact the admin.
          </p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          data-ocid="routes.list"
        >
          {cities.map((city, idx) => (
            <motion.div key={city.id.toString()} variants={item}>
              <Link
                to="/routes/$cityId"
                params={{ cityId: city.id.toString() }}
                className="group block"
                data-ocid={`city.select.item.${idx + 1}`}
              >
                <div className="rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div
                    className={`bg-gradient-to-br ${cityColors[idx % cityColors.length]} p-6 flex flex-col items-center justify-center gap-2 min-h-[100px]`}
                  >
                    <MapPin className="h-8 w-8 text-white" />
                    <h3 className="font-display font-bold text-white text-center leading-tight">
                      {city.name}
                    </h3>
                  </div>
                  <div className="bg-card px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      View buses
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
