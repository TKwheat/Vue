<template>
  <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

         <!-- 卡片视图 -->
        <el-card>
           <!-- 添加角色按钮区 -->
            <el-row>
                <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
            </el-row>

            <!-- 添加角色弹出框 -->
            <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed"
                >
                <!-- 内容主体 -->
                <el-form :model="addRoles" :rules="addRolesRules" ref="addRolesRef" label-width="80px">
                    <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="addRoles.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述">
                        <el-input v-model="addRoles.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <!-- 按钮区 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addRole">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 表格区 -->
            <el-table :data="roleList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id" :class="['bd_bottom',i1 === 0 ? 'bd_top':'','vcenter']">
                      <!-- 一级权限 -->
                      <el-col :span="5">
                        <el-tag closable @close="removeRifhtById(scope.row,item1.id) "> {{ item1.authName }}</el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col >
                      <!-- 二级权限 -->
                      <el-col :span="19">
                        <el-row :class="['bd_top',i2 === 0 ? 'bd_top_none' : '','vcenter'] " v-for="(item2,i2) in item1.children" :key="item2.id" >
                            <el-col :span="6">
                              <el-tag type="success" closable @close="removeRifhtById(scope.row,item2.id) "> {{ item2.authName }}</el-tag>
                              <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 三级权限 -->
                            <el-col :span="18">
                               <el-tag type="warning" :class="['bd_top',i3===0 ? 'bd_top_none':'' ] " v-for="(item3,i3) in item2.children" :key="item3.id" closable @close="removeRifhtById(scope.row,item3.id) ">
                                  {{ item3.authName }}
                               </el-tag>
                            </el-col>
                        </el-row>
                      </el-col>
                    </el-row>
                  </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleDesc"></el-table-column>
                <el-table-column label="角色描述" prop="roleName"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRole(scope.row.id) "> 编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)  "> 删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row) ">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 编辑角色弹出框 -->
            <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed"
                >
                <!-- 内容主体 -->
                <el-form :model="editRoles" :rules="editRolesRules" ref="editRolesRef" label-width="80px">
                    <el-form-item label="角色id" >
                        <el-input v-model="editRoles.roleId" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="editRoles.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" >
                        <el-input v-model="editRoles.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <!-- 按钮区 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editRoleInfo">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 分配权限弹出框 -->
            <el-dialog
            title="分配权限"
            :visible.sync="SetRightDialogVisible"
            width="50%" @close="SetRightDialogClosed"
            >
            <!--树形控件 -->
            <el-tree :data="rightsList" :props="RightTreeProps"  show-checkbox default-expand-all node-key="id"  :default-checked-keys="DefKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
              <el-button @click="SetRightDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
          </el-dialog>
        </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      roleList: [],
      // 编辑角色列表数据
      // editRoles: [],
      // 控制弹出框显示隐藏
      addDialogVisible: false,
      editDialogVisible: false,
      SetRightDialogVisible: false,
      addRoles: {},
      editRoles: {},
      addRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      editRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      rightsList: [],
      RightTreeProps: {
        label: 'authName',
        children: 'children'

      },
      DefKeys: [],
      roleId: ''

    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    // 弹出对话框的关闭
    addDialogClosed () {
      this.$refs.addRolesRef.resetFields()
    },
    // 弹出对话框的关闭
    editDialogClosed () {
      this.$refs.editRolesRef.resetFields()
    },
    // 获取所有角色的列表
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) { return this.$message.error('获取角色列表失败') }
      this.roleList = res.data
      //  console.log(this.roleList)
    },
    // 点击按钮添加用户
    addRole () {
      this.$refs.addRolesRef.validate(async valid => {
        if (valid === false) return
        const { data: res } = await this.$http.post('roles', this.addRoles)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getRoleList()
      })
    },
    // 点击按钮编辑用户
    async editRole (id) {
      // console.log(id)
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      this.editRoles = res.data
      // console.log(this.editRoles)
    },
    // 修改角色信息并提交
    editRoleInfo () {
      // 用户修改预验证
      this.$refs.editRolesRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editRole.id,
          {
            roleName: this.editRole.roleName,
            roleDesc: this.editRole.roleDesc
          })
        if (res.meta.status !== 200) {
          this.$message.error('更新角色信息失败')
        }
        this.editDialogVisible = false
        this.getRoleList()
        this.$message.success('更新角色信息成功')
      })
    },
    // 根据id删除用户
    async removeRoleById (id) {
      // 弹框2次确认是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return
      //   console.log(confirmResult)
      const { data: res } = await this.$http.delete('roles/' + id)
      console.log(res)

      if (res.meta.status !== 200) { this.$message.error('删除用户失败') }
      this.$message.success('删除用户成功')
      this.getRoleList()
    },
    // 根据id删除对应的权限
    async removeRifhtById (role, rightsid) {
      // 弹框提示
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return
      // console.log('确认删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightsid}`)

      if (res.meta.status !== 200) { return this.$message.error('取消权限失败') }
      this.$message.success('取消权限成功')
      // console.log(res.data)

      role.children = res.data
      // this.getRoleList()
    },
    // 展示分配权限对话框
    async showSetRightDialog (role) {
      // 保存当前角色id
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree ')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      // 保存返回的数据
      this.rightsList = res.data
      // console.log(this.rightsList)
      // 获取已有权限
      this.getLeafKets(role, this.DefKeys)
      this.SetRightDialogVisible = true
    },
    // 递归获取已有权限
    getLeafKets (node, arr) {
      // 判断是否为三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKets(item, arr)
      })
    },
    // 监听分配权限对话框关闭
    SetRightDialogClosed () {
      this.DefKeys = []
    },
    // 点击确定为角色分配权限
    async allotRights () {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      console.log(keys)
      const idStr = keys.join(',')
      console.log(idStr)
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('更新权限失败')
      }
      this.$message.success('更新权限成功')
      this.getRoleList()
      this.SetRightDialogVisible = false
    }

  }
}
</script>

<style>
.el-tag {
  margin: 7px;
}
.bd_top{
border-top: 1px solid #eee;
}
.bd_top_none {
  border: none;
}
.bd_bottom{
border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
