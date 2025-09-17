<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Project } from '@/apis/projectTypes';
import ProjectStatusCard from './ProjectStatusCard.vue';

const visible = defineModel({ type: Boolean, required: true});
const props = defineProps<{
    processingProjectList: Project[],
    failedProjectList: Project[]
}>()

const emits = defineEmits(['refreshList']);

const handleTaskCanceled = () => {
    // 触发刷新列表事件
    emits('refreshList');
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
    <div class="processing-project-dialog-container">
        <el-dialog
            v-model="visible"
            title="正在处理中的项目列表"
            :width="isMobile ? '95%' : '800px'"
            destroy-on-close
            :append-to-body="true"
        >
        <el-tabs :tab-position="isMobile ? 'top' : 'left'" 
                 :style="{ height: isMobile ? '500px' : '600px' }">
            <el-tab-pane label="正在转化">
                <div class="pane-content" 
                     :class="[isMobile ? 'h-450px' : 'h-600px']" 
                     v-show="props.processingProjectList.length > 0">
                    <el-scrollbar>
                        <div class="tip text-red mb-3" 
                             :class="[isMobile ? 'text-14px px-3' : 'text-16px px-4']"
                             v-show="props?.processingProjectList?.length > 0">
                            任务正在自动排队处理, 请耐心等待...
                        </div>
                        <div class="processing-project-list" 
                             :class="[isMobile ? 'px-2 py-2' : 'px-10px py-10px']">
                            <ProjectStatusCard 
                                v-for="project in props.processingProjectList" 
                                :key="project.id" 
                                :class="[isMobile ? 'mb-2' : 'mb-10px']"
                                :data="project" 
                                @task-canceled="handleTaskCanceled" />
                        </div>
                    </el-scrollbar>
                </div>
                <div v-show="props.processingProjectList.length == 0" 
                     class="mobile-empty"
                     :class="[isMobile ? 'h-450px' : 'h-600px']">
                    <div class="flex flex-col items-center justify-center h-full text-gray-500">
                        <div :class="[isMobile ? 'text-16px mb-2' : 'text-18px mb-3']">
                            目前没有正在转化的项目哦
                        </div>
                        <div :class="[isMobile ? 'text-14px' : 'text-16px']">
                            快去新建一个项目吧
                        </div>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="转化失败">
                <div class="pane-content" 
                     :class="[isMobile ? 'h-450px' : 'h-600px']" 
                     v-show="props.failedProjectList.length > 0">
                    <el-scrollbar>
                        <div class="failed-project-list" 
                             :class="[isMobile ? 'px-2 py-2' : 'px-10px py-10px']">
                            <ProjectStatusCard 
                                v-for="project in props.failedProjectList" 
                                :key="project.id" 
                                :class="[isMobile ? 'mb-2' : 'mb-10px']"
                                :data="project" 
                                @task-canceled="handleTaskCanceled" />
                        </div>
                    </el-scrollbar>
                </div>
                <div v-show="props.failedProjectList.length == 0" 
                     class="mobile-empty"
                     :class="[isMobile ? 'h-450px' : 'h-600px']">
                    <div class="flex flex-col items-center justify-center h-full text-gray-500">
                        <div :class="[isMobile ? 'text-16px mb-2' : 'text-18px mb-3']">
                            目前还没有转化失败的项目哦
                        </div>
                        <div :class="[isMobile ? 'text-14px' : 'text-16px']">
                            这引擎也太棒了吧
                        </div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped></style>
