import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHelpContacts } from "@/hooks/useQueries";
import { Building2, HelpCircle, Mail, Phone, Shield } from "lucide-react";
import { motion } from "motion/react";

function getRoleColor(role: string) {
  const r = role.toLowerCase();
  if (r.includes("head") || r.includes("director") || r.includes("chief"))
    return "bg-primary text-primary-foreground";
  if (r.includes("emergency") || r.includes("security"))
    return "bg-destructive text-destructive-foreground";
  if (r.includes("assistant") || r.includes("deputy"))
    return "bg-accent text-accent-foreground";
  return "bg-secondary text-secondary-foreground";
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1 as number,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 24 },
  },
};

export function HelpPage() {
  const { data: contacts = [], isLoading } = useHelpContacts();

  const headContact = contacts.find(
    (c) =>
      c.role.toLowerCase().includes("head") ||
      c.role.toLowerCase().includes("director") ||
      c.role.toLowerCase().includes("chief"),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Help Center
        </h1>
        <p className="text-muted-foreground">
          Contact the COMSATS Sahiwal transport department for assistance.
        </p>
      </motion.div>

      {/* Emergency / Head Contact highlight */}
      {headContact && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div className="bg-primary rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10">
              <Shield className="h-32 w-32" />
            </div>
            <div className="relative">
              <Badge className="bg-white/20 text-white border-white/30 mb-3">
                Head of Transport
              </Badge>
              <h2 className="text-2xl font-display font-bold mb-1">
                {headContact.contactName}
              </h2>
              <p className="text-primary-foreground/80 mb-4">
                {headContact.role}
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={`tel:${headContact.phone}`}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors rounded-xl px-4 py-2 text-sm font-medium"
                  data-ocid="help.head.phone.button"
                >
                  <Phone className="h-4 w-4" />
                  {headContact.phone}
                </a>
                {headContact.email && (
                  <a
                    href={`mailto:${headContact.email}`}
                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors rounded-xl px-4 py-2 text-sm font-medium"
                    data-ocid="help.head.email.button"
                  >
                    <Mail className="h-4 w-4" />
                    {headContact.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* University Info */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 flex items-start gap-4">
        <div className="bg-primary/10 rounded-xl p-3 shrink-0">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground mb-1">
            COMSATS University Islamabad — Sahiwal Campus
          </h3>
          <p className="text-muted-foreground text-sm">
            University Road, Sahiwal, Punjab, Pakistan
          </p>
          <p className="text-muted-foreground text-sm">
            Transport Office: Monday–Friday, 7:00 AM – 4:00 PM
          </p>
        </div>
      </div>

      {/* All Contacts */}
      <h2 className="text-xl font-display font-bold text-foreground mb-4">
        All Contacts
      </h2>
      {isLoading ? (
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="help.loading_state"
        >
          {["a", "b", "c", "d", "e", "f"].map((k) => (
            <Skeleton key={k} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12" data-ocid="help.empty_state">
          <HelpCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">No contacts available yet.</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="help.contacts.list"
        >
          {contacts.map((contact, idx) => (
            <motion.div key={contact.id.toString()} variants={item}>
              <Card
                className="h-full hover:shadow-md transition-shadow"
                data-ocid={`help.contact.card.${idx + 1}`}
              >
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-primary/10 rounded-xl p-2.5 shrink-0">
                      <HelpCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-foreground leading-tight">
                        {contact.contactName}
                      </h3>
                      <Badge
                        className={`mt-1 text-xs ${getRoleColor(contact.role)}`}
                      >
                        {contact.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                      data-ocid={`help.contact.phone.button.${idx + 1}`}
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {contact.phone}
                    </a>
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors truncate"
                        data-ocid={`help.contact.email.button.${idx + 1}`}
                      >
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {contact.email}
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
