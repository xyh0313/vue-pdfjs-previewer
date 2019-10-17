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
            url: 'https://qdcu02.baidupcs.com/file/e47222aeffec55187b691088ac207308?bkt=en-2a4ba40c42c88fab2e5255fcb74f1cf130671960734b2bfe094f49ad83845d223eeed717fac22a3e0e9bf5590699d7d849c37042b583ef6e556ef015706354d3&fid=3275707650-14482137-758931884500561&time=1571296778&sign=FDTAXGERQBHSKfW-DCb740ccc5511e5e8fedcff06b081203-pkT3dJX79AHS96kNnqzu%2FQdXtFo%3D&to=66&size=611769&sta_dx=611769&sta_cs=3&sta_ft=pdf&sta_ct=4&sta_mt=4&fm2=MH%2CYangquan%2CAnywhere%2C%2CNone%2Cany&ctime=1568728426&mtime=1568728426&resv0=cdnback&resv1=0&resv2=&resv3=&resv4=&vuk=3275707650&iv=2&htype=&randtype=&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-5bfb1fd8818e10cff7ba474437f67ad1279a8416b705ff7982726dfa093ddb7a9f3aca9da4503d4905e18451569dc68fe0165bf8e8b5f505305a5e1275657320&expires=8h&rt=pr&r=730973330&mlogid=2594304664&vbdid=-&fin=1568728420-2086b0784449a3b304bcf61807bddea8_split_watermark.pdf&fn=1568728420-2086b0784449a3b304bcf61807bddea8_split_watermark.pdf&err_ver=1.0&check_blue=1&rtype=1&dp-logid=6717537693798020448&dp-callid=0.1.1&hps=1&tsl=0&csl=0&csign=nxjNh6UyYB5VasDoiqsxlpvduTw%3D&so=0&ut=1&uter=4&serv=0&uc=1022049119&ti=34c17094e7d5a0c9c362d21c3a87e8c6e5329518ab5402e4&by=themis'
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