import { Badge, CheckCircle, Globe, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import verifiedIcon from "@/assets/verified-icon.jpg";
import { useQuery } from "@tanstack/react-query";
import { supplierAPI } from "@/lib/api";
import { Link } from "react-router-dom";

const VerifiedPartnersSection = () => {
  const languages = ["English", "Spanish", "Hindi", "Mandarin", "Arabic", "Portuguese"];

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      try {
        const response = await supplierAPI.getSuppliers({ pageNumber: 1 });
        return response.suppliers.slice(0, 1); // Just get the first supplier for the demo card
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        // Return mock data in case of error
        return [{
          _id: 'mock-supplier',
          name: 'TechManu Industries',
          profile: {
            company: { name: 'TechManu Industries' },
            address: { city: 'São Paulo', country: 'Brazil' }
          },
          verification: {
            isVerified: true
          },
          role: 'seller'
        }];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const supplier = suppliers?.[0] || null;

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Trust, no matter the{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              country.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every supplier goes through rigorous checks — licenses, raw material audits, factory videos.
            Manufacturers and traders are clearly tagged. Buyers see the truth upfront, not after shipping.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Verification Visual */}
          <div className="animate-slide-in-left">
            <div className="relative">
              <img
                src={verifiedIcon}
                alt="Verified supplier certification badges and trust indicators"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-card p-4 rounded-xl shadow-lg border animate-float">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">100% Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Card - Dynamic */}
          <div className="animate-slide-in-right">
            {isLoading ? (
              <div className="bg-card rounded-2xl p-6 border-2 shadow-xl space-y-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 bg-muted rounded w-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-6 border-2 shadow-xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">
                      {supplier?.profile?.company?.name || supplier?.name || 'Loading...'}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <span>
                        {supplier?.profile?.address?.city}, {supplier?.profile?.address?.country}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1">
                      <Badge className="w-4 h-4" />
                      {supplier?.sellerType?.charAt(0).toUpperCase() + supplier?.sellerType?.slice(1) || 'Seller'}
                    </div>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Available in multiple languages:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        className="px-3 py-1 bg-muted hover:bg-accent hover:text-accent-foreground rounded-full text-sm transition-colors"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Factory Video */}
                <div className="bg-muted rounded-xl p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Factory Tour Video</div>
                    <div className="text-sm text-muted-foreground">
                      Watch our production facility in action
                    </div>
                  </div>
                </div>

                {/* Verification Details */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Business License Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Factory Audit Completed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Raw Material Sources Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>ISO 9001 Certified</span>
                  </div>
                </div>

                <Link to="/suppliers">
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Browse Verified Suppliers →
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifiedPartnersSection;
