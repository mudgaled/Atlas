import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/lib/api';
import { productAPI } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

// Extend the Product interface to match the backend response
interface ExtendedProduct {
  ratings: {
    average: number;
    count: number;
  };
  location: {
    port: string;
    city: string;
    state: string;
    country: string;
  };
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  images: string[];
  seller: {
    profile: {
      company: {
        name: string;
      };
    };
    _id: string;
    name: string;
    email: string;
  };
  stock: number;
  isActive: boolean;
  isVerified: boolean;
  tags: string[];
  __v: number;
  createdAt: string;
  updatedAt: string;
}

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const keyword = searchParams.get('keyword') || '';
  const [searchInput, setSearchInput] = useState(keyword);

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products', { keyword }],
    queryFn: async () => {
      const response = await productAPI.getProducts({ keyword, pageNumber: 1 });
      return Array.isArray(response) ? response : response?.products || response?.data?.products || [];
    },
  });

  if (isLoading) return <div>Loading products...</div>;

  if (error) return <div>Error loading products: {(error as Error).message}</div>;

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) {
      params.set('keyword', searchInput);
    }
    navigate(`/products?${params.toString()}`);
  };

  return (
    <div className="container mx-auto pt-24 pb-8"> {/* Increased top padding to account for navbar */}
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      <form onSubmit={handleSearch} className="mb-6 flex">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products..."
          className="flex-1 p-2 border rounded-l"
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-r"
        >
          Search
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.map((product: ExtendedProduct) => (
          <Card key={product._id} className="overflow-hidden flex flex-col">
            <Link to={`/product/${product._id}`}>
              <CardHeader className="p-0 cursor-pointer">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
                )}
              </CardHeader>
            </Link>
            <CardContent className="p-4 flex-grow">
              <Link to={`/product/${product._id}`}>
                <CardTitle className="text-lg cursor-pointer hover:text-primary">{product.name}</CardTitle>
              </Link>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="mr-2">
                  {product.currency} {product.price.toLocaleString()}
                </Badge>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm">{product.ratings.average.toFixed(1)}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span>{product.seller.name} • {product.location.city}, {product.location.country}</span>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {(product.seller.sellerType?.charAt(0).toUpperCase() + product.seller.sellerType?.slice(1)) || 'Seller'}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="p-4">
              <Button
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigating to product detail page
                  addToCart({
                    ...product,
                    qty: 1
                  });
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;