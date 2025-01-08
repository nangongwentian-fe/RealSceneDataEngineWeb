<script setup lang="ts">
import type { DataAsset } from '@/apis/assetsTypes';
import { Delete, View } from '@element-plus/icons-vue';
import VideoDataAssetDialog from './VideoDataAssetDialog.vue';
import { ref } from 'vue';
import { deleteAssetById } from '@/apis/assets';
import { ElMessage } from 'element-plus';

const props = defineProps<{
    data: DataAsset
}>()
const emits = defineEmits<{
    'deleteSuccess': []
}>()
const viewDataAssetDialogVisible = ref(false);
/**
 * @description 查看数据资源按钮点击事件
 */
const handleViewVideoDataAssetBtnClick = () => {
    viewDataAssetDialogVisible.value = true;
}
/**
 * @description 删除数据资源按钮点击事件
 */
const handleDeleteDataAssetBtnClick = () => {
    deleteAssetById(props.data.id).then(() => {
        ElMessage.success('删除成功');
        emits('deleteSuccess');
    }).catch(() => {
        ElMessage.error('删除失败');
    });
}
</script>

<template>
    <el-card class="data-asset-list-item" shadow="hover">
        <div class="card-content-container" flex items-center justify-between>
            <div class="left-container">
                <div class="title">
                    <span class="asset-name" text="20px  #222222">{{ props.data.name }}</span>
                    <span class="origin-name" text="14px #cccccc">({{ props.data.static_file.original_filename }})</span>
                </div>
            </div>
            <div class="right-container">
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="查看数据"
                    placement="bottom"
                >
                    <el-button :icon="View" @click="handleViewVideoDataAssetBtnClick"></el-button>
                </el-tooltip>
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="删除当前数据资源"
                    placement="bottom"
                >
                    <el-button :icon="Delete" @click="handleDeleteDataAssetBtnClick"></el-button>
                </el-tooltip>
            </div>
        </div>
        <VideoDataAssetDialog v-model="viewDataAssetDialogVisible" :data="props.data.static_file" />
    </el-card>
</template>

<style lang="scss" scoped></style>
