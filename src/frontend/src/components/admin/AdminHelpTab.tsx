import type { HelpContact } from "@/backend.d";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAddHelpContact,
  useDeleteHelpContact,
  useHelpContacts,
  useUpdateHelpContact,
} from "@/hooks/useQueries";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ContactForm {
  contactName: string;
  role: string;
  phone: string;
  email: string;
}

const emptyForm: ContactForm = {
  contactName: "",
  role: "",
  phone: "",
  email: "",
};

export function AdminHelpTab() {
  const { data: contacts = [] } = useHelpContacts();
  const addContact = useAddHelpContact();
  const updateContact = useUpdateHelpContact();
  const deleteContact = useDeleteHelpContact();

  const [open, setOpen] = useState(false);
  const [editContact, setEditContact] = useState<HelpContact | null>(null);
  const [form, setForm] = useState<ContactForm>(emptyForm);

  const openAdd = () => {
    setEditContact(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (contact: HelpContact) => {
    setEditContact(contact);
    setForm({
      contactName: contact.contactName,
      role: contact.role,
      phone: contact.phone,
      email: contact.email,
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contactName || !form.role || !form.phone) {
      toast.error("Fill required fields");
      return;
    }
    if (editContact) {
      updateContact.mutate(
        { id: editContact.id, ...form },
        {
          onSuccess: () => {
            toast.success("Contact updated");
            setOpen(false);
          },
          onError: () => toast.error("Update failed"),
        },
      );
    } else {
      addContact.mutate(form, {
        onSuccess: () => {
          toast.success("Contact added");
          setOpen(false);
        },
        onError: () => toast.error("Add failed"),
      });
    }
  };

  const handleDelete = (id: bigint, name: string) => {
    if (!confirm(`Delete contact "${name}"?`)) return;
    deleteContact.mutate(id, {
      onSuccess: () => toast.success("Deleted"),
      onError: () => toast.error("Delete failed"),
    });
  };

  const isPending = addContact.isPending || updateContact.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl">Help Center Contacts</h2>
        <Button onClick={openAdd} size="sm" data-ocid="admin.help.add.button">
          <Plus className="h-4 w-4 mr-1" /> Add Contact
        </Button>
      </div>

      <div
        className="bg-card border border-border rounded-2xl overflow-hidden"
        data-ocid="admin.help.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="admin.help.empty_state"
                >
                  No contacts yet.
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact, idx) => (
                <TableRow
                  key={contact.id.toString()}
                  data-ocid={`admin.help.row.${idx + 1}`}
                >
                  <TableCell className="font-medium">
                    {contact.contactName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {contact.role}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {contact.phone}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[180px]">
                    {contact.email || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(contact)}
                        data-ocid={`admin.help.edit_button.${idx + 1}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() =>
                          handleDelete(contact.id, contact.contactName)
                        }
                        data-ocid={`admin.help.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="admin.help.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editContact ? "Edit Contact" : "Add Contact"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Name *</Label>
              <Input
                placeholder="Prof. Dr. Ahmad Khan"
                value={form.contactName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contactName: e.target.value }))
                }
                data-ocid="admin.help.name.input"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Role *</Label>
              <Input
                placeholder="Head of Transport Department"
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
                data-ocid="admin.help.role.input"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Phone *</Label>
              <Input
                placeholder="03XX-XXXXXXX"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                data-ocid="admin.help.phone.input"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input
                type="email"
                placeholder="transport@comsats.edu.pk"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                data-ocid="admin.help.email.input"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
                data-ocid="admin.help.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1"
                data-ocid="admin.help.save_button"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {editContact ? "Update" : "Add"} Contact
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
