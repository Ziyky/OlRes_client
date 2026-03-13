<template>
  <div class="order-index">
    <!-- 顶部筛选栏 -->
    <el-card class="header-card">
      <div class="header-content">
        <h1>订单管理</h1>
        <div class="filter-group">
          <el-input
            v-model="searchKeyword"
            placeholder="订单号"
            prefix-icon="el-icon-search"
            style="width: 300px; margin-right: 10px;"
            @keyup.enter.native="filterOrders"
          />

          <el-select v-model="stateFilter" placeholder="筛选订单状态" clearable style="width: 180px; margin-right: 10px;" @change="filterOrders">
            <el-option label="全部" value="" />
            <el-option label="待结账" value="待结账" />
            <el-option label="已结账" value="已结账" />
            <el-option label="已取消" value="已取消" />
            <el-option label="已退款" value="已退款" />
          </el-select>

          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 250px; margin-right: 10px;"
            @change="filterOrders"
          />

          <el-button type="primary" icon="el-icon-refresh" @click="resetFilter">重置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="filteredOrders"
        border
        stripe
        size="small"
      >
        <el-table-column prop="orderNo" label="订单编号" width="180" align="center" />

        <el-table-column prop="tableNo" label="桌台号" width="100" align="center" />
        <el-table-column prop="userId" label="顾客姓名" width="120" align="center" />
        <el-table-column label="订单状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getstateTag(scope.row.state)">{{ scope.row.state }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="120" align="center">
          <template slot-scope="scope">¥{{ scope.row.totalAmount.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="开台时间" width="180" align="center">
          <template slot-scope="scope">{{ formatTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.endTime ? formatTime(scope.row.endTime) : '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <div class="table-btn-group">
              <el-button
                v-if="scope.row.state === '待结账'"
                type="success"
                size="mini"
                icon="el-icon-check"
                class="table-btn"
                @click.stop="handlePay(scope.row)"
              >结账
              </el-button>
              <el-button
                v-if="scope.row.state === '待结账'"
                type="danger"
                size="mini"
                icon="el-icon-close"
                class="table-btn"
                @click.stop="handleCancel(scope.row)"
              >取消
              </el-button>
              <el-button
                v-if="scope.row.state === '已结账'"
                type="warning"
                size="mini"
                icon="el-icon-refresh"
                class="table-btn"
                @click.stop="handleRefund(scope.row)"
              >退款
              </el-button>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-view"
                class="table-btn"
                @click.stop="viewOrderDetail(scope.row)"
              >详情
              </el-button>
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                class="table-btn"
                @click.stop="handleDelete(scope.row)"
              >删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="totalCount"
        style="margin-top: 20px; text-align: right;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 订单详情弹窗 (修复空值问题) -->
    <el-dialog
      :title="currentOrder ? `订单详情 ${currentOrder.orderNo}` : '订单详情'"
      :visible.sync="detailDialog"
      width="700px"
      top="5vh"
    >
      <!-- 增加空值判断，避免访问null属性 -->
      <div v-if="currentOrder" class="order-detail">
        <!-- 订单基本信息 -->
        <el-form :model="currentOrder" label-width="100px" class="base-info-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="订单编号">
                <span>{{ currentOrder.orderNo }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="桌台号">
                <span>{{ currentOrder.tableNo }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="顾客姓名">
                <span>{{ currentOrder.userId }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单状态">
                <el-tag :type="getstateTag(currentOrder.state)">{{ currentOrder.state }}</el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开台时间">
                <span>{{ formatTime(currentOrder.createTime) }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束时间">
                <span>{{ currentOrder.endTime ? formatTime(currentOrder.endTime) : '未结账' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用餐时长">
                <span v-if="currentOrder.state === '待结账'" class="highlight">{{ getDiningDuration(currentOrder.createTime) }}</span>
                <span v-else>{{ currentOrder.diningDuration || '已结束' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用餐人数">
                <span>{{ currentOrder.customerNum }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单总额">
                <span class="amount-text">¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <!-- 菜品明细 -->
        <el-card shadow="never" style="margin-top: 20px;">
          <div slot="header" class="detail-header">
            <span>菜品明细</span>
          </div>
          <el-table :data="currentOrder.dishes || []" border size="small" style="width: 100%">
            <el-table-column prop="name" label="菜品名称" />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="price" label="单价" width="100" align="center">
              <template slot-scope="scope">¥{{ scope.row.price }}</template>
            </el-table-column>
            <el-table-column label="小计" width="100" align="center">
              <template slot-scope="scope">¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}</template>
            </el-table-column>
          </el-table>
          <div class="total-section">
            <span>共计 {{ (currentOrder.dishes || []).reduce(function(sum, item) { return sum + item.quantity }, 0) }} 道菜</span>
            <span class="total-amount">总计：¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
          </div>
        </el-card>
      </div>

      <!-- 空状态提示 -->
      <div v-else class="empty-tip">
        <el-empty description="暂无订单信息" />
      </div>

      <div slot="footer">
        <el-button @click="detailDialog = false">关闭</el-button>
        <el-button
          v-if="currentOrder && currentOrder.state === '待结账'"
          type="success"
          @click="handlePay(currentOrder)"
        >立即结账</el-button>
      </div>
    </el-dialog>

    <!-- 操作确认弹窗 -->
    <el-dialog
      :title="confirmTitle"
      :visible.sync="confirmDialog"
      width="350px"
    >
      <p>{{ confirmMessage }}</p>
      <div slot="footer">
        <el-button @click="confirmDialog = false">取消</el-button>
        <el-button type="primary" :loading="confirmLoading" @click="handleConfirm">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  cancelOrder,
  deleteOrder,
  getOrderItemByOrderId,
  getOrderList,
  orderRefund,
  payOrder
} from '@/api/ol_res_api/order'
import { getDishById } from '@/api/ol_res_api/dish'
import { getNicknameById } from '@/api/user'

export default {
  name: 'OrderIndex',
  data() {
    return {
      // 筛选条件
      searchKeyword: '',
      stateFilter: '',
      dateRange: [],

      // 分页相关
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      loading: false,

      // 订单数据
      orders: [],
      filteredOrders: [],

      // 弹窗相关 (初始化更安全)
      detailDialog: false,
      currentOrder: null,
      confirmDialog: false,
      confirmTitle: '',
      confirmMessage: '',
      confirmLoading: false,
      confirmAction: '', // pay/cancel/refund
      confirmOrder: null
    }
  },
  created() {
    this.initOrders()
  },
  methods: {
    // 加载订单数据（模拟接口请求）
    async initOrders() {
      this.loading = true
      // 获取订单列表
      const orderRes = await getOrderList()
      for (let i = 0; i < orderRes.data.length; i++) {
      // 获取订单列表菜品
        const orderItemRes = await getOrderItemByOrderId(orderRes.data[i].id)
        const orderItemList = orderItemRes.data || []
        // 遍历订单项，填充菜品信息
        const orderItems = []
        for (const item of orderItemList) {
          if (!item.dishId) continue // 菜品ID为空则跳过
          try {
          // 获取菜品详情
            const dishRes = await getDishById(item.dishId)
            const dishData = dishRes.data || {}
            orderItems.push({
              quantity: item.quantity || 0,
              name: dishData.dishName || '未知菜品',
              price: dishData.price || 0
            })
          } catch (dishErr) {
            console.error(`获取菜品${item.dishId}失败：`, dishErr)
            // 即使菜品获取失败，也保留基础数据，避免整条数据丢失
            orderItems.push({
              quantity: item.quantity || 0,
              name: '菜品信息加载失败',
              price: 0
            })
          }
        }

        this.orders[i] = orderRes.data[i]// 赋值订单
        const nicknameRes = await getNicknameById(this.orders[i].userId)
        this.orders[i].userId = nicknameRes.data // 获取nickname
        this.orders[i].dishes = orderItems // 赋值订单项
      }
      this.totalCount = this.orders.length
      this.filterOrders()
      this.loading = false
      console.log(this.orders)
    },
    // 筛选订单
    filterOrders() {
      let result = [].concat(this.orders)

      // 关键词筛选
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(function(item) {
          // 核心修复：先把值转为字符串（处理数字/undefined/null），再转小写
          const orderNo = (item.orderNo || '').toString().toLowerCase()
          const tableNo = (item.tableNo || '').toString().toLowerCase()
          const customerName = (item.customerName || '').toString().toLowerCase()

          return orderNo.includes(keyword) ||
            tableNo.includes(keyword) ||
            customerName.includes(keyword)
        })
      }

      // 状态筛选
      if (this.stateFilter) {
        result = result.filter(function(item) {
          return item.state === this.stateFilter
        }.bind(this))
      }

      // 日期筛选
      if (this.dateRange && this.dateRange.length === 2) {
        const startDate = new Date(this.dateRange[0])
        const endDate = new Date(this.dateRange[1])
        endDate.setHours(23, 59, 59)

        result = result.filter(function(item) {
          const createTime = new Date(item.createTime)
          return createTime >= startDate && createTime <= endDate
        })
      }

      // 计算数据条数
      this.totalCount = result.length
      // 分页处理
      this.filteredOrders = this.paginateData(result)
    },

    // 分页处理
    paginateData(data) {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return data.slice(start, end)
    },

    // 重置筛选条件
    resetFilter() {
      this.searchKeyword = ''
      this.stateFilter = ''
      this.dateRange = []
      this.currentPage = 1
      this.pageSize = 10
      this.filterOrders()
    },

    // 页码改变
    handleCurrentChange(val) {
      this.currentPage = val
      this.filterOrders()
    },

    // 每页条数改变
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.filterOrders()
    },

    // 获取状态标签类型
    getstateTag(state) {
      const map = {
        '已取消': 'warning',
        '已结账': 'success',
        '待结账': 'danger',
        '已退款': 'info'
      }
      return map[state] || 'info'
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0') + ' ' +
        d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
    },

    // 计算用餐时长
    getDiningDuration(startTime) {
      if (!startTime) return '0分钟'
      const now = new Date()
      const start = new Date(startTime)
      const diff = now - start

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        return hours + '小时' + minutes + '分钟'
      } else {
        return minutes + '分钟'
      }
    },

    // 查看订单详情 (增加空值保护)
    viewOrderDetail(order) {
      if (!order) return
      this.currentOrder = order
      this.detailDialog = true
    },

    // 结账操作 (增加空值保护)
    handlePay(order) {
      if (!order) return
      this.confirmOrder = order
      this.confirmTitle = '确认结账'
      this.confirmMessage = '订单 ' + order.orderNo + ' (桌台' + order.tableNo + ') 消费金额 ¥' + order.totalAmount.toFixed(2) + '，是否确认结账？'
      this.confirmAction = 'pay'
      this.confirmDialog = true
    },

    // 取消订单 (增加空值保护)
    handleCancel(order) {
      if (!order) return
      this.confirmOrder = order
      this.confirmTitle = '确认取消'
      this.confirmMessage = '确定取消订单 ' + order.orderNo + ' (桌台' + order.tableNo + ') 吗？'
      this.confirmAction = 'cancel'
      this.confirmDialog = true
    },

    // 退款操作 (增加空值保护)
    handleRefund(order) {
      if (!order) return
      this.confirmOrder = order
      this.confirmTitle = '确认退款'
      this.confirmMessage = '订单 ' + order.orderNo + ' (桌台' + order.tableNo + ') 退款金额 ¥' + order.totalAmount.toFixed(2) + '，是否确认退款？'
      this.confirmAction = 'refund'
      this.confirmDialog = true
    },

    // 删除操作
    handleDelete(order) {
      if (!order) return
      this.confirmOrder = order
      this.confirmTitle = '确认删除'
      this.confirmMessage = '订单 ' + order.orderNo + '，是否确认删除？'
      this.confirmAction = 'delete'
      this.confirmDialog = true
    },

    // 处理确认操作
    handleConfirm() {
      const self = this
      if (!self.confirmOrder) {
        self.confirmLoading = false
        self.confirmDialog = false
        self.$message.error('操作失败：未选择订单')
        return
      }

      self.confirmLoading = true
      switch (self.confirmAction) {
        case 'pay':
          payOrder(self.confirmOrder.id)
          // 更新订单状态
          self.confirmOrder.state = '已结账'
          self.confirmOrder.endTime = new Date()
          self.confirmOrder.diningDuration = self.getDiningDuration(self.confirmOrder.createTime)
          self.$message.success('结账成功！')
          break
        case 'cancel':
          cancelOrder(self.confirmOrder.id)
          self.confirmOrder.state = '取消'
          self.confirmOrder.totalAmount = 0
          self.$message.success('订单取消！')
          break
        case 'refund':
          orderRefund(self.confirmOrder.id)
          self.confirmOrder.state = '已退款'
          self.$message.success('退款成功！')
          break
        case 'delete':
          deleteOrder(self.confirmOrder.id)
          self.$message.success('删除成功！')
          this.orders = this.orders.filter(item => item.id !== self.confirmOrder.id)
          break
      }
      // 刷新列表
      self.filterOrders()

      // 更新详情弹窗数据
      if (self.currentOrder && self.currentOrder.orderNo === self.confirmOrder.orderNo) {
        self.currentOrder = Object.assign({}, self.confirmOrder)
      }

      self.confirmLoading = false
      self.confirmDialog = false
    }
  }
}
</script>

<style scoped>
.table-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px; /* 按钮之间的间距 */
  justify-content: center;
}
.table-btn {
  margin: 0 !important; /* 覆盖默认margin */
}
.order-index {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.header-card {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.table-card {
  background-color: #fff;
}

/* 订单详情样式 */
.order-detail {
  padding: 10px 0;
}

/* 空状态提示 */
.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.base-info-form {
  margin-bottom: 0;
}

.base-info-form .el-form-item {
  margin-bottom: 15px;
}

.highlight {
  color: #e6a23c;
  font-weight: bold;
}

.amount-text {
  color: #f56c6c;
  font-size: 16px;
  font-weight: bold;
}

.detail-header {
  font-weight: bold;
}

.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #666;
}

.total-amount {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}
</style>
