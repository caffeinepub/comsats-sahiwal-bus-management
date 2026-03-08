import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useMarkNotificationAsRead,
  useNotifications,
  useReadNotifications,
} from "@/hooks/useQueries";
import { AlertCircle, Bell, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function NotificationSystem() {
  const { data: notifications = [] } = useNotifications();
  const { data: readIds = [] } = useReadNotifications();
  const markRead = useMarkNotificationAsRead();

  const [popupQueue, setPopupQueue] = useState<typeof notifications>([]);
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());
  const [bellOpen, setBellOpen] = useState(false);
  const [currentPopup, setCurrentPopup] = useState<
    (typeof notifications)[0] | null
  >(null);

  const readIdStrings = new Set(readIds.map((id) => id.toString()));

  // biome-ignore lint/correctness/useExhaustiveDependencies: readIdStrings is derived, shownIds causes inf loop
  useEffect(() => {
    const unread = notifications.filter(
      (n) =>
        n.isImportant &&
        !readIdStrings.has(n.id.toString()) &&
        !shownIds.has(n.id.toString()),
    );
    if (unread.length > 0) {
      setPopupQueue((prev) => {
        const newIds = unread.filter(
          (n) => !prev.some((p) => p.id.toString() === n.id.toString()),
        );
        return [...prev, ...newIds];
      });
      setShownIds((prev) => {
        const next = new Set(prev);
        for (const n of unread) {
          next.add(n.id.toString());
        }
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, readIdStrings.size]);

  useEffect(() => {
    if (!currentPopup && popupQueue.length > 0) {
      setCurrentPopup(popupQueue[0]);
      setPopupQueue((prev) => prev.slice(1));
    }
  }, [currentPopup, popupQueue]);

  const handleMarkRead = (id: bigint) => {
    markRead.mutate(id);
    setCurrentPopup(null);
  };

  const allUnread = notifications.filter(
    (n) => !readIdStrings.has(n.id.toString()),
  );
  const unreadCount = allUnread.length;

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/20"
          onClick={() => setBellOpen((v) => !v)}
          data-ocid="notification.bell.button"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-0">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>

        <AnimatePresence>
          {bellOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
              data-ocid="notification.popover"
            >
              <div className="p-3 border-b border-border bg-primary/5 flex items-center justify-between">
                <span className="font-display font-semibold text-sm text-foreground">
                  Notifications
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setBellOpen(false)}
                  data-ocid="notification.bell.close_button"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {allUnread.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No new notifications
                  </div>
                ) : (
                  allUnread.map((notif, idx) => (
                    <div
                      key={notif.id.toString()}
                      className="p-3 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                      data-ocid={`notification.item.${idx + 1}`}
                    >
                      <div className="flex items-start gap-2">
                        {notif.isImportant ? (
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        ) : (
                          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs text-foreground truncate">
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2 shrink-0"
                          onClick={() => markRead.mutate(notif.id)}
                          data-ocid={`notification.mark_read.button.${idx + 1}`}
                        >
                          Mark read
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Important Notification Popup */}
      <AnimatePresence>
        {currentPopup && (
          <motion.div
            key={currentPopup.id.toString()}
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm"
            data-ocid="notification.popup.toast"
          >
            <div className="bg-popover border border-red-200 rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-red-500 px-4 py-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-white shrink-0" />
                <span className="text-white text-sm font-semibold font-display">
                  Important Notification
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-display font-semibold text-foreground mb-1">
                  {currentPopup.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {currentPopup.message}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPopup(null)}
                    data-ocid="notification.popup.close_button"
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground"
                    onClick={() => handleMarkRead(currentPopup.id)}
                    data-ocid="notification.popup.mark_read.button"
                  >
                    Mark as Read
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
