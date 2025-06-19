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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSessionDetails, rescheduleSession } from "@/lib/actions/sessions-test";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, FileText } from "lucide-react";
import { format, addDays, startOfHour } from "date-fns";

type EditSessionDialogProps = {
  session: {
    id: string;
    scheduled_at: string;
    duration_minutes: number;
    notes?: string;
    location?: string;
  };
  onClose: () => void;
};

export default function EditSessionDialog({
  session,
  onClose,
}: EditSessionDialogProps) {
  const [newScheduledAt, setNewScheduledAt] = useState<string>(session.scheduled_at);
  const [durationMinutes, setDurationMinutes] = useState<number>(session.duration_minutes);
  const [notes, setNotes] = useState<string>(session.notes || "");
  const [location, setLocation] = useState<string>(session.location || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Generate time slots for the next 14 days
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();

    for (let day = 0; day < 14; day++) {
      const date = addDays(now, day);

      // Generate slots from 9 AM to 6 PM
      for (let hour = 9; hour <= 18; hour++) {
        const slot = startOfHour(new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour));
        
        // Only include future slots
        if (slot > now) {
          slots.push(slot);
        }
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();  const handleSubmit = async () => {
    startTransition(async () => {
      try {        // Debug: Check if functions exist
        console.log("updateSessionDetails:", typeof updateSessionDetails);
        console.log("rescheduleSession:", typeof rescheduleSession);
        
        // TEMPORARILY COMMENT OUT THE ACTUAL CALLS FOR TESTING
        console.log("About to call updateSessionDetails...");
        
        // Update session details first
        const detailsUpdate = await updateSessionDetails(session.id, {
          duration_minutes: durationMinutes,
          notes: notes.trim() || undefined,
          location: location.trim() || undefined,
        });        console.log("updateSessionDetails result:", detailsUpdate);

        if ("errors" in detailsUpdate) {
          toast.error("Failed to update session details");
          return;
        }

        // If time was changed, reschedule
        if (newScheduledAt !== session.scheduled_at) {
          console.log("About to call rescheduleSession...");
          const rescheduleResult = await rescheduleSession(session.id, newScheduledAt);
          console.log("rescheduleSession result:", rescheduleResult);
            if ("errors" in rescheduleResult) {
            toast.error("Failed to reschedule session");
            return;
          }
        }

        toast.success("Session updated successfully");
        router.refresh();
        onClose();
      } catch (error) {
        console.error("Error updating session:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
          <DialogDescription>
            Update the details of your session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Details */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Session Details</Label>
            <div className="p-3 bg-slate-50 rounded-md text-sm space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(session.scheduled_at), "EEE, MMM d 'at' h:mm a")}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {session.duration_minutes} minutes
              </div>
              {session.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {session.location}
                </div>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label htmlFor="newTime" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </Label>
            <Select value={newScheduledAt} onValueChange={setNewScheduledAt}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
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

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration (minutes)
            </Label>
            <Select 
              value={durationMinutes.toString()} 
              onValueChange={(value) => setDurationMinutes(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location (optional)
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Online (Zoom), Coffee shop, Library..."
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details about the session..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Updating..." : "Update Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
