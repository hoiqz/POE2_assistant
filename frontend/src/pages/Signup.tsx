import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../services/api'
import { getErrorMessage } from '../services/errorHandler'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setError('')
    setLoading(true)
    try {
      const response = await auth.signup(email, password)
      localStorage.setItem('token', response.data.token)
      // Force full page reload to get fresh token value from localStorage
      window.location.href = '/builds'
    } catch (err: any) {
      const errorInfo = getErrorMessage(err)
      setError(errorInfo.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <form onSubmit={handleSignup} className="bg-white p-6 sm:p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900">Sign Up</h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-xs sm:text-sm">
            {error}
          </div>
        )}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 p-2 sm:p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm sm:text-base"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 p-2 sm:p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm sm:text-base"
            required
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 p-2 sm:p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm sm:text-base"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 sm:p-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4 text-sm sm:text-base transition"
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
        <p className="text-center text-gray-600 text-xs sm:text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline font-semibold">
            Login
          </a>
        </p>
      </form>
    </div>
  )
}
