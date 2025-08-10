import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit, Eye, Palette, Star, X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { supabase } from '../../lib/supabase'
import { Fabric } from '../../types'

export function AdminFabrics() {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [filteredFabrics, setFilteredFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [materialFilter, setMaterialFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingFabric, setEditingFabric] = useState<Fabric | null>(null)
  const [newFabric, setNewFabric] = useState({
    name: '',
    material: '',
    price_per_meter: 0,
    color: '',
    stock: 0,
    description: '',
    featured: false,
    images_json: ['']
  })

  useEffect(() => {
    fetchFabrics()
  }, [])

  useEffect(() => {
    filterFabrics()
  }, [fabrics, searchTerm, materialFilter])

  const fetchFabrics = async () => {
    try {
      const { data, error } = await supabase
        .from('fabrics')
        .select('*')
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

    if (materialFilter !== 'all') {
      filtered = filtered.filter(fabric => fabric.material === materialFilter)
    }

    setFilteredFabrics(filtered)
  }

  const materials = [...new Set(fabrics.map(f => f.material))]

  const toggleFeatured = async (fabricId: string) => {
    try {
      const fabric = fabrics.find(f => f.id === fabricId)
      if (!fabric) return

      const { error } = await supabase
        .from('fabrics')
        .update({ featured: !fabric.featured })
        .eq('id', fabricId)

      if (error) throw error

      setFabrics(fabrics.map(f => 
        f.id === fabricId 
          ? { ...f, featured: !f.featured }
          : f
      ))
    } catch (error) {
      console.error('Error updating fabric:', error)
    }
  }

  const handleAddFabric = async () => {
    try {
      if (!newFabric.name || !newFabric.material || !newFabric.color) {
        alert('Please fill in all required fields')
        return
      }

      const { data, error } = await supabase
        .from('fabrics')
        .insert({
          name: newFabric.name,
          material: newFabric.material,
          price_per_meter: newFabric.price_per_meter,
          color: newFabric.color,
          stock: newFabric.stock,
          description: newFabric.description,
          featured: newFabric.featured,
          images_json: newFabric.images_json.filter(img => img.trim() !== '')
        })
        .select()
        .single()

      if (error) throw error

      setFabrics([data, ...fabrics])
      setIsAddModalOpen(false)
      setNewFabric({
        name: '',
        material: '',
        price_per_meter: 0,
        color: '',
        stock: 0,
        description: '',
        featured: false,
        images_json: ['']
      })
    } catch (error) {
      console.error('Error adding fabric:', error)
      alert('Error adding fabric. Please try again.')
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
          <h1 className="text-3xl font-bold text-[#1A1D23]">Fabric Management</h1>
          <p className="text-gray-600 mt-1">Manage fabric inventory and pricing</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          <span onClick={() => setIsAddModalOpen(true)}>Add New Fabric</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
          >
            <option value="all">All Materials</option>
            {materials.map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Fabric Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fabrics</p>
              <p className="text-2xl font-bold text-[#1A1D23] mt-1">{fabrics.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <Palette className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-[#1A1D23] mt-1">
                {fabrics.filter(f => f.featured).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-[#C8A951] bg-opacity-10">
              <Star className="w-6 h-6 text-[#C8A951]" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stock</p>
              <p className="text-2xl font-bold text-[#1A1D23] mt-1">
                {fabrics.reduce((sum, f) => sum + f.stock, 0)} m
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <Palette className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Price</p>
              <p className="text-2xl font-bold text-[#1A1D23] mt-1">
                ₹{Math.round(fabrics.reduce((sum, f) => sum + f.price_per_meter, 0) / fabrics.length)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-50">
              <Palette className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Fabrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFabrics.map((fabric, index) => (
          <motion.div
            key={fabric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={fabric.images_json[0]}
                  alt={fabric.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 flex space-x-2">
                  {fabric.featured && (
                    <span className="bg-[#C8A951] text-white px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  )}
                  <span className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                    {fabric.stock} meters
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-[#1A1D23]">{fabric.name}</h3>
                  <span className="text-[#C8A951] font-bold">₹{fabric.price_per_meter}/m</span>
                </div>
                <div className="flex items-center space-x-4 mb-3">
                  <span className="text-sm text-gray-600">{fabric.material}</span>
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-600">{fabric.color}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{fabric.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className={`text-sm font-medium ${
                      fabric.stock > 20 ? 'text-green-600' : 
                      fabric.stock > 10 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {fabric.stock} meters
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFeatured(fabric.id)}
                    className={`p-1 rounded ${
                      fabric.featured ? 'text-[#C8A951]' : 'text-gray-400'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${fabric.featured ? 'fill-current' : ''}`} />
                  </button>
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

      {filteredFabrics.length === 0 && (
        <Card className="p-12 text-center">
          <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No fabrics found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </Card>
      )}

      {/* Add Fabric Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Fabric"
      >
        <div className="space-y-4">
          <Input
            label="Fabric Name *"
            value={newFabric.name}
            onChange={(e) => setNewFabric({...newFabric, name: e.target.value})}
            placeholder="Enter fabric name"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Material *"
              value={newFabric.material}
              onChange={(e) => setNewFabric({...newFabric, material: e.target.value})}
              placeholder="e.g., Silk, Cotton, Wool"
            />
            <Input
              label="Color *"
              value={newFabric.color}
              onChange={(e) => setNewFabric({...newFabric, color: e.target.value})}
              placeholder="e.g., Golden, Navy Blue"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price per Meter (₹)"
              type="number"
              value={newFabric.price_per_meter}
              onChange={(e) => setNewFabric({...newFabric, price_per_meter: parseInt(e.target.value) || 0})}
              placeholder="0"
            />
            <Input
              label="Stock (meters)"
              type="number"
              value={newFabric.stock}
              onChange={(e) => setNewFabric({...newFabric, stock: parseInt(e.target.value) || 0})}
              placeholder="0"
            />
          </div>
          <Input
            label="Image URL"
            value={newFabric.images_json[0]}
            onChange={(e) => setNewFabric({...newFabric, images_json: [e.target.value]})}
            placeholder="https://example.com/image.jpg"
          />
          <div>
            <label className="block text-sm font-medium text-[#1A1D23] mb-2">
              Description
            </label>
            <textarea
              value={newFabric.description}
              onChange={(e) => setNewFabric({...newFabric, description: e.target.value})}
              placeholder="Describe the fabric..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
              rows={3}
            />
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newFabric.featured}
              onChange={(e) => setNewFabric({...newFabric, featured: e.target.checked})}
              className="rounded border-gray-300 text-[#C8A951] focus:ring-[#C8A951]"
            />
            <span className="text-sm text-[#1A1D23]">Featured fabric</span>
          </label>
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleAddFabric} className="flex-1">
              Add Fabric
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