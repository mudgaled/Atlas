import { Button } from "@/components/ui/button";
import { Anchor, TrendingDown, MapPin } from "lucide-react";
import logisticsImage from "@/assets/logistics-dashboard.jpg";
import { useQuery } from "@tanstack/react-query";
import { logisticsAPI } from "@/lib/api";
import { Link } from "react-router-dom";

const LogisticsSection = () => {
  const { data: logisticsInfo, isLoading } = useQuery({
    queryKey: ['logisticsInfo'],
    queryFn: async () => {
      try {
        return await logisticsAPI.getLogisticsInfo();
      } catch (error) {
        console.error('Error fetching logistics info:', error);
        // Return mock data in case of error
        return {
          shippingRates: [
            { carrier: 'Maersk', route: 'Singapore to LA', transitTime: '14 days', rate: 2500, currency: 'USD' },
            { carrier: 'CMA CGM', route: 'Rotterdam to NY', transitTime: '12 days', rate: 2200, currency: 'USD' },
          ],
          portCirculars: [],
          customsRequirements: []
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            The world's ports,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              at your fingertips
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We track shipping rates, port circulars, and customs requirements globally.
            Your cargo takes the cheapest, fastest route, every time.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Dashboard Preview */}
          <div className="animate-slide-in-left">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2">
              <img
                src={logisticsImage}
                alt="Global logistics dashboard showing shipping routes and port tracking"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

              {/* Floating Stats */}
              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-4">
                <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-green-500">
                    {isLoading ? '...' : `$${logisticsInfo?.shippingRates?.[0]?.rate || '0'}`}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg. Rate Saved</div>
                </div>
                <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-primary">
                    {isLoading ? '...' : logisticsInfo?.shippingRates?.[0]?.transitTime || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Faster Delivery</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6 animate-slide-in-right">
            <div className="bg-card rounded-xl p-6 border-2 hover:border-primary transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Anchor className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Smart Port Selection</h3>
                  <p className="text-muted-foreground">
                    Compare ports in real-time. Choose Singapore over Hong Kong and save thousands on your next shipment.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border-2 hover:border-primary transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Live Rate Tracking</h3>
                  <p className="text-muted-foreground">
                    Monitor shipping rates across carriers. Get alerts when rates drop for your preferred routes.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border-2 hover:border-primary transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Customs Intelligence</h3>
                  <p className="text-muted-foreground">
                    Stay updated on port circulars, customs regulations, and documentation requirements for every destination.
                  </p>
                </div>
              </div>
            </div>

            <Link to="/logistics">
              <Button size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                Plan My Shipment →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogisticsSection;
