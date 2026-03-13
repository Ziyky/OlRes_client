<template>
  <div class="table-index">
    <el-card class="header-card">
      <div class="header-content">
        <h1>桌台管理</h1>
      </div>
    </el-card>

    <!-- 桌台列表 -->
    <el-row :gutter="20" class="table-list">
      <el-col v-for="table in tables" :key="table.id" :xs="12" :sm="8" :md="6" :lg="4">
        <el-card
          :class="['table-card',getStateClass(table.state), { 'is-active': currentDetailTable && currentDetailTable.id === table.id }]"
          shadow="hover"
          @click.native="viewTableDetail(table)"
        >
          <div class="table-header">
            <span class="table-no">桌台 {{ table.no }}  ({{ table.capacity }} 座)</span>
            <el-tag :type="table.state | stateFilter" size="small">
              {{ table.state | stateTextFilter }}
            </el-tag>
          </div>

          <div v-if="table.state !== 0" class="table-info">
            <p><i class="el-icon-user" /> {{ table.username }}</p>
            <p><i class="el-icon-postcard" /> {{ table.orderNo }}</p>
            <p><i class="el-icon-time" /> {{ formatTime(table.startTime) }}</p>
            <p class="amount"><i class="el-icon-s-finance" /> ¥{{ table.amount.toFixed(2) }}</p>
          </div>

          <div class="table-actions" @click.stop>
            <!-- 开台 -->
            <el-button
              v-if="table.state === 0"
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="openOpenDialog(table.id)"
            >开台</el-button>

            <!-- 结账 -->
            <el-button
              v-if="table.state === 1"
              type="success"
              size="mini"
              icon="el-icon-check"
              @click="checkoutTable(table)"
            >结账</el-button>

            <!-- 取消 -->
            <el-button
              v-if="table.state === 1"
              type="danger"
              size="mini"
              icon="el-icon-close"
              @click="cancelTable(table)"
            >取消</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 桌台详情抽屉 -->
    <el-drawer
      :title="currentDetailTable ? `桌台 ${currentDetailTable.no} 详情` : '桌台详情'"
      :visible.sync="drawerVisible"
      direction="rtl"
      size="450px"
      :wrapper-closable="true"
    >
      <div v-if="currentDetailTable" class="table-detail">
        <!-- 基本信息卡片 -->
        <el-card class="detail-card" shadow="never">
          <div slot="header" class="detail-header">
            <span>基本信息</span>
            <el-tag :type="currentDetailTable.state | stateFilter">{{ currentDetailTable.state | stateTextFilter }}</el-tag>
          </div>
          <el-form :model="currentDetailTable" label-width="80px" class="info-form">
            <el-form-item label="顾客姓名">
              <span>{{ currentDetailTable.username || '暂无' }}</span>
            </el-form-item>
            <el-form-item label="订单编号">
              <span>{{ currentDetailTable.orderNo || '暂无' }}</span>
            </el-form-item>
            <el-form-item label="开台时间">
              <span>{{ formatTime(currentDetailTable.startTime) || '暂无' }}</span>
            </el-form-item>
            <el-form-item label="用餐时长">
              <span v-if="currentDetailTable.state === 1" class="highlight">{{ getDiningDuration(currentDetailTable.startTime) }}</span>
              <span v-else>已结束</span>
            </el-form-item>
            <el-form-item label="当前消费">
              <span class="amount-text">¥{{ currentDetailTable.amount.toFixed(2) }}</span>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 菜品信息卡片 -->
        <el-card class="detail-card" shadow="never" style="margin-top: 20px;">
          <div slot="header" class="detail-header">
            <span>菜品明细</span>
            <el-button type="text" icon="el-icon-plus" size="small">加菜</el-button>
          </div>

          <el-table :data="currentDetailTable.orders || []" style="width: 100%" size="small">
            <el-table-column prop="name" label="菜品名称" />
            <el-table-column prop="quantity" label="数量" width="70" />
            <el-table-column prop="price" label="单价" width="80">
              <template slot-scope="scope">¥{{ scope.row.price }}</template>
            </el-table-column>
            <el-table-column label="小计" width="90">
              <template slot-scope="scope">¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}</template>
            </el-table-column>
          </el-table>

          <div class="total-section">
            <span>共计 {{ (currentDetailTable.orders || []).reduce(function(sum, item) { return sum + item.quantity }, 0) }} 道菜</span>
            <span class="total-amount">总计：¥{{ currentDetailTable.amount.toFixed(2) }}</span>
          </div>
          <!-- 结账横条 -->
          <div class="detail-footer">
            <el-button v-if="currentDetailTable.state === 1" type="success" icon="el-icon-check" @click="checkoutTable(currentDetailTable)">立即结账</el-button>
            <el-button @click="drawerVisible = false">关闭</el-button>
          </div>
        </el-card>
      </div>
      <!-- 空状态提示 -->
      <div v-else class="empty-tip">
        <el-empty description="暂无桌台信息" />
      </div>
    </el-drawer>

    <!-- 开台 -->
    <el-dialog title="开台登记" :visible.sync="openDialog">
      <el-form ref="openForm" :model="openForm" :rules="openRules" label-width="80px">
        <!-- 桌台号（禁用） -->
        <el-form-item label="桌台号">
          <el-input v-model="openForm.no" disabled />
        </el-form-item>
        <!-- 顾客姓名 -->
        <el-form-item label="顾客姓名" prop="username">
          <el-input v-model="openForm.username" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="用餐人数" prop="customerNum">
          <template>
            <el-input-number
              v-model="openForm.customerNum"
              :min="1"
              :max="20"
              size="small"
            />
          </template>
        </el-form-item>

        <!-- 新增：菜品选择区域 -->
        <el-form-item label="选择菜品">
          <!-- 菜品列表 -->
          <el-table
            :data="dishList"
            border
            style="width: 100%; margin-bottom: 10px;"
            :show-header="true"
          >
            <el-table-column label="菜品名称" prop="dishName" width="200px" />
            <el-table-column label="单价(¥)" prop="price" width="100px" align="center">
              <template slot-scope="scope">
                {{ scope.row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="数量" width="200" align="center">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  :min="0"
                  :max="scope.row.stock"
                  size="small"
                  @change="calcTotalAmount"
                />
              </template>
            </el-table-column>
            <el-table-column label="小计(¥)" align="center">
              <template slot-scope="scope">
                {{ (scope.row.price * scope.row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="库存" align="center">
              <template slot-scope="scope">
                {{ scope.row.stock }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 总金额展示（只读） -->
          <div style="text-align: right; font-size: 16px; font-weight: bold;">
            总金额：¥{{ openForm.amount.toFixed(2) }}
          </div>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="resetOpenForm(); openDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmOpen">确认开台</el-button>
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
import { getTableById, tableList } from '@/api/ol_res_api/table'
import { cancelOrder, createOrder, getOrderById, getOrderItemByOrderId, payOrder } from '@/api/ol_res_api/order'
import { getDishById, getDishList } from '@/api/ol_res_api/dish'
import { getNicknameById, getWxInfo } from '@/api/user'

export default {
  name: 'TableIndex',
  filters: {
    stateFilter(state) {
      const stateMap = {
        0: 'info',
        1: 'warning'
      }
      return stateMap[state]
    },
    stateTextFilter(state) {
      const stateMap = {
        0: '空闲',
        1: '占用'
      }
      return stateMap[state]
    }
  },
  data() {
    return {
      // 开台相关（重构）
      openDialog: false,
      openForm: {
        id: 0,
        no: '', // 桌台号
        username: '', // 顾客姓名
        customerNum: 1,
        amount: 0 // 自动计算的总金额
      },
      openRules: {
        username: [{ required: true, message: '请输入顾客姓名', trigger: 'blur' }],
        // 新增：总金额校验（至少选择1个菜品）
        amount: [{
          required: true,
          validator: (rule, value, callback) => {
            if (value <= 0) {
              callback(new Error('请至少选择一款菜品'))
            } else {
              callback()
            }
          },
          trigger: 'change'
        }]
      },

      // 菜品列表（含数量字段）
      dishList: [],
      tables: [],
      // 移除筛选相关变量
      drawerVisible: false,
      currentDetailTable: null,

      // 确认弹窗相关
      confirmDialog: false,
      confirmTitle: '',
      confirmMessage: '',
      confirmLoading: false,
      confirmAction: ''
    }
  },
  async created() {
    await this.initTables()
    // setInterval(async() => {
    //   await this.initTables() // 实时更新
    // }, 5000)
  },
  methods: {
    async initTables() {
      try {
        // 1. 获取桌台列表
        const tableRes = await tableList()
        const tableDataList = tableRes.data || []
        // 清空原有数据，避免旧数据干扰
        this.tables = []
        // 2. 遍历桌台列表（用for...of + 索引，避免闭包问题）
        for (let i = 0; i < tableDataList.length; i++) {
          const tableItem = tableDataList[i]
          // 初始化单个桌台对象（包含默认值，避免undefined）
          const newTable = {
            id: tableItem.id || '',
            no: tableItem.no || '',
            capacity: tableItem.capacity || '',
            state: tableItem.state || 0, // 默认空闲0
            startTime: tableItem.startTime || '',
            username: '', // 用户名
            orderId: 0,
            orderNo: '', // 订单号
            amount: 0, // 金额默认0
            orders: [] // 提前初始化订单数组，避免越界
          }
          // 3. 处理绑定订单（做空值保护：bindOrder为空则跳过）
          if (tableItem.bindOrder) {
            try {
              // 获取订单基本信息（async/await替代then嵌套）
              const orderRes = await getOrderById(tableItem.bindOrder)
              const orderData = orderRes.data || {}
              newTable.orderId = tableItem.bindOrder
              const nicknameRes = await getNicknameById(orderData.userId)
              newTable.username = nicknameRes.data
              newTable.orderNo = orderData.orderNo || '暂无'
              newTable.amount = orderData.totalAmount || 0
              // 获取订单项列表
              const orderItemRes = await getOrderItemByOrderId(tableItem.bindOrder)
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
              newTable.orders = orderItems // 赋值订单项
            } catch (orderErr) {
              console.error(`获取订单${tableItem.bindOrder}失败：`, orderErr)
              newTable.username = '订单信息加载失败'
            }
          }

          // 4. 将初始化完成的桌台对象添加到数组（push避免下标越界）
          this.tables.push(newTable)
        }

        console.log('tables初始化完成：', this.tables)
        // 若有筛选功能，刷新筛选列表
        if (this.statusFilter) {
          this.filterTables()
        }
      } catch (err) {
        console.error('桌台数据初始化失败：', err)
        this.$message.error('桌台数据加载失败，请重试')
      }
    },
    viewTableDetail(table) {
      this.currentDetailTable = table
      this.drawerVisible = true
    },
    getStateClass(state) {
      const map = { 0: 'info', 1: 'warning' }
      return map[state] || 'info'
    },
    // 格式化时间
    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0') + ' ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
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

    /**
     * 打开开台弹窗（需传入桌台号）
     * @param {Integer} tableId- 桌台号
     */
    async openOpenDialog(tableId) {
      // 重置表单和菜品列表
      this.resetOpenForm()
      // 赋值id+桌台号
      this.openForm.id = tableId
      const tableRes = await getTableById(tableId)
      this.openForm.no = tableRes.data.no
      // 获取菜品列表并初始化数量为0
      await this.getDishList()
      // 显示弹窗
      this.openDialog = true
    },

    /**
     * 获取菜品列表
     */
    async getDishList() {
      try {
        const res = await getDishList()
        // 第一步：过滤出 isOpen 为 1 的菜品；第二步：给符合条件的菜品添加 quantity 字段
        this.dishList = res.data
          .filter(item => item.isOpen === 1) // 只保留启用（isOpen=1）的菜品
          .map(item => ({
            ...item,
            quantity: 0 // 初始化数量为0
          }))
      } catch (error) {
        this.$message.error('获取菜品列表失败：' + error.message)
        console.error(error)
      }
    },

    /**
     * 计算总金额（自动）
     */
    calcTotalAmount() {
      let total = 0
      this.dishList.forEach(dish => {
        total += dish.price * dish.quantity
      })
      this.openForm.amount = total
    },

    /**
     * 重置开台表单
     */
    resetOpenForm() {
      this.openForm = {
        id: 0,
        no: '',
        customerNum: 1,
        username: '',
        amount: 0
      }
      // 重置菜品数量
      if (this.dishList.length) {
        this.dishList.forEach(dish => {
          dish.quantity = 0
        })
      }
      // 重置表单校验
      if (this.$refs.openForm) {
        this.$refs.openForm.resetFields()
      }
    },

    /**
     * 确认开台
     */
    async confirmOpen() {
      try {
        // 表单校验（含总金额校验）
        await this.$refs.openForm.validate()

        // 1. 收集选中的菜品（数量>0的）
        const selectedDishes = this.dishList.filter(dish => dish.quantity > 0).map(dish => ({
          dishId: dish.id,
          dishName: dish.dishName,
          price: dish.price,
          quantity: dish.quantity,
          subtotal: dish.price * dish.quantity
        }))

        // 2. 执行开台逻辑（替对接后端orderDTO）
        const createOrderData = {
          tableId: this.openForm.no,
          userId: this.openForm.username,
          customerNum: this.openForm.customerNum,
          orderItemList: selectedDishes
        }

        await createOrder(createOrderData)

        // 3. 提示+关闭弹窗
        this.$message.success('开台成功！')
        this.openDialog = false

        // 4. 刷新桌台列表
        await this.initTables()
      } catch (error) {
        this.$message.error('开台失败：' + (error.message || '未知错误'))
        console.error(error)
      }
    },

    // 结账操作
    checkoutTable(table) {
      if (!table) return
      this.currentTable = table
      this.confirmTitle = '确认结账'
      this.confirmMessage = '桌台 ' + table.no + ' 消费金额 ¥' + table.amount.toFixed(2) + '，是否确认结账？'
      this.confirmAction = 'checkout'
      this.confirmDialog = true
    },
    // 取消操作
    cancelTable(table) {
      if (!table) return
      this.currentTable = table
      this.confirmTitle = '确认取消'
      this.confirmMessage = '确定取消桌台 ' + table.no + ' 的占用状态吗？(订单状态将为取消)'
      this.confirmAction = 'cancel'
      this.confirmDialog = true
    },

    // 处理确认操作
    async handleConfirm() {
      const self = this
      if (!self.currentTable) {
        self.confirmLoading = false
        self.confirmDialog = false
        self.$message.error('操作失败：未选择桌台')
        return
      }

      self.confirmLoading = true
      switch (self.confirmAction) {
        case 'checkout':
          // 结账后恢复为空闲状态
          await payOrder(self.currentTable.orderId)
          self.currentTable.state = 0
          self.currentTable.username = ''
          self.currentTable.amount = 0
          self.currentTable.orders = []
          self.$message.success('结账成功！')
          break
        case 'cancel':
          // 执行取消订单逻辑
          await cancelOrder(self.currentTable.orderId)
          self.currentTable.state = 0
          self.currentTable.username = ''
          self.currentTable.amount = 0
          self.currentTable.orders = []
          self.$message.success('取消成功！')
          break
      }
      self.confirmLoading = false
      self.confirmDialog = false

      if (self.currentDetailTable && self.currentDetailTable.id === self.currentTable.id) {
        self.currentDetailTable = Object.assign({}, self.currentTable)
      }
    }
  }
}
</script>

<style scoped>
.table-index {
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
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.table-list {
  margin-top: 10px;
}

.table-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  border-top: 4px solid #ddd;
  cursor: pointer;
}

.table-card:hover {
  transform: translateY(-5px);
}

.table-card.is-active {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 只保留空闲/占用状态样式 */
.table-card.info { border-top-color: #409EFF; }
.table-card.warning { border-top-color: #E6A23C; }

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.table-no {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.table-info {
  color: #666;
  font-size: 14px;
  line-height: 1.8;
}

.table-info .amount {
  font-size: 16px;
  font-weight: bold;
  color: #e6a23c;
  margin-top: 5px;
}

.table-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

/* 详情抽屉样式 */
.table-detail {
  padding: 0 10px;
}

/* 空状态提示 */
.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.detail-card {
  height: auto;
  overflow-y: auto;
  border: 1px solid #ebeef5;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

/* 信息表单样式 */
.info-form {
  margin-bottom: 0;
}
.info-form .el-form-item {
  margin-bottom: 18px;
}
.info-form .el-form-item:last-child {
  margin-bottom: 0;
}
.info-form .el-form-item__content {
  line-height: 32px;
}

.highlight {
  color: #e6a23c;
  font-weight: bold;
}

.amount-text {
  color: #f56c6c;
  font-size: 18px;
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
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.detail-footer {
  display: flex;
  padding: 15px 20px;
  background-color: #fff;
  border-top: 1px solid #eee;
  justify-content: flex-end;
  margin-top: 10px;
}

.detail-footer .el-button {
  margin-left: 10px;
}
</style>
