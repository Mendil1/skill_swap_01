"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, User } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from "date-fns";

type SessionsCalendarProps = {
  sessions: Array<{
    id: string;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    requester: { full_name: string; profile_image_url?: string | null };
    participant: { full_name: string; profile_image_url?: string | null };
  }>;
  groupSessions: Array<{
    id: string;
    topic: string;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    creator: { full_name: string; profile_image_url?: string | null };
    group_session_participants?: Array<{
      participant: { full_name: string; profile_image_url?: string | null };
    }>;
  }>;
};

export default function SessionsCalendar({ sessions, groupSessions }: SessionsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const allSessions = [
    ...sessions.map(s => ({ ...s, type: "one-on-one" as const })),
    ...groupSessions.map(s => ({ ...s, type: "group" as const }))
  ];

  const getSessionsForDate = (date: Date) => {
    return allSessions.filter(session =>
      isSameDay(parseISO(session.scheduled_at), date)
    );
  };

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let currentDay = startDate;

    while (currentDay <= endDate) {
      days.push(currentDay);
      currentDay = addDays(currentDay, 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const selectedDateSessions = selectedDate ? getSessionsForDate(selectedDate) : [];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev =>
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
    setSelectedDate(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-slate-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const daySessionsCount = getSessionsForDate(day).length;
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isDayToday = isToday(day);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative p-2 h-12 text-sm rounded-md transition-colors
                    ${isCurrentMonth ? 'text-slate-900' : 'text-slate-400'}
                    ${isSelected ? 'bg-indigo-100 text-indigo-900' : 'hover:bg-slate-100'}
                    ${isDayToday ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                  `}
                >
                  {format(day, 'd')}
                  {daySessionsCount > 0 && (
                    <div className={`
                      absolute bottom-1 right-1 w-2 h-2 rounded-full
                      ${isDayToday ? 'bg-white' : 'bg-indigo-600'}
                    `}>
                      {daySessionsCount > 1 && (
                        <span className="sr-only">{daySessionsCount} sessions</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedDate
              ? format(selectedDate, "EEEE, MMMM d")
              : "Select a date"
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            selectedDateSessions.length > 0 ? (
              <div className="space-y-3">
                {selectedDateSessions.map((session) => {
                  const sessionTime = parseISO(session.scheduled_at);
                  const isGroupSession = session.type === "group";

                  return (
                    <div
                      key={session.id}
                      className="p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isGroupSession ? (
                            <Users className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <User className="h-4 w-4 text-green-600" />
                          )}
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              isGroupSession
                                ? 'border-indigo-200 text-indigo-700'
                                : 'border-green-200 text-green-700'
                            }`}
                          >
                            {isGroupSession ? "Group" : "1-on-1"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          {format(sessionTime, "h:mm a")}
                        </div>
                      </div>

                      <h4 className="font-medium text-sm mb-1">
                        {isGroupSession ? session.topic : "Skill Exchange Session"}
                      </h4>

                      <p className="text-xs text-slate-600">
                        {isGroupSession
                          ? `Organized by ${session.creator.full_name}`
                          : `With ${session.participant?.full_name || session.requester.full_name}`
                        }
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {session.duration_minutes} minutes
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">No sessions scheduled</p>
                <p className="text-xs text-slate-500">
                  This day is free for new sessions
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">
                Click on a date to see scheduled sessions
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
