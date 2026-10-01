"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ActivityPoint {
  date: string;
  signIns: number;
  hiring: number;
  other: number;
}

export interface SliceDatum {
  name: string;
  value: number;
}

const tooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    color: "var(--popover-foreground)",
    fontSize: 12,
  },
  labelStyle: { color: "var(--muted-foreground)", marginBottom: 4 },
  cursor: { fill: "color-mix(in oklch, var(--muted) 60%, transparent)" },
};

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)"];

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Platform activity</CardTitle>
        <CardDescription>Audit-logged events per day over the last two weeks</CardDescription>
      </CardHeader>
      <CardContent className="h-72 px-2 sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
            <defs>
              {(["signIns", "hiring", "other"] as const).map((key, i) => (
                <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--chart-${i + 1})`} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={`var(--chart-${i + 1})`} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
            <Tooltip {...tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="signIns" name="Sign-ins" stackId="1" stroke="var(--chart-1)" fill="url(#fill-signIns)" strokeWidth={2} />
            <Area type="monotone" dataKey="hiring" name="Hiring actions" stackId="1" stroke="var(--chart-2)" fill="url(#fill-hiring)" strokeWidth={2} />
            <Area type="monotone" dataKey="other" name="Other" stackId="1" stroke="var(--chart-3)" fill="url(#fill-other)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function UsersByRoleChart({ data }: { data: SliceDatum[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users by role</CardTitle>
        <CardDescription>{total} active accounts</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={3} strokeWidth={0}>
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ActionBreakdownChart({ data }: { data: SliceDatum[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Most frequent actions</CardTitle>
        <CardDescription>Across the latest audit-log entries</CardDescription>
      </CardHeader>
      <CardContent className="h-72 px-2 sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="var(--muted-foreground)"
            />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="value" name="Events" fill="var(--chart-1)" radius={[0, 6, 6, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
