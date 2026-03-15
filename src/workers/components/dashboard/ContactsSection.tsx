"use client"

import { useTranslations } from "next-intl"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TopContactListing, ChannelDistribution } from "../../interfaces/Dashboard"
import { MousePointerClick, Phone, Mail, MessageSquare, Package, Wrench } from "lucide-react"

const channelIcons: Record<string, typeof Phone> = {
  phone: Phone,
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageSquare,
}

const channelColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-5)",
]

interface ContactsSectionProps {
  topListings: TopContactListing[]
  channels: ChannelDistribution[]
  totalContacts: number
}

export function ContactsSection({ topListings, channels, totalContacts }: ContactsSectionProps) {
  const t = useTranslations("Workers.dashboard.contacts")

  const chartConfig: ChartConfig = {}
  channels.forEach((ch, i) => {
    chartConfig[ch.channel] = {
      label: t(`channels.${ch.channel}`),
      color: channelColors[i % channelColors.length],
    }
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
          <MousePointerClick className="size-4 text-amber-600" />
        </div>
        <div>
          <CardTitle className="text-base">{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("total", { count: totalContacts })}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top listings by contact clicks */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-muted-foreground">{t("topListings")}</h4>
            {topListings.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
              <div className="space-y-2.5">
                {topListings.map((listing, index) => {
                  const TypeIcon = listing.type === "product" ? Package : Wrench
                  return (
                    <div key={listing.id} className="flex items-center gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded text-xs font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                      <TypeIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-sm">{listing.name}</span>
                      <Badge variant="secondary" className="text-xs tabular-nums">
                        {listing.clicks}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Channel distribution */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-muted-foreground">{t("channelDistribution")}</h4>
            {channels.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
              <div className="space-y-4">
                <ChartContainer config={chartConfig} className="h-[140px] w-full">
                  <BarChart
                    data={channels}
                    layout="vertical"
                    margin={{ top: 0, right: 4, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                    <YAxis
                      dataKey="channel"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={80}
                      tickFormatter={(value) => t(`channels.${value}`)}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          nameKey="channel"
                          labelFormatter={(value) => t(`channels.${value}`)}
                        />
                      }
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                      {channels.map((entry, index) => (
                        <Cell key={entry.channel} fill={channelColors[index % channelColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>

                <div className="flex flex-wrap gap-2">
                  {channels.map((ch, index) => {
                    const ChannelIcon = channelIcons[ch.channel] ?? MessageSquare
                    return (
                      <div
                        key={ch.channel}
                        className="flex items-center gap-1.5 rounded-md border px-2 py-1"
                      >
                        <ChannelIcon className="size-3" style={{ color: channelColors[index % channelColors.length] }} />
                        <span className="text-xs text-muted-foreground">{t(`channels.${ch.channel}`)}</span>
                        <span className="text-xs font-medium tabular-nums">{ch.count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
