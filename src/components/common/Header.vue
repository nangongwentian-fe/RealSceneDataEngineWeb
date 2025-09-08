<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElButton, ElAvatar } from 'element-plus';
import { User, SwitchButton } from '@element-plus/icons-vue';

const authStore = useAuthStore();

// 计算属性
const currentUser = computed(() => authStore.user);
const isLoggedIn = computed(() => authStore.isLoggedIn);

/**
 * 处理退出登录
 */
const handleLogout = async () => {
    await authStore.logout();
    // 路由跳转由axios拦截器处理
};
</script>

<template>
    <div class="header" h="80px" flex justify-between items-center border-b="1px solid #e5e5e5" px="28px">
        <div class="left-container" flex items-center>
            <img src="@/assets/images/logo_03.png" h="40px" mr="10px">
            <img src="@/assets/images/szuailab.png" alt="深圳大学腾讯云人工智能实验室" h="35px" mr="15px">
            <div class="title" text="24px #222222" font-bold>具身智能实景3D数据生产引擎</div>
        </div>
        <div class="right-container" flex items-center>
            <!-- 用户信息区域 -->
            <div v-if="isLoggedIn" class="user-info" flex items-center>
                <el-dropdown trigger="click" @command="handleLogout">
                    <div class="user-dropdown" flex items-center cursor-pointer px="12px" py="8px" rounded="6px" hover:bg-gray-50>
                        <el-avatar :size="32" :icon="User" class="mr-8px" />
                        <div class="user-details" flex flex-col>
                            <span class="username" text="14px #303133" font-medium>{{ currentUser?.username }}</span>
                            <span class="role" text="12px #909399">管理员</span>
                        </div>
                        <el-icon class="ml-8px" text="12px #909399">
                            <arrow-down />
                        </el-icon>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="logout" :icon="SwitchButton">
                                退出登录
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <!-- 未登录状态 -->
            <div v-else class="login-prompt">
                <el-button type="primary" @click="$router.push('/login')">登录</el-button>
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
