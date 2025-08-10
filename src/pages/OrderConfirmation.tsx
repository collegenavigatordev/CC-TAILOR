import React from 'react'
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Download, Phone, Mail, MapPin, Clock, Scissors } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { supabase } from '../lib/supabase'

export function OrderConfirmation() {
  const { trackingId } = useParams()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetails()
  }, [trackingId])

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          fabric:fabrics(*),
          garment:garments(*)
        `)
        .eq('tracking_id', trackingId)
        .single()

      if (error) throw error

      if (data) {
        setOrderDetails({
          trackingId: data.tracking_id,
          customerName: data.customer?.name || 'Customer',
          phone: data.customer?.phone || '',
          email: data.customer?.email || '',
          garment: data.garment?.name || 'Custom Garment',
          fabric: `${data.fabric?.name || 'Premium Fabric'} - ${data.fabric?.color || 'Custom Color'}`,
          customizations: Object.entries(data.customizations_json || {})
            .filter(([key, value]) => value && value !== '')
            .map(([key, value]) => `${key.replace('_', ' ')}: ${value}`),
          totalAmount: data.price,
          estimatedCompletion: new Date(data.estimated_completion).toLocaleDateString(),
          orderDate: new Date(data.created_at).toLocaleDateString()
        })
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      // Fallback to sample data
      setOrderDetails({
        trackingId: trackingId || 'RT123456',
        customerName: 'Customer',
        phone: '+91 98765 43210',
        email: 'customer@email.com',
        garment: 'Custom Garment',
        fabric: 'Premium Fabric',
        customizations: ['Custom Order'],
        totalAmount: 6800,
        estimatedCompletion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        orderDate: new Date().toLocaleDateString()
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadBill = () => {
    // In a real app, this would generate and download a PDF
    alert('Bill download functionality would be implemented here')
  }

  const handlePrintBill = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#C8A951]"></div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1A1D23] mb-4">Order Not Found</h1>
          <p className="text-gray-600">The order with tracking ID {trackingId} could not be found.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-[#F8F5F0] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A1D23] mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 text-lg">Thank you for choosing Royal Tailors</p>
        </motion.div>

        {/* Bill/Receipt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          id="order-bill"
        >
          <Card className="p-8 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-[#C8A951] p-3 rounded-lg">
                  <Scissors className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1D23]">Royal Tailors</h2>
                  <p className="text-gray-600">Crafting Excellence Since 1950</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold">{orderDetails.orderDate}</p>
              </div>
            </div>

            {/* Tracking ID - Prominent Display */}
            <div className="bg-[#C8A951] bg-opacity-10 border-2 border-[#C8A951] rounded-lg p-6 mb-8 text-center">
              <p className="text-sm text-gray-700 mb-2">Your Tracking ID</p>
              <p className="text-3xl font-bold text-[#C8A951] font-mono tracking-wider">
                {orderDetails.trackingId}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Save this ID for order tracking and pickup
              </p>
            </div>

            {/* Customer Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-[#1A1D23] mb-4">Customer Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">👤</span>
                    </div>
                    <span>{orderDetails.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span>{orderDetails.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span>{orderDetails.email}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-[#1A1D23] mb-4">Delivery Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="font-medium">Estimated Completion</p>
                      <p className="text-sm text-gray-600">{orderDetails.estimatedCompletion}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="font-medium">Pickup Location</p>
                      <p className="text-sm text-gray-600">123 Fashion Street, Mumbai</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#1A1D23] mb-4">Order Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-[#1A1D23]">{orderDetails.garment}</h4>
                    <p className="text-gray-600">{orderDetails.fabric}</p>
                  </div>
                  <span className="font-semibold text-[#C8A951]">₹{orderDetails.totalAmount.toLocaleString()}</span>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Customizations:</p>
                  <div className="flex flex-wrap gap-2">
                    {orderDetails.customizations.map((custom, index) => (
                      <span
                        key={index}
                        className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border"
                      >
                        {custom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-[#1A1D23] mb-4">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Price</span>
                  <span>₹1,500</span>
                </div>
                <div className="flex justify-between">
                  <span>Fabric Cost (2 meters)</span>
                  <span>₹5,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Customizations</span>
                  <span>₹300</span>
                </div>
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-[#C8A951]">₹{orderDetails.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Please bring this bill (printed or on phone) when picking up your order</li>
                <li>• Our staff will call you to confirm details within 24 hours</li>
                <li>• Track your order progress anytime using your Tracking ID</li>
                <li>• Contact us immediately if you need to make any changes</li>
              </ul>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-wrap gap-4 justify-center mb-8"
        >
          <Button onClick={handleDownloadBill} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Bill
          </Button>
          <Button onClick={handlePrintBill} variant="outline">
            Print Bill
          </Button>
          <Link to={`/track`}>
            <Button>
              Track Order
            </Button>
          </Link>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold text-[#1A1D23] mb-4">What Happens Next?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="bg-[#C8A951] bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-[#C8A951]" />
                </div>
                <h4 className="font-medium text-[#1A1D23] mb-2">Confirmation Call</h4>
                <p className="text-sm text-gray-600">Our team will call you within 24 hours to confirm all details</p>
              </div>
              <div>
                <div className="bg-[#C8A951] bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Scissors className="w-6 h-6 text-[#C8A951]" />
                </div>
                <h4 className="font-medium text-[#1A1D23] mb-2">Crafting Begins</h4>
                <p className="text-sm text-gray-600">Our master tailors will start working on your custom garment</p>
              </div>
              <div>
                <div className="bg-[#C8A951] bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-[#C8A951]" />
                </div>
                <h4 className="font-medium text-[#1A1D23] mb-2">Ready for Pickup</h4>
                <p className="text-sm text-gray-600">We'll notify you when your order is ready for collection</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-600 mb-4">Need help or have questions?</p>
          <div className="flex justify-center space-x-6">
            <a href="tel:+919876543210" className="flex items-center space-x-2 text-[#C8A951] hover:text-[#B8992E]">
              <Phone className="w-4 h-4" />
              <span>+91 98765 43210</span>
            </a>
            <a href="mailto:orders@royaltailors.com" className="flex items-center space-x-2 text-[#C8A951] hover:text-[#B8992E]">
              <Mail className="w-4 h-4" />
              <span>orders@royaltailors.com</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}