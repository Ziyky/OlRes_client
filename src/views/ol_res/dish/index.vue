<template>
  <div class="app-container">
    <el-table :data="dishList" border fit highlight-current-row style="width: 100%">

      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="所属目录" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.categoryId }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="菜品名称">
        <template slot-scope="scope">
          <span>{{ scope.row.dishName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="菜品图片" width="120" align="center">
        <template slot-scope="scope">
          <div class="dish-img-container">
            <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/upload/dish"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="(res) => uploadSuccess(res, scope.row)"
              :auto-upload="true"
              :data="{ dishId: scope.row.id }"
            >
              <el-image
                v-if="scope.row.imgUrl"
                :src="scope.row.imgUrl"
                fit="cover"
              />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </div>
        </template>
      </el-table-column>

      <el-table-column align="center" label="菜品介绍">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="成本">
        <template slot-scope="scope">
          <span>{{ scope.row.costPrice }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="定价">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="库存">
        <template slot-scope="scope">
          <span>{{ scope.row.stock }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Status" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.isOpen | statusFilter" class="updownTag" @click="updownDish(row)">
            {{ row.isOpen | statusTextFilter }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <router-link :to="'/dish/Editor/'+scope.row.id">
            <el-button type="primary" size="small" icon="el-icon-edit">
              修改
            </el-button>
          </router-link>
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            style="margin-top: 5px;"
            @click="handleDelete(scope.row.id)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>

import { deleteDish, downDish, getDishList, upDish } from '@/api/ol_res_api/dish'
import { Message } from 'element-ui'
import { getCategoryById } from '@/api/ol_res_api/category'
export default {
  name: 'DishList',
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'info',
        1: 'success'
      }
      return statusMap[status]
    },
    statusTextFilter(status) {
      const statusMap = {
        0: '已下架',
        1: '已上架'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      dishList: [{}],
      listLoading: true,
      uploadHeaders: {
        Authorization: this.$store.getters.token
      }
    }
  },
  async created() {
    await this.rendering()
  },
  methods: {
    uploadSuccess(res, row) {
      Message.success('上传菜品图片成功')
      row.imgUrl = res.data
    },
    async handleDelete(id) {
      // 二次确认删除
      try {
        await this.$confirm(
          '此操作将永久删除该菜品, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        // 调用删除接口
        await deleteDish(id)
        this.$message.success('菜品删除成功！')
        // 重新获取列表数据
        await this.rendering()
      } catch (error) {
        // 取消删除时的提示（可注释）
        if (error !== 'cancel') {
          this.$message.error('删除失败：' + (error.message || '未知错误'))
          console.error('删除菜品失败：', error)
        }
      }
    },
    async rendering() {
      // 拉去菜品信息列表
      const res = await getDishList()
      this.dishList = res.data
      // 渲染菜品目录id 成 目录名字
      for (let i = 0; i < this.dishList.length; i++) {
        // 跳过无分类ID的菜品
        if (!this.dishList[i].categoryId) {
          this.dishList[i].categoryId = '未分类'
        } else {
          const result = await getCategoryById(this.dishList[i].categoryId)
          this.dishList[i].categoryId = result.data.categoryName
        }
      }
    },
    updownDish(row) { // 直接接收行数据，无需手动找index
      try {
        if (row.isOpen === 0) {
          // 调用上架接口
          upDish(row.id)
          Message.success('菜品已上架')
          row.isOpen = 1 // 关键：用=赋值，而非===
        } else {
          // 调用下架接口
          downDish(row.id)
          Message.success('菜品已下架')
          row.isOpen = 0 // 关键：用=赋值，而非===
        }
      } catch (error) {
        // 接口调用失败时提示，且不修改本地状态
        Message.error(`操作失败：${error.message || '服务器异常'}`)
        console.error('上架/下架失败：', error)
      }
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
.updownTag{
  cursor: pointer;
}
</style>
