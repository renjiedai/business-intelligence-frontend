<template> 
  <div class="app-container">
    <h1>
      对用户兴趣变化的统计查询
    </h1>
    <el-row>
      <el-col :span="12">
        <el-form
          ref="form"
          :model="form"
          label-width="120px"
          style="padding-top: 5vh"
        >
          <el-form-item label="用户ID">
            <el-autocomplete
              v-model="form.userID"
              :fetch-suggestions="userIDSearchSuggest"
              placeholder="请输入用户ID"
              style="width: 20vw"
              clearable
              @select="handleSelect"
              size="small"
            />
          </el-form-item>
          <el-form-item label="新闻种类">
            <el-select v-model="form.newsCategory" multiple placeholder="请选择" size="small">
              <el-option
                v-for="option in sortedNewsCategorys"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
            <p>你选择的选项是: {{ form.newsCategory }}</p>
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
        userID:"",
        newsCategory: [],
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
      newsCategorys: [ // 下拉选项的数据
        { label: 'sports', value: 'sports' },
        { label: 'news', value: 'news' },
        { label: 'autos', value: 'autos' },
        { label: 'foodanddrink', value: 'foodanddrink' },
        { label: 'finance', value: 'finance' },
        { label: 'music', value: 'music' },
        { label: 'lifestyle', value: 'lifestyle' },
        { label: 'weather', value: 'weather' },
        { label: 'health', value: 'health' },
        { label: 'video', value: 'video' },
        { label: 'movies', value: 'movies' },
        { label: 'tv', value: 'tv' },
        { label: 'travel', value: 'travel' },
        { label: 'entertainment', value: 'entertainment' },
        { label: 'kids', value: 'kids' },
        { label: 'europe', value: 'europe' },
        { label: 'northamerica', value: 'northamerica' },
        { label: 'adexperience', value: 'adexperience' }
      ],
    }
  },
  mounted() {
    this.$echarts.init(document.getElementById("lineChart"));
  },
  computed: {
    sortedNewsCategorys() {
      // 使用 sort() 方法按照选项的 label 属性进行排序
      return this.newsCategorys.slice().sort((a, b) => a.label.localeCompare(b.label));
    }
  },
  methods: {
    handleSelect(item) {
      console.log(item);
    },
    userIDSearchSuggest(queryString, cb) {
      // 新闻标题搜索建议
      this.$axios
        .get("/suggest/userid", {
          params: {
            userID: queryString,
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
      if (form.userID == "") {
        this.$message({
          message: "请输入新闻标题",
          type: "warning",
        });
        return;
      }
      if (form.newsCategory.length == 0) {
        this.$message({
          message: "请选择新闻类别",
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
        .post("/user/intrests", {
          userID: form.userID,
          newsCategory: form.newsCategory,
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