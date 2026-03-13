import request from '@/utils/request'

export function login(data) {
  const params = new URLSearchParams()
  params.append('username', data.username)
  params.append('password', data.password)
  return request({
    url: '/admin/login',
    method: 'post',
    params
  })
}

export function getInfo() {
  return request({
    url: '/admin/adminInfo',
    method: 'get'
  })
}

export function logout(data) {
  const params = new URLSearchParams()
  params.append('token', data)
  return request({
    url: '/admin/logout',
    method: 'post',
    params
  })
}

export function getNicknameById(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request({
    url: '/admin/nickname',
    method: 'post',
    params
  })
}
