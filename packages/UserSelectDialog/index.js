import UserSelectDialog from './src/UserSelectDialog'

// 为组件提供 install 安装方法，供按需引入
UserSelectDialog.install = function (Vue) {
    Vue.component(UserSelectDialog.name, UserSelectDialog)
}

// 默认导出组件
export default UserSelectDialog
