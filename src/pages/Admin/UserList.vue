<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

// tag map
const tagMap = ref<Record<number,string>>({});
const fetchTags = async()=>{
  try{const res=await getTags();
      res.data.data.forEach((t:any)=>{tagMap.value[t.id]=t.name});
  }catch(e){/* ignore*/}
};

// fetchUsers inside onMounted also call fetchTags
onMounted(()=>{fetchUsers();fetchTags();});

// 编辑弹窗
const dialogVisible = ref(false);
const editingUser = ref<UserRow | null>(null);
const selectedTags = ref<number[]>([]);

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
  <div p="24">
    <div style="margin-bottom:16px">
      <el-button @click="router.push('/home')">返回首页</el-button>
    </div>
    <el-table :data="users" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色" width="100" />
      <el-table-column label="可见标签">
        <template #default="{ row }">
          <span>
            <template v-if="row.role==='admin'">全部</template>
            <template v-else-if="row.allowedTags.length===0">无</template>
            <template v-else>
              {{ row.allowedTags.map((id:number)=>tagMap[id]||id).join(', ') }}
            </template>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <span v-if="row.role==='admin'">—</span>
          <el-button v-else size="small" @click="openTagDialog(row)">编辑标签</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="编辑可见标签" width="400">
      <TagFilter v-model="selectedTags" multiple placeholder="选择标签" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTags">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
