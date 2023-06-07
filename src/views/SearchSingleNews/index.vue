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
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="form.selectedStartDateTime"
              type="datetime"
              placeholder="选择日期时间"
              format="yyyy-MM-dd HH:mm:ss"
              :picker-options="pickerOptions"
              style="width: 20vw"
              size = "small"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="form.selectedEndDateTime"
              type="datetime"
              placeholder="选择日期时间"
              format="yyyy-MM-dd HH:mm:ss"
              :picker-options="pickerOptions"
              style="width: 20vw"
              size = "small"
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
        newsHeadline: "",
        selectedStartDateTime: "Thu Jun 13 2019 00:00:00 GMT+0800 (中国标准时间)",
        selectedEndDateTime: "Thu Jul 11 2019 00:00:00 GMT+0800 (中国标准时间)",
      },
      pickerOptions: {
        disabledDate(time) {
          const start = new Date('2019-06-12'); // 设置开始日期
          const end = new Date('2019-07-11'); // 设置结束日期
          return time < start || time > end;
        }
      },
      time_array: [],
      popularity_array: [],
      suggestions_result: {},
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
        .get("/suggest/headline", {
          params: {
            headline: queryString,
            amount: 10,
          },
        })
        .then((res) => {
          // console.log("这是结果", res.suggestions.length);
          // console.log("这是第一条", res.suggestions[0]);
          var result_name = []
          for (var i = 0; i < res.suggestions.length; i++) {
            this.suggestions_result[res.suggestions[i]['name']] = res.suggestions[i]['id']
            result_name.push({ value: res.suggestions[i]['name'] });
          }
          cb(result_name);
        })
        .catch((err) => {
          this.$message.error("当前网络异常，请稍后再试");
        });
    },
    fromDate2String(dateString) {

      // 创建 Date 对象并传入原始日期字符串
      var dateObject = new Date(dateString);

      // 获取年、月、日、小时、分钟和秒
      var year = dateObject.getFullYear();
      var month = dateObject.getMonth() + 1;
      var day = dateObject.getDate();
      var hours = dateObject.getHours();
      var minutes = dateObject.getMinutes();
      var seconds = dateObject.getSeconds();

      // 格式化为所需的日期时间字符串
      var formattedDate = year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) + " " +
                          (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" +
                          (seconds < 10 ? "0" + seconds : seconds);
      return formattedDate;
    },
    fromJson2List(item) {
      this.time_array.push(item.datetime.slice(5,10));
      this.popularity_array.push(item.popularity);
    },
    search(form) {
      if (form.newsHeadline == "") {
        this.$message({
          message: "请输入新闻标题",
          type: "warning",
        });
        return;
      }
      // 这里或许也可以不要判断时间，后台给个默认
      if (form.selectedStartDateTime == ""||form.selectedEndDateTime == "") {
        this.$message({
          message: "请选择起止时间",
          type: "warning",
        });
        return;
      }
      this.drawLineChart();
      this.$axios
        .get("/news/popularity", {
          params: {
            newsID: this.suggestions_result[form.newsHeadline],
            startDate: this.fromDate2String(form.selectedStartDateTime),
            endDate: this.fromDate2String(form.selectedEndDateTime),
          },
        })
        .then((res) => {
          console.log("这是结果", res);
          this.time_array = [];
          this.popularity_array = [];
          res.data.forEach(this.fromJson2List);
          this.drawLineChart();
        })
        .catch((err) => {
          this.$message.error("当前网络异常，请稍后再试");
        });

    },
    drawLineChart() {
      // 创建折线图实例
      const lineChart = this.$echarts.init(document.getElementById('lineChart'));

      // 定义时间数组和新闻热度数值数组
      // const timeArray = ["01-01", "01-02", "01-03", "01-04", "01-05","01-06", "01-07", "01-08", "01-09", "01-10"];
      // const hotnessArray = [10, 20, 15, 30, 25, 10, 20, 15, 30, 25];

      // 配置折线图的选项
      const options = {
        xAxis: {
          type: 'category',
          data: this.time_array,
          boundaryGap: false, // 横轴不留白
          name: '时间' // 横轴名称
        },
        yAxis: {
          type: 'value',
          name: '新闻热度' // 纵轴名称
        },
        series: [{
          data: this.popularity_array,
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
