"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { parse } from "csv-parse/sync"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SalesData {
  report_month: string
  team: string
  rep: string
  attribution_group: string
  Sets: number
  Holds: number
  QOs: number
  Closes: number
  Closed_RENR: number
  Installs: number
  Installed_RENR: number
  Lost: number
  Lost_RENR: number
  set_hold_days: number
  hold_qo_days: number
  qo_close_days: number
  close_install_days: number
}

export default function SalesDashboardPage() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [filteredData, setFilteredData] = useState<SalesData[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    async function loadData() {
      const response = await fetch("/peek-funnel.csv")
      const csvData = await response.text()
      const parsed = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
      })
      setSalesData(parsed)
      setFilteredData(parsed)
    }
    loadData()
  }, [])

  useEffect(() => {
    const team = searchParams.get("team")
    const attribution = searchParams.get("attribution")

    let filtered = [...salesData]
    if (team && team !== "all") {
      filtered = filtered.filter((row) => row.team === team)
    }
    if (attribution && attribution !== "all") {
      filtered = filtered.filter((row) => row.attribution_group === attribution)
    }
    setFilteredData(filtered)
  }, [salesData, searchParams])

  const teams = Array.from(new Set(salesData.map((item) => item.team)))
  const attributionGroups = Array.from(
    new Set(salesData.map((item) => item.attribution_group))
  )

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  // Prepare data for charts
  const monthlyData = filteredData.reduce(
    (acc, curr) => {
      const month = curr.report_month
      if (!acc[month]) {
        acc[month] = {
          month,
          revenue: 0,
          deals: 0,
        }
      }
      acc[month].revenue += curr.Closed_RENR
      acc[month].deals += curr.Closes
      return acc
    },
    {} as Record<string, any>
  )

  const repData = filteredData.reduce(
    (acc, curr) => {
      const rep = curr.rep
      if (!acc[rep]) {
        acc[rep] = {
          rep,
          revenue: 0,
          deals: 0,
          installs: 0,
        }
      }
      acc[rep].revenue += curr.Closed_RENR
      acc[rep].deals += curr.Closes
      acc[rep].installs += curr.Installs
      return acc
    },
    {} as Record<string, any>
  )

  const teamData = filteredData.reduce(
    (acc, curr) => {
      const team = curr.team
      if (!acc[team]) {
        acc[team] = {
          team,
          revenue: 0,
          deals: 0,
          installs: 0,
        }
      }
      acc[team].revenue += curr.Closed_RENR
      acc[team].deals += curr.Closes
      acc[team].installs += curr.Installs
      return acc
    },
    {} as Record<string, any>
  )

  const lossesData = filteredData.reduce(
    (acc, curr) => {
      const rep = curr.rep
      if (!acc[rep]) {
        acc[rep] = {
          rep,
          lost_deals: 0,
          lost_revenue: 0,
        }
      }
      acc[rep].lost_deals += curr.Lost
      acc[rep].lost_revenue += curr.Lost_RENR
      return acc
    },
    {} as Record<string, any>
  )

  const sortedLosses = Object.values(lossesData)
    .sort((a: any, b: any) => b.lost_revenue - a.lost_revenue)
    .slice(0, 10)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Performance Dashboard</h1>
        <div className="flex gap-4">
          <Select
            defaultValue={searchParams.get("team") || "all"}
            onValueChange={(value) =>
              window.history.pushState(
                null,
                "",
                `?${createQueryString("team", value)}`
              )
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            defaultValue={searchParams.get("attribution") || "all"}
            onValueChange={(value) =>
              window.history.pushState(
                null,
                "",
                `?${createQueryString("attribution", value)}`
              )
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Attribution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {attributionGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(
                filteredData.reduce((sum, row) => sum + row.Closed_RENR, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.reduce((sum, row) => sum + row.Closes, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Install Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (filteredData.reduce((sum, row) => sum + row.Installs, 0) /
                  filteredData.reduce((sum, row) => sum + row.Closes, 0)) *
                  100
              )}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(
                filteredData.reduce((sum, row) => sum + row.Closed_RENR, 0) /
                  filteredData.reduce((sum, row) => sum + row.Closes, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={Object.values(monthlyData)}>
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="hsl(var(--chart-1))"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="deals"
                  name="Deals"
                  stroke="hsl(var(--chart-2))"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Representative</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={Object.values(repData)}>
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="rep" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue"
                  fill="hsl(var(--chart-1))"
                />
                <Bar
                  yAxisId="right"
                  dataKey="deals"
                  name="Deals"
                  fill="hsl(var(--chart-2))"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={Object.values(teamData)}>
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="team" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue"
                  fill="hsl(var(--chart-3))"
                />
                <Bar
                  yAxisId="right"
                  dataKey="installs"
                  name="Installs"
                  fill="hsl(var(--chart-4))"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lost Opportunities Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Representative</TableHead>
                  <TableHead>Lost Deals</TableHead>
                  <TableHead>Lost Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLosses.map((loss: any) => (
                  <TableRow key={loss.rep}>
                    <TableCell>{loss.rep}</TableCell>
                    <TableCell>{loss.lost_deals}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }).format(loss.lost_revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
