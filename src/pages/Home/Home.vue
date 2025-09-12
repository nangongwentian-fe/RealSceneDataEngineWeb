<script setup lang="ts">
import Header from '@/components/common/Header.vue';
import ProjectCard from '@/components/common/ProjectCard.vue';
import { ref } from 'vue';
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
</script>

<template>
    <div class="home" w="full" h="full">
        <Header />
        <div class="page-content" h="[calc(100%-80px)]" px="28px" py="24px">
            <!-- 内容header -->
            <div class="content-header" h="48px"  mb="20px" flex items-center justify-between>
                <div class="left-container" flex items-center>
                    <div class="title" text="20px #222222">
                        项目列表
                    </div>
                    <div class="filter-container" ml="24px">
                        <TagFilter 
                            ref="tagFilterRef"
                            v-model="selectedTagId"
                            placeholder="按标签筛选"
                            @change="handleTagFilterChange"
                        />
                    </div>
                </div>
                <div class="right-container" flex items-center>
                    <el-button v-if="authStore.isAdmin" :icon="Setting" size="large" @click="handleTagManagerBtnClick" mr="10px">标签管理</el-button>
                    <el-button type="primary" size="large" @click="handleAssetsStoreBtnClick">数据资源库</el-button>
                    <el-button type="primary" size="large" @click="handleAddProjectBtnClick" mr="10px">新建项目</el-button>
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="如果你有已经处理好的3dgs结果"
                        placement="top"
                    >
                        <el-button type="primary" size="large" @click="handleUploadProjectBtnClick" mr="10px">导入项目</el-button>
                    </el-tooltip>
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="正在处理的项目"
                        placement="bottom"
                    >
                        <el-badge :value="processingProjectList.length" mr="10px">
                            <el-button size="large" :icon="MessageBox" @click="handleOpenProcessingProjectDialog"></el-button>
                        </el-badge>
                    </el-tooltip>
                </div>
            </div>
            <!-- 项目列表 -->
            <div class="content-project-container" h="[calc(100%-48px-20px-80px)]">
                <el-scrollbar>
                    <div class="project-list" px="10px" py="10px" flex flex-wrap>
                        <ProjectCard v-for="project in trainedProjectList" :key="project.id" :data="project" mr="10px" mb="10px" @delete-project-success="handleDeleteProjectSuccess" @tags-updated="handleTagsUpdated" />
                    </div>
                </el-scrollbar>
            </div>
            <div class="pagination-container">
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
