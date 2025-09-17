<script setup lang="ts">
import { getAssetList } from '@/apis/assets';
import type { DataAsset } from '@/apis/assetsTypes';
import { ref, onMounted, onUnmounted } from 'vue';
import DataAssetListItem from './DataAssetListItem.vue';
import AddDataAssetItemDialog from './AddDataAssetItemDialog.vue';

const visible = defineModel({ type: Boolean, required: true});
/**
 * @description 当前页码
 */
const page = ref(1);
/**
 * @description 每页数据资源数量
 */
const pageSize = ref(10);
/**
 * @description 数据资源总数
 */
const total = ref(0);
/**
 * @description 数据资源列表
 */
const assetList = ref<DataAsset[]>([]);
/**
 * @description 更新数据资源列表
 */
const updateAssetList = async () => {
    const getAssetListResponse = await getAssetList(page.value, pageSize.value);
    console.log('数据资源列表:', getAssetListResponse);
    // 使用后端返回的总数，如果没有则使用当前页数据长度
    total.value = getAssetListResponse.data.total || getAssetListResponse.data.data.length;
    assetList.value = getAssetListResponse.data.data;
};
updateAssetList();
/**
 * @description 数据资源库弹窗打开事件
 */
const handleDialogOpen = () => {
    updateAssetList();
};
/**
 * @description 数据资源列表项删除成功事件
 */
const handleDataAssetItemDeleteSuccess = () => {
    updateAssetList();
};
/**
 * @description 新增数据资源按钮点击事件
 */
const addDataAssetItemDialogVisible = ref(false);
/**
 * @description 新增数据资源按钮点击事件
 */
const handleAddDataAssetItemBtnClick = () => {
    addDataAssetItemDialogVisible.value = true;
};
/**
 * @description 新增数据资源成功事件
 */
const addDataAssetItemSuccess = () => {
    updateAssetList();
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
    <div class="assets-store-dialog-container">
        <el-dialog
            v-model="visible"
            title="数据资源库"
            :width="isMobile ? '95%' : '800px'"
            destroy-on-close
            :append-to-body="true"
            @open="handleDialogOpen"
        >
            <div class="header-container" 
                 :class="['flex items-center justify-between', isMobile ? 'mb-3' : 'mb-4']">
                <div class="left-container">
                    <!-- 可以添加搜索或筛选功能 -->
                </div>
                <div class="right-container">
                    <el-button type="primary" 
                               :size="isMobile ? 'default' : 'default'"
                               class="mobile-btn"
                               @click="handleAddDataAssetItemBtnClick">
                        <span class="hidden sm:inline">新增数据</span>
                        <span class="sm:hidden">新增</span>
                    </el-button>
                </div>
            </div>
            <div class="data-asset-list-container" 
                 :class="[isMobile ? 'h-400px' : 'h-500px']">
                <el-scrollbar>
                    <div class="data-asset-list" 
                         :class="[isMobile ? 'py-2 px-2' : 'py-10px px-10px']">
                        <DataAssetListItem 
                            v-for="dataAsset in assetList" 
                            :key="dataAsset.id" 
                            :data="dataAsset" 
                            @delete-success="handleDataAssetItemDeleteSuccess" 
                            :class="[isMobile ? 'mb-2' : 'mb-10px']" />
                    </div>
                    
                    <!-- 空状态 -->
                    <div v-if="assetList.length === 0" 
                         class="mobile-empty">
                        <div class="text-center text-gray-500 py-8">
                            <div class="text-16px mb-2">暂无数据资源</div>
                            <div class="text-14px">点击上方"新增数据"按钮创建第一个数据资源</div>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
            <div class="pagination-container" 
                 :class="['flex justify-center', isMobile ? 'mt-3' : 'mt-4']">
                <el-pagination 
                    v-model:current-page="page"
                    background 
                    :layout="isMobile ? 'prev, pager, next' : 'prev, pager, next, total'"
                    :total="total"
                    :small="isMobile"
                    @current-change="updateAssetList"
                />
            </div>
            <!-- 新增数据资源弹窗 -->
            <AddDataAssetItemDialog v-model="addDataAssetItemDialogVisible" @add-success="addDataAssetItemSuccess" />
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped></style>
