import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../Api/Provider';


function ForgotPasswordProvider() {

  const [email, setEmail] = useState<string>('');
  const navigate = useNavigate()
  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      const result = await forgotPassword(email);
      console.log(result, "forgot");
      if (result) {
        navigate('/provider/otp_forgot_password')
      }
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Forgot Password P</h2>
        <p className="text-sm text-gray-600 text-center mt-2">
          Enter your email address below and we'll send you instructions to reset your password.
        </p>
        <form onSubmit={handleForgotPassword} className="mt-6">
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <button type="submit" className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-500 transition duration-200">
            Send Reset Link
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Remembered your password?
            <Link to="/login" className="text-red-600 font-bold hover:text-red-500 ml-1">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordProvider;
