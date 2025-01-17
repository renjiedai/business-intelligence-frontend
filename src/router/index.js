import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

/* Layout */
import Layout from "@/layout";

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: "/login",
    component: () => import("@/views/login/index"),
    hidden: true,
  },

  {
    path: "/404",
    component: () => import("@/views/404"),
    hidden: true,
  },

  {
    path: "/",
    component: Layout,
    redirect: "/Dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/Dashboard/index"),
        meta: { title: "介绍", icon: "dashboard" },
      },
    ],
  },

  // {
  //   path: "/test",
  //   component: Layout,
  //   redirect: "/my-test",
  //   meta: { title: "测试" },
  //   children: [
  //     {
  //       path: "/my-test",
  //       component: () => import("@/views/test"),
  //       name: "Test",
  //       meta: { title: "我的测试" },
  //     },
  //   ],
  // },

  {
    path: "/search",
    component: Layout,
    meta: { title: "查询", icon: "search" },
    redirect: "/search-single-news",
    children: [
      {
        path: "/search-single-news",
        component: () => import("@/views/SearchSingleNews/index"),
        name: "SearchSingleNews",
        meta: { title: "单条新闻查询" },
      },
      {
        path: "/search-news-by-topic",
        component: () => import("@/views/SearchNewsByTopic/index"),
        name: "SearchNewsByTopic",
        meta: { title: "新闻种类变化查询" },
      },
      {
        path: "/statistical-query-on-interests",
        component: () => import("@/views/StatisticalQueryOnInterests/index"),
        name: "StatisticalQueryOnInterests",
        meta: { title: "兴趣变化统计查询" },
      },
      {
        path: "/complex-search",
        component: () => import("@/views/ComplexSearch/index"),
        name: "ComplexSearch",
        meta: { title: "组合查询" },
      },
      {
        path: "/recommend-news",
        component: () => import("@/views/RecommendNews/index"),
        name: "RecommendNews",
        meta: { title: "实时新闻推荐" },
      }

    ],
  },

  // 404 page must be placed at the end !!!
  { path: "*", redirect: "/404", hidden: true },
];

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes,
  });

const router = createRouter();

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
