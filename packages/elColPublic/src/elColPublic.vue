<!-- 全局搜索表 -->
<template>
    <el-col :xl="xlShow" :lg="lgShow" :md="mdShow" :sm="smShow" :xs="xsShow" :offset="offset" ref="publicCol" class="dzz-component publicCol" :class="normalTextarea?'normal':''">
        <slot></slot>
    </el-col>
</template>

<script>
export default {
    name: 'elColPublic',
    props: {
        xl: {type: Number},
        lg: {type: Number},
        md: {type: Number},
        sm: {type: Number},
        xs: {type: Number},
        offset: {type: Number},
        mini:{type: Boolean,default: false},
        normalTextarea:{type: Boolean,default: false}
    },
    components: {},
    data () {
        return {
            xlShow:6,
            lgShow:8,
            mdShow:12,
            smShow:12,
            xsShow:24,
        }
    },
    watch: {
        xl:{
            handler(newVal, oldVal) {
                this.xlShow=newVal
        　　},
        },
        lg:{
            handler(newVal, oldVal) {
                this.lgShow=newVal
        　　},
        },
        md:{
            handler(newVal, oldVal) {
                this.mdShow=newVal
        　　},
        },
        sm:{
            handler(newVal, oldVal) {
                this.smShow=newVal
        　　},
        },
        xs:{
            handler(newVal, oldVal) {
                this.xsShow=newVal
        　　},
        },
        mini:{
            handler(newVal, oldVal) {
                if (newVal){
                    this.xlShow=8
                    this.lgShow=12
                    this.mdShow=24
                    this.smShow=24
                    this.xsShow=24
                }
        　　},
        }
    },
    created () {},
    mounted () {
         //判断标签位置,top是重新设置栅格值
        if (this.$refs.publicCol.$el.querySelectorAll(".el-form-item__label")[0]){
             var str = document.defaultView.getComputedStyle(this.$refs.publicCol.$el.querySelectorAll(".el-form-item__label")[0],null).textAlign
             if (str == 'left'){
                this.xlShow=4
                this.lgShow=6
                this.mdShow=8
                this.smShow=8
                this.xsShow=12
            }else{
                this.xlShow=6
                this.lgShow=8
                this.mdShow=12
                this.smShow=12
                this.xsShow=24
            }
        }

        if (this.xl){this.xlShow=this.xl}
        if (this.lg){this.lgShow=this.lg}
        if (this.md){this.mdShow=this.md}
        if (this.sm){this.smShow=this.sm}
        if (this.xs){this.xsShow=this.xs}
       
        
    },
    methods: {}
}
</script>
<style>
.publicCol .el-select{ width: 100%;}
.publicCol .el-date-editor{ width: 100%;}
.publicCol .el-form-item--mini.el-form-item{ margin-bottom: 0 10px 5px 10px ;}
.publicCol .el-range-editor--mini.el-input__inner{height: 29px; padding: 3px 5px;}
.publicCol .el-range-editor--mini .el-range__icon{width: 15px;}
.publicCol .el-col{font-size: 12px;color: #606266;}
.publicCol .el-checkbox{height: 29px;}
.publicCol .el-radio {height: 29px;}
.publicCol .el-radio__label{font-size: 12px;color: #606266;}
.publicCol .el-button{z-index: 100;}
.publicCol .el-cascader{ width: 100%;}
.publicCol .el-input-number{ width: 100%;}
.publicCol .el-input-group{height: 29px;}
</style>
 