import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals and small businesses getting started",
      features: [
        "Access to verified supplier directory",
        "Basic product search",
        "5 saved searches",
        "Standard customer support",
        "Up to 10 product inquiries/month"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "per month",
      description: "Ideal for growing businesses with regular trading needs",
      features: [
        "Unlimited product searches",
        "Advanced supplier filtering",
        "Priority customer support",
        "Up to 100 product inquiries/month",
        "Basic logistics planning",
        "Document verification services"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with complex trading requirements",
      features: [
        "Unlimited everything",
        "Dedicated account manager",
        "Custom integrations",
        "White-label solutions",
        "Advanced analytics dashboard",
        "Custom logistics solutions",
        "24/7 premium support"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for your business. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`flex flex-col ${plan.popular ? 'border-2 border-primary ring-2 ring-primary/20 relative' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">/{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}>
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="bg-muted/50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Do you offer custom enterprise plans?</h3>
                <p className="text-muted-foreground">
                  Yes, our Enterprise plan is fully customizable to meet the specific needs of large organizations. 
                  Contact our sales team for a tailored solution.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-muted-foreground">
                  Absolutely! You can change your plan at any time. If you upgrade, you'll be charged a prorated amount. 
                  Downgrades take effect at the end of your billing cycle.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Is there a free trial available?</h3>
                <p className="text-muted-foreground">
                  Yes, we offer a 14-day free trial for our Professional plan. No credit card required to start.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards, PayPal, and bank transfers for annual subscriptions. 
                  Enterprise customers can request invoice-based billing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;