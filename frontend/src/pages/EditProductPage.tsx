import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { productAPI } from '@/lib/api';

const EditProductPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'port-services',
    price: '',
    currency: 'USD',
    images: [],
    stock: 0,
    specifications: {},
    location: {
      port: '',
      city: '',
      state: '',
      country: ''
    },
    tags: [],
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productLoading, setProductLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = await productAPI.getProductById(id);
        setFormData({
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price.toString(),
          currency: product.currency,
          images: product.images || [],
          stock: product.stock,
          specifications: product.specifications || {},
          location: product.location || {
            port: '',
            city: '',
            state: '',
            country: ''
          },
          tags: product.tags || [],
          isActive: product.isActive
        });
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching the product');
        console.error('Fetch product error:', err);
      } finally {
        setProductLoading(false);
      }
    };

    if (user && user.isSeller) {
      fetchProduct();
    }
  }, [id, user]);

  if (!user) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Login to Edit Products</h1>
          <p className="text-muted-foreground mb-8">You need to be logged in as a seller to edit products</p>
          <Button onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (!user.isSeller) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Seller Access Required</h1>
          <p className="text-muted-foreground mb-8">You need to be a verified seller to edit products</p>
          <Button asChild>
            <a href="/">Go to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  if (productLoading) return <div className="container mx-auto py-12">Loading product...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        tags: formData.tags.filter(tag => tag.trim() !== '')
      };

      // Update product
      await productAPI.updateProduct(id, productData);

      // Redirect to seller products page
      navigate('/seller-products');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating the product');
      console.error('Update product error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select name="category" value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="port-services">Port Services</SelectItem>
                    <SelectItem value="customs-clearance">Customs Clearance</SelectItem>
                    <SelectItem value="container-handling">Container Handling</SelectItem>
                    <SelectItem value="freight-forwarding">Freight Forwarding</SelectItem>
                    <SelectItem value="warehousing">Warehousing</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="currency">Currency *</Label>
                <Select name="currency" value={formData.currency} onValueChange={(value) => setFormData(prev => ({...prev, currency: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({...prev, tags: e.target.value.split(',')}))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="images">Product Images</Label>
              <div className="space-y-2">
                <Textarea
                  id="images"
                  value={formData.images.join(', ')}
                  onChange={(e) => setFormData(prev => ({...prev, images: e.target.value.split(',').map(url => url.trim()).filter(u => u !== '')}))}
                />
                <div className="text-sm text-muted-foreground">
                  Enter full URLs to product images (e.g., https://example.com/image1.jpg)
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    value={formData.location.port}
                    onChange={(e) => handleLocationChange('port', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.location.city}
                    onChange={(e) => handleLocationChange('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.location.state}
                    onChange={(e) => handleLocationChange('state', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.location.country}
                    onChange={(e) => handleLocationChange('country', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({...prev, isActive: e.target.checked}))}
                className="mr-2"
              />
              <Label htmlFor="isActive">Product is active</Label>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/seller-products')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating Product...' : 'Update Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProductPage;