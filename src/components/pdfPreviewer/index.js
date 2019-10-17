import PdfPreviewer from './main.vue';

// 为组件提供按需引入方法
PdfPreviewer.install = function(Vue) {
  Vue.component(PdfPreviewer.name, PdfPreviewer);
};

export default PdfPreviewer;