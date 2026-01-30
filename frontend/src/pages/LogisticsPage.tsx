import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { logisticsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const LogisticsPage = () => {
  const [shipmentDetails, setShipmentDetails] = useState({
    origin: '',
    destination: '',
    weight: 0,
    dimensions: '',
    commodityType: ''
  });

  const { data: logisticsInfo, isLoading: logisticsLoading } = useQuery({
    queryKey: ['logisticsInfo'],
    queryFn: async () => {
      try {
        return await logisticsAPI.getLogisticsInfo();
      } catch (error) {
        console.error('Error fetching logistics info:', error);
        return {
          shippingRates: [],
          portCirculars: [],
          customsRequirements: []
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: (shipmentData: typeof shipmentDetails) => {
      return logisticsAPI.planShipment(shipmentData);
    },
    onSuccess: (data) => {
      console.log('Shipment planned successfully:', data);
    },
    onError: (error) => {
      console.error('Error planning shipment:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(shipmentDetails);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShipmentDetails(prev => ({
      ...prev,
      [name]: name === 'weight' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Logistics & Shipment Planning</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment Planning Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Plan Your Shipment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                      id="origin"
                      name="origin"
                      value={shipmentDetails.origin}
                      onChange={handleChange}
                      placeholder="City or Port"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      name="destination"
                      value={shipmentDetails.destination}
                      onChange={handleChange}
                      placeholder="City or Port"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={shipmentDetails.weight}
                      onChange={handleChange}
                      placeholder="Weight in kg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dimensions">Dimensions (LxWxH cm)</Label>
                    <Input
                      id="dimensions"
                      name="dimensions"
                      value={shipmentDetails.dimensions}
                      onChange={handleChange}
                      placeholder="e.g., 50x40x30"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="commodityType">Commodity Type</Label>
                  <Input
                    id="commodityType"
                    name="commodityType"
                    value={shipmentDetails.commodityType}
                    onChange={handleChange}
                    placeholder="e.g., Electronics, Textiles, Machinery"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 'Planning...' : 'Get Shipping Options'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Logistics Information */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Current Rates</CardTitle>
            </CardHeader>
            <CardContent>
              {logisticsLoading ? (
                <p>Loading shipping rates...</p>
              ) : (
                <div className="space-y-3">
                  {logisticsInfo?.shippingRates?.slice(0, 3).map((rate: any, index: number) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="font-medium">{rate.carrier}</div>
                      <div className="text-sm text-muted-foreground">{rate.route}</div>
                      <div className="flex justify-between mt-1">
                        <span>{rate.transitTime}</span>
                        <span className="font-medium">{rate.currency} {rate.rate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Port Circulars</CardTitle>
            </CardHeader>
            <CardContent>
              {logisticsLoading ? (
                <p>Loading port information...</p>
              ) : (
                <div className="space-y-3">
                  {logisticsInfo?.portCirculars?.slice(0, 3).map((notice: any, index: number) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="font-medium">{notice.port}</div>
                      <div className="text-sm text-muted-foreground">{notice.notice}</div>
                      <Badge variant="secondary" className="mt-2">
                        {notice.effectiveDate}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Shipment Results */}
      {mutation.isSuccess && mutation.data && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Shipping Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mutation.data.options?.map((option: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{option.carrier} - {option.service}</h3>
                        <p className="text-sm text-muted-foreground">{option.route}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{option.currency} {option.estimatedCost}</div>
                        <div className="text-sm">{option.transitTime}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">{option.carbonFootprint} Carbon Footprint</Badge>
                      {option.insuranceIncluded && <Badge variant="outline">Insurance Included</Badge>}
                    </div>
                    <Button className="mt-3 w-full">Select Option</Button>
                  </div>
                ))}
              </div>
              
              {mutation.data.recommendations && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-bold mb-2">Recommendations:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {mutation.data.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LogisticsPage;