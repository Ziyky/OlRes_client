import request from '@/utils/request'

export function addDish(dishData) {
  const fix_dishData = {
    dishName: dishData.name,
    categoryId: dishData.categoryId,
    imgUrl: dishData.imgUrl,
    description: dishData.description,
    costPrice: dishData.costPrice,
    price: dishData.price,
    stock: dishData.stock,
    isOpen: dishData.isOpen
  }
  return request({
    url: '/dish/dishAdd',
    method: 'post',
    data: fix_dishData
  })
}

export function getDishList() {
  return request(
    {
      url: '/dish/dishInfo',
      method: 'get'
    }
  )
}

export function getDishById(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request(
    {
      url: '/dish',
      method: 'get',
      params
    }
  )
}

export function updateDish(dishData) {
  const fix_dishData = {
    id: dishData.id,
    dishName: dishData.name,
    categoryId: dishData.categoryId,
    imgUrl: dishData.imgUrl,
    description: dishData.description,
    costPrice: dishData.costPrice,
    price: dishData.price,
    stock: dishData.stock,
    isOpen: dishData.isOpen
  }
  return request(
    {
      url: '/dish/dishUpdate',
      method: 'put',
      data: fix_dishData
    }
  )
}

export function deleteDish(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request(
    {
      url: '/dish/dishDelete',
      method: 'delete',
      params
    }
  )
}

export function upDish(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request(
    {
      url: '/dish/upDish',
      method: 'post',
      params
    }
  )
}

export function downDish(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request(
    {
      url: '/dish/downDish',
      method: 'post',
      params
    }
  )
}
