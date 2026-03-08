import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Bus,
  City,
  Driver,
  HelpContact,
  Notification,
  ShuttleStatus,
  ShuttleStatusRecord,
  Student,
} from "../backend.d";
import { useActor } from "./useActor";

type Id = bigint;

// ─── Cities ──────────────────────────────────────────────────────────────────

export function useCities() {
  const { actor, isFetching } = useActor();
  return useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCityCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["cityCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getCityCount();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Buses ───────────────────────────────────────────────────────────────────

export function useBuses() {
  const { actor, isFetching } = useActor();
  return useQuery<Bus[]>({
    queryKey: ["buses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBuses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBusesForCity(cityId: Id | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Bus[]>({
    queryKey: ["buses", "city", cityId?.toString()],
    queryFn: async () => {
      if (!actor || cityId === null) return [];
      return actor.getBusesForCity(cityId);
    },
    enabled: !!actor && !isFetching && cityId !== null,
  });
}

export function useBus(id: Id | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Bus | null>({
    queryKey: ["bus", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getBus(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

// ─── Drivers ─────────────────────────────────────────────────────────────────

export function useDrivers() {
  const { actor, isFetching } = useActor();
  return useQuery<Driver[]>({
    queryKey: ["drivers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDrivers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDriversForBus(busId: Id | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Driver[]>({
    queryKey: ["drivers", "bus", busId?.toString()],
    queryFn: async () => {
      if (!actor || busId === null) return [];
      return actor.getDriversForBus(busId);
    },
    enabled: !!actor && !isFetching && busId !== null,
  });
}

// ─── Students ────────────────────────────────────────────────────────────────

export function useStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStudentsForBus(busId: Id | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Student[]>({
    queryKey: ["students", "bus", busId?.toString()],
    queryFn: async () => {
      if (!actor || busId === null) return [];
      return actor.getStudentsForBus(busId);
    },
    enabled: !!actor && !isFetching && busId !== null,
  });
}

export function useStudentCountPerBus(busId: Id | null) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["studentCount", busId?.toString()],
    queryFn: async () => {
      if (!actor || busId === null) return BigInt(0);
      return actor.getStudentCountPerBus(busId);
    },
    enabled: !!actor && !isFetching && busId !== null,
  });
}

// ─── Shuttle Statuses ────────────────────────────────────────────────────────

export function useAllShuttleStatuses() {
  const { actor, isFetching } = useActor();
  return useQuery<ShuttleStatusRecord[]>({
    queryKey: ["shuttleStatuses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllShuttleStatuses();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useShuttleStatus(busId: Id | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ShuttleStatusRecord | null>({
    queryKey: ["shuttleStatus", busId?.toString()],
    queryFn: async () => {
      if (!actor || busId === null) return null;
      return actor.getShuttleStatus(busId);
    },
    enabled: !!actor && !isFetching && busId !== null,
  });
}

// ─── Notifications ───────────────────────────────────────────────────────────

export function useNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
  });
}

export function useReadNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Id[]>({
    queryKey: ["readNotifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReadNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: Id) => {
      if (!actor) throw new Error("No actor");
      return actor.markNotificationAsRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readNotifications"] });
    },
  });
}

// ─── Help Contacts ───────────────────────────────────────────────────────────

export function useHelpContacts() {
  const { actor, isFetching } = useActor();
  return useQuery<HelpContact[]>({
    queryKey: ["helpContacts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHelpContacts();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetupSampleData() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.setupSampleData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      queryClient.invalidateQueries({ queryKey: ["buses"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["helpContacts"] });
      queryClient.invalidateQueries({ queryKey: ["shuttleStatuses"] });
    },
  });
}

// ─── Bus Mutations ───────────────────────────────────────────────────────────

export function useAddBus() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      cityId: Id;
      busName: string;
      routeStops: string[];
      departureTime: string;
      arrivalTime: string;
      returnDepartureTime: string;
      returnArrivalTime: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addBus(
        data.cityId,
        data.busName,
        data.routeStops,
        data.departureTime,
        data.arrivalTime,
        data.returnDepartureTime,
        data.returnArrivalTime,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
    },
  });
}

export function useUpdateBus() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      id: Id;
      cityId: Id;
      busName: string;
      routeStops: string[];
      departureTime: string;
      arrivalTime: string;
      returnDepartureTime: string;
      returnArrivalTime: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateBus(
        data.id,
        data.cityId,
        data.busName,
        data.routeStops,
        data.departureTime,
        data.arrivalTime,
        data.returnDepartureTime,
        data.returnArrivalTime,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
    },
  });
}

export function useDeleteBus() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: Id) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteBus(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
    },
  });
}

// ─── Driver Mutations ────────────────────────────────────────────────────────

export function useAddDriver() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      busId: Id;
      driverName: string;
      phone: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addDriver(data.busId, data.driverName, data.phone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      id: Id;
      busId: Id;
      driverName: string;
      phone: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateDriver(
        data.id,
        data.busId,
        data.driverName,
        data.phone,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: Id) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteDriver(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}

// ─── Notification Mutations ──────────────────────────────────────────────────

export function useAddNotification() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      message: string;
      isImportant: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addNotification(data.title, data.message, data.isImportant);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: Id) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteNotification(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useUpdateNotification() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      id: Id;
      title: string;
      message: string;
      isImportant: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateNotification(
        data.id,
        data.title,
        data.message,
        data.isImportant,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ─── Help Contact Mutations ──────────────────────────────────────────────────

export function useAddHelpContact() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      contactName: string;
      role: string;
      phone: string;
      email: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addHelpContact(
        data.contactName,
        data.role,
        data.phone,
        data.email,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helpContacts"] });
    },
  });
}

export function useUpdateHelpContact() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      id: Id;
      contactName: string;
      role: string;
      phone: string;
      email: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateHelpContact(
        data.id,
        data.contactName,
        data.role,
        data.phone,
        data.email,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helpContacts"] });
    },
  });
}

export function useDeleteHelpContact() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: Id) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteHelpContact(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helpContacts"] });
    },
  });
}

// ─── Shuttle Status Mutations ────────────────────────────────────────────────

export function useUpdateShuttleStatus() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      busId: Id;
      status: ShuttleStatus;
      statusNote: string;
      alternateRouteNote: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateShuttleStatus(
        data.busId,
        data.status,
        data.statusNote,
        data.alternateRouteNote,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shuttleStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["shuttleStatus"] });
    },
  });
}

// ─── City Mutations ──────────────────────────────────────────────────────────

export function useAddCity() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      return actor.addCity(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      queryClient.invalidateQueries({ queryKey: ["cityCount"] });
    },
  });
}

export function useDeleteCity() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: Id) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteCity(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      queryClient.invalidateQueries({ queryKey: ["cityCount"] });
    },
  });
}

// ─── Register Student ────────────────────────────────────────────────────────

export function useRegisterStudent() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      rollNumber: string;
      department: string;
      phone: string;
      cityId: Id;
      busId: Id;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.registerStudent(
        data.name,
        data.rollNumber,
        data.department,
        data.phone,
        data.cityId,
        data.busId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
