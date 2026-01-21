import { Heart, Shield, FileText, IndianRupee } from 'lucide-react';
import DonationForm from '../components/DonationForm';
import { DonationCategory, DonationCategoryLabels } from '../types';

const Donate = () => {
  const sevaOptions = [
    { name: 'महाअभिषेक', amount: 1100, description: 'Grand abhishek with full ritual' },
    { name: 'रुद्राभिषेक', amount: 501, description: 'Rudra puja with 11 priests' },
    { name: 'सत्यनारायण पूजा', amount: 751, description: 'Full Satyanarayan katha' },
    { name: 'अर्चना', amount: 51, description: 'Basic archana' },
    { name: 'महाप्रसाद', amount: 251, description: 'Special prasad booking' },
    { name: 'अन्नदान (50 भक्त)', amount: 5000, description: 'Feed 50 devotees' },
  ];

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-saffron rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-dark mb-4 marathi">देणगी द्या</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto marathi">
            आपल्या उदार देणगीतून मंदिराच्या विविध सेवा-कार्यांना हातभार लावा
          </p>
          <p className="text-gray-500 mt-2">
            Support temple services through your generous donations
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Donation Form */}
          <div className="lg:col-span-2">
            <DonationForm />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Categories */}
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 marathi">देणगी प्रकार</h3>
              <ul className="space-y-3">
                {Object.values(DonationCategory).map((cat) => (
                  <li key={cat} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    <span className="marathi">{DonationCategoryLabels[cat].marathi}</span>
                    <span className="text-gray-400 ml-2">({DonationCategoryLabels[cat].english})</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Seva Options */}
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 marathi">सेवा बुकिंग</h3>
              <ul className="space-y-3">
                {sevaOptions.map((seva, index) => (
                  <li key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium marathi">{seva.name}</p>
                      <p className="text-xs text-gray-500">{seva.description}</p>
                    </div>
                    <span className="font-bold text-primary">₹{seva.amount}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust Info */}
            <div className="card p-6 bg-gradient-to-br from-primary/5 to-saffron/5">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Shield className="w-5 h-5 text-primary mr-2" />
                <span className="marathi">विश्वसनीय देणगी</span>
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <FileText className="w-4 h-4 text-primary mr-2 mt-0.5" />
                  <span className="marathi">80G कर सूट प्रमाणपत्र उपलब्ध</span>
                </li>
                <li className="flex items-start">
                  <IndianRupee className="w-4 h-4 text-primary mr-2 mt-0.5" />
                  <span className="marathi">सुरक्षित ऑनलाइन पेमेंट</span>
                </li>
                <li className="flex items-start">
                  <Shield className="w-4 h-4 text-primary mr-2 mt-0.5" />
                  <span className="marathi">नोंदणीकृत धर्मादाय संस्था</span>
                </li>
              </ul>
            </div>

            {/* Bank Details */}
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 marathi">बँक तपशील</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Name</span>
                  <span className="font-medium">SSDMS Temple Trust</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank</span>
                  <span className="font-medium">State Bank of India</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">A/C No.</span>
                  <span className="font-medium">XXXXXXXXXX123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IFSC</span>
                  <span className="font-medium">SBIN0001234</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
