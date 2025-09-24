import { useState } from "react";
import { motion } from "framer-motion";

export default function Login({ closeModal, openRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

        onLoginSuccess(userData);
        closeModal();
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
        className="w-[95%] max-w-md mx-auto overflow-hidden bg-white rounded-xl shadow-[0_15px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-primary/80 via-primary to-primary/80"></div>
        
        {/* Header */}
        <div className="relative bg-gray-200 px-8 pt-7 pb-6 bg-gradient-to-b from-gray-500 to-white border-b border-gray-100">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors border-0 bg-transparent"
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

          {/* Logo with subtle shadow */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <img
                src="/src/assets/StartUpSphere_loginLogo.png"
                alt="StartUpSphere Logo"
                className="h-16 w-auto object-contain drop-shadow-sm"
              />
            </div>
          </div>

          {/* Title text */}
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-1">
            Welcome Back
          </h3>
          <p className="text-center text-gray-500 text-sm">
            Sign in to continue to your account
          </p>
        </div>

        {/* Form container */}
        <div className="px-8 py-7 bg-white">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="mb-0">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5"
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
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  className="block w-full px-3 py-3 pl-11 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-0">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5"
              >
                Password
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  className="block w-full px-3 py-3 pl-11 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {/* Password recovery link */}
              <div className="flex justify-end mt-1.5">
                <button 
                  type="button" 
                  className="text-xs text-gray-500 hover:text-primary hover:underline transition-colors border-0 p-0 bg-transparent"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-100 rounded-lg"
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
              className="w-full py-3 px-4 cursor-pointer text-white bg-primary hover:bg-primary-focus active:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm border-0 flex items-center justify-center mt-3"
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
          </form>

          {/* Register link */}
          <div className="mt-7 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={openRegister}
                className="font-medium text-primary hover:text-primary-focus transition-colors hover:underline bg-transparent p-0 border-0"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
