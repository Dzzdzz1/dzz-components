import SearchForm from './src/SearchForm'

// 为组件提供 install 安装方法，供按需引入
SearchForm.install = function (Vue) {
    Vue.component(SearchForm.name, SearchForm)
}

// 默认导出组件
export default SearchForm
