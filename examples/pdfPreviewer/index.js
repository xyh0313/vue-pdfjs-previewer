/**
 * @file
 */
import Vue from 'vue';
import App from './App.vue';
import PDFPreviewer from '../../dist/bundle.js';

Vue.use(PDFPreviewer);

Vue.config.productionTip = false

new Vue({
    render: h => h(App)
}).$mount('#app')