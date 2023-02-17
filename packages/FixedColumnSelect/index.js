import FixedColumnSelect from './src/FixedColumnSelect'

// 为组件提供 install 安装方法，供按需引入
FixedColumnSelect.install = function (Vue) {
    Vue.component(FixedColumnSelect.name, FixedColumnSelect)
}

// 默认导出组件
export default FixedColumnSelect
