import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-[1200ms] ease-out ${
        scrolled
          ? "top-2.5 w-[70%] rounded-[2rem] py-2 px-4 bg-background/60 backdrop-blur-md border border-border/30 shadow-md"
          : "top-0 w-[95%] rounded-2xl py-4 px-8 bg-transparent backdrop-blur-md"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center font-bold text-xl text-foreground"
        >
          <span className="text-2xl font-bold mr-0.5">Λ</span>tlas
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-8 mx-auto">
          <li>
            <Link
              to="/products"
              className="text-foreground/80 hover:text-primary font-medium transition-colors"
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              to="/company"
              className="text-foreground/80 hover:text-primary font-medium transition-colors"
            >
              Company
            </Link>
          </li>
          <li>
            <Link
              to="/pricing"
              className="text-foreground/80 hover:text-primary font-medium transition-colors"
            >
              Pricing
            </Link>
          </li>
        </ul>

        {/* Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          <Link to="/cart">
            <Button variant="ghost" className="font-medium relative">
              Cart
              {user && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>
          {user ? (
            <>
              {user.isAdmin && (
                <Link to="/admin/dashboard">
                  <Button variant="ghost" className="font-medium">
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              {user.isAdmin && (
                <Link to="/admin/seller-requests">
                  <Button variant="ghost" className="font-medium">
                    Seller Requests
                  </Button>
                </Link>
              )}
              {user.isSeller && (
                <Link to="/seller-dashboard">
                  <Button variant="ghost" className="font-medium">
                    {(user.sellerType?.charAt(0).toUpperCase() + user.sellerType?.slice(1)) || 'Seller'} Dashboard
                  </Button>
                </Link>
              )}
              <Link to="/profile">
                <Button variant="ghost" className="font-medium">
                  Profile
                </Button>
              </Link>
              <span className="mr-2 text-sm">
                Welcome, {user.name} {user.role === 'admin' ? '(Admin)' : user.role === 'seller' ? '(Seller)' : '(Buyer)'}
              </span>
              <Button variant="ghost" className="font-medium" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="font-medium">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="font-semibold">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 py-4 border-t border-border/30">
          <ul className="space-y-3">
            <li>
              <Link
                to="/products"
                className="block text-foreground/80 hover:text-primary font-medium"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/company"
                className="block text-foreground/80 hover:text-primary font-medium"
              >
                Company
              </Link>
            </li>
            <li>
              <Link
                to="/pricing"
                className="block text-foreground/80 hover:text-primary font-medium"
              >
                Pricing
              </Link>
            </li>
          </ul>
          <div className="flex flex-col space-y-2 mt-4">
            <Link to="/cart">
              <Button variant="ghost" className="w-full relative">
                Cart
                {user && (
                  <span className="absolute -top-1 -right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <>
                {user.isAdmin && (
                  <Link to="/admin/dashboard">
                    <Button variant="ghost" className="w-full">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                {user.isAdmin && (
                  <Link to="/admin/seller-requests">
                    <Button variant="ghost" className="w-full">
                      Seller Requests
                    </Button>
                  </Link>
                )}
                {user.isSeller && (
                  <Link to="/seller-dashboard">
                    <Button variant="ghost" className="w-full">
                      {(user.sellerType?.charAt(0).toUpperCase() + user.sellerType?.slice(1)) || 'Seller'} Dashboard
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="ghost" className="w-full">
                    Profile
                  </Button>
                </Link>
                <span className="text-center">
                  Welcome, {user.name} {user.role === 'admin' ? '(Admin)' : user.role === 'seller' ? '(Seller)' : '(Buyer)'}
                </span>
                <Button variant="ghost" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
