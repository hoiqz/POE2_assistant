import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const auth = {
  signup: (email: string, password: string) =>
    API.post('/auth/signup', { email, password }),
  login: (email: string, password: string) =>
    API.post('/auth/login', { email, password }),
}

export default API
