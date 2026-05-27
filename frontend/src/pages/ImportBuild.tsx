import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import { getErrorMessage } from '../services/errorHandler'

export default function ImportBuild() {
  const [name, setName] = useState('')
  const [buildData, setBuildData] = useState('')
  const [importFormat, setImportFormat] = useState<'json' | 'code'>('json')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!buildData.trim()) {
        setError(`Please paste build ${importFormat === 'json' ? 'JSON' : 'code'}`)
        return
      }

      if (importFormat === 'json') {
        let parsedJson
        try {
          parsedJson = JSON.parse(buildData)
        } catch (jsonErr) {
          setError('Invalid JSON format. Please check your build data.')
          return
        }

        await API.post('/builds/import', {
          name: name || 'Imported Build',
          pobJson: parsedJson,
        })
      } else {
        // Build code format
        await API.post('/builds/import-code', {
          name: name || 'Imported Build',
          buildCode: buildData.trim(),
        })
      }

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
          <label className="block mb-2 font-semibold text-sm sm:text-base">Import Format</label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="json"
                checked={importFormat === 'json'}
                onChange={() => setImportFormat('json')}
                className="cursor-pointer"
              />
              <span className="text-sm sm:text-base">JSON</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="code"
                checked={importFormat === 'code'}
                onChange={() => setImportFormat('code')}
                className="cursor-pointer"
              />
              <span className="text-sm sm:text-base">Build Code</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-sm sm:text-base">
            Paste Build {importFormat === 'json' ? 'JSON' : 'Code'}
          </label>
          <textarea
            value={buildData}
            onChange={(e) => setBuildData(e.target.value)}
            placeholder={importFormat === 'json' ? '{"class": "Witch", "mainSkill": {...}, ...}' : 'Paste your build code here'}
            className="w-full border border-gray-300 p-2 sm:p-3 rounded font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={10}
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            {importFormat === 'json'
              ? 'Paste the complete build JSON from PathOfBuilding export'
              : 'Paste the build code from the in-game Path of Exile 2 build link'}
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
