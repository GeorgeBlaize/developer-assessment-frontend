"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface BarDatum {
  label: string;
  value: number;
  /** Highlight (e.g. bins at or above the pass mark). */
  highlight?: boolean;
}

const tooltipProps = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    color: "var(--popover-foreground)",
    fontSize: 12,
  },
  cursor: { fill: "color-mix(in oklch, var(--muted) 60%, transparent)" },
};

export function SimpleBarChart({ title, description, data, valueLabel }: { title: string; description: string; data: BarDatum[]; valueLabel: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-64 px-2 sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
            <Tooltip {...tooltipProps} />
            <Bar dataKey="value" name={valueLabel} radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((d) => (
                <Cell key={d.label} fill={d.highlight ? "var(--chart-2)" : "var(--chart-1)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
