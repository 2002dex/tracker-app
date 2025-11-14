"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Wifi } from "lucide-react"

interface BeaconDevice {
  macAddress: string
  timestamp: string
}

interface TimestampGroup {
  timestamp: string
  devices: BeaconDevice[]
}

interface DeviceTableProps {
  groups: TimestampGroup[]
  isLoading: boolean
}

export function DeviceTable({ groups, isLoading }: DeviceTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-40" />
          </div>
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="py-12 text-center">
        <Wifi className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No iBeacon devices found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.timestamp} className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Timestamp</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">MAC Addresses</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-4">
                  <span className="text-sm text-foreground">{new Date(group.timestamp).toLocaleString()}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {group.devices.map((device, index) => (
                      <code key={index} className="rounded bg-muted px-2 py-1 font-mono text-sm text-foreground">
                        {device.macAddress}
                      </code>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
