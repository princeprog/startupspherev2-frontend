import { useState } from "react";
import { toast } from "react-toastify";

export default function Verification({ setVerificationModal, setSelectedTab, startupId, contactEmail }) {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!verificationCode) {
      toast.error("Please enter the verification code.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/startups/verify-email", {
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

  const handleClose = () => {
    setVerificationModal(false);
    setSelectedTab("Additional Information"); // Go back to form if canceled
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-1/3">
        <h2 className="text-xl font-semibold mb-4">Verify Your Email</h2>
        <p className="text-sm text-gray-600 mb-4">
          A verification code has been sent to {contactEmail}. Please enter the code below.
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
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-[#1D3557] text-white px-4 py-2 rounded-md"
            onClick={handleVerify}
          >
            Verify
          </button>
          <button
            id="closeButton"
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 w-full rounded-lg text-white text-sm font-medium border-none outline-none bg-gray-800 hover:bg-gray-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}