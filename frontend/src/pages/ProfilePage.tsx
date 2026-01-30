import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

const ProfilePage = () => {
  const { user, token, updateUserProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profile: {
      phone: '',
      company: {
        name: '',
        registrationNumber: ''
      },
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      taxInfo: {
        taxId: '',
        vatNumber: ''
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        profile: {
          phone: user.profile?.phone || '',
          company: {
            name: user.profile?.company?.name || '',
            registrationNumber: user.profile?.company?.registrationNumber || ''
          },
          address: {
            street: user.profile?.address?.street || '',
            city: user.profile?.address?.city || '',
            state: user.profile?.address?.state || '',
            zipCode: user.profile?.address?.zipCode || '',
            country: user.profile?.address?.country || ''
          },
          taxInfo: {
            taxId: user.profile?.taxInfo?.taxId || '',
            vatNumber: user.profile?.taxInfo?.vatNumber || ''
          }
        }
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileChange = (section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [section]: {
          ...prev.profile[section],
          [field]: value
        }
      }
    }));
  };

  const handleAddressChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        address: {
          ...prev.profile.address,
          [field]: value
        }
      }
    }));
  };

  const handleTaxInfoChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        taxInfo: {
          ...prev.profile.taxInfo,
          [field]: value
        }
      }
    }));
  };

  const handleCompanyChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        company: {
          ...prev.profile.company,
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await updateUserProfile(profileData);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating your profile');
      console.error('Update profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Login to View Profile</h1>
          <p className="text-muted-foreground mb-8">You need to be logged in to access your profile</p>
          <Button onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="container mx-auto py-12">Loading profile...</div>;

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {user.role === 'seller' && (
                    <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      {(user.sellerType?.charAt(0).toUpperCase() + user.sellerType?.slice(1)) || 'Seller'}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user.role === 'seller' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'seller' ? 'Seller' : 'Buyer'}
                  </span>
                  {user.verification?.isVerified && (
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              {message && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                  {message}
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profileData.profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={profileData.profile.company.name}
                        onChange={(e) => handleCompanyChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        value={profileData.profile.company.registrationNumber}
                        onChange={(e) => handleCompanyChange('registrationNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={profileData.profile.address.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={profileData.profile.address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={profileData.profile.address.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                      <Input
                        id="zipCode"
                        value={profileData.profile.address.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={profileData.profile.address.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tax Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taxId">Tax ID</Label>
                      <Input
                        id="taxId"
                        value={profileData.profile.taxInfo.taxId}
                        onChange={(e) => handleTaxInfoChange('taxId', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vatNumber">VAT Number</Label>
                      <Input
                        id="vatNumber"
                        value={profileData.profile.taxInfo.vatNumber}
                        onChange={(e) => handleTaxInfoChange('vatNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;