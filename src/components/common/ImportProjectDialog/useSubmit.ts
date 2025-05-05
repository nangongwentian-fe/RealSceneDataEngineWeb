import { ElMessage, ElLoading, type UploadUserFile } from 'element-plus';
import { ref, type Ref } from 'vue';
import { importProject } from '@/apis/project';
import type { Form } from './useForm';

interface Props {
    form: Form;
    isValidStructure: Ref<boolean>;
    fileList: Ref<UploadUserFile[]>;
    coverImageList: Ref<UploadUserFile[]>;
    emit: (event: 'success' | 'close', ...args: any[]) => void;
}

export const useSubmit = (props: Props) => {
    // 上传状态
    const submitting = ref(false);

    /** 处理上传按钮点击 */
    const handleUpload = async () => {
        if (!props.form.name.trim()) {
            ElMessage.warning('请输入项目名称');
            return;
        }
        
        if (!props.form.coverImage) {
            ElMessage.warning('请上传项目封面图');
            return;
        }
        
        if (!props.form.zip) {
            ElMessage.warning('请先上传ZIP文件');
            return;
        }
        
        if (!props.isValidStructure.value) {
            ElMessage.warning('文件结构不满足要求，无法上传');
            return;
        }
        
        try {
            submitting.value = true;
            
            // 创建FormData对象
            const formData = new FormData();
            formData.append('name', props.form.name);
            formData.append('root_dir', props.form.rootDir);
            formData.append('cover_image', props.form.coverImage.raw as File);
            formData.append('zip_file', props.form.zip.raw as File);
            
            // 显示全屏加载
            const loadingInstance = ElLoading.service({
                lock: true,
                text: '正在上传项目，请稍候...',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            
            // 调用导入项目API
            const response = await importProject(formData);
            
            // 关闭加载
            loadingInstance.close();
            
            // 提示成功
            ElMessage.success('项目导入成功');
            
            // 重置表单数据
            resetForm();
            
            // 触发成功事件
            props.emit('success', response);
            
            // 关闭对话框
            props.emit('close');
        } catch (error) {
            console.error('导入项目失败:', error);
            ElMessage.error('导入项目失败，请重试');
        } finally {
            submitting.value = false;
        }
    }

    /** 重置表单数据 */
    const resetForm = () => {
        // 重置项目名称
        props.form.name = '';
        
        // 重置项目封面图
        props.form.coverImage = null;
        props.coverImageList.value = [];
        
        // 重置ZIP文件
        props.form.zip = null;
        props.form.rootDir = '';
        props.fileList.value = [];
        
        // 重置验证状态
        props.isValidStructure.value = false;
    }

    return {
        submitting,
        handleUpload
    }
}