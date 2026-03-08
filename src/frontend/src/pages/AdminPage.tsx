import { AdminBusesTab } from "@/components/admin/AdminBusesTab";
import { AdminDriversTab } from "@/components/admin/AdminDriversTab";
import { AdminHelpTab } from "@/components/admin/AdminHelpTab";
import { AdminNotificationsTab } from "@/components/admin/AdminNotificationsTab";
import { AdminStatusTab } from "@/components/admin/AdminStatusTab";
import { AdminStudentsTab } from "@/components/admin/AdminStudentsTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useCityCount,
  useIsAdmin,
  useSetupSampleData,
} from "@/hooks/useQueries";
import { Loader2, Lock, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function AdminPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: cityCount } = useCityCount();
  const setupSample = useSetupSampleData();
  const [sampleLoaded, setSampleLoaded] = useState(false);

  // Auto-setup sample data if empty
  // biome-ignore lint/correctness/useExhaustiveDependencies: setupSample.mutate is stable
  useEffect(() => {
    if (
      isAdmin &&
      cityCount !== undefined &&
      cityCount === BigInt(0) &&
      !sampleLoaded
    ) {
      setSampleLoaded(true);
      setupSample.mutate();
    }
  }, [isAdmin, cityCount, sampleLoaded]);

  const isLoggingIn = loginStatus === "logging-in";

  if (adminLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!identity) {
    return (
      <div
        className="max-w-md mx-auto px-4 py-16 text-center"
        data-ocid="admin.login.section"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="bg-primary/10 rounded-full p-4 w-fit mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Admin Access
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in with Internet Identity to access the admin panel.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-primary text-primary-foreground"
            data-ocid="admin.login.button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in with Internet Identity"
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="max-w-md mx-auto px-4 py-16 text-center"
        data-ocid="admin.denied.section"
      >
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <div className="bg-red-100 rounded-full p-4 w-fit mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-display font-bold text-red-800 mb-2">
            Access Denied
          </h2>
          <p className="text-red-600 text-sm">
            Your account does not have administrator privileges for this system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary rounded-xl p-2.5">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Admin Panel
          </h1>
        </div>
        <p className="text-muted-foreground">
          Manage buses, drivers, students, and notifications.
        </p>
      </motion.div>

      {setupSample.isPending && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-xl px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          Setting up sample data...
        </div>
      )}

      <Tabs defaultValue="buses" data-ocid="admin.tabs">
        <TabsList
          className="flex flex-wrap h-auto gap-1 mb-6 bg-muted/50 p-1 rounded-xl"
          data-ocid="admin.tabs.list"
        >
          {[
            "buses",
            "drivers",
            "students",
            "status",
            "notifications",
            "help",
          ].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
              data-ocid={`admin.${tab}.tab`}
            >
              {tab === "help"
                ? "Help Center"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="buses">
          <AdminBusesTab />
        </TabsContent>
        <TabsContent value="drivers">
          <AdminDriversTab />
        </TabsContent>
        <TabsContent value="students">
          <AdminStudentsTab />
        </TabsContent>
        <TabsContent value="status">
          <AdminStatusTab />
        </TabsContent>
        <TabsContent value="notifications">
          <AdminNotificationsTab />
        </TabsContent>
        <TabsContent value="help">
          <AdminHelpTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
