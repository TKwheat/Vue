<template>
  <div class="login_container">
    <!-- 表单验证：
    1.为表单绑定规则名称 :rules="loginFromRules"
    2.在data中定义相关规则
    3.为item绑定相应规则-->
    <div class="login_box">
        <div class="ava_tar_box">
          <!-- 头像 -->
          <img src="../assets/logo.png" alt="">
        </div>
        <!-- 登录表单区 -->
        <el-form ref="loginFromRef" :model="loginform" :rules="loginFromRules" label-width="0" class="login_form" >
            <!-- 用户名 -->
            <el-form-item prop="username">
                <el-input  prefix-icon="iconfont icon-personal" v-model="loginform.username"></el-input>
            </el-form-item>
            <!-- 密码 -->
            <el-form-item prop="password">
                <el-input  prefix-icon="iconfont icon-lock" v-model="loginform.password" type="password"></el-input>
            </el-form-item>
            <!-- 按钮 -->
            <el-form-item class="btns">
                <el-button type="primary" @click="login">登录</el-button>
                <el-button type="info" @click="resetLoginFrom">重置</el-button>
            </el-form-item>

        </el-form>

    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loginform: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则对象
      loginFromRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置表单
    // 1.为表单添加Ref实例对象
    // 2.为按钮绑定点击事件
    // 3.在点击事件中调用this.$refs.loginFromRef.resetFields()方法
    resetLoginFrom () {
      this.$refs.loginFromRef.resetFields()
    },
    login () {
      this.$refs.loginFromRef.validate(async valid => {
        if (!valid) return
        const { data: result } = await this.$http.post('login', this.loginform)
        if (result.meta.status !== 200) { return this.$message.error('登录失败！') }
        this.$message.success('登录成功！')
        console.log(result)
        // 将登录token保存到sessionStorage中以验证登录状态
        window.sessionStorage.setItem('token', result.data.token)
        // 登录后跳转到后台主页
        this.$router.push('home')
      })
    }
  }
}
</script>

<style lang="less" scoped>

.login_container {
  position: relative;
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 15px;

      .ava_tar_box {
        position: absolute;
        left: 50%;
        transform: translate(-50%,-50%);
        padding: 10px;
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        background-color: #eee;
        box-shadow: 0 0 10px #ddd;
            img {
              width: 100%;
              height: 100%;
              border-radius: 50%;
           };
    }
}
.btns {
  display:flex ;
  justify-content: center;
}
.login_form {
  position: absolute;
  padding: 0 20px;
  width: 100%;
  bottom: 0;
  box-sizing: border-box;
}
</style>
