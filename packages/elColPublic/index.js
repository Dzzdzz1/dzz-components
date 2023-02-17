import elColPublic from './src/elColPublic'

// 为组件提供 install 安装方法，供按需引入
elColPublic.install = function (Vue) {
    Vue.component(elColPublic.name, elColPublic)
}

// 默认导出组件
export default elColPublic
