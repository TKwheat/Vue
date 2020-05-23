<template>
    <el-container class="home-container">
        <!-- 头部 -->
        <el-header>
            <div>
                <img src="../assets/Home_logo.png" alt="">
                <p>速通跨境</p>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 主体 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse ? '64px':'200px'">
                <!-- 侧边栏折叠按钮 -->
                <div class="toggle-button">
                   <i :class="isCollapse ? 'iconfont icon-zhankai':'iconfont icon-shouqi'" @click="toggleCollapse"></i>
                </div>
                <!-- 侧边栏菜单区 -->
                <el-menu background-color="#313743" text-color="#fff" active-text-color="#fff" unique-opened :collapse='isCollapse' :collapse-transition='false' :router="true" :default-active="activePath">
                <!-- 一级菜单 -->
                <el-submenu :index= "items.id+'' " v-for="items in menulist" :key="items.id">

                    <!-- 一级菜单模板区 -->
                    <template slot="title">
                        <!-- 图标和标题-->
                        <i :class="iconObj[items.id]"></i>
                        <span>{{ items.authName }}</span>
                    </template>

                            <!-- 二级菜单 -->
                            <el-menu-item :index=" '/' + subItem.path " v-for="subItem in items.children" :key="subItem.id"  @click="saveNavState('/' + subItem.path ) ">
                                <!-- 二级菜单模板区 -->
                                <template slot="title">
                                      <!-- 图标和标题-->
                                    <i class="el-icon-menu"></i>
                                    <span>{{ subItem.authName }} </span>
                                </template>
                            </el-menu-item>
                </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 内容 -->
            <el-main>
                <!-- 重定向路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>

    </el-container>
</template>

<script>
export default {
  data () {
    return {
      menulist: [],
      iconObj: {
        125: 'iconfont icon-Customermanagement',
        103: 'iconfont icon-similar-product',
        101: 'iconfont icon-bags',
        102: 'iconfont icon-suggest',
        145: 'iconfont icon-tradingdata'
      },
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''

    }
  },

  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },

  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/')
    },
    // 获取所有菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      // console.log(this.menulist)
    },
    // 点击按钮切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" socped>
.home-container {
    height: 100%;
}
.el-header {
    background-color: #363D40;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    > div {
        display: flex;
        align-items: center;
    }
    p {
        margin-left: 15px;
    }

}

.el-header img {
    height: 45px;
}
.el-aside {
    background-color: #313743;
    .toggle-button {
        background-color: #313743;
        font-size: 30px;
        line-height: 24px;
        text-align: right;
        margin-right: 10px;
        color: #fff;

    }
    .toggle-button i {
        cursor: pointer;
    }

    .el-menu {
        border-right: none;
    }
}
.el-main {
    background-color: #E9EDF1;
}
.iconfont {
    margin-right: 10px;
}

</style>
