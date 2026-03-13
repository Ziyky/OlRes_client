<template>
  <el-table :data="list" style="width: 100%;padding-top: 15px;">
    <el-table-column label="订单编号">
      <template slot-scope="scope">
        {{ scope.row.orderNo | orderNoFilter }}
      </template>
    </el-table-column>
    <el-table-column label="总计" align="center">
      <template slot-scope="scope">
        ¥{{ scope.row.totalAmount }}
      </template>
    </el-table-column>
    <el-table-column label="状态" align="center">
      <template slot-scope="{row}">
        <el-tag :type="row.state | statusFilter">
          {{ row.state }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="开始时间" align="center">
      <template slot-scope="{row}">
          {{ formatTime(row.createTime) }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script>

import { getOrderList } from '@/api/ol_res_api/order'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        '已结账': 'success',
        '待结账': 'danger',
        '已取消': 'info',
        '已退款': 'info'
      }
      return statusMap[status]
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    }
  },
  data() {
    return {
      list: null
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      getOrderList().then(response => {
        this.list = response.data.slice(0, 8)
        console.log(this.list)
      })
    },
    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0') + ' ' +
        d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
    }
  }
}
</script>
