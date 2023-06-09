<template>
  <el-card>
    <h1>Software Engineering Business Intelligence, Tongji University, 2023</h1>
    <h2>项目介绍</h2>
    <p>
      本项目是一个基于PENS数据集的新闻实时动态变化分析系统。通过模拟PENS中的新闻曝光日志，我们可以构建模拟日志产生程序，并通过Flume框架采集产生的曝光日志。经过ETL处理后，数据将被存储到定义的存储系统中，并为前端的数据提供高性能的查询服务，以实现针对新闻动态变化的检索和推荐，并进行合理的可视化展示。本项目旨在为PENS数据提供新闻话题实时动态变化分析、新闻历史/实时统计、新闻话题推荐等功能，并通过各种优化点对系统进行优化，提高系统的性能和稳定性。
    </p>
  </el-card>
</template>

<script>
export default {
  name: "Dashboard",
};
</script>
