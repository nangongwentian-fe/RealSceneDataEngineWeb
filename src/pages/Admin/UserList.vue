<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { listUsers, updateUserTags } from '@/apis/admin';
import { getTags } from '@/apis/tag';
import { ElMessage } from 'element-plus';
import TagFilter from '@/components/common/TagFilter.vue';
import { useRouter } from 'vue-router';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  allowedTags: number[];
}

const users = ref<UserRow[]>([]);
const loading = ref(false);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await listUsers();
    users.value = res.data;
  } catch (e) {
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const router = useRouter();

// tag map - 存储完整的标签信息（包括颜色）
const tagMap = ref<Record<number, {name: string, color: string}>>({});
const fetchTags = async()=>{
  try{const res=await getTags();
      res.data.data.forEach((t:any)=>{
        tagMap.value[t.id] = {
          name: t.name,
          color: t.color
        };
      });
  }catch(e){/* ignore*/}
};

// 移动端检测逻辑已移到下面，移除重复的onMounted

// 编辑弹窗
const dialogVisible = ref(false);
const editingUser = ref<UserRow | null>(null);
const selectedTags = ref<number[]>([]);

// 移动端检测
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  fetchUsers();
  fetchTags();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

const openTagDialog = (row: UserRow) => {
  editingUser.value = row;
  selectedTags.value = [...row.allowedTags];
  dialogVisible.value = true;
};

const saveTags = async () => {
  if (!editingUser.value) return;
  try {
    await updateUserTags(editingUser.value.id, selectedTags.value);
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    fetchUsers();
  } catch (e) {
    ElMessage.error('保存失败');
  }
};
</script>

<template>
  <div :class="['safe-area-top safe-area-bottom', isMobile ? 'p-4' : 'p-24']">
    <div :class="[isMobile ? 'mb-4' : 'mb-16px']">
      <el-button @click="router.push('/home')" 
                 :size="isMobile ? 'default' : 'default'"
                 class="mobile-btn">返回首页</el-button>
    </div>
    
    <!-- 移动端卡片式布局 -->
    <div v-if="isMobile" class="mobile-user-list">
      <div v-loading="loading" class="space-y-3">
        <div v-for="user in users" :key="user.id" 
             class="mobile-card p-4 rounded-lg border border-gray-200 bg-white">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <h3 class="text-16px font-medium text-gray-900 truncate">{{ user.name }}</h3>
              <p class="text-14px text-gray-500 truncate">{{ user.email }}</p>
            </div>
            <span :class="['px-2 py-1 rounded text-12px font-medium', 
                          user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800']">
              {{ user.role === 'admin' ? '管理员' : '用户' }}
            </span>
          </div>
          
          <div class="mb-3">
            <p class="text-12px text-gray-600 mb-1">可见标签：</p>
            <div class="flex flex-wrap gap-1">
              <template v-if="user.role==='admin'">
                <span class="px-2 py-1 rounded text-12px font-medium bg-green-100 text-green-800">全部</span>
              </template>
              <template v-else-if="user.allowedTags.length===0">
                <span class="px-2 py-1 rounded text-12px bg-gray-100 text-gray-500">无</span>
              </template>
              <template v-else>
                <el-tag v-for="tagId in user.allowedTags" 
                        :key="tagId"
                        :color="tagMap[tagId]?.color || '#409eff'"
                        size="small"
                        :style="{ 
                          color: '#fff',
                          border: 'none',
                          fontSize: '12px',
                          padding: '4px 8px',
                          marginRight: '4px',
                          marginBottom: '4px'
                        }">
                  {{ tagMap[tagId]?.name || tagId }}
                </el-tag>
              </template>
            </div>
          </div>
          
          <div class="flex justify-end">
            <span v-if="user.role==='admin'" class="text-gray-400 text-14px">—</span>
            <el-button v-else 
                       size="small" 
                       type="primary" 
                       class="mobile-btn"
                       @click="openTagDialog(user)">编辑标签</el-button>
          </div>
        </div>
        
        <div v-if="users.length === 0 && !loading" 
             class="text-center text-gray-500 py-8">
          暂无用户数据
        </div>
      </div>
    </div>
    
    <!-- 桌面端表格布局 -->
    <el-table v-else 
              :data="users" 
              v-loading="loading" 
              style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色" width="100" />
      <el-table-column label="可见标签" min-width="200">
        <template #default="{ row }">
          <div class="flex flex-wrap gap-1">
            <template v-if="row.role==='admin'">
              <span class="px-2 py-1 rounded text-12px font-medium bg-green-100 text-green-800">全部</span>
            </template>
            <template v-else-if="row.allowedTags.length===0">
              <span class="px-2 py-1 rounded text-12px bg-gray-100 text-gray-500">无</span>
            </template>
            <template v-else>
              <el-tag v-for="tagId in row.allowedTags" 
                      :key="tagId"
                      :color="tagMap[tagId]?.color || '#409eff'"
                      size="small"
                      :style="{ 
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                        padding: '2px 6px',
                        marginRight: '4px',
                        marginBottom: '2px'
                      }">
                {{ tagMap[tagId]?.name || tagId }}
              </el-tag>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <span v-if="row.role==='admin'">—</span>
          <el-button v-else size="small" @click="openTagDialog(row)">编辑标签</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" 
               title="编辑可见标签" 
               :width="isMobile ? '90%' : '400px'"
               :append-to-body="true">
      <TagFilter v-model="selectedTags" 
                 multiple 
                 placeholder="选择标签" 
                 class="mobile-input" />
      <template #footer>
        <div :class="[isMobile ? 'space-x-2' : '']">
          <el-button @click="dialogVisible = false"
                     :size="isMobile ? 'default' : 'default'"
                     class="mobile-btn">取消</el-button>
          <el-button type="primary" 
                     @click="saveTags"
                     :size="isMobile ? 'default' : 'default'"
                     class="mobile-btn">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
