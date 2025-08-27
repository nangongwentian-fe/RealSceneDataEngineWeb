<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { getTags, addTagToProject, removeTagFromProject } from '@/apis/tag';
import type { Tag } from '@/apis/tagTypes';
import type { Project } from '@/apis/projectTypes';
import { ElMessage } from 'element-plus';
import { Check } from '@element-plus/icons-vue';

interface Props {
    modelValue: boolean;
    project: Project;
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'tags-updated'): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emits('update:modelValue', value)
});

const allTags = ref<Tag[]>([]);
const selectedTagIds = ref<number[]>([]);
const loading = ref(false);
const submitting = ref(false);

const fetchTags = async () => {
    loading.value = true;
    try {
        const response = await getTags();
        // 修复：API返回格式是 {data: {code: 200, msg: 'success', data: Array}}
        allTags.value = response.data.data || [];
        
        // 设置当前项目的标签选中状态
        selectedTagIds.value = props.project.tags?.map(tag => tag.id) || [];
    } catch (error) {
        console.error('获取标签列表失败:', error);
        ElMessage.error('获取标签列表失败');
        allTags.value = [];
    } finally {
        loading.value = false;
    }
};

const handleConfirm = async () => {
    submitting.value = true;
    try {
        const currentTagIds = props.project.tags?.map(tag => tag.id) || [];
        const toAdd = selectedTagIds.value.filter(id => !currentTagIds.includes(id));
        const toRemove = currentTagIds.filter(id => !selectedTagIds.value.includes(id));

        // 并行处理添加和删除
        const promises: Promise<any>[] = [];
        
        toAdd.forEach(tagId => {
            promises.push(addTagToProject(props.project.id, tagId));
        });
        
        toRemove.forEach(tagId => {
            promises.push(removeTagFromProject(props.project.id, tagId));
        });

        if (promises.length > 0) {
            await Promise.all(promises);
            ElMessage.success('标签更新成功');
            emits('tags-updated');
        }
        
        dialogVisible.value = false;
    } catch (error) {
        console.error('更新项目标签失败:', error);
        ElMessage.error('更新项目标签失败');
    } finally {
        submitting.value = false;
    }
};

const handleClose = () => {
    selectedTagIds.value = props.project.tags?.map(tag => tag.id) || [];
    dialogVisible.value = false;
};

const toggleTag = (tagId: number) => {
    const index = selectedTagIds.value.indexOf(tagId);
    if (index > -1) {
        selectedTagIds.value.splice(index, 1);
    } else {
        selectedTagIds.value.push(tagId);
    }
};

// 当弹窗打开时获取标签
watch(() => props.modelValue, (visible) => {
    if (visible) {
        fetchTags();
    }
});
</script>

<template>
    <el-dialog 
        v-model="dialogVisible"
        :title="`编辑项目标签 - ${project.name}`"
        width="500px"
        :show-close="true"
        :close-on-click-modal="false"
        @close="handleClose"
        @click.stop
    >
        <div class="tag-selector" v-loading="loading">
            <div class="current-tags" v-if="project.tags && project.tags.length > 0">
                <div class="label">当前标签：</div>
                <div class="tag-list">
                    <el-tag
                        v-for="tag in project.tags"
                        :key="tag.id"
                        :color="tag.color"
                        :style="{ color: '#fff', border: 'none' }"
                        size="small"
                    >
                        {{ tag.name }}
                    </el-tag>
                </div>
            </div>

            <div class="tag-selection">
                <div class="label">选择标签：</div>
                <div class="tags-grid">
                    <div 
                        v-for="tag in allTags"
                        :key="tag.id"
                        class="tag-item"
                        :class="{ selected: selectedTagIds.includes(tag.id) }"
                        @click="toggleTag(tag.id)"
                    >
                        <div 
                            class="tag-color"
                            :style="{ backgroundColor: tag.color || '#409EFF' }"
                        />
                        <span class="tag-name">{{ tag.name || `标签${tag.id}` }}</span>
                        <el-icon v-if="selectedTagIds.includes(tag.id)" class="check-icon">
                            <Check />
                        </el-icon>
                    </div>
                </div>
                <div v-if="allTags.length === 0 && !loading" class="empty-state">
                    暂无可用标签，请先在标签管理中创建标签
                </div>
            </div>
        </div>

        <template #footer>
            <el-button @click="handleClose">取消</el-button>
            <el-button 
                type="primary" 
                @click="handleConfirm"
                :loading="submitting"
            >
                确认
            </el-button>
        </template>
    </el-dialog>
</template>

<style lang="scss" scoped>
.tag-selector {
    .current-tags {
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e4e7ed;

        .label {
            color: #606266;
            font-size: 14px;
            margin-bottom: 8px;
        }

        .tag-list {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
    }

    .tag-selection {
        .label {
            color: #606266;
            font-size: 14px;
            margin-bottom: 12px;
        }

        .tags-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 8px;
            max-height: 300px;
            overflow-y: auto;

            .tag-item {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                border: 1px solid #e4e7ed;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
                gap: 8px;

                &:hover {
                    border-color: #409eff;
                    background-color: #f0f9ff;
                }

                &.selected {
                    border-color: #409eff;
                    background-color: #e1f3fe;
                }

                .tag-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 2px;
                    flex-shrink: 0;
                }

                .tag-name {
                    flex: 1;
                    font-size: 14px;
                    color: #303133;
                }

                .check-icon {
                    color: #409eff;
                    font-size: 16px;
                }
            }
        }

        .empty-state {
            text-align: center;
            color: #909399;
            padding: 40px 20px;
        }
    }
}
</style>