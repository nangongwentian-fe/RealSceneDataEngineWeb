<template>
  <div class="login-container safe-area-top safe-area-bottom">
    <div class="login-card mobile-card">
      <div class="login-header">
        <div class="logo-container">
          <img src="@/assets/images/logo_03.png" alt="深圳大学Logo" class="szu-logo" />
          <img src="@/assets/images/szuailab.png" alt="深圳大学腾讯云人工智能实验室" class="lab-logo" />
        </div>
        <h2 class="login-title">
          <span class="hidden md:inline">具身智能实景3D数据生产引擎</span>
          <span class="md:hidden">具身智能实景3D数据生产引擎</span>
        </h2>
      </div>

      <el-tabs v-model="activeTab" stretch>
        <el-tab-pane label="登录" name="login">
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form" @keyup.enter="handleLogin">
            <!-- 原登录表单 -->
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" 
                        placeholder="用户名 / 邮箱" 
                        class="mobile-input"
                        size="large" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="loginForm.password" 
                        type="password" 
                        placeholder="密码" 
                        show-password 
                        class="mobile-input"
                        size="large" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" 
                         class="login-button mobile-btn" 
                         :loading="loading" 
                         size="large"
                         @click="handleLogin">登录</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="注册" name="register">
          <el-form ref="regRef" :model="regForm" :rules="regRules" class="login-form" @keyup.enter="handleRegister">
            <el-form-item prop="name">
              <el-input v-model="regForm.name" 
                        placeholder="用户名" 
                        class="mobile-input"
                        size="large" />
            </el-form-item>

            <el-form-item prop="email">
              <el-input v-model="regForm.email" 
                        placeholder="邮箱" 
                        class="mobile-input"
                        size="large" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="regForm.password" 
                        type="password" 
                        placeholder="密码" 
                        show-password 
                        class="mobile-input"
                        size="large" />
            </el-form-item>
            <el-form-item prop="confirm">
              <el-input v-model="regForm.confirm" 
                        type="password" 
                        placeholder="确认密码" 
                        show-password 
                        class="mobile-input"
                        size="large" />
            </el-form-item>

            <el-form-item prop="code">
              <el-input v-model="regForm.code" 
                        placeholder="验证码" 
                        class="mobile-input"
                        size="large">
                <template #suffix>
                  <el-button link 
                             type="primary" 
                             :disabled="count>0 || !canSendCode" 
                             class="mobile-btn"
                             @click="handleSendCode">
                    {{ count>0 ? `${count}s` : '获取验证码' }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" 
                         class="login-button mobile-btn" 
                         :loading="loading" 
                         :disabled="loading || !canRegister" 
                         size="large"
                         @click="handleRegister">注册并登录</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElForm } from 'element-plus';
import type { FormItemRule } from 'element-plus';
import { request } from '@/apis';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import { sendCode, registerApi } from '@/apis/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const activeTab = ref<'login'|'register'>('login');

// 表单引用
const loginFormRef = ref<InstanceType<typeof ElForm>>();

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
};

// 加载状态
const loading = ref(false);

// register part
const regRef = ref<InstanceType<typeof ElForm>>();
const regForm = reactive({ name:'', email:'', code:'', password:'', confirm:'' });

const emailValidator = (_rule:any, v:string, cb:(err?:Error)=>void)=>{
  if(!v) {
    formValidationState.emailValid = false;
    return cb(new Error('请输入邮箱'));
  }   
  const format=/^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(v);
  if(!format) {
    formValidationState.emailValid = false;
    return cb(new Error('邮箱格式不正确'));
  }
  
  request.get('/users/check',{ params:{ email:v }})
    .then(res => {
      if(res.data.emailExists) {
        formValidationState.emailValid = false;
        return cb(new Error('邮箱已注册'));
      }
      formValidationState.emailValid = true;
      cb();
    })
    .catch(() => {
      formValidationState.emailValid = false;
      cb(new Error('验证失败'));
    });
};

const nameValidator = (_rule:any, v:string, cb:(err?:Error)=>void)=>{
  if(!v) {
    formValidationState.nameValid = false;
    return cb(new Error('请输入用户名'));
  }
  if(v.length<2||v.length>20) {
    formValidationState.nameValid = false;
    return cb(new Error('2~20位用户名'));
  }
  
  request.get('/users/check',{ params:{ name:v }})
    .then(res => {
      if(res.data.nameExists) {
        formValidationState.nameValid = false;
        return cb(new Error('用户名已占用'));
      }
      formValidationState.nameValid = true;
      cb();
    })
    .catch(() => {
      formValidationState.nameValid = false;
      cb(new Error('验证失败'));
    });
};

const passwordValidator = (_:any, v:string, cb:(err?:Error)=>void) => {
  if(!v) {
    formValidationState.passwordValid = false;
    return cb(new Error('请输入密码'));
  }
  const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(v);
  if(!isValid) {
    formValidationState.passwordValid = false;
    return cb(new Error('8~20位,含字母和数字'));
  }
  formValidationState.passwordValid = true;
  // 密码变化时重新验证确认密码
  if(regForm.confirm) {
    formValidationState.confirmValid = regForm.confirm === v;
  }
  cb();
};

const confirmValidator = (_:any, v:string, cb:(err?:Error)=>void) => {
  if(!v) {
    formValidationState.confirmValid = false;
    return cb(new Error('请确认密码'));
  }
  const isValid = v === regForm.password;
  if(!isValid) {
    formValidationState.confirmValid = false;
    return cb(new Error('两次密码不一致'));
  }
  formValidationState.confirmValid = true;
  cb();
};

const regRules: Record<string, FormItemRule[]> = {
  name:[{ validator:nameValidator, trigger:'blur' }],
  email:[{ validator:emailValidator, trigger:'blur' }],
  code:[{ required:true, len:6, message:'6位验证码', trigger:'blur'}],
  password:[{ validator:passwordValidator, trigger:'blur' }],
  confirm:[{ validator:confirmValidator, trigger:'blur' }]
};

const count = ref(0);
let timer:any;

// 表单验证状态
const formValidationState = reactive({
  nameValid: false,
  emailValid: false,
  passwordValid: false,
  confirmValid: false
});

const canSendCode = computed(()=>{
  return formValidationState.nameValid && 
         formValidationState.emailValid &&
         formValidationState.passwordValid &&
         formValidationState.confirmValid;
});

const canRegister = computed(()=>{
  return canSendCode.value && regForm.code.length===6;
});

const handleSendCode = async () => {
  if(count.value>0) return;
  if(!regForm.email){ ElMessage.error('请输入邮箱'); return; }
  try{ await sendCode(regForm.email); ElMessage.success('验证码已发送');
    count.value=60;
    clearInterval(timer);
    timer=setInterval(()=>{ if(--count.value===0) clearInterval(timer); },1000);
  }catch(e){ ElMessage.error('发送失败'); }
};

const handleRegister = async () => {
  if (!regRef.value) return;
  const ok = await regRef.value?.validate().catch(()=>false);
  if(!ok) return;
  loading.value=true;
  try{
    const {name,email,password,code}=regForm;
    const res=await registerApi({name,email,password,code});
    ElMessage.success('注册成功，已自动登录');
    await authStore.processLoginResponse(res.data);
    router.push('/home');
  }catch(e){ ElMessage.error('注册失败'); }
  finally{ loading.value=false; }
};

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    // 验证表单
    await loginFormRef.value.validate();
    
    loading.value = true;
    
    // 调用登录API
    const success = await authStore.login(loginForm.username, loginForm.password);
    
    if (success) {
      // 登录成功，跳转到原来要访问的页面或首页
      const redirectPath = (route.query.redirect as string) || '/home';
      router.push(redirectPath);
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    loading.value = false;
  }
};

/**
 * 组件挂载时检查登录状态
 */
onMounted(() => {
  // 如果已经登录，直接跳转到首页
  if (authStore.isLoggedIn) {
    router.push('/home');
  }
});
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 25px;
  flex-wrap: wrap;
}

.szu-logo {
  height: 50px;
  object-fit: contain;
}

.lab-logo {
  height: 50px;
  max-width: 220px;
  object-fit: contain;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.default-account-tip {
  font-size: 12px;
  color: #909399;
  margin: 0;
  line-height: 1.5;
}

/* 移动端响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 16px;
    min-height: 100vh;
    min-height: 100dvh; /* 动态视口高度，适配移动端 */
  }
  
  .login-card {
    padding: 20px;
    margin: 0;
    max-width: 100%;
    width: 100%;
    border-radius: 16px;
  }
  
  .login-header {
    margin-bottom: 24px;
  }
  
  .logo-container {
    margin-bottom: 16px;
    gap: 15px;
  }
  
  .szu-logo {
    height: 40px;
  }
  
  .lab-logo {
    height: 40px;
    max-width: 180px;
  }
  
  .login-title {
    font-size: 18px;
    line-height: 1.3;
  }
  
  .login-form .el-form-item {
    margin-bottom: 16px;
  }
  
  .login-button {
    height: 48px;
    font-size: 16px;
    border-radius: 8px;
  }
  
  /* 优化标签页在移动端的显示 */
  :deep(.el-tabs__header) {
    margin: 0 0 20px 0;
  }
  
  :deep(.el-tabs__item) {
    font-size: 16px;
    padding: 0 16px;
    height: 44px;
    line-height: 44px;
  }
  
  /* 移动端输入框优化 */
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    min-height: 48px;
  }
  
  :deep(.el-input__inner) {
    font-size: 16px !important; /* 防止iOS缩放 */
    line-height: 1.5;
  }
}

/* 小屏幕手机适配 */
@media (max-width: 480px) {
  .login-container {
    padding: 12px;
  }
  
  .login-card {
    padding: 16px;
    border-radius: 12px;
  }
  
  .logo-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .szu-logo, .lab-logo {
    height: 36px;
  }
  
  .lab-logo {
    max-width: 160px;
  }
  
  .login-title {
    font-size: 16px;
  }
}

/* 横屏模式适配 */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .login-container {
    padding: 8px;
  }
  
  .login-card {
    padding: 16px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .login-header {
    margin-bottom: 16px;
  }
  
  .logo-container {
    margin-bottom: 12px;
    gap: 10px;
  }
  
  .szu-logo, .lab-logo {
    height: 32px;
  }
  
  .login-title {
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .login-form .el-form-item {
    margin-bottom: 12px;
  }
  
  .login-button {
    height: 40px;
    font-size: 14px;
  }
}
</style>
