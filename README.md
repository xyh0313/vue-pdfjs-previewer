# vue-pdfjs-previewer
基于vue的pdf预览组件

#安装 
    npm install vue-pdfjs-previewer

#使用方法

    #第一步 注册该组件

    import Vue from 'vue'
    import PdfPreviewer from 'vue-pdfjs-previewer'
    Vue.use(PdfPreviewer);

    #第二步 使用该组件 例如：

    <v-pdf-previewer
        title="我是标题"
        :show="isShowViewer"
        :url="url"
        @onBeforePreview="handleBeforePreview"
        @onSuccessOpenPdf="handleSuccessPreview"
        @onFailOpenPdf="handleFailPreview"
        @onCloseViewer="handleCloseViewer"
        @onFinishViewer="handleFinishViewer"
    />

Api说明

    #props
        title   标题
        show    是否可见
        url     预览地址
    
    #methods
        onBeforePreview     预览之前事件
        onSuccessOpenPdf    解析文件成功事件
        onFailOpenPdf       解析文件失败事件
        onCloseViewer       关闭预览事件
        onFinishViewer      完成预览事件 即预览到最后一页