<template>
    <el-col-public :xl="mini?8:xl" :lg="mini?12:lg" :md="mini?24:md" :sm="mini?24:sm" :xs="mini?24:xs" style="position:relative">
        <slot></slot>
        <el-form-item :label="startLabel"  :verify="verify ? '' : undefined" :alias="startLabel" :prop="this.start" >
            <div class="hxqc-datePick">
                <div>
                    <el-date-picker
                            ref="startDate"
                            v-model="combinedVal[0]"
                            :type="dateTypeVal"
                            align="right"
                            unlink-panels
                            placeholder="开始日期"
                            :picker-options="startPickerOptions"
                            :format="defaultFormat"
                            :value-format="defaultFormat"
                            :disabled="disabled"
                            :clearable="clearable"
                            @change="startHandleChange"
                            @focus="openDatePicker"
                            default-time="00:00:00"
                            popper-class="dzz-component">
                    </el-date-picker>
                </div>
                <div class="centerText">至</div>
                <div>
                    <el-date-picker
                            ref="endDate"
                            v-model="combinedVal[1]"
                            :type="dateTypeVal"
                            align="right"
                            unlink-panels
                            placeholder="结束日期"
                            :picker-options="endPickerOptions"
                            :format="defaultFormat"
                            :value-format="defaultFormat"
                            :disabled="disabled"
                            :clearable="clearable"
                            @change="endHandleChange"
                            @focus="openDatePicker"
                            default-time="23:59:59"
                            popper-class="dzz-component">
                    </el-date-picker>
                </div>
            </div>
        </el-form-item>

    </el-col-public>
</template>

<script>
    import XEUtils from 'xe-utils'
    import elColPublic from '../../elColPublic/src/elColPublic'
    export default {
        name: 'DatePickerStartEnd',
        components: {},
        props:{
            clearable: {
              type: Boolean,
              default: true,
            },
            xl: {type: Number,default: localStorage.getItem("formLabelPosition")=='top'? 4 : 6},
            lg: {type: Number,default: localStorage.getItem("formLabelPosition")=='top'? 6 : 8},
            md: {type: Number,default: localStorage.getItem("formLabelPosition")=='top'? 8 : 12},
            sm: {type: Number,default: localStorage.getItem("formLabelPosition")=='top'? 8 : 12},
            xs: {type: Number,default: localStorage.getItem("formLabelPosition")=='top'? 12 : 24},
            mini:{type: Boolean,default: false},
            startLabel:{
                type: String
            },
            endLabel:{
                type: String,
                default:'-'
            },
            start:{
                type: String
            },
            end:{
                type: String
            },
            dateType:{
                type: String,
                default:'date'
            },
            defaultFormat:{
                type:String,
                default:'yyyy-MM-dd'
            },
            formData: {
                default: () => {
                    return {}
                }
            },
            verify: {
                type: Boolean,
                default: false
            },
            chooseType:{
                type: String,
                default: "date"
            },
            disabled:{
                type: Boolean,
                default: false
            },
            limit:{
                type: Boolean,
                default: false
            },
            limitTime:{
                type: String,
            },
            disabledDate:{
                
            }
        },
        created() {
            console.log("时间段选择器")
            if (!this.formData[this.start]) {
                this.$set(this.formData, this.start, '')
            } 
            if (!this.formData[this.end]) {
                this.$set(this.formData, this.end, '')
            } 
           /*  if (this.dateType != 'date'){
                this.dateTypeVal = this.dateType
            } */

            if (this.chooseType != 'date'){
                //屏蔽传入的时间段选择类型
                this.dateTypeVal = this.chooseType.replace("range",'')
            }
            
            //如果类型带时间则选择器打开时间选择
            if (this.dateTypeVal.indexOf("time")>-1 || this.defaultFormat.indexOf("HH")>-1){
                this.dateTypeVal = "datetime"
            }


            if (this.formData[this.start] && this.formData[this.start]!=""){
                this.combinedVal = [
                            new Date(XEUtils.toDateString(new Date(this.formData[this.start]), this.defaultFormat)),
                            new Date(XEUtils.toDateString(new Date(this.formData[this.end]), this.defaultFormat))
                ]
            }

            /* this.combinedVal = [
                this.formData[this.start] && this.formData[this.start]!="" ? new Date(this.formData[this.start]):'',
                this.formData[this.end] && this.formData[this.end]!="" ? new Date(XEUtils.toDateString(new Date(this.formData[this.end]), 'yyyy-MM-dd') +" 23:59:59"):'',
            ] */
            //设置时间过滤配置
            this.startPickerOptions.disabledDate = this.disabledDate
            this.endPickerOptions.disabledDate   = this.disabledDate

        },
        computed: {
            computedStart: {
                get: function () {
                    return this.formData[this.start] || ''
                },
                set: function (newValue) {
                }
            },
            computedEnd: {
                get: function () {
                    return this.formData[this.end] || ''
                },
                set: function (newValue) {
                }
            },

        },

        watch: {
             computedStart: {
                handler: function (newVal) {
                    this.combinedVal = [this.formData[this.start] || '', this.formData[this.end] || '']
                }
            },
            computedEnd: {
                handler: function (newVal) {
                    this.combinedVal = [this.formData[this.start] || '', this.formData[this.end] || '']
                }
            },
        },
        data(){
            return {
                combinedVal: [],
                endPickerOptions: {
                    disabledDate:() => {
                        return {}
                    }
                },
                
                startPickerOptions:{
                    disabledDate:() => {
                        return {}
                    }
                },
                
                dateTypeVal:'date'
            }
        },
        mounted(){
            var _this=this
             _this.startPickerOptions.shortcuts=[
                        {
                            text: '今天',
                            onClick(picker) {
                                var d = new Date()
                                var startVal = XEUtils.toDateString( new Date(XEUtils.toDateString(d, 'yyyy-MM-dd') +" 00:00:00"), _this.defaultFormat)
                                var endVal = XEUtils.toDateString( new Date(XEUtils.toDateString(d, 'yyyy-MM-dd') +" 23:59:59"), _this.defaultFormat)
                                _this.$set(_this.combinedVal, 0, startVal)
                                _this.$set(_this.formData, _this.start, startVal)
                                _this.$set(_this.combinedVal, 1, endVal)
                                _this.$set(_this.formData, _this.end, endVal)
                                _this.checkvDisabledDate()
                            }
                        },
                        {
                            text: '本周',
                            onClick(picker) {
                                var d=new Date()
                                var weekDay=d.getDay()
                                var startVal=null
                                var endVal=null
                                if (weekDay!=0){
                                    startVal = XEUtils.toDateString( new Date(XEUtils.toDateString(new Date(XEUtils.getWhatDay(d,-(weekDay-1))), 'yyyy-MM-dd') +" 00:00:00"), _this.defaultFormat)
                                    endVal =   XEUtils.toDateString( new Date(XEUtils.toDateString(new Date(XEUtils.getWhatDay(d, +(7-weekDay))), 'yyyy-MM-dd') +" 23:59:59"), _this.defaultFormat)
                                }else{
                                    startVal = XEUtils.toDateString( new Date(XEUtils.toDateString(new Date(XEUtils.getWhatDay(d, -6)), 'yyyy-MM-dd') +" 00:00:00"), _this.defaultFormat)
                                    endVal =   XEUtils.toDateString( new Date(XEUtils.toDateString(d, 'yyyy-MM-dd') +" 23:59:59"), _this.defaultFormat)
                                }
                                _this.$set(_this.combinedVal, 0, startVal)
                                _this.$set(_this.formData, _this.start, startVal)
                                _this.$set(_this.combinedVal, 1, endVal)
                                _this.$set(_this.formData, _this.end, endVal)
                                _this.checkvDisabledDate()
                            }
                        },
                        {
                            text: '当月',
                            onClick(picker) {
                                var d=new Date()
                                var MonthTotal=XEUtils.getDayOfMonth(d)
                                var startVal=null
                                var endVal=null
                                 
                                startVal = XEUtils.toDateString( new Date(XEUtils.toDateString(d, 'yyyy-MM') +"-01 00:00:00"), _this.defaultFormat)
                                endVal =   XEUtils.toDateString( new Date(XEUtils.toDateString(d, 'yyyy-MM') +"-"+MonthTotal +" 23:59:59"), _this.defaultFormat)
                                
                                _this.$set(_this.combinedVal, 0, startVal)
                                _this.$set(_this.formData, _this.start, startVal)
                                _this.$set(_this.combinedVal, 1, endVal)
                                _this.$set(_this.formData, _this.end, endVal)
                                _this.checkvDisabledDate()
                            }
                        }
                    ]

        },
        methods:{
            checkvDisabledDate(){
                 //开始时间限制
                    this.startPickerOptions.disabledDate = (time)=>{
                        if (typeof(this.disabledDate)=="function"){
                            var checkVal=this.disabledDate(time)
                            if (checkVal){
                                return checkVal
                            }else  {
                                return time.getTime() >= new Date(this.combinedVal[1]).getTime()
                            }
                        }else{
                            return time.getTime() >= new Date(this.combinedVal[1]).getTime()
                        }    
                    }

                    //结束时间限制
                    this.endPickerOptions.disabledDate = (time)=>{
                        if (typeof(this.disabledDate)=="function"){
                            //传入的时间限制
                            var checkVal=this.disabledDate(time)
                            if (checkVal){
                                return checkVal
                            }else  {
                                //开始时间限制
                                return time.getTime() <= new Date(this.combinedVal[0]).getTime()-3600*24*1000
                            }
                        }else{
                            return time.getTime() <= new Date(this.combinedVal[0]).getTime()-3600*24*1000
                        }
                    }
            },
            clearVal(){
                this.combinedVal[0] = ''
                this.$set(this.formData, this.start, '')
                this.combinedVal[1] = ''
                this.$set(this.formData, this.end, '')
                //设置时间过滤配置
                this.startPickerOptions.disabledDate = this.disabledDate
                this.endPickerOptions.disabledDate   = this.disabledDate
            },
            openDatePicker(){
                //屏蔽上月下月灰色日期选择
                setTimeout(() => {
                        document.getElementsByClassName("el-picker-panel__body")[0].addEventListener("click",function(e){
                            if (e.target.className=="prev-month" || e.target.className=="next-month"){
                                e.stopPropagation()
                                e.preventDefault()
                                return false
                            }
                        },true)
                }, 500);
            },
            startHandleChange(val){
                if (val == null || val == ""){
                    this.clearVal()
                }else{
                    //如果传入的格式有小时则开始时间加上00:00:00,结束时间加上23:59:59
                    // if (this.dateTypeVal.indexOf("time")>-1 || this.defaultFormat.indexOf("HH")>-1){
                    //     val =  XEUtils.toDateString( new Date(XEUtils.toDateString(new Date(val), 'yyyy-MM-dd') +" 00:00:00"), this.defaultFormat)
                    // }

                    //开始时间限制
                    this.startPickerOptions.disabledDate = (time)=>{
                        if (typeof(this.disabledDate)=="function"){
                            var checkVal=this.disabledDate(time)
                            if (checkVal){
                                return checkVal
                            }else  {
                                return time.getTime() >= new Date(this.combinedVal[1]).getTime()
                            }
                        }else{
                            return time.getTime() >= new Date(this.combinedVal[1]).getTime()
                        }
                    }

                    //结束时间限制
                    this.endPickerOptions.disabledDate = (time)=>{
                        if (typeof(this.disabledDate)=="function"){
                            //传入的时间限制
                            var checkVal=this.disabledDate(time)
                            if (checkVal){
                                return checkVal
                            }else  {
                                //开始时间限制
                                return time.getTime() <= new Date(val).getTime()-3600*24*1000
                            }
                        }else{
                            return time.getTime() <= new Date(val).getTime()-3600*24*1000
                        }
                    }

                    if(new Date(val).getTime() > new Date(this.combinedVal[1]).getTime()){
                        this.$set(this.combinedVal, 0, "")
                        this.$set(this.formData, this.start, "")
                        return this.$message.warning('开始时间必须大于结束时间！')
                    }

                    this.combinedVal[0] = val
                    this.$set(this.formData, this.start, val)


                    if (this.combinedVal[1] == "" || this.combinedVal[1] == null){
                        if (this.dateTypeVal.indexOf("time")>-1 || this.defaultFormat.indexOf("HH")>-1){
                            val =  XEUtils.toDateString( new Date(XEUtils.toDateString(new Date(val), 'yyyy-MM-dd') +" 23:59:59"), this.defaultFormat)
                        }
                        this.$set(this.combinedVal, 1, val)
                        this.$set(this.formData, this.end, val)
                    }


                }
            },
            endHandleChange(val){

                if (val == null || val == ""){
                    this.clearVal()
                }else{
                    // if (this.dateTypeVal.indexOf("time")>-1 || this.defaultFormat.indexOf("HH")>-1){
                    //     val =  XEUtils.toDateString( new Date(XEUtils.toDateString(new Date(val), 'yyyy-MM-dd') +" 23:59:59"), this.defaultFormat)
                    // }

                    //开始时间限制
                    this.startPickerOptions.disabledDate = (time)=>{
                        if (typeof(this.disabledDate)=="function"){
                            var checkVal=this.disabledDate(time)
                            if (checkVal){
                                return checkVal
                            }else  {
                                return time.getTime() >= new Date(val).getTime()
                            }
                        }else{
                            return time.getTime() >= new Date(val).getTime()
                        }
                    }

                     //结束时间限制
                    this.endPickerOptions.disabledDate = (time)=>{
                        if (typeof(this.disabledDate)=="function"){
                            //传入的时间限制
                            var checkVal=this.disabledDate(time)
                            if (checkVal){
                                return checkVal
                            }else  {
                                //开始时间限制
                                return time.getTime() <= new Date(this.combinedVal[0]).getTime()-3600*24*1000
                            }
                        }else{
                            return time.getTime() <= new Date(this.combinedVal[0]).getTime()-3600*24*1000
                        }
                    }


                    if(new Date(val).getTime() < new Date(this.combinedVal[0]).getTime()){
                        this.$set(this.combinedVal, 1, "")
                        this.$set(this.formData, this.end, "")
                        return this.$message.warning('结束时间必须大于开始时间！')
                    }


                    this.combinedVal[1] = val
                    this.$set(this.formData, this.end, val)


                    if (this.combinedVal[0] == "" || this.combinedVal[0] == null){
                        if (this.dateTypeVal.indexOf("time")>-1 || this.defaultFormat.indexOf("HH")>-1){
                            val =  XEUtils.toDateString( new Date(XEUtils.toDateString(new Date(val), 'yyyy-MM-dd') +" 00:00:00"), this.defaultFormat)
                        }
                        this.$set(this.combinedVal, 0, val)
                        this.$set(this.formData, this.start, val)
                    }
                }
            }
        }
    }
</script>
<style lang="less" scoped>
.hxqc-datePick{ display: flex; justify-content: space-between; align-items: center;
    .centerText{padding:0 5px;}
}
</style>
<style>
.hxqc-datePick .el-date-editor .el-input__inner,.labelPositionTop .el-date-editor .el-input__inner{padding-left:18px !important;padding-right:0px !important;}
.hxqc-datePick .el-date-editor .el-input__prefix ,.labelPositionTop .el-date-editor .el-input__prefix{left:0px !important}
.hxqc-datePick .el-date-editor .el-input__prefix i ,.labelPositionTop .el-date-editor .el-input__prefix i{width:20px !important}
.hxqc-datePick .el-date-editor .el-input__suffix ,.labelPositionTop .el-date-editor .el-input__suffix{ border-radius: 2px; top:2px !important; right: 1px !important; bottom:2px !important; height: auto; background-color: #fff;}
</style>

