import { ShuttleStatus } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAllShuttleStatuses,
  useBuses,
  useCities,
  useUpdateShuttleStatus,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Timer, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const statusOptions = [
  {
    value: ShuttleStatus.running,
    label: "Running",
    icon: CheckCircle2,
    color: "text-green-600",
  },
  {
    value: ShuttleStatus.delayed,
    label: "Delayed",
    icon: Timer,
    color: "text-yellow-600",
  },
  {
    value: ShuttleStatus.cancelled,
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
  },
];

interface StatusForm {
  status: ShuttleStatus;
  statusNote: string;
  alternateRouteNote: string;
}

interface BusStatusCardProps {
  bus: { id: bigint; busName: string };
  cityName: string;
  currentStatus:
    | { status: ShuttleStatus; statusNote: string; alternateRouteNote: string }
    | undefined;
  idx: number;
}

function BusStatusCard({
  bus,
  cityName,
  currentStatus,
  idx,
}: BusStatusCardProps) {
  const updateStatus = useUpdateShuttleStatus();
  const [form, setForm] = useState<StatusForm>({
    status: currentStatus?.status ?? ShuttleStatus.running,
    statusNote: currentStatus?.statusNote ?? "",
    alternateRouteNote: currentStatus?.alternateRouteNote ?? "",
  });

  useEffect(() => {
    if (currentStatus) {
      setForm({
        status: currentStatus.status,
        statusNote: currentStatus.statusNote,
        alternateRouteNote: currentStatus.alternateRouteNote,
      });
    }
  }, [currentStatus]);

  const handleSave = () => {
    updateStatus.mutate(
      {
        busId: bus.id,
        status: form.status,
        statusNote: form.statusNote,
        alternateRouteNote: form.alternateRouteNote,
      },
      {
        onSuccess: () => toast.success(`Status updated for ${bus.busName}`),
        onError: () => toast.error("Failed to update status"),
      },
    );
  };

  return (
    <div
      className="bg-card border border-border rounded-2xl p-5 space-y-4"
      data-ocid={`admin.status.bus.card.${idx + 1}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-foreground">
            {bus.busName}
          </h3>
          <p className="text-xs text-muted-foreground">{cityName}</p>
        </div>
        <Badge
          className={cn("border", {
            "bg-green-100 text-green-800 border-green-200":
              form.status === ShuttleStatus.running,
            "bg-yellow-100 text-yellow-800 border-yellow-200":
              form.status === ShuttleStatus.delayed,
            "bg-red-100 text-red-800 border-red-200":
              form.status === ShuttleStatus.cancelled,
          })}
        >
          {statusOptions.find((o) => o.value === form.status)?.label}
        </Badge>
      </div>

      <div>
        <Label className="mb-1.5 block text-sm">Status</Label>
        <Select
          value={form.status}
          onValueChange={(v) =>
            setForm((p) => ({ ...p, status: v as ShuttleStatus }))
          }
        >
          <SelectTrigger data-ocid={`admin.status.select.${idx + 1}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className={cn("flex items-center gap-2", opt.color)}>
                  <opt.icon className="h-4 w-4" />
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-1.5 block text-sm">Status Note</Label>
        <Textarea
          placeholder="e.g. Bus is 20 minutes late due to traffic..."
          value={form.statusNote}
          onChange={(e) =>
            setForm((p) => ({ ...p, statusNote: e.target.value }))
          }
          className="resize-none h-20"
          data-ocid={`admin.status.note.textarea.${idx + 1}`}
        />
      </div>

      {form.status !== ShuttleStatus.running && (
        <div>
          <Label className="mb-1.5 block text-sm">Alternate Route Note</Label>
          <Textarea
            placeholder="e.g. Students may board Bus B from Okara Adda..."
            value={form.alternateRouteNote}
            onChange={(e) =>
              setForm((p) => ({ ...p, alternateRouteNote: e.target.value }))
            }
            className="resize-none h-20"
            data-ocid={`admin.status.alternate.textarea.${idx + 1}`}
          />
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={updateStatus.isPending}
        className="w-full"
        data-ocid={`admin.status.update_button.${idx + 1}`}
      >
        {updateStatus.isPending && (
          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
        )}
        Update Status
      </Button>
    </div>
  );
}

export function AdminStatusTab() {
  const { data: buses = [] } = useBuses();
  const { data: cities = [] } = useCities();
  const { data: statuses = [] } = useAllShuttleStatuses();

  const cityMap = new Map(cities.map((c) => [c.id.toString(), c.name]));
  const statusMap = new Map(statuses.map((s) => [s.busId.toString(), s]));

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl">
          Shuttle Status Management
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Update the real-time status for each bus.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {buses.length === 0 ? (
          <div
            className="col-span-full text-center py-8 text-muted-foreground"
            data-ocid="admin.status.empty_state"
          >
            No buses available. Add buses first.
          </div>
        ) : (
          buses.map((bus, idx) => {
            const cityName = cityMap.get(bus.cityId.toString()) ?? "Unknown";
            const currentStatus = statusMap.get(bus.id.toString());
            return (
              <BusStatusCard
                key={bus.id.toString()}
                bus={bus}
                cityName={cityName}
                currentStatus={currentStatus}
                idx={idx}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
