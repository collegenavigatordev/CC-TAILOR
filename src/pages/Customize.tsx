import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Palette, Scissors, Ruler, CreditCard } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { supabase } from '../lib/supabase'

export function Customize() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [orderData, setOrderData] = useState({
    fabric: null,
    garment: null,
    customizations: {
      fit: 'regular',
      collar: '',
      sleeves: '',
      cuffs: '',
      pockets: '',
      lining: false,
      buttons: '',
      embroidery: '',
      monogram: '',
      special_instructions: ''
    },
    measurements: {
      method: 'manual',
      chest: '',
      waist: '',
      hips: '',
      shoulder: '',
      sleeve_length: '',
      shirt_length: '',
      trouser_length: ''
    },
    customer: {
      name: '',
      phone: '',
      alternate_phone: '',
      email: '',
      address: ''
    },
    pricing: {
      base_price: 0,
      fabric_cost: 0,
      customization_cost: 0,
      urgent_charge: 0,
      total: 0
    }
  })

  const steps = [
    { number: 1, title: 'Select Fabric & Garment', icon: Palette },
    { number: 2, title: 'Customize Design', icon: Scissors },
    { number: 3, title: 'Provide Measurements', icon: Ruler },
    { number: 4, title: 'Contact Details', icon: CreditCard },
    { number: 5, title: 'Review & Payment', icon: CreditCard }
  ]

  useEffect(() => {
    const fabricId = searchParams.get('fabric')
    const garmentId = searchParams.get('garment')
    
    if (fabricId) {
      fetchFabric(fabricId)
    }
    
    if (garmentId) {
      fetchGarment(garmentId)
    }
  }, [searchParams])

  const fetchFabric = async (fabricId: string) => {
    try {
      const { data, error } = await supabase
        .from('fabrics')
        .select('*')
        .eq('id', fabricId)
        .single()

      if (error) throw error
      if (data) {
        setOrderData(prev => ({ ...prev, fabric: data }))
      }
    } catch (error) {
      console.error('Error fetching fabric:', error)
    }
  }

  const fetchGarment = async (garmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('garments')
        .select('*')
        .eq('id', garmentId)
        .single()

      if (error) throw error
      if (data) {
        setOrderData(prev => ({ ...prev, garment: data }))
      }
    } catch (error) {
      console.error('Error fetching garment:', error)
    }
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateCustomization = (key: string, value: any) => {
    setOrderData(prev => ({
      ...prev,
      customizations: {
        ...prev.customizations,
        [key]: value
      }
    }))
  }

  const updateMeasurement = (key: string, value: any) => {
    setOrderData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [key]: value
      }
    }))
  }

  const updateCustomer = (key: string, value: any) => {
    setOrderData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [key]: value
      }
    }))
  }

  const handlePlaceOrder = async () => {
    try {
      // Validate required fields
      if (!orderData.customer.name || !orderData.customer.phone || !orderData.customer.email) {
        alert('Please fill in all required customer details')
        return
      }

      if (!orderData.fabric || !orderData.garment) {
        alert('Please select both fabric and garment')
        return
      }

      // Create customer first
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: orderData.customer.name,
          phone: orderData.customer.phone,
          email: orderData.customer.email,
          measurements_json: orderData.measurements
        })
        .select()
        .single()

      if (customerError) throw customerError

      // Create order
      const { data: orderDataResult, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerData.id,
          fabric_id: orderData.fabric.id,
          garment_id: orderData.garment.id,
          customizations_json: orderData.customizations,
          measurements_json: orderData.measurements,
          price: calculateTotalPrice(),
          status: 'confirmed',
          urgent: false,
          special_instructions: orderData.customizations.special_instructions,
          estimated_completion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Navigate to confirmation page
      navigate(`/order-confirmation/${orderDataResult.tracking_id}`)
    } catch (error) {
      console.error('Error placing order:', error)
      alert(`Error placing order: ${error.message}. Please try again.`)
    }
  }

  const calculateTotalPrice = () => {
    let total = 0
    if (orderData.garment) total += orderData.garment.base_price
    if (orderData.fabric) total += orderData.fabric.price_per_meter * 2 // Assuming 2 meters
    if (orderData.customizations.lining) total += 300
    return total
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FabricGarmentSelection orderData={orderData} setOrderData={setOrderData} />
      case 2:
        return <CustomizationStep orderData={orderData} updateCustomization={updateCustomization} />
      case 3:
        return <MeasurementsStep orderData={orderData} updateMeasurement={updateMeasurement} />
      case 4:
        return <ContactDetailsStep orderData={orderData} updateCustomer={updateCustomer} />
      case 5:
        return <ReviewPaymentStep orderData={orderData} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                  ${currentStep >= step.number 
                    ? 'bg-[#C8A951] border-[#C8A951] text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-0.5 mx-2 transition-all
                    ${currentStep > step.number ? 'bg-[#C8A951]' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-[#1A1D23]">
              {steps[currentStep - 1]?.title}
            </h2>
            <p className="text-gray-600">Step {currentStep} of {steps.length}</p>
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          {renderStep()}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep === 5}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step Components
function FabricGarmentSelection({ orderData, setOrderData }: any) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-[#1A1D23] mb-4">Selected Fabric</h3>
        {orderData.fabric ? (
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div>
              <h4 className="font-medium">{orderData.fabric.name}</h4>
              <p className="text-gray-600">{orderData.fabric.color}</p>
              <p className="text-[#C8A951] font-semibold">₹{orderData.fabric.price_per_meter}/meter</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No fabric selected</p>
        )}
      </Card>
      
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-[#1A1D23] mb-4">Selected Garment</h3>
        {orderData.garment ? (
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div>
              <h4 className="font-medium">{orderData.garment.name}</h4>
              <p className="text-gray-600">{orderData.garment.category}</p>
              <p className="text-[#C8A951] font-semibold">₹{orderData.garment.base_price}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No garment selected</p>
        )}
      </Card>
    </div>
  )
}

function CustomizationStep({ orderData, updateCustomization }: any) {
  const customizationOptions = {
    fit: ['Regular', 'Slim', 'Relaxed'],
    collar: ['Regular', 'Button Down', 'Spread', 'Cutaway'],
    sleeves: ['Full Sleeve', 'Half Sleeve', 'Quarter Sleeve'],
    cuffs: ['Regular', 'French', 'Convertible'],
    pockets: ['None', 'Single', 'Double'],
    buttons: ['Standard', 'Horn', 'Mother of Pearl', 'Metal']
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-[#1A1D23] mb-6">Customize Your Garment</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(customizationOptions).map(([key, options]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-[#1A1D23] mb-2 capitalize">
                {key.replace('_', ' ')}
              </label>
              <select
                value={orderData.customizations[key]}
                onChange={(e) => updateCustomization(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
              >
                <option value="">Select {key}</option>
                {options.map(option => (
                  <option key={option} value={option.toLowerCase()}>{option}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={orderData.customizations.lining}
              onChange={(e) => updateCustomization('lining', e.target.checked)}
              className="rounded border-gray-300 text-[#C8A951] focus:ring-[#C8A951]"
            />
            <span className="text-sm text-[#1A1D23]">Add Premium Lining (+₹300)</span>
          </label>
        </div>

        <div className="mt-6 space-y-4">
          <Input
            label="Embroidery Text (Optional)"
            value={orderData.customizations.embroidery}
            onChange={(e) => updateCustomization('embroidery', e.target.value)}
            placeholder="Enter text for embroidery"
          />
          <Input
            label="Monogram (Optional)"
            value={orderData.customizations.monogram}
            onChange={(e) => updateCustomization('monogram', e.target.value)}
            placeholder="Enter initials for monogram"
          />
          <div>
            <label className="block text-sm font-medium text-[#1A1D23] mb-2">
              Special Instructions
            </label>
            <textarea
              value={orderData.customizations.special_instructions}
              onChange={(e) => updateCustomization('special_instructions', e.target.value)}
              placeholder="Any special requests or instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
              rows={3}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

function MeasurementsStep({ orderData, updateMeasurement }: any) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-[#1A1D23] mb-6">Measurement Method</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { value: 'manual', label: 'Manual Entry', desc: 'Enter measurements yourself' },
            { value: 'home_visit', label: 'Home Visit', desc: 'Our tailor visits you (+₹200)' },
            { value: 'saved', label: 'Saved Profile', desc: 'Use previous measurements' },
            { value: 'guide', label: 'Measurement Guide', desc: 'Follow our guide at home' }
          ].map(method => (
            <label key={method.value} className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="measurement_method"
                value={method.value}
                checked={orderData.measurements.method === method.value}
                onChange={(e) => updateMeasurement('method', e.target.value)}
                className="mt-1 text-[#C8A951] focus:ring-[#C8A951]"
              />
              <div>
                <p className="font-medium text-[#1A1D23]">{method.label}</p>
                <p className="text-sm text-gray-600">{method.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {orderData.measurements.method === 'manual' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-[#1A1D23] mb-6">Enter Measurements (in inches)</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'chest', label: 'Chest' },
              { key: 'waist', label: 'Waist' },
              { key: 'hips', label: 'Hips' },
              { key: 'shoulder', label: 'Shoulder' },
              { key: 'sleeve_length', label: 'Sleeve Length' },
              { key: 'shirt_length', label: 'Shirt Length' },
              { key: 'trouser_length', label: 'Trouser Length' }
            ].map(field => (
              <Input
                key={field.key}
                label={field.label}
                type="number"
                value={orderData.measurements[field.key]}
                onChange={(e) => updateMeasurement(field.key, e.target.value)}
                placeholder="Enter measurement"
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function ContactDetailsStep({ orderData, updateCustomer }: any) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-[#1A1D23] mb-6">Contact Information</h3>
      <div className="space-y-4">
        <Input
          label="Full Name *"
          value={orderData.customer.name}
          onChange={(e) => updateCustomer('name', e.target.value)}
          placeholder="Enter your full name"
          required
        />
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Mobile Number *"
            type="tel"
            value={orderData.customer.phone}
            onChange={(e) => updateCustomer('phone', e.target.value)}
            placeholder="Enter mobile number"
            required
          />
          <Input
            label="Alternate Number"
            type="tel"
            value={orderData.customer.alternate_phone}
            onChange={(e) => updateCustomer('alternate_phone', e.target.value)}
            placeholder="Enter alternate number"
          />
        </div>
        <Input
          label="Email Address *"
          type="email"
          value={orderData.customer.email}
          onChange={(e) => updateCustomer('email', e.target.value)}
          placeholder="Enter email address"
          required
        />
        <div>
          <label className="block text-sm font-medium text-[#1A1D23] mb-2">
            Address *
          </label>
          <textarea
            value={orderData.customer.address}
            onChange={(e) => updateCustomer('address', e.target.value)}
            placeholder="Enter your complete address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
            rows={3}
            required
          />
        </div>
      </div>
    </Card>
  )
}

function ReviewPaymentStep({ orderData }: any) {
  const navigate = useNavigate()
  
  const handlePlaceOrder = async () => {
    try {
      // Create customer first
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: orderData.customer.name,
          phone: orderData.customer.phone,
          email: orderData.customer.email,
          measurements_json: orderData.measurements
        })
        .select()
        .single()

      if (customerError) throw customerError

      // Generate tracking ID
      const trackingId = 'RT' + Date.now().toString().slice(-6)

      // Create order
      const { data: orderDataResult, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerData.id,
          fabric_id: orderData.fabric?.id || '1',
          garment_id: orderData.garment?.id || '1',
          tracking_id: trackingId,
          customizations_json: orderData.customizations,
          measurements_json: orderData.measurements,
          price: calculateTotal(),
          status: 'confirmed',
          urgent: false,
          special_instructions: orderData.customizations.special_instructions,
          estimated_completion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Navigate to confirmation page
      navigate(`/order-confirmation/${trackingId}`)
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order. Please try again.')
    }
  }
  
  const calculateTotal = () => {
    let total = 0
    if (orderData.garment) total += orderData.garment.base_price
    if (orderData.fabric) total += orderData.fabric.price_per_meter * 2
    if (orderData.customizations.lining) total += 300
    return total
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-[#1A1D23] mb-6">Order Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Base Price</span>
            <span>₹{orderData.garment?.base_price || 1500}</span>
          </div>
          <div className="flex justify-between">
            <span>Fabric Cost (2 meters)</span>
            <span>₹{orderData.fabric ? orderData.fabric.price_per_meter * 2 : 5000}</span>
          </div>
          <div className="flex justify-between">
            <span>Customizations</span>
            <span>₹{orderData.customizations.lining ? 300 : 0}</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-[#C8A951]">₹{calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-[#1A1D23] mb-6">Payment Options</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer">
            <input type="radio" name="payment" value="online" className="text-[#C8A951]" />
            <span>Pay Online (UPI, Card, Net Banking)</span>
          </label>
          <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer">
            <input type="radio" name="payment" value="pickup" className="text-[#C8A951]" />
            <span>Pay at Pickup (50% advance required)</span>
          </label>
        </div>
      </Card>

      <div className="flex items-center space-x-2 mb-4">
        <input type="checkbox" required className="text-[#C8A951]" />
        <span className="text-sm text-gray-700">
          I confirm my details are correct and understand my tracking ID will be shown on my bill.
        </span>
      </div>

      <Button onClick={handlePlaceOrder} size="lg" className="w-full">
        Place Order
      </Button>
    </div>
  )
}