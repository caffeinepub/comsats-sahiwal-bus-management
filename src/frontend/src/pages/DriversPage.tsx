import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBuses, useCities, useDrivers } from "@/hooks/useQueries";
import { Bus, Phone, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

export function DriversPage() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");

  const { data: buses = [], isLoading: busesLoading } = useBuses();
  const { data: drivers = [], isLoading: driversLoading } = useDrivers();
  const { data: cities = [] } = useCities();

  const isLoading = busesLoading || driversLoading;

  const cityMap = useMemo(
    () => new Map(cities.map((c) => [c.id.toString(), c.name])),
    [cities],
  );
  const driverMap = useMemo(() => {
    const map = new Map<string, (typeof drivers)[0][]>();
    for (const d of drivers) {
      const key = d.busId.toString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return map;
  }, [drivers]);

  const filtered = useMemo(() => {
    return buses.filter((bus) => {
      const cityName = cityMap.get(bus.cityId.toString()) || "";
      const matchSearch =
        search === "" ||
        bus.busName.toLowerCase().includes(search.toLowerCase()) ||
        cityName.toLowerCase().includes(search.toLowerCase());
      const matchCity =
        cityFilter === "all" || bus.cityId.toString() === cityFilter;
      return matchSearch && matchCity;
    });
  }, [buses, search, cityFilter, cityMap]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Driver Contacts
        </h1>
        <p className="text-muted-foreground">
          Phone numbers for all university bus drivers.
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by bus name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="drivers.search_input"
          />
        </div>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          data-ocid="drivers.city.select"
        >
          <option value="all">All Cities</option>
          {cities.map((city) => (
            <option key={city.id.toString()} value={city.id.toString()}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="drivers.loading_state">
          {["a", "b", "c", "d", "e", "f"].map((k) => (
            <Skeleton key={k} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" data-ocid="drivers.empty_state">
          <Bus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-display font-semibold text-foreground">
            No drivers found
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Try adjusting your search or filter.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
          data-ocid="drivers.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-display font-semibold">
                  Bus
                </TableHead>
                <TableHead className="font-display font-semibold">
                  City
                </TableHead>
                <TableHead className="font-display font-semibold">
                  Driver Name
                </TableHead>
                <TableHead className="font-display font-semibold">
                  Phone
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((bus, idx) => {
                const busDrivers = driverMap.get(bus.id.toString()) || [];
                const cityName =
                  cityMap.get(bus.cityId.toString()) || "Unknown";

                if (busDrivers.length === 0) {
                  return (
                    <TableRow
                      key={bus.id.toString()}
                      data-ocid={`drivers.row.${idx + 1}`}
                    >
                      <TableCell className="font-medium">
                        {bus.busName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cityName}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm italic">
                        Not assigned
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        —
                      </TableCell>
                    </TableRow>
                  );
                }

                return busDrivers.map((driver, dIdx) => (
                  <TableRow
                    key={`${bus.id}-${driver.id}`}
                    data-ocid={`drivers.row.${idx + 1}`}
                  >
                    <TableCell className="font-medium">
                      {dIdx === 0 ? bus.busName : ""}
                    </TableCell>
                    <TableCell>
                      {dIdx === 0 ? (
                        <Badge variant="outline">{cityName}</Badge>
                      ) : (
                        ""
                      )}
                    </TableCell>
                    <TableCell>{driver.driverName}</TableCell>
                    <TableCell>
                      <a
                        href={`tel:${driver.phone}`}
                        className="flex items-center gap-1.5 text-primary font-mono font-semibold hover:underline"
                        data-ocid={`drivers.phone.button.${idx + 1}`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {driver.phone}
                      </a>
                    </TableCell>
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
}
