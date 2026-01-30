import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { productAPI } from '@/lib/api';
import { Link } from 'react-router-dom';

const SellerProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getMyProducts();
        // Handle the API response structure - it might be wrapped in a data object
        const data = Array.isArray(response) ? response : response?.products || response?.data || [];
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.isSeller) {
      fetchProducts();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Login to Manage Products</h1>
          <p className="text-muted-foreground mb-8">You need to be logged in as a seller to access this page</p>
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
          <p className="text-muted-foreground mb-8">You need to be a verified seller to access this page</p>
          <Button asChild>
            <Link to="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="container mx-auto py-12">Loading products...</div>;
  if (error) return <div className="container mx-auto py-12">Error: {error}</div>;

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Button asChild>
          <Link to="/add-product">Add New Product</Link>
        </Button>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
          <p className="text-muted-foreground mb-6">You haven't added any products yet</p>
          <Button asChild>
            <Link to="/add-product">Add Your First Product</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product._id}>
              <div className="bg-muted h-48 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                    <span>No image</span>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">${product.price}</span>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{product.stock} in stock</span>
                  <span>{product.currency}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/edit-product/${product._id}`}>Edit</Link>
                </Button>
                <Button variant="outline" size="sm">View</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProducts;