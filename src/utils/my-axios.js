import axios from "axios";
import { Message } from "element-ui";
import request from "@/utils/request";

let BASE_URL = "http://47.101.216.242:5000/";
// let BASE_URL = "http://127.0.0.1:5000/";
// let BASE_URL = "http://127.0.0.1:4523/m1/2785405-0-default/";

// create an axios instance
const my_axios = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, // request timeout
});

// request interceptor
my_axios.interceptors.request.use(
  (config) => {
    // do something before request is sent
    console.log(config)
    return config;
  },
  (error) => {
    // do something with request error
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// response interceptor
my_axios.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    const res = response.data;
    console.log(res);
    return res;
  },
  (error) => {
    console.log("err" + error); // for debug
    Message({
      message: error.message,
      type: "error",
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);

export default my_axios;
