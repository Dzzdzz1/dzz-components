<template>
  <div class="dzz-component choose-fixed">
    <template v-if="themeVersion=='six'">
        <span class="openListShow" @click="openListShow"><i class="el-icon-setting"></i> 列显示</span>
    </template>
     <template v-else>
        <el-button type="primary" size="mini" @click="openListShow">列显示设置</el-button>
    </template>

    <div class="editColumns" v-show="listShow" >
            <div class="btnList">
                
                <i class="el-icon-refresh reload" @click="reloadColumns" title="重置"></i>
                <el-tooltip placement="bottom" effect="light">
                    <div slot="content">【提示】鼠标左键点击字段名称并上下拖动,可进行列表字段排序;
                        <br/>【重置】请点击重置配置按钮。出现无法重置的情况,请先点重置,然后关闭页签。
                        <br/>【同步】点击[退出登录]按钮,会保存个人配置到服务器,直接关闭客户端将无法保存!</div>
                      <i class="el-icon-info helpNew" title="帮助"></i>
                </el-tooltip>
                <i class="el-icon-close close" @click="listShow=false" title="关闭"></i>
            </div>
            <div class="listTitle">
                    <span>固定列</span>
                    <span v-show="hasFilters"><i title="筛选" :class="['vxe-icon--funnel',filtersAllShow ? 'active':'']" @click="filtersCheckList"></i></span>
                    <span><el-checkbox v-model="checkAll" @change="checkAllColumns"></el-checkbox></span>
                    <span>字段名</span>
                    <!-- <span>宽度设置</span> -->
                   <!--  <span>拖动排序</span> -->
            </div>
            <ul>
                <template v-if="isDraggable">
                    <draggable v-model="options" draggable=".listLine" @end="saveTableColumnsList">
                            <li v-for="(item, index) in options" :key="index" class="listLine">
                                        <span class="fixRadio"><el-radio v-model="FixValue" :label="index" @change="saveTableColumnsList"> &nbsp; </el-radio></span>
                                        <span v-show="hasFilters"><el-checkbox v-model="item.filtersShow"  @change="checkFiltersCheckbox(index)" v-if="item.filters!=undefined"></el-checkbox></span>
                                        <span><el-checkbox v-model="item.visible" @change="checkCheckbox"></el-checkbox></span>
                                        <span v-if="item.type=='selection' || item.type=='checkbox'">选择框</span>
                                        <span v-else-if="item.type=='radio'">单选框</span>
                                        <span v-else-if="item.type=='seq' || item.type=='index'">序号</span>
                                        <span v-else>{{item.title}}</span>
                                        <!-- <span class="width">
                                            <el-input type="number" v-model="item.resizeWidth" size="mini" class="numberShow" @focus="changeWidth"></el-input>
                                        </span> -->
                                    <!--  <span class="order">
                                            <i class="el-icon-rank"></i>
                                        </span> -->
                            </li>
                    </draggable>

                </template>
                <template v-else>
                        <li v-for="(item, index) in options" :key="index" class="listLine">
                                        <span class="fixRadio"><el-radio v-model="FixValue" :label="index" @change="saveTableColumnsList"> &nbsp; </el-radio></span>
                                        <span v-show="hasFilters"><el-checkbox v-model="item.filtersShow"  @change="checkFiltersCheckbox(index)" v-if="item.filters!=undefined"></el-checkbox></span>
                                        <span><el-checkbox v-model="item.visible" @change="checkCheckbox"></el-checkbox></span>
                                        <span v-if="item.type=='selection' || item.type=='checkbox'">选择框</span>
                                        <span v-else-if="item.type=='radio'">单选框</span>
                                        <span v-else-if="item.type=='seq' || item.type=='index'">序号</span>
                                        <span v-else>{{item.title}}</span>
                                        <!-- <span class="width">
                                            <el-input type="number" v-model="item.resizeWidth" size="mini" class="numberShow" @focus="changeWidth"></el-input>
                                        </span> -->
                                    <!--  <span class="order">
                                            <i class="el-icon-rank"></i>
                                        </span> -->
                            </li>
                </template>
                
            </ul>
    </div>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import draggable from 'vuedraggable'

  export default {
    name: 'FixedColumnSelect',
    components: {
            draggable,
    },
    props: {
      tableName: {
        type: String,
        required: true
      },
      tableRef: {
        type: Object,
        required: false
      },
      isDraggable:{
          type:Boolean,
          required:false,
          default:true
      }
    },
    data(){
      return {
        themeVersion:localStorage.getItem("themeVersion"),
        listShow:false,
        checkAll:true,
        options: [],
        FixValue:null, //默认浮动列数量
        tableColumnsList:null,
        xTableObj:null, //操作的table
        tableDefaultColumns:null, //默认列配置
        timeOut:null,
        timeOutClear:null,
        timeInterval:null,
        timeOutFilters:null,
        checkColumns:0,
        hasFilters:false,  //是否有筛选字段
        filtersAllShow:true //筛选是否全选
       }
    },
    watch:{ 
        
    },
    destroyed(){
        Object.assign(this.$data, this.$options.data())
    },
    mounted(){
        let _this=this
        this.timeOut=setTimeout(() => {
            _this.xTableObj=_this.$parent.$parent.$refs["xTable"] || _this.$parent.$parent.$refs[_this.tableName] || _this.$parent.$parent.$parent.$refs[_this.tableName] || _this.$parent.$parent.$parent.$parent.$refs[_this.tableName] || _this.$parent.$parent.$parent.$parent.$parent.$refs[_this.tableName]
            let tableColumnsNow=_this.xTableObj.getTableColumn()
                tableColumnsNow=tableColumnsNow.fullColumn
                //是否有筛选项,有则记录状态
                tableColumnsNow.map((item,index)=>{
                    if (item.filters!=undefined){
                        item.filtersShow=true
                        _this.hasFilters=true
                    }else{
                        item.filtersShow=false
                    }
                })
            
            _this.tableDefaultColumns=tableColumnsNow
            this.checkColumns=_this.xTableObj.getColumns().length //记录列数量
            //读取配置
            _this.setColVal()
        },200)
        this.timeInterval=setInterval(() => {
            //检测表的列数据由请求返回的情况
            if (this.checkColumns != _this.xTableObj.getColumns().length ){
               // _this.tableDefaultColumns=_this.xTableObj.getColumns()
                let tableColumnsNow=_this.xTableObj.getTableColumn()
                // tableColumnsNow=tableColumnsNow.fullColumn
                //只展示当前显示的字段(做过权限设置的)
                tableColumnsNow=tableColumnsNow.visibleColumn
                //是否有筛选项,有则记录状态
                tableColumnsNow.map((item)=>{
                        if (item.filters!=undefined){
                            item.filtersShow=true
                            _this.hasFilters=true
                        }else{
                            item.filtersShow=false
                        }
                })

                _this.tableDefaultColumns=tableColumnsNow
                _this.setColVal()
                clearInterval(this.timeInterval)
            }
        }, 300);
        this.timeOutClear=setTimeout(()=>{
            //5秒后停止检测
            clearInterval(this.timeInterval)
        },5000)

        //添加监听事件  
        this.listenerTimer = setTimeout(() => {
            if(_this.xTableObj && _this.xTableObj.$el && _this.xTableObj.$el.getElementsByClassName('vxe-header--row')){
                _this.xTableObj.$el.getElementsByClassName("vxe-table--header")[0].addEventListener('mouseup',this.saveWidth)
                if (_this.xTableObj.$el.getElementsByClassName("vxe-table--header")[1]){
                    _this.xTableObj.$el.getElementsByClassName("vxe-table--header")[1].addEventListener('mouseup',this.saveWidth)  
                }
            }

            if(_this.xTableObj && _this.xTableObj.$el && _this.xTableObj.$el.getElementsByClassName('vxe-table--body-wrapper')){
                document.getElementsByClassName("vxe-table--body-wrapper")[0].addEventListener('scroll',function(){
                   _this.scrollCheckFilter()
                })
            }
        }, 500);
        
    },
    computer(){
        
    },
    created(){
        clearTimeout(this.saveTimer)
    },
    beforeDestroy(){
        this.options=[]
        clearInterval(this.timeInterval)
        clearTimeout(this.timeOut)
        clearTimeout(this.timeOutClear)
        clearTimeout(this.listenerTimer)
        clearTimeout(this.timeOutFilters)
        if(this.xTableObj && this.xTableObj.$el && this.xTableObj.$el.getElementsByClassName('vxe-header--row')){
            if(this.xTableObj.$el.getElementsByClassName("vxe-table--header") &&  this.xTableObj.$el.getElementsByClassName("vxe-table--header")[0]){
                this.xTableObj.$el.getElementsByClassName("vxe-table--header")[0].removeEventListener('mouseup',this.saveWidth,false)
            }
            if (this.xTableObj.$el.getElementsByClassName("vxe-table--header")[1]){
                this.xTableObj.$el.getElementsByClassName("vxe-table--header")[1].removeEventListener('mouseup',this.saveWidth,false)
            }
        }
    },
    methods: {
        //全选过滤条件
        filtersCheckList(){
            let _this=this
            if (_this.filtersAllShow){
                //隐藏筛选
                 _this.options.map((item)=>{
                    item.filtersShow=false
                })
                this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll(".vxe-cell--sort")[0].style.display='inline-block'
                this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll(".vxe-cell--filter")[0].style.display='inline-block'
                if (this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1]){
                    this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1].querySelectorAll(".vxe-cell--sort")[0].style.display='inline-block'
                    this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1].querySelectorAll(".vxe-cell--filter")[0].style.display='inline-block'
                }
                _this.filtersAllShow=false
            }else{
                //显示筛选
                 _this.options.map((item)=>{
                    if (item.filters!=undefined){
                        item.filtersShow=true
                    }
                })
                this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll(".vxe-cell--sort")[0].style.display='none'
                this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll(".vxe-cell--filter")[0].style.display='none'
                if (this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1]){
                    this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1].querySelectorAll(".vxe-cell--sort")[0].style.display='none'
                    this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1].querySelectorAll(".vxe-cell--filter")[0].style.display='none'
                }
                _this.filtersAllShow=true
            }
            this.saveTableColumnsList()
            this.$forceUpdate()
        },
        filtersAllChecked(){
            //检测是否全显示过滤条件
            let _this=this
            let isAllShow=true
            _this.options.map((item)=>{
                    if (item.filters!=undefined && item.filtersShow!=true){
                        isAllShow=false
                    }
            })
            _this.filtersAllShow=isAllShow
        },
        //显示或隐藏过滤条件
        checkFiltersCheckbox(index){
            if(this.options[index].filters==undefined){
                 return false
            }else{
                  this.$nextTick(()=>{
                    this.showFilter(index,this.options[index].filtersShow,this.options[index].id)
                    //console.log(this.options[index])
                    this.saveTableColumnsList()
                    this.$forceUpdate()
                    this.xTableObj.refreshColumn()
                })
            }
        },
        checkTableData(){
            //检测表格是否有数据,无数据时不执行列调整
             let tableData=this.xTableObj.getTableData()
             if (tableData.fullData!=undefined && tableData.fullData.length>0){
                return true
             }else{
                return false
             }
        },
        saveWidth(){
            console.log("设置表格宽度")
            let _this=this
            clearTimeout(_this.saveTimer)
            //定时器截流
            _this.saveTimer = setTimeout(() => {
                if(!_this.listShow){
                    _this.saveTableColumnsList()
                }
            }, 500)
        },
        checkColumnsName(nowVal,saveVal){
            //比对表的列和存储的列配置,如果字段发生改变返回true
            if (nowVal.length!=saveVal.length){
                return true
            }else{
                let allCheck=false
                for (var i=0; i<nowVal.length; i++){
                    if (nowVal[i].property!=undefined && nowVal[i].property!=""){
                        let hasClolumn=false
                        for (var j=0; j<saveVal.length; j++){
                            if (saveVal[j].P==nowVal[i].property){
                                hasClolumn=true
                                break
                            }
                        }
                        if (hasClolumn==false){
                            allCheck=true
                        }
                    }
                }
                if (allCheck){
                    return true
                }else{
                    return false
                }
            }
        },
        setColVal(){
            
            //读取列配置信息
                let _this=this
                _this.tableColumnsList=_this.getTableColumnsList()
                     //有保存的列配置数据
                    if (_this.tableColumnsList!='' && _this.tableColumnsList!=undefined){

                        let tableColumnsList=JSON.parse(_this.tableColumnsList)
                        let tableColumnsNow=_this.tableDefaultColumns
                        if (this.checkColumnsName(tableColumnsNow,tableColumnsList)){
                            //console.log("存储的字段和表的字段不同,则直接读取表的字段")
                            //存储的字段和表的字段不同,则直接读取表的字段
                            _this.options = tableColumnsNow
                        }else{
                            //console.log("比对已保存的列,并调整排序");
                            //比对已保存的列,并调整排序
                            let arr=[]
                            let setFiltersShow=true
                            _this.FixValue=null
                            tableColumnsList.map((item,index)=>{
                               
                                if (item.S=="h"){
                                    setFiltersShow=false
                                }else{
                                    setFiltersShow=true
                                }
                                if (item.F=="left"){
                                    if (_this.FixValue==null){
                                        _this.FixValue=0
                                    }else{
                                        _this.FixValue=_this.FixValue+1
                                    }
                                }

                                if (item.P!=""){
                                    //通过字段名匹配读取配置
                                    let k=null;
                                    for (var i=0 ;i<tableColumnsNow.length; i++){
                                         k=tableColumnsNow[i]
                                        if ( k.property==item.P){
                                            k.fixed=item.F
                                            k.visible = item.V== true ? true:false
                                            k.resizeWidth=item.W
                                            k.filtersShow=setFiltersShow
                                            arr.push(k)
                                            break
                                        }
                                    }
                                }else if(item.T!=""){
                                    //通过title匹配读取配置
                                    let k=null;
                                    for (var i=0 ;i<tableColumnsNow.length; i++){
                                        k=tableColumnsNow[i]
                                        if (k.title==item.T){
                                            k.fixed=item.F
                                            k.visible=item.V==true ? true:false
                                            k.resizeWidth=item.W
                                            k.filtersShow=setFiltersShow
                                            arr.push(k)
                                            break
                                        }
                                    }
                                }else if (item.Y!=""){
                                    //通过类别匹配读取配置
                                    let k=null;
                                    for (var i=0 ;i<tableColumnsNow.length; i++){
                                        k=tableColumnsNow[i]
                                        if (k.type==item.Y){
                                            k.fixed=item.F
                                            k.visible=item.V==true ? true:false
                                            k.resizeWidth=item.W
                                            k.filtersShow=setFiltersShow
                                            arr.push(k)
                                            break
                                        }
                                    }
                                }
                            })
                            _this.options=arr
                            //比对读取配置后的列和表格列长度,不同长度则读取表格数据,不读取存储的配置
                            /*console.log(arr.length,tableColumnsNow.length)
                             if (arr.length!=tableColumnsNow.length){
                                _this.options=tableColumnsNow 
                                //this.xTableObj.loadColumn(tableColumnsNow)
                            }else{
                                //this.xTableObj.refreshColumn()
                                //this.xTableObj.loadColumn(_this.options)
                            } */

                            //console.log(_this.options)
                            
                                if (this.isDraggable){
                                    _this.xTableObj.loadColumn(_this.options)
                                }else{
                                    _this.xTableObj.refreshColumn()
                                }
                            //this.xTableObj.refreshColumn()
                        }
                    }else{
                        //没有保存列数据
                        _this.options=_this.tableDefaultColumns
                    }
                    _this.recheckShowFilter()
                   
                
        },
        
         getThByAttr(obj,value,action) {
            let doms=obj
            for (var i = 0; i < doms.length; i++) {
                if (value == doms[i].getAttribute("data-colid")) {
                    if (action){
                        doms[i].querySelectorAll(".vxe-cell--sort")[0].style.display='inline-block'
                        doms[i].querySelectorAll(".vxe-cell--filter")[0].style.display='inline-block'
                    }else{
                        doms[i].querySelectorAll(".vxe-cell--sort")[0].style.display='none'
                        doms[i].querySelectorAll(".vxe-cell--filter")[0].style.display='none'
                    }
                    break
                }
            }
        },


        showFilter(index,action,id){
            //显示字段筛选图标
            if (action){
                 this.timeOutFilters=setTimeout(() => {
                    if (this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll("th")){
                        this.getThByAttr(this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll("th"),id,action)
                        if (this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1]){
                            this.getThByAttr(this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1].querySelectorAll("th"),id,action)
                        }
                    }
                 }, 100);
                 this.filtersAllChecked()
            }else{
                this.timeOutFilters=setTimeout(() => {
                        if (this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll("th")){
                            this.getThByAttr(this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll("th"),id,action)
                            if (this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1]){
                                this.getThByAttr(this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1].querySelectorAll("th"),id,action)
                            }
                        }
                }, 100);
                this.filtersAllShow=false
            }
        },

       /*  showFilter(index,action){
            //显示字段筛选图标
            if (action){
                 this.timeOutFilters=setTimeout(() => {
                    if (this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll("th")[index].querySelectorAll(".vxe-cell--sort")[0]){
                            this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll("th")[index].querySelectorAll(".vxe-cell--sort")[0].style.display='inline-block'
                            this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll("th")[index].querySelectorAll(".vxe-cell--filter")[0].style.display='inline-block'
                            if (this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1]){
                                this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1].querySelectorAll("th")[index].querySelectorAll(".vxe-cell--sort")[0].style.display='inline-block'
                                this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1].querySelectorAll("th")[index].querySelectorAll(".vxe-cell--filter")[0].style.display='inline-block'
                            }
                    }
                 }, 100);
                 this.filtersAllChecked()
            }else{
                this.timeOutFilters=setTimeout(() => {
                        if (this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll("th")[index].querySelectorAll(".vxe-cell--sort")[0]){
                            this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll("th")[index].querySelectorAll(".vxe-cell--sort")[0].style.display='none'
                            this.xTableObj.$el.querySelectorAll(".vxe-header--row")[0].querySelectorAll("th")[index].querySelectorAll(".vxe-cell--filter")[0].style.display='none'
                            if (this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1]){
                                this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1].querySelectorAll("th")[index].querySelectorAll(".vxe-cell--sort")[0].style.display='none'
                                this.xTableObj.$el.querySelectorAll(".vxe-header--row")[1].querySelectorAll("th")[index].querySelectorAll(".vxe-cell--filter")[0].style.display='none'
                            }
                        }
                }, 100);
                this.filtersAllShow=false
            }
        }, */

        scrollCheckFilter:XEUtils.debounce(function () {
                //防抖处理滚动后筛选项的显示与隐藏
                this.recheckShowFilter()
        }, 200),

        recheckShowFilter(){
             //判断筛选项
                    let _this = this
                    let indexVal=0
                    if (_this.hasFilters){
                        let nowVisibleTable=_this.xTableObj.getTableColumn().tableColumn
                        nowVisibleTable.map((item,index)=>{
                            if (item.visible==true){
                                if (item.filters!=undefined){
                                    _this.showFilter(indexVal,item.filtersShow,item.id)
                                }
                                indexVal++;
                            }
                        })
                        
                    }
                    

        },
        changeWidth(){
            //更改宽度
            //加再已修改的配置
            this.xTableObj.loadColumn(this.options)
        },
        openListShow(){
            let _this=this
            /* if (this.checkColumns != _this.xTableObj.getColumns().length ){
               // _this.tableDefaultColumns=_this.xTableObj.getColumns()
                let tableColumnsNow=_this.xTableObj.getTableColumn()
                tableColumnsNow=tableColumnsNow.fullColumn
                _this.tableDefaultColumns=tableColumnsNow
                _this.setColVal()
            } */
            //显示配置表
            _this.listShow=true
        },
        //显示隐藏变更
        checkCheckbox(){
            let _this=this
            let allChecked =true
            _this.options.map(function(item){
                if (item.visible==false){
                    allChecked=false
                }
            })
            this.checkAll=allChecked
            this.saveTableColumnsList()
        },
        //全选
        checkAllColumns(){
            let _this=this
            let value=_this.checkAll
            _this.options.map(function(item){
                item.visible=value
            })
            this.saveTableColumnsList()
        },
        //重新载入列配置
        reloadColumns(){
            let _this=this
            _this.FixValue=null
            _this.options=_this.tableDefaultColumns
            this.saveTableColumnsList() 
            this.listShow=false
            //清除localstorage
            let tableUser=this.tableUser()
            let tableId=this.getTableId()
            if (localStorage.getItem("tableColumnsList_"+tableUser)!=undefined){
                let obj=JSON.parse(localStorage.getItem("tableColumnsList_"+tableUser))
                if (obj[tableId]!=undefined && obj[tableId]!=''){
                    obj[tableId]=""
                    localStorage.setItem("tableColumnsList_"+tableUser,JSON.stringify(obj))
                }
            }
        },

        getColumnJson(obj){
            //需要保存的列信息
            //F:是否浮动,V:是否显示,W:列宽,P:字段名,T:字段标题,Y:字段类型,S:是否显示筛选,
            let arr=[];
            let col={}
            obj.map((item,index)=>{
                col={F:"",V:"",W:"",P:"",T:"",Y:'',S:''}
                col.F=item.fixed ?  item.fixed:''
                col.V=item.visible ?  item.visible:false
                col.W=item.resizeWidth ?  item.resizeWidth:''
                col.P=item.property ?  item.property:''
                col.T=item.title ?  item.title:''
                col.Y=item.type ?  item.type:''
                if (this.hasFilters){
                    col.S=item.filtersShow ?  "":"h"
                }
                arr.push(col)
            })
            return JSON.stringify(arr)
        },
        //保存定义的列信息
        saveTableColumnsList(){
           
            let _this = this
            if (_this.FixValue!=null){
                _this.options.map((item,index)=>{
                    item.fixed = index<=_this.FixValue ? "left":null
                })
            }else{
                _this.options.map((item,index)=>{
                    item.fixed = null
                })
            }
            if (_this.isDraggable){
                _this.xTableObj.loadColumn(_this.options)
            }else{
                _this.xTableObj.refreshColumn()
            }
            

            //_this.xTableObj.refreshColumn()
           // _this.listShow=false

            let tableId=this.getTableId()
            let tableUser=this.tableUser()

            if (localStorage.getItem("tableColumnsList_"+tableUser)==null){
                let obj={}
                obj[tableId]=_this.getColumnJson(_this.options)
                localStorage.setItem("tableColumnsList_"+tableUser,JSON.stringify(obj))
            }else{
                let obj=JSON.parse(localStorage.getItem("tableColumnsList_"+tableUser))
                obj[tableId]=_this.getColumnJson(_this.options)
                localStorage.setItem("tableColumnsList_"+tableUser,JSON.stringify(obj))
            }

            _this.recheckShowFilter()
        },
    
    
        //读取已定义列信息
        getTableColumnsList(){
                let tableUser=this.tableUser()
                let tableId=this.getTableId()

                if (localStorage.getItem("tableColumnsList_"+tableUser)!=undefined){
                    let obj=JSON.parse(localStorage.getItem("tableColumnsList_"+tableUser))
                    if (obj[tableId]!=undefined && obj[tableId]!=''){
                        return obj[tableId]
                    }else{
                        return ''
                    }
                }else{
                    return ''
                }

        },

        tableUser(){
            let userInfo=JSON.parse(localStorage.getItem("dzz-userinfo"))
            let tableUser=userInfo.id.entityCode+"_"+userInfo.id.userId
            return tableUser
        },

        //生成当前tableID,用于保存不同表列信息
        getTableId(){
            let _this=this
            let xTable =_this.xTableObj
            let code="0000"
            let name="routeName"

            if (xTable.$parent.$route.meta.functionCode!=undefined){
                code=xTable.$parent.$route.meta.functionCode
            }else if (xTable.$parent.$route.meta.parentFunctionCode!=undefined){
                code=xTable.$parent.$route.meta.parentFunctionCode
            }
            if (xTable.$parent.$route.name!=undefined){
                name=xTable.$parent.$route.name
            }
            //table+页面code+页面名称+table名称
            return "table_"+code+"_"+name+"_"+_this.tableName
        },

        selectAutoFixedColumn(val){
            let table =  this.xTableObj
            if(!table){
            table = this.tableRef
            }
            const columns = table.getColumns();
            //console.info(columns)
            for(let i = 0;i<columns.length;i++ ){
            if(i<val){
                columns[i].fixed = "left"
            }else{
                columns[i].fixed = null
            }
            }
            table.refreshColumn()
        },

        handleVisibleChange(visible){
            if(visible){
            this.init()
            }
        }
    }
  }
</script>
<style>
.fixRadio .el-radio__label{ display: none;}
</style>
<style lang="less" scoped> 
  .choose-fixed { position: relative;text-align: right;
    .openListShow{ font-size: 15px;line-height: 16px;color: #1989fa;cursor: pointer;
        i{font-size: 16px;color:#606266;}
    }
    .editColumns{ position: absolute;z-index:10;left:auto; right:0; top:34px;background-color:#fff;border:1px solid #ccc;border-radius:5px;line-height:12px;font-size:12px;padding:5px;
        .btnList{ display: flex; justify-content: flex-end;  align-items: center; flex-wrap: nowrap;
            .helpNew{font-size: 18px; margin: 0 5px;}
            .reload,.close{font-size: 14px;margin: 0 5px; background-color: #ccc; line-height: 18px;width: 18px;text-align: center;background-color: #666;
    color: #fff;border-radius: 50%;cursor: pointer;}
 
        }
        .listTitle{ padding: 6px 0; margin: 3px 0; background-color: #f3f3f3;text-align: left;}
        .listTitle,.listLine{
            span{text-align: center; display: inline-block; overflow: hidden;text-overflow: ellipsis; word-break: keep-all;line-height: 20px;}
            span:nth-child(1){ width:50px;}
            span:nth-child(2){ width:50px;}
            span:nth-child(3){text-align: left;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;min-width: 20px;}
            span:nth-child(4){padding: 0 5px;
                i{ display: none;}
            }
            .el-radio__label{display:none;}
            .vxe-icon--funnel{cursor: pointer;}
            .vxe-icon--funnel.active{color:#2E6FE3;}
        }
        .listLine:hover{cursor: move;
            span:nth-child(4){
                i{ display: inline;}
            }
        }
        .order{ float: right;}
        ul{height: 30vh;; overflow-y: auto;
            li{padding:7px 0;text-align:left;border-bottom:1px solid #eee;    word-break: keep-all;white-space: nowrap;}
        }
    }
   
  }
</style>