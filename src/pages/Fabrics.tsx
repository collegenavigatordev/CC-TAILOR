import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Eye, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { supabase } from '../lib/supabase'
import { Fabric } from '../types'

export function Fabrics() {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [filteredFabrics, setFilteredFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState('all')
  const [selectedColor, setSelectedColor] = useState('all')
  const [priceRange, setPriceRange] = useState('all')

  useEffect(() => {
    fetchFabrics()
  }, [])

  useEffect(() => {
    filterFabrics()
  }, [fabrics, searchTerm, selectedMaterial, selectedColor, priceRange])

  const fetchFabrics = async () => {
    try {
      const { data, error } = await supabase
        .from('fabrics')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setFabrics(data || [])
    } catch (error) {
      console.error('Error fetching fabrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterFabrics = () => {
    let filtered = fabrics

    if (searchTerm) {
      filtered = filtered.filter(fabric =>
        fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fabric.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fabric.color.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(fabric => fabric.material === selectedMaterial)
    }

    if (selectedColor !== 'all') {
      filtered = filtered.filter(fabric => fabric.color === selectedColor)
    }

    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number)
      filtered = filtered.filter(fabric => {
        if (max) {
          return fabric.price_per_meter >= min && fabric.price_per_meter <= max
        } else {
          return fabric.price_per_meter >= min
        }
      })
    }

    setFilteredFabrics(filtered)
  }

  const materials = [...new Set(fabrics.map(f => f.material))]
  const colors = [...new Set(fabrics.map(f => f.color))]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#C8A951]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-[#1A1D23] mb-4">Premium Fabric Collection</h1>
          <p className="text-gray-600 text-lg">Discover our carefully curated selection of finest fabrics</p>
        </motion.div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search fabrics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
            >
              <option value="all">All Materials</option>
              {materials.map(material => (
                <option key={material} value={material}>{material}</option>
              ))}
            </select>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
            >
              <option value="all">All Colors</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
            >
              <option value="all">All Prices</option>
              <option value="0-2000">Under ₹2,000</option>
              <option value="2000-3000">₹2,000 - ₹3,000</option>
              <option value="3000-4000">₹3,000 - ₹4,000</option>
              <option value="4000">Above ₹4,000</option>
            </select>
          </div>
        </Card>

        {/* Fabric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFabrics.map((fabric, index) => (
            <motion.div
              key={fabric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card hover className="overflow-hidden group">
                <div className="relative">
                  <img
                    src={fabric.images_json[0]}
                    alt={fabric.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {fabric.featured && (
                    <div className="absolute top-4 left-4 bg-[#C8A951] text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded-full text-sm font-medium">
                    {fabric.stock} meters
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-[#1A1D23]">{fabric.name}</h3>
                    <span className="text-[#C8A951] font-bold">₹{fabric.price_per_meter}/m</span>
                  </div>
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="text-sm text-gray-600">{fabric.material}</span>
                    <span className="text-sm text-gray-600">•</span>
                    <span className="text-sm text-gray-600">{fabric.color}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{fabric.description}</p>
                  <div className="flex space-x-2">
                    <Link to={`/fabric/${fabric.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    <Link to={`/customize?fabric=${fabric.id}`}>
                      <Button>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Select
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredFabrics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No fabrics found matching your criteria.</p>
            <Button
              onClick={() => {
                setSearchTerm('')
                setSelectedMaterial('all')
                setSelectedColor('all')
                setPriceRange('all')
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}