import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Verification({ setVerificationModal, setSelectedTab, startupId, contactEmail, resetForm }) {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

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

    try {
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
        setSelectedTab("Upload Data");
      } else {
        const errorData = await response.json();
        toast.error(`Verification failed: ${errorData.message || "Invalid code"}`);
        setError(errorData.message || "Invalid code");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      toast.error("An error occurred while verifying the email.");
      setError("An error occurred while verifying the email.");
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
    setSelectedTab("Upload Data");
    resetForm();
    toast.info("Verification postponed. You can verify later from the dashboard.");
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-1/3">
        <h2 className="text-xl font-semibold mb-4">Verify Your Email</h2>
        <p className="text-sm text-gray-600 mb-4">
          A verification code has been sent to <span className="font-semibold text-gray-800">{contactEmail}</span>. Please enter the code below.
        </p>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Verification Code</label>
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
            className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            onClick={handleVerifyLater}
          >
            Verify Later
          </button>
          <button
            type="button"
            className="bg-[#1D3557] text-white px-4 py-2 rounded-md hover:bg-[#16324f] transition-colors"
            onClick={handleVerify}
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}