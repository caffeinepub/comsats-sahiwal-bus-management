import { ShuttleStatus } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBus,
  useCities,
  useDriversForBus,
  useShuttleStatus,
  useStudentCountPerBus,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  Bus,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Timer,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";

const statusConfig = {
  [ShuttleStatus.running]: {
    label: "Running On Time",
    icon: CheckCircle2,
    className: "text-green-700 bg-green-50 border-green-200",
    iconClass: "text-green-600",
  },
  [ShuttleStatus.delayed]: {
    label: "Delayed",
    icon: Timer,
    className: "text-yellow-700 bg-yellow-50 border-yellow-200",
    iconClass: "text-yellow-600",
  },
  [ShuttleStatus.cancelled]: {
    label: "Cancelled",
    icon: XCircle,
    className: "text-red-700 bg-red-50 border-red-200",
    iconClass: "text-red-600",
  },
};

export function BusDetailPage() {
  const { cityId, busId } = useParams({
    from: "/layout/routes/$cityId/$busId",
  });
  const busIdBigInt = BigInt(busId);

  const { data: bus, isLoading: busLoading } = useBus(busIdBigInt);
  const { data: cities = [] } = useCities();
  const { data: shuttleStatus } = useShuttleStatus(busIdBigInt);
  const { data: drivers = [] } = useDriversForBus(busIdBigInt);
  const { data: studentCount } = useStudentCountPerBus(busIdBigInt);

  const city = cities.find((c) => c.id.toString() === cityId);
  const status = shuttleStatus ? statusConfig[shuttleStatus.status] : null;

  if (busLoading) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4"
        data-ocid="bus.loading_state"
      >
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!bus) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center"
        data-ocid="bus.error_state"
      >
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h2 className="font-display font-bold text-xl">Bus not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link
          to="/"
          className="hover:text-primary"
          data-ocid="busdetail.home.link"
        >
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to="/routes"
          className="hover:text-primary"
          data-ocid="busdetail.routes.link"
        >
          Routes
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to="/routes/$cityId"
          params={{ cityId }}
          className="hover:text-primary"
          data-ocid="busdetail.city.link"
        >
          {city?.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{bus.busName}</span>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="bg-primary rounded-2xl p-4">
            <Bus className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {bus.busName}
            </h1>
            <p className="text-muted-foreground">
              {city?.name} → COMSATS Sahiwal
            </p>
          </div>
        </div>
      </motion.div>

      {/* Status Banner */}
      {status && shuttleStatus && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "rounded-2xl border p-4 mb-6 flex items-start gap-3",
            status.className,
          )}
        >
          <status.icon
            className={cn("h-5 w-5 shrink-0 mt-0.5", status.iconClass)}
          />
          <div>
            <p className="font-display font-semibold">{status.label}</p>
            {shuttleStatus.statusNote && (
              <p className="text-sm mt-1 opacity-80">
                {shuttleStatus.statusNote}
              </p>
            )}
            {shuttleStatus.alternateRouteNote && (
              <p className="text-sm mt-1 font-medium">
                Alternate: {shuttleStatus.alternateRouteNote}
              </p>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Timings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Morning Departure
                </span>
                <Badge variant="outline" className="font-mono font-semibold">
                  {bus.departureTime}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Arrival at COMSATS
                </span>
                <Badge variant="outline" className="font-mono font-semibold">
                  {bus.arrivalTime}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Return Departure
                </span>
                <Badge variant="outline" className="font-mono font-semibold">
                  {bus.returnDepartureTime}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">
                  Return Arrival
                </span>
                <Badge variant="outline" className="font-mono font-semibold">
                  {bus.returnArrivalTime}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-xl p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Registered Students
                  </p>
                  <p className="text-3xl font-display font-bold text-foreground">
                    {studentCount?.toString() ?? "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {drivers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Driver Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {drivers.map((driver) => (
                  <div
                    key={driver.id.toString()}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {driver.driverName}
                      </p>
                    </div>
                    <a
                      href={`tel:${driver.phone}`}
                      className="text-primary font-mono font-medium hover:underline"
                    >
                      {driver.phone}
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Route Stops */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Route Stops
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6">
                {bus.routeStops.map((stop, stopIdx) => {
                  const isFirst = stopIdx === 0;
                  const isLast = stopIdx === bus.routeStops.length - 1;
                  const uniqueKey = `${stop}__${bus.id.toString()}__${stopIdx.toString()}`;
                  return (
                    <div
                      key={uniqueKey}
                      className="flex items-start gap-4 mb-4 last:mb-0 relative"
                    >
                      {/* Timeline line */}
                      {!isLast && (
                        <div className="absolute left-0 top-6 bottom-0 w-0.5 bg-border -translate-x-[1px]" />
                      )}
                      {/* Dot */}
                      <div
                        className={cn(
                          "absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 -translate-x-1.5 shrink-0",
                          isFirst
                            ? "bg-primary border-primary"
                            : isLast
                              ? "bg-green-500 border-green-500"
                              : "bg-background border-primary/50",
                        )}
                      />
                      <div className="ml-4">
                        <p className="font-medium text-foreground">{stop}</p>
                        {isFirst && (
                          <span className="text-xs text-primary">
                            Starting point
                          </span>
                        )}
                        {isLast && (
                          <span className="text-xs text-green-600">
                            COMSATS Sahiwal Campus
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
