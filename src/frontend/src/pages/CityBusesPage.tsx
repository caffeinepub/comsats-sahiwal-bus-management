import { ShuttleStatus } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAllShuttleStatuses,
  useBusesForCity,
  useCities,
} from "@/hooks/useQueries";
import { Link, useParams } from "@tanstack/react-router";
import { Bus, ChevronRight, Clock, MapPin } from "lucide-react";
import { motion } from "motion/react";

const statusConfig = {
  [ShuttleStatus.running]: {
    label: "Running",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  [ShuttleStatus.delayed]: {
    label: "Delayed",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  [ShuttleStatus.cancelled]: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1 as number,
    x: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 24 },
  },
};

export function CityBusesPage() {
  const { cityId } = useParams({ from: "/layout/routes/$cityId" });
  const cityIdBigInt = BigInt(cityId);

  const { data: cities = [] } = useCities();
  const { data: buses = [], isLoading } = useBusesForCity(cityIdBigInt);
  const { data: statuses = [] } = useAllShuttleStatuses();

  const city = cities.find((c) => c.id.toString() === cityId);
  const statusMap = new Map(statuses.map((s) => [s.busId.toString(), s]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link
            to="/"
            className="hover:text-primary transition-colors"
            data-ocid="city.home.link"
          >
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            to="/routes"
            className="hover:text-primary transition-colors"
            data-ocid="city.routes.link"
          >
            Routes
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{city?.name || "City"}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-xl p-3">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {city?.name || "Loading..."} Buses
            </h1>
            <p className="text-muted-foreground">
              Select a bus to view route and timings
            </p>
          </div>
        </div>
      </motion.div>

      {/* Buses */}
      {isLoading ? (
        <div className="space-y-4" data-ocid="city.loading_state">
          {["a", "b", "c", "d"].map((k) => (
            <Skeleton key={k} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : buses.length === 0 ? (
        <div className="text-center py-16" data-ocid="city.empty_state">
          <Bus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-display font-semibold text-lg text-foreground">
            No buses found
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            No buses are registered for {city?.name || "this city"} yet.
          </p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
          data-ocid="city.buses.list"
        >
          {buses.map((bus, idx) => {
            const status = statusMap.get(bus.id.toString());
            const statusInfo = status ? statusConfig[status.status] : null;

            return (
              <motion.div key={bus.id.toString()} variants={item}>
                <Link
                  to="/routes/$cityId/$busId"
                  params={{ cityId, busId: bus.id.toString() }}
                  className="group block"
                  data-ocid={`bus.select.item.${idx + 1}`}
                >
                  <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="bg-primary/10 rounded-xl p-3 shrink-0">
                          <Bus className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display font-bold text-foreground text-lg">
                              {bus.busName}
                            </h3>
                            {statusInfo && (
                              <Badge
                                className={`text-xs ${statusInfo.className} border`}
                              >
                                {statusInfo.label}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Departs {bus.departureTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Arrives {bus.arrivalTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {bus.routeStops.slice(0, 3).join(" → ")}
                            {bus.routeStops.length > 3 &&
                              ` +${bus.routeStops.length - 3} more`}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
