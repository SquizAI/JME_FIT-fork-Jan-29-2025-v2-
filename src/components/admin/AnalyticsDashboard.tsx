import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Users, FileText, Clock, Calendar, Filter,
  ChevronDown, ChevronUp, AlertTriangle, Package, DollarSign
} from 'lucide-react';
import { db } from '../../db';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState({
    pageViews: [],
    userEngagement: [],
    contentPerformance: [],
    userGrowth: [],
    salesData: [],
    inventoryAlerts: [],
    revenueForecasts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual analytics data
    const mockData = {
      pageViews: [
        { date: '2024-03-10', views: 1200 },
        { date: '2024-03-11', views: 1400 },
        { date: '2024-03-12', views: 1100 },
        { date: '2024-03-13', views: 1600 },
        { date: '2024-03-14', views: 1800 },
        { date: '2024-03-15', views: 2000 },
        { date: '2024-03-16', views: 1900 }
      ],
      userEngagement: [
        { type: 'Articles', value: 40 },
        { type: 'Workouts', value: 30 },
        { type: 'Recipes', value: 20 },
        { type: 'Other', value: 10 }
      ],
      salesData: [
        { date: '2024-03-10', sales: 2500, orders: 25 },
        { date: '2024-03-11', sales: 3000, orders: 30 },
        { date: '2024-03-12', sales: 2800, orders: 28 },
        { date: '2024-03-13', sales: 3200, orders: 32 },
        { date: '2024-03-14', sales: 3500, orders: 35 },
        { date: '2024-03-15', sales: 3800, orders: 38 },
        { date: '2024-03-16', sales: 4000, orders: 40 }
      ],
      inventoryAlerts: [
        { product: 'Classic Training Tee', stock: 5, threshold: 10 },
        { product: 'Performance Hoodie', stock: 3, threshold: 8 },
        { product: 'Resistance Bands', stock: 2, threshold: 15 }
      ],
      revenueForecasts: [
        { month: 'Apr', actual: 45000, forecast: 48000 },
        { month: 'May', actual: null, forecast: 52000 },
        { month: 'Jun', actual: null, forecast: 55000 }
      ]
    };

    setData(mockData);
    setLoading(false);
  }, [timeRange]);

  const COLORS = ['#3dd8e8', '#9333ea', '#f43f5e', '#10b981'];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#3dd8e8]">Analytics Dashboard</h2>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-zinc-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Real-time Sales Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 p-6 rounded-lg"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">Today's Sales</p>
              <h3 className="text-2xl font-bold">$4,250</h3>
            </div>
            <DollarSign className="w-6 h-6 text-[#3dd8e8]" />
          </div>
          <div className="flex items-center gap-1 text-sm text-green-500">
            <ChevronUp className="w-4 h-4" />
            <span>15% vs yesterday</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 p-6 rounded-lg"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">New Customers</p>
              <h3 className="text-2xl font-bold">28</h3>
            </div>
            <Users className="w-6 h-6 text-[#3dd8e8]" />
          </div>
          <div className="flex items-center gap-1 text-sm text-green-500">
            <ChevronUp className="w-4 h-4" />
            <span>8% vs last week</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 p-6 rounded-lg"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">Orders</p>
              <h3 className="text-2xl font-bold">156</h3>
            </div>
            <Package className="w-6 h-6 text-[#3dd8e8]" />
          </div>
          <div className="flex items-center gap-1 text-sm text-green-500">
            <ChevronUp className="w-4 h-4" />
            <span>12% vs last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 p-6 rounded-lg"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">Avg. Order Value</p>
              <h3 className="text-2xl font-bold">$85.50</h3>
            </div>
            <TrendingUp className="w-6 h-6 text-[#3dd8e8]" />
          </div>
          <div className="flex items-center gap-1 text-sm text-green-500">
            <ChevronUp className="w-4 h-4" />
            <span>5% vs last week</span>
          </div>
        </motion.div>
      </div>

      {/* Sales Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 p-6 rounded-lg mb-8"
      >
        <h3 className="text-xl font-semibold mb-6">Sales Overview</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: 'none',
                  borderRadius: '0.5rem'
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3dd8e8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Inventory Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 p-6 rounded-lg mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Inventory Alerts</h3>
          <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-sm">
            {data.inventoryAlerts.length} alerts
          </span>
        </div>
        <div className="space-y-4">
          {data.inventoryAlerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between bg-black p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium">{alert.product}</p>
                  <p className="text-sm text-gray-400">Current stock: {alert.stock}</p>
                </div>
              </div>
              <span className="text-red-500">
                Below threshold ({alert.threshold})
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Revenue Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 p-6 rounded-lg"
      >
        <h3 className="text-xl font-semibold mb-6">Revenue Forecast</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.revenueForecasts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: 'none',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar dataKey="actual" fill="#3dd8e8" name="Actual Revenue" />
              <Bar dataKey="forecast" fill="#9333ea" name="Forecasted Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;