import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../services/api.js'
import { getErrorMessage } from '../services/errorHandler.js'

interface Variant {
  id: string
  variant_name: string
  changes_summary: string
  created_at: string
}

export default function Variants() {
  const { buildId } = useParams<{ buildId: string }>()
  const navigate = useNavigate()
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [buildName, setBuildName] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch build info
        const buildsResponse = await API.get('/builds')
        const build = buildsResponse.data.find((b: any) => b.id === buildId)
        if (build) {
          setBuildName(build.name)
        }

        // Fetch variants
        const variantsResponse = await API.get(`/builds/${buildId}/variants`)
        setVariants(variantsResponse.data)
      } catch (err: any) {
        const errorInfo = getErrorMessage(err)
        setError(errorInfo.message)
      } finally {
        setLoading(false)
      }
    }

    if (buildId) {
      fetchData()
    }
  }, [buildId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => navigate(`/builds/${buildId}/chat`)}
          className="text-blue-600 hover:text-blue-700 mb-2 sm:mb-3 text-xs sm:text-sm font-semibold transition"
        >
          ← Back to Chat
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
          Build Variants
        </h2>
        <p className="text-xs sm:text-base text-gray-600 break-words">
          {buildName && `Variants for "${buildName}"`}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 sm:p-4 rounded mb-4 sm:mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-gray-500 text-sm">Loading variants...</div>
        </div>
      ) : variants.length === 0 ? (
        <div className="bg-white p-6 sm:p-8 rounded shadow text-center">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">No variants saved yet.</p>
          <button
            onClick={() => navigate(`/builds/${buildId}/chat`)}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base transition"
          >
            Go to Chat
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="bg-white p-4 sm:p-6 rounded shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-2 sm:mb-3">
                <h3 className="text-base sm:text-xl font-bold text-slate-900 break-words flex-1">
                  {variant.variant_name}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded whitespace-nowrap">
                  {formatDate(variant.created_at)}
                </span>
              </div>
              {variant.changes_summary && (
                <p className="text-gray-700 text-xs sm:text-sm">
                  {variant.changes_summary}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
