import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function DashboardVerification({ setVerificationModal, startupId, contactEmail, resetForm, onVerifySuccess }) {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

const handleVerify = async () => {
  if (!verificationCode) {
    toast.error("Please enter the verification code.");
    setError("Please enter the verification code.");
    return;
  }

  if (!startupId || !contactEmail) {
    toast.error("Startup ID or email is missing.");
    setError("Startup ID or email is missing.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    toast.error("Invalid email format.");
    setError("Invalid email format.");
    return;
  }

  setIsVerifying(true);
  setError("");

  try {
    console.log("Sending verification request:", {
      startupId,
      email: contactEmail,
      code: verificationCode,
    });
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/startups/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startupId,
        email: contactEmail,
        code: verificationCode,
      }),
      credentials: "include",
    });

    if (response.ok) {
      toast.success("Email verified successfully!");
      setVerificationModal(false);
      onVerifySuccess(startupId);
    } else {
      let errorMessage = "Invalid code";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || "Invalid code";
      } catch (e) {
        const text = await response.text();
        errorMessage = text || "Verification failed: Server error";
      }
      toast.error(`Verification failed: ${errorMessage}`);
      setError(errorMessage);
    }
  } catch (error) {
    console.error("Error verifying email:", error);
    toast.error("An error occurred while verifying the email.");
    setError("An error occurred while verifying the email.");
  } finally {
    setIsVerifying(false);
  }
};

  const handleSendCode = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/startups/send-verification-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startupId,
          email: contactEmail,
        }),
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Verification code sent to your email!");
        setResendTimer(60);
        setCanResend(false);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to send code: ${errorData.error || "Try again"}`);
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("An error occurred while sending the verification code.");
    }
  };

  const handleVerifyLater = () => {
    setVerificationModal(false);
    resetForm();
    toast.info("Verification cancelled.");
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-1/3 relative">
        <button
          onClick={handleVerifyLater}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isVerifying}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl text-blue-950 font-semibold mb-4">Verify Your Email</h2>
        <p className="text-sm text-gray-600 mb-4">
          A verification code has been sent to <span className="font-semibold text-gray-800">{contactEmail}</span>. Please enter the code below.
        </p>
        <div className="mb-4">
          <label className="block text-gray-500 mb-1 text-sm font-medium">Verification Code</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter code"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        
        {/* Resend Code Section */}
        <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-md">
          <span className="text-sm text-gray-600">
            {!canResend ? (
              <>Didn't receive the code? Resend in <span className="font-semibold text-blue-600">{resendTimer}s</span></>
            ) : (
              <>Didn't receive the code?</>
            )}
          </span>
          <button
            type="button"
            className={`text-sm font-medium px-3 py-1 rounded-md transition-all duration-200 ${
              canResend
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleSendCode}
            disabled={!canResend}
          >
            Resend Code
          </button>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleVerifyLater}
            disabled={isVerifying}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-[#1D3557] text-white px-4 py-2 rounded-md hover:bg-[#16324f] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
            onClick={handleVerify}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Verify</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}