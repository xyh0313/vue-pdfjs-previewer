
<template>
   <div class="pdf-wrapper" v-if="show" style="opacity:0;">
        <div class="pdf-dialog">
            <div class="pdf-dialog-header">
                <div class="pdf-dialog-title" v-html="title"></div>
                <div class="pdf-dialog-page" v-if="showNumPages">
                    <div class="pdf-arrow pdf-pre-page" title="上一页" @click="getLastPage"></div>
                    <div class="pdf-current-page">
                        <input
                            type="text"
                            name="current-page"
                            :value="currentPageNum"
                            @keyup.13="toCurrentPage"
                            ref="pageInput"
                        >
                    </div>
                    <div class="pdf-vertical-line"></div>
                    <div class="pdf-total-page">{{numPages}} 页</div>
                    <div class="pdf-arrow pdf-next-page" title="下一页" @click="getNextPage"></div>
                </div>
                <div class="pdf-operation">
                    <div class="pdf-operation-btn pdf-close" title="关闭" @click="closePdfDialog"><span class="pdf-icon"></span></div>
                </div>
            </div>
            <div class="pdf-opacity-background"></div>
            <div class="pdf-dialog-body" ref="pdfbody">
                <div class="pdf-content" ref="pdfcontent" @mouseenter="pdfcontentMouseenter" @mouseleave="pdfcontentMouseleave">
                    <div id="pdfcanvas" ref="pdfcanvas"></div>
                    <div class="pdf-toolbar" v-show="showToolBar && showNumPages">
                        <div class="pdf-holder">
                            <span class="pdf-icon pdf-zoom-in" title="放大" @click="zoomIn"></span>
                            <span class="pdf-icon pdf-zoom-out" title="缩小" @click="zoomOut"></span>
                            <span class="pdf-icon pdf-full-screen" title="全屏" @click="fullScreen"></span>
                        </div>
                    </div>
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import PDFJS from 'pdfjs-dist'
import {throttle} from '../../common/tool'
PDFJS.workerSrc = require('pdfjs-dist/build/pdf.worker.js')
export default {
    name: 'v-pdf-previewer',
    data: function () {
        return {
            // 每页高度
            pageHeightList: [],
            // 每页距离顶部距离
            pageOffsetTopList: [0],
            // pdf内容容器高度
            pdfbodyH: 0,
            // pdf文档滚动高度
            scrollTop: 0,
            // 当前页码
            currentPageNum: 1,
            // 总页码
            numPages: 0,
            // 缩放比例
            scale: 1,
            // 展示底部（放大、缩小、全屏）工具栏
            showToolBar: false,
            // 展示顶部页码区
            showNumPages: false,
            // 最大缩放比
            maxScaleNumber: 1.8,
            // 最小缩放比
            minScaleNumber: .6,
            // 每次缩放尺寸
            scaleStep: .2,
            isEndPage: false,
        };
    },
    props: {
        show: {
            type: Boolean,
            required: false,
            default: false
        },
        url: {
            type: String,
            required: false,
            default: ''
        },
        title: {
            type: String,
            required: false,
            default: ''
        }
    },
    computed: {

        previousPageUnclickable () {
            return this.currentPageNum <= 1;
        },

        nextPageUnclickable () {
            return this.currentPageNum === this.numPages || this.isEndPage;
        },

        zoomInUnclickable () {
            return parseInt(this.scale * 10, 10) >= parseInt(this.maxScaleNumber * 10, 10);
        },

        zoomOutUnclickable () {
            return parseInt(this.scale * 10, 10) <= parseInt(this.minScaleNumber * 10, 10);
        },

    },
    watch: {
        show (curVal) {
            const style = document.documentElement.style;
            if (curVal) {
                // 预览todo
                this.$emit('onBeforePreview');
                this.clickPreviewDocument();
                const timer = setTimeout(() => {
                    this.setCurrentPageNum();
                    clearTimeout(timer);
                }, 3000);
                // 遮罩层底部固定
                style.cssText += 'overflow: hidden;'
            } else {
                style.cssText = style.cssText.replace('overflow: hidden;', '');
            }
        },

        /**
         * 监听scrollTop变化，停止滚动时显示底部toolbar
         */
        scrollTop (newValue, oldValue) {
            const timer = setTimeout(() => {
                // 延时执行后当newValue等于pdfbody的滚动值则滚动结束
                if (newValue === this.$refs.pdfbody.scrollTop) {
                    this.isEndPage = parseInt(this.$refs.pdfbody.scrollTop + this.pdfbodyH, 10)
                    === parseInt(parseInt(window.getComputedStyle(this.$refs.pdfcanvas).getPropertyValue('height'), 10) * this.scale, 10);
                    clearTimeout(timer);
                    this.showToolBar = true;
                    if (this.isEndPage) {
                        this.handleEndPreview();
                    }
                };
            }, 200);
        },
    },
    methods: {
        /**
         * 重置缩放等状态
         */
        resetStatus () {
            this.currentPageNum = 1;
            this.scale = 1;
            this.isEndPage = false;
            this.numPages = 0;
        },

        /**
         * 成功打开pdf时
         */
        handleSuccessPreview(){
            this.$emit('onSuccessOpenPdf');
        },

        /**
         * 失败打开pdf
         */
        handleFailPreview(){
            this.$emit('onFailOpenPdf');
            this.$emit('onCloseViewer');
        },

        /**
         * 预览结束时
         */
        handleEndPreview(){
            this.$emit('onFinishViewer');
        },

        /**
         * 触发预览事件
         */
        async clickPreviewDocument () {
            this.resetStatus();
            let url = this.url;
            if (!url) {
                return;
            }
            try {
                let pdfDocProxy = await PDFJS.getDocument({url, rangeChunkSize:65536 * 2}).promise;
                this.pdfDocProxy = pdfDocProxy;
                this.numPages = pdfDocProxy.numPages;
                this.showNumPages = true;
                const container = document.getElementById('pdfcanvas');
                const pageNumber = 1;
                this.handleSuccessPreview();
                this.toRenderPdfPage(pdfDocProxy, pageNumber, container, this.numPages);
            } catch(err) {
                this.handleFailPreview();
                throw new Error(err.message);
            }
        },

        /**
         * 渲染挂载pdf页面，若文件较大，此部分耗时较长
         */
        toRenderPdfPage(pdfDocProxy, pageNumber, container, numPages) {
            const _this = this;
            // 分步获取页面
            pdfDocProxy.getPage(pageNumber)
            .then((page) => {
                const scale = 1.5;
                const viewport = page.getViewport({scale});
                let canvas = document.createElement("canvas");
                canvas.width = parseInt(viewport.width, 10);
                canvas.height = parseInt(viewport.height, 10);
                container.appendChild(canvas);
                if(this.show){
                    document.querySelector('.pdf-content').style.width = parseInt(viewport.width, 10) + 'px';
                }
                // 每页的 height 值
                this.pageHeightList.splice((pageNumber - 1), 1, parseInt(viewport.height, 10));
                // 计算每页的 offsetTop 值,考虑两个canvas间距
                if (pageNumber >= 2) {
                    // 20 是两页间隔的值
                    const currPageOffsetHeight = this.pageOffsetTopList[pageNumber - 2] + this.pageHeightList[pageNumber - 2] + 20;
                    this.pageOffsetTopList.splice((pageNumber - 1), 1, currPageOffsetHeight);
                }
                const ctx = canvas.getContext('2d');
                const renderContext = {
                    canvasContext: ctx,
                    transform: [1, 0, 0, 1, 0, 0],
                    viewport,
                    intent: 'display'
                };
                // 调用渲染
                page.render(renderContext).promise
                .then(() => {
                    // 首页出来后展现界面
                    if (pageNumber === 1 && this.show) {
                        document.querySelector('.pdf-wrapper').setAttribute('style', 'opacity: 1;');
                    }
                    pageNumber += 1;
                    if (pageNumber <= numPages) {
                        _this.toRenderPdfPage(pdfDocProxy, pageNumber, container, numPages);
                    }
                }, (err) => {
                    this.handleFailPreview();
                    throw new Error(err.message)
                });
            }).catch(err => {
                this.handleFailPreview();
                throw new Error(err.message)
            });
        },

        /**
         * 设置当前页码
         */
        setCurrentPageNum() {
            // pdfbody 的高度
            if(this.$refs.pdfbody){
                this.pdfbodyH = parseInt(window.getComputedStyle(this.$refs.pdfbody).getPropertyValue('height'), 10);
                this.$refs.pdfbody.addEventListener('scroll', throttle(() => {
                    this.showToolBar = false;
                    this.scrollTop = this.$refs.pdfbody.scrollTop;
                    this.pageOffsetTopList.forEach((item, index) => {
                        // 判断当前页是否在屏幕视觉范围内
                        if ((this.scrollTop + 200 - item * this.scale) > 0 && (this.scrollTop + 200 - item * this.scale) < this.pageHeightList[index] * this.scale) {
                            this.currentPageNum = index + 1;
                        }
                    });
                }, 300), false);
            }
        },

        /**
         * 点击上一页
         */
        getLastPage () {
            if (this.currentPageNum > 1) {
                this.$refs.pdfbody.scrollTo(0, this.pageOffsetTopList[this.currentPageNum - 2] * this.scale);
            }
        },

        /**
         * 点击下一页
         */
        getNextPage () {
            if (this.currentPageNum < this.numPages) {
                this.$refs.pdfbody.scrollTo(0, this.pageOffsetTopList[this.currentPageNum] * this.scale);
            }
        },

        /**
         * 当前页码获得焦点时 监听 enter 按钮
         */
        toCurrentPage(e) {
            const nextNum = parseInt(e.target.value, 10);
            if (typeof nextNum !== 'number' || nextNum <= 0) {
                return false;
            }
            if (nextNum >= this.numPages) {
                nextNum = this.numPages;
            }
            this.$refs.pdfbody.scrollTo(0, this.pageOffsetTopList[nextNum -1]* this.scale);
        },

        /**
         * 关闭pdf预览层
         */
        closePdfDialog() {
            this.$emit('onCloseViewer');
        },

        /**
         * 鼠标离开进入隐现底部toolbar
         */
        pdfcontentMouseenter () {
            this.showToolBar = true;
        },
        /**
         * 鼠标离开进入隐现底部toolbar
         */
        pdfcontentMouseleave () {
            this.showToolBar = false;
        },

        /**
         * 放大pdf视图
         */
        zoomIn () {
            // 限制最大1.8，每次0.2
            if (this.scale >= this.maxScaleNumber) {return;}
            this.scale += this.scaleStep;
            this.changePdfcanvasScale();
        },

        /**
         * 缩小pdf视图
         */
        zoomOut () {
            // 限制最小.6，每次0.2
            if (this.scale <= this.minScaleNumber) {return;}
            this.scale -= this.scaleStep;
            this.changePdfcanvasScale();
        },

        /**
         * 更改当前文档transform的scale值进行缩放
         */
        changePdfcanvasScale () {
            document.querySelector('#pdfcanvas')
            .setAttribute('style', `transform: scale(${this.scale});transform-origin: center top;`);
        },

        /**
         * 点击实现全屏
         */
        fullScreen () {
            this.requestFullScreen(document.querySelector('.pdf-dialog-body'));
        },

        /**
         * 通过ActiveXObject对象来调取全屏
         */
        requestFullScreen (element) {
            const requestMethod
            = element.requestFullScreen
            || element.webkitRequestFullScreen
            || element.mozRequestFullScreen
            || element.msRequestFullScreen;
            if (requestMethod) {
                requestMethod.call(element);
            } else if (typeof window.ActiveXObject !== 'undefined') {
                const wscript = new ActiveXObject('WScript.Shell');
                if (wscript !== null) {
                    wscript.SendKeys('{F11}');
                }
            }
        },

    }

}
</script>

<style scoped>
    .pdf-dialog{
        min-width: 1100px;
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 101;
        background-color: rgba(0,0,0,0);
    }
    .pdf-dialog-header{
        overflow: hidden;
        height: 62px;
        width: 100%;
        font-size: 15px;
        position: relative;
        background-color: #000;
        color: #fff;
    }
    .pdf-dialog-title{
        float: left;
        min-width: 425px;
        line-height: 57px;
        height: 100%;
        padding-left: 30px;
    }
    .pdf-dialog-page{
        display: inline-block;
        height: 28px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        line-height: 25px;
    }
    .pdf-dialog-page div{
        display: inline-block;
        float: left;
        margin-right: 10px;
    }
    .pdf-dialog-page .pdf-arrow{
        height: 28px;
        width: 28px;
        cursor: pointer;
        opacity: 1;
        background: url('../../assets/imgs/pdf-icons.png') 0 0 no-repeat;
    }
    .pdf-dialog-page .pdf-pre-page{
        background-position: 0 -3px;
    }
    .pdf-dialog-page .pdf-current-page{
        width: 37px;
        height: 24px;
        text-align: right;
        line-height: 24px;
        border-radius: 2px;
        background-color: #303030;
        margin-top: 1px;
    }
    .pdf-dialog-page .pdf-current-page input {
        float: left;
        outline: 0;
        padding: 0;
        line-height: 24px;
        width: 37px;
        height: 100%;
        border: 0;
        background-color: rgba(0,0,0,0);
        text-align: center;
        font-size: 15px;
        color: #fff;
    }
    .pdf-dialog-page .pdf-vertical-line{
        height: 10px;
        margin-top: 7px;
        width: 0;
        border-left: 1px solid #fff;
        border-right: 1px solid #fff;
    }
    .pdf-dialog-page .total-page{
        height: 24px;
        line-height: 24px;
    }
    .pdf-dialog-page .pdf-next-page{
        background-position: -2px -31px;
    }
    .pdf-operation{
        text-align: right;
        float: right;
        height: 100%;
        width: 120px;
    }
    .pdf-operation-btn{
        width: 50px;
        height: 100%;
        position: relative;
        display: inline-block;
        cursor: pointer;
    }
    .pdf-operation-btn .pdf-icon{
        display: inline-block;
        opacity: 1;
        width: 28px;
        height: 28px;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        background:  url('../../assets/imgs/pdf-icons.png') 0 0 no-repeat
    }
    .pdf-close .pdf-icon{
        background-position: 0 -109px;
    }
    .pdf-opacity-background{
        position: relative;
        width: 100%;
        height: 100%;
        background-color: #000;
        opacity: .8;
    } 
    .pdf-dialog-body{
        position: absolute;
        width: 100%;
        height: calc(100% - 62px);
        background-color: rgba(0,0,0,0);
        overflow-y: auto;
        left: 0;
        top: 62px;
    }
    .pdf-content{
        width: 100%;
        height: 100%;
        margin: 0 auto;
    }
    .pdf-content div{
        text-align: center;
    }
    .pdf-toolbar{
        position: fixed;
        left: 0;
        right: 0;
        bottom: 40px;
        margin: 0 auto;
        width: 220px;
        height: 50px;
        border-radius: 5px;
        background-color: #000;
        opacity: .8;
    }
    .pdf-holder{
        width: 190px;
        height: 32px;
        font-size: 0;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
    }
    .pdf-holder .pdf-icon{
        display: inline-block;
        cursor: pointer;
        opacity: 1;
        width: 33.3%;
        height: 100%;
        background: url('../../assets/imgs/pdf-icons.png') 0 0 no-repeat
    }
    .pdf-holder .pdf-zoom-in{
        background-position: 18px -134px;
    }
    .pdf-holder .pdf-zoom-out{
        background-position: 18px -161px;
    }
    .pdf-holder .pdf-full-screen{
        background-position: 19px -188px;
    }
</style>

