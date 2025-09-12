<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getTags } from '@/apis/tag';
import { useAuthStore } from '@/stores/auth';
import type { Tag } from '@/apis/tagTypes';
import { ElMessage } from 'element-plus';

interface Props {
    modelValue?: number | number[] | null;
    multiple?: boolean;
    placeholder?: string;
}

interface Emits {
    (e: 'update:modelValue', value: number | number[] | null): void;
    (e: 'change', value: number | number[] | null): void;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    multiple: false,
    placeholder: '请选择标签筛选'
});

const emits = defineEmits<Emits>();

const tags = ref<Tag[]>([]);
const loading = ref(false);

const selectedValue = computed({
    get: () => {
        if (props.modelValue === null || props.modelValue === undefined) {
            return props.multiple ? [] : undefined;
        }
        return props.modelValue;
    },
    set: (value: number | number[] | undefined) => {
        const finalValue = value === undefined ? null : value;
        emits('update:modelValue', finalValue);
        emits('change', finalValue);
    }
});

const authStore = useAuthStore();

const displayTags = computed(() => {
    if (authStore.isAdmin) return tags.value;
    const allowed = (authStore.user as any)?.allowedTags;
    if (allowed === '*' || !Array.isArray(allowed)) return tags.value;
    return tags.value.filter(t=>allowed.includes(t.id));
});

const fetchTags = async () => {
    loading.value = true;
    try {
        const response = await getTags();
        // 修复：API返回格式是 {data: {code: 200, msg: 'success', data: Array}}
        tags.value = response.data.data || [];
    } catch (error) {
        console.error('TagFilter: 获取标签列表失败:', error);
        ElMessage.error('获取标签列表失败');
        tags.value = [];
    } finally {
        loading.value = false;
    }
};

// 暴露刷新标签列表的方法
const refreshTags = () => {
    fetchTags();
};

// 使用 defineExpose 暴露方法给父组件
defineExpose({
    refreshTags
});

onMounted(() => {
    fetchTags();
});
</script>

<template>
    <el-select
        v-model="selectedValue"
        :placeholder="placeholder"
        :multiple="multiple"
        :loading="loading"
        clearable
        filterable
        style="width: 200px"
    >
        <el-option
            v-for="tag in displayTags"
            :key="tag.id"
            :label="tag.name || `标签${tag.id}`"
            :value="tag.id"
        >
            <div class="tag-option">
                <div 
                    class="tag-color"
                    :style="{ backgroundColor: tag.color || '#409EFF' }"
                />
                <span class="tag-name">{{ tag.name || `标签${tag.id}` }}</span>
            </div>
        </el-option>
    </el-select>
</template>

<style lang="scss" scoped>
.tag-option {
    display: flex;
    align-items: center;
    gap: 8px;

    .tag-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        flex-shrink: 0;
    }

    .tag-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>