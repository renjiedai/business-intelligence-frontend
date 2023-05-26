<template> 
  <div class="app-container">
    <h1>
    对单个新闻的生命周期的查询，可以展示单个新闻在不同时间段的流行变化
    </h1>
    <el-row>
      <el-col :span="12">
        <el-form
          ref="form"
          :model="form"
          label-width="120px"
          style="padding-top: 5vh"
        >
          <el-form-item label="新闻ID">
            <el-input
              v-model="form.newsId"
              placeholder="请输入新闻ID"
              style="width: 20vw"
            ></el-input>
          </el-form-item>
          <el-form-item label="起止时间">
            <el-date-picker
              v-model="form.selectedDateRange"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              style="width: 20vw"
            ></el-date-picker>
          </el-form-item>
        </el-form>
        <div style="text-align: center">
          <el-button
            type="primary"
            @click="search(form)"
            size="small"
            style="margin-left: 3vh"
            plain
            >查询</el-button
          >
        </div>
      </el-col>
      <el-col :span="1">
        <el-divider direction="vertical" />
      </el-col>
      <el-col :span="10">
        <el-tabs v-model="activeName" >
          <el-tab-pane label="查询结果" name="search_res">
            <div>111</div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "SearchSingleNews",
  data() {
    return{
      form: {
        newsId:"",
        selectedDateRange: "",
      },
    }
  },
  methods: {
    search(form) {
      console.log(form);
    },
  },
};

</script>

<style scoped>
.el-divider--vertical {
  height: 100vh;
}
</style>