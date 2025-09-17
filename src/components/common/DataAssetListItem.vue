<script setup lang="ts">
import type { DataAsset } from '@/apis/assetsTypes';
import { Delete, View } from '@element-plus/icons-vue';
import VideoDataAssetDialog from './VideoDataAssetDialog.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { deleteAssetById } from '@/apis/assets';
import { ElMessage } from 'element-plus';

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
    <el-card class="data-asset-list-item mobile-card" 
             shadow="hover"
             :class="[isMobile ? 'mobile-data-asset-card' : '']">
        <div class="card-content-container" 
             :class="[
                 'flex justify-between',
                 isMobile ? 'flex-col gap-3' : 'items-center'
             ]">
            <div class="left-container" 
                 :class="[
                     'flex-1 min-w-0',
                     isMobile ? 'w-full' : ''
                 ]">
                <div class="title" :class="[isMobile ? 'space-y-1' : '']">
                    <div class="asset-name-container" 
                         :class="[isMobile ? 'mb-1' : 'mb-0']">
                        <span class="asset-name" 
                              :class="[
                                  'font-medium text-gray-900 block truncate',
                                  isMobile ? 'text-16px' : 'text-20px'
                              ]"
                              :title="props.data.name">
                            {{ props.data.name }}
                        </span>
                    </div>
                    <div class="origin-name-container">
                        <span class="origin-name" 
                              :class="[
                                  'text-gray-400 block truncate',
                                  isMobile ? 'text-12px' : 'text-14px'
                              ]"
                              :title="props.data.static_file.original_filename">
                            ({{ props.data.static_file.original_filename }})
                        </span>
                    </div>
                </div>
            </div>
            <div class="right-container" 
                 :class="[
                     'flex gap-2',
                     isMobile ? 'justify-end shrink-0' : 'shrink-0'
                 ]">
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="查看数据"
                    :placement="isMobile ? 'top' : 'bottom'"
                >
                    <el-button :icon="View" 
                               :size="isMobile ? 'default' : 'default'"
                               class="mobile-btn"
                               @click="handleViewVideoDataAssetBtnClick">
                        <span v-if="isMobile" class="ml-1">查看</span>
                    </el-button>
                </el-tooltip>
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="删除当前数据资源"
                    :placement="isMobile ? 'top' : 'bottom'"
                >
                    <el-button :icon="Delete" 
                               :size="isMobile ? 'default' : 'default'"
                               class="mobile-btn"
                               @click="handleDeleteDataAssetBtnClick">
                        <span v-if="isMobile" class="ml-1">删除</span>
                    </el-button>
                </el-tooltip>
            </div>
        </div>
        <VideoDataAssetDialog v-model="viewDataAssetDialogVisible" :data="props.data.static_file" />
    </el-card>
</template>

<style lang="scss" scoped>
.data-asset-list-item {
    // 确保卡片不会超出容器宽度
    width: 100%;
    
    .card-content-container {
        // 确保内容容器有最小宽度为0，允许flex子项缩小
        min-width: 0;
    }
    
    .left-container {
        // 确保左侧容器可以缩小
        min-width: 0;
        overflow: hidden;
        
        .title {
            // 确保标题容器不会超出
            width: 100%;
            min-width: 0;
        }
        
        .asset-name-container,
        .origin-name-container {
            // 确保名称容器可以正确截断
            width: 100%;
            min-width: 0;
        }
        
        .asset-name,
        .origin-name {
            // 确保文字可以正确截断
            max-width: 100%;
            word-break: break-all;
            word-wrap: break-word;
        }
    }
    
    .right-container {
        // 确保按钮容器不会被压缩
        flex-shrink: 0;
        
        .el-button {
            // 确保按钮有最小宽度
            min-width: 32px;
        }
    }
}

// 移动端特定样式
.mobile-data-asset-card {
    @media (max-width: 768px) {
        :deep(.el-card__body) {
            padding: 16px;
        }
        
        .card-content-container {
            gap: 12px;
        }
        
        .left-container {
            .title {
                .asset-name-container {
                    margin-bottom: 4px;
                }
            }
        }
        
        .right-container {
            .el-button {
                min-height: 36px;
                padding: 8px 12px;
                
                // 移动端按钮增加间距
                + .el-button {
                    margin-left: 0;
                }
            }
        }
    }
}

// 桌面端样式优化
@media (min-width: 769px) {
    .data-asset-list-item {
        .left-container {
            .title {
                display: flex;
                align-items: baseline;
                gap: 8px;
                
                .asset-name-container,
                .origin-name-container {
                    display: inline-block;
                }
                
                .asset-name-container {
                    flex-shrink: 0;
                    max-width: 60%;
                }
                
                .origin-name-container {
                    flex: 1;
                    min-width: 0;
                }
            }
        }
    }
}

// 确保tooltip不会被遮挡
.box-item {
    z-index: 1000;
}
</style>
