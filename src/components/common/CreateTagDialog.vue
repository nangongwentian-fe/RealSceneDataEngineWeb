<script setup lang="ts">
import { ref, computed } from 'vue';
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
</script>

<template>
    <el-dialog 
        v-model="dialogVisible"
        title="新建标签"
        width="500px"
        :show-close="true"
        :close-on-click-modal="false"
        @close="handleClose"
    >
        <el-form :model="formData" label-width="80px" label-position="left">
            <el-form-item label="标签名称" required>
                <el-input 
                    v-model="formData.name" 
                    placeholder="请输入标签名称"
                    maxlength="50"
                    show-word-limit
                />
            </el-form-item>
            
            <el-form-item label="标签颜色">
                <div class="color-section">
                    <el-color-picker v-model="formData.color" size="default" />
                    <div class="predefined-colors">
                        <div 
                            v-for="color in predefinedColors"
                            :key="color"
                            class="color-item"
                            :style="{ backgroundColor: color }"
                            :class="{ active: formData.color === color }"
                            @click="formData.color = color"
                        />
                    </div>
                </div>
            </el-form-item>
            
            <el-form-item label="标签描述">
                <el-input 
                    v-model="formData.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入标签描述（可选）"
                    maxlength="200"
                    show-word-limit
                />
            </el-form-item>
            
            <el-form-item label="预览">
                <div class="tag-preview">
                    <el-tag 
                        :color="formData.color"
                        :style="{ 
                            color: '#fff',
                            border: 'none',
                            fontSize: '12px'
                        }"
                    >
                        {{ formData.name || '标签预览' }}
                    </el-tag>
                </div>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="handleClose">取消</el-button>
            <el-button 
                type="primary" 
                @click="handleConfirm"
                :loading="loading"
            >
                确认创建
            </el-button>
        </template>
    </el-dialog>
</template>

<style lang="scss" scoped>
.color-section {
    display: flex;
    align-items: center;
    gap: 16px;

    .predefined-colors {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .color-item {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s;

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
</style>