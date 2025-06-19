"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rescheduleSession } from "@/lib/actions/sessions-test";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { format, addDays, startOfHour } from "date-fns";

type RescheduleDialogProps = {
  sessionId: string;
  currentScheduledAt: string;
  onClose: () => void;
};

export default function RescheduleDialog({
  sessionId,
  currentScheduledAt,
  onClose,
}: RescheduleDialogProps) {
  const [newScheduledAt, setNewScheduledAt] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Generate time slots for the next 14 days (more options for rescheduling)
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();

    for (let day = 0; day < 14; day++) {
      const date = addDays(now, day);

      // Generate slots from 9 AM to 6 PM
      for (let hour = 9; hour <= 18; hour++) {
        const slotTime = startOfHour(new Date(date.setHours(hour, 0, 0, 0)));

        // Skip past times for today and the current scheduled time
        if (slotTime > now && slotTime.toISOString() !== currentScheduledAt) {
          slots.push(slotTime);
        }
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSubmit = async () => {
    if (!newScheduledAt) {
      toast.error("Please select a new time for the session");
      return;
    }
    startTransition(async () => {
      const result = await rescheduleSession(sessionId, newScheduledAt);
      if (result.success) {
        toast.success("Session rescheduled successfully");
        onClose();
        router.refresh();
      } else {
        toast.error(result.message || "Failed to reschedule session");
      }
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Session</DialogTitle>
          <DialogDescription>Choose a new date and time for your session.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Time</Label>
            <div className="rounded-md bg-slate-50 p-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(currentScheduledAt), "EEE, MMM d 'at' h:mm a")}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newTime">New Time</Label>
            <Select value={newScheduledAt} onValueChange={setNewScheduledAt}>
              <SelectTrigger>
                <SelectValue placeholder="Select new time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot, index) => (
                  <SelectItem key={index} value={slot.toISOString()}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(slot, "EEE, MMM d")} at {format(slot, "h:mm a")}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !newScheduledAt}>
            {isPending ? "Rescheduling..." : "Reschedule Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
