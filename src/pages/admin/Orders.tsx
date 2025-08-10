import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Eye, Edit, Phone, Mail, Calendar, Package } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { supabase } from '../../lib/supabase'
import { Order } from '../../types'

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const statusOptions = [
    'confirmed',
    'fabric_ready',
    'cutting',
    'stitching',
    'embroidery',
    'quality_check',
    'ready',
    'completed'
  ]

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          fabric:fabrics(*),
          garment:garments(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.garment?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      
      setSelectedOrder(null)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800',
      fabric_ready: 'bg-purple-100 text-purple-800',
      cutting: 'bg-yellow-100 text-yellow-800',
      stitching: 'bg-orange-100 text-orange-800',
      embroidery: 'bg-pink-100 text-pink-800',
      quality_check: 'bg-indigo-100 text-indigo-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#C8A951]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1D23]">Orders Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
        </div>
        <Button onClick={fetchOrders}>
          Refresh Orders
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by tracking ID, customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
          >
            <option value="all">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#1A1D23]">
                        {order.tracking_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.garment?.name} - {order.fabric?.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#1A1D23]">
                        {order.customer?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer?.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {order.urgent && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        URGENT
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#C8A951]">
                    ₹{order.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order)
                        setIsModalOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-[#1A1D23] mb-2">Order Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Tracking ID:</span> {selectedOrder.tracking_id}</p>
                  <p><span className="font-medium">Garment:</span> {selectedOrder.garment?.name}</p>
                  <p><span className="font-medium">Fabric:</span> {selectedOrder.fabric?.name}</p>
                  <p><span className="font-medium">Price:</span> ₹{selectedOrder.price.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-[#1A1D23] mb-2">Customer Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedOrder.customer?.name}</p>
                  <p><span className="font-medium">Phone:</span> {selectedOrder.customer?.phone}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.customer?.email}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-[#1A1D23] mb-2">Update Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map(status => (
                  <Button
                    key={status}
                    variant={selectedOrder.status === status ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => updateOrderStatus(selectedOrder.id, status)}
                    className="text-xs"
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {selectedOrder.special_instructions && (
              <div>
                <h4 className="font-semibold text-[#1A1D23] mb-2">Special Instructions</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {selectedOrder.special_instructions}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}