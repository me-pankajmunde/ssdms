import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, User, Mail, Phone, MapPin, CreditCard, CheckCircle } from 'lucide-react';
import { DonationCategory, DonationCategoryLabels, DonationCreateRequest } from '../types';
import { donationsApi } from '../services/api';

const donationSchema = z.object({
  donor: z.object({
    name: z.string().min(2, 'नाव आवश्यक आहे'),
    email: z.string().email('वैध ईमेल प्रविष्ट करा'),
    phone: z.string().min(10, 'वैध फोन नंबर प्रविष्ट करा'),
    address: z.string().optional(),
    panNumber: z.string().optional(),
    isAnonymous: z.boolean(),
  }),
  category: z.nativeEnum(DonationCategory),
  amount: z.number().min(1, 'रक्कम किमान ₹1 असावी'),
  inMemoryOf: z.string().optional(),
  occasion: z.string().optional(),
  receipt80G: z.boolean(),
});

type DonationFormData = z.infer<typeof donationSchema>;

const predefinedAmounts = [101, 251, 501, 1001, 2501, 5001];

const DonationForm = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(251);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donor: {
        name: '',
        email: '',
        phone: '',
        address: '',
        panNumber: '',
        isAnonymous: false,
      },
      category: DonationCategory.GENERAL,
      amount: 251,
      inMemoryOf: '',
      occasion: '',
      receipt80G: false,
    },
  });

  const receipt80G = watch('receipt80G');
  const isAnonymous = watch('donor.isAnonymous');

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setValue('amount', amount);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
    const numValue = parseInt(value) || 0;
    setValue('amount', numValue);
  };

  const onSubmit = async (data: DonationFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate PAN for 80G
      if (data.receipt80G && !data.donor.panNumber) {
        setError('80G पावतीसाठी PAN नंबर आवश्यक आहे');
        return;
      }

      // Create donation
      const donationResponse = await donationsApi.create(data as DonationCreateRequest);

      if (!donationResponse.success) {
        throw new Error('Failed to create donation');
      }

      // Create Razorpay order
      const orderResponse = await donationsApi.createOrder(donationResponse.data.id);

      if (!orderResponse.success) {
        throw new Error('Failed to create payment order');
      }

      // Initialize Razorpay (mock for development)
      // In production, use actual Razorpay checkout
      const options = {
        key: orderResponse.data.keyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'श्री समर्थ धोंडुतात्या महाराज मंदिर',
        description: `${DonationCategoryLabels[data.category].marathi} - ₹${data.amount}`,
        order_id: orderResponse.data.orderId,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          // Verify payment
          const verifyResponse = await donationsApi.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            donationId: donationResponse.data.id,
          });

          if (verifyResponse.success) {
            setSuccess(true);
          }
        },
        prefill: {
          name: data.donor.name,
          email: data.donor.email,
          contact: data.donor.phone,
        },
        theme: {
          color: '#EAA636',
        },
      };

      // For development, simulate success
      // In production: const rzp = new Razorpay(options); rzp.open();
      console.log('Payment options:', options);

      // Simulate payment verification for demo
      const verifyResponse = await donationsApi.verifyPayment({
        razorpay_order_id: orderResponse.data.orderId,
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_signature: 'mock_signature',
        donationId: donationResponse.data.id,
      });

      if (verifyResponse.success) {
        setSuccess(true);
      }

    } catch (err) {
      console.error('Donation error:', err);
      setError('देणगी प्रक्रियेत त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-dark mb-2 marathi">🙏 धन्यवाद!</h2>
        <p className="text-gray-600 mb-4 marathi">
          आपली देणगी यशस्वीरित्या प्राप्त झाली. आपल्या उदार योगदानाबद्दल आभार!
        </p>
        <p className="text-sm text-gray-500">
          Your donation has been received successfully. Thank you for your generous contribution!
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="btn btn-primary mt-6 marathi"
        >
          आणखी देणगी द्या
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6">
      <div className="flex items-center mb-6">
        <Heart className="w-6 h-6 text-primary mr-2" />
        <h2 className="text-xl font-bold text-dark marathi">देणगी द्या</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm marathi">
          {error}
        </div>
      )}

      {/* Category Selection */}
      <div className="mb-6">
        <label className="label marathi">देणगी प्रकार</label>
        <select {...register('category')} className="input">
          {Object.values(DonationCategory).map((cat) => (
            <option key={cat} value={cat}>
              {DonationCategoryLabels[cat].marathi} ({DonationCategoryLabels[cat].english})
            </option>
          ))}
        </select>
      </div>

      {/* Amount Selection */}
      <div className="mb-6">
        <label className="label marathi">रक्कम निवडा</label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {predefinedAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleAmountSelect(amount)}
              className={`donation-amount-btn ${selectedAmount === amount ? 'selected' : ''}`}
            >
              ₹{amount}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
          <input
            type="number"
            placeholder="इतर रक्कम"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            className="input pl-8"
          />
        </div>
        {errors.amount && (
          <p className="text-error text-sm mt-1 marathi">{errors.amount.message}</p>
        )}
      </div>

      {/* Donor Information */}
      <div className="mb-6">
        <label className="label marathi">दाता माहिती</label>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            {...register('donor.isAnonymous')}
            className="w-4 h-4 text-primary rounded"
          />
          <span className="ml-2 text-sm text-gray-600 marathi">अज्ञात राहू इच्छितो</span>
        </div>

        {!isAnonymous && (
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('donor.name')}
                placeholder="पूर्ण नाव"
                className="input pl-10"
              />
              {errors.donor?.name && (
                <p className="text-error text-sm mt-1 marathi">{errors.donor.name.message}</p>
              )}
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('donor.email')}
                type="email"
                placeholder="ईमेल"
                className="input pl-10"
              />
              {errors.donor?.email && (
                <p className="text-error text-sm mt-1 marathi">{errors.donor.email.message}</p>
              )}
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('donor.phone')}
                placeholder="फोन नंबर"
                className="input pl-10"
              />
              {errors.donor?.phone && (
                <p className="text-error text-sm mt-1 marathi">{errors.donor.phone.message}</p>
              )}
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                {...register('donor.address')}
                placeholder="पत्ता (ऐच्छिक)"
                rows={2}
                className="input pl-10"
              />
            </div>
          </div>
        )}
      </div>

      {/* 80G Receipt */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            {...register('receipt80G')}
            className="w-4 h-4 text-primary rounded"
          />
          <span className="ml-2 font-medium marathi">80G कर सूट पावती हवी</span>
        </div>

        {receipt80G && (
          <div className="mt-3">
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('donor.panNumber')}
                placeholder="PAN नंबर (उदा: ABCDE1234F)"
                className="input pl-10 uppercase"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 marathi">
              * ₹2,000 पेक्षा जास्त देणगीसाठी PAN आवश्यक आहे
            </p>
          </div>
        )}
      </div>

      {/* Optional Fields */}
      <div className="mb-6 space-y-4">
        <input
          {...register('inMemoryOf')}
          placeholder="स्मृतीप्रित्यर्थ (ऐच्छिक) - In memory of"
          className="input"
        />
        <input
          {...register('occasion')}
          placeholder="निमित्त (ऐच्छिक) - Occasion"
          className="input"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full text-lg"
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="marathi">₹{selectedAmount || customAmount || 0} देणगी द्या</span>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Secure payment powered by Razorpay
      </p>
    </form>
  );
};

export default DonationForm;
