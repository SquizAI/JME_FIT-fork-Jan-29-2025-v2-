import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Package, Calendar, Download, Printer, Edit, Trash2, MessageCircle } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  notes?: string[];
}

const OrderManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [orderNote, setOrderNote] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockOrders: Order[] = [
      {
        id: '1',
        customer: 'John Doe',
        date: '2024-03-15',
        total: 129.99,
        status: 'pending',
        items: [
          { id: '1', name: 'Training Tee', quantity: 2, price: 29.99 },
          { id: '2', name: 'Resistance Bands', quantity: 1, price: 19.99 }
        ],
        notes: ['Customer requested gift wrapping']
      },
      {
        id: '2',
        customer: 'Jane Smith',
        date: '2024-03-14',
        total: 199.99,
        status: 'processing',
        items: [
          { id: '3', name: 'Performance Hoodie', quantity: 1, price: 89.99 },
          { id: '4', name: 'Protein Powder', quantity: 2, price: 54.99 }
        ]
      }
    ];

    setOrders(mockOrders);
    setLoading(false);
  }, []);

  const handleBulkAction = (action: 'process' | 'ship' | 'cancel') => {
    // Implement bulk action logic
    console.log(`Bulk ${action} for orders:`, selectedOrders);
  };

  const handleAddNote = (orderId: string) => {
    if (!orderNote.trim()) return;

    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId
          ? {
              ...order,
              notes: [...(order.notes || []), orderNote]
            }
          : order
      )
    );

    setOrderNote('');
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesDate = 
      (!dateRange.start || new Date(order.date) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(order.date) <= new Date(dateRange.end));

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#3dd8e8]">Order Management</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleBulkAction('process')}
            disabled={selectedOrders.length === 0}
            className="bg-[#3dd8e8] text-black px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Process Selected
          </button>
          <button
            onClick={() => handleBulkAction('ship')}
            disabled={selectedOrders.length === 0}
            className="bg-[#3dd8e8] text-black px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Ship Selected
          </button>
          <button
            onClick={() => handleBulkAction('cancel')}
            disabled={selectedOrders.length === 0}
            className="bg-red-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Cancel Selected
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-lg mb-8">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(orders.map(order => order.id));
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                    className="rounded border-gray-400"
                  />
                </th>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders([...selectedOrders, order.id]);
                        } else {
                          setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                        }
                      }}
                      className="rounded border-gray-400"
                    />
                  </td>
                  <td className="px-4 py-3">#{order.id}</td>
                  <td className="px-4 py-3">{order.customer}</td>
                  <td className="px-4 py-3">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      order.status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                      order.status === 'shipped' ? 'bg-purple-500/20 text-purple-500' :
                      order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1 hover:bg-zinc-700 rounded"
                      >
                        <MessageCircle className="w-4 h-4 text-[#3dd8e8]" />
                      </button>
                      <button className="p-1 hover:bg-zinc-700 rounded">
                        <Edit className="w-4 h-4 text-[#3dd8e8]" />
                      </button>
                      <button className="p-1 hover:bg-zinc-700 rounded">
                        <Printer className="w-4 h-4 text-[#3dd8e8]" />
                      </button>
                      <button className="p-1 hover:bg-zinc-700 rounded">
                        <Download className="w-4 h-4 text-[#3dd8e8]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Notes Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-lg p-6 max-w-lg w-full"
          >
            <h3 className="text-xl font-semibold mb-4">Order Notes - #{selectedOrder.id}</h3>
            <div className="space-y-4 mb-4">
              {selectedOrder.notes?.map((note, index) => (
                <div key={index} className="bg-black p-3 rounded">
                  {note}
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 px-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3dd8e8]"
              />
              <button
                onClick={() => handleAddNote(selectedOrder.id)}
                className="bg-[#3dd8e8] text-black px-4 py-2 rounded-lg"
              >
                Add Note
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-zinc-800 px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;