import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HelpContact {
    id: Id;
    contactName: string;
    role: string;
    email: string;
    phone: string;
}
export interface ShuttleStatusRecord {
    status: ShuttleStatus;
    alternateRouteNote: string;
    updatedAt: bigint;
    statusNote: string;
    busId: Id;
}
export interface Driver {
    id: Id;
    busId: Id;
    phone: string;
    driverName: string;
}
export interface Notification {
    id: Id;
    title: string;
    isImportant: boolean;
    createdAt: bigint;
    message: string;
}
export type Id = bigint;
export interface Bus {
    id: Id;
    busName: string;
    arrivalTime: string;
    departureTime: string;
    cityId: Id;
    returnDepartureTime: string;
    routeStops: Array<string>;
    returnArrivalTime: string;
}
export interface City {
    id: Id;
    name: string;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export interface Student {
    id: Id;
    name: string;
    cityId: Id;
    rollNumber: string;
    busId: Id;
    phone: string;
    department: string;
    registeredAt: bigint;
}
export enum ShuttleStatus {
    delayed = "delayed",
    cancelled = "cancelled",
    running = "running"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBus(cityId: Id, busName: string, routeStops: Array<string>, departureTime: string, arrivalTime: string, returnDepartureTime: string, returnArrivalTime: string): Promise<Id>;
    addCity(name: string): Promise<Id>;
    addDriver(busId: Id, driverName: string, phone: string): Promise<Id>;
    addHelpContact(contactName: string, role: string, phone: string, email: string): Promise<Id>;
    addNotification(title: string, message: string, isImportant: boolean): Promise<Id>;
    addSampleData(): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearAllData(): Promise<void>;
    deleteBus(id: Id): Promise<void>;
    deleteCity(id: Id): Promise<void>;
    deleteDriver(id: Id): Promise<void>;
    deleteHelpContact(id: Id): Promise<void>;
    deleteNotification(id: Id): Promise<void>;
    getAllShuttleStatuses(): Promise<Array<ShuttleStatusRecord>>;
    getBus(id: Id): Promise<Bus>;
    getBusCount(): Promise<bigint>;
    getBuses(): Promise<Array<Bus>>;
    getBusesForCity(cityId: Id): Promise<Array<Bus>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCities(): Promise<Array<City>>;
    getCity(id: Id): Promise<City>;
    getCityCount(): Promise<bigint>;
    getDriver(id: Id): Promise<Driver>;
    getDrivers(): Promise<Array<Driver>>;
    getDriversForBus(busId: Id): Promise<Array<Driver>>;
    getHelpContact(id: Id): Promise<HelpContact>;
    getHelpContacts(): Promise<Array<HelpContact>>;
    getNotification(id: Id): Promise<Notification>;
    getNotifications(): Promise<Array<Notification>>;
    getReadNotifications(): Promise<Array<Id>>;
    getShuttleStatus(busId: Id): Promise<ShuttleStatusRecord | null>;
    getStudentCountPerBus(busId: Id): Promise<bigint>;
    getStudents(): Promise<Array<Student>>;
    getStudentsForBus(busId: Id): Promise<Array<Student>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationAsRead(notificationId: Id): Promise<void>;
    registerStudent(name: string, rollNumber: string, department: string, phone: string, cityId: Id, busId: Id): Promise<Id>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setupSampleData(): Promise<void>;
    updateBus(id: Id, cityId: Id, busName: string, routeStops: Array<string>, departureTime: string, arrivalTime: string, returnDepartureTime: string, returnArrivalTime: string): Promise<void>;
    updateCity(id: Id, name: string): Promise<void>;
    updateDriver(id: Id, busId: Id, driverName: string, phone: string): Promise<void>;
    updateHelpContact(id: Id, contactName: string, role: string, phone: string, email: string): Promise<void>;
    updateNotification(id: Id, title: string, message: string, isImportant: boolean): Promise<void>;
    updateShuttleStatus(busId: Id, status: ShuttleStatus, statusNote: string, alternateRouteNote: string): Promise<void>;
}
