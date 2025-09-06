<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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

onMounted(() => {
    fetchTags();
});
</script>

<template>
    <el-dialog 
        v-model="visible"
        title="标签管理"
        width="600px"
        :show-close="true"
        top="5vh"
    >
        <div class="tag-manager">
            <div class="header">
                <el-button type="primary" :icon="Plus" @click="handleCreateTag">
                    新建标签
                </el-button>
            </div>

            <div class="tag-list" v-loading="loading">
                <div v-if="tags.length === 0 && !loading" class="empty-state">
                    <el-empty description="暂无标签，点击上方按钮创建第一个标签" />
                </div>
                
                <div v-else class="tags-container">
                    <div 
                        v-for="tag in tags"
                        :key="tag.id"
                        class="tag-item"
                        :class="{ editing: editingTag?.id === tag.id }"
                    >
                        <template v-if="editingTag?.id === tag.id">
                            <div class="edit-form">
                                <div class="form-row">
                                    <el-input 
                                        v-model="editForm.name"
                                        placeholder="标签名称"
                                        size="small"
                                        maxlength="50"
                                    />
                                    <el-color-picker 
                                        v-model="editForm.color"
                                        size="small"
                                    />
                                </div>
                                <div class="color-options">
                                    <div 
                                        v-for="color in predefinedColors"
                                        :key="color"
                                        class="color-option"
                                        :style="{ backgroundColor: color }"
                                        :class="{ active: editForm.color === color }"
                                        @click="editForm.color = color"
                                    />
                                </div>
                                <el-input 
                                    v-model="editForm.description"
                                    type="textarea"
                                    :rows="2"
                                    placeholder="标签描述（可选）"
                                    size="small"
                                    maxlength="200"
                                />
                                <div class="actions">
                                    <el-button size="small" @click="handleCancelEdit">取消</el-button>
                                    <el-button type="primary" size="small" @click="handleSaveEdit">保存</el-button>
                                </div>
                            </div>
                        </template>
                        
                        <template v-else>
                            <div class="tag-info">
                                <div class="tag-display">
                                    <el-tag 
                                        :color="tag.color"
                                        :style="{ 
                                            color: '#fff',
                                            border: 'none'
                                        }"
                                    >
                                        {{ tag.name }}
                                    </el-tag>
                                </div>
                                <div class="tag-meta">
                                    <div v-if="tag.description" class="description">
                                        {{ tag.description }}
                                    </div>
                                    <div class="date">
                                        创建时间：{{ new Date(tag.created_at).toLocaleDateString() }}
                                    </div>
                                </div>
                            </div>
                            <div class="tag-actions">
                                <el-button size="small" :icon="Edit" @click="handleEditTag(tag)">
                                    编辑
                                </el-button>
                                <el-button 
                                    size="small" 
                                    type="danger" 
                                    :icon="Delete" 
                                    @click="handleDeleteTag(tag)"
                                >
                                    删除
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
    }

    .tag-info {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 16px;

        .tag-display {
            .el-tag {
                font-size: 14px;
                padding: 4px 12px;
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