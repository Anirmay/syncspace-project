import React, { useState } from 'react'; // <-- CORRECTED THIS LINE
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      // Ensure this URL is exactly as written
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });

      setMessage(response.data.message);
      // Display the token for testing
      if (response.data.testOnly_resetToken) {
          setMessage(prev => prev + `\n\nTESTING: Token = ${response.data.testOnly_resetToken}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white font-inter">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
        <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
        <p className="text-center text-slate-400">
          Enter your email address and we'll send you a link (or show you a token for testing) to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          {message && <p className="text-green-400 whitespace-pre-wrap">{message}</p>}
          {error && <p className="text-red-400">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
        <div className="text-center text-sm">
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

