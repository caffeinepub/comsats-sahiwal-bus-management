import type { Bus as BusType } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAddBus,
  useBuses,
  useCities,
  useDeleteBus,
  useUpdateBus,
} from "@/hooks/useQueries";
import { Bus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BusForm {
  cityId: string;
  busName: string;
  stops: string[];
  departureTime: string;
  arrivalTime: string;
  returnDepartureTime: string;
  returnArrivalTime: string;
}

const emptyForm: BusForm = {
  cityId: "",
  busName: "",
  stops: [""],
  departureTime: "",
  arrivalTime: "",
  returnDepartureTime: "",
  returnArrivalTime: "",
};

export function AdminBusesTab() {
  const { data: buses = [] } = useBuses();
  const { data: cities = [] } = useCities();
  const addBus = useAddBus();
  const updateBus = useUpdateBus();
  const deleteBus = useDeleteBus();

  const [open, setOpen] = useState(false);
  const [editBus, setEditBus] = useState<BusType | null>(null);
  const [form, setForm] = useState<BusForm>(emptyForm);

  const cityMap = new Map(cities.map((c) => [c.id.toString(), c.name]));

  const openAdd = () => {
    setEditBus(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (bus: BusType) => {
    setEditBus(bus);
    setForm({
      cityId: bus.cityId.toString(),
      busName: bus.busName,
      stops: bus.routeStops.length > 0 ? bus.routeStops : [""],
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      returnDepartureTime: bus.returnDepartureTime,
      returnArrivalTime: bus.returnArrivalTime,
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validStops = form.stops.filter((s) => s.trim() !== "");
    if (
      !form.cityId ||
      !form.busName ||
      !form.departureTime ||
      !form.arrivalTime
    ) {
      toast.error("Please fill required fields");
      return;
    }

    if (editBus) {
      updateBus.mutate(
        {
          id: editBus.id,
          cityId: BigInt(form.cityId),
          busName: form.busName,
          routeStops: validStops,
          departureTime: form.departureTime,
          arrivalTime: form.arrivalTime,
          returnDepartureTime: form.returnDepartureTime,
          returnArrivalTime: form.returnArrivalTime,
        },
        {
          onSuccess: () => {
            toast.success("Bus updated");
            setOpen(false);
          },
          onError: () => toast.error("Failed to update bus"),
        },
      );
    } else {
      addBus.mutate(
        {
          cityId: BigInt(form.cityId),
          busName: form.busName,
          routeStops: validStops,
          departureTime: form.departureTime,
          arrivalTime: form.arrivalTime,
          returnDepartureTime: form.returnDepartureTime,
          returnArrivalTime: form.returnArrivalTime,
        },
        {
          onSuccess: () => {
            toast.success("Bus added");
            setOpen(false);
          },
          onError: () => toast.error("Failed to add bus"),
        },
      );
    }
  };

  const handleDelete = (id: bigint, name: string) => {
    if (!confirm(`Delete bus "${name}"?`)) return;
    deleteBus.mutate(id, {
      onSuccess: () => toast.success("Bus deleted"),
      onError: () => toast.error("Failed to delete bus"),
    });
  };

  const setStop = (idx: number, val: string) => {
    setForm((prev) => {
      const stops = [...prev.stops];
      stops[idx] = val;
      return { ...prev, stops };
    });
  };

  const addStop = () =>
    setForm((prev) => ({ ...prev, stops: [...prev.stops, ""] }));
  const removeStop = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== idx),
    }));

  const isPending = addBus.isPending || updateBus.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl">Buses</h2>
        <Button onClick={openAdd} size="sm" data-ocid="admin.buses.add.button">
          <Plus className="h-4 w-4 mr-1" /> Add Bus
        </Button>
      </div>

      <div
        className="bg-card border border-border rounded-2xl overflow-hidden"
        data-ocid="admin.buses.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Bus Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Stops</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="admin.buses.empty_state"
                >
                  No buses yet. Click "Add Bus" to create one.
                </TableCell>
              </TableRow>
            ) : (
              buses.map((bus, idx) => (
                <TableRow
                  key={bus.id.toString()}
                  data-ocid={`admin.buses.row.${idx + 1}`}
                >
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <Bus className="h-4 w-4 text-primary" />
                      {bus.busName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {cityMap.get(bus.cityId.toString()) || "?"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {bus.departureTime}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {bus.arrivalTime}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {bus.routeStops.length} stops
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(bus)}
                        data-ocid={`admin.buses.edit_button.${idx + 1}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(bus.id, bus.busName)}
                        data-ocid={`admin.buses.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="admin.buses.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editBus ? "Edit Bus" : "Add New Bus"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-1.5 block">City *</Label>
              <Select
                value={form.cityId}
                onValueChange={(v) => setForm((p) => ({ ...p, cityId: v }))}
              >
                <SelectTrigger data-ocid="admin.buses.city.select">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id.toString()} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block">Bus Name *</Label>
              <Input
                placeholder="Bus A - Okara Express"
                value={form.busName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, busName: e.target.value }))
                }
                data-ocid="admin.buses.name.input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Departure Time *</Label>
                <Input
                  type="time"
                  value={form.departureTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, departureTime: e.target.value }))
                  }
                  data-ocid="admin.buses.departure.input"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Arrival Time *</Label>
                <Input
                  type="time"
                  value={form.arrivalTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, arrivalTime: e.target.value }))
                  }
                  data-ocid="admin.buses.arrival.input"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Return Departure</Label>
                <Input
                  type="time"
                  value={form.returnDepartureTime}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      returnDepartureTime: e.target.value,
                    }))
                  }
                  data-ocid="admin.buses.return_departure.input"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Return Arrival</Label>
                <Input
                  type="time"
                  value={form.returnArrivalTime}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      returnArrivalTime: e.target.value,
                    }))
                  }
                  data-ocid="admin.buses.return_arrival.input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Route Stops</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addStop}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Stop
                </Button>
              </div>
              <div className="space-y-2">
                {form.stops.map((stop, idx) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stop list uses positional keys
                  <div key={`stop-${idx}`} className="flex gap-2">
                    <Input
                      placeholder={`Stop ${idx + 1}`}
                      value={stop}
                      onChange={(e) => setStop(idx, e.target.value)}
                      data-ocid={`admin.buses.stop.input.${idx + 1}`}
                    />
                    {form.stops.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStop(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
                data-ocid="admin.buses.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1"
                data-ocid="admin.buses.save_button"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                {editBus ? "Update" : "Add"} Bus
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
