import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Id = Nat;

  type ShuttleStatus = {
    #running;
    #cancelled;
    #delayed;
  };

  type City = {
    id : Id;
    name : Text;
  };

  module City {
    public func compare(city1 : City, city2 : City) : Order.Order {
      switch (city1.id, city2.id) {
        case (id1, id2) { Nat.compare(id1, id2) };
      };
    };
  };

  type Bus = {
    id : Id;
    cityId : Id;
    busName : Text;
    routeStops : [Text];
    departureTime : Text;
    arrivalTime : Text;
    returnDepartureTime : Text;
    returnArrivalTime : Text;
  };

  module Bus {
    public func compare(bus1 : Bus, bus2 : Bus) : Order.Order {
      switch (bus1.id, bus2.id) {
        case (id1, id2) { Nat.compare(id1, id2) };
      };
    };
  };

  type Driver = {
    id : Id;
    busId : Id;
    driverName : Text;
    phone : Text;
  };

  module Driver {
    public func compare(driver1 : Driver, driver2 : Driver) : Order.Order {
      switch (driver1.id, driver2.id) {
        case (id1, id2) { Nat.compare(id1, id2) };
      };
    };
  };

  type Student = {
    id : Id;
    name : Text;
    rollNumber : Text;
    department : Text;
    phone : Text;
    cityId : Id;
    busId : Id;
    registeredAt : Int;
  };

  module Student {
    public func compare(student1 : Student, student2 : Student) : Order.Order {
      switch (student1.id, student2.id) {
        case (id1, id2) { Nat.compare(id1, id2) };
      };
    };
  };

  type ShuttleStatusRecord = {
    busId : Id;
    status : ShuttleStatus;
    statusNote : Text;
    alternateRouteNote : Text;
    updatedAt : Int;
  };

  module ShuttleStatusRecord {
    public func compare(statusRecord1 : ShuttleStatusRecord, statusRecord2 : ShuttleStatusRecord) : Order.Order {
      switch (statusRecord1.busId, statusRecord2.busId) {
        case (busId1, busId2) { Nat.compare(busId1, busId2) };
      };
    };
  };

  type Notification = {
    id : Id;
    title : Text;
    message : Text;
    createdAt : Int;
    isImportant : Bool;
  };

  module Notification {
    public func compare(notification1 : Notification, notification2 : Notification) : Order.Order {
      switch (notification1.id, notification2.id) {
        case (id1, id2) { Nat.compare(id1, id2) };
      };
    };
  };

  type HelpContact = {
    id : Id;
    contactName : Text;
    role : Text;
    phone : Text;
    email : Text;
  };

  module HelpContact {
    public func compare(helpContact1 : HelpContact, helpContact2 : HelpContact) : Order.Order {
      switch (helpContact1.id, helpContact2.id) {
        case (id1, id2) { Nat.compare(id1, id2) };
      };
    };
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  var nextCityId = 1;
  var nextBusId = 1;
  var nextDriverId = 1;
  var nextStudentId = 1;
  var nextNotificationId = 1;
  var nextHelpContactId = 1;

  let cities = Map.empty<Id, City>();
  let buses = Map.empty<Id, Bus>();
  let drivers = Map.empty<Id, Driver>();
  let students = Map.empty<Id, Student>();
  let shuttleStatuses = Map.empty<Id, ShuttleStatusRecord>();
  let notifications = Map.empty<Id, Notification>();
  let helpContacts = Map.empty<Id, HelpContact>();
  let userReadNotifications = Map.empty<Principal, Set.Set<Id>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // City Management
  public shared ({ caller }) func addCity(name : Text) : async Id {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add cities");
    };

    let city : City = {
      id = nextCityId;
      name;
    };
    cities.add(nextCityId, city);
    nextCityId += 1;
    city.id;
  };

  public shared ({ caller }) func updateCity(id : Id, name : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update cities");
    };

    switch (cities.get(id)) {
      case (null) { Runtime.trap("City not found") };
      case (?_) {
        let city : City = {
          id;
          name;
        };
        cities.add(id, city);
      };
    };
  };

  public shared ({ caller }) func deleteCity(id : Id) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete cities");
    };

    switch (cities.get(id)) {
      case (null) { Runtime.trap("City not found") };
      case (?_) {
        cities.remove(id);
      };
    };
  };

  public query ({ caller }) func getCity(id : Id) : async City {
    // Public read - no authorization required
    switch (cities.get(id)) {
      case (null) { Runtime.trap("City not found") };
      case (?city) { city };
    };
  };

  public query ({ caller }) func getCities() : async [City] {
    // Public read - no authorization required
    cities.values().toArray().sort();
  };

  public query ({ caller }) func getCityCount() : async Nat {
    // Public read - no authorization required
    cities.keys().toArray().size();
  };

  // Bus Management
  public shared ({ caller }) func addBus(cityId : Id, busName : Text, routeStops : [Text], departureTime : Text, arrivalTime : Text, returnDepartureTime : Text, returnArrivalTime : Text) : async Id {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add buses");
    };

    let bus : Bus = {
      id = nextBusId;
      cityId;
      busName;
      routeStops;
      departureTime;
      arrivalTime;
      returnDepartureTime;
      returnArrivalTime;
    };
    buses.add(nextBusId, bus);
    nextBusId += 1;
    bus.id;
  };

  public shared ({ caller }) func updateBus(id : Id, cityId : Id, busName : Text, routeStops : [Text], departureTime : Text, arrivalTime : Text, returnDepartureTime : Text, returnArrivalTime : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update buses");
    };

    switch (buses.get(id)) {
      case (null) { Runtime.trap("Bus not found") };
      case (?_) {
        let bus : Bus = {
          id;
          cityId;
          busName;
          routeStops;
          departureTime;
          arrivalTime;
          returnDepartureTime;
          returnArrivalTime;
        };
        buses.add(id, bus);
      };
    };
  };

  public shared ({ caller }) func deleteBus(id : Id) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete buses");
    };

    switch (buses.get(id)) {
      case (null) { Runtime.trap("Bus not found") };
      case (?_) {
        buses.remove(id);
      };
    };
  };

  public query ({ caller }) func getBus(id : Id) : async Bus {
    // Public read - no authorization required
    switch (buses.get(id)) {
      case (null) { Runtime.trap("Bus not found") };
      case (?bus) { bus };
    };
  };

  public query ({ caller }) func getBuses() : async [Bus] {
    // Public read - no authorization required
    buses.values().toArray().sort();
  };

  public query ({ caller }) func getBusCount() : async Nat {
    // Public read - no authorization required
    buses.keys().toArray().size();
  };

  public query ({ caller }) func getBusesForCity(cityId : Id) : async [Bus] {
    // Public read - no authorization required
    buses.values().toArray().sort().filter(func(bus) { bus.cityId == cityId });
  };

  // Driver Management
  public shared ({ caller }) func addDriver(busId : Id, driverName : Text, phone : Text) : async Id {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add drivers");
    };

    let driver : Driver = {
      id = nextDriverId;
      busId;
      driverName;
      phone;
    };
    drivers.add(nextDriverId, driver);
    nextDriverId += 1;
    driver.id;
  };

  public shared ({ caller }) func updateDriver(id : Id, busId : Id, driverName : Text, phone : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update drivers");
    };

    switch (drivers.get(id)) {
      case (null) { Runtime.trap("Driver not found") };
      case (?_) {
        let driver : Driver = {
          id;
          busId;
          driverName;
          phone;
        };
        drivers.add(id, driver);
      };
    };
  };

  public shared ({ caller }) func deleteDriver(id : Id) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete drivers");
    };

    switch (drivers.get(id)) {
      case (null) { Runtime.trap("Driver not found") };
      case (?_) {
        drivers.remove(id);
      };
    };
  };

  public query ({ caller }) func getDriver(id : Id) : async Driver {
    // Public read - no authorization required
    switch (drivers.get(id)) {
      case (null) { Runtime.trap("Driver not found") };
      case (?driver) { driver };
    };
  };

  public query ({ caller }) func getDrivers() : async [Driver] {
    // Public read - no authorization required
    drivers.values().toArray().sort();
  };

  public query ({ caller }) func getDriversForBus(busId : Id) : async [Driver] {
    // Public read - no authorization required
    drivers.values().toArray().sort().filter(func(driver) { driver.busId == busId });
  };

  // Student Management
  public shared ({ caller }) func registerStudent(name : Text, rollNumber : Text, department : Text, phone : Text, cityId : Id, busId : Id) : async Id {
    // Public registration - no authorization required
    let student : Student = {
      id = nextStudentId;
      name;
      rollNumber;
      department;
      phone;
      cityId;
      busId;
      registeredAt = Time.now();
    };
    students.add(nextStudentId, student);
    nextStudentId += 1;
    student.id;
  };

  public query ({ caller }) func getStudents() : async [Student] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all students");
    };
    students.values().toArray().sort();
  };

  public query ({ caller }) func getStudentCountPerBus(busId : Id) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view student counts");
    };
    students.values().toArray().filter(func(student) { student.busId == busId }).size();
  };

  public query ({ caller }) func getStudentsForBus(busId : Id) : async [Student] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view students per bus");
    };
    students.values().toArray().sort().filter(func(student) { student.busId == busId });
  };

  // Shuttle Status Management
  public shared ({ caller }) func updateShuttleStatus(busId : Id, status : ShuttleStatus, statusNote : Text, alternateRouteNote : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update shuttle status");
    };

    let statusRecord : ShuttleStatusRecord = {
      busId;
      status;
      statusNote;
      alternateRouteNote;
      updatedAt = Time.now();
    };
    shuttleStatuses.add(busId, statusRecord);
  };

  public query ({ caller }) func getShuttleStatus(busId : Id) : async ?ShuttleStatusRecord {
    // Public read - no authorization required
    shuttleStatuses.get(busId);
  };

  public query ({ caller }) func getAllShuttleStatuses() : async [ShuttleStatusRecord] {
    // Public read - no authorization required
    shuttleStatuses.values().toArray().sort();
  };

  // Notification Management
  public shared ({ caller }) func addNotification(title : Text, message : Text, isImportant : Bool) : async Id {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add notifications");
    };

    let notification : Notification = {
      id = nextNotificationId;
      title;
      message;
      createdAt = Time.now();
      isImportant;
    };
    notifications.add(nextNotificationId, notification);
    nextNotificationId += 1;
    notification.id;
  };

  public shared ({ caller }) func updateNotification(id : Id, title : Text, message : Text, isImportant : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update notifications");
    };

    switch (notifications.get(id)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?existing) {
        let notification : Notification = {
          id;
          title;
          message;
          createdAt = existing.createdAt;
          isImportant;
        };
        notifications.add(id, notification);
      };
    };
  };

  public shared ({ caller }) func deleteNotification(id : Id) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete notifications");
    };

    switch (notifications.get(id)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?_) {
        notifications.remove(id);
      };
    };
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    // Public read - no authorization required
    notifications.values().toArray().sort();
  };

  public query ({ caller }) func getNotification(id : Id) : async Notification {
    // Public read - no authorization required
    switch (notifications.get(id)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notification) { notification };
    };
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Id) : async () {
    // Any authenticated user can mark notifications as read
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    let readSet = switch (userReadNotifications.get(caller)) {
      case (null) { Set.empty<Id>() };
      case (?existing) { existing };
    };

    readSet.add(notificationId);
  };

  public query ({ caller }) func getReadNotifications() : async [Id] {
    // Any authenticated user can view their read notifications
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view read notifications");
    };

    switch (userReadNotifications.get(caller)) {
      case (null) { [] };
      case (?readSet) { readSet.toArray().sort() };
    };
  };

  // Help Center Management
  public shared ({ caller }) func addHelpContact(contactName : Text, role : Text, phone : Text, email : Text) : async Id {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add help contacts");
    };

    let contact : HelpContact = {
      id = nextHelpContactId;
      contactName;
      role;
      phone;
      email;
    };
    helpContacts.add(nextHelpContactId, contact);
    nextHelpContactId += 1;
    contact.id;
  };

  public shared ({ caller }) func updateHelpContact(id : Id, contactName : Text, role : Text, phone : Text, email : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update help contacts");
    };

    switch (helpContacts.get(id)) {
      case (null) { Runtime.trap("Help contact not found") };
      case (?_) {
        let contact : HelpContact = {
          id;
          contactName;
          role;
          phone;
          email;
        };
        helpContacts.add(id, contact);
      };
    };
  };

  public shared ({ caller }) func deleteHelpContact(id : Id) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete help contacts");
    };

    switch (helpContacts.get(id)) {
      case (null) { Runtime.trap("Help contact not found") };
      case (?_) {
        helpContacts.remove(id);
      };
    };
  };

  public query ({ caller }) func getHelpContacts() : async [HelpContact] {
    // Public read - no authorization required
    helpContacts.values().toArray().sort();
  };

  public query ({ caller }) func getHelpContact(id : Id) : async HelpContact {
    // Public read - no authorization required
    switch (helpContacts.get(id)) {
      case (null) { Runtime.trap("Help contact not found") };
      case (?contact) { contact };
    };
  };

  // Admin Utilities
  public shared ({ caller }) func clearAllData() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can clear all data");
    };

    cities.clear();
    buses.clear();
    drivers.clear();
    students.clear();
    shuttleStatuses.clear();
    notifications.clear();
    helpContacts.clear();
    nextCityId := 1;
    nextBusId := 1;
    nextDriverId := 1;
    nextStudentId := 1;
    nextNotificationId := 1;
    nextHelpContactId := 1;
  };

  public shared ({ caller }) func addSampleData() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add sample data");
    };

    _addSampleCities();
    _addSampleBuses();
    _addSampleDrivers();
    _addSampleNotifications();
    _addSampleHelpContacts();
  };

  func _addSampleCities() {
    let cityNames = [
      "Okara",
      "Lahore",
      "Pakpattan",
      "Arif Wala",
      "Haroonabad",
      "Sahiwal",
      "Chichawatni",
      "Burewala",
    ];
    for (name in cityNames.values()) {
      let city : City = {
        id = nextCityId;
        name;
      };
      cities.add(nextCityId, city);
      nextCityId += 1;
    };
  };

  func _addSampleBuses() {
    let busNames = ["Shuttle 1", "Shuttle 2", "Express 1", "Express 2"];
    for (name in busNames.values()) {
      let bus : Bus = {
        id = nextBusId;
        cityId = 1;
        busName = name;
        routeStops = ["Stop 1", "Stop 2", "Stop 3"];
        departureTime = "08:00";
        arrivalTime = "10:00";
        returnDepartureTime = "16:00";
        returnArrivalTime = "18:00";
      };
      buses.add(nextBusId, bus);
      nextBusId += 1;
    };
  };

  func _addSampleDrivers() {
    for (i in Nat.range(1, 5)) {
      let driver : Driver = {
        id = nextDriverId;
        busId = 1;
        driverName = "Driver " # i.toText();
        phone = "1234567890";
      };
      drivers.add(nextDriverId, driver);
      nextDriverId += 1;
    };
  };

  func _addSampleNotifications() {
    for (i in Nat.range(1, 5)) {
      let notification : Notification = {
        id = nextNotificationId;
        title = "Notification " # i.toText();
        message = "This is notification " # i.toText();
        createdAt = Time.now();
        isImportant = i % 2 == 0;
      };
      notifications.add(nextNotificationId, notification);
      nextNotificationId += 1;
    };
  };

  func _addSampleHelpContacts() {
    for (i in Nat.range(1, 4)) {
      let contact : HelpContact = {
        id = nextHelpContactId;
        contactName = "Contact " # i.toText();
        role = "Support";
        phone = "0987654321";
        email = "contact" # i.toText() # "@example.com";
      };
      helpContacts.add(nextHelpContactId, contact);
      nextHelpContactId += 1;
    };
  };

  public shared ({ caller }) func setupSampleData() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can setup sample data");
    };

    await clearAllData();
    await addSampleData();
  };
};
