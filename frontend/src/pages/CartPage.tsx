import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { user } = useAuth();
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (id, newQty) => {
    if (newQty < 1) return;
    updateQuantity(id, newQty);
    setQuantities(prev => ({ ...prev, [id]: newQty }));
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto pt-24 pb-12"> {/* Increased top padding to account for navbar */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet</p>
          <Link to="/products">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-24 pb-12"> {/* Increased top padding to account for navbar */}
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item._id} className="flex items-center p-4">
                <div className="w-24 h-24 bg-muted rounded-lg mr-6 flex items-center justify-center">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.name} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full" />
                  )}
                </div>
                
                <div className="flex-grow">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <p className="text-muted-foreground">{item.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="font-bold">${item.price?.toFixed(2)}</span>
                      <span className="mx-2">x</span>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item._id, item.qty - 1)}
                          disabled={item.qty <= 1}
                        >
                          -
                        </Button>
                        <span className="mx-2">{item.qty}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item._id, item.qty + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
                
                <CardFooter className="p-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(cartTotal * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${(cartTotal * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {user ? (
                <Link to="/checkout" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Proceed to Checkout
                  </Button>
                </Link>
              ) : (
                <Link to="/login" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Login to Checkout
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;