import { AlertCircle, Clock, DollarSign, Shield } from "lucide-react";

const ProblemSection = () => {
  const problems = [
    {
      icon: Shield,
      text: "Hard to know if a supplier is a real manufacturer"
    },
    {
      icon: Clock,
      text: "Language, cultural, and time zone barriers slow deals"
    },
    {
      icon: DollarSign,
      text: "Agents prioritize their margin, not your value"
    },
    {
      icon: AlertCircle,
      text: "Port, customs, and compliance costs are hidden and unpredictable"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/30" />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Cross-border trade is still{" "}
            <span className="text-destructive">stuck in the past.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Problems List */}
          <div className="space-y-6 animate-slide-in-left">
            {problems.map((problem, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-6 bg-card rounded-xl border-2 border-destructive/20 hover:border-destructive/40 transition-all hover:shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>
                <p className="text-lg text-foreground pt-2">{problem.text}</p>
              </div>
            ))}
          </div>

          {/* Solution Preview */}
          <div className="animate-slide-in-right">
            <div className="bg-card rounded-2xl p-8 border-2 border-primary/20 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b">
                  <h3 className="text-2xl font-bold">Our Solution</h3>
                  <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Verified
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-foreground">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Real-time verification & transparency</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-foreground">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Multilingual chat & auto-translation</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-foreground">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Direct supplier connections, no middlemen</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-foreground">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Complete cost transparency & tracking</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      const featuresElement = document.getElementById('features');
                      if (featuresElement) {
                        featuresElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    See How We Solve This →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
