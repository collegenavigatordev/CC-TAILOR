import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Eye, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Garment } from '../types'

export function Garments() {
  const [garments, setGarments] = useState<Garment[]>([])
  const [filteredGarments, setFilteredGarments] = useState<Garment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchGarments()
  }, [])

  useEffect(() => {
    filterGarments()
  }, [garments, searchTerm, selectedCategory])

  const fetchGarments = async () => {
    try {
      const { data, error } = await supabase
        .from('garments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setGarments(data || [])
    } catch (error) {
      console.error('Error fetching garments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterGarments = () => {
    let filtered = garments

    if (searchTerm) {
      filtered = filtered.filter(garment =>
        garment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        garment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        garment.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(garment => garment.category === selectedCategory)
    }

    setFilteredGarments(filtered)
  }

  const categories = [...new Set(garments.map(g => g.category))]

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
          <h1 className="text-4xl font-bold text-[#1A1D23] mb-4">Garment Collection</h1>
          <p className="text-gray-600 text-lg">Choose from our wide range of garment styles</p>
        </motion.div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search garments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Garment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGarments.map((garment, index) => (
            <motion.div
              key={garment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card hover className="overflow-hidden group">
                <div className="relative">
                  <img
                    src={garment.image_url}
                    alt={garment.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-[#C8A951] text-white px-3 py-1 rounded-full text-sm font-medium">
                    {garment.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-[#1A1D23]">{garment.name}</h3>
                    <span className="text-[#C8A951] font-bold">₹{garment.base_price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{garment.description}</p>
                  <div className="flex space-x-2">
                    <Link to={`/garment/${garment.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    <Link to={`/customize?garment=${garment.id}`}>
                      <Button>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Customize
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredGarments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No garments found matching your criteria.</p>
            <Button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
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