import { ShuttleStatus } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllShuttleStatuses, useBuses, useCities } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Bus,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Timer,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";

const statusConfig = {
  [ShuttleStatus.running]: {
    label: "Running",
    icon: CheckCircle2,
    className: "border-green-200 bg-green-50",
    badgeClass: "bg-green-100 text-green-800 border-green-300",
    iconClass: "text-green-500",
    dotClass: "bg-green-500",
  },
  [ShuttleStatus.delayed]: {
    label: "Delayed",
    icon: Timer,
    className: "border-yellow-200 bg-yellow-50",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
    iconClass: "text-yellow-500",
    dotClass: "bg-yellow-500",
  },
  [ShuttleStatus.cancelled]: {
    label: "Cancelled",
    icon: XCircle,
    className: "border-red-200 bg-red-50",
    badgeClass: "bg-red-100 text-red-800 border-red-300",
    iconClass: "text-red-500",
    dotClass: "bg-red-500",
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1 as number,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 24 },
  },
};

export function StatusPage() {
  const queryClient = useQueryClient();
  const { data: buses = [], isLoading: busLoading } = useBuses();
  const { data: cities = [] } = useCities();
  const { data: statuses = [], isLoading: statusLoading } =
    useAllShuttleStatuses();

  const isLoading = busLoading || statusLoading;

  const cityMap = useMemo(
    () => new Map(cities.map((c) => [c.id.toString(), c.name])),
    [cities],
  );
  const statusMap = useMemo(
    () => new Map(statuses.map((s) => [s.busId.toString(), s])),
    [statuses],
  );

  // Group buses by city
  const byCity = useMemo(() => {
    const groups = new Map<string, { cityName: string; buses: typeof buses }>();
    for (const bus of buses) {
      const key = bus.cityId.toString();
      if (!groups.has(key)) {
        groups.set(key, { cityName: cityMap.get(key) || "Unknown", buses: [] });
      }
      groups.get(key)!.buses.push(bus);
    }
    return groups;
  }, [buses, cityMap]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["shuttleStatuses"] });
    queryClient.invalidateQueries({ queryKey: ["buses"] });
  };

  // Summary counts
  const counts = useMemo(() => {
    let running = 0;
    let delayed = 0;
    let cancelled = 0;
    let unknown = 0;
    for (const bus of buses) {
      const s = statusMap.get(bus.id.toString());
      if (!s) {
        unknown++;
        continue;
      }
      if (s.status === ShuttleStatus.running) running++;
      else if (s.status === ShuttleStatus.delayed) delayed++;
      else if (s.status === ShuttleStatus.cancelled) cancelled++;
    }
    return { running, delayed, cancelled, unknown };
  }, [buses, statusMap]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Shuttle Status
          </h1>
          <p className="text-muted-foreground">
            Live status of all university buses.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="shrink-0"
          data-ocid="status.refresh.button"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Refresh
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
      >
        {[
          {
            label: "Running",
            count: counts.running,
            color: "text-green-600",
            bg: "bg-green-50 border-green-200",
          },
          {
            label: "Delayed",
            count: counts.delayed,
            color: "text-yellow-600",
            bg: "bg-yellow-50 border-yellow-200",
          },
          {
            label: "Cancelled",
            count: counts.cancelled,
            color: "text-red-600",
            bg: "bg-red-50 border-red-200",
          },
          {
            label: "Unknown",
            count: counts.unknown,
            color: "text-muted-foreground",
            bg: "bg-muted/30 border-border",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn("rounded-2xl border p-4 text-center", stat.bg)}
          >
            <p className={cn("text-3xl font-display font-bold", stat.color)}>
              {stat.count}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Bus Status by City */}
      {isLoading ? (
        <div className="space-y-6" data-ocid="status.loading_state">
          {["a", "b", "c"].map((k) => (
            <div key={k}>
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid sm:grid-cols-2 gap-4">
                {["x", "y"].map((j) => (
                  <Skeleton key={`${k}-${j}`} className="h-32 rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : buses.length === 0 ? (
        <div className="text-center py-16" data-ocid="status.empty_state">
          <Bus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-display font-semibold text-foreground">
            No buses found
          </p>
        </div>
      ) : (
        Array.from(byCity.entries()).map(
          ([cityId, { cityName, buses: cityBuses }], cityIdx) => (
            <motion.section
              key={cityId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: cityIdx * 0.06 }}
              className="mb-8"
            >
              <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {cityName}
              </h2>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {cityBuses.map((bus, idx) => {
                  const statusRecord = statusMap.get(bus.id.toString());
                  const cfg = statusRecord
                    ? statusConfig[statusRecord.status]
                    : null;
                  const StatusIcon = cfg?.icon || AlertCircle;

                  return (
                    <motion.div key={bus.id.toString()} variants={item}>
                      <Card
                        className={cn(
                          "border transition-shadow hover:shadow-md",
                          cfg ? cfg.className : "border-border bg-card",
                        )}
                        data-ocid={`status.bus.card.${cityIdx * 10 + idx + 1}`}
                      >
                        <CardContent className="pt-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Bus className="h-5 w-5 text-primary shrink-0" />
                              <h3 className="font-display font-bold text-foreground leading-tight">
                                {bus.busName}
                              </h3>
                            </div>
                            {cfg ? (
                              <Badge
                                className={cn(
                                  "text-xs border shrink-0",
                                  cfg.badgeClass,
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full mr-1 inline-block",
                                    cfg.dotClass,
                                  )}
                                />
                                {cfg.label}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs shrink-0"
                              >
                                Unknown
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {bus.departureTime}
                            </span>
                            <span>→</span>
                            <span>{bus.arrivalTime}</span>
                          </div>

                          {statusRecord && (
                            <div className="space-y-1.5">
                              {statusRecord.statusNote && (
                                <div className="flex items-start gap-1.5">
                                  <StatusIcon
                                    className={cn(
                                      "h-3.5 w-3.5 shrink-0 mt-0.5",
                                      cfg?.iconClass,
                                    )}
                                  />
                                  <p className="text-xs">
                                    {statusRecord.statusNote}
                                  </p>
                                </div>
                              )}
                              {statusRecord.alternateRouteNote &&
                                statusRecord.status !==
                                  ShuttleStatus.running && (
                                  <p className="text-xs bg-background/60 rounded-lg px-2.5 py-1.5 font-medium">
                                    Alt: {statusRecord.alternateRouteNote}
                                  </p>
                                )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.section>
          ),
        )
      )}
    </div>
  );
}
