export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Welcome!</h3>
          <p className="text-gray-600">
            Build your Path of Exile 2 characters and chat with Claude to optimize your builds.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Getting Started</h3>
          <p className="text-gray-600">
            Head to the Builds section to import your first build from PathOfBuilding.
          </p>
        </div>
      </div>
    </div>
  )
}
