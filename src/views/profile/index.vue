<template>
  <div class="profile-container">
    <!-- 主要内容区域 -->
    <div class="profile-content">
      <!-- 用户信息主卡片 -->
      <div class="user-info-card">
        <!-- 左侧：用户头像区域 -->
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <el-avatar :size="120" :src="userInfo.avatar" class="user-avatar">
              <el-icon :size="60"><User /></el-icon>
            </el-avatar>
            <div class="avatar-upload-btn" @click="triggerAvatarUpload">
              <el-icon><Camera /></el-icon>
            </div>
          </div>
          <div class="user-title">
            <h2 class="user-name">{{ userInfo.username || "未设置用户名" }}</h2>
            <div class="user-role">{{ roleName }}</div>
          </div>
        </div>

        <!-- 中间：用户信息表单 -->
        <div class="profile-form-section">
          <el-form
            ref="profileFormRef"
            :model="userForm"
            :rules="rules"
            label-width="120px"
            class="profile-form"
            label-position="left"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="userForm.username"
                placeholder="请输入用户名"
                :disabled="!editMode"
                clearable
              />
            </el-form-item>

            <el-form-item label="邮箱地址" prop="email">
              <el-input
                v-model="userForm.email"
                placeholder="请输入邮箱地址"
                :disabled="!editMode"
                clearable
              />
            </el-form-item>

            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="userForm.sex" :disabled="!editMode">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
                <el-radio :label="0">沃尔玛购物袋</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="角色">
              <el-input :value="roleName" disabled />
            </el-form-item>

            <el-form-item label="账户状态">
              <el-tag
                :type="userForm.status === 1 ? 'success' : 'danger'"
                effect="light"
                size="default"
              >
                {{ userForm.status === 1 ? "正常" : "禁用" }}
              </el-tag>
            </el-form-item>

            <el-form-item>
              <div class="form-actions">
                <el-button
                  v-if="!editMode"
                  type="primary"
                  @click="editMode = true"
                  :icon="Edit"
                  size="large"
                >
                  编辑资料
                </el-button>
                <template v-else>
                  <el-button type="primary" @click="submitForm" size="large">
                    保存修改
                  </el-button>
                  <el-button @click="cancelEdit" size="large"> 取消 </el-button>
                </template>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 右侧：修改密码表单 -->
        <div class="password-form-section">
          <h3 class="section-title">修改密码</h3>
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="80px"
            class="password-form"
            label-position="left"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入原密码"
                show-password
                clearable
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
                clearable
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
                clearable
              />
            </el-form-item>
            <el-form-item>
              <div class="password-actions">
                <el-button
                  type="primary"
                  @click="submitPasswordForm"
                  size="large"
                >
                  修改密码
                </el-button>
                <el-button class="reset" @click="resetPasswordForm" size="large">
                  重置
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件上传 -->
    <el-upload
      ref="avatarUploadRef"
      class="hidden-upload"
      action="#"
      :http-request="uploadAvatar"
      :show-file-list="false"
      :before-upload="beforeAvatarUpload"
      accept="image/*"
    >
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import {
  getUserProfileApi,
  updateUserProfileApi,
  changePasswordApi,
  uploadAvatar as uploadAvatarApi,
} from "@/api/system/user";
import {
  User,
  Camera,
  Edit,
} from "@element-plus/icons-vue";

const avatarUploadRef = ref();

// 触发头像上传
function triggerAvatarUpload() {
  avatarUploadRef.value?.$el.querySelector("input").click();
}

// 用户信息
const userInfo = ref({
  id: 0,
  username: "",
  email: "",
  avatar: "",
  sex: 1,
  roleId: 3,
  status: 1,
});

// 用户表单
const userForm = reactive({
  username: "",
  email: "",
  sex: 1,
  status: 1,
});

// 密码表单
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 表单引用
const profileFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

// 编辑模式状态
const editMode = ref(false);

// 表单校验规则
const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
      message: "请输入正确的邮箱地址",
      trigger: "blur",
    },
  ],
};

// 密码校验规则
const passwordRules = {
  oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 角色名称
const roleName = computed(() => {
  switch (userInfo.value.roleId) {
    case 1:
      return "超级管理员";
    case 2:
      return "管理员";
    case 3:
      return "普通用户";
    default:
      return "未知角色";
  }
});

// 对话框状态（保留兼容性）
const editDialogVisible = ref(false);
const editTab = ref("info");

function cancelPwd() {
  editDialogVisible.value = false;
  editTab.value = "info";
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
}

// 获取用户信息
const getUserProfile = async () => {
  try {
    const { data } = await getUserProfileApi();
    userInfo.value = data;

    // 填充表单数据
    userForm.username = data.username;
    userForm.email = data.email;
    userForm.sex = data.sex;
    userForm.status = data.status;
  } catch (error) {
    console.error("获取用户信息失败", error);
    ElMessage.error("获取用户信息失败");
  }
};

// 提交表单
const submitForm = async () => {
  if (!profileFormRef.value) return;

  await profileFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await updateUserProfileApi({
          id: userInfo.value.id,
          username: userForm.username,
          email: userForm.email,
          sex: userForm.sex,
          status: userForm.status,
        });
        ElMessage.success("个人信息修改成功");
        editMode.value = false;
        getUserProfile(); // 重新获取用户信息
      } catch (error) {
        console.error("修改个人信息失败", error);
        ElMessage.error("修改个人信息失败");
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  if (profileFormRef.value) {
    profileFormRef.value.resetFields();
    userForm.username = userInfo.value.username;
    userForm.email = userInfo.value.email;
    userForm.sex = userInfo.value.sex;
    userForm.status = userInfo.value.status;
  }
};

// 取消编辑
const cancelEdit = () => {
  editMode.value = false;
  resetForm();
};

// 重置密码表单
const resetPasswordForm = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields();
  }
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
};

// 提交密码表单
const submitPasswordForm = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await changePasswordApi({
          id: userInfo.value.id,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        });
        ElMessage.success("密码修改成功");
        resetPasswordForm();
      } catch (error) {
        console.error("修改密码失败", error);
        ElMessage.error("修改密码失败");
      }
    }
  });
};

// 头像上传前的校验
const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("上传头像图片只能是图片格式!");
    return false;
  }

  if (!isLt2M) {
    ElMessage.error("上传头像图片大小不能超过 2MB!");
    return false;
  }

  return true;
};

// 上传头像
const uploadAvatar = async (options: any) => {
  try {
    const formData = new FormData();
    formData.append("file", options.file);

    const { data } = await uploadAvatarApi(formData);
    if (data) {
      userInfo.value.avatar = data;
      ElMessage.success("头像上传成功");
    }
  } catch (error) {
    console.error("上传头像失败", error);
    ElMessage.error("上传头像失败");
  }
};

onMounted(() => {
  getUserProfile();
});
</script>

<style scoped>
/* 主容器 */
.profile-container {
  width: 100%;
  height: 100%;
  background: transparent;
  padding: 0;
}



/* 主要内容区域 */
.profile-content {
  width: 100%;
  padding: 20px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* 用户信息主卡片 */
.user-info-card {
  width: 100%;
  max-width: 1200px;
  background: transparent;
  display: grid;
  grid-template-columns: 1fr 2fr 1.5fr;
  gap: 20px;
  align-items: start;
  padding: 0;
}

/* 左侧头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  min-height: 500px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.avatar-wrapper {
  position: relative;
}

.user-avatar {
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
}

.avatar-upload-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.avatar-upload-btn:hover {
  background: #337ecc;
  transform: scale(1.1);
}

.user-title {
  text-align: center;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px 0;
}

.user-role {
  font-size: 16px;
  color: #409eff;
  font-weight: 500;
}

/* 中间表单区域 */
.profile-form-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-height: 500px;
}

.profile-form {
  max-width: 100%;
}

.profile-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

.profile-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.profile-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff;
}

.profile-form :deep(.el-radio) {
  margin-right: 20px;
}

.profile-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 16px;
  flex-wrap: wrap;
}

.form-actions .el-button {
  min-width: 100px;
}

/* 右侧密码表单区域 */
.password-form-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-height: 500px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
  text-align: center;
}

.password-form {
  max-width: 400px;
  margin: 0 auto;
}

.password-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

.password-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.password-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff;
}

.password-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.password-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-start;
  margin-top: 16px;
  margin-left: 30px; /* 与label宽度对齐 */
  flex-wrap: wrap;
  .reset{
    margin-left: 0px;
  }
}

.password-actions .el-button {
  min-width: 100px;
}

.hidden-upload {
  display: none;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .user-info-card {
    grid-template-columns: 1fr 2.2fr 1.3fr;
    gap: 16px;
  }
}

@media (max-width: 1200px) {
  .user-info-card {
    grid-template-columns: 1fr 2fr 1fr;
    gap: 16px;
  }

  .profile-form-section {
    padding: 30px 25px;
  }

  .password-form-section {
    padding: 30px 25px;
  }
}

@media (max-width: 1024px) {
  .profile-content {
    padding: 16px;
  }
  
  .user-info-card {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 20px;
    max-width: 800px;
  }

  .avatar-section {
    padding: 30px 20px;
    min-height: auto;
  }

  .profile-form-section {
    padding: 30px 20px;
    min-height: auto;
  }

  .password-form-section {
    padding: 30px 20px;
    min-height: auto;
  }

  .password-actions .el-button {
    min-width: 120px;
  }
}

@media (max-width: 768px) {
  .profile-content {
    padding: 20px 16px;
  }

  .user-info-card {
    gap: 30px;
    padding: 30px 20px;
    min-height: auto;
  }

  .avatar-section {
    padding: 25px 15px;
  }

  .profile-form-section {
    padding: 25px 15px;
  }

  .password-form-section {
    padding: 25px 15px;
  }

  .user-name {
    font-size: 22px;
  }

  .profile-form :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  .password-form :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  .form-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .password-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .user-info-card {
    padding: 25px 15px;
    gap: 25px;
  }

  .avatar-section {
    padding: 20px 10px;
  }

  .profile-form-section {
    padding: 20px 10px;
  }

  .password-form-section {
    padding: 20px 10px;
  }

  .user-name {
    font-size: 20px;
  }

  .profile-form :deep(.el-form-item__label) {
    font-size: 14px;
  }

  .password-form :deep(.el-form-item__label) {
    font-size: 14px;
  }

  .form-actions .el-button {
    width: 100%;
    margin-bottom: 8px;
  }

  .password-actions .el-button {
    width: 100%;
    margin-bottom: 8px;
    min-width: auto;
    flex: none;
  }
}
</style>
