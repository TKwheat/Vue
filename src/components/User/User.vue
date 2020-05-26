<template>
    <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card >
        <!-- 搜索框 -->
        <el-row :gutter="20" >
                <el-col :span="9">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query"  clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible=true ">添加用户</el-button>
                </el-col>
        </el-row>
        <!-- 添加用户弹出框 -->
        <el-dialog
          title="添加用户"
          :visible.sync="addDialogVisible"
          width="50%"
          @close="addDialogClosed">
          <!-- span为内容主体 -->
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="addForm.username"></el-input>
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input v-model="addForm.password"></el-input>
            </el-form-item>

           <el-form-item label="邮箱" prop="email">
              <el-input v-model="addForm.email"></el-input>
            </el-form-item>

            <el-form-item label="手机" prop="mobile">
              <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
          </el-form>
          <!-- 按钮区 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 表格区 -->
        <el-table :data="userList" style="width: 100%"  stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="username" label="姓名" width="100"></el-table-column>
            <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
            <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
            <el-table-column prop="role_name" label="角色" width="100"></el-table-column>
            <el-table-column label="状态" width="100">
                <!-- 作用域插槽 -->
                <template slot-scope="scope">
                <!-- 渲染开关效果 -->
                <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row) "></el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
                <!-- 作用域插槽 -->
                <template  slot-scope="scope">
                  <!-- 修改按钮 -->
                  <el-tooltip effect="dark" content="修改按钮" placement="top" :enterable="false">
                     <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id) "></el-button>
                  </el-tooltip>

                  <!-- 删除按钮 -->
                  <el-tooltip effect="dark" content="删除按钮" placement="top" :enterable="false">
                      <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id) "></el-button>
                  </el-tooltip>

                  <!-- 分配角色按钮 -->
                  <el-tooltip effect="dark" content="分配角色按钮" placement="top" :enterable="false">
                     <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row) " ></el-button>
                  </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
              @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>

        <!-- 修改用户的对话框 -->
        <el-dialog
          title="修改用户信息"
          :visible.sync="editDialogVisible"
          width="50%" @cloes="editFromClosed">
           <!-- 内容区 -->
          <el-form :model="editFrom" :rules="editFromRules" ref="editFromRef" label-width="70px">
              <el-form-item label="用户名">
                 <el-input v-model="editFrom.username" disabled></el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                 <el-input v-model="editFrom.email"></el-input>
              </el-form-item>
              <el-form-item label="手机" prop="mobile">
                 <el-input v-model="editFrom.mobile"></el-input>
              </el-form-item>
          </el-form>
          <!-- 按钮区 -->
          <span slot="footer" class="dialog-footer">
              <el-button @click="editDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="editUserInfo">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 分配角色的对话框 -->
        <el-dialog
          title="分配角色"
          :visible.sync="setRoleDialogVisible"
          width="50%" @close="setRoleDialogClose">
          <p>当前用户：{{userInfo.username}} </p>
          <p>当前角色：{{userInfo.role_name}} </p>
          <p>分配角色：
            <el-select v-model="selectRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </p>
          <span slot="footer" class="dialog-footer">
            <el-button @click="setRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
          </span>
        </el-dialog>
    </el-card>

    </div>

</template>

<script>
export default {
  data () {
    // 校验邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
      // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }

    // 校验手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
      // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入有效的手机号'))
    }

    return {
      queryInfo: {
        query: '',
        // 当前的页码
        pagenum: 1,
        // 当前每页显示几条数据
        pagesize: 2
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      // 分配角色弹出框
      setRoleDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]

      },
      // 控制修改对话框
      editDialogVisible: false,
      // 修改请求到的用户数据对象
      editFrom: {},
      // 修改表单的验证规则对象
      editFromRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 需要被分配角色的用户信息
      userInfo: '',
      //
      rolesList: '',
      //
      selectRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取数据
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status.status === 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize改变的函数
    handleSizeChange (newSize) {
      // console.log(`每页 ${newSize} 条`)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      // console.log(`当前页: ${newPage}`)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听状态栏开关状态
    async userStateChange (UserInfo) {
      // console.log(UserInfo)
      const { data: res } = await this.$http.put(`users/${UserInfo.id}/state/${UserInfo.mg_state}`)
      if (res.meta.status !== 200) {
        UserInfo.mg_state = !UserInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 弹出对话框的关闭
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定添加用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)

        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 关闭对话框
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    // 修改用户信息
    async showEditDialog (id) {
      // console.log(id)
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('获取用户数据失败')
      }
      this.editFrom = res.data
      // console.log(this.editFrom)
    },
    // 监听修改用户信息关闭事件
    editFromClosed () {
      this.$refs.editFromRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo () {
      this.$refs.editFromRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        // 发起修改信息的数据请求
        const { data: res } = await this.$http.put('users/' + this.editFrom.id,
          {
            email: this.editFrom.email,
            mobile: this.editFrom.mobile
          })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        }
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('更新用户信息成功')
      })
    },
    // 根据id删除用户
    async removeUserById (id) {
      // console.log(id)
      // 弹框二次确认
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 确定为
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') return
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) { this.$message.error('删除用户失败') }
      this.$message.success('删除用户成功')
      this.getUserList()
    },
    // 获取所有角色列表
    async getAllRole () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) { return this.$message.error('获取所有角色列表失败') }
      this.rolesList = res.data
      // console.log('成功', this.rolesList)
    },
    // 展示分配角色的对话框
    setRole (userInfo) {
      this.getAllRole()
      this.userInfo = userInfo
      this.setRoleDialogVisible = true
      // console.log(userInfo)
    },
    // 点击按钮分配角色
    async saveRoleInfo () {
      if (!this.selectRoleId) {
        return this.$message.error('请选择分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectRoleId })
      // console.log(res)

      if (res.meta.data !== 200) {
        this.$message.error('分配角色失败')
      }
      this.$message.success('分配角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听分配角色对话框关闭事件
    setRoleDialogClose () {
      this.selectRoleId = ''
      this.userInfo = ''
    }

  }
}
</script>

<style>

</style>
