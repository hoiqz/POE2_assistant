import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api.js'
import { getErrorMessage } from '../services/errorHandler.js'
import type { Build } from '../types/index.js'

export default function Builds() {
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const response = await API.get('/builds')
        setBuilds(response.data)
      } catch (err: any) {
        const errorInfo = getErrorMessage(err)
        setError(errorInfo.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBuilds()
  }, [])

  const handleDeleteBuild = async (buildId: string) => {
    if (!window.confirm('Are you sure you want to delete this build?')) {
      return
    }

    try {
      await API.delete(`/builds/${buildId}`)
      setBuilds(builds.filter((b) => b.id !== buildId))
    } catch (err: any) {
      const errorInfo = getErrorMessage(err)
      setError(errorInfo.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Your Builds</h2>
        <button
          onClick={() => navigate('/import')}
          className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded font-semibold hover:bg-green-700 transition text-sm sm:text-base"
        >
          + Import Build
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading builds...</p>
        </div>
      ) : builds.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded p-8 text-center">
          <p className="text-gray-700 mb-4">No builds yet.</p>
          <button
            onClick={() => navigate('/import')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Import your first build
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {builds.map((build) => (
            <div
              key={build.id}
              className="bg-white p-4 sm:p-6 rounded shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 break-words">
                    {build.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {build.class}
                    {build.main_skill && ` · ${build.main_skill}`}
                  </p>
                  {build.level && (
                    <p className="text-xs text-gray-500 mt-1">
                      Level {build.level}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => navigate(`/builds/${build.id}/chat`)}
                    className="flex-1 sm:flex-initial bg-blue-600 text-white px-2 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-blue-700 transition"
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => navigate(`/builds/${build.id}/variants`)}
                    className="flex-1 sm:flex-initial bg-purple-600 text-white px-2 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-purple-700 transition"
                  >
                    Variants
                  </button>
                  <button
                    onClick={() => handleDeleteBuild(build.id)}
                    className="flex-1 sm:flex-initial bg-red-600 text-white px-2 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
