import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { userApi } from '../../../Services/Axios';
import { BookingConfirm, userIdStoredInCoupon } from '../../../Api/User';


const CheckoutForm = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const { bookingData } = location.state; // Get form data passed via navigation
  const [loading, setLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);


  useEffect(() => {
    const createPaymentIntent = async () => {
      try {

        const response = await userApi.post('/create-payment-intent', {
          amount: bookingData.total_Amt, // Convert to cents
        });

        setPaymentIntent(response.data);
      } catch (error) {

      }
    };

    createPaymentIntent();
  }, [bookingData]);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentIntent?.clientSecret) {
      console.error("Stripe.js has not loaded or payment intent client secret is missing.");
      return;
    }

    setLoading(true);
    try {
      const { clientSecret } = paymentIntent;
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {

        toast.error("An error occurred during payment.");
      } else if (result.paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful!');
        const result = await BookingConfirm(bookingData);
        if (result) {

          if (bookingData.Coupon) {
            const result = await userIdStoredInCoupon(bookingData.Coupon, bookingData.UserId)
          }
          navigate('/success');  // Redirect to success page
        }
      }
    } catch (error) {

      toast.error("An error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-gray-50 shadow-lg rounded-lg p-6"
      >
        {/* Form Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Checkout</h2>
          <p className="text-sm text-gray-500">Complete your payment securely</p>
        </div>

        {/* Card Input */}
        <div className="my-6">
          <label htmlFor="card-element" className="block text-gray-600 mb-2">
            Card Details
          </label>
          <div className="border rounded-lg p-3 bg-white focus-within:shadow-outline">
            <CardElement id="card-element" />
          </div>
          {cardError && <p className="text-red-500 text-sm mt-2">{cardError}</p>}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all focus:ring-4 focus:ring-blue-300 disabled:bg-gray-300"
          >
            {loading ? (
              <div className="flex justify-center items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing...</span>
              </div>
            ) : (
              "Pay Now"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
