import { useState } from "react";
import { motion } from "framer-motion";

export default function Login({ closeModal, openRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || "Failed to login");
      } else {
        const data = await response.json();
        console.log(response);
        const userResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user details");
        }

        const userData = await userResponse.json();
        console.log("Login successful, user data:", userData);

        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess(userData);
          closeModal();
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-[95%] max-w-4xl mx-auto overflow-hidden bg-white rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-[500px]">
          {/* Left Side - Brand Section */}
          <div className="w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full -ml-30 -mb-30"></div>
            
            {/* Content */}
            <div className="relative z-10 space-y-8">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex justify-center"
              >
                <motion.img
                  src="/StartUpSphere_loginLogo.png"
                  alt="StartUpSphere Logo"
                  className="h-28 w-auto object-contain drop-shadow-lg brightness-110 filter"
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: 0.5,
                  }}
                />
              </motion.div>

              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="space-y-3 text-center"
              >
                <h1 className="text-3xl font-bold text-gray-800 leading-tight">
                  Welcome Back
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Access your startup dashboard and continue your growth journey
                </p>
              </motion.div>

              {/* Quick Access Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-900  font-medium text-sm">Secure Login</p>
                    <p className="text-gray-500 text-xs">Industry-leading encryption</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-900 font-medium text-sm">Instant Access</p>
                    <p className="text-gray-500 text-xs">Get to your dashboard in seconds</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Tagline at bottom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="relative z-10 pt-6 border-t border-blue-400/30 text-center"
            >
              <p className="text-sm font-medium text-gray-800 italic">
                "Your Success is Our Mission"
              </p>
            </motion.div>
          </div>

          {/* Right Side - Form Section */}
          <div className="w-3/5 bg-white p-12 flex flex-col justify-center relative">
            {/* Close button */}
            <button
              className="absolute top-6 right-6 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors border-0 bg-transparent"
              onClick={closeModal}
              aria-label="Close login modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h2>
                <p className="text-gray-600 text-sm">Enter your credentials to access your account</p>
              </div>

              {/* Success message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
                >
                  <div className="flex-shrink-0">
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                      className="h-6 w-6 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </motion.svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Login successful!</p>
                    <p className="text-xs text-green-700">Redirecting to your dashboard...</p>
                  </div>
                </motion.div>
              )}

              {success ? null : (
                <>
                  {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    className="block w-full px-4 py-3 pl-11 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <button 
                    type="button" 
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors border-0 p-0 bg-transparent"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    className="block w-full px-4 py-3 pl-11 pr-11 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors border-0 bg-transparent p-0"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2.5 sm:p-3 bg-red-50 border border-red-100 rounded-lg"
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Sign In button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 cursor-pointer text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm border-0 flex items-center justify-center mt-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              {/* Register link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    onClick={openRegister}
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors hover:underline bg-transparent p-0 border-0"
                  >
                    Create one now
                  </button>
                </p>
              </div>
                </>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
