import type { Driver } from "@/backend.d";
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
  useAddDriver,
  useBuses,
  useCities,
  useDeleteDriver,
  useDrivers,
  useUpdateDriver,
} from "@/hooks/useQueries";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DriverForm {
  busId: string;
  driverName: string;
  phone: string;
}

const emptyForm: DriverForm = { busId: "", driverName: "", phone: "" };

export function AdminDriversTab() {
  const { data: drivers = [] } = useDrivers();
  const { data: buses = [] } = useBuses();
  const { data: cities = [] } = useCities();
  const addDriver = useAddDriver();
  const updateDriver = useUpdateDriver();
  const deleteDriver = useDeleteDriver();

  const [open, setOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState<DriverForm>(emptyForm);

  const busMap = new Map(buses.map((b) => [b.id.toString(), b]));
  const cityMap = new Map(cities.map((c) => [c.id.toString(), c.name]));

  const openAdd = () => {
    setEditDriver(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (driver: Driver) => {
    setEditDriver(driver);
    setForm({
      busId: driver.busId.toString(),
      driverName: driver.driverName,
      phone: driver.phone,
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.busId || !form.driverName || !form.phone) {
      toast.error("Fill all fields");
      return;
    }
    if (editDriver) {
      updateDriver.mutate(
        {
          id: editDriver.id,
          busId: BigInt(form.busId),
          driverName: form.driverName,
          phone: form.phone,
        },
        {
          onSuccess: () => {
            toast.success("Driver updated");
            setOpen(false);
          },
          onError: () => toast.error("Update failed"),
        },
      );
    } else {
      addDriver.mutate(
        {
          busId: BigInt(form.busId),
          driverName: form.driverName,
          phone: form.phone,
        },
        {
          onSuccess: () => {
            toast.success("Driver added");
            setOpen(false);
          },
          onError: () => toast.error("Add failed"),
        },
      );
    }
  };

  const handleDelete = (id: bigint, name: string) => {
    if (!confirm(`Delete driver "${name}"?`)) return;
    deleteDriver.mutate(id, {
      onSuccess: () => toast.success("Deleted"),
      onError: () => toast.error("Delete failed"),
    });
  };

  const isPending = addDriver.isPending || updateDriver.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl">Drivers</h2>
        <Button
          onClick={openAdd}
          size="sm"
          data-ocid="admin.drivers.add.button"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Driver
        </Button>
      </div>

      <div
        className="bg-card border border-border rounded-2xl overflow-hidden"
        data-ocid="admin.drivers.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Driver Name</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="admin.drivers.empty_state"
                >
                  No drivers yet.
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((driver, idx) => {
                const bus = busMap.get(driver.busId.toString());
                const cityName = bus ? cityMap.get(bus.cityId.toString()) : "";
                return (
                  <TableRow
                    key={driver.id.toString()}
                    data-ocid={`admin.drivers.row.${idx + 1}`}
                  >
                    <TableCell className="font-medium">
                      {driver.driverName}
                    </TableCell>
                    <TableCell>
                      {bus?.busName || (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{cityName || "?"}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {driver.phone}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(driver)}
                          data-ocid={`admin.drivers.edit_button.${idx + 1}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            handleDelete(driver.id, driver.driverName)
                          }
                          data-ocid={`admin.drivers.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="admin.drivers.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editDriver ? "Edit Driver" : "Add Driver"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Assign to Bus *</Label>
              <Select
                value={form.busId}
                onValueChange={(v) => setForm((p) => ({ ...p, busId: v }))}
              >
                <SelectTrigger data-ocid="admin.drivers.bus.select">
                  <SelectValue placeholder="Select bus" />
                </SelectTrigger>
                <SelectContent>
                  {buses.map((b) => (
                    <SelectItem key={b.id.toString()} value={b.id.toString()}>
                      {b.busName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Driver Name *</Label>
              <Input
                placeholder="Muhammad Imran"
                value={form.driverName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, driverName: e.target.value }))
                }
                data-ocid="admin.drivers.name.input"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Phone Number *</Label>
              <Input
                placeholder="03XX-XXXXXXX"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                data-ocid="admin.drivers.phone.input"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
                data-ocid="admin.drivers.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1"
                data-ocid="admin.drivers.save_button"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {editDriver ? "Update" : "Add"} Driver
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
