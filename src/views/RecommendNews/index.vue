<template>
  <div>
    <table>
      <thead>
      <tr>
        <th>User ID</th>
        <th>News ID</th>
        <th>Start Time</th>
        <th>Duration (s)</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="log in logs" :key="log[0] + '-' + log[1]">
        <td>{{ log[0] }}</td>
        <td>{{ log[1] }}</td>
        <td>{{ log[2] }}</td>
        <td>{{ log[3] }}</td>
      </tr>
      </tbody>
    </table>

    <h2>最近阅读的新闻</h2>
    <form @submit.prevent="handleGetNewsIds" class="news-form">
      <label for="user_id">用户 ID：</label>
      <input type="text" id="user_id" v-model="userId" placeholder="请输入用户 ID">
      <button type="submit">获取新闻 ID</button>
    </form>
    <table>
      <thead>
      <tr>
        <th>新闻 ID</th>
        <th>主题</th>
        <th>标题</th>
        <th>分类</th>
        <th>点击时间</th>
        <th>查看时间</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="news in newsList" :key="news.news_id">
        <td>{{ news.news_id }}</td>
        <td>{{ news.topic }}</td>
        <td>{{ news.headline }}</td>
        <td>{{ news.category }}</td>
        <td>{{ news.start_dt }}</td>
        <td>{{ news.duration }}</td>
      </tr>
      </tbody>
    </table>
    <div ref="pieChart" style="width: 100%; height: 400px;"></div>
    <h2>推荐新闻</h2>
    <table>
      <thead>
      <tr>
        <th>新闻 ID</th>
        <th>主题</th>
        <th>标题</th>
        <th>分类</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="news in recList" :key="news.news_id">
        <td>{{ news.news_id }}</td>
        <td>{{ news.topic }}</td>
        <td>{{ news.headline }}</td>
        <td>{{ news.category }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import io from 'socket.io-client';
import * as echarts from "echarts";

export default {
  data() {
    return {
      userId: '',
      newsList: [],
      recList: [],
      logs: [], // 存储实时日志
      socket: null // SocketIO 客户端实例
    };
  },
  mounted() {
    this.socket = io('http://47.101.216.242:5000');
    this.socket.on('update', this.handleUpdate);
    this.socket.on('news_ids', this.handleNewsIds);
    // 监听后端发送过来的 recommendations 事件
    // this.socket.on('recommendations', this.handleRecommendations);
    this.startInterval(); // 启动定时器操作
  },
  beforeDestroy() {
    this.socket.disconnect();
    this.stopInterval(); // 停止定时器操作
    this.socket.disconnect(); // 断开与后端的 socket.io 连接
  },
  methods: {
    startInterval() {
      this.intervalId = setInterval(() => {
        this.socket.emit('update'); // 每隔 2 秒钟向后端发送 update 信号
      }, 2000);
    },
    stopInterval() {
      clearInterval(this.intervalId); // 停止定时器操作
    },
    handleUpdate(logs) {
      // console.log(logs)
      this.logs = logs;
    },
    handleGetNewsIds() {
      this.socket.emit('get_news_ids', this.userId);
    },
    handleNewsIds(data) {
      if (data.user_id === this.userId) {
        this.newsList = data.news_list;
        this.recList = data.rec_list;
        this.drawPieChart()
      }
    },
    drawPieChart() {
      let categories = [...new Set(this.newsList.map(news => news.category))]
      let data = categories.map(category => {
        let count = this.newsList.filter(news => news.category === category).length
        return { name: category, value: count }
      })
      let chart = echarts.init(this.$refs.pieChart)
      let options = {
        title: {
          text: '用户的兴趣种类饼状图'
        },
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {d}%'
        },
        series: [{
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data,
          label: {
            formatter: '{b}: {d}%'
          }
        }]
      }
      chart.setOption(options)
    },

  }
}
</script>

<style>
table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

th + th, td + td {
  padding-left: 20px;
}
</style>
