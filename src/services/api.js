import axios from 'axios'

const API_BASE = 'https://wb-proxy.onrender.com/api';
const API_KEY = 'E6kUTYrYwZq2tN4QEtyzsbEBk3ie'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  params: {
    key: API_KEY
  }
})

// Интерцептор для логирования запросов
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.params)
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error Details:', {
      url: error.config?.url,
      params: error.config?.params,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

// Универсальный метод для получения данных с пагинацией
export const fetchData = async (endpoint, params = {}) => {
  try {
    // Убираем пустые параметры
    const cleanParams = {}
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        cleanParams[key] = params[key]
      }
    })

    const response = await api.get(endpoint, { params: cleanParams })
    return response.data
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error.response?.data || error.message)
    throw error
  }
}

// Экспорт методов для каждого эндпоинта
export const apiService = {
  getIncomes: (params) => fetchData('/incomes', params),
  getOrders: (params) => fetchData('/orders', params),
  getSales: (params) => fetchData('/sales', params),
  getStocks: (params) => fetchData('/stocks', params)
}