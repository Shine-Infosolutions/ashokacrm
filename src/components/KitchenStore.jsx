import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { showToast } from '../utils/toaster';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';

const KitchenStore = () => {
  const { axios } = useAppContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: '',
    category: ''
  });

  useEffect(() => {
    fetchItems();
    
    // Auto-refresh every 30 seconds to show updated inventory
    const interval = setInterval(() => {
      fetchItems();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/kitchen-store/items', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const itemsData = response.data;
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      console.log('Items fetch failed:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        await axios.put(`/api/kitchen-store/items/${editingItem._id}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        showToast.success('Item updated successfully');
      } else {
        await axios.post('/api/kitchen-store/items', formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        showToast.success('Item added successfully');
      }
      resetForm();
      fetchItems();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity || 0,
      unit: item.unit,
      category: item.category
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/api/kitchen-store/items/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      showToast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      showToast.error('Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      quantity: '', 
      unit: '', 
      category: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text">Kitchen Store Inventory</h1>
        <div className="flex gap-2">
          {/* <button
            onClick={fetchItems}
            className="bg-secondary text-text px-4 py-2 rounded-lg hover:bg-hover flex items-center gap-2 shadow-lg transition-all duration-200"
          >
            <Package size={20} />
            Refresh
          </button> */}
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-text px-4 py-2 rounded-lg hover:bg-hover flex items-center gap-2 shadow-lg transition-all duration-200"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-xl border border-border">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-text">Loading items...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-text">
                      No items found. Add your first item.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id} className="hover:bg-background transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                        {item.quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-primary hover:text-hover"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-border w-full max-w-md">
            <div className="p-6 bg-background rounded-t-lg">
              <h2 className="text-xl font-bold mb-4 text-text">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Item Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="kg, pcs, liters, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Vegetables, Spices, etc."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-border rounded-md text-text hover:bg-background transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-text rounded-md hover:bg-hover disabled:opacity-50 transition-all duration-200"
                  >
                    {loading ? 'Saving...' : editingItem ? 'Update' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenStore;