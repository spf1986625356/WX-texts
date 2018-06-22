// pages/ticket/ticketExchange/ticketExchange.js
//获取应用实例
var app = getApp();

Page({
  data: {
    flag: 1,
    flagList: [],
    hidden1: true,
    hidden2: false,
  },

  onLoad: function (options) {

  },

  /*接口请求失败*/
  Funfail: function (res) {
    console.log('failFun', res);
  },

  //点击确认兑换
  sure: function (e) {
    var that = this;
    var code = e.detail.value.code;
    var flag = that.data.flag;
    var url = app.apiUrl + "/Coupon/TicketCheck";
    var params = { code: code, };

    // 请求网络接口
    app.request.requestGetApi(url, params, this, function (res) {
      var res = JSON.parse(decodeURIComponent(JSON.stringify(res)));     //解决乱码问题
      var code = res.result;
      var flag = res.result;
      if (res.status == 200) {
        var flag = 5;
        that.setData({
          flag: flag,
          flagList: res.result,
          hidden1: false,
          hidden2: true,
        })
        // 兑换失败次数到三次
      } else if (res.status == 4012) {
        var flag = 6;
        that.setData({
          flag: flag,
          hidden1: false,
          hidden2: true,

        })
        // 填写错误提示剩余2次
      }else if (res.status == 4010) {
        var flag = 1;
        that.setData({
          flag: flag,
          hidden1: false,
          hidden2: true,
        })
        // 填写错误提示剩余1次
      } else if (res.status == 4011) {
        var flag = 2;
        that.setData({
          flag: flag,
          hidden1: false,
          hidden2: true,
        })
        // 已被兑换提示剩余2次
      } else if (res.status == 4020) {
        var flag = 3;
        that.setData({
          flag: flag,
          hidden1: false,
          hidden2: true,
        })
        // 已被兑换提示剩余1次
      } else if (res.status == 4021) {
        var flag = 4;
        that.setData({
          flag: flag,
          hidden1: false,
          hidden2: true,
        })
      }else if(code == null) {
        wx.showToast({
          title: '请输入兑换码',
          icon:'loading',
          duration: 1000,
        })
      }
      console.log("数组", that.data.flagList)
      console.log("flag值", that.data.flag)
    }, this.Funfail)
  },

  //点击 返回首页 按钮
  back: function () {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  //点击 钱包余额 按钮
  wallet: function () {
    wx.reLaunch({
      url: '/pages/ucenter/wallet/wallet',
    })
  },

  //点击 我的礼包 按钮
  pakege: function () {
    wx.reLaunch({
      url: '/pages/ucenter/package/packageList/packageList',
    })
  },

  //点击 重新填写 按钮
  navBack: function () {
    wx.navigateTo({
      url: '/pages/ticket/ticketExchange/ticketExchange',
    })
  }
})

//时间戳转换时间  
function toDate(number) {
  var n = number * 1000;
  var date = new Date(n);
  var Y = date.getFullYear() + '/';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/';
  var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  return (Y + M + D)
}  