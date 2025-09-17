<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElButton, ElAvatar } from 'element-plus';
import { User, SwitchButton, Setting } from '@element-plus/icons-vue';

const authStore = useAuthStore();
const router = useRouter();

// 移动端检测
const isMobile = ref(false);

const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
});

// 计算属性
const currentUser = computed(() => authStore.user);
const isLoggedIn = computed(() => authStore.isLoggedIn);

const displayName = computed(() => currentUser.value?.name || currentUser.value?.username || currentUser.value?.email || '用户');
const roleText = computed(() => currentUser.value?.role === 'admin' ? '管理员' : '用户');
const isAdmin = computed(() => currentUser.value?.role === 'admin');

/**
 * 处理退出登录
 */
const handleLogout = async () => {
    await authStore.logout();
    // 主动跳转到登录页面
    router.push('/login');
};

const handleCommand = (cmd:string)=>{
  if(cmd==='logout') handleLogout();
  if(cmd==='admin') router.push('/admin/users');
};
</script>

<template>
    <div class="header safe-area-top" 
         :class="['h-80px md:h-80px', 'flex justify-between items-center', 'border-b-1 border-solid border-gray-200', 'px-4 md:px-28px']">
        <div class="left-container" flex items-center overflow-hidden>
            <img src="@/assets/images/logo_03.png" 
                 :class="['h-32px md:h-40px', 'mr-2 md:mr-10px', 'flex-shrink-0']">
            <img src="@/assets/images/szuailab.png" 
                 alt="深圳大学腾讯云人工智能实验室" 
                 :class="['h-28px md:h-35px', 'mr-2 md:mr-15px', 'flex-shrink-0', 'hidden sm:block']">
            <div class="title" 
                 :class="['text-16px md:text-24px', 'text-gray-800', 'font-bold', 'truncate']">
                <span class="hidden md:inline">具身智能实景3D数据生产引擎</span>
                <span class="md:hidden">具身智能实景3D数据生产引擎</span>
            </div>
        </div>
        <div class="right-container" flex items-center>
            <!-- 用户信息区域 -->
            <div v-if="isLoggedIn" class="user-info" flex items-center>
                <el-dropdown trigger="click" @command="handleCommand">
                    <div class="user-dropdown mobile-btn" 
                         :class="['flex items-center cursor-pointer', 'px-2 md:px-12px', 'py-2 md:py-8px', 'rounded-6px hover:bg-gray-50']">
                        <el-avatar :size="isMobile ? 28 : 32" :icon="User" class="mr-2 md:mr-8px" />
                        <div class="user-details hidden md:flex flex-col">
                            <span class="username" text="14px #303133" font-medium>{{ displayName }}</span>
                            <span class="role" text="12px #909399">{{ roleText }}</span>
                        </div>
                        <el-icon class="ml-2 md:ml-8px" text="12px #909399">
                            <arrow-down />
                        </el-icon>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item 
                                v-if="isAdmin" 
                                command="admin" 
                                :icon="Setting">
                                后台管理
                            </el-dropdown-item>
                            <el-dropdown-item command="logout" :icon="SwitchButton">
                                退出登录
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <!-- 未登录状态 -->
            <div v-else class="login-prompt">
                <el-button type="primary" 
                           :size="isMobile ? 'default' : 'large'"
                           class="mobile-btn"
                           @click="$router.push('/login')">登录</el-button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.user-dropdown {
    transition: all 0.3s ease;
    
    &:hover {
        background-color: #f5f7fa;
    }
}

.user-details {
    min-width: 60px;
}

.username {
    line-height: 1.2;
}

.role {
    line-height: 1.2;
    margin-top: 2px;
}
</style>
