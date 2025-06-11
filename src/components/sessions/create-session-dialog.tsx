"use client";

import { useState, useTransition } from "react";
import { createOneOnOneSessionAction, createGroupSessionAction } from "@/lib/actions/create-session-actions";
import { getUserConnectionsServer } from "@/lib/actions/get-user-connections";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, User } from "lucide-react";
import { format, addDays, startOfHour } from "date-fns";
import { useEffect } from "react";
import { Connection } from "@/types/sessions";

type CreateSessionDialogProps = {
  children: React.ReactNode;
};

export default function CreateSessionDialog({ children }: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>("");
  const [sessionType, setSessionType] = useState<"one-on-one" | "group">("one-on-one");
  const router = useRouter();

  // Generate time slots for the next 7 days
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();

    for (let day = 0; day < 7; day++) {
      const date = addDays(now, day);

      // Generate slots from 9 AM to 6 PM
      for (let hour = 9; hour <= 18; hour++) {
        const slotTime = startOfHour(new Date(date.setHours(hour, 0, 0, 0)));

        // Skip past times for today
        if (slotTime > now) {
          slots.push(slotTime);
        }
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();
  const durationOptions = [
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
  ];

  useEffect(() => {
    if (open) {
      console.log("🔍 Dialog opened, loading connections...");
      // Load connections when dialog opens using server action
      getUserConnectionsServer()
        .then((connections: Connection[]) => {
          console.log("🔍 getUserConnectionsServer resolved with:", connections);
          console.log("🔍 Number of connections:", connections?.length || 0);
          if (connections && connections.length > 0) {
            console.log("🔍 Connection details:", connections.map(c => ({ id: c.user_id, name: c.full_name })));
          }
          setConnections(connections || []);
        })
        .catch((error) => {
          console.error("❌ Error loading connections:", error);
          setConnections([]);
        });
    } else {
      console.log("🔍 Dialog closed, clearing connections");
      setConnections([]);
    }
  }, [open]);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      let result;

      if (sessionType === "one-on-one") {
        result = await createOneOnOneSessionAction(formData);
      } else {
        result = await createGroupSessionAction(formData);
      }

      if ("success" in result) {
        toast.success("Session scheduled successfully!");
        setOpen(false);
        router.refresh();
      } else {
        if (result.errors && "general" in result.errors && result.errors.general) {
          toast.error(result.errors.general[0]);
        } else {
          toast.error("Failed to schedule session. Please check your inputs.");
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Schedule a Session</DialogTitle>
          <DialogDescription>
            Create a new skill exchange session with your connections or as a group session.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={sessionType} onValueChange={(value) => setSessionType(value as "one-on-one" | "group")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="one-on-one" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              One-on-One
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Group Session
            </TabsTrigger>
          </TabsList>

          <TabsContent value="one-on-one" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  One-on-One Session
                </CardTitle>
                <CardDescription>
                  Schedule a private skill exchange session with one of your connections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleSubmit} className="space-y-4">
                  <input type="hidden" name="sessionType" value="one-on-one" />

                  <div className="space-y-2">
                    <Label htmlFor="participant">Select Participant</Label>
                    {connections.length > 0 ? (
                      <Select name="participantId" value={selectedConnection} onValueChange={setSelectedConnection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose someone to meet with" />
                        </SelectTrigger>
                        <SelectContent>
                          {connections.map((connection) => (
                            <SelectItem key={connection.user_id} value={connection.user_id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={connection.profile_image_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {connection.full_name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{connection.full_name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm text-slate-500 p-3 border rounded-md">
                        No connections found. Start a conversation with someone first to schedule a session.
                        {/* Debug info */}
                        <div className="text-xs mt-2 text-slate-400">
                          Debug: connections.length = {connections.length}, connections = {JSON.stringify(connections)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt">Date & Time</Label>
                      <Select name="scheduledAt">
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

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select name="durationMinutes" defaultValue="60">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isPending || !selectedConnection}
                  >
                    {isPending ? "Scheduling..." : "Schedule Session"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Group Session
                </CardTitle>
                <CardDescription>
                  Create a group session that others can join to learn or share skills together.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleSubmit} className="space-y-4">
                  <input type="hidden" name="sessionType" value="group" />

                  <div className="space-y-2">
                    <Label htmlFor="topic">Session Topic</Label>
                    <Input
                      name="topic"
                      placeholder="e.g., Introduction to React Hooks, Photography Basics"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt">Date & Time</Label>
                      <Select name="scheduledAt">
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

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select name="durationMinutes" defaultValue="90">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isPending}
                  >
                    {isPending ? "Creating..." : "Create Group Session"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
