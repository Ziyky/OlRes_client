<template>
  <div class="system-settings">
    <!-- 页面标题 -->
    <div class="settings-header">
      <h2>系统配置</h2>
      <p class="header-desc">管理系统基本设置和参数配置</p>
    </div>

    <!-- 标签页导航 -->
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 基础设置 -->
      <el-tab-pane label="基础设置" name="basic">
        <div class="settings-content">
          <el-form
            ref="basicForm"
            :model="settings.basic"
            :rules="basicRules"
            label-width="150px"
            class="settings-form"
          >
            <el-form-item label="系统名称" prop="systemName">
              <el-input
                v-model="settings.basic.systemName"
                placeholder="请输入系统名称"
                clearable
              />
            </el-form-item>

            <el-form-item label="系统版本" prop="version">
              <el-input
                v-model="settings.basic.version"
                placeholder="如: 1.0.0"
                clearable
              />
            </el-form-item>

            <el-form-item label="系统描述" prop="description">
              <el-input
                v-model="settings.basic.description"
                type="textarea"
                placeholder="请输入系统描述信息"
                :rows="4"
                show-word-limit
                maxlength="500"
              />
            </el-form-item>

            <el-form-item label="系统Logo" prop="logo">
              <el-upload
                ref="logoUpload"
                class="upload-demo"
                action="/api/upload"
                :auto-upload="false"
                :limit="1"
                accept="image/png,image/jpeg,image/gif"
                list-type="picture-card"
                :file-list="logoFileList"
                @change="handleLogoChange"
              >
                <i class="el-icon-plus" />
              </el-upload>
              <div class="el-upload__tip">只能上传jpg/png/gif文件，且不超过2MB</div>
            </el-form-item>

            <el-form-item label="所有者" prop="owner">
              <el-input
                v-model="settings.basic.owner"
                placeholder="请输入系统所有者名称"
                clearable
              />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 功能设置 -->
      <el-tab-pane label="功能设置" name="feature">
        <div class="settings-content">
          <el-form
            ref="featureForm"
            :model="settings.feature"
            :rules="featureRules"
            label-width="150px"
            class="settings-form"
          >
            <el-form-item label="启用功能" prop="enabledFeatures">
              <el-checkbox-group v-model="settings.feature.enabledFeatures">
                <el-checkbox label="用户管理" />
                <el-checkbox label="权限管理" />
                <el-checkbox label="日志管理" />
                <el-checkbox label="系统监控" />
                <el-checkbox label="数据备份" />
                <el-checkbox label="消息通知" />
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="默认语言" prop="defaultLanguage">
              <el-select
                v-model="settings.feature.defaultLanguage"
                placeholder="请选择默认语言"
              >
                <el-option label="中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
                <el-option label="日本語" value="ja-JP" />
              </el-select>
            </el-form-item>

            <el-form-item label="默认主题" prop="defaultTheme">
              <el-select
                v-model="settings.feature.defaultTheme"
                placeholder="请选择默认主题"
              >
                <el-option label="浅色" value="light" />
                <el-option label="深色" value="dark" />
                <el-option label="自动" value="auto" />
              </el-select>
            </el-form-item>

            <el-form-item label="会话超时时长" prop="sessionTimeout">
              <el-input-number
                v-model="settings.feature.sessionTimeout"
                :min="5"
                :max="1440"
                placeholder="请输入分钟数"
              />
              <span class="unit">分钟</span>
            </el-form-item>

            <el-form-item label="启用两步验证" prop="enableTwoFactor">
              <el-switch v-model="settings.feature.enableTwoFactor" />
            </el-form-item>

            <el-form-item label="启用操作日志" prop="enableOperationLog">
              <el-switch v-model="settings.feature.enableOperationLog" />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 邮件设置 -->
      <el-tab-pane label="邮件设置" name="email">
        <div class="settings-content">
          <el-form
            ref="emailForm"
            :model="settings.email"
            :rules="emailRules"
            label-width="150px"
            class="settings-form"
          >
            <el-form-item label="SMTP服务器" prop="smtpServer">
              <el-input
                v-model="settings.email.smtpServer"
                placeholder="如: smtp.gmail.com"
                clearable
              />
            </el-form-item>

            <el-form-item label="SMTP端口" prop="smtpPort">
              <el-input-number
                v-model="settings.email.smtpPort"
                :min="1"
                :max="65535"
              />
            </el-form-item>

            <el-form-item label="发送者邮箱" prop="senderEmail">
              <el-input
                v-model="settings.email.senderEmail"
                placeholder="请输入发送者邮箱"
                clearable
              />
            </el-form-item>

            <el-form-item label="邮箱密码" prop="senderPassword">
              <el-input
                v-model="settings.email.senderPassword"
                type="password"
                placeholder="请输入邮箱密码或授权码"
                clearable
                show-password
              />
            </el-form-item>

            <el-form-item label="是否启用SSL" prop="enableSSL">
              <el-switch v-model="settings.email.enableSSL" />
            </el-form-item>

            <el-form-item label="测试邮箱">
              <el-input
                v-model="testEmail"
                placeholder="请输入测试邮箱地址"
                clearable
              />
              <el-button
                type="primary"
                :loading="emailTestLoading"
                @click="sendTestEmail"
              >
                发送测试邮件
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 存储设置 -->
      <el-tab-pane label="存储设置" name="storage">
        <div class="settings-content">
          <el-form
            ref="storageForm"
            :model="settings.storage"
            :rules="storageRules"
            label-width="150px"
            class="settings-form"
          >
            <el-form-item label="存储类型" prop="storageType">
              <el-select
                v-model="settings.storage.storageType"
                placeholder="请选择存储类型"
                @change="handleStorageTypeChange"
              >
                <el-option label="本地存储" value="local" />
                <el-option label="OSS" value="oss" />
                <el-option label="S3" value="s3" />
                <el-option label="数据库" value="database" />
              </el-select>
            </el-form-item>

            <el-form-item label="最大上传文件大小" prop="maxFileSize">
              <el-input-number
                v-model="settings.storage.maxFileSize"
                :min="1"
                :max="5000"
              />
              <span class="unit">MB</span>
            </el-form-item>

            <el-form-item label="允许的文件类型" prop="allowedFileTypes">
              <el-input
                v-model="settings.storage.allowedFileTypes"
                placeholder="如: pdf,doc,docx,xls,xlsx 用逗号分隔"
                clearable
              />
            </el-form-item>

            <!-- 条件显示：本地存储 -->
            <div v-if="settings.storage.storageType === 'local'">
              <el-form-item label="存储路径" prop="localStoragePath">
                <el-input
                  v-model="settings.storage.localStoragePath"
                  placeholder="请输入本地存储路径"
                  clearable
                />
              </el-form-item>
            </div>

            <!-- 条件显示：OSS -->
            <div v-if="settings.storage.storageType === 'oss'">
              <el-form-item label="Access Key ID" prop="ossAccessKeyId">
                <el-input
                  v-model="settings.storage.ossAccessKeyId"
                  clearable
                />
              </el-form-item>
              <el-form-item label="Access Key Secret" prop="ossAccessKeySecret">
                <el-input
                  v-model="settings.storage.ossAccessKeySecret"
                  type="password"
                  clearable
                  show-password
                />
              </el-form-item>
              <el-form-item label="Bucket" prop="ossBucket">
                <el-input
                  v-model="settings.storage.ossBucket"
                  clearable
                />
              </el-form-item>
              <el-form-item label="Region" prop="ossRegion">
                <el-input
                  v-model="settings.storage.ossRegion"
                  clearable
                />
              </el-form-item>
            </div>

            <!-- 条件显示：S3 -->
            <div v-if="settings.storage.storageType === 's3'">
              <el-form-item label="Access Key" prop="s3AccessKey">
                <el-input v-model="settings.storage.s3AccessKey" clearable />
              </el-form-item>
              <el-form-item label="Secret Key" prop="s3SecretKey">
                <el-input
                  v-model="settings.storage.s3SecretKey"
                  type="password"
                  clearable
                  show-password
                />
              </el-form-item>
              <el-form-item label="Bucket" prop="s3Bucket">
                <el-input v-model="settings.storage.s3Bucket" clearable />
              </el-form-item>
              <el-form-item label="Region" prop="s3Region">
                <el-input v-model="settings.storage.s3Region" clearable />
              </el-form-item>
            </div>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 安全设置 -->
      <el-tab-pane label="安全设置" name="security">
        <div class="settings-content">
          <el-form
            ref="securityForm"
            :model="settings.security"
            :rules="securityRules"
            label-width="150px"
            class="settings-form"
          >
            <el-form-item label="密码最小长度" prop="passwordMinLength">
              <el-input-number
                v-model="settings.security.passwordMinLength"
                :min="6"
                :max="20"
              />
            </el-form-item>

            <el-form-item label="密码过期天数" prop="passwordExpiryDays">
              <el-input-number
                v-model="settings.security.passwordExpiryDays"
                :min="0"
                :max="365"
              />
              <span class="unit">天（0表示不过期）</span>
            </el-form-item>

            <el-form-item label="失败登录尝试次数限制" prop="maxLoginAttempts">
              <el-input-number
                v-model="settings.security.maxLoginAttempts"
                :min="1"
                :max="100"
              />
            </el-form-item>

            <el-form-item label="账户锁定时长" prop="accountLockoutDuration">
              <el-input-number
                v-model="settings.security.accountLockoutDuration"
                :min="1"
                :max="1440"
              />
              <span class="unit">分钟</span>
            </el-form-item>

            <el-form-item label="启用IP白名单" prop="enableIpWhitelist">
              <el-switch v-model="settings.security.enableIpWhitelist" />
            </el-form-item>

            <el-form-item
              v-if="settings.security.enableIpWhitelist"
              label="IP白名单"
              prop="ipWhitelist"
            >
              <el-input
                v-model="settings.security.ipWhitelist"
                type="textarea"
                placeholder="每行一个IP地址"
                :rows="4"
              />
            </el-form-item>

            <el-form-item label="启用数据加密" prop="enableEncryption">
              <el-switch v-model="settings.security.enableEncryption" />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 高级设置 -->
      <el-tab-pane label="高级设置" name="advanced">
        <div class="settings-content">
          <el-form
            ref="advancedForm"
            :model="settings.advanced"
            :rules="advancedRules"
            label-width="150px"
            class="settings-form"
          >
            <el-form-item label="日志级别" prop="logLevel">
              <el-select
                v-model="settings.advanced.logLevel"
                placeholder="请选择日志级别"
              >
                <el-option label="DEBUG" value="DEBUG" />
                <el-option label="INFO" value="INFO" />
                <el-option label="WARN" value="WARN" />
                <el-option label="ERROR" value="ERROR" />
              </el-select>
            </el-form-item>

            <el-form-item label="日志保留天数" prop="logRetentionDays">
              <el-input-number
                v-model="settings.advanced.logRetentionDays"
                :min="1"
                :max="365"
              />
              <span class="unit">天</span>
            </el-form-item>

            <el-form-item label="API请求超时" prop="apiTimeout">
              <el-input-number
                v-model="settings.advanced.apiTimeout"
                :min="5"
                :max="120"
              />
              <span class="unit">秒</span>
            </el-form-item>

            <el-form-item label="数据库连接池大小" prop="dbPoolSize">
              <el-input-number
                v-model="settings.advanced.dbPoolSize"
                :min="5"
                :max="200"
              />
            </el-form-item>

            <el-form-item label="缓存过期时间" prop="cacheExpireTime">
              <el-input-number
                v-model="settings.advanced.cacheExpireTime"
                :min="1"
                :max="3600"
              />
              <span class="unit">秒</span>
            </el-form-item>

            <el-form-item label="启用API限流" prop="enableRateLimit">
              <el-switch v-model="settings.advanced.enableRateLimit" />
            </el-form-item>

            <el-form-item
              v-if="settings.advanced.enableRateLimit"
              label="限流速率（请求/秒）"
              prop="rateLimit"
            >
              <el-input-number
                v-model="settings.advanced.rateLimit"
                :min="1"
                :max="10000"
              />
            </el-form-item>

            <el-form-item label="启用定时任务" prop="enableScheduledTasks">
              <el-switch v-model="settings.advanced.enableScheduledTasks" />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 操作按钮 -->
    <div class="settings-actions">
      <el-button type="primary" :loading="saveLoading" @click="saveSettings">
        保存配置
      </el-button>
      <el-button @click="resetSettings">重置</el-button>
      <el-button type="info" @click="exportSettings">导出配置</el-button>
      <el-button type="warning" @click="restoreSettings">恢复默认</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemSettings',
  data() {
    return {
      activeTab: 'basic',
      saveLoading: false,
      emailTestLoading: false,
      testEmail: '',
      logoFileList: [],

      settings: {
        basic: {
          systemName: '系统管理平台',
          version: '1.0.0',
          description: '企业级系统管理平台',
          logo: '',
          owner: '管理员'
        },
        feature: {
          enabledFeatures: ['用户管理', '权限管理', '日志管理'],
          defaultLanguage: 'zh-CN',
          defaultTheme: 'light',
          sessionTimeout: 30,
          enableTwoFactor: false,
          enableOperationLog: true
        },
        email: {
          smtpServer: '',
          smtpPort: 587,
          senderEmail: '',
          senderPassword: '',
          enableSSL: true
        },
        storage: {
          storageType: 'local',
          maxFileSize: 100,
          allowedFileTypes: 'pdf,doc,docx,xls,xlsx,png,jpg,jpeg,gif',
          localStoragePath: '/storage/files',
          ossAccessKeyId: '',
          ossAccessKeySecret: '',
          ossBucket: '',
          ossRegion: '',
          s3AccessKey: '',
          s3SecretKey: '',
          s3Bucket: '',
          s3Region: ''
        },
        security: {
          passwordMinLength: 8,
          passwordExpiryDays: 90,
          maxLoginAttempts: 5,
          accountLockoutDuration: 30,
          enableIpWhitelist: false,
          ipWhitelist: '',
          enableEncryption: true
        },
        advanced: {
          logLevel: 'INFO',
          logRetentionDays: 30,
          apiTimeout: 30,
          dbPoolSize: 20,
          cacheExpireTime: 3600,
          enableRateLimit: false,
          rateLimit: 100,
          enableScheduledTasks: true
        }
      },

      // 表单验证规则
      basicRules: {
        systemName: [{ required: true, message: '系统名称不能为空', trigger: 'blur' }],
        version: [{ required: true, message: '版本号不能为空', trigger: 'blur' }]
      },
      featureRules: {
        defaultLanguage: [{ required: true, message: '请选择默认语言', trigger: 'change' }],
        sessionTimeout: [{ required: true, message: '请输入会话超时时长', trigger: 'change' }]
      },
      emailRules: {
        smtpServer: [{ required: true, message: 'SMTP服务器不能为空', trigger: 'blur' }],
        senderEmail: [
          { required: true, message: '发送者邮箱不能为空', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ]
      },
      storageRules: {
        storageType: [{ required: true, message: '请选择存储类型', trigger: 'change' }],
        maxFileSize: [{ required: true, message: '请输入最大文件大小', trigger: 'change' }]
      },
      securityRules: {
        passwordMinLength: [
          { required: true, message: '请输入密码最小长度', trigger: 'change' }
        ]
      },
      advancedRules: {
        logLevel: [{ required: true, message: '请选择日志级别', trigger: 'change' }]
      }
    }
  },

  mounted() {
    this.fetchSettings()
  },

  methods: {
    // 获取配置信息
    fetchSettings() {
      // 调用API获取当前设置
      this.$http
        .get('/api/settings')
        .then((response) => {
          if (response.data.success) {
            this.settings = Object.assign(this.settings, response.data.data)
            this.$message.success('配置加载成功')
          }
        })
        .catch(() => {
          this.$message.error('获取配置失败')
        })
    },

    // 保存配置
    saveSettings() {
      // 验证所有表单
      const formRefs = ['basicForm', 'featureForm', 'emailForm', 'storageForm', 'securityForm', 'advancedForm']
      let allValid = true

      formRefs.forEach((formRef) => {
        if (this.$refs[formRef]) {
          this.$refs[formRef].validate((valid) => {
            allValid = allValid && valid
          })
        }
      })

      if (!allValid) {
        this.$message.warning('请填写完整且正确的配置信息')
        return
      }

      this.saveLoading = true
      const data = JSON.parse(JSON.stringify(this.settings))

      this.$http
        .post('/api/settings/save', data)
        .then((response) => {
          if (response.data.success) {
            this.$message.success('配置保存成功')
          } else {
            this.$message.error(response.data.message || '保存失败')
          }
        })
        .catch(() => {
          this.$message.error('保存配置失败')
        })
        .finally(() => {
          this.saveLoading = false
        })
    },

    // 重置表单
    resetSettings() {
      this.$confirm('确定要重置所有配置到上次保存的状态吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.fetchSettings()
          this.$message.success('已重置配置')
        })
        .catch(() => {})
    },

    // 恢复默认配置
    restoreSettings() {
      this.$confirm('确定要恢复到默认配置吗？此操作不可逆！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
        .then(() => {
          this.$http
            .post('/api/settings/restore-default')
            .then((response) => {
              if (response.data.success) {
                this.fetchSettings()
                this.$message.success('已恢复默认配置')
              }
            })
            .catch(() => {
              this.$message.error('恢复失败')
            })
        })
        .catch(() => {})
    },

    // 导出配置
    exportSettings() {
      const dataStr = JSON.stringify(this.settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `系统配置_${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      this.$message.success('配置已导出')
    },

    // 发送测试邮件
    sendTestEmail() {
      if (!this.testEmail) {
        this.$message.warning('请输入测试邮箱地址')
        return
      }

      this.emailTestLoading = true
      this.$http
        .post('/api/settings/send-test-email', {
          email: this.testEmail,
          ...this.settings.email
        })
        .then((response) => {
          if (response.data.success) {
            this.$message.success('测试邮件已发送，请检查邮箱')
          } else {
            this.$message.error(response.data.message || '发送失败')
          }
        })
        .catch(() => {
          this.$message.error('发送测试邮件失败')
        })
        .finally(() => {
          this.emailTestLoading = false
        })
    },

    // 处理Logo上传
    handleLogoChange(file, fileList) {
      this.logoFileList = fileList
    },

    // 存储类型变化
    handleStorageTypeChange() {
      // 重置存储相关配置
      if (this.settings.storage.storageType === 'local') {
        this.settings.storage.localStoragePath = '/storage/files'
      }
    }
  }
}
</script>

<style scoped>
.system-settings {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.system-settings .settings-header {
  margin-bottom: 20px;
}

.system-settings .settings-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 22px;
  font-weight: 600;
}

.system-settings .settings-header .header-desc {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.system-settings .settings-content {
  padding: 20px 0;
}

.system-settings .settings-form {
  max-width: 800px;
}

.system-settings .settings-form .unit {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
}

.system-settings .settings-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  text-align: left;
}

.system-settings .settings-actions .el-button {
  margin-right: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-settings {
    padding: 10px;
  }

  .system-settings .settings-actions .el-button {
    display: block;
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }

  .system-settings .settings-actions .el-button:last-child {
    margin-bottom: 0;
  }
}
</style>
