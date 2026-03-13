<template>
  <div class="app-container">
    <!-- 新增/编辑按钮 -->
    <div class="table-toolbar" style="margin-bottom: 10px;">
      <el-button type="primary" icon="el-icon-plus" @click="openAddDialog">
        新增桌台
      </el-button>
    </div>

    <!-- 桌台管理表格 -->
    <el-table :data="tableList" border fit highlight-current-row style="width: 100%">
      <!-- ID列 -->
      <el-table-column align="center" label="ID">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <!-- 桌台号列 -->
      <el-table-column  align="center" label="桌台号">
        <template slot-scope="scope">
          <span>{{ scope.row.no }}</span>
        </template>
      </el-table-column>

      <!-- 桌台容量列 -->
      <el-table-column align="center" label="桌台容量">
        <template slot-scope="scope">
          <span>{{ scope.row.capacity }}人</span>
        </template>
      </el-table-column>

      <!-- 操作列（编辑/删除） -->
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <!-- 编辑按钮 -->
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="openEditDialog(scope.row)"
          >
            修改
          </el-button>

          <!-- 删除按钮 -->
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑桌台弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="tableFormRef"
        :model="tableForm"
        :rules="tableRules"
      >
        <el-form-item label="桌台号" prop="no">
          <el-input
            v-model="tableForm.no"
            placeholder="请输入桌台号（如01、02）"
          />
        </el-form-item>
        <el-form-item label="桌台容量" prop="capacity">
          <el-input-number
            v-model="tableForm.capacity"
            :min="1"
            :max="20"
            placeholder="请输入桌台可容纳人数"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { addTable, deleteTable, tableList, updateTable } from '@/api/ol_res_api/table'

export default {
  name: 'TableManageList',
  data() {
    return {
      // 桌台列表数据
      tableList: [
        {
          id: 0,
          no: '',
          capacity: 0,
          bindOrder: ''
        }
      ],
      // 列表加载状态
      listLoading: true,
      // 弹窗相关
      dialogVisible: false, // 弹窗显示状态
      dialogTitle: '', // 弹窗标题（新增/编辑）
      // 桌台表单数据
      tableForm: {
        id: '', // 桌台ID（编辑时赋值，新增时为空）
        no: '', // 桌台号
        capacity: 1 // 桌台容量，默认1人
      },
      // 表单校验规则
      tableRules: {
        capacity: [
          { required: true, message: '请输入桌台容量', trigger: 'blur' },
          { type: 'number', min: 1, max: 20, message: '桌台容量需在1-20人之间', trigger: 'blur' }
        ]
      }
    }
  },
  async created() {
    // 页面加载时获取桌台列表
    await this.getTableData()
  },
  methods: {
    async getTableData() {
      try {
        this.listLoading = true
        const res = await tableList()
        this.tableList = res.data
      } catch (error) {
        this.$message.error('获取桌台列表失败：' + (error.message || '未知错误'))
        console.error('桌台列表请求失败：', error)
      } finally {
        this.listLoading = false
      }
    },
    /**
     * 打开新增桌台弹窗
     */
    openAddDialog() {
      // 重置表单
      this.resetForm()
      // 设置弹窗标题
      this.dialogTitle = '新增桌台'
      // 显示弹窗
      this.dialogVisible = true
    },

    /**
     * 打开编辑桌台弹窗
     * @param {Object} row - 当前行数据
     */
    openEditDialog(row) {
      // 重置表单
      this.resetForm()
      // 赋值表单数据
      this.tableForm = { ...row }
      // 设置弹窗标题
      this.dialogTitle = '编辑桌台'
      // 显示弹窗
      this.dialogVisible = true
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.tableForm = {
        id: '',
        no: '',
        capacity: 1
      }
      // 重置表单校验状态
      if (this.$refs.tableFormRef) {
        this.$refs.tableFormRef.resetFields()
      }
    },

    /**
     * 提交表单（新增/编辑）
     */
    async submitForm() {
      try {
        // 表单校验
        await this.$refs.tableFormRef.validate()

        // 判断是新增还是编辑
        if (this.tableForm.id) {
          // 编辑桌台
          await updateTable(this.tableForm)
          this.$message.success('桌台编辑成功！')
        } else {
          // 新增桌台
          await addTable(this.tableForm)
          this.$message.success('桌台新增成功！')
        }

        // 关闭弹窗
        this.dialogVisible = false
        // 重新获取列表数据
        await this.getTableData()
      } catch (error) {
        this.$message.error('操作失败：' + (error.message || '未知错误'))
        console.error('提交桌台失败：', error)
      }
    },

    /**
     * 删除桌台
     * @param {Number|String} id - 桌台ID
     */
    async handleDelete(id) {
      // 二次确认删除
      try {
        await this.$confirm(
          '此操作将永久删除该桌台, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        // 调用删除接口
        await deleteTable(id)
        this.$message.success('桌台删除成功！')
        // 重新获取列表数据
        await this.getTableData()
      } catch (error) {
        // 取消删除时的提示（可注释）
        if (error !== 'cancel') {
          this.$message.error('删除失败：' + (error.message || '未知错误'))
          console.error('删除桌台失败：', error)
        }
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.table-toolbar {
  display: flex;
  justify-content: flex-start;
}

.dialog-footer {
  text-align: center;
}
</style>
