<script setup lang="ts">
import type { StaticFile } from '@/apis/staticFileTypes';
import { computed, ref, onMounted, onUnmounted } from 'vue';

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

const visible = defineModel({ type: Boolean, required: true});
const props = defineProps<{
    data: StaticFile
}>()
const videoUrl = computed(() => {
    return `${window.realSceneDataEngineConfig.apiBaseUrl}/files/${props.data.filename}`;
})
</script>

<template>
    <div class="video-data-asset-dialog-container">
        <el-dialog
            v-model="visible"
            title="查看数据资源"
            :width="isMobile ? '95%' : '800px'"
            :top="isMobile ? '5vh' : '10vh'"
            destroy-on-close
            :append-to-body="true"
            :close-on-click-modal="true"
        >
            <div class="content-container" 
                 :class="[
                     'flex justify-center items-center',
                     isMobile ? 'p-2' : 'p-4'
                 ]">
                <div class="video-wrapper" 
                     :class="[
                         'w-full flex justify-center',
                         isMobile ? 'max-h-300px' : 'max-h-600px'
                     ]">
                    <video :src="videoUrl" 
                           :class="[
                               'w-full object-contain bg-black rounded-lg',
                               isMobile ? 'max-h-300px' : 'max-h-600px'
                           ]"
                           :style="{ 
                               maxWidth: '100%',
                               height: 'auto'
                           }"
                           controls="true" 
                           muted="true" 
                           :autoplay="!isMobile"
                           preload="metadata"
                           controlslist="nodownload">
                        <source :src="videoUrl" type="video/mp4">
                        您的浏览器不支持视频播放
                    </video>
                </div>
            </div>
            <div v-if="isMobile" 
                 class="mobile-info" 
                 :class="['text-center text-12px text-gray-500 mt-2']">
                <p>{{ props.data.original_filename }}</p>
                <p class="text-10px mt-1">点击视频可以全屏播放</p>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.video-data-asset-dialog-container {
    .content-container {
        // 确保容器不会超出
        width: 100%;
        overflow: hidden;
    }
    
    .video-wrapper {
        // 确保视频包装器有正确的尺寸
        display: flex;
        justify-content: center;
        align-items: center;
        
        video {
            // 视频基础样式
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            
            // 确保视频控件在移动端易于操作
            @media (max-width: 768px) {
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            // 视频加载状态
            &:loading {
                background: #f5f5f5;
            }
            
            // 确保控件可见性
            &::-webkit-media-controls-panel {
                background-color: rgba(0, 0, 0, 0.8);
            }
            
            // 移动端控件优化
            @media (max-width: 768px) {
                &::-webkit-media-controls-panel {
                    background-color: rgba(0, 0, 0, 0.9);
                }
                
                &::-webkit-media-controls-play-button,
                &::-webkit-media-controls-fullscreen-button {
                    transform: scale(1.2);
                }
            }
        }
    }
    
    .mobile-info {
        padding: 8px 16px;
        border-top: 1px solid #f0f0f0;
        margin-top: 16px;
        
        p {
            margin: 0;
            line-height: 1.4;
            
            &:first-child {
                font-weight: 500;
                color: #333;
            }
        }
    }
}

// 移动端对话框样式优化
@media (max-width: 768px) {
    .video-data-asset-dialog-container {
        :deep(.el-dialog) {
            margin: 5vh auto;
            max-height: 90vh;
            overflow: hidden;
            
            .el-dialog__header {
                padding: 16px 20px 8px;
                
                .el-dialog__title {
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .el-dialog__headerbtn {
                    top: 16px;
                    right: 16px;
                    
                    .el-dialog__close {
                        font-size: 18px;
                    }
                }
            }
            
            .el-dialog__body {
                padding: 8px 20px 20px;
                max-height: calc(90vh - 60px);
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            }
        }
    }
}

// 桌面端样式优化
@media (min-width: 769px) {
    .video-data-asset-dialog-container {
        :deep(.el-dialog) {
            .el-dialog__body {
                padding: 20px 30px 30px;
            }
        }
        
        .video-wrapper {
            video {
                max-width: 100%;
                
                &:hover {
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
                }
            }
        }
    }
}

// 全屏视频支持
@media screen and (orientation: landscape) and (max-height: 500px) {
    .video-data-asset-dialog-container {
        :deep(.el-dialog) {
            margin: 2vh auto;
            max-height: 96vh;
            
            .el-dialog__body {
                padding: 10px 20px 15px;
                max-height: calc(96vh - 50px);
            }
        }
        
        .video-wrapper {
            video {
                max-height: calc(96vh - 100px);
            }
        }
        
        .mobile-info {
            margin-top: 8px;
            padding: 4px 16px;
        }
    }
}
</style>
