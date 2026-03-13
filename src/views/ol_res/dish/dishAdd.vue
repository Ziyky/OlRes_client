<template>
  <div class="createPost-container">
    <el-form ref="dishForm" :model="dishForm" :rules="rules" class="form-container">

      <div class="createPost-main-container">
        <el-row>

          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;width: 300px" prop="title" label="菜品名称">
              <el-input v-model="dishForm.name" :maxlength="20" name="name" required />
            </el-form-item>
          </el-col>

          <el-col :span="20">
            <el-upload
              ref="uploadRef"
              :headers="uploadHeaders"
              :file-list="fileList"
              class="upload-demo"
              :auto-upload="false"
              action="http://localhost:8080/upload"
              multiple
              :limit="1"
              :on-exceed="handleExceed"
              :on-success="handleSuccess"
              :on-error="handleError"
            >
              <el-button type="primary">点击上传图片</el-button>
            </el-upload>
          </el-col>

          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;width: 400px;" prop="title" label="菜品介绍">
              <el-input v-model="dishForm.description" name="name" required />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;width: 400px;" prop="title" label="所属目录">
              <el-select v-model="dishForm.categoryName" placeholder="请选择菜品分类" style="width: 240px">
                <el-option
                  v-for="item in categoryList"
                  :key="item.categoryId"
                  :label="item.categoryName"
                  :value="item.categoryName"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item style="margin-bottom: 40px;width: 200px;" prop="title" label="成本">
              <el-input v-model="dishForm.costPrice" name="name" required />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item style="margin-bottom: 40px;width: 200px;" prop="title" label="定价">
              <el-input v-model="dishForm.price" name="name" required />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item style="margin-bottom: 40px;width: 200px;" prop="title" label="库存">
              <el-input v-model="dishForm.stock" name="name" required />
            </el-form-item>
          </el-col>

        </el-row>
        <el-button v-loading="loading" type="primary" @click="submitForm">
          提交修改<el-icon class="el-icon--right" />
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { validURL } from '@/utils/validate'
import { getCategoryList } from '@/api/ol_res_api/category'
import { Message } from 'element-ui'
import { addDish } from '@/api/ol_res_api/dish'

export default {
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必传项'))
      } else {
        callback()
      }
    }
    const validateSourceUri = (rule, value, callback) => {
      if (value) {
        if (validURL(value)) {
          callback()
        } else {
          this.$message({
            message: '外链url填写不正确',
            type: 'error'
          })
          callback(new Error('外链url填写不正确'))
        }
      } else {
        callback()
      }
    }
    return {
      dishForm: {
        name: '',
        imgUrl: '',
        description: '',
        costPrice: '',
        price: '',
        stock: 0,
        categoryId: 0,
        categoryName: '',
        isOpen: 0
      },
      categoryList: [{}],
      fileList: [],
      loading: false,
      rules: {
        image_uri: [{ validator: validateRequire }],
        title: [{ validator: validateRequire }],
        content: [{ validator: validateRequire }],
        source_uri: [{ validator: validateSourceUri, trigger: 'blur' }]
      },
      tempRoute: {},
      uploadHeaders: {
        Authorization: this.$store.getters.token
      }
    }
  },
  async created() {
    // 获取目录信息
    const result = await getCategoryList()
    this.categoryList = result.data

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    handleExceed() {
      Message.warning('上传文件数只能为一个')
    },
    submitForm() {
      this.loading = true
      // 提交表单
      this.$refs.uploadRef.submit()
      // 进入图片上传函数
    },
    handleSuccess(res) {
      this.dishForm.imgUrl = res.data
      // 更改所属目录id
      for (let i = 0; i < this.categoryList.length; i++) {
        if (this.dishForm.categoryName === this.categoryList[i].categoryName) { this.dishForm.categoryId = this.categoryList[i].id }
      }

      addDish(this.dishForm).then(() => {
        Message.success('新增菜品成功')
        this.$router.push('/dish/index')
      }
      )
      this.loading = false
    },
    handleError() {
      Message.error('图片上传失败')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
