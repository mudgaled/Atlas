import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/lib/api';

const SellerRequests = () => {
  const { user } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellerTypes, setSellerTypes] = useState({});

  const setSellerType = (sellerId, type) => {
    setSellerTypes(prev => ({
      ...prev,
      [sellerId]: type
    }));
  };

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        // Get all users with role 'seller' who are not yet verified
        const response = await adminAPI.getUsers({ role: 'seller' });
        const unverifiedSellers = response.users?.filter(seller => seller.role === 'seller' && !seller.verification?.isVerified) || [];
        setSellers(unverifiedSellers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sellers:', error);
        setLoading(false);
      }
    };

    if (user && user.isAdmin) {
      fetchSellers();
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

  if (loading) return <div className="container mx-auto py-12">Loading seller requests...</div>;

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Seller Verification Requests</h1>
        <Button asChild>
          <Link to="/admin/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      
      {sellers.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Pending Seller Requests</h2>
          <p className="text-muted-foreground">All sellers have been verified</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pending Seller Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Name</th>
                    <th className="text-left py-3">Email</th>
                    <th className="text-left py-3">Company</th>
                    <th className="text-left py-3">Date Requested</th>
                    <th className="text-left py-3">Seller Type</th>
                    <th className="text-left py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller) => (
                    <tr key={seller._id} className="border-b">
                      <td className="py-3">{seller.name}</td>
                      <td className="py-3">{seller.email}</td>
                      <td className="py-3">{seller.profile?.company?.name || 'N/A'}</td>
                      <td className="py-3">
                        {seller.verification?.verificationToken ?
                          new Date(seller.verification.verificationToken).toLocaleDateString() :
                          'N/A'}
                      </td>
                      <td className="py-3">
                        <Select
                          onValueChange={(value) => {
                            setSellerType(seller._id, value);
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manufacturer">Manufacturer</SelectItem>
                            <SelectItem value="trader">Trader</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                const selectedType = sellerTypes[seller._id];
                                if (!selectedType) {
                                  alert('Please select a seller type');
                                  return;
                                }
                                await adminAPI.verifyUser(seller._id, selectedType);
                                // Refresh the seller list
                                const response = await adminAPI.getUsers({ role: 'seller' });
                                const unverifiedSellers = response.users?.filter(s => !s.verification?.isVerified) || [];
                                setSellers(unverifiedSellers);
                              } catch (error) {
                                console.error('Error approving seller:', error);
                              }
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={async () => {
                              try {
                                await adminAPI.unverifyUser(seller._id);
                                // Refresh the seller list
                                const response = await adminAPI.getUsers({ role: 'seller' });
                                const unverifiedSellers = response.users?.filter(s => !s.verification?.isVerified) || [];
                                setSellers(unverifiedSellers);
                              } catch (error) {
                                console.error('Error rejecting seller:', error);
                              }
                            }}
                          >
                            Reject
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
      )}
    </div>
  );
};

export default SellerRequests;