<script setup lang="ts">
import Header from '@/components/common/Header.vue';
import ProjectCard from '@/components/common/ProjectCard.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import AssetsStoreDialog from '@/components/common/AssetsStoreDialog.vue';
import AddProjectDialog from '@/components/common/AddProjectDialog/AddProjectDialog.vue';
import { getProjectList } from '@/apis/project';
import { useAuthStore } from '@/stores/auth';
import type { Project } from '@/apis/projectTypes';
import { ElMessage } from 'element-plus';
import { MessageBox, Setting } from '@element-plus/icons-vue';
import ProcessingProjectDialog from '@/components/common/ProcessingProjectDialog.vue';
import TagFilter from '@/components/common/TagFilter.vue';
import TagManager from '@/components/common/TagManager.vue';
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { useUpdateProjectListSSEHook } from './useUpdateProjectListSSEHook';
import ImportProjectDialog from '@/components/common/ImportProjectDialog/index.vue';
import { useUploadProject } from './useUploadProject';

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

// 上传项目相关hook
const { uploadProjectDialogVisible, handleUploadProjectBtnClick } = useUploadProject();
/**
 * @description 数据资源库弹窗是否可见
 */
const assetsStoreDialogVisible = ref(false);
/**
 * @description 数据资源库按钮点击事件
 */
const handleAssetsStoreBtnClick = () => {
    assetsStoreDialogVisible.value = true;
};

const addProjectDialogVisible = ref(false);
const handleAddProjectBtnClick = () => {
    addProjectDialogVisible.value = true;
};

// 标签管理相关
const tagManagerVisible = ref(false);
const selectedTagId = ref<number | null>(null);
const tagFilterRef = ref<InstanceType<typeof TagFilter>>();

const handleTagManagerBtnClick = () => {
    tagManagerVisible.value = true;
};

const handleTagFilterChange = (tagId: number | number[] | null) => {
    // 如果返回的是数组，取第一个值；如果是单个值，直接使用
    const selectedId = Array.isArray(tagId) ? (tagId.length > 0 ? tagId[0] : null) : tagId;
    selectedTagId.value = selectedId;
    page.value = 1;
    updateProjectList();
};

const page = ref(1);
const pageSize = ref(20); // 增加默认页面大小
const total = ref(0);
const projectList = ref<Project[]>([]);
const trainedProjectList = ref<Project[]>([]);
const failedProjectList = ref<Project[]>([]);
const processingProjectList = ref<Project[]>([]);

const authStore = useAuthStore();

const updateProjectList = () => {
    let tagIds: (string|number)[] = [];
    if (selectedTagId.value) {
        tagIds = [selectedTagId.value];
    } // admin or non-admin default tagIds stays []

    const apiCall = tagIds.length >0 ?
        getProjectList(page.value, pageSize.value, tagIds):
        getProjectList(page.value, pageSize.value);
    
    apiCall.then((getProjectListRes) => {
        // 两个API返回的格式现在是相同的
        let list = getProjectListRes.data.data as any[];
        if(!authStore.isAdmin){
          const allowed = (authStore.user as any)?.allowedTags;
          if(Array.isArray(allowed) && allowed.length>0){
            list = list.filter(p=>{
              if(!p.tags || p.tags.length===0) return true; // untagged visible
              return p.tags.some((t:any)=>allowed.includes(t.id));
            });
          }
        }
        projectList.value = list;
        total.value = getProjectListRes.data.pagination.total;
        
        // 同步分页信息
        page.value = getProjectListRes.data.pagination.page;
        pageSize.value = getProjectListRes.data.pagination.page_size;
        
        trainedProjectList.value = projectList.value.filter((project) => {
            return project.processed_file.status === 'trained';
        })
        failedProjectList.value = projectList.value.filter((project) => {
            return project.processed_file.status === 'failed';
        })
        processingProjectList.value = projectList.value.filter((project) => {
            return project.processed_file.status !== 'failed' && project.processed_file.status !== 'trained';
        })
    }).catch((error) => {
        console.error('获取项目列表失败:', error);
        ElMessage.error('获取项目列表失败');
    })
}
updateProjectList();

// 分页处理函数
const handlePageChange = (newPage: number) => {
    page.value = newPage;
    updateProjectList();
};

const handleSizeChange = (newSize: number) => {
    pageSize.value = newSize;
    page.value = 1; // 重置到第一页
    updateProjectList();
};

/** 使用 SSE 更新项目列表 */
const {} = useUpdateProjectListSSEHook({
    updateProjectList
});

const processingProjectDialogVisible = ref(false);
const handleOpenProcessingProjectDialog = () => {
    processingProjectDialogVisible.value = true;
}

const handleAddProjectSuccess = () => {
    page.value = 1; // Reset to first page
    updateProjectList();
}
const handleDeleteProjectSuccess = () => {
    updateProjectList();
}

const handleRefreshProcessingList = () => {
    updateProjectList();
}

const handleTagsUpdated = () => {
    updateProjectList();
}

// 处理标签管理中的标签更新（新建、编辑、删除）
const handleTagManagerUpdated = () => {
    // 刷新标签筛选组件的标签列表
    tagFilterRef.value?.refreshTags();
}

// 计算分页相关数据
const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

// 生成页码数组（用于移动端平铺分页）
const generatePageNumbers = () => {
    const pages = [];
    const currentPage = page.value;
    const totalPageCount = totalPages.value;
    
    if (totalPageCount <= 0) {
        return [1];
    }
    
    if (totalPageCount <= 5) {
        // 总页数不超过5页，全部显示
        for (let i = 1; i <= totalPageCount; i++) {
            pages.push(i);
        }
    } else {
        // 总页数超过5页，智能显示
        if (currentPage <= 3) {
            // 当前页在前面
            pages.push(1, 2, 3, '...', totalPageCount);
        } else if (currentPage >= totalPageCount - 2) {
            // 当前页在后面
            pages.push(1, '...', totalPageCount - 2, totalPageCount - 1, totalPageCount);
        } else {
            // 当前页在中间
            pages.push(1, '...', currentPage, '...', totalPageCount);
        }
    }
    
    return pages;
};

const pageNumbers = computed(() => generatePageNumbers());
</script>

<template>
    <div class="home" w="full" h="full">
        <Header />
        <div class="page-content safe-area-bottom" 
             :class="['h-[calc(100%-80px)]', 'px-4 md:px-28px', 'py-4 md:py-24px']">
            <!-- 内容header -->
            <div class="content-header mobile-landscape-optimize" 
                 :class="['h-auto md:h-48px', 'mb-4 md:mb-20px', 'flex flex-col md:flex-row', 'items-start md:items-center', 'justify-between', 'gap-3 md:gap-0']">
                <div class="left-container" :class="['flex flex-col sm:flex-row', 'items-start sm:items-center', 'w-full md:w-auto']">
                    <div class="title" :class="['text-18px md:text-20px', 'text-gray-800', 'mb-2 sm:mb-0']">
                        项目列表
                    </div>
                    <div class="filter-container" :class="['ml-0 sm:ml-24px', 'w-full sm:w-auto']">
                        <TagFilter 
                            ref="tagFilterRef"
                            v-model="selectedTagId"
                            placeholder="按标签筛选"
                            @change="handleTagFilterChange"
                        />
                    </div>
                </div>
                <div class="right-container" 
                     :class="['flex items-center', 'w-full md:w-auto', 'gap-2', 'pb-2 md:pb-0', isMobile ? 'overflow-x-auto flex-nowrap h-19' : 'flex-wrap']">
                    <el-button v-if="authStore.isAdmin" 
                               :icon="Setting" 
                               :size="isMobile ? 'default' : 'large'" 
                               class="mobile-btn flex-shrink-0"
                               @click="handleTagManagerBtnClick">
                        <span class="hidden sm:inline">标签管理</span>
                        <span class="sm:hidden">标签</span>
                    </el-button>
                    <el-button type="primary" 
                               :size="isMobile ? 'default' : 'large'" 
                               class="mobile-btn flex-shrink-0"
                               @click="handleAssetsStoreBtnClick">
                        <span class="hidden sm:inline">数据资源库</span>
                        <span class="sm:hidden">资源库</span>
                    </el-button>
                    <el-button type="primary" 
                               :size="isMobile ? 'default' : 'large'" 
                               class="mobile-btn flex-shrink-0"
                               @click="handleAddProjectBtnClick">
                        <span class="hidden sm:inline">新建项目</span>
                        <span class="sm:hidden">新建</span>
                    </el-button>
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="如果你有已经处理好的3dgs结果"
                        :placement="isMobile ? 'top' : 'top'"
                    >
                        <el-button type="primary" 
                                   :size="isMobile ? 'default' : 'large'" 
                                   class="mobile-btn flex-shrink-0"
                                   @click="handleUploadProjectBtnClick">
                            <span class="hidden sm:inline">导入项目</span>
                            <span class="sm:hidden">导入</span>
                        </el-button>
                    </el-tooltip>
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="正在处理的项目"
                        :placement="isMobile ? 'top' : 'bottom'"
                    >
                        <el-badge :value="processingProjectList.length" class="flex-shrink-0">
                            <el-button :size="isMobile ? 'default' : 'large'" 
                                       :icon="MessageBox" 
                                       class="mobile-btn"
                                       @click="handleOpenProcessingProjectDialog"></el-button>
                        </el-badge>
                    </el-tooltip>
                </div>
            </div>
            <!-- 项目列表 -->
            <div class="content-project-container" :class="['h-[calc(100%-120px)] md:h-[calc(100%-48px-20px-80px)]']">
                <el-scrollbar>
                    <div class="project-list" 
                         :class="['px-2 md:px-10px', 'py-2 md:py-10px', 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5', 'gap-3 md:gap-2', 'md:flex md:flex-wrap']">
                        <!-- 项目卡片 -->
                        <ProjectCard v-for="project in trainedProjectList" 
                                     :key="project.id" 
                                     :data="project" 
                                     :class="['md:mr-10px md:mb-10px']"
                                     @delete-project-success="handleDeleteProjectSuccess" 
                                     @tags-updated="handleTagsUpdated" />
                        
                        <!-- 移动端平铺分页（作为网格项） -->
                        <div v-if="isMobile && totalPages > 0" 
                             class="inline-pagination-grid"
                             :class="['col-span-full', 'mt-4']">
                            <div class="inline-page-buttons">
                                <!-- 上一页 -->
                                <button 
                                    class="inline-page-btn"
                                    :class="{ disabled: page <= 1 }"
                                    :disabled="page <= 1"
                                    @click="handlePageChange(page - 1)">
                                    ← 上一页
                                </button>
                                
                                <!-- 页码 -->
                                <button 
                                    v-for="(pageNum, index) in pageNumbers"
                                    :key="index"
                                    class="inline-page-btn"
                                    :class="{ 
                                        active: pageNum === page,
                                        ellipsis: pageNum === '...'
                                    }"
                                    :disabled="pageNum === '...'"
                                    @click="pageNum !== '...' && handlePageChange(pageNum as number)">
                                    {{ pageNum }}
                                </button>
                                
                                <!-- 下一页 -->
                                <button 
                                    class="inline-page-btn"
                                    :class="{ disabled: page >= totalPages }"
                                    :disabled="page >= totalPages"
                                    @click="handlePageChange(page + 1)">
                                    下一页 →
                                </button>
                            </div>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
            
            <!-- 桌面端Element分页 -->
            <div v-if="!isMobile" class="pagination-container">
                <el-config-provider :locale="zhCn">
                    <el-pagination 
                        v-model:current-page="page" 
                        v-model:page-size="pageSize" 
                        :page-sizes="[10, 20, 30, 50, 100]" 
                        background 
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="total"
                        :hide-on-single-page="false"
                        @current-change="handlePageChange"
                        @size-change="handleSizeChange"
                    />
                </el-config-provider>
            </div>
        </div>
    </div>
    <!-- 数据资源库对话框组件 -->
    <AssetsStoreDialog v-model="assetsStoreDialogVisible"/>
    <AddProjectDialog v-model="addProjectDialogVisible" @add-project-success="handleAddProjectSuccess" />
    <ProcessingProjectDialog v-model="processingProjectDialogVisible"  :processing-project-list="processingProjectList" :failed-project-list="failedProjectList" @refresh-list="handleRefreshProcessingList"/>
    <ImportProjectDialog v-model="uploadProjectDialogVisible" />
    <TagManager v-model="tagManagerVisible" @tags-updated="handleTagManagerUpdated" />
</template>

<style lang="scss" scoped>
.content-header {
    .right-container {
        // 桌面端：完全隐藏滚动条，允许换行
        @media (min-width: 769px) {
            overflow: visible;
            flex-wrap: wrap;
            
            // 隐藏所有滚动条
            &::-webkit-scrollbar {
                display: none;
            }
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        
        // 移动端：保持水平滚动功能并设置高度
        @media (max-width: 768px) {
            overflow-x: auto;
            flex-wrap: nowrap;
            height: 75px;
            min-height: 75px;
            
            // 保持移动端滚动条可见
            &::-webkit-scrollbar {
                height: 4px;
            }
            
            &::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 2px;
            }
            
            &::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 2px;
            }
            
            &::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }
        }
    }
}

// 内联分页样式（嵌入项目网格中）
.inline-pagination-grid {
    .inline-page-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        justify-content: center;
        
        .inline-page-btn {
            background: #f8f9fa;
            color: #606266;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 6px 12px;
            font-size: 13px;
            font-weight: 400;
            cursor: pointer;
            transition: all 0.2s ease;
            touch-action: manipulation;
            min-height: 32px;
            min-width: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            &:hover:not(.disabled):not(.ellipsis) {
                background: #e9ecef;
                color: #495057;
                border-color: #dee2e6;
            }
            
            &:active:not(.disabled):not(.ellipsis) {
                background: #dee2e6;
            }
            
            &.active {
                background: #409eff;
                color: #fff;
                border-color: #409eff;
                font-weight: 500;
            }
            
            &.disabled {
                background: #f8f9fa;
                color: #adb5bd;
                border-color: #e9ecef;
                cursor: not-allowed;
                opacity: 0.6;
            }
            
            &.ellipsis {
                background: transparent;
                border: none;
                color: #adb5bd;
                cursor: default;
                
                &:hover {
                    background: transparent;
                    color: #adb5bd;
                    border: none;
                }
            }
        }
    }
}

.pagination-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    padding: 10px;
    background: #fff;
    border-top: 1px solid #e4e7ed;
    position: relative;
    z-index: 10;
    
    :deep(.el-pagination) {
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-pagination__total,
        .el-pagination__sizes,
        .el-pagination__jump {
            color: #606266;
        }
        
        .el-pager li {
            background-color: #fff;
            border: 1px solid #dcdfe6;
            
            &.is-active {
                background-color: #409eff;
                color: #fff;
                border-color: #409eff;
            }
            
            &:hover {
                color: #409eff;
            }
        }
        
        .btn-prev,
        .btn-next {
            background-color: #fff;
            border: 1px solid #dcdfe6;
            
            &:hover {
                color: #409eff;
            }
            
            &.is-disabled {
                color: #c0c4cc;
                cursor: not-allowed;
            }
        }
    }
}
</style>
