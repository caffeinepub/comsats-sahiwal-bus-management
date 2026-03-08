import { Button } from "@/components/ui/button";
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
  useBusesForCity,
  useCities,
  useRegisterStudent,
} from "@/hooks/useQueries";
import { Bus, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const DEPARTMENTS = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Management Sciences",
  "Mathematics",
  "Physics",
  "English",
  "Chemistry",
  "Bioinformatics",
  "Environmental Sciences",
];

interface FormState {
  name: string;
  rollNumber: string;
  department: string;
  phone: string;
  cityId: string;
  busId: string;
}

const initial: FormState = {
  name: "",
  rollNumber: "",
  department: "",
  phone: "",
  cityId: "",
  busId: "",
};

export function RegisterPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [success, setSuccess] = useState<{
    id: bigint;
    busName: string;
  } | null>(null);

  const { data: cities = [] } = useCities();
  const { data: buses = [] } = useBusesForCity(
    form.cityId ? BigInt(form.cityId) : null,
  );
  const register = useRegisterStudent();

  const selectedBus = buses.find((b) => b.id.toString() === form.busId);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "cityId") next.busId = "";
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.rollNumber ||
      !form.department ||
      !form.phone ||
      !form.cityId ||
      !form.busId
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    register.mutate(
      {
        name: form.name,
        rollNumber: form.rollNumber,
        department: form.department,
        phone: form.phone,
        cityId: BigInt(form.cityId),
        busId: BigInt(form.busId),
      },
      {
        onSuccess: (id) => {
          setSuccess({ id, busName: selectedBus?.busName || "" });
          setForm(initial);
        },
        onError: () => {
          toast.error("Registration failed. Please try again.");
        },
      },
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 rounded-xl p-3">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Bus Registration
          </h1>
        </div>
        <p className="text-muted-foreground">
          Register yourself for a university bus service at COMSATS Sahiwal
          Campus.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
            data-ocid="register.success_state"
          >
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-green-800 mb-2">
              Registration Successful!
            </h2>
            <p className="text-green-700 mb-4">
              You have been registered for <strong>{success.busName}</strong>.
              <br />
              Your registration ID is{" "}
              <strong className="font-mono">#{success.id.toString()}</strong>.
            </p>
            <Button
              onClick={() => setSuccess(null)}
              className="bg-primary text-primary-foreground"
              data-ocid="register.new.button"
            >
              Register Another Student
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5"
            data-ocid="register.form"
          >
            {/* Name */}
            <div>
              <Label htmlFor="name" className="font-medium mb-1.5 block">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="Muhammad Ahmad"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                required
                data-ocid="student.name.input"
              />
            </div>

            {/* Roll Number */}
            <div>
              <Label htmlFor="roll" className="font-medium mb-1.5 block">
                Roll Number
              </Label>
              <Input
                id="roll"
                placeholder="FA21-BCE-123"
                value={form.rollNumber}
                onChange={(e) => setField("rollNumber", e.target.value)}
                required
                data-ocid="student.roll.input"
              />
            </div>

            {/* Department */}
            <div>
              <Label className="font-medium mb-1.5 block">Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setField("department", v)}
              >
                <SelectTrigger data-ocid="student.department.select">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="font-medium mb-1.5 block">
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="03XX-XXXXXXX"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                required
                data-ocid="student.phone.input"
              />
            </div>

            {/* City */}
            <div>
              <Label className="font-medium mb-1.5 block">Select City</Label>
              <Select
                value={form.cityId}
                onValueChange={(v) => setField("cityId", v)}
              >
                <SelectTrigger data-ocid="student.city.select">
                  <SelectValue placeholder="Choose your city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem
                      key={city.id.toString()}
                      value={city.id.toString()}
                    >
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bus */}
            <div>
              <Label className="font-medium mb-1.5 block">Select Bus</Label>
              <Select
                value={form.busId}
                onValueChange={(v) => setField("busId", v)}
                disabled={!form.cityId || buses.length === 0}
              >
                <SelectTrigger data-ocid="student.bus.select">
                  <SelectValue
                    placeholder={
                      !form.cityId
                        ? "Select a city first"
                        : buses.length === 0
                          ? "No buses for this city"
                          : "Choose your bus"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {buses.map((bus) => (
                    <SelectItem
                      key={bus.id.toString()}
                      value={bus.id.toString()}
                    >
                      <span className="flex items-center gap-2">
                        <Bus className="h-3.5 w-3.5" />
                        {bus.busName} — Departs {bus.departureTime}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bus preview */}
            {selectedBus && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-sm font-medium text-foreground mb-1">
                  Selected Bus: <strong>{selectedBus.busName}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Departs {selectedBus.departureTime} · Arrives{" "}
                  {selectedBus.arrivalTime}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Route: {selectedBus.routeStops.join(" → ")}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={register.isPending}
              className="w-full bg-primary text-primary-foreground h-12 text-base font-display"
              data-ocid="student.register.submit_button"
            >
              {register.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register for Bus Service"
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
