"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, CalendarIcon, Edit, Trash2 } from "lucide-react"
import { format, addDays } from "date-fns"

export function NewsletterScheduler() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("")

  // Mock scheduled newsletters
  const scheduledNewsletters = [
    {
      id: 1,
      title: "Weekly Update #46",
      scheduledFor: addDays(new Date(), 2),
      status: "scheduled",
      recipients: 1234,
    },
    {
      id: 2,
      title: "Event Reminder",
      scheduledFor: addDays(new Date(), 5),
      status: "scheduled",
      recipients: 856,
    },
    {
      id: 3,
      title: "Monthly Newsletter",
      scheduledFor: addDays(new Date(), 7),
      status: "scheduled",
      recipients: 2890,
    },
  ]

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Newsletter</CardTitle>
            <CardDescription>Choose when to send your newsletter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Date</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => date < new Date()}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" disabled={!selectedDate || !selectedTime}>
              <Clock className="h-4 w-4 mr-2" />
              Schedule Newsletter
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Schedule</CardTitle>
            <CardDescription>Common scheduling options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Tomorrow at 9:00 AM
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Next Monday at 10:00 AM
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Next Friday at 2:00 PM
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Custom Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Newsletters</CardTitle>
          <CardDescription>Manage your scheduled newsletter campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Newsletter</TableHead>
                <TableHead>Scheduled For</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledNewsletters.map((newsletter) => (
                <TableRow key={newsletter.id}>
                  <TableCell className="font-medium">{newsletter.title}</TableCell>
                  <TableCell>{format(newsletter.scheduledFor, "PPP 'at' p")}</TableCell>
                  <TableCell>{newsletter.recipients.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{newsletter.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
