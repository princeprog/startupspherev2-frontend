import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Verification({
  setVerificationModal,
  setSelectedTab,
  startupId,
  contactEmail,
  resetForm,
}) {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSendCode = async () => {
    if (isSendingCode || cooldown > 0) return;

    setIsSendingCode(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/send-verification-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startupId, email: contactEmail }),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Verification code sent!");
        setCooldown(60); // 60-second cooldown
      } else {
        const text = await response.text();
        toast.error(text || "Failed to send code");
      }
    } catch (err) {
      toast.error("Failed to send code. Check connection.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code.");
      setError("Please enter the code.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/verify-email`,
              {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startupId,
            email: contactEmail,
            code: verificationCode.trim(), // ← KEEP THIS: your backend expects "code"
          }),
          credentials: "include",
        }
      );

      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); } catch {}

      if (response.ok) {
        toast.success("Email verified successfully!");
        setVerificationModal(false);
        setSelectedTab("Upload Data");
      } else {
        const msg = data.message || data.error || text || "Invalid code";
        toast.error(`Verification failed: ${msg}`);
        setError(msg);
      }
    } catch (err) {
      toast.error("Network error.");
      setError("Network error.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyLater = () => {
    setVerificationModal(false);
    setSelectedTab("Upload Data");
    resetForm?.();
    toast.info("Verification postponed.");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
            <button onClick={handleVerifyLater} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            A 6-digit code has been sent to:<br />
            <span className="font-semibold text-indigo-600">{contactEmail}</span>
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="w-full px-5 py-4 text-center text-2xl font-mono tracking-widest bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              disabled={isVerifying}
            />
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleVerifyLater}
              className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Verify Later
            </button>

            <button
              onClick={handleSendCode}
              disabled={isSendingCode || cooldown > 0}
              className={`px-6 py-3 rounded-xl font-medium flex items-center justify-center transition ${
                cooldown > 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : isSendingCode
                  ? "bg-indigo-500 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
              }`}
            >
              {isSendingCode ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                "Resend Code"
              )}
            </button>

            <button
              onClick={handleVerify}
              disabled={isVerifying || !verificationCode.trim()}
              className="px-8 py-3 bg-[#1D3557] text-white rounded-xl font-medium hover:bg-[#162c44] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md flex items-center justify-center"
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Didn’t receive it? Check spam or wait for the timer.
          </p>
        </div>
      </div>
    </div>
  );
}