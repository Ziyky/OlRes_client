import request from '@/utils/request'

export function addCategory(categoryName) {
  const params = new URLSearchParams()
  params.append('categoryName', categoryName)
  return request(
    {
      url: '/category/categoryAdd',
      method: 'post',
      params
    }
  )
}

export function updateCategory(id, categoryName) {
  const params = new URLSearchParams()
  params.append('id', id)
  params.append('categoryName', categoryName)
  return request(
    {
      url: '/category/categoryUpdate',
      method: 'put',
      params
    }
  )
}

export function deleteCategoryById(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request(
    {
      url: '/category/categoryDelete',
      method: 'delete',
      params
    }
  )
}

export function getCategoryById(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request(
    {
      url: '/category',
      method: 'get',
      params
    }
  )
}

export function getCategoryList() {
  return request(
    {
      url: '/category/categoryInfo',
      method: 'get'
    }
  )
}
