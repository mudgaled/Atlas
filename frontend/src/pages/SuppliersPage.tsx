import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supplierAPI } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Globe, MapPin, Star } from 'lucide-react';

const SuppliersPage = () => {
  const [filters, setFilters] = useState({
    keyword: '',
    country: '',
    page: 1
  });

  const { data: suppliersData, isLoading, error, refetch } = useQuery({
    queryKey: ['suppliers', filters],
    queryFn: async () => {
      const params = {
        keyword: filters.keyword || undefined,
        country: filters.country || undefined,
        pageNumber: filters.page
      };
      return await supplierAPI.getSuppliers(params);
    },
  });

  const suppliers = suppliersData?.suppliers || [];
  const totalPages = suppliersData?.pages || 1;
  const currentPage = suppliersData?.page || 1;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  if (isLoading) return <div className="container mx-auto py-8">Loading suppliers...</div>;
  
  if (error) return <div className="container mx-auto py-8">Error loading suppliers: {(error as Error).message}</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Verified Suppliers</h1>
      
      {/* Filters */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              placeholder="Search suppliers..."
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Countries</option>
              <option value="India">India</option>
              <option value="China">China</option>
              <option value="USA">USA</option>
              <option value="Germany">Germany</option>
              <option value="Japan">Japan</option>
              {/* Add more countries as needed */}
            </select>
          </div>
          
          <div className="flex items-end">
            <Button onClick={() => refetch()}>Apply Filters</Button>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier: any) => (
          <Card key={supplier._id} className="overflow-hidden flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{supplier.profile?.company?.name || supplier.name}</CardTitle>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                  <Badge variant="outline" className="mt-1">
                    {supplier.sellerType?.charAt(0).toUpperCase() + supplier.sellerType?.slice(1) || 'Seller'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Globe className="h-4 w-4 mr-1" />
                {supplier.profile?.address?.city}, {supplier.profile?.address?.country}
              </div>
            </CardHeader>
            
            <CardContent className="pb-3 flex-grow">
              <div className="flex items-center mb-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="text-sm">4.8 (128 reviews)</span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {supplier.profile?.address?.city}, {supplier.profile?.address?.country}
              </div>
              
              <div className="text-sm">
                <p className="truncate">Specializes in manufacturing and export</p>
              </div>
            </CardContent>
            
            <CardFooter className="p-4">
              <Button className="w-full">View Profile</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;