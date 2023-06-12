/* api调用示例 */
<template>
  <div class="sdk-use-template-wrapper">
    <h3>api调用按钮</h3>
    <div class="btn-wrapper">
      <div v-for="temp in tempList" :key="temp.name">
        <button @click="runSdk(temp.detail)">{{ temp.name }}</button>
      </div>
    </div>
    <div class="sdk-msg">
      <h3>SDK回调信息</h3>
      <button @click="reload">重新加载</button>
      <br />
      <button @click="clear">清空控制台</button>
      {{ sdkMsg }}
    </div>
  </div>
</template>

<script>
export default {
  name: "SdkUseTemplate",
  data() {
    return {
      sdkMsg: "",
      tempList: [
        {
          name: "获取用户信息",
          detail: {
            data: "",
            action: "USER_INFO",
          },
        },
        {
          name: "获取ENV",
          detail: {
            data: "",
            action: "ENV",
          },
        },
        {
          name: "发送请求",
          detail: {
            data: {
              url: "a/amar/billconfig/theme/get/default",
              method: "get",
              data: {
                msg: "请求携带的参数",
              },
              contentType: "",
              ip: "",
            },
            action: "REQUEST",
          },
        },
        {
          name: "上传文件",
          detail: {
            data: {
              url: "/api/upload",
              filePath: "",
              name: "文件名",
              formData: {},
              ip: "",
            },
            action: "UPLOAD_FILE",
          },
        },
        {
          name: "选择图片",
          detail: {
            data: {
              count: 1,
              sizeType: ["original", "compressed"],
              sourceType: ["album"],
            },
            action: "CHOOSE_IMAGE",
          },
        },
        {
          name: "不存在的api",
          detail: {
            data: {},
            action: "UNKNOWN_API",
          },
        },
      ],
    };
  },
  methods: {
    // sdk调用
    runSdk(data) {
      if (data.action === "UPLOAD_FILE") {
        this.handleUpload(data);
        return;
      }
      window.cwyAppSdk.postMessage({
        ...data,
        success: (res) => {
          console.log(`${data.action} success`, res);
        },
        fail: (res) => {
          console.log(`${data.action} fail`, res);
        },
      });
    },
    handleUpload(data) {
      // 上传文件特殊处理,先选择图片再上传
      window.cwyAppSdk.postMessage({
        action: "CHOOSE_IMAGE",
        data: {
          count: 1,
          sizeType: ["original", "compressed"],
          sourceType: ["album"],
        },
        success: (res) => {
          console.log("CHOOSE_IMAGE success", res);
          window.cwyAppSdk.postMessage({
            ...data,
            data: {
              ...data.data,
              filePath: res.data.data.tempFilePaths[0],
            },
            success: (res) => {
              console.log(`${data.action} success`, res);
            },
            fail: (res) => {
              console.log(`${data.action} fail`, res);
            },
          });
        },
        fail: (res) => {
          console.log("CHOOSE_IMAGE fail", res);
        },
      });
    },
    // 清空控制台
    clear() {
      console.clear();
    },
    reload() {
      window.location.reload();
    },
  },
  mounted() {},
};
</script>
<style>
.btn-wrapper div {
  margin: 10px;
}
.sdk-msg {
  margin-top: 10px;
}
</style>
