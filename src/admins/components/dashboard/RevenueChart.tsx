"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
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
import { Button } from "@/components/ui/button"
import { DollarSign } from "lucide-react"
import { RevenueDataPoint, RevenuePeriod } from "../../interfaces/AdminDashboard"

const chartConfig = {
  revenue: {
    label: "Ingresos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface RevenueChartProps {
  data: {
    monthly: RevenueDataPoint[]
    yearly: RevenueDataPoint[]
  }
  totalRevenue: number
}

export function RevenueChart({ data, totalRevenue }: RevenueChartProps) {
  const t = useTranslations("Admins.dashboard.revenue")
  const [period, setPeriod] = useState<RevenuePeriod>("monthly")

  chartConfig.revenue.label = t("label")

  const periods: { key: RevenuePeriod; label: string }[] = [
    { key: "monthly", label: t("monthly") },
    { key: "yearly", label: t("yearly") },
  ]

  const chartData = data[period]

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <DollarSign className="size-4 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-base">{t("title")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("total", { amount: formatCurrency(totalRevenue) })}
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
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
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
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <Bar
              dataKey="revenue"
              fill="url(#fillRevenue)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
