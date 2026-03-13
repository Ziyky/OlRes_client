import request from '@/utils/request'

export function getOrderById(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request({
    url: '/order',
    method: 'get',
    params
  })
}

export function getOrderItemByOrderId(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request({
    url: '/order/orderItem',
    method: 'post',
    params
  })
}

export function createOrder(orderData) {
  return request({
    url: '/order/orderAdd',
    method: 'post',
    data: orderData
  })
}

export function cancelOrder(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request({
    url: '/order/Cancel',
    method: 'post',
    params
  })
}

export function payOrder(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request({
    url: '/order/pay',
    method: 'post',
    params
  })
}

export function getOrderList() {
  return request({
    url: '/order/orderInfo',
    method: 'get'
  })
}

export function orderRefund(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request({
    url: '/order/refund',
    method: 'post',
    params
  })
}

export function deleteOrder(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request({
    url: '/order/orderDelete',
    method: 'delete',
    params
  })
}
