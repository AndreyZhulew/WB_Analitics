import { ref, reactive } from 'vue'
import { apiService } from '@/services/api'

export function useApiData(fetchFunction) {
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 50
  })

  const fetchData = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      // Добавляем стандартные параметры пагинации
      const requestParams = {
        page: pagination.currentPage,
        limit: pagination.perPage,
        ...params
      }
      
      console.log('API Request params:', requestParams)
      
      const response = await fetchFunction(requestParams)
      
      // Обработка различных форматов ответа
      if (Array.isArray(response)) {
        data.value = response
        pagination.totalItems = response.length
        pagination.totalPages = 1
      } else if (response.data) {
        data.value = response.data
        // Обработка пагинации из ответа
        if (response.pagination) {
          pagination.totalPages = response.pagination.last_page || 1
          pagination.totalItems = response.pagination.total || response.data.length
        } else {
          pagination.totalItems = response.data.length
          pagination.totalPages = 1
        }
      } else {
        data.value = []
        pagination.totalItems = 0
        pagination.totalPages = 1
      }
      
      console.log('API Response:', { data: data.value, pagination })
      
    } catch (err) {
      console.error('API Error caught:', err)
      error.value = err.response?.data?.message || 
                   err.response?.data?.error ||
                   err.message || 
                   'Ошибка загрузки данных'
      data.value = []
    } finally {
      loading.value = false
    }
  }

  const changePage = (page) => {
    pagination.currentPage = page
    return fetchData()
  }

  const setPerPage = (limit) => {
    pagination.perPage = limit
    pagination.currentPage = 1
    return fetchData()
  }

  const refresh = () => {
    return fetchData()
  }

  return {
    data,
    loading,
    error,
    pagination,
    fetchData,
    changePage,
    setPerPage,
    refresh
  }
}