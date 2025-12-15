import { useState } from "react";
import { motion } from "framer-motion";

export default function Signup({ closeModal, openLogin }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    percentage: 0,
    color: "",
    checks: {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
    }
  });

  // Password strength calculator
  const calculatePasswordStrength = (pass) => {
    const checks = {
      minLength: pass.length >= 8,
      hasUpperCase: /[A-Z]/.test(pass),
      hasLowerCase: /[a-z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass),
    };

    const score = Object.values(checks).filter(Boolean).length;
    let label = "";
    let percentage = 0;
    let color = "";

    if (score === 0) {
      label = "";
      percentage = 0;
      color = "";
    } else if (score <= 2) {
      label = "Weak";
      percentage = 25;
      color = "bg-error";
    } else if (score === 3) {
      label = "Average";
      percentage = 50;
      color = "bg-warning";
    } else if (score === 4) {
      label = "Strong";
      percentage = 75;
      color = "bg-success";
    } else {
      label = "Very Strong";
      percentage = 100;
      color = "bg-success";
    }

    return { score, label, percentage, color, checks };
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setEmailError(false);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (passwordStrength.score < 4) {
      setError("Password must meet all security requirements (at least Strong)");
      return;
    }

    // Validate Terms and Conditions acceptance
    if (!acceptedTerms) {
      setError("You must accept the Terms and Conditions to create an account");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstname, lastname, email, password }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log("Error response:", errorData);
        } catch (parseError) {
          console.log("Failed to parse error response:", parseError);
          throw new Error("We're unable to complete your registration at this time. Please try again later.");
        }
        // Check for duplicate email error
        if (errorData.error) {
          if (errorData.error.toLowerCase().includes("email")) {
            setEmailError(true);
          }
          throw new Error(errorData.error);
        }
        
        // Handle other errors with a formal message
        throw new Error(errorData.message || "We're unable to complete your registration at this time. Please try again later.");
      }

      const data = await response.json();
      console.log("Registration successful:", data);
      openLogin();

      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    closeModal();
    openLogin();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-3 md:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-4xl lg:max-w-5xl max-h-[80vh] my-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side - Brand Section */}
        <div className="w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-6 py-6 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full -ml-30 -mb-30"></div>
          
          {/* Content */}
          <div className="relative z-10 space-y-6">
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
                animate={{ y: [0, -7, 0] }}
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
              className="space-y-4 text-center"
            >
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                Build Your Future
              </h1>
              <p className="text-gray-600 font-medium italic text-base leading-relaxed">
                Connect with government support and industry leaders to accelerate your startup growth
              </p>
            </motion.div>

            {/* Benefits Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-blue-900 font-medium text-sm">Secure & Verified</p>
                  <p className="text-blue-600 text-xs">Industry-leading security standards</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-blue-900 font-medium text-sm">Quick Setup</p>
                  <p className="text-blue-600 text-xs">Get started in minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-blue-900 font-medium text-sm">Expert Support</p>
                  <p className="text-blue-600 text-xs">24/7 dedicated assistance</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tagline at bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="relative z-10 pt-4 border-t border-blue-400/30 text-center"
          >
            <p className="text-xs font-medium italic text-gray-800">
              "Bridging Startups and Government for a Unified Ecosystem"
            </p>
          </motion.div>
        </div>

        {/* Right Side - Form Section */}
        <div className="w-3/5 px-6 py-6 bg-white overflow-y-auto flex flex-col relative">
          {/* Close button - Desktop positioned */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors border-0 bg-transparent z-50"
            onClick={closeModal}
            aria-label="Close signup modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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

          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-1">Join StartUpSphere today and get started</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSignup} className="space-y-2.5 flex-1">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">
                  First Name
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    id="firstname"
                    className="block w-full px-3 py-2.5 sm:py-3 pl-11 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                    type="text"
                    placeholder="First name"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">
                  Last Name
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    id="lastname"
                    className="block w-full px-3 py-2.5 sm:py-3 pl-11 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                    type="text"
                    placeholder="Last name"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">
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
                  className={`block w-full px-3 py-2.5 sm:py-3 pl-11 text-gray-900 placeholder-gray-400 bg-white border ${
                    emailError
                      ? 'border-4 border-red-500 focus:border-red-800 focus:ring-red-800'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  } rounded-lg focus:ring-2 transition-all duration-200 text-sm sm:text-base`}
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(false);
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">
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
                  className="block w-full px-3 py-2.5 sm:py-3 pl-11 pr-11 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordStrength(calculatePasswordStrength(e.target.value));
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-0 cursor-pointer"
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
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

              {/* Password Strength Indicator */}
              <div className="mt-3 space-y-2">
                {/* Progress Bar */}
                {password && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${passwordStrength.percentage}%` }}
                      ></div>
                    </div>
                    {passwordStrength.label && (
                      <span
                        className={`text-xs font-semibold ${
                          passwordStrength.label === "Weak"
                            ? "text-red-600"
                            : passwordStrength.label === "Average"
                            ? "text-orange-500"
                            : "text-green-600"
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>
                )}

                {/* Password Requirements Checklist - Always Visible */}
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    {passwordStrength.checks.minLength ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={passwordStrength.checks.minLength ? "text-green-700" : "text-gray-700"}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passwordStrength.checks.hasUpperCase ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={passwordStrength.checks.hasUpperCase ? "text-green-700" : "text-gray-700"}>
                      Uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passwordStrength.checks.hasLowerCase ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={passwordStrength.checks.hasLowerCase ? "text-green-700" : "text-gray-700"}>
                      Lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passwordStrength.checks.hasNumber ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={passwordStrength.checks.hasNumber ? "text-green-700" : "text-gray-700"}>
                      Number
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    {passwordStrength.checks.hasSpecialChar ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={passwordStrength.checks.hasSpecialChar ? "text-green-700" : "text-gray-700"}>
                      Special character (!@#$%^&*...)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">
                Confirm Password
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  className={`block w-full px-3 py-2.5 sm:py-3 pl-11 pr-11 text-gray-900 placeholder-gray-400 bg-white border ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  } rounded-lg focus:ring-2 transition-all duration-200 text-sm sm:text-base`}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-0 cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
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
              <div className="h-5">
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 ml-0.5">
                    Passwords do not match
                  </p>
                )}
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed cursor-pointer select-none">
                I agree to the{" "}
                <span className="text-red-500">*</span>
                <a
                  href="/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Terms and Conditions
                </a>
                {" "}and{" "}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Privacy Policy
                </a>
              </label>
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

            <button
              type="submit"
              disabled={loading || (confirmPassword && password !== confirmPassword) || !acceptedTerms || (password && passwordStrength.score < 4)}
              className="w-full py-3 px-4 cursor-pointer text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm border-0 flex items-center justify-center mt-3 text-base"
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
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={handleSwitchToLogin}
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors hover:underline bg-transparent p-0 border-0"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}