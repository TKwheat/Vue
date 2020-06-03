<template>
<div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
          <!-- 提示 -->
          <el-alert
            title="只允许为第三级分类设置相关参数"
            type="warning"
            :closable="false"
            show-icon>
          </el-alert>

          <!-- 选择商品分类区 -->
          <el-row class="cat_opt">
            <el-col>
              <span>选择商品分类：</span>
              <!-- 级联选择框 -->
                <el-cascader
                  v-model="selectedCateKeys"
                  :options="catList"
                  :props="catprops"
                  @change="handleChange">
                </el-cascader>
            </el-col>
          </el-row>

          <!-- tab 页签区 -->
          <el-tabs v-model="activeName" @tab-click="handleClick">
              <!-- 添加动态参数的面板 -->
              <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addDialogVisible = true"> 添加参数</el-button>
                <!-- 动态参数表格 -->
                <el-table :data="manyTableDate" border stripe>
                  <el-table-column type="expand" >
                    <template slot-scope="scope">
                      <!-- 循环渲染tag标签 -->
                        <el-tag  v-for="(item,i) in scope.row.attr_vals" :key="i" closable> {{item}} </el-tag>

                        <!-- 添加输入框 -->
                        <el-input
                          class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row) "
                        >
                        </el-input>
                        <!-- 添加按钮 -->
                        <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                    </template>
                  </el-table-column>
                  <el-table-column type="index" ></el-table-column>
                  <el-table-column  label="参数名称" prop="attr_name"></el-table-column>
                  <el-table-column  label="操作" >
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id) ">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id) ">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>

              </el-tab-pane>

              <!-- 添加静态属性的面板 -->
              <el-tab-pane label="静态属性" name="only">
                 <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addDialogVisible = true"> 添加属性</el-button>

                <!-- 静态态参数表格 -->
                <el-table :data="onlyTableDate" border stripe>
                  <el-table-column type="expand" >
                    <template slot-scope="scope">
                      <!-- 循环渲染tag标签 -->
                        <el-tag  v-for="(item,i) in scope.row.attr_vals" :key="i" closable> {{item}} </el-tag>

                        <!-- 添加输入框 -->
                        <el-input
                          class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row) "
                        >
                        </el-input>
                        <!-- 添加按钮 -->
                        <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                    </template>
                  </el-table-column>
                  <el-table-column type="index" ></el-table-column>
                  <el-table-column  label="属性名称" prop="attr_name"></el-table-column>
                  <el-table-column  label="操作" >
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
          </el-tabs>
    </el-card>

    <!-- 添加弹参数出框 -->
    <el-dialog
        :title="titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClose"
        >
        <!-- 添加动态参数表单 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addDParmas">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 编辑参数出框 -->
    <el-dialog
        :title="titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose"
        >
        <!-- 添加动态参数表单 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParmas">确 定</el-button>
        </span>
    </el-dialog>

</div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类数据
      catList: [],
      catprops: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 当前激活的页签
      activeName: 'many',
      manyTableDate: [],
      onlyTableDate: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 修改的表单数据对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCatList()
  },
  methods: {
    // 获取所有分类列表数据
    async getCatList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      }
      console.log(res.data)
      this.catList = res.data
    },
    // 级联选择框选中项变化触发
    handleChange () {
      console.log(this.selectedCateKeys)
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableDate = []
        this.onlyTableDate = []
        return
      }
      console.log(this.selectedCateKeys)
      this.getParmsData()
    },
    // tab页签点击事件
    handleClick () {
      console.log(this.activeName)
      this.getParmsData()
    },
    // 获取参数的列表数据
    async getParmsData () {
      // 根据当前所选的分类和当前所处的面板发起请求，获取数据
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数/属性失败')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals
          ? item.attr_vals.split(' ') : []
        // 添加一个布尔值控制文本框的显示与隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableDate = res.data
      } else {
        this.onlyTableDate = res.data
      }
    },
    // 监听添加对话框关闭
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加参数
    addDParmas () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.getParmsData()
        this.addDialogVisible = false
      })
    },
    // 点击按钮展示修改对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.editForm = res.data

      this.editDialogVisible = true
    },
    // 监听修改对话框的关闭事件
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮修改参数信息
    editParmas () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 200) {
          return this.$message.error('请求修改参数失败')
        }
        this.$message.success('请求修改参数成功')
        this.getParmsData()
        this.editDialogVisible = false
      })
    },
    // 根据id删除对应的参数项
    async removeParams (id) {
      const result = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (result !== 'confirm') return
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除成功')
      this.getParmsData()
    },
    // 文本框失去焦点
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 用户输入了 真正的标签
      row.attr_vals.push(row.inputValue.trim())

      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      console.log(res)

      if (res.meta.status !== 200) {
        return this.$message.error('添加失败')
      }
      this.$message.success('添加成功')
      row.inputValue = ''
      row.inputVisible = false
    },
    // 点击按钮展示输入框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // nextTick ： 当页面上元素被重新渲染后才会执行回调函数
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }

  },
  computed: {
    // 如果按钮需要被禁用则返回true，否则返回false
    isBtnDisable () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的分类id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.input-new-tag {
  width: 120px;
}
</style>
