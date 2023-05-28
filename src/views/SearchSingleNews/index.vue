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
          <!-- <el-form-item label="新闻ID">
            <el-input
              v-model="form.newsId"
              placeholder="请输入新闻ID"
              style="width: 20vw"
            ></el-input>
          </el-form-item> -->
          <el-form-item label="新闻标题">
            <el-autocomplete
              v-model="form.newsHeadline"
              :fetch-suggestions="newsHeadlineSearchSuggest"
              placeholder="请输入新闻标题"
              style="width: 20vw"
              clearable
              @select="handleSelect"
              size="small"
            />
          </el-form-item>
          <el-form-item label="起止时间">
            <el-date-picker
              v-model="form.selectedDateRange"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              style="width: 20vw"
              size="small"
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
          <div id="lineChart" style="width: 600px; height: 400px;"></div>
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
        newsHeadline: "",
        selectedDateRange: "",
      },
      pickerOptions: {
        disabledDate(time) {
          const start = new Date('2023-05-01'); // 设置开始日期
          const end = new Date('2023-06-01'); // 设置结束日期
          return time < start || time > end;
        }
      },
      date_popularity: [],
    }
  },
  mounted() {
    this.$echarts.init(document.getElementById("lineChart"));
  },
  methods: {
    handleSelect(item) {
      console.log(item);
    },
    newsHeadlineSearchSuggest(queryString, cb) {
      // 新闻标题搜索建议
      this.$axios
        .get("/suggest/newsheadline", {
          params: {
            headline: queryString,
            amount: 10,
          },
        })
        .then((res) => {
          console.log("这是结果", res.suggestions.length);
          console.log("这是第一条", res.suggestions[0]);
          var result = [];
          for (var i = 0; i < res.suggestions.length; i++) {
            result.push({ value: res.suggestions[i] });
          }
          console.log("这是result", result);
          cb(result);
        })
        .catch((err) => {
          this.$message.error("当前网络异常，请稍后再试");
        });
    },
    fromDate2String(date) {
      const year = date.getFullYear(); // 获取年份
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 获取月份，注意月份从 0 开始，需要加 1，然后补零
      const day = String(date.getDate()).padStart(2, '0'); // 获取日期，补零

      const formattedDate = `${year}-${month}-${day}`; // 拼接为 "YYYY-MM-DD" 格式的字符串
      return formattedDate;
    },
    search(form) {
      // console.log(form.selectedDateRange[0].toString());
      if (form.newsHeadline == "") {
        this.$message({
          message: "请输入新闻标题",
          type: "warning",
        });
        return;
      }
      // 这里或许也可以不要判断时间，后台给个默认
      if (form.selectedDateRange == "") {
        this.$message({
          message: "请选择起止时间",
          type: "warning",
        });
        return;
      }
      this.drawLineChart();
      // 这里调用后台接口，传入form.newsId和form.selectedDateRange
      // 后台返回的数据格式为：[{"date": "2020-01-01", "popularity": [100,150...]}, {"date": "2020-01-02", "popularity": [120,150...]}, ...]
      // 这里的popularity是一个数组，数组的长度为4，每个元素代表6个小时的流行度
      this.$axios
        .post("/singlenews/popularity", {
          newsHeadline: form.newsHeadline,
          startDate: this.fromDate2String(form.selectedDateRange[0]),
          endDate: this.fromDate2String(form.selectedDateRange[1]),
        })
        .then((res) => {
          // 处理返回的逻辑
          console.log(res);
          this.date_popularity = res.data;
          
        }
        
        )
  

    },
    drawLineChart() {
      // 创建折线图实例
      const lineChart = this.$echarts.init(document.getElementById('lineChart'));

      // 定义时间数组和新闻热度数值数组
      const timeArray = ["2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04", "2023-01-05"];
      const hotnessArray = [10, 20, 15, 30, 25];

      // 配置折线图的选项
      const options = {
        xAxis: {
          type: 'category',
          data: timeArray,
          boundaryGap: false, // 横轴不留白
          name: '时间' // 横轴名称
        },
        yAxis: {
          type: 'value',
          name: '新闻热度' // 纵轴名称
        },
        series: [{
          data: hotnessArray,
          type: 'line'
        }]
      };

      // 使用配置项绘制折线图
      lineChart.setOption(options);
    },
  },
};

</script>

<style scoped>
.el-divider--vertical {
  height: 100vh;
}
</style>