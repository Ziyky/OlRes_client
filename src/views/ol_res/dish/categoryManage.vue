<template>
  <div class="app-container">
    <!-- 新增/编辑按钮 -->
    <div class="table-toolbar" style="margin-bottom: 10px;">
      <el-button type="primary" icon="el-icon-plus" @click="openAddDialog">
        新增分类
      </el-button>
    </div>

    <!-- 菜品分类表格 -->
    <el-table :data="categoryList" border fit highlight-current-row style="width: 100%">
      <!-- ID列 -->
      <el-table-column align="center" label="ID">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <!-- 分类名称列 -->
      <el-table-column align="center" label="菜品分类名称">
        <template slot-scope="scope">
          <span>{{ scope.row.categoryName }}</span>
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

    <!-- 新增/编辑分类弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="categoryName">
          <el-input
            v-model="categoryForm.categoryName"
            placeholder="请输入菜品分类名称"
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

import { addCategory, deleteCategoryById, getCategoryList, updateCategory } from '@/api/ol_res_api/category'

export default {
  name: 'DishCategoryList',
  data() {
    return {
      // 分类列表数据
      categoryList: [
        {
          id: 0,
          categoryName: ''
        }
      ],
      // 列表加载状态
      listLoading: true,
      // 弹窗相关
      dialogVisible: false, // 弹窗显示状态
      dialogTitle: '', // 弹窗标题（新增/编辑）
      // 分类表单数据
      categoryForm: {
        id: '', // 分类ID（编辑时赋值，新增时为空）
        categoryName: '' // 分类名称
      },
      // 表单校验规则
      categoryRules: {
        categoryName: [
          { required: true, message: '请输入菜品分类名称', trigger: 'blur' },
          { min: 1, max: 20, message: '分类名称长度在1-20个字符之间', trigger: 'blur' }
        ]
      }
    }
  },
  async created() {
    // 页面加载时获取分类列表
    await this.getCategoryData()
  },
  methods: {
    async getCategoryData() {
      try {
        this.listLoading = true
        const res = await getCategoryList()
        this.categoryList = res.data
      } catch (error) {
        this.$message.error('获取菜品分类列表失败：' + (error.message || '未知错误'))
        console.error('分类列表请求失败：', error)
      } finally {
        this.listLoading = false
      }
    },
    /**
     * 打开新增分类弹窗
     */
    openAddDialog() {
      // 重置表单
      this.resetForm()
      // 设置弹窗标题
      this.dialogTitle = '新增菜品分类'
      // 显示弹窗
      this.dialogVisible = true
    },

    /**
     * 打开编辑分类弹窗
     * @param {Object} row - 当前行数据
     */
    openEditDialog(row) {
      // 重置表单
      this.resetForm()
      // 赋值表单数据
      this.categoryForm = { ...row }
      // 设置弹窗标题
      this.dialogTitle = '编辑菜品分类'
      // 显示弹窗
      this.dialogVisible = true
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.categoryForm = {
        id: '',
        categoryName: ''
      }
      // 重置表单校验状态
      if (this.$refs.categoryFormRef) {
        this.$refs.categoryFormRef.resetFields()
      }
    },

    /**
     * 提交表单（新增/编辑）
     */
    async submitForm() {
      try {
        // 表单校验
        await this.$refs.categoryFormRef.validate()

        // 判断是新增还是编辑
        if (this.categoryForm.id) {
          // 编辑分类
          await updateCategory(this.categoryForm.id, this.categoryForm.categoryName)
          this.$message.success('分类编辑成功！')
        } else {
          // 新增分类
          await addCategory(this.categoryForm.categoryName)
          this.$message.success('分类新增成功！')
        }

        // 关闭弹窗
        this.dialogVisible = false
        // 重新获取列表数据
        await this.getCategoryData()
      } catch (error) {
        this.$message.error('操作失败：' + (error.message || '未知错误'))
        console.error('提交分类失败：', error)
      }
    },

    /**
     * 删除分类
     * @param {Number|String} id - 分类ID
     */
    async handleDelete(id) {
      // 二次确认删除
      try {
        await this.$confirm(
          '此操作将永久删除该分类, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        // 调用删除接口
        await deleteCategoryById(id)
        this.$message.success('分类删除成功！')
        // 重新获取列表数据
        await this.getCategoryData()
      } catch (error) {
        // 取消删除时的提示（可注释）
        if (error !== 'cancel') {
          this.$message.error('删除失败：' + (error.message || '未知错误'))
          console.error('删除分类失败：', error)
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
