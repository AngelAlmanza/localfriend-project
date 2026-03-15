"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ViewsDataPoint, ViewsPeriod } from "../../interfaces/Dashboard"
import { Eye } from "lucide-react"

const chartConfig = {
  products: {
    label: "Productos",
    color: "var(--chart-1)",
  },
  services: {
    label: "Servicios",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

interface ViewsChartProps {
  data: {
    daily: ViewsDataPoint[]
    weekly: ViewsDataPoint[]
    monthly: ViewsDataPoint[]
  }
  totalViews: number
}

export function ViewsChart({ data, totalViews }: ViewsChartProps) {
  const t = useTranslations("Workers.dashboard.views")
  const [period, setPeriod] = useState<ViewsPeriod>("daily")

  const periods: { key: ViewsPeriod; label: string }[] = [
    { key: "daily", label: t("daily") },
    { key: "weekly", label: t("weekly") },
    { key: "monthly", label: t("monthly") },
  ]

  // Update chart config labels with translations
  chartConfig.products.label = t("products")
  chartConfig.services.label = t("services")

  const chartData = data[period]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Eye className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{t("title")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("total", { count: totalViews })}
            </p>
          </div>
        </div>
        <div className="flex gap-1 rounded-lg border p-0.5">
          {periods.map(({ key, label }) => (
            <Button
              key={key}
              variant={period === key ? "default" : "ghost"}
              size="xs"
              onClick={() => setPeriod(key)}
              className="text-xs"
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="fillProducts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-products)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-products)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillServices" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-services)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-services)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              fontSize={12}
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="products"
              type="monotone"
              fill="url(#fillProducts)"
              stroke="var(--color-products)"
              strokeWidth={2}
            />
            <Area
              dataKey="services"
              type="monotone"
              fill="url(#fillServices)"
              stroke="var(--color-services)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
