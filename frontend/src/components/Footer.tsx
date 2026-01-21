import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Temple Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-saffron rounded-full flex items-center justify-center text-2xl">
                🙏
              </div>
              <div className="ml-3">
                <h3 className="font-bold marathi">श्री समर्थ धोंडुतात्या</h3>
                <h3 className="font-bold marathi">महाराज मंदिर</h3>
              </div>
            </div>
            <p className="text-gray-400 text-sm marathi">
              डोंगरशेळकी गावातील पवित्र मंदिर, भक्तांसाठी आध्यात्मिक शांती आणि सेवेचे केंद्र.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="text-gray-400 hover:text-primary transition-colors marathi">
                  कार्यक्रम
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="text-gray-400 hover:text-primary transition-colors marathi">
                  पंचांग
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-gray-400 hover:text-primary transition-colors marathi">
                  देणगी द्या
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary transition-colors marathi">
                  आमच्याविषयी
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-primary transition-colors marathi">
                  संपर्क
                </Link>
              </li>
            </ul>
          </div>

          {/* Darshan Timings */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-primary marathi">दर्शन वेळ</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                <span className="marathi">सकाळ: ६:०० - १२:००</span>
              </li>
              <li className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                <span className="marathi">संध्याकाळ: ४:०० - ९:००</span>
              </li>
              <li className="mt-4 marathi text-xs">
                * विशेष सणांच्या दिवशी वेळ बदलू शकते
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-primary marathi">संपर्क</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-1 text-primary flex-shrink-0" />
                <span className="marathi">
                  डोंगरशेळकी, तालुका - जिल्हा,
                  <br />
                  महाराष्ट्र - 400001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                <a href="tel:+919876543210" className="hover:text-primary">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                <a href="mailto:info@ssdms-temple.org" className="hover:text-primary">
                  info@ssdms-temple.org
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {currentYear} श्री समर्थ धोंडुतात्या महाराज मंदिर. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm flex items-center mt-2 md:mt-0">
              Made with <Heart className="w-4 h-4 mx-1 text-error" /> for devotees
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
