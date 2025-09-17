<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { createTag } from '@/apis/tag';
import type { CreateTagRequest } from '@/apis/tagTypes';
import { ElMessage } from 'element-plus';

interface Props {
    modelValue: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'tag-created'): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emits('update:modelValue', value)
});

const formData = ref<CreateTagRequest>({
    name: '',
    color: '#409EFF',
    description: ''
});

const loading = ref(false);

const predefinedColors = [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
    '#F78989', '#F7BA2A', '#85CE61', '#8A2BE2', '#FF69B4',
    '#00CED1', '#FF6347', '#32CD32', '#FFB6C1', '#DDA0DD'
];

const handleConfirm = async () => {
    if (!formData.value.name.trim()) {
        ElMessage.warning('请输入标签名称');
        return;
    }

    loading.value = true;
    try {
        await createTag(formData.value);
        ElMessage.success('创建标签成功');
        emits('tag-created');
        handleClose();
    } catch (error) {
        console.error('创建标签失败:', error);
        ElMessage.error('创建标签失败');
    } finally {
        loading.value = false;
    }
};

const handleClose = () => {
    formData.value = {
        name: '',
        color: '#409EFF',
        description: ''
    };
    dialogVisible.value = false;
};

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
</script>

<template>
    <el-dialog 
        v-model="dialogVisible"
        title="新建标签"
        :width="isMobile ? '95%' : '500px'"
        :show-close="true"
        :close-on-click-modal="false"
        :append-to-body="true"
        @close="handleClose"
    >
        <el-form :model="formData" 
                 :label-width="isMobile ? '80px' : '80px'" 
                 :label-position="isMobile ? 'top' : 'left'"
                 class="mobile-form">
            <el-form-item label="标签名称" required>
                <el-input 
                    v-model="formData.name" 
                    placeholder="请输入标签名称"
                    maxlength="50"
                    show-word-limit
                    :size="isMobile ? 'large' : 'default'"
                    class="mobile-input"
                />
            </el-form-item>
            
            <el-form-item label="标签颜色">
                <div class="color-section" 
                     :class="[isMobile ? 'mobile-color-section' : '']">
                    <el-color-picker v-model="formData.color" 
                                     :size="isMobile ? 'default' : 'default'" />
                    <div class="predefined-colors" 
                         :class="[isMobile ? 'mobile-predefined-colors' : '']">
                        <div 
                            v-for="color in predefinedColors"
                            :key="color"
                            class="color-item mobile-touchable"
                            :class="[
                                { active: formData.color === color },
                                isMobile ? 'mobile-color-item' : ''
                            ]"
                            :style="{ backgroundColor: color }"
                            @click="formData.color = color"
                        />
                    </div>
                </div>
            </el-form-item>
            
            <el-form-item label="标签描述">
                <el-input 
                    v-model="formData.description"
                    type="textarea"
                    :rows="isMobile ? 4 : 3"
                    placeholder="请输入标签描述（可选）"
                    maxlength="200"
                    show-word-limit
                    :size="isMobile ? 'large' : 'default'"
                    class="mobile-input"
                />
            </el-form-item>
            
            <el-form-item label="预览">
                <div class="tag-preview">
                    <el-tag 
                        :color="formData.color"
                        :style="{ 
                            color: '#fff',
                            border: 'none',
                            fontSize: isMobile ? '14px' : '12px',
                            padding: isMobile ? '6px 12px' : '4px 8px'
                        }"
                    >
                        {{ formData.name || '标签预览' }}
                    </el-tag>
                </div>
            </el-form-item>
        </el-form>

        <template #footer>
            <div :class="[
                'flex gap-2',
                isMobile ? 'justify-center' : 'justify-end'
            ]">
                <el-button v-if="!isMobile" 
                           @click="handleClose"
                           size="default">取消</el-button>
                <el-button 
                    type="primary" 
                    @click="handleConfirm"
                    :loading="loading"
                    :size="isMobile ? 'large' : 'default'"
                    :class="[isMobile ? 'w-full' : '']"
                    class="mobile-btn"
                >
                    确认创建
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style lang="scss" scoped>
.color-section {
    display: flex;
    align-items: center;
    gap: 16px;

    &.mobile-color-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .predefined-colors {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        &.mobile-predefined-colors {
            gap: 12px;
            justify-content: flex-start;
        }

        .color-item {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s;

            &.mobile-color-item {
                width: 28px;
                height: 28px;
                border-radius: 6px;
            }

            &:hover {
                transform: scale(1.1);
            }

            &.active {
                border-color: #303133;
                transform: scale(1.1);
            }
        }
    }
}

.tag-preview {
    .el-tag {
        font-size: 12px;
    }
}

// 移动端表单优化
@media (max-width: 768px) {
    .mobile-form {
        .el-form-item {
            margin-bottom: 20px;
            
            &:last-child {
                margin-bottom: 0;
            }
        }
        
        .el-form-item__label {
            font-size: 14px;
            line-height: 1.4;
            margin-bottom: 8px;
        }
        
        .el-input,
        .el-textarea {
            width: 100%;
        }
        
        .el-textarea__inner {
            font-size: 16px !important; // 防止iOS缩放
        }
    }
}

// 移动端对话框footer优化
@media (max-width: 768px) {
    :deep(.el-dialog__footer) {
        padding: 16px 20px;
    }
}
</style>