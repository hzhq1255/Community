<template>

    <div class="content">
        <div style="height:80vh" v-if="showMkdown">
          <div class="title-box">
              <el-input class="title-input" placeholder="请输入标题" v-model="title"></el-input>
              <el-button type="danger" size="medium"  @click="postArticle " class="title-btn" plain>发表博客</el-button>
          </div>
          <mavon-editor :ishljs="true" v-model="value" @change="change"></mavon-editor>
          <el-dialog title="发表博客" :visible.sync="dialogFormVisible">
              <el-form  :model="form" ref="form" :rules="rules">
                  <el-form-item label="文章标签：" :label-width="formLabelWidth">
                      <el-tag
                          :key="tag"
                          v-for="tag in dynamicTags"
                          closable
                          :disable-transitions="false"
                          @close="handleClose(tag)">
                          {{tag}}
                      </el-tag>
                      <el-input
                          class="input-new-tag"
                          v-if="inputVisible"
                          v-model="inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm"
                          @blur="handleInputConfirm"
                      >
                      </el-input>
                      <el-button v-else class="button-new-tag" size="small" @click="showInput" v-show="_showtagBtn">+ 添加标签</el-button>
                  </el-form-item>
                  <el-form-item  class="inlineInput" label="文章类型：" :label-width="formLabelWidth"  prop="type">
                      <el-select v-model="form.type" placeholder="请选择文章类型">
                          <el-option label="原创" value="原创"></el-option>
                          <el-option label="转载" value="转载"></el-option>
                          <el-option label="面经" value="面经"></el-option>                        
                      </el-select>
                  </el-form-item>
                  <el-form-item class="inlineInput" label="博客分类：" :label-width="formLabelWidth" prop="direction">
                      <el-select v-model="form.direction" placeholder="请选择博客分类">
                          <el-option label="前端" value="前端"></el-option>
                          <el-option label="后端" value="后端"></el-option>
                          <el-option label="安卓" value="安卓"></el-option>
                          <el-option label="嵌入式" value="嵌入式"></el-option>
                      </el-select>
                  </el-form-item>
              </el-form>
              <div slot="footer" class="dialog-footer">
                  <el-button @click="dialogFormVisible = false">取 消</el-button>
                  <el-button @click="dialogFormVisible = false">保存为草稿</el-button>
                  <el-button type="primary" @click="debounce(publishBlog('form'), 1000)">确 定</el-button>
              </div>
          </el-dialog>
        </div>
        <div class="notice-box" v-else> 
          <div class="finish-notice">
            <div class="text">
              <h1>文章标题</h1>
              <h2><i class="el-icon-circle-check success"></i>发布成功</h2>
               <el-button type="danger" plain>写新文章</el-button>
                <el-button @click.native="goToArticle(articleId)" type="danger" plain>查看文章</el-button>
            </div>
          </div>
        </div>
    </div>

</template>

<script>
import axios from 'axios'
import ButtonDebounce from '@/mixin/mixin.js'
export default {
    name:'Write',
    mixins: [ButtonDebounce],
    data() {
    return {
        value: '',
        defaultData: "preview",
        title:'',
        html:'',
        articleId:'',
        dialogTableVisible:false,
        dialogFormVisible: false,
        showMkdown:true,
        form: {
          name: '',
          type: '',
          direction:'',
          delivery: false,
          resource: '',
          desc: ''
        },
        formLabelWidth: '120px',
        dynamicTags: [],
        inputVisible: false,
        inputValue: '',
        rules: {
          type: [
            { required: true, message: '请选择文章类型', trigger: 'change' }
          ],
          direction: [
            { required: true, message: '请选择博客分类', trigger: 'change' }
          ],
        }
    };
    },
    methods:{
        postArticle(){
            if(this.title == ''){
                this.$message({
                    type: 'info',
                    message: '题目不能为空'
                });     
            }else if(this.value == ''){
                this.$message({
                    type: 'info',
                    message: '内容不能为空'
                });  
            }
            else{
                this.dialogFormVisible  = true
            }
        },
        handleClose(tag) {
        this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
      },

      showInput() {
        this.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
        change(value, render){
            // render 为 markdown 解析后的结果
            this.html = render;
        },
      handleInputConfirm() {
        let inputValue = this.inputValue;
        if (inputValue) {
          this.dynamicTags.push(inputValue);
        }
        this.inputVisible = false;
        this.inputValue = '';
      },
      publishBlog(formName){
          this.$refs[formName].validate((valid) => {
          if (valid) {
            this.dialogFormVisible = false;
            let params = new URLSearchParams();
            params.append('title',this.title)
            params.append('content',this.value)
            params.append('contentHtml',this.html)
            params.append('directionLabel',this.form.direction)
            params.append('type',this.form.type)
            params.append('attributeLabel',this.dynamicTags)
            axios.post('http://blog.swpuiot.com/publishBlog',params)
            .then(this.publishBlogSucc)
          } else {
            return false;
          }
        });
      },
      publishBlogSucc(res){
          res = res.data
          if(res.code ==  200){
            this.articleId = res.data.articleId
            this.showMkdown=false
          }else{
          }
      },
      getArticle(){
        if(this.$route.params.articleId != 'new'){
          axios.post('http://blog.swpuiot.com/article/'+this.$route.params.articleId+'/edit')
          .then( res => {
            res = res.data
            if(res.code == 200){
              this.title = res.data.title
              this.value = res.data.content
              this.form.type = res.data.type
              this.dynamicTags = res.data.attributeLabel
              this.form.direction = res.data.directionLabel
            }
          }) 
        }else{
           this.title = ''
            this.value = ''
            this.form.type = ''
            this.dynamicTags = []
            this.form.direction = ''
        }
      },
      goToArticle(id){
        this.$router.push('/article/'+id)
      },
    },
    mounted(){
      this.getArticle()
    },
    activated(){
      this.getArticle()
    },
    computed:{
        _showtagBtn(){
            return this.dynamicTags.length >= 3 ?  false : true 
        }
    }
}
</script>

<style lang="stylus" scoped>
.content
    top 70px
    position relative
    height  80vh
    padding 0 10px
    .title-box
        display flex
        padding 5px 0
        .title-input
            flex 1 0
            margin-right 10px
    .inlineInput
        display inline-block
        width 50%
        float left
        margin-bottom 40px
    .v-note-wrapper
        height 100%
        z-index 55
  .notice-box
    display flex
    height 100%
    width 100%
    .finish-notice
      display flex
      margin auto 
      height 300px
      width 500px
      background-color #fff
      color #000
      .text
        height 200px
        width 100%
        text-align center
        margin auto 
        h2
          height 30px
          line-height 30px
          font-size 30px
          .success
            font-size 30px
            color #67C23A
            margin 0  10px
.content >>> .el-input
    /*margin-left 10px*/
</style>
<style>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
  .el-form-item__error {
    margin-left: 10px;
}
</style>
