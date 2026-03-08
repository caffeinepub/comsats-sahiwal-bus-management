import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBuses, useCities, useStudents } from "@/hooks/useQueries";
import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

export function AdminStudentsTab() {
  const { data: students = [], isLoading } = useStudents();
  const { data: buses = [] } = useBuses();
  const { data: cities = [] } = useCities();

  const [search, setSearch] = useState("");
  const [busFilter, setBusFilter] = useState("all");

  const busMap = useMemo(
    () => new Map(buses.map((b) => [b.id.toString(), b])),
    [buses],
  );
  const cityMap = useMemo(
    () => new Map(cities.map((c) => [c.id.toString(), c.name])),
    [cities],
  );

  const busStudentCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of students) {
      const key = s.busId.toString();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchBus = busFilter === "all" || s.busId.toString() === busFilter;
      const matchSearch =
        search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase());
      return matchBus && matchSearch;
    });
  }, [students, search, busFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl">
          Students ({students.length})
        </h2>
      </div>

      {/* Bus count summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {buses.map((bus) => {
          const count = busStudentCount.get(bus.id.toString()) || 0;
          return (
            <button
              key={bus.id.toString()}
              type="button"
              className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors cursor-pointer text-left w-full"
              onClick={() => setBusFilter(bus.id.toString())}
              data-ocid={`admin.students.bus.card.${buses.indexOf(bus) + 1}`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate">
                  {bus.busName}
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground mt-1">
                {count}
              </p>
              <p className="text-xs text-muted-foreground">students</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, roll no, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="admin.students.search_input"
          />
        </div>
        <Select value={busFilter} onValueChange={setBusFilter}>
          <SelectTrigger
            className="w-full sm:w-48"
            data-ocid="admin.students.bus.select"
          >
            <SelectValue placeholder="Filter by bus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buses</SelectItem>
            {buses.map((b) => (
              <SelectItem key={b.id.toString()} value={b.id.toString()}>
                {b.busName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.students.loading_state">
          {["a", "b", "c", "d", "e"].map((k) => (
            <Skeleton key={k} className="h-12 rounded-xl" />
          ))}
        </div>
      ) : (
        <div
          className="bg-card border border-border rounded-2xl overflow-hidden"
          data-ocid="admin.students.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead>City</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="admin.students.empty_state"
                  >
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((student, idx) => {
                  const bus = busMap.get(student.busId.toString());
                  const cityName = bus
                    ? cityMap.get(bus.cityId.toString())
                    : "";
                  return (
                    <TableRow
                      key={student.id.toString()}
                      data-ocid={`admin.students.row.${idx + 1}`}
                    >
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.rollNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        {student.department}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.phone}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {bus?.busName || "?"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cityName || "?"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
