import { useState } from "react";

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
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.description);
        throw new Error(errorData.description || "Failed to login");
      } else {
        const data = await response.json();
        console.log("Login successful:", data);

        // Notify parent component of successful login
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-90">
      <div
        className="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()} // Prevent click propagation to the background
      >
        <div className="relative px-6 py-4">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={closeModal} // Call closeModal when the button is clicked
          >
            ✖
          </button>

          <h3 className="mt-3 text-xl font-medium text-center text-gray-700">
            Login
          </h3>

          <form onSubmit={handleLogin}>
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
              <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
            )}

            <div className="flex items-center justify-between mt-4">
              <button
                type="submit"
                className="px-6 py-2 w-full text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-black rounded-lg focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center py-4 text-center bg-gray-50">
          <span className="text-sm text-gray-600">Don't have an account? </span>

          <button
            className="mx-2 text-sm font-bold text-black hover:underline"
            onClick={openRegister} // Open Register modal and close Login modal
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}