import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingBag, Star, Clock, Truck, Palette } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { supabase } from '../lib/supabase'
import { Garment } from '../types'

export function GarmentDetail() {
  const { id } = useParams()
  const [garment, setGarment] = useState<Garment | null>(null)
  const [selectedCustomization, setSelectedCustomization] = useState<string>('')

  useEffect(() => {
    // Sample garment data - in real app, fetch from Supabase
    const sampleGarments = [
      {
        id: '1',
        name: 'Classic Shirt',
        category: 'Shirts',
        base_price: 1500,
        description: 'Timeless classic shirt perfect for office and casual wear. Made with precision and attention to detail, this shirt offers comfort and style for any occasion.',
        image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg',
        customization_options: {
          collar: ['Regular', 'Button Down', 'Spread', 'Cutaway'],
          sleeves: ['Full Sleeve', 'Half Sleeve', 'Quarter Sleeve'],
          fit: ['Regular', 'Slim', 'Relaxed'],
          cuffs: ['Regular', 'French', 'Convertible'],
          pockets: ['None', 'Single', 'Double']
        },
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Business Suit',
        category: 'Suits',
        base_price: 8500,
        description: 'Professional business suit for formal occasions. Crafted with premium materials and expert tailoring for the perfect fit.',
        image_url: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
        customization_options: {
          jacket: ['Single Breasted', 'Double Breasted'],
          lapels: ['Notch', 'Peak', 'Shawl'],
          buttons: ['2 Button', '3 Button'],
          vents: ['No Vent', 'Single Vent', 'Double Vent'],
          trouser: ['Flat Front', 'Pleated']
        },
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Wedding Sherwani',
        category: 'Sherwanis',
        base_price: 12000,
        description: 'Elegant sherwani for weddings and special occasions. Traditional craftsmanship meets modern design.',
        image_url: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg',
        customization_options: {
          collar: ['Band', 'High Neck', 'Nehru'],
          length: ['Knee Length', 'Mid Thigh', 'Full Length'],
          buttons: ['Traditional', 'Modern', 'Decorative'],
          embroidery: ['None', 'Light', 'Heavy', 'Custom Design']
        },
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Saree Blouse',
        category: 'Saree Blouses',
        base_price: 2500,
        description: 'Custom fitted saree blouse with various neckline options. Perfect for traditional and contemporary sarees.',
        image_url: 'https://images.pexels.com/photos/8849295/pexels-photo-8849295.jpeg',
        customization_options: {
          neckline: ['Round', 'V-Neck', 'Square', 'Boat', 'Halter'],
          sleeves: ['Sleeveless', 'Cap Sleeve', 'Half Sleeve', 'Full Sleeve'],
          back: ['Regular', 'Deep Back', 'Keyhole', 'Tie-up'],
          embellishment: ['None', 'Beadwork', 'Embroidery', 'Sequins']
        },
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Casual Kurta',
        category: 'Kurtas',
        base_price: 1800,
        description: 'Comfortable kurta for daily wear and casual occasions. Versatile and stylish for any casual setting.',
        image_url: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
        customization_options: {
          collar: ['Band', 'Nehru', 'Chinese'],
          length: ['Short', 'Medium', 'Long'],
          sleeves: ['Full Sleeve', 'Half Sleeve', 'Quarter Sleeve'],
          bottom: ['Straight', 'A-Line', 'Asymmetric']
        },
        created_at: new Date().toISOString()
      },
      {
        id: '6',
        name: 'Evening Dress',
        category: 'Dresses',
        base_price: 6500,
        description: 'Elegant evening dress for special occasions. Sophisticated design with premium finishing.',
        image_url: 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg',
        customization_options: {
          neckline: ['Strapless', 'Halter', 'V-Neck', 'Off-Shoulder'],
          length: ['Knee Length', 'Midi', 'Floor Length'],
          fit: ['A-Line', 'Mermaid', 'Straight', 'Ball Gown'],
          back: ['Zipper', 'Lace-up', 'Open Back']
        },
        created_at: new Date().toISOString()
      }
    ]

    const foundGarment = sampleGarments.find(g => g.id === id)
    setGarment(foundGarment || sampleGarments[0])
  }, [id])

  if (!garment) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#C8A951]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/garments" className="inline-flex items-center text-[#C8A951] hover:text-[#B8992E] mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Garments
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <img
                src={garment.image_url}
                alt={garment.name}
                className="w-full h-96 object-cover"
              />
            </Card>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-[#1A1D23]">{garment.name}</h1>
                <span className="bg-[#C8A951] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {garment.category}
                </span>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-2xl font-bold text-[#C8A951]">₹{garment.base_price.toLocaleString()}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">Base Price</span>
              </div>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#1A1D23] mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{garment.description}</p>
            </Card>

            {/* Customization Options */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#1A1D23] mb-4">Customization Options</h3>
              <div className="space-y-4">
                {Object.entries(garment.customization_options || {}).map(([key, options]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-[#1A1D23] mb-2 capitalize">
                      {key.replace('_', ' ')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(options as string[]).map((option) => (
                        <button
                          key={option}
                          className="px-3 py-1 border border-gray-300 rounded-full text-sm hover:border-[#C8A951] hover:text-[#C8A951] transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Delivery Info */}
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-[#C8A951]" />
                  <div>
                    <p className="font-medium text-[#1A1D23]">Stitching Time</p>
                    <p className="text-sm text-gray-600">10-14 days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-[#C8A951]" />
                  <div>
                    <p className="font-medium text-[#1A1D23]">Delivery</p>
                    <p className="text-sm text-gray-600">Free pickup</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link to={`/customize?garment=${garment.id}`} className="block">
                <Button size="lg" className="w-full">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Customize This Garment
                </Button>
              </Link>
              <Link to="/fabrics" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  <Palette className="w-5 h-5 mr-2" />
                  Choose Fabric
                </Button>
              </Link>
            </div>

            {/* Customer Reviews */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#1A1D23] mb-4">Customer Reviews</h3>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#C8A951] fill-current" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-[#1A1D23]">Amit Sharma</span>
                  </div>
                  <p className="text-sm text-gray-700">"Perfect fit and excellent quality. Highly recommended!"</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#C8A951] fill-current" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-[#1A1D23]">Priya Patel</span>
                  </div>
                  <p className="text-sm text-gray-700">"Beautiful craftsmanship and attention to detail."</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}