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
          <!-- <el-form-item label="新闻种类">
            <el-select v-model="form.newsCategory" multiple placeholder="请选择" size="small">
              <el-option
                v-for="option in sortedNewsCategorys"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
          </el-form-item> -->
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
        userID:"",
        newsCategory: [],
        selectedStartDateTime: "",
        selectedEndDateTime: "",
      },
      pickerOptions: {
        disabledDate(time) {
          const start = new Date('2023-05-01'); // 设置开始日期
          const end = new Date('2023-06-01'); // 设置结束日期
          return time < start || time > end;
        }
      },
      date_popularitys: [],
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
      time_array: [],
      popularity_array: [],
      my_series: [],
      my_legend: [],
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
            result.push({ value: res.suggestions[i].toString() });
          }
          console.log("这是result", result);
          cb(result);
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
      if (form.userID == "") {
        this.$message({
          message: "请输入用户ID",
          type: "warning",
        });
        return;
      }
      // if (form.newsCategory.length == 0) {
      //   this.$message({
      //     message: "请选择新闻类别",
      //     type: "warning",
      //   });
      //   return;
      // }
      // 这里或许也可以不要判断时间，后台给个默认
      if (form.selectedStartDateTime == "" || form.selectedEndDateTime == "") {
        this.$message({
          message: "请选择起止时间",
          type: "warning",
        });
        return;
      }

      this.$axios
        .post("/user/interest", {
          userID: form.userID,
          startDate: this.fromDate2String(form.selectedStartDateTime),
          endDate: this.fromDate2String(form.selectedEndDateTime),
        })
        .then((res) => {
          // 处理返回的逻辑
          this.date_popularity = res.data;
          // 按照 id 排序
          this.date_popularity.sort(function(a, b) {
            return a.id - b.id;
          });
          this.my_series = [];
          this.my_legend = this.newsCategorys.map(function(item) {
              return item.label;
            });
          for (var i = 0; i < this.date_popularity.length; i++) {         
            this.time_array = [];
            this.popularity_array = [];
            this.date_popularity[i].trends.forEach(this.fromJson2List);
            var temp_dict = {
              name: this.newsCategorys[i].label,
              type: 'line',
              data: this.popularity_array
            }
            this.my_series.push(temp_dict)
            // date_popularity[i].trends.forEach(this.fromJson2List);
          }
          // console.log(this.my_series)
          // console.log(this.my_legend)
          this.drawLineChart();
        }
        
        )
  

    },
    drawLineChart() {
      // 创建折线图实例
      const lineChart = this.$echarts.init(document.getElementById('lineChart'));

      // 定义时间数组和新闻热度数值数组
      const timeArray = ["2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04", "2023-01-05"];
      const hotnessArray = [10, 20, 15, 30, 25];
      const hotnessArray1 = [11, 21, 12, 37, 25];

      // 配置折线图的选项
      const options = {
        legend: {
          data: this.my_legend
        },
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
        series: this.my_series
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