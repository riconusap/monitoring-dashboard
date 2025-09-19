<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <template #header>
        <div class="login-header">
          <el-icon class="header-icon" :size="32">
            <Monitor />
          </el-icon>
          <h2>Monitoring Dashboard</h2>
          <p>Please sign in to your account</p>
        </div>
      </template>

      <el-form
        ref="loginFormRef"
        :model="credentials"
        :rules="rules"
        @submit.prevent="handleLogin"
        label-position="top"
        size="large"
      >
        <el-form-item label="Username" prop="username">
          <el-input
            v-model="credentials.username"
            placeholder="Enter your username"
            :disabled="isLoading"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input
            v-model="credentials.password"
            type="password"
            placeholder="Enter your password"
            :disabled="isLoading"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-alert
          v-if="error"
          :title="error"
          type="error"
          :closable="false"
          show-icon
          class="error-alert"
        />

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="isLoading"
            :disabled="!credentials.username || !credentials.password"
            @click="handleLogin"
            class="login-button"
          >
            <el-icon v-if="!isLoading"><CircleCheck /></el-icon>
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </el-button>
        </el-form-item>
      </el-form>

      <el-divider>Demo - Click to Auto Fill</el-divider>
      
      <div class="demo-credentials">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-card class="demo-card" shadow="hover" @click="fillCredentials('admin', 'admin123')">
              <el-tag type="success" size="small">Administrator</el-tag>
              <p><strong>admin</strong> / admin123</p>
              <div class="card-hint">Full Access</div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="demo-card" shadow="hover" @click="fillCredentials('user', 'user123')">
              <el-tag type="info" size="small">User</el-tag>
              <p><strong>user</strong> / user123</p>
              <div class="card-hint">Limited Access</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
import { Monitor, User, Lock, CircleCheck } from '@element-plus/icons-vue'

export default {
  name: 'LoginView',
  components: {
    Monitor,
    User,
    Lock,
    CircleCheck
  },
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      isLoading: false,
      error: null,
      rules: {
        username: [
          { required: true, message: 'Please enter username', trigger: 'blur' },
          { min: 3, message: 'Username must be at least 3 characters', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'Please enter password', trigger: 'blur' },
          { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    fillCredentials(username, password) {
      this.credentials.username = username
      this.credentials.password = password
      this.error = null
      
      this.$message.success({
        message: `Credentials auto-filled for ${username}`,
        type: 'success',
        duration: 2000
      })
      
      this.$notify({
        title: 'Auto Fill',
        message: `You can now click "Sign In" to login as ${username}`,
        type: 'info',
        duration: 3000,
        position: 'top-right'
      })
    },

    async handleLogin() {
      try {
        const valid = await this.$refs.loginFormRef.validate()
        if (!valid) return

        this.isLoading = true
        this.error = null
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Simple authentication check
        if (
          (this.credentials.username === 'admin' && this.credentials.password === 'admin123') ||
          (this.credentials.username === 'user' && this.credentials.password === 'user123')
        ) {
          localStorage.setItem('auth_token', 'demo_token')
          localStorage.setItem('auth_user', JSON.stringify({
            username: this.credentials.username,
            role: this.credentials.username === 'admin' ? 'admin' : 'user'
          }))
          
          this.$message.success('Login successful!')
          this.$notify({
            title: 'Welcome!',
            message: `Logged in as ${this.credentials.username}`,
            type: 'success',
            duration: 3000
          })
          this.$router.push('/dashboard')
        } else {
          this.error = 'Invalid username or password'
          this.$message.error('Login failed!')
        }
      } catch (error) {
        this.error = 'Login failed. Please try again.'
        this.$message.error('An error occurred during login')
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
}

.login-header {
  text-align: center;
  margin-bottom: 0;
}

.header-icon {
  color: #409eff;
  margin-bottom: 16px;
}

.login-header h2 {
  color: #303133;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.login-header p {
  color: #606266;
  font-size: 14px;
  margin: 0;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.error-alert {
  margin-bottom: 20px;
}

.demo-credentials {
  margin-top: 16px;
}

.demo-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.demo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.demo-card:active {
  transform: translateY(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.demo-card p {
  margin: 8px 0 4px 0;
  font-size: 12px;
  color: #606266;
}

.card-hint {
  font-size: 10px;
  color: #909399;
  margin-top: 4px;
  font-style: italic;
}

.demo-card::before {
  content: '👆 Click to auto-fill';
  position: absolute;
  top: 0px;
  right: 0px;
  background: #409eff;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  font-weight: 500;
  white-space: nowrap;
  z-index: 999;
}

.demo-card:hover::before {
  opacity: 1;
}

:deep(.el-form-item__label) {
  color: #303133;
  font-weight: 600;
}

:deep(.el-card__header) {
  padding: 32px 32px 0 32px;
}

:deep(.el-card__body) {
  padding: 32px;
}

:deep(.el-divider__text) {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }
  
  :deep(.el-card__header),
  :deep(.el-card__body) {
    padding: 24px;
  }
  
  .demo-card::before {
    display: none;
  }
}
</style>