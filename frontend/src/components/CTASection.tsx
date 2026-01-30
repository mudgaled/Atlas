import { Button } from "@/components/ui/button";
import { ArrowRight, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { statsAPI } from "@/lib/api";
import { Link } from "react-router-dom";

const CTASection = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      try {
        return await statsAPI.getPlatformStats();
      } catch (error) {
        console.error('Error fetching platform stats:', error);
        // Return fallback values in case of error
        return {
          verifiedSuppliers: 0,
          buyers: 0,
          products: 0,
          countries: 0,
          tradeVolume: 0,
          totalOrders: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary opacity-10" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center animate-scale-in">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-8 animate-spin-slow">
            <Globe className="w-10 h-10 text-white" />
          </div>

          {/* Headline */}
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Global trade,{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              finally simplified.
            </span>
          </h2>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of businesses connecting across borders with trust,
            transparency, and efficiency.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link to="/register?role=buyer">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-10 py-6 h-auto shadow-xl"
              >
                I'm a Buyer
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link to="/register?role=seller">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-6 h-auto border-2 hover:bg-accent hover:text-accent-foreground hover:border-accent"
              >
                I'm a Seller
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-8 justify-center text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {isLoading ? '...' : `${stats?.verifiedSuppliers?.toLocaleString() ?? '0'}+`}
              </div>
              <div className="text-sm text-muted-foreground">
                Verified Suppliers
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {isLoading ? '...' : `${stats?.countries ?? '0'}+`}
              </div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {isLoading ? '...' : `$${Math.round((stats?.tradeVolume || 0) / 1000000).toLocaleString()}M+`}
              </div>
              <div className="text-sm text-muted-foreground">Trade Volume</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                24/7
              </div>
              <div className="text-sm text-muted-foreground">
                Global Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
