import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/lib/api';

const ProductManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await adminAPI.getProducts();
        setProducts(response.products || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    if (user && user.isAdmin) {
      fetchProducts();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Login to Access Admin Dashboard</h1>
          <p className="text-muted-foreground mb-8">You need to be logged in as an admin to access this page</p>
          <Button onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-muted-foreground mb-8">You need to be an admin to access this page</p>
          <Button asChild>
            <Link to="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="container mx-auto py-12">Loading products...</div>;

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Button asChild>
          <Link to="/admin/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Product</th>
                  <th className="text-left py-3">Seller</th>
                  <th className="text-left py-3">Category</th>
                  <th className="text-left py-3">Price</th>
                  <th className="text-left py-3">Stock</th>
                  <th className="text-left py-3">Verified</th>
                  <th className="text-left py-3">Active</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b">
                    <td className="py-3">{product.name}</td>
                    <td className="py-3">{product.seller}</td>
                    <td className="py-3">
                      <Badge variant="outline">{product.category}</Badge>
                    </td>
                    <td className="py-3">${product.price}</td>
                    <td className="py-3">{product.stock}</td>
                    <td className="py-3">
                      {product.isVerified ? (
                        <Badge variant="default">Verified</Badge>
                      ) : (
                        <Badge variant="destructive">Not Verified</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      {product.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              if (product.isVerified) {
                                await adminAPI.unverifyProduct(product._id);
                              } else {
                                await adminAPI.verifyProduct(product._id);
                              }
                              // Refresh the product list
                              const response = await adminAPI.getProducts();
                              setProducts(response.products || []);
                            } catch (error) {
                              console.error('Error updating product verification:', error);
                            }
                          }}
                        >
                          {product.isVerified ? 'Unverify' : 'Verify'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={async () => {
                            await adminAPI.deleteProduct(product._id);
                            // Refresh the product list
                            const response = await adminAPI.getProducts();
                            setProducts(response.products || []);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagement;