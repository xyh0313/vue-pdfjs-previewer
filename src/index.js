// 导入组件
import PdfPreviewer from './components/pdfPreviewer';

// 存储组件列表
const components = [
    PdfPreviewer
]

// 定义 install 方法，接收 Vue 作为参数
const install = function (Vue) {
    if(install.installed) return
    components.map(component => Vue.component(component.name, component))
}

// 判断是否是直接引入文件
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}
// 导出组件
export default {
    // 导出的对象必须具有 install，才能被 Vue.use() 方法安装
    install,
    // 预览组件
    PdfPreviewer
}