import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Package, Clock, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productAPI } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

const GlobalSearchSection = () => {
  const [searchKeyword, setSearchKeyword] = useState('shoes');
  const [locationFilter, setLocationFilter] = useState('all');
  const [moqFilter, setMoqFilter] = useState('any');
  const [leadTimeFilter, setLeadTimeFilter] = useState('any');
  const [currencyFilter, setCurrencyFilter] = useState('USD');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['products', { keyword: searchKeyword, pageNumber: 1 }],
    queryFn: async () => {
      try {
        const filters = {
          keyword: searchKeyword,
          pageNumber: 1,
        };

        const response = await productAPI.getProducts(filters);
        const productsData = Array.isArray(response) ? response : response?.products || response?.data?.products || [];
        return productsData.slice(0, 4) || []; // Limit to 4 for the display
      } catch (error) {
        console.error('Error fetching products:', error);
        // Return mock data in case of error
        return [
          {
            _id: 'mock-1',
            name: "VietTech Manufacturing",
            location: { country: "Vietnam" },
            stock: 500,
            price: 12.50,
            currency: "USD",
            ratings: { average: 4.5 },
            seller: {
              profile: { company: { name: "VietTech Manufacturing" } },
              sellerType: 'manufacturer'
            }
          },
          {
            _id: 'mock-2',
            name: "Turkish Footwear Co.",
            location: { country: "Turkey" },
            stock: 1000,
            price: 11.80,
            currency: "USD",
            ratings: { average: 4.2 },
            seller: {
              profile: { company: { name: "Turkish Footwear Co." } },
              sellerType: 'trader'
            }
          },
          {
            _id: 'mock-3',
            name: "Delhi Shoes Export",
            location: { country: "India" },
            stock: 300,
            price: 10.20,
            currency: "USD",
            ratings: { average: 4.7 },
            seller: {
              profile: { company: { name: "Delhi Shoes Export" } },
              sellerType: 'manufacturer'
            }
          },
          {
            _id: 'mock-4',
            name: "Mexican Leather Works",
            location: { country: "Mexico" },
            stock: 750,
            price: 13.90,
            currency: "USD",
            ratings: { average: 4.3 },
            seller: {
              profile: { company: { name: "Mexican Leather Works" } },
              sellerType: 'manufacturer'
            }
          }
        ];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: false, // Disable automatic refetch, we'll trigger it manually
  });

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?keyword=${encodeURIComponent(searchKeyword)}`);
  };

  const handleInputChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleSearchClick = (keyword) => {
    setSearchKeyword(keyword);
    setTimeout(() => refetch(), 0); // Trigger refetch after state update
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Function to get country flag emoji
  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'Vietnam': '🇻🇳',
      'Turkey': '🇹🇷',
      'India': '🇮🇳',
      'Mexico': '🇲🇽',
      'China': '🇨🇳',
      'USA': '🇺🇸',
      'Germany': '🇩🇪',
      'Japan': '🇯🇵',
      'Brazil': '🇧🇷',
      'South Korea': '🇰🇷',
      'France': '🇫🇷',
      'Italy': '🇮🇹',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'UK': '🇬🇧',
      'Spain': '🇪🇸',
      'Russia': '🇷🇺',
      'Indonesia': '🇮🇩',
      'Thailand': '🇹🇭',
      'Philippines': '🇵🇭',
      'Malaysia': '🇲🇾',
      'Singapore': '🇸🇬',
      'Netherlands': '🇳🇱',
      'Sweden': '🇸🇪',
      'Switzerland': '🇨🇭',
      'Belgium': '🇧🇪',
      'Poland': '🇵🇱',
      'Argentina': '🇦🇷',
      'Chile': '🇨🇱',
      'Peru': '🇵🇪',
      'Colombia': '🇨🇴',
    };

    return flags[country] || '🌍';
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Search smarter.{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Anywhere in the world.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Search by category, filter by location, MOQ, certifications, lead time, and currency.
            Compare suppliers across regions instantly.
          </p>
        </div>

        {/* Search Demo */}
        <div className="max-w-4xl mx-auto mb-12 animate-scale-in">
          <div className="bg-card rounded-2xl p-4 border-2 shadow-xl">
            <form onSubmit={handleSearch} className="flex items-center gap-3 bg-background rounded-xl px-4 py-3 mb-4">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for products... (e.g., Shoes)"
                className="flex-1 bg-transparent border-none outline-none text-lg"
                value={searchKeyword}
                onChange={handleInputChange}
              />
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent" type="submit">
                Search
              </Button>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  locationFilter === 'all'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => {
                  setLocationFilter(locationFilter === 'all' ? 'any' : 'all');
                }}
              >
                <MapPin className="w-3 h-3 inline mr-1" />
                {locationFilter === 'all' ? 'All Locations' : 'Any Location'}
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  moqFilter === 'any'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => {
                  setMoqFilter(moqFilter === 'any' ? '100' : 'any');
                }}
              >
                <Package className="w-3 h-3 inline mr-1" />
                MOQ: {moqFilter === 'any' ? 'Any' : moqFilter}
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  leadTimeFilter === 'any'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => {
                  setLeadTimeFilter(leadTimeFilter === 'any' ? '7' : 'any');
                }}
              >
                <Clock className="w-3 h-3 inline mr-1" />
                Lead Time: {leadTimeFilter === 'any' ? 'Any' : `${leadTimeFilter} days`}
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  currencyFilter === 'USD'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => {
                  setCurrencyFilter(currencyFilter === 'USD' ? 'any' : 'USD');
                }}
              >
                <DollarSign className="w-3 h-3 inline mr-1" />
                Currency: {currencyFilter === 'any' ? 'Any' : currencyFilter}
              </button>
            </div>
          </div>
        </div>

        {/* Supplier Comparison */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
          {isLoading ? (
            [...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 border-2 animate-pulse"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="px-2 py-1 bg-muted rounded text-xs font-medium">
                    ✓ Verified
                  </div>
                </div>

                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>

                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>

                <div className="h-8 bg-muted rounded w-full mt-4"></div>
              </div>
            ))
          ) : (
            products?.map((product: any, index) => (
              <div
                key={product._id}
                className="bg-card rounded-xl p-6 border-2 hover:border-primary transition-all hover:shadow-lg cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">
                    {getCountryFlag(product.location?.country || 'Unknown')}
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <div className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-medium">
                      ✓ Verified
                    </div>
                    <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                      {(product.seller?.sellerType?.charAt(0).toUpperCase() + product.seller?.sellerType?.slice(1)) || 'Seller'}
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1">
                  {product.seller?.profile?.company?.name || product.name}
                </h3>
                <div className="text-sm text-muted-foreground mb-4">
                  {product.location?.country || 'Unknown'}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MOQ:</span>
                    <span className="font-medium">{product.stock || 0} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-bold text-primary">
                      {product.currency} {product.price?.toFixed(2)}/unit
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <span className="font-medium">{product.ratings?.average || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewDetails(product._id)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({
                        ...product,
                        qty: 1
                      });
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <Link to="/products">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              Start Global Search →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GlobalSearchSection;
