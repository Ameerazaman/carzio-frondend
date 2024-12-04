import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

import { useNavigate } from 'react-router-dom';

import { toast } from 'react-hot-toast';
import { resend, verifyOtp } from '../../Api/Provider';


const OtpForgotPasswordProvider: React.FC = () => {
  const [timer, setTimer] = useState<number>(50); 
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true); 
  const [otp, setOtp] = useState<string[]>(Array(6).fill('')); 
  const navigate = useNavigate()

  useEffect(() => {
    if (timer > 0 && isTimerActive) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval); 
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
  }, [timer, isTimerActive]);


  
  const handleResendOtp = async () => {
    try {
      
      const result = await resend();
      
      if (result?.data?.success) {
      
        setOtp(Array(6).fill('')); // Reset OTP input fields
        setIsTimerActive(false);    // Stop the timer before restarting
        
        // Use setTimeout to ensure states update properly
        setTimeout(() => {
          setTimer(50);             // Reset the timer to 50 seconds
          setIsTimerActive(true);   // Reactivate the timer after resetting
        }, 0);
  
        toast.success('OTP resent successfully.');
      } else {
        toast.error(result?.data?.message || 'Failed to resend OTP. Try again.');
      }
    } catch (error) {

      toast.error('Error resending OTP. Please try again.');
    }
  };
  
  

  const handleInputChange = (index: number, value: string) => {
    // Update the OTP state based on input change
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, ''); // Allow only numeric input
    setOtp(newOtp);

    // Move focus to the next input if the current input is filled
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userOtp = otp.join(''); // Convert array of digits into a string

    try {
      const result = await verifyOtp(userOtp);
      console.log(result, "otp result");

      if (result.success) {
        toast.success('OTP verified and user saved successfully');
        navigate('/provider/otp_change_password');  // Redirect to login page on success
      } else {
        toast.error(result.message || 'OTP verification failed.');
      }
    } catch (error) {
      toast.error('Error during OTP verification. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white">
      <div className="flex w-full max-w-3xl shadow-lg rounded-lg overflow-hidden relative">
        <div className="flex-1 flex flex-col justify-center items-center bg-gray-100 p-4 md:p-6 relative z-10">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-black">Enter OTP P</h2>
          <p className="text-gray-600 mb-4 text-center text-sm md:text-base">We have sent you an OTP on your registered mobile number.</p>

          <form className="w-full max-w-xs" onSubmit={handleSubmit}>
            <div className="grid grid-cols-6 gap-1 mb-4 md:mb-5">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`} // Unique ID for each input
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(index, e.target.value)}
                  className="w-full text-center border border-gray-300 rounded p-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              ))}
            </div>

            {isTimerActive ?
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 md:py-2 rounded font-semibold transition duration-300 text-sm"
              >
                Verify OTP
              </button> :""
            }
          
          </form>

          {isTimerActive &&
            <p className="mt-4 text-gray-600 text-center text-sm">
              Didn't receive OTP?{' '}
              <p onClick={handleResendOtp} className="text-red-500 hover:underline">Resend</p>
            </p>
          }
          <p className="mt-4 text-gray-600 text-center text-sm">
             {isTimerActive ? `Resend OTP in ${timer}s` : (
              <button
                type="submit" onClick={handleResendOtp}
                className="p-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 md:py-2 rounded font-semibold transition duration-300 text-sm"
              >
                Resend
              </button>
            )}
          </p>
        </div>

        <div className="hidden lg:flex flex-1 justify-center items-center relative">
          <img
            src="/images/otp verify.avif"
            alt="OTP Side"
            className="object-cover w-full h-full rounded-md"
          />
          <div className="absolute inset-0 rounded-md bg-black opacity-5"></div>
        </div>
      </div>
    </div>
  );
}

export default OtpForgotPasswordProvider;
