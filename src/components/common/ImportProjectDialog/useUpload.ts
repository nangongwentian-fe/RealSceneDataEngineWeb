import { ElMessage } from 'element-plus';
import type { UploadFile, UploadProps, UploadUserFile } from 'element-plus';
import type { Form } from './useForm';
import { ref } from 'vue';
import JSZip from 'jszip';

interface Props {
    form: Form;
}

export const useUpload = (props: Props) => {
    // 文件列表引用
    const fileList = ref<UploadUserFile[]>([]);
    // 上传按钮加载状态
    const uploadLoading = ref(false);
    // 是否通过了文件结构验证
    const isValidStructure = ref(false);

    /** 文件上传前的验证 */
    const beforeUpload: UploadProps['beforeUpload'] = (file) => {
        const isZip = file.type === 'application/zip' || file.name.endsWith('.zip');
        if (!isZip) {
            ElMessage.error('只能上传 zip 格式的文件!');
            return false;
        }
        return true;
    }

    /** 文件变更时的处理 */
    const handleFileChange = (uploadFile: UploadFile, uploadFiles: UploadFile[]) => {
        // 如果有多个文件，只保留最新上传的文件
        if (uploadFiles.length > 1) {
            // 移除之前的文件
            fileList.value = [uploadFile];
        } else {
            fileList.value = uploadFiles;
        }
        
        // 更新表单中的zip文件
        props.form.zip = fileList.value.length > 0 ? fileList.value[0] as UploadFile : null;
        
        // 重置文件结构验证状态
        isValidStructure.value = false;
        
        // 如果有文件，则检查文件结构
        if (props.form.zip) {
            checkZipStructure(props.form.zip.raw as File);
        }
    }

    /** 移除文件时的处理 */
    const handleRemove = () => {
        // 清空文件列表
        fileList.value = [];
        // 清空表单中的zip文件
        props.form.zip = null;
        // 重置文件结构验证状态
        isValidStructure.value = false;
    }

    /**
     * 检查ZIP文件结构是否符合要求
     * @param file ZIP文件
     */
    const checkZipStructure = async (file: File) => {
        try {
            uploadLoading.value = true;
            const zip = new JSZip();
            const zipContent = await zip.loadAsync(file);
            
            // 获取所有文件路径
            const filePaths = Object.keys(zipContent.files);
            
            // 查找根目录（第一级目录）
            const rootDirs = new Set<string>();
            filePaths.forEach(path => {
                const parts = path.split('/');
                if (parts.length > 1 && parts[0]) {
                    rootDirs.add(parts[0]);
                }
            });
            
            // 如果没有根目录或有多个根目录，则结构不符合要求
            if (rootDirs.size !== 1) {
                ElMessage.error('上传失败，ZIP文件结构不符合要求，应该只包含一个根目录');
                fileList.value = [];
                props.form.zip = null;
                return;
            }
            
            // 获取唯一的根目录名称
            const rootDir = Array.from(rootDirs)[0];
            
            // 检查必要文件是否存在
            const requiredFiles = [
                `${rootDir}/cameras.json`,
                `${rootDir}/point_cloud/iteration_30000/point_cloud.ply`
            ];
            
            let isValid = true;
            for (const requiredFile of requiredFiles) {
                if (!zipContent.files[requiredFile]) {
                    isValid = false;
                    break;
                }
            }
            
            if (!isValid) {
                ElMessage.error('上传失败，文件结构不满足要求');
                // 清空文件列表
                fileList.value = [];
                // 清空表单中的zip文件
                props.form.zip = null;
            } else {
                isValidStructure.value = true;
                // 保存根目录名称，以便后续使用
                if (props.form.zip) {
                    props.form.rootDir = rootDir;
                }
                ElMessage.success('文件结构验证通过');
            }
        } catch (error) {
            console.error('检查ZIP文件结构出错:', error);
            ElMessage.error('解析ZIP文件出错，请检查文件是否损坏');
            // 清空文件列表
            fileList.value = [];
            // 清空表单中的zip文件
            props.form.zip = null;
        } finally {
            uploadLoading.value = false;
        }
    }

    return {
        fileList,
        uploadLoading,
        isValidStructure,
        beforeUpload,
        handleFileChange,
        handleRemove
    }
}