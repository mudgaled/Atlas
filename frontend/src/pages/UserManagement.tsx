import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/lib/api';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSellerTypes, setUserSellerTypes] = useState({});

  const setUserSellerType = (userId, type) => {
    setUserSellerTypes(prev => ({
      ...prev,
      [userId]: type
    }));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get all users
        const response = await adminAPI.getUsers();
        setUsers(response.users || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    if (user && user.isAdmin) {
      fetchUsers();
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

  if (loading) return <div className="container mx-auto py-12">Loading users...</div>;

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button asChild>
          <Link to="/admin/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Name</th>
                  <th className="text-left py-3">Email</th>
                  <th className="text-left py-3">Role</th>
                  <th className="text-left py-3">Verified</th>
                  <th className="text-left py-3">Seller Type</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b">
                    <td className="py-3">{user.name}</td>
                    <td className="py-3">{user.email}</td>
                    <td className="py-3">
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'seller' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {user.verification?.isVerified ? (
                        <Badge variant="default">Verified</Badge>
                      ) : (
                        <Badge variant="destructive">Not Verified</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      {user.role === 'seller' && user.verification?.isVerified ? (
                        <Badge variant={user.sellerType === 'merchant' ? 'secondary' : 'outline'}>
                          {user.sellerType || 'N/A'}
                        </Badge>
                      ) : (
                        <Badge variant="outline">N/A</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/users/${user._id}/edit`}>Edit</Link>
                        </Button>
                        {user.role === 'seller' && !user.verification?.isVerified ? (
                          <div className="flex gap-2 items-center">
                            <Select
                              onValueChange={(value) => {
                                // Store the selected seller type in state for this user
                                setUserSellerType(user._id, value);
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const selectedType = userSellerTypes[user._id];
                                  if (!selectedType) {
                                    alert('Please select a seller type');
                                    return;
                                  }
                                  await adminAPI.verifyUser(user._id, selectedType);
                                  // Refresh the user list
                                  const response = await adminAPI.getUsers();
                                  setUsers(response.users || []);
                                } catch (error) {
                                  console.error('Error verifying user:', error);
                                }
                              }}
                            >
                              Verify
                            </Button>
                          </div>
                        ) : user.role === 'seller' && user.verification?.isVerified ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await adminAPI.unverifyUser(user._id);
                                // Refresh the user list
                                const response = await adminAPI.getUsers();
                                setUsers(response.users || []);
                              } catch (error) {
                                console.error('Error unverifying user:', error);
                              }
                            }}
                          >
                            Unverify
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            N/A
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={async () => {
                            await adminAPI.deleteUser(user._id);
                            // Refresh the user list
                            const response = await adminAPI.getUsers();
                            setUsers(response.users || []);
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

export default UserManagement;