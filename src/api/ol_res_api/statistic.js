import request from '@/utils/request'

export function getUserTotal() {
  return request(
    {
      url: '/statistic/usertotal',
      method: 'post'
    }
  )
}

export function getDishTotal() {
  return request(
    {
      url: '/statistic/dishtotal',
      method: 'post'
    }
  )
}

export function getTodayAmount() {
  return request(
    {
      url: '/statistic/todayAmount',
      method: 'post'
    }
  )
}

export function getTodayOrder() {
  return request(
    {
      url: '/statistic/todayOrder',
      method: 'post'
    }
  )
}

export function getUserTrend() {
  return request(
    {
      url: '/statistic/weekUsers',
      method: 'post'
    }
  )
}
