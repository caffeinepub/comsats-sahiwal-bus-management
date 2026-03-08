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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddNotification,
  useDeleteNotification,
  useNotifications,
} from "@/hooks/useQueries";
import { AlertCircle, Info, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AdminNotificationsTab() {
  const { data: notifications = [] } = useNotifications();
  const addNotif = useAddNotification();
  const deleteNotif = useDeleteNotification();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    isImportant: false,
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      toast.error("Fill all fields");
      return;
    }
    addNotif.mutate(form, {
      onSuccess: () => {
        toast.success("Notification created");
        setOpen(false);
        setForm({ title: "", message: "", isImportant: false });
      },
      onError: () => toast.error("Failed to create notification"),
    });
  };

  const handleDelete = (id: bigint, title: string) => {
    if (!confirm(`Delete notification "${title}"?`)) return;
    deleteNotif.mutate(id, {
      onSuccess: () => toast.success("Deleted"),
      onError: () => toast.error("Delete failed"),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl">Notifications</h2>
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          data-ocid="admin.notifications.add.button"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Notification
        </Button>
      </div>

      <div className="space-y-3" data-ocid="admin.notifications.list">
        {notifications.length === 0 ? (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="admin.notifications.empty_state"
          >
            No notifications yet.
          </div>
        ) : (
          notifications.map((notif, idx) => (
            <div
              key={notif.id.toString()}
              className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4"
              data-ocid={`admin.notifications.item.${idx + 1}`}
            >
              <div className="shrink-0 mt-0.5">
                {notif.isImportant ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <Info className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold text-foreground">
                    {notif.title}
                  </h3>
                  {notif.isImportant && (
                    <Badge className="bg-red-100 text-red-800 border border-red-200 text-xs">
                      Important
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                onClick={() => handleDelete(notif.id, notif.title)}
                data-ocid={`admin.notifications.delete_button.${idx + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="admin.notifications.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add Notification</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Title *</Label>
              <Input
                placeholder="Bus Service Update"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                data-ocid="admin.notifications.title.input"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Message *</Label>
              <Textarea
                placeholder="Notification message..."
                value={form.message}
                onChange={(e) =>
                  setForm((p) => ({ ...p, message: e.target.value }))
                }
                className="resize-none h-24"
                data-ocid="admin.notifications.message.textarea"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isImportant}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, isImportant: v }))
                }
                data-ocid="admin.notifications.important.switch"
              />
              <Label>Mark as Important (shows pop-up to students)</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
                data-ocid="admin.notifications.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addNotif.isPending}
                className="flex-1"
                data-ocid="admin.notifications.save_button"
              >
                {addNotif.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                )}
                Create Notification
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
