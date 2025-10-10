import { useState } from "react";
import { toast } from "react-toastify";

export default function DashboardVerification({ setVerificationModal, startupId, contactEmail, resetForm, onVerifySuccess }) {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

const handleVerify = async () => {
  setIsVerifying(true);
  if (!verificationCode) {
    toast.error("Please enter the verification code.");
    setError("Please enter the verification code.");
    setIsVerifying(false);
    return;
  }
  if (!startupId || !contactEmail) {
    toast.error("Startup ID or email is missing.");
    setError("Startup ID or email is missing.");
    setIsVerifying(false);
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    toast.error("Invalid email format.");
    setError("Invalid email format.");
    setIsVerifying(false);
    return;
  }

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
    setIsSendingCode(true);
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
      } else {
        const errorData = await response.json();
        toast.error(`Failed to send code: ${errorData.error || "Try again"}`);
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("An error occurred while sending the verification code.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyLater = () => {
    setVerificationModal(false);
    resetForm();
    toast.info("Verification cancelled.");
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-1/3">
        <h2 className="text-xl font-semibold mb-4">Verify Your Email</h2>
        <p className="text-sm text-gray-600 mb-4">
          Please send the verification code to {contactEmail}. Click <strong>Send Code</strong> and enter the code below.
        </p>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Verification Code</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter code"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="bg-gray-300 px-4 py-2 rounded-md"
            onClick={handleVerifyLater}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-[#1D3557] text-white px-4 py-2 rounded-md mr-2 flex items-center"
            onClick={handleSendCode}
            disabled={isSendingCode}
          >
            {isSendingCode ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
                Sending...
              </>
            ) : (
              "Send Code"
            )}
          </button>
          <button
            type="button"
            className="bg-[#1D3557] text-white px-4 py-2 rounded-md flex items-center"
            onClick={handleVerify}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}