import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../providers/AuthProvider';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FaLock, FaSpinner, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

const CheckoutForm = ({ scholarship, user }) => {
  const stripe = useStripe();
  const elements = useElements();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    mode: 'onChange'
  });

  const totalAmount = (scholarship.applicationFees || 0) + (scholarship.serviceCharge || 0);

  // Create payment intent
  useEffect(() => {
    if (totalAmount > 0) {
      // ✅ FIXED: Changed from '/create-payment-intent' to '/payments/create-payment-intent'
      axiosSecure.post('/payments/create-payment-intent', { amount: totalAmount })
        .then(res => {
          if (res.data.clientSecret) {
            setClientSecret(res.data.clientSecret);
            setPaymentError('');
          }
        })
        .catch(err => {
          console.error('Error creating payment intent:', err);
          setPaymentError('Failed to initialize payment. Please refresh the page.');
          toast.error('Failed to initialize payment');
        });
    }
  }, [totalAmount, axiosSecure]);

  // Handle card element change
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setPaymentError(event.error.message);
    } else {
      setPaymentError('');
    }
  };

  const onSubmit = async (formData) => {
    if (!stripe || !elements) {
      toast.error('Stripe not loaded. Please refresh the page.');
      return;
    }

    if (!clientSecret) {
      toast.error('Payment not initialized. Please refresh the page.');
      return;
    }

    setProcessing(true);

    const card = elements.getElement(CardElement);

    if (card === null) {
      toast.error('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card,
        billing_details: {
          name: user.displayName,
          email: user.email
        }
      });

      if (methodError) {
        toast.error(methodError.message);
        setProcessing(false);
        return;
      }

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id
      });

      if (confirmError) {
        // Payment failed - save application with unpaid status
        const applicationData = {
          scholarshipId: scholarship._id,
          visitorId: user.uid,
          userName: user.displayName,
          userEmail: user.email,
          userImage: user.photoURL || '',
          universityName: scholarship.universityName,
          universityCountry: scholarship.universityCountry,
          universityCity: scholarship.universityCity || '',
          scholarshipName: scholarship.scholarshipName,
          scholarshipCategory: scholarship.scholarshipCategory,
          subjectCategory: scholarship.subjectCategory,
          degree: scholarship.degree,
          applicationFees: scholarship.applicationFees || 0,
          serviceCharge: scholarship.serviceCharge || 0,
          applicationStatus: 'pending',
          paymentStatus: 'unpaid',
          applicationDate: new Date().toISOString(),
          phone: formData.phone,
          address: formData.address,
          sscResult: formData.sscResult,
          hscResult: formData.hscResult,
          studyGap: formData.studyGap || 'No gap'
        };

        await axiosSecure.post('/applications', applicationData);

        navigate('/payment-failed', { 
          state: { 
            scholarshipName: scholarship.scholarshipName,
            error: confirmError.message 
          } 
        });
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Payment successful - save application with paid status
        const applicationData = {
          scholarshipId: scholarship._id,
          userId: user.uid,
          userName: user.displayName,
          userEmail: user.email,
          userImage: user.photoURL || '',
          universityName: scholarship.universityName,
          universityCountry: scholarship.universityCountry,
          universityCity: scholarship.universityCity || '',
          scholarshipName: scholarship.scholarshipName,
          scholarshipCategory: scholarship.scholarshipCategory,
          subjectCategory: scholarship.subjectCategory,
          degree: scholarship.degree,
          applicationFees: scholarship.applicationFees || 0,
          serviceCharge: scholarship.serviceCharge || 0,
          applicationStatus: 'pending',
          paymentStatus: 'paid',
          transactionId: paymentIntent.id,
          applicationDate: new Date().toISOString(),
          phone: formData.phone,
          address: formData.address,
          sscResult: formData.sscResult,
          hscResult: formData.hscResult,
          studyGap: formData.studyGap || 'No gap'
        };

        const appResponse = await axiosSecure.post('/applications', applicationData);

        // Save payment record
        await axiosSecure.post('/payments', {
          email: user.email,
          transactionId: paymentIntent.id,
          amount: totalAmount,
          applicationId: appResponse.data.insertedId,
          scholarshipId: scholarship._id,
          scholarshipName: scholarship.scholarshipName,
          universityName: scholarship.universityName,
          date: new Date().toISOString()
        });

        toast.success('Payment successful!');
        
        navigate('/payment-success', { 
          state: { 
            scholarshipName: scholarship.scholarshipName,
            universityName: scholarship.universityName,
            amount: totalAmount,
            transactionId: paymentIntent.id
          } 
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Card element styling
  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: '"DM Sans", sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#6366f1',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  // Check if form is ready for submission
  const isFormReady = stripe && clientSecret && cardComplete && isValid;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Payment Error Alert */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {paymentError}
        </div>
      )}

      {/* Personal Info */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
            <input
              type="text"
              value={user?.displayName || ''}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              {...register('phone', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9+\-\s()]+$/,
                  message: 'Please enter a valid phone number'
                }
              })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter your phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Address <span className="text-red-500">*</span></label>
            <input
              type="text"
              {...register('address', { required: 'Address is required' })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter your address"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
          </div>
        </div>
      </div>

      {/* Academic Info */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Academic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">SSC Result <span className="text-red-500">*</span></label>
            <input
              type="text"
              {...register('sscResult', { required: 'SSC result is required' })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="e.g., 5.00 or A+"
            />
            {errors.sscResult && <p className="text-red-500 text-sm mt-1">{errors.sscResult.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">HSC Result <span className="text-red-500">*</span></label>
            <input
              type="text"
              {...register('hscResult', { required: 'HSC result is required' })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="e.g., 5.00 or A+"
            />
            {errors.hscResult && <p className="text-red-500 text-sm mt-1">{errors.hscResult.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Study Gap (if any)</label>
            <select
              {...register('studyGap')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">No Gap</option>
              <option value="1 year">1 Year</option>
              <option value="2 years">2 Years</option>
              <option value="3+ years">3+ Years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
          <FaLock className="text-green-500" />
          Payment Details
        </h3>
        
        {!clientSecret ? (
          <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
            <FaSpinner className="animate-spin text-blue-600 mr-2" />
            <span className="text-gray-500">Initializing payment...</span>
          </div>
        ) : (
          <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <CardElement options={cardStyle} onChange={handleCardChange} />
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-3">
          <FaLock className="text-gray-400 text-xs" />
          <p className="text-sm text-gray-500">
            Your payment is secured with 256-bit SSL encryption
          </p>
        </div>

        {/* Test Card Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">Test Card for Demo:</p>
          <p className="text-sm text-blue-600 font-mono">4242 4242 4242 4242</p>
          <p className="text-xs text-blue-500 mt-1">Use any future date and any 3-digit CVC</p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady || processing}
        className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
          isFormReady && !processing
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {processing ? (
          <>
            <FaSpinner className="animate-spin" />
            Processing Payment...
          </>
        ) : !clientSecret ? (
          <>
            <FaSpinner className="animate-spin" />
            Initializing...
          </>
        ) : !cardComplete ? (
          <>
            <FaLock />
            Enter Card Details
          </>
        ) : (
          <>
            <FaLock />
            Pay ${totalAmount.toFixed(2)}
          </>
        )}
      </button>

      {/* Button Status Indicator */}
      {!isFormReady && !processing && (
        <p className="text-center text-sm text-gray-500">
          {!clientSecret && 'Waiting for payment initialization...'}
          {clientSecret && !cardComplete && 'Please enter your card details'}
          {clientSecret && cardComplete && !isValid && 'Please fill all required fields'}
        </p>
      )}
    </form>
  );
};

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  // Fetch scholarship details
  const { data: scholarship, isLoading, error } = useQuery({
    queryKey: ['scholarship', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/scholarships/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Failed to load scholarship details</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Please login to continue</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = (scholarship.applicationFees || 0) + (scholarship.serviceCharge || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Scholarship</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Complete Your Application</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Elements stripe={stripePromise}>
              <CheckoutForm scholarship={scholarship} user={user} />
            </Elements>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Application Summary</h3>
              
              <div className="flex gap-4 mb-4">
                {scholarship.universityImage ? (
                  <img
                    src={scholarship.universityImage}
                    alt={scholarship.universityName}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {scholarship.universityName?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 line-clamp-2">{scholarship.scholarshipName}</p>
                  <p className="text-sm text-gray-500">{scholarship.universityName}</p>
                  <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full mt-1">
                    {scholarship.degree}
                  </span>
                </div>
              </div>

              <hr className="my-4" />

              {/* Scholarship Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Category</span>
                  <span className="font-medium">{scholarship.scholarshipCategory}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Subject</span>
                  <span className="font-medium">{scholarship.subjectCategory}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Location</span>
                  <span className="font-medium">{scholarship.universityCountry}</span>
                </div>
              </div>

              <hr className="my-4" />

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Application Fee</span>
                  <span>${scholarship.applicationFees || 0}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service Charge</span>
                  <span>${scholarship.serviceCharge || 0}</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
              </div>

              {/* Security Badge */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 text-green-700">
                  <FaCheckCircle />
                  <span className="text-sm font-semibold">Secure Checkout</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Your payment information is encrypted and secure. Powered by Stripe.
                </p>
              </div>

              {/* Deadline Warning */}
              {scholarship.applicationDeadline && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">Deadline:</span>{' '}
                    {new Date(scholarship.applicationDeadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;