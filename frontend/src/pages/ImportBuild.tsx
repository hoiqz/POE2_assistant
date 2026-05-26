import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import { getErrorMessage } from '../services/errorHandler'

export default function ImportBuild() {
  const [name, setName] = useState('')
  const [pobJson, setPobJson] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!pobJson.trim()) {
        setError('Please paste build JSON')
        return
      }

      let parsedJson
      try {
        parsedJson = JSON.parse(pobJson)
      } catch (jsonErr) {
        setError('Invalid JSON format. Please check your build data.')
        return
      }

      await API.post('/builds/import', {
        name: name || 'Imported Build',
        pobJson: parsedJson,
      })

      navigate('/builds')
    } catch (err: any) {
      const errorInfo = getErrorMessage(err)
      setError(errorInfo.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h2 className="text-2xl sm:text-3xl mb-4 sm:mb-6 font-bold">Import Build</h2>
      <form onSubmit={handleImport} className="bg-white p-4 sm:p-6 rounded shadow-lg">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 sm:p-4 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-sm sm:text-base">Build Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Fire Witch"
            className="w-full border border-gray-300 p-2 sm:p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-sm sm:text-base">
            Paste Build JSON
          </label>
          <textarea
            value={pobJson}
            onChange={(e) => setPobJson(e.target.value)}
            placeholder='{"class": "Witch", "mainSkill": {...}, ...}'
            className="w-full border border-gray-300 p-2 sm:p-3 rounded font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={10}
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Paste the complete build JSON from PathOfBuilding export
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
          >
            {loading ? 'Importing...' : 'Import Build'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/builds')}
            className="flex-1 bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded font-semibold hover:bg-gray-500 transition text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
