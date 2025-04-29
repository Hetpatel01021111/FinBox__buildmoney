"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, PieChartIcon, DollarSign, Calendar } from "lucide-react";

// Vibrant colors matching dashboard
const COLORS = {
  income: "#06D6A0", // Vibrant green
  expense: "#FF6B6B", // Vibrant red
  net: "#4361EE", // Vibrant blue
};

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

// Custom tooltip with improved styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
        <p className="font-medium text-gray-700 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.fill }}
              ></div>
              <span className="text-sm">{entry.name}:</span>
            </div>
            <span className="font-medium">${entry.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function AccountChart({ transactions }) {
  const [dateRange, setDateRange] = useState("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    // Filter transactions within date range
    const filtered = transactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
    );

    // Group transactions by date
    const grouped = filtered.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (transaction.type === "INCOME") {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += transaction.amount;
      }
      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions, dateRange]);

  // Calculate totals for the selected period
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center">
          <PieChartIcon className="h-5 w-5 mr-2 text-blue-600" />
          <CardTitle className="text-lg font-semibold">
            Transaction Overview
          </CardTitle>
        </div>
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px] bg-white border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Select range" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-600 font-medium">Total Income</p>
              <div className="p-1.5 rounded-full bg-green-200">
                <ArrowUpRight className="h-4 w-4 text-green-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">
              ${totals.income.toFixed(2)}
            </p>
          </div>
          
          <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
              <div className="p-1.5 rounded-full bg-red-200">
                <ArrowDownRight className="h-4 w-4 text-red-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-2">
              ${totals.expense.toFixed(2)}
            </p>
          </div>
          
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-600 font-medium">Net</p>
              <div className="p-1.5 rounded-full bg-blue-200">
                <DollarSign className="h-4 w-4 text-blue-700" />
              </div>
            </div>
            <p className={`text-2xl font-bold mt-2 ${
              totals.income - totals.expense >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}>
              ${(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </motion.div>
        
        <div className="h-[300px] bg-white p-4 rounded-xl shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="#9ca3af"
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                stroke="#9ca3af"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{ paddingTop: 10 }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill={COLORS.income}
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill={COLORS.expense}
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}