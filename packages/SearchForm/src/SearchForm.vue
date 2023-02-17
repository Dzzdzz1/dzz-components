<!-- 全局搜索表 -->
<template>
    <div :class="{'dzz-component':true ,'search-form': true, 'open-form': open, 'over-hidden':overflow,'default-height':defaultHeight,'labelPositionTop':labelPosition=='top','labelPositionLeft':labelPosition=='left'}" :style="overflowStyle" @keyup.enter="search">
        <div ref="searchFormView" class="search-form-content" id="searchFormView">
            <slot name="form"></slot>
        </div>
        <div class="search-form-btn" :style="showBtn ? 'flex-shrink: 0;padding: 1px 0 0 15px;' : 'display: none;'">
                <template v-if="labelPosition == 'top'">
                    <div class="formForSix">
                        <el-button size="mini" @click="reset">重置</el-button>
                        <el-button type="primary" size="mini" @click="search" :disabled="disabled">{{btnLabel}}</el-button>
                        <el-button type="text" class="expand" @click="expand" v-if="overflow">
                            展开 <i class="el-icon-arrow-up borderDashed" v-if="open"/><i class="el-icon-arrow-down borderDashed" v-else/>
                        </el-button>
                    </div>
                 </template>
                <template v-else>
                    <el-button icon="el-icon-refresh" size="mini" @click="reset"></el-button>
                    <el-button size="mini" @click="expand" v-if="overflow">
                        <i class="el-icon-arrow-up" v-if="open"/>
                        <i class="el-icon-arrow-down" v-else/>
                    </el-button>
                    <el-button type="primary" size="mini" @click="search" :disabled="disabled">{{btnLabel}}</el-button>
                </template>
        </div>
    </div>
</template>

<script>
export default {
name: 'SearchForm',
props: {
    disabled:{
        type:Boolean,
        default:false,
    },
    changeNum:{
        type:Number,
        default:0,
    },
    defaultOpen:{
        type:Boolean,
        default:false,
    },
    defaultHeight:{
        type:Boolean,
        default:false,
    },
    showBtn: {
      type: Boolean,
      default: true
    },
    btnLabel: {
      type: String,
      default: '查询'
    },
    //默认显示行数
    defaultLine: {
      type: Number,
      default: 1
    }
},
components: {},
data () {
    return {
        labelPosition: localStorage.getItem("themeVersion") == "two" ? 'top':'left',
        open: false, // 展开、收起
        formItemNumber: null, // 表单项个数
        overflow: false,
        overflowStyle: {
            height: 'auto'
        },
        lineVal: parseInt(this.defaultLine) && parseInt(this.defaultLine) > 0  ? parseInt(this.defaultLine) : 1
    }
},
watch: {
    changeNum:{
        handler(newName, oldName) {
            this.init()
    　　},
    }
},
created () {
    this.labelPosition = localStorage.getItem("themeVersion") == "two" ? 'top':'left'
    /* console.log("---------------1")
    console.log(this.labelPosition) */
},

mounted () {
    /* console.log("---------------2")
    console.log(this.labelPosition) */
    this.init()
},

methods: {
    init(){
        let formItem = this.$refs['searchFormView'].querySelectorAll('.publicCol')
        this.formItemNumber = formItem.length
        this.formItemNumber = this.formItemNumber+this.changeNum
       /*  setTimeout(()=>{
            this.overflowStyle.height = formItem[0].offsetHeight + 'px'
        },10) */

        this.$nextTick(()=>{
            this.overflowStyle.height = formItem[0].offsetHeight * this.lineVal  + 'px'
        })
        const _this = this
        this.autoLayout(_this)
        window.onresize = () => {
            _this.autoLayout(_this)
        }
    },
    search () {
        this.$emit('search')
    },
    reset () {
         
        this.$emit('reset')
    },
    expand () {
        this.open = !this.open
    },

    autoLayout (_this) {
        let screenWidth = document.documentElement.clientWidth || document.body.clientWidth
        let number = 0
        if (this.labelPosition=='top'){
            if (screenWidth >= 1900) {
                number = 6 * this.lineVal
            } else if (screenWidth >= 1200) {
                number = 4
            } else if (screenWidth >= 768) {
                number = 3 * this.lineVal
            } else {
                number = 1 * this.lineVal
            }
        }else{
            if (screenWidth >= 1900) {
                number = 4 * this.lineVal
            } else if (screenWidth >= 1200) {
                number = 3 * this.lineVal
            } else if (screenWidth >= 768) {
                number = 2 * this.lineVal
            } else {
                number = 1 * this.lineVal
            }
        }
       
        console.log("this.formItemNumber",this.formItemNumber,"number",number)
        _this.overflow = _this.formItemNumber > number ? true : false
        _this.open = this.showBtn ? false : true
        if(_this.defaultOpen){
            _this.open = true
        }
    }
}
}
</script>
<style scoped>
.search-form{width: 100%;display: flex;align-items: flex-start;flex-shrink: 0;/* overflow: hidden; */}
.search-form .search-form-content{flex: 1;}
.search-form .search-form-btn{flex-shrink: 0;padding: 1px 0 0 15px;}
.search-form .search-form-btn .formForSix{ margin-top: 26px;}
.search-form .search-form-btn .formForSix .expand{padding: 7px 12px;}
.over-hidden{overflow: hidden;}
.open-form{height: auto!important;}
.default-height{height: 34px!important;}
</style>
<style>
#searchFormView .el-form{margin: 0;}
#searchFormView .el-date-editor.el-input, .el-date-editor.el-input__inner{width: 100%;}
</style>