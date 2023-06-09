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
          name: "发送请求",
          detail: {
            data: {
              url: "/api/post",
              method: "post",
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
              filePath:
                "blob:http://localhost:9106/ae72dc4e-3e61-437b-9179-17e0fc6d2d4d",
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
      window.cwyAppSdk.postMessage(data, {
        success: (res) => {
          this.sdkMsg = `【 ${data.action} 成功 】 ${JSON.stringify(res)}`;
          console.log(`【 ${data.action} 成功 】=> `, res);
        },
        fail: (res) => {
          this.sdkMsg = `【 ${data.action} 失败 】 ${JSON.stringify(res)}`;
          console.log(`【 ${data.action} 失败 】=> `, res);
        },
      });
    },
    handleUpload(data) {
      const chooseImgData = {
        data: {
          count: 1,
          sizeType: ["original", "compressed"],
          sourceType: ["album"],
        },
        action: "CHOOSE_IMAGE",
      };
      // 上传文件特殊处理,先选择图片再上传
      window.cwyAppSdk.postMessage(chooseImgData, {
        success: (res) => {
          console.log("选择图片成功", res);
          const uploadFileData = data;
          uploadFileData.data.filePath = res.data.data.tempFilePaths[0];
          window.cwyAppSdk.postMessage(uploadFileData, {
            success: (res) => {
              this.sdkMsg = `【 ${data.action} 成功 】 ${JSON.stringify(res)}`;
              console.log(`【 ${data.action} 成功 】=> `, res);
            },
            fail: (res) => {
              this.sdkMsg = `【 ${data.action} 失败 】 ${JSON.stringify(res)}`;
              console.log(`【 ${data.action} 失败 】=> `, res);
            },
          });
        },
        fail: (res) => {
          console.log("选择图片失败", res);
        },
      });
    },
    // 清空控制台
    clear() {
      console.clear();
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
