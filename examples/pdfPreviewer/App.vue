<template>
    <div id="app">
        我是测试7777999
        <button @click="handlePreview">预览</button>
        <v-pdf-previewer
            title="我是标题啊啊啊啊啊啊"
            :show="isShowViewer"
            :url="url"
            @onBeforePreview="handleBeforePreview"
            @onSuccessOpenPdf="handleSuccessPreview"
            @onFailOpenPdf="handleFailPreview"
            @onCloseViewer="handleCloseViewer"
            @onFinishViewer="handleFinishViewer"
        >
            <div class="ts-pdf-limitTips" v-show="showLimitTip">
                <div class="ts-pdf-tips-text" v-if="preview === 1">
                    预览已经结束，请购买后查看全文99
                </div>
                <div class="ts-pdf-tips-text" v-else>
                    在线预览仅支持前100页，请下载后查看全文
                </div>
                <span class="ts-pdf-tips-already-knew" @click="closeLimitTip">知道了</span>
            </div>
        
        </v-pdf-previewer>
    </div>
</template>

<script>
export default {
    data(){
        return {
            showLimitTip: false,
            isShowViewer: false,
            // 随意输入一个pdf预览地址
            url: ''
        }
    },
    methods: {
        handlePreview(){
            this.isShowViewer = true
        },
        handleBeforePreview(){
            console.info('预览前')
        },
        handlePreviewing(){
            console.info('文件打开时')
        },
        handleSuccessPreview(){
            console.info('成功打开文件')
        },
        handleFailPreview(){
            console.info('失败打开文件')
        },
        handleFinishViewer(){
            this.showLimitTip = true;
            console.info('结束预览了')
        },
        closeLimitTip(){
            this.showLimitTip = false;
        },
        handleCloseViewer(){
            this.isShowViewer = false;
            this.showLimitTip = false;
        },
    }
    
}
</script>

<style>
.ts-pdf-limitTips {
    position: fixed;
    left: 0;
    right: 0;
    top: 90px;
    margin: 0 auto;
    width: 400px;
    height: 47px;
    border-radius: 5px;
    background-color: #000000;
    opacity: 0.8;
    color: #fff;
    font-size: 15px;
}
.ts-pdf-limitTips .ts-pdf-tips-text{
    display: inline-block;
    padding-left: 20px;
    height: 47px;
    line-height: 47px;
    margin: 0;
}
.ts-pdf-limitTips span{
    float: right;
    cursor: pointer;
    margin: 11px 12px 0 0;
    background-color: #5984ff;
    border-radius: 3px;
    width: 60px;
    height: 26px;
    line-height: 26px;
    text-align: center;
}
</style>