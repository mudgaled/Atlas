import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, DollarSign } from 'lucide-react';
import { productAPI } from '@/lib/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getProductById(id);
        // Handle the API response structure - the API returns the product directly
        setProduct(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, qty: quantity });
      navigate('/cart');
    }
  };

  if (loading) return <div className="container mx-auto pt-24 pb-12">Loading product...</div>;
  if (error) return <div className="container mx-auto pt-24 pb-12">Error: {error}</div>;
  if (!product) return <div className="container mx-auto pt-24 pb-12">Product not found</div>;

  return (
    <div className="container mx-auto pt-24 pb-12"> {/* Increased top padding to account for navbar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="bg-muted rounded-xl p-4 aspect-square flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                <span>No image available</span>
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {product.images.slice(0, 4).map((img, index) => (
                <div 
                  key={index} 
                  className="w-16 h-16 bg-muted rounded cursor-pointer border-2 border-transparent hover:border-primary"
                >
                  <img 
                    src={img} 
                    alt={`${product.name} thumbnail ${index + 1}`} 
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1">{product.ratings?.average?.toFixed(1) || 'N/A'}</span>
                </div>
                <span className="text-muted-foreground">({product.ratings?.count || 0} reviews)</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg py-1 px-3">
              ${product.price?.toFixed(2)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <MapPin className="h-4 w-4" />
            <span>{product.location?.city}, {product.location?.country}</span>
          </div>
          
          <p className="text-lg text-muted-foreground mb-8">{product.description}</p>
          
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Specifications</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Category</span>
                <span>{product.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Stock</span>
                <span>{product.stock}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Currency</span>
                <span>{product.currency}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Tags</span>
                <span>{product.tags?.join(', ') || 'None'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border rounded">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="rounded-r-none"
              >
                -
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="rounded-l-none"
              >
                +
              </Button>
            </div>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-6">
            <h3 className="font-semibold mb-3">Supplier Information</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-semibold">{product.seller?.name?.charAt(0)}</span>
              </div>
              <div>
                <div className="font-medium">{product.seller?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {product.seller?.profile?.company?.name || 'Company Name'}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant="outline">Verified</Badge>
                <Badge variant="secondary">{(product.seller?.sellerType?.charAt(0).toUpperCase() + product.seller?.sellerType?.slice(1)) || 'Seller'}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Placeholder for related products */}
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="overflow-hidden">
              <div className="bg-muted h-48 flex items-center justify-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">Related Product {item}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold">$99.99</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm ml-1">4.5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;