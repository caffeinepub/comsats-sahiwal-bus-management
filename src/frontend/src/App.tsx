import { Layout } from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/sonner";
import { AdminPage } from "@/pages/AdminPage";
import { BusDetailPage } from "@/pages/BusDetailPage";
import { CityBusesPage } from "@/pages/CityBusesPage";
import { DriversPage } from "@/pages/DriversPage";
import { HelpPage } from "@/pages/HelpPage";
import { HomePage } from "@/pages/HomePage";
import { MapPage } from "@/pages/MapPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { RoutesPage } from "@/pages/RoutesPage";
import { StatusPage } from "@/pages/StatusPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="bottom-right" richColors />
    </>
  ),
});

// Layout route (all pages share the layout)
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

// Home
const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});

// Routes
const routesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/routes",
  component: RoutesPage,
});

const cityRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/routes/$cityId",
  component: CityBusesPage,
});

const busDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/routes/$cityId/$busId",
  component: BusDetailPage,
});

// Map
const mapRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/map",
  component: MapPage,
});

// Drivers
const driversRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/drivers",
  component: DriversPage,
});

// Help
const helpRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/help",
  component: HelpPage,
});

// Register
const registerRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/register",
  component: RegisterPage,
});

// Status
const statusRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/status",
  component: StatusPage,
});

// Admin
const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    homeRoute,
    routesRoute,
    cityRoute,
    busDetailRoute,
    mapRoute,
    driversRoute,
    helpRoute,
    registerRoute,
    statusRoute,
    adminRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
