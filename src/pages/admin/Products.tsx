import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit, Eye, Package, X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { supabase } from '../../lib/supabase'
import { Garment } from '../../types'

export function AdminProducts() {
  const [garments, setGarments] = useState<Garment[]>([])
  const [filteredGarments, setFilteredGarments] = useState<Garment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newGarment, setNewGarment] = useState({
    name: '',
    category: '',
    base_price: 0,
    description: '',
    image_url: '',
    customization_options: {}
  })

  useEffect(() => {
    fetchGarments()
  }, [])

  useEffect(() => {
    filterGarments()
  }, [garments, searchTerm, categoryFilter])

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
        garment.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(garment => garment.category === categoryFilter)
    }

    setFilteredGarments(filtered)
  }

  const categories = [...new Set(garments.map(g => g.category))]

  const handleAddGarment = async () => {
    try {
      if (!newGarment.name || !newGarment.category) {
        alert('Please fill in all required fields')
        return
      }

      const { data, error } = await supabase
        .from('garments')
        .insert({
          name: newGarment.name,
          category: newGarment.category,
          base_price: newGarment.base_price,
          description: newGarment.description,
          image_url: newGarment.image_url,
          customization_options: newGarment.customization_options
        })
        .select()
        .single()

      if (error) throw error

      setGarments([data, ...garments])
      setIsAddModalOpen(false)
      setNewGarment({
        name: '',
        category: '',
        base_price: 0,
        description: '',
        image_url: '',
        customization_options: {}
      })
    } catch (error) {
      console.error('Error adding garment:', error)
      alert('Error adding garment. Please try again.')
    }
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
          <h1 className="text-3xl font-bold text-[#1A1D23]">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage garment types and customization options</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-[#1A1D23] mt-1">{garments.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        {categories.slice(0, 3).map(category => (
          <Card key={category} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{category}</p>
                <p className="text-2xl font-bold text-[#1A1D23] mt-1">
                  {garments.filter(g => g.category === category).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-[#C8A951] bg-opacity-10">
                <Package className="w-6 h-6 text-[#C8A951]" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGarments.map((garment, index) => (
          <motion.div
            key={garment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={garment.image_url}
                  alt={garment.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-[#C8A951] text-white px-2 py-1 rounded-full text-sm font-medium">
                  {garment.category}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-[#1A1D23]">{garment.name}</h3>
                  <span className="text-[#C8A951] font-bold">₹{garment.base_price.toLocaleString()}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{garment.description}</p>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Customization Options:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(garment.customization_options || {}).slice(0, 3).map(option => (
                      <span key={option} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {option}
                      </span>
                    ))}
                    {Object.keys(garment.customization_options || {}).length > 3 && (
                      <span className="text-gray-500 text-xs px-2 py-1">
                        +{Object.keys(garment.customization_options || {}).length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredGarments.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </Card>
      )}

      {/* Add Garment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Garment"
      >
        <div className="space-y-4">
          <Input
            label="Garment Name *"
            value={newGarment.name}
            onChange={(e) => setNewGarment({...newGarment, name: e.target.value})}
            placeholder="Enter garment name"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category *"
              value={newGarment.category}
              onChange={(e) => setNewGarment({...newGarment, category: e.target.value})}
              placeholder="e.g., Shirts, Suits, Kurtas"
            />
            <Input
              label="Base Price (₹)"
              type="number"
              value={newGarment.base_price}
              onChange={(e) => setNewGarment({...newGarment, base_price: parseInt(e.target.value) || 0})}
              placeholder="0"
            />
          </div>
          <Input
            label="Image URL"
            value={newGarment.image_url}
            onChange={(e) => setNewGarment({...newGarment, image_url: e.target.value})}
            placeholder="https://example.com/image.jpg"
          />
          <div>
            <label className="block text-sm font-medium text-[#1A1D23] mb-2">
              Description
            </label>
            <textarea
              value={newGarment.description}
              onChange={(e) => setNewGarment({...newGarment, description: e.target.value})}
              placeholder="Describe the garment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
              rows={3}
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleAddGarment} className="flex-1">
              Add Garment
            </Button>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}