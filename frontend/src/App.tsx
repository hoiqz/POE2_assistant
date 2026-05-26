import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.js'
import Signup from './pages/Signup.js'
import Dashboard from './pages/Dashboard.js'
import Builds from './pages/Builds.js'
import ImportBuild from './pages/ImportBuild.js'
import Chat from './pages/Chat.js'
import Variants from './pages/Variants.js'
import Layout from './components/Layout.js'
import ErrorBoundary from './components/ErrorBoundary.js'
import API from './services/api.js'

// Setup API error interceptor for auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

function App() {
  const token = localStorage.getItem('token')

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            token ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/builds"
          element={
            token ? (
              <Layout>
                <Builds />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/import"
          element={
            token ? (
              <Layout>
                <ImportBuild />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/builds/:buildId/chat"
          element={
            token ? (
              <Layout>
                <Chat />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/builds/:buildId/variants"
          element={
            token ? (
              <Layout>
                <Variants />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} />} />
      </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
