"use client"

import { CardDescription } from "@/components/ui/card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wifi } from "lucide-react"
import { DeviceTable } from "./device-table"

interface BeaconDevice {
  macAddress: string
  timestamp: string
}

interface TimestampGroup {
  timestamp: string
  devices: BeaconDevice[]
}

interface IBeaconDashboardProps {
  groups: TimestampGroup[]
  isLoading: boolean
}

export function IBeaconDashboard({ groups, isLoading }: IBeaconDashboardProps) {
  const totalDevices = groups.reduce((sum, group) => sum + group.devices.length, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Wifi className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">iBeacon Monitor</h1>
              <p className="text-sm text-muted-foreground">Real-time device tracking and monitoring</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Devices Table */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>iBeacon Devices</CardTitle>
            <CardDescription>Total devices detected: {totalDevices}</CardDescription>
          </CardHeader>
          <CardContent>
            <DeviceTable groups={groups} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
