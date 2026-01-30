import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderSuccessPage = () => {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Thank you for your order. Your order has been received and is being processed.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/my-orders">View Order Status</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;