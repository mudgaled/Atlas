import { Button } from "@/components/ui/button";
import { ArrowRight, Globe } from "lucide-react";
import heroImage from "@/assets/hero-globe.jpg";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { statsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const Hero = () => {
  const { user } = useAuth();
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              <span>Connecting Global Trade</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Global trade.{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Without the blindfold.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Verified suppliers, transparent pricing, and smarter logistics —
              built for businesses everywhere.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {user ? (
                <Link to="/products">
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8"
                  >
                    Explore Products
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register?role=buyer">
                    <Button
                      size="lg"
                      className="group bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8"
                    >
                      I'm a Buyer
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/register?role=seller">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 border-2"
                    >
                      I'm a Seller
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap gap-8 justify-center lg:justify-start text-sm text-muted-foreground">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : `${stats?.verifiedSuppliers?.toLocaleString() ?? '0'}+`}
                </div>
                <div>Verified Suppliers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : `${stats?.countries ?? '0'}+`}
                </div>
                <div>Countries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : `$${Math.round((stats?.tradeVolume || 0) / 1000000).toLocaleString()}M+`}
                </div>
                <div>Trade Volume</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div
            className="relative animate-scale-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Global trade network visualization with shipping routes"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-6 -right-6 bg-card rounded-xl p-4 shadow-lg animate-float border">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-glow" />
                <div className="text-sm font-medium">Live Tracking Active</div>
              </div>
            </div>

            <div
              className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-lg animate-float border"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">
                Global Support
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
