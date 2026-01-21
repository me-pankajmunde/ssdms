import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Calendar, Heart, Home, Info, Phone, Settings } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'मुख्यपृष्ठ', labelEn: 'Home', icon: Home },
    { path: '/events', label: 'कार्यक्रम', labelEn: 'Events', icon: Calendar },
    { path: '/calendar', label: 'पंचांग', labelEn: 'Calendar', icon: Calendar },
    { path: '/donate', label: 'देणगी', labelEn: 'Donate', icon: Heart },
    { path: '/about', label: 'आमच्याविषयी', labelEn: 'About', icon: Info },
    { path: '/contact', label: 'संपर्क', labelEn: 'Contact', icon: Phone },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-saffron rounded-full flex items-center justify-center text-white font-bold text-xl">
                🙏
              </div>
              <div className="ml-3 hidden sm:block">
                <h1 className="text-lg font-bold text-dark marathi">श्री समर्थ धोंडुतात्या महाराज</h1>
                <p className="text-xs text-gray-500">Dongarshelsoki, Maharashtra</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                }`}
              >
                <span className="marathi">{link.label}</span>
              </Link>
            ))}
            <Link
              to="/admin"
              className="ml-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center"
            >
              <Settings className="w-4 h-4 mr-1" />
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-lg text-base font-medium ${
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="marathi">{link.label}</span>
                  <span className="ml-2 text-sm text-gray-400">({link.labelEn})</span>
                </Link>
              );
            })}
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-3 py-3 rounded-lg text-base font-medium bg-primary text-white"
            >
              <Settings className="w-5 h-5 mr-3" />
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
