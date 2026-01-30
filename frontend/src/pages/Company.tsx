const Company = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Our Company</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforming global trade with verified suppliers, transparent pricing, and smarter logistics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-4">
              We're on a mission to eliminate the barriers that have traditionally made cross-border trade difficult, 
              risky, and expensive. By connecting verified suppliers directly with buyers, we're creating a more 
              transparent, efficient, and trustworthy global marketplace.
            </p>
            <p className="text-lg text-muted-foreground">
              Our platform verifies every supplier, provides real-time logistics tracking, and offers transparent 
              pricing with no hidden fees – making global trade accessible to businesses of all sizes.
            </p>
          </div>
          <div className="bg-muted rounded-2xl p-8">
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-4">🌍</div>
                <h3 className="text-xl font-bold">Global Reach</h3>
                <p className="text-muted-foreground">150+ countries served</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card rounded-xl border">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Transparency</h3>
              <p className="text-muted-foreground">
                Clear pricing, verified suppliers, and real-time tracking for complete visibility.
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-xl border">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">Trust</h3>
              <p className="text-muted-foreground">
                Rigorous verification processes to ensure authentic supplier relationships.
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-xl border">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Efficiency</h3>
              <p className="text-muted-foreground">
                Streamlined processes and smart logistics to accelerate your global trade.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center mb-6">Our Story</h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
            Founded by entrepreneurs who experienced firsthand the challenges of international trade, 
            Atlas was created to solve the pain points that make cross-border commerce difficult. 
            We've grown from a small team with a big idea to a platform connecting thousands of 
            verified suppliers with buyers worldwide. Today, we continue to innovate and expand 
            our services to make global trade simpler, safer, and more profitable for businesses everywhere.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Company;