import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../services/api.js'
import { getErrorMessage } from '../services/errorHandler.js'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Chat() {
  const { buildId } = useParams<{ buildId: string }>()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [buildName, setBuildName] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [variantName, setVariantName] = useState('')
  const [savingVariant, setSavingVariant] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Fetch build info on mount
  useEffect(() => {
    const fetchBuild = async () => {
      try {
        const response = await API.get(`/builds`)
        const build = response.data.find((b: any) => b.id === buildId)
        if (build) {
          setBuildName(build.name)
        }
      } catch (err) {
        console.error('Failed to fetch build')
      }
    }

    fetchBuild()
  }, [buildId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !buildId) return

    const userMessage = input
    setInput('')
    setError('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await API.post(`/builds/${buildId}/chat`, {
        message: userMessage,
      })

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.message },
      ])
    } catch (err: any) {
      const errorInfo = getErrorMessage(err)
      setError(errorInfo.message)
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveVariant = async () => {
    if (!variantName.trim() || !buildId) return

    setSavingVariant(true)
    try {
      await API.post(`/builds/${buildId}/variants`, {
        variant_name: variantName,
        changes_summary: 'Variant from conversation',
      })
      setShowSaveModal(false)
      setVariantName('')
      alert('Variant saved successfully!')
    } catch (err: any) {
      const errorInfo = getErrorMessage(err)
      alert(errorInfo.message)
    } finally {
      setSavingVariant(false)
    }
  }

  const handleExportConversation = async () => {
    if (!buildId) return

    try {
      const response = await API.get(`/builds/${buildId}/chat/export`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'conversation.md'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      const errorInfo = getErrorMessage(err)
      alert(errorInfo.message)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-100 border-b border-slate-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 break-words">
              {buildName || 'Build Chat'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Ask Claude for advice about your build
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex-1 sm:flex-initial bg-green-600 text-white px-2 sm:px-4 py-2 rounded hover:bg-green-700 text-xs sm:text-sm transition"
            >
              Save
            </button>
            <button
              onClick={() => navigate(`/builds/${buildId}/variants`)}
              className="flex-1 sm:flex-initial bg-purple-600 text-white px-2 sm:px-4 py-2 rounded hover:bg-purple-700 text-xs sm:text-sm transition"
            >
              Variants
            </button>
            <button
              onClick={handleExportConversation}
              disabled={messages.length === 0}
              className="flex-1 sm:flex-initial bg-orange-600 text-white px-2 sm:px-4 py-2 rounded hover:bg-orange-700 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
        {messages.length === 0 && !error && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">No messages yet</p>
              <p>Start a conversation by asking about your build!</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded">
            {error}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs sm:max-w-lg px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-200 text-slate-900 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap text-xs sm:text-sm">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-200 text-slate-900 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-2 sm:p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your build..."
            disabled={loading}
            className="flex-1 border border-gray-300 p-2 sm:p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-xs sm:text-base"
          >
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </div>

      {/* Save Variant Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900">Save Variant</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Give this variant a name to save it for later reference.
            </p>
            <input
              type="text"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              placeholder="e.g., More Tanky Build"
              className="w-full border border-gray-300 p-2 sm:p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              autoFocus
            />
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleSaveVariant}
                disabled={!variantName.trim() || savingVariant}
                className="flex-1 bg-green-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base transition"
              >
                {savingVariant ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false)
                  setVariantName('')
                }}
                className="flex-1 bg-gray-400 text-white px-3 sm:px-4 py-2 rounded hover:bg-gray-500 font-semibold text-sm sm:text-base transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
