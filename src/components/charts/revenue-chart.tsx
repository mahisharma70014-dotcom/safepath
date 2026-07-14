"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const points = [
  { day: "Mon", value: 18000 },
  { day: "Tue", value: 21500 },
  { day: "Wed", value: 19200 },
  { day: "Thu", value: 24800 },
  { day: "Fri", value: 27900 },
  { day: "Sat", value: 26300 },
  { day: "Sun", value: 30100 },
];

export function RevenueChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={points}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d1ff" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#00d1ff" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" stroke="#7fa6c4" />
          <YAxis stroke="#7fa6c4" />
          <Tooltip
            contentStyle={{
              background: "#081a31",
              border: "1px solid rgba(0, 209, 255, 0.3)",
              borderRadius: "12px",
              color: "#d7eeff",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00d1ff"
            strokeWidth={2.4}
            fillOpacity={1}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
