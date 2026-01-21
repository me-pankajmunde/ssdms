import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import PanchangCalendar from './pages/PanchangCalendar';
import Donate from './pages/Donate';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Layout wrapper for public pages
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

// Placeholder pages
const About = () => (
  <div className="min-h-screen bg-cream py-12">
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-dark mb-8 marathi">आमच्याविषयी</h1>
      <div className="card p-8">
        <h2 className="text-2xl font-bold mb-4 marathi">श्री समर्थ धोंडुतात्या महाराज मंदिर</h2>
        <p className="text-gray-700 mb-4 marathi">
          डोंगरशेळकी गावातील हे पवित्र मंदिर भक्तांसाठी आध्यात्मिक शांतीचे केंद्र आहे.
          श्री समर्थ धोंडुतात्या महाराजांच्या आशीर्वादाने हे मंदिर भक्तांची सेवा करत आहे.
        </p>
        <p className="text-gray-700 marathi">
          मंदिरात दररोज पूजा-अर्चा, आरती आणि विविध धार्मिक कार्यक्रम होतात.
          भक्तनिवास, अन्नछत्रालय आणि इतर सुविधा भक्तांसाठी उपलब्ध आहेत.
        </p>
      </div>
    </div>
  </div>
);

const Contact = () => (
  <div className="min-h-screen bg-cream py-12">
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-dark mb-8 marathi">संपर्क</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 marathi">संपर्क माहिती</h2>
          <div className="space-y-4 text-gray-700">
            <p className="marathi">
              <strong>पत्ता:</strong><br />
              श्री समर्थ धोंडुतात्या महाराज मंदिर,<br />
              डोंगरशेळकी, महाराष्ट्र
            </p>
            <p>
              <strong>Phone:</strong> +91 98765 43210
            </p>
            <p>
              <strong>Email:</strong> info@ssdms-temple.org
            </p>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Send Message</h2>
          <form className="space-y-4">
            <input type="text" placeholder="Your Name" className="input" />
            <input type="email" placeholder="Email" className="input" />
            <input type="tel" placeholder="Phone" className="input" />
            <textarea placeholder="Message" rows={4} className="input"></textarea>
            <button type="submit" className="btn btn-primary w-full marathi">संदेश पाठवा</button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
        <Route path="/calendar" element={<PublicLayout><PanchangCalendar /></PublicLayout>} />
        <Route path="/donate" element={<PublicLayout><Donate /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
