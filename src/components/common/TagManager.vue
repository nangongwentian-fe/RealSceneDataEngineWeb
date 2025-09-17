<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getTags, deleteTag, updateTag } from '@/apis/tag';
import type { Tag, UpdateTagRequest } from '@/apis/tagTypes';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Plus } from '@element-plus/icons-vue';
import CreateTagDialog from './CreateTagDialog.vue';

interface Props {
    modelValue: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'tags-updated'): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

// 移除未使用的变量
const tags = ref<Tag[]>([]);
const loading = ref(false);
const createTagDialogVisible = ref(false);
const editingTag = ref<Tag | null>(null);
const editForm = ref<UpdateTagRequest>({});

const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emits('update:modelValue', value)
});

const predefinedColors = [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
    '#F78989', '#F7BA2A', '#85CE61', '#8A2BE2', '#FF69B4',
    '#00CED1', '#FF6347', '#32CD32', '#FFB6C1', '#DDA0DD'
];

const fetchTags = async () => {
    loading.value = true;
    try {
        const response = await getTags();
        // 修复：API返回格式是 {data: {code: 200, msg: 'success', data: Array}}
        tags.value = response.data.data || [];
    } catch (error) {
        console.error('获取标签列表失败:', error);
        ElMessage.error('获取标签列表失败');
        tags.value = [];
    } finally {
        loading.value = false;
    }
};

const handleCreateTag = () => {
    createTagDialogVisible.value = true;
};

const handleTagCreated = () => {
    fetchTags();
    // 通知父组件标签列表已更新
    emits('tags-updated');
};

const handleEditTag = (tag: Tag) => {
    editingTag.value = tag;
    editForm.value = {
        name: tag.name,
        color: tag.color,
        description: tag.description
    };
};

const handleSaveEdit = async () => {
    if (!editingTag.value) return;
    
    if (!editForm.value.name?.trim()) {
        ElMessage.warning('请输入标签名称');
        return;
    }

    try {
        await updateTag(editingTag.value.id, editForm.value);
        ElMessage.success('更新标签成功');
        editingTag.value = null;
        editForm.value = {};
        fetchTags();
        // 通知父组件标签列表已更新
        emits('tags-updated');
    } catch (error) {
        console.error('更新标签失败:', error);
        ElMessage.error('更新标签失败');
    }
};

const handleCancelEdit = () => {
    editingTag.value = null;
    editForm.value = {};
};

const handleDeleteTag = async (tag: Tag) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除标签「${tag.name}」吗？删除后将同时移除所有项目中的该标签。`,
            '删除标签',
            {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );

        await deleteTag(tag.id);
        ElMessage.success('删除标签成功');
        fetchTags();
        // 通知父组件标签列表已更新
        emits('tags-updated');
    } catch (error: any) {
        if (error !== 'cancel') {
            console.error('删除标签失败:', error);
            ElMessage.error('删除标签失败');
        }
    }
};

// 移动端检测
const isMobile = ref(false);

const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    fetchTags();
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
});
</script>

<template>
    <el-dialog 
        v-model="visible"
        title="标签管理"
        :width="isMobile ? '95%' : '600px'"
        :show-close="true"
        :top="isMobile ? '5vh' : '5vh'"
        :append-to-body="true"
    >
        <div class="tag-manager">
            <div class="header" :class="[isMobile ? 'mb-3' : 'mb-4']">
                <el-button type="primary" 
                           :icon="Plus" 
                           :size="isMobile ? 'default' : 'default'"
                           class="mobile-btn"
                           @click="handleCreateTag">
                    <span class="hidden sm:inline">新建标签</span>
                    <span class="sm:hidden">新建</span>
                </el-button>
            </div>

            <div class="tag-list" 
                 v-loading="loading"
                 :class="[isMobile ? 'max-h-400px' : 'max-h-400px', 'overflow-y-auto']">
                <div v-if="tags.length === 0 && !loading" class="empty-state">
                    <div class="mobile-empty">
                        <div class="text-center text-gray-500 py-8">
                            <div class="text-16px mb-2">暂无标签</div>
                            <div class="text-14px">点击上方按钮创建第一个标签</div>
                        </div>
                    </div>
                </div>
                
                <div v-else class="tags-container">
                    <div 
                        v-for="tag in tags"
                        :key="tag.id"
                        class="tag-item"
                        :class="[
                            { editing: editingTag?.id === tag.id },
                            isMobile ? 'mobile-tag-item' : ''
                        ]"
                    >
                        <template v-if="editingTag?.id === tag.id">
                            <div class="edit-form">
                                <div class="form-row" 
                                     :class="[isMobile ? 'flex-col gap-2' : 'flex gap-3 items-center']">
                                    <el-input 
                                        v-model="editForm.name"
                                        placeholder="标签名称"
                                        :size="isMobile ? 'default' : 'small'"
                                        class="mobile-input"
                                        maxlength="50"
                                    />
                                    <el-color-picker 
                                        v-model="editForm.color"
                                        :size="isMobile ? 'default' : 'small'"
                                    />
                                </div>
                                <div class="color-options" 
                                     :class="[isMobile ? 'gap-2 mb-3' : 'gap-2 mb-3']">
                                    <div 
                                        v-for="color in predefinedColors"
                                        :key="color"
                                        class="color-option mobile-touchable"
                                        :class="[
                                            { active: editForm.color === color },
                                            isMobile ? 'w-8 h-8' : 'w-6 h-6'
                                        ]"
                                        :style="{ backgroundColor: color }"
                                        @click="editForm.color = color"
                                    />
                                </div>
                                <el-input 
                                    v-model="editForm.description"
                                    type="textarea"
                                    :rows="isMobile ? 3 : 2"
                                    placeholder="标签描述（可选）"
                                    :size="isMobile ? 'default' : 'small'"
                                    class="mobile-input"
                                    maxlength="200"
                                />
                                <div class="actions" 
                                     :class="[
                                         'flex justify-end gap-2',
                                         isMobile ? 'mt-3' : 'mt-2'
                                     ]">
                                    <el-button :size="isMobile ? 'default' : 'small'" 
                                               class="mobile-btn"
                                               @click="handleCancelEdit">取消</el-button>
                                    <el-button type="primary" 
                                               :size="isMobile ? 'default' : 'small'" 
                                               class="mobile-btn"
                                               @click="handleSaveEdit">保存</el-button>
                                </div>
                            </div>
                        </template>
                        
                        <template v-else>
                            <div class="tag-info" 
                                 :class="[isMobile ? 'flex-col items-start gap-2' : 'flex items-start gap-4']">
                                <div class="tag-display">
                                    <el-tag 
                                        :color="tag.color"
                                        :style="{ 
                                            color: '#fff',
                                            border: 'none',
                                            fontSize: isMobile ? '14px' : '14px',
                                            padding: isMobile ? '6px 12px' : '4px 12px'
                                        }"
                                    >
                                        {{ tag.name }}
                                    </el-tag>
                                </div>
                                <div class="tag-meta" :class="[isMobile ? 'w-full' : 'flex-1']">
                                    <div v-if="tag.description" 
                                         class="description" 
                                         :class="[
                                             'text-gray-600 mb-1',
                                             isMobile ? 'text-14px' : 'text-14px'
                                         ]">
                                        {{ tag.description }}
                                    </div>
                                    <div class="date" 
                                         :class="[
                                             'text-gray-500',
                                             isMobile ? 'text-12px' : 'text-12px'
                                         ]">
                                        创建时间：{{ new Date(tag.created_at).toLocaleDateString() }}
                                    </div>
                                </div>
                            </div>
                            <div class="tag-actions" 
                                 :class="[
                                     'flex gap-2',
                                     isMobile ? 'mt-3 justify-end' : 'ml-auto'
                                 ]">
                                <el-button :size="isMobile ? 'default' : 'small'" 
                                           :icon="Edit" 
                                           class="mobile-btn"
                                           @click="handleEditTag(tag)">
                                    <span class="hidden sm:inline ml-1">编辑</span>
                                </el-button>
                                <el-button 
                                    :size="isMobile ? 'default' : 'small'" 
                                    type="danger" 
                                    :icon="Delete" 
                                    class="mobile-btn"
                                    @click="handleDeleteTag(tag)"
                                >
                                    <span class="hidden sm:inline ml-1">删除</span>
                                </el-button>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <CreateTagDialog 
            v-model="createTagDialogVisible"
            @tag-created="handleTagCreated"
        />
    </el-dialog>
</template>

<style lang="scss" scoped>
.tag-manager {
    .header {
        margin-bottom: 20px;
    }

    .tag-list {
        max-height: 400px;
        overflow-y: auto;
    }

    .tags-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .tag-item {
        padding: 16px;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        background-color: #fff;
        transition: all 0.2s;

        &:hover {
            border-color: #c0c4cc;
        }

        &.editing {
            border-color: #409eff;
            background-color: #f0f9ff;
        }

        &:not(.editing) {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        // 移动端样式
        &.mobile-tag-item {
            padding: 12px;
            
            &:not(.editing) {
                flex-direction: column;
                align-items: stretch;
            }
        }
    }

    .tag-info {
        flex: 1;
        display: flex;
        align-items: flex-start;
        gap: 16px;

        .tag-display {
            .el-tag {
                font-size: 14px;
                padding: 4px 12px;
                margin-top: 2px; // 微调对齐
            }
        }

        .tag-meta {
            flex: 1;

            .description {
                color: #606266;
                font-size: 14px;
                margin-bottom: 4px;
            }

            .date {
                color: #909399;
                font-size: 12px;
            }
        }
    }

    .tag-actions {
        display: flex;
        gap: 8px;
    }

    .edit-form {
        .form-row {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
            align-items: center;

            .el-input {
                flex: 1;
            }
        }

        .color-options {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            flex-wrap: wrap;

            .color-option {
                width: 24px;
                height: 24px;
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

        .el-textarea {
            margin-bottom: 12px;
        }

        .actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
    }

    .empty-state {
        padding: 40px 20px;
        text-align: center;
    }
}
</style>