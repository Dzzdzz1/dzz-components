<template>
    <el-dialog v-if="userDialogVisible" :visible.sync="userDialogVisible" width="80%" title="人员信息选择" append-to-body @close="closeDialog">
        <div class="dialog-position">
            <el-button v-if="selectMode == 'radio'" type="primary" size="mini" @click="save" :disabled="!radioRow">确定</el-button>
            <el-button v-else type="primary" size="mini" @click="save" :disabled="myCheckList.length<=0">确定</el-button>
            <el-button type="primary" size="mini" @click="userDialogVisible = false">关闭</el-button>
        </div>
        <div class='UserSelectDialog'>
            <div class="use-list" v-if="!disabledCheck">
                <h4 class="list-title" v-if="selectMode == 'checkbox'">人员选择：</h4>
                <search-form @search="handleQuery" @reset="reset">
                    <el-form slot="form" size="mini" label-width="120px" @submit.native.prevent>
                        <el-row>
                            <!-- <el-col-public>
                                <el-form-item label="岗位名称">
                                    <el-input v-model="searchData.username" clearable></el-input>
                                    <system-status-select :options="statusList" model="ticketStatusList" :formData="searchData" label-key="name" value-key="code" multiple clearable/>
                                </el-form-item>
                            </el-col-public> -->
                            <el-col-public>
                                <el-form-item label-width="60px"  label="员工姓名">
                                    <el-input v-model="searchData.employeeName" clearable @keydown.enter.native="fetchList"></el-input>
                                </el-form-item>
                            </el-col-public>

                            <!-- <date-picker-start-end :searchData="searchData" startLabel="时间段" endLabel="至" start="createStartDate" end="createEndDate"/> -->
                        </el-row>
                    </el-form>
                </search-form>
                <div class="shrink-horizontal">
                    <div class="left-box"
                        :style="{
                            width: propOptions.leftWidth + 'px',
                            border: propOptions.leftBorder ? '1px solid #A1A1A1' : 'none'
                        }"
                        v-show="expand">
                        <el-form size="mini" label-width="60px" style="border-bottom: 1px solid #A1A1A1; padding:0 10px;">
                            <el-form-item label="快速定位:" style="margin: 0; padding: 4px 0; ">
                                <el-input v-model="filterText" size="mini" clearable placeholder="请输入部门名称"></el-input>
                            </el-form-item>
                        </el-form>
                        <div class="tree-box">
                            <el-tree
                                ref="tree"
                                :filter-node-method="filterNode"
                                :data="deptTree"
                                node-key="id"
                                :props="defaultProps"
                                :default-expanded-keys="expandedKeys"
                                :expand-on-click-node="false"
                                highlight-current
                                @node-click="nodeClick"
                                @node-expand="nodeExpand">
                            </el-tree>
                        </div>
                    </div>
                    <div class="right-box" :style="{border: propOptions.rightBorder ? '1px solid #ccc' : 'none'}">
                        <div class="btn-group">
                            <el-button type="primary" size="mini" @click="expandHandle">
                                {{expand ? '收起' : '展开'}}
                                <i class="el-icon-d-arrow-left" v-if="expand"/>
                                <i class="el-icon-d-arrow-right" v-else/>
                            </el-button>
                            <slot name="rightBtns"></slot>
                        </div>
                        <vxe-grid
                            ref="cadreInfoTable"
                            row-id="employeeNo"
                            auto-resize
                            :height="467"
                            column-min-width="100"
                            :radio-config="{trigger: 'row', checkMethod: checkRadioMode, reserve:true}"
                            @radio-change="radioChangeEvent"
                            :checkbox-config="{trigger: 'row', checkMethod: checkCheckboxMode, reserve:true, showHeader:selectMode == 'checkbox' && !maxUser}"
                            @checkbox-change="checkChangeEvent"
                            @checkbox-all="checkboxAll"
                            :start-index="(tablePage.currentPage - 1) * tablePage.pageSize"
                            :pager-config="tablePage"
                            @page-change="handlePageChange"
                            :keep-source="true"
                            :data="tableData">
                            <vxe-table-column type="checkbox" width="60" v-if="selectMode === 'checkbox'"></vxe-table-column>
                            <vxe-table-column type="radio" width="60" title="单选" v-if="selectMode === 'radio'"></vxe-table-column>
                            <vxe-table-column field="employeeName" title="员工姓名"></vxe-table-column>
                            <vxe-table-column field="orgName" title="部门"></vxe-table-column>
                            <vxe-table-column field="positionName" title="岗位"></vxe-table-column>
                        </vxe-grid>
                    </div>
                </div>
            </div>
            <div class="check-list" :style="!disabledCheck ? '' : 'flex:1 !important;'" v-if="selectMode == 'checkbox'">
                <h4 class="list-title" :style=" !disabledCheck ? 'margin-top:63px' : ''">已选择人员列表：</h4>
                <vxe-grid
                    style="margin-top:10px"
                    row-id="employeeNo"
                    auto-resize
                    :height="467"
                    align="center"
                    column-min-width="100"
                    :data="myCheckList">
                    <vxe-table-column title="操作" width="100" v-if="!disabledCheck">
                        <template v-slot="{row, rowIndex}">
                            <el-button type="text" size="mini" @click="delItem(row,rowIndex)">移除</el-button>
                        </template>
                    </vxe-table-column>
                    <vxe-table-column field="employeeName" title="员工姓名"></vxe-table-column>
                    <!-- <vxe-table-column field="orgName" title="部门"></vxe-table-column> -->
                    <!-- <vxe-table-column field="positionName" title="岗位"></vxe-table-column> -->
                </vxe-grid>
            </div>
        </div>
    </el-dialog>
</template>

<script>
export default {
    name:"UserSelectDialog",
    props: {
        propOptions: {
            type: Object,
            default: function () {
                return {
                    leftWidth: 280,
                    leftBorder: true,
                    rightBorder: false
                }
            }
        },
        disabledCheck:{
            type: Boolean,
            default: false,
        },
        selectMode:{
            type: String,
            default: "radio"
        },
        actions:{
            getCompanyDept:Function,
            getUserPage:Function
        },
        maxUser:{
            type: String,
            default:""
        },
        disabledList:{
            type:Array,
            default:()=>[]
        }
    },
    data() {
        return {
            userDialogVisible:false,
            searchData:{
                employeeName:"",
                positionName:"",
                orgCode:"",
            },
            defaultProps: {
                children: 'children',
                label: 'label',
            },
            deptTree: [],
            expand: true,
            expandedKeys:[],//默认展开节点
            filterText:'',
            tablePage: {
                currentPage: 1,
                pageSize: 15,
                offset: 0,
                total: 0
            },
            radioRow:null,
            myCheckList:[],
            tableData:[]
        };
    },
    computed: {

    },
    created() {
        this.getCompany()
    },
    mounted() {
        this.fetchList()
    },
    watch: {
        filterText(value){
            this.$refs.tree.filter(value)
        },
        userDialogVisible(val){
            if(val){
                this.myCheckList = JSON.parse(JSON.stringify(this.disabledList))
                this.$nextTick(()=>{
                    this.$refs.cadreInfoTable.setCheckboxRow(this.disabledList,true)
                });
                this.handleQuery()
            }else{
                this.reset()
                this.tableData = []
                this.filterText = ""
                this.radioRow = null;
            }
        }
    },
    methods: {
        delItem(row, index){
            let newTable = this.$refs.cadreInfoTable.getCheckboxRecords(true)
            newTable.forEach(item => {
                if(item.employeeNo == row.employeeNo){
                    this.$refs.cadreInfoTable.setCheckboxRow(item,false);
                }
            })
            this.myCheckList.splice(index,1)
        },
        radioChangeEvent({row}){
            this.radioRow = row
        },
        checkChangeEvent({row, checked, selection}){
            if(checked){
                if(this.maxUser && this.myCheckList.length >= Number(this.maxUser)){
                    this.$message.warning(`最多只能选择${this.maxUser}人`)
                    this.$refs.cadreInfoTable.setCheckboxRow(row,false);
                }else{
                    this.myCheckList.push(row)
                }
            }else{
                let index = this.myCheckList.findIndex(item => item.employeeNo == row.employeeNo)
                this.myCheckList.splice(index,1)
            }
        },
        checkboxAll({checked, records ,selection}){
            if(checked){
                let newRecords = records.filter((v) => this.myCheckList.every((val) => val.employeeNo!= v.employeeNo));
                this.myCheckList.push(...newRecords)
            }else{
                this.myCheckList = this.myCheckList.filter((v) => this.tableData.every((val) => val.employeeNo != v.employeeNo))
            }
        },
        checkRadioMode() {
            return this.selectMode === 'radio' ? true : false
        },
        checkCheckboxMode() {
            return this.selectMode === 'checkbox' ? true : false
        },
        closeDialog(){
            // Object.assign(this.$data.searchData, this.$options.data().searchData)
            // if (this.selectMode === 'radio') {
            //     this.$refs['cadreInfoTable'].clearRadioRow()
            // }
            // if (this.selectMode === 'checkbox') {
            //     this.$refs['cadreInfoTable'].clearCheckboxRow()
            // }
        },
        getCompany(){
            this.actions.getCompanyDept().then(res => {
                if(res.children){
                    res.children.forEach(item => {
                        if(item.children == ''){
                            item.children = [{}]
                        }
                    })
                }
                if(!res.treetype){
                    this.expandedKeys = [res.id]
                }
                this.deptTree = res ? [res] : []
            })
        },
        expandHandle () {
            this.expand = !this.expand
            this.$refs.cadreInfoTable.recalculate(true)
        },
        //搜索树节点
        filterNode(value, data, node){
            if(!value){
                return true
            }
            if(data[this.defaultProps['label']]){
                let one = data[this.defaultProps['label']].indexOf(value)!==-1
                let two = node.parent && node.parent.data && node.parent.data[this.defaultProps['label']] && (node.parent.data[this.defaultProps['label']].indexOf(value) !== -1)
                let three = node.parent && node.parent.parent && node.parent.parent.data && node.parent.parent.data[this.defaultProps['label']] && (node.parent.parent.data[this.defaultProps['label']].indexOf(value) !== -1)
                let resOne = false
                let resTwo = false
                let resThree = false
                if(node.level == 1){
                    resOne = one
                }else if(node.level == 2){
                    resTwo = two
                }else if(node.level == 3){
                    resTwo = three
                }
                return one || two || three
                // return data[this.defaultProps['label']].indexOf(value)!==-1;
            }
            this.expandFunc(this.deptTree)
        },
        // 遍历树形数据，通过设置每一项的expanded属性，实现展开与折叠
        expandFunc(data) {
            data.forEach(item=> {
            if(this.$refs.tree.store.nodesMap[item.id]){
                this.$refs.tree.store.nodesMap[item.id].expanded = false
            }
            if (item.children && item.children.length>0) {
                this.expandFunc(item.children)
            }
            })
        },
        //展开节点
        nodeExpand(data){
            // if(data.treetype == "company" && data.children.length == 1){
            //     getCompanyDepTree({company_id: data.id}).then(res => {
            //         if(res.children.length == 0){
            //             data.children = ''
            //         }else{
            //             data.children= res ? res.children : [] 
            //         }
            //     })
            // }
        },
        // 点击部门树
        nodeClick (data, node) {
            if (node.level === 1) {
                this.searchData.orgCode = ''
            } else {
                this.searchData.orgCode = data.id
            }
            this.handleQuery()
        },
        fetchList(){
            this.actions.getUserPage({
                limit:this.tablePage.pageSize,
                offset:this.tablePage.offset,
                searchData:this.searchData
                }).then(res=>{
                this.tableData = res.list;
                this.tablePage.total = res.total;
            })
        },
        handleQuery () {
            this.tablePage.offset = 0;
            this.tablePage.currentPage = 1;
            this.fetchList()
        },
        handlePageChange({currentPage,pageSize}) {
            this.tablePage.currentPage = currentPage;
            this.tablePage.pageSize = pageSize;
            this.tablePage.offset = this.tablePage.pageSize * (currentPage - 1);
            this.fetchList();
        },
        reset () {
            this.Utility.resetSearchForm(this,'searchData')
        },
        save(){
            if(this.selectMode == 'radio'){
                this.$emit("submit", this.radioRow)
            }else{
                this.$emit("submit", this.myCheckList)
            }
            this.userDialogVisible = false;
        }
    },
};
</script>

<style scoped lang="less">
.UserSelectDialog{
    display:flex;
    .list-title{
        font-size: 18px;
    }
    .use-list{
        width:100%;
        box-sizing: border-box;
        margin-right: 30px;
        flex:1;
    }
    .check-list{
        box-sizing: border-box;
        margin-right: 30px;
        width:350px;
        // flex:1;
    }
}
.shrink-horizontal{
    display: flex;
    overflow: hidden;
    &>.left-box {
        margin-right: 15px;
        // height: 100%;
        overflow: hidden;
    }
    &>.right-box {
        flex: 1;
        flex-shrink: 0;
        height: 100%;
        display:flex;
        flex-direction: column;
        overflow: hidden;
        .btn-group{
            height:28px;
            padding-bottom: 10px;
        }
    }
}
.tree-box{
    height: calc(100% - 38px);
    overflow: auto;
}
</style>
