import { useState } from "react";

export default function Signup({ closeModal }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstname, lastname, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register");
      }

      const data = await response.json();
      console.log("Registration successful:", data);

      // Close the modal after successful registration
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-90"
    >
      <div
        className="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg"
      >
        <div className="relative px-6 py-4">
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>

          <h3 className="mt-3 text-xl font-medium text-center text-gray-700">
            Register
          </h3>

          <form onSubmit={handleSignup}>
            <div className="w-full mt-4">
              <input
                className="block w-full px-4 py-2 mt-2 text-black placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-lg focus:border-black focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-black"
                type="text"
                placeholder="First Name"
                aria-label="First Name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
              />
            </div>

            <div className="w-full mt-4">
              <input
                className="block w-full px-4 py-2 mt-2 text-black placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-lg focus:border-black focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-black"
                type="text"
                placeholder="Last Name"
                aria-label="Last Name"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
              />
            </div>

            <div className="w-full mt-4">
              <input
                className="block w-full px-4 py-2 mt-2 text-black placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-lg focus:border-black focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-black"
                type="email"
                placeholder="Email Address"
                aria-label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="w-full mt-4">
              <input
                className="block w-full px-4 py-2 mt-2 text-black placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-lg focus:border-black focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-black"
                type="password"
                placeholder="Password"
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-500 text-center">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between mt-4">
              <button
                type="submit"
                className="px-6 py-2 w-full text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-black rounded-lg focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                disabled={loading}
              >
                {loading ? "Registering..." : "Sign Up"}
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center py-4 text-center bg-gray-50">
          <span className="text-sm text-gray-600">Already have an account? </span>

          <button
            onClick={closeModal} // Close modal to return to Login
            className="mx-2 text-sm font-bold text-black hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}