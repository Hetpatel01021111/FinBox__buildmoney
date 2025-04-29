"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
} from "recharts";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, DollarSign, Calendar } from "lucide-react";
import { motion } from "framer-motion";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Vibrant, distinct colors for better visibility
const COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#FFD166", // Yellow
  "#6A0572", // Purple
  "#1A936F", // Green
  "#3A86FF", // Blue
  "#F72585", // Pink
  "#FF9E00", // Orange
  "#7209B7", // Violet
  "#3A0CA3", // Indigo
  "#4361EE", // Royal Blue
  "#4CC9F0", // Sky Blue
];

// Category-specific icons and colors
const CATEGORY_STYLES = {
  "housing": { color: "#FF6B6B", icon: "🏠" },
  "transportation": { color: "#4ECDC4", icon: "🚗" },
  "groceries": { color: "#FFD166", icon: "🛒" },
  "utilities": { color: "#6A0572", icon: "💡" },
  "entertainment": { color: "#1A936F", icon: "🎬" },
  "food": { color: "#3A86FF", icon: "🍔" },
  "shopping": { color: "#F72585", icon: "🛍️" },
  "healthcare": { color: "#FF9E00", icon: "🏥" },
  "education": { color: "#7209B7", icon: "📚" },
  "travel": { color: "#3A0CA3", icon: "✈️" },
  "salary": { color: "#4361EE", icon: "💼" },
  "freelance": { color: "#4CC9F0", icon: "💻" },
  "investments": { color: "#06D6A0", icon: "📈" },
  "other-income": { color: "#118AB2", icon: "💰" },
};

// Get style for a category (with fallbacks)
const getCategoryStyle = (category) => {
  return CATEGORY_STYLES[category] || { 
    color: COLORS[Math.floor(Math.random() * COLORS.length)], 
    icon: "📊" 
  };
};

// Custom active shape for the pie chart with improved visibility
const renderActiveShape = (props) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;
  
  const categoryStyle = getCategoryStyle(payload.name);

  return (
    <g>
      <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill="#333" fontSize={16} fontWeight="bold">
        {categoryStyle.icon} {payload.name.replace(/-/g, ' ')}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#333" fontSize={20} fontWeight="bold">
        ${value.toFixed(2)}
      </text>
      <text x={cx} y={cy + 30} dy={8} textAnchor="middle" fill="#666" fontSize={14}>
        {(percent * 100).toFixed(1)}% of total
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={categoryStyle.color}
        opacity={0.9}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius - 1}
        fill={categoryStyle.color}
      />
    </g>
  );
};

// Custom legend with category icons and better visibility
const CustomLegend = (props) => {
  const { payload } = props;
  
  return (
    <div className="grid grid-cols-3 gap-3 mt-6 px-6">
      {payload.map((entry, index) => {
        const category = entry.value;
        const categoryStyle = getCategoryStyle(category);
        
        return (
          <div 
            key={`item-${index}`} 
            className="flex items-center"
          >
            <div 
              className="w-4 h-4 rounded-full mr-2 flex-shrink-0" 
              style={{ backgroundColor: categoryStyle.color }}
            />
            <div className="flex items-center text-sm text-gray-700 truncate">
              <span className="mr-1">{categoryStyle.icon}</span>
              <span className="capitalize">{category.replace(/-/g, ' ')}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Custom tooltip with improved styling
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const category = payload[0].name;
    const categoryStyle = getCategoryStyle(category);
    
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100">
        <div className="flex items-center mb-2">
          <div 
            className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white text-xs"
            style={{ backgroundColor: categoryStyle.color }}
          >
            <span>{categoryStyle.icon}</span>
          </div>
          <p className="font-semibold text-gray-900 capitalize">{category.replace(/-/g, ' ')}</p>
        </div>
        <div className="flex items-center mt-2 text-sm">
          <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
          <span className="font-medium text-gray-900">${payload[0].value.toFixed(2)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function DashboardOverview({ accounts, transactions }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [timeframe, setTimeframe] = useState("month"); // "month", "week", "year"

  // Reset animation state when account changes
  useEffect(() => {
    setAnimationComplete(false);
    const timer = setTimeout(() => setAnimationComplete(true), 1000);
    return () => clearTimeout(timer);
  }, [selectedAccountId, timeframe]);

  // Filter transactions for selected account
  const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );

  // Get recent transactions (last 5)
  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Calculate expense breakdown based on timeframe
  const currentDate = new Date();
  const getTimeframeStart = () => {
    const date = new Date(currentDate);
    if (timeframe === "week") {
      date.setDate(date.getDate() - 7);
    } else if (timeframe === "month") {
      date.setDate(1); // First day of current month
    } else if (timeframe === "year") {
      date.setMonth(0, 1); // January 1st of current year
    }
    return date;
  };

  const timeframeStart = getTimeframeStart();
  
  const timeframeExpenses = accountTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      transactionDate >= timeframeStart &&
      transactionDate <= currentDate
    );
  });

  // Group expenses by category
  const expensesByCategory = timeframeExpenses.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
  }, {});

  // Format data for pie chart
  const pieChartData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending

  // Calculate total expenses
  const totalExpenses = pieChartData.reduce((sum, item) => sum + item.value, 0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Get timeframe label
  const getTimeframeLabel = () => {
    if (timeframe === "week") return "Last 7 Days";
    if (timeframe === "month") return format(currentDate, "MMMM yyyy");
    if (timeframe === "year") return format(currentDate, "yyyy");
    return "";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid gap-6 md:grid-cols-2"
    >
      {/* Recent Transactions Card */}
      <Card className="border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <div className="w-10 h-10 mr-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 4L21 9L12 14L3 9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14L12 19L21 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            Recent Transactions
          </CardTitle>
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[160px] border-gray-200 bg-white shadow-sm">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: account.color || "#3b82f6" }}></div>
                    {account.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="pt-6 px-6 pb-4">
          <div className="space-y-5">
            {recentTransactions.length === 0 ? (
              <div className="text-center text-gray-500 py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p className="font-medium text-lg">No recent transactions</p>
                <p className="text-sm mt-1">Transactions will appear here once created</p>
              </div>
            ) : (
              recentTransactions.map((transaction, index) => {
                const categoryStyle = getCategoryStyle(transaction.category);
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-12 h-12 rounded-xl mr-4 flex items-center justify-center" 
                        style={{ 
                          backgroundColor: transaction.type === "EXPENSE" 
                            ? `${categoryStyle.color}20` // 20% opacity
                            : "#E9F9EE",
                          color: transaction.type === "EXPENSE" 
                            ? categoryStyle.color
                            : "#10B981"
                        }}
                      >
                        <span className="text-lg">
                          {transaction.type === "EXPENSE" 
                            ? categoryStyle.icon 
                            : "💰"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none text-gray-900">
                          {transaction.description || `${transaction.type === "EXPENSE" ? "Paid for" : "Received"} ${transaction.category.replace(/-/g, ' ')}`}
                        </p>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500">
                            {format(new Date(transaction.date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "font-medium text-base",
                        transaction.type === "EXPENSE"
                          ? "text-red-600"
                          : "text-green-600"
                      )}
                    >
                      {transaction.type === "EXPENSE" ? "-" : "+"}${transaction.amount.toFixed(2)}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown Card */}
      <Card className="border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
              <div className="w-10 h-10 mr-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-md">
                <PieChartIcon className="h-5 w-5 text-white" />
              </div>
              Expense Breakdown
            </CardTitle>
            
            <div className="flex space-x-1 bg-white rounded-full p-1 shadow-sm border border-gray-200">
              <button 
                onClick={() => setTimeframe("week")} 
                className={`px-4 py-1 text-sm font-medium rounded-full transition-all ${
                  timeframe === "week" 
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Week
              </button>
              <button 
                onClick={() => setTimeframe("month")} 
                className={`px-4 py-1 text-sm font-medium rounded-full transition-all ${
                  timeframe === "month" 
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Month
              </button>
              <button 
                onClick={() => setTimeframe("year")} 
                className={`px-4 py-1 text-sm font-medium rounded-full transition-all ${
                  timeframe === "year" 
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Year
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {pieChartData.length === 0 ? (
            <div className="text-center text-gray-500 py-16 px-4 bg-gray-50/50">
              <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <p className="font-medium text-xl">No expenses found</p>
              <p className="text-sm mt-2 max-w-xs mx-auto">
                No expenses recorded for the selected timeframe. Start tracking your expenses to see a breakdown by category.
              </p>
            </div>
          ) : (
            <div className="pt-8 pb-8">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-4xl font-bold text-black">
                  ${totalExpenses.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {getTimeframeLabel()}
                </p>
              </div>
              
              <div className="relative flex justify-center items-center">
                <div className="w-[280px] h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {pieChartData.map((entry, index) => {
                          const categoryStyle = getCategoryStyle(entry.name);
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={categoryStyle.color}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          );
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Center content */}
                {!activeIndex && pieChartData.length > 0 && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-lg font-bold">
                      ${pieChartData[0].value.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-center">
                      <span className="mr-1">{getCategoryStyle(pieChartData[0].name).icon}</span>
                      <span className="text-sm capitalize">{pieChartData[0].name.replace(/-/g, ' ')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(pieChartData[0].value / totalExpenses * 100).toFixed(1)}% of total
                    </p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-3 mt-6 px-6">
                {pieChartData.map((entry, index) => {
                  const categoryStyle = getCategoryStyle(entry.name);
                  return (
                    <div 
                      key={`legend-${index}`} 
                      className="flex items-center"
                      onClick={() => setActiveIndex(index)}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                        style={{ backgroundColor: categoryStyle.color }}
                      />
                      <div className="flex items-center text-sm text-gray-700 truncate">
                        <span className="mr-1">{categoryStyle.icon}</span>
                        <span className="capitalize">{entry.name.replace(/-/g, ' ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}