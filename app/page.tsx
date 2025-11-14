"use client"

import { useEffect, useRef, useState } from "react"
import { IBeaconDashboard } from "@/components/ibeacon-dashboard"
import mqtt from "mqtt";

interface BeaconDevice {
  macAddress: string
  timestamp: string
}

interface TimestampGroup {
  timestamp: string
  devices: BeaconDevice[]
}

export default function Home() {
  const [groups, setGroups] = useState<TimestampGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const clientRef = useRef<any>(null)

  // helper: extract MACs from incoming payload (robust)
  const extractMacs = (payloadStr: string): string[] => {
    try {
      const parsed = JSON.parse(payloadStr)
      if (parsed && typeof parsed === "object") {
        const vals = Object.values(parsed).map((v) => String(v).trim())
        return Array.from(new Set(vals.filter(Boolean)))
      }
    } catch {
      // fall through to regex
    }

    const macRegex1 = /(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}/g
    const found1 = payloadStr.match(macRegex1) || []
    if (found1.length) {
      return Array.from(new Set(found1.map((m) => m.replace(/-/g, ":").toUpperCase())))
    }

    const macRegex2 = /\b[0-9A-Fa-f]{12}\b/g
    const found2 = payloadStr.match(macRegex2) || []
    if (found2.length) {
      return Array.from(
        new Set(
          found2.map((m) =>
            m
              .match(/.{1,2}/g)!
              .join(":")
              .toUpperCase()
          )
        )
      )
    }

    return []
  }

  // mask to only show last two octets, normalized to colon-separated upper-case
  const maskMacLastTwo = (mac: string) => {
    if (!mac) return mac
    const normalized = mac.replace(/-/g, ":").toUpperCase()
    if (normalized.includes(":")) {
      const parts = normalized.split(":")
      const lastTwo = parts.slice(-2)
      return lastTwo.join(":")
    }
    // handle 12-hex format like 041E7A120002
    const flat = normalized.replace(/[^0-9A-F]/g, "")
    if (flat.length === 12) {
      const pairs = flat.match(/.{1,2}/g) || []
      return pairs.slice(-2).join(":")
    }
    // fallback: return as-is
    return normalized
  }

  useEffect(() => {
    let mounted = true

    const setupMqtt = async () => {
      const brokerUrl = "ws://broker.emqx.io:8083/mqtt"
      const topic = "dspworks/tracker/ibeaconDSP578232951"

      const client = mqtt.connect(brokerUrl, {
        clientId: `web-${Math.random().toString(16).slice(2, 8)}`,
        keepalive: 30,
        reconnectPeriod: 2000,
        clean: true,
      })

      clientRef.current = client

      client.on("connect", () => {
        console.log("[MQTT] connected", brokerUrl)
        client.subscribe(topic, (err: any) => {
          if (err) console.error("[MQTT] subscribe error", err)
          else console.log("[MQTT] subscribed to", topic)
        })
      })

      client.on("message", (_topic: string, message: Uint8Array) => {
        try {
          if (!mounted) return
          const raw = message.toString()
          const macs = extractMacs(raw)
          const now = new Date().toISOString()

          // only keep latest payload (no history) and mask MACs to last two octets
          const devices: BeaconDevice[] = macs.map((mac) => ({
            macAddress: maskMacLastTwo(mac),
            timestamp: now,
          }))

          setGroups([{ timestamp: now, devices }]) // replace previous groups with latest only
          setIsLoading(false)
        } catch (e) {
          console.error("[MQTT] message parse error", e)
        }
      })

      client.on("error", (err: any) => console.error("[MQTT] error", err))
      client.on("reconnect", () => console.log("[MQTT] reconnecting"))
      client.on("offline", () => console.log("[MQTT] offline"))
    }

    setupMqtt()

    return () => {
      mounted = false
      try {
        if (clientRef.current) {
          clientRef.current.end(true, () => {
            console.log("[MQTT] disconnected (cleanup)")
          })
        }
      } finally {
        clientRef.current = null
      }
    }
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <IBeaconDashboard groups={groups} isLoading={isLoading} />
    </main>
  )
}