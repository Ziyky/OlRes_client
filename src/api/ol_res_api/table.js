import request from '@/utils/request'

export function tableList() {
  return request({
    url: '/table/tableInfo',
    method: 'get'
  })
}

export function addTable(tableData) {
  return request({
    url: '/table/tableAdd',
    method: 'post',
    data: tableData
  })
}

export function deleteTable(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request({
    url: '/table/tableDelete',
    method: 'delete',
    params
  })
}

export function updateTable(tableData) {
  return request({
    url: '/table/tableUpdate',
    method: 'post',
    data: tableData
  })
}

export function getTableById(id) {
  const params = new URLSearchParams()
  params.append('id', id)
  return request({
    url: '/table',
    method: 'get',
    params
  })
}
