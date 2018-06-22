// pages/ucenter/certifiedMember/application/application.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    companytop: true,//公司选项上箭头
    companybottom: false,//公司选项下箭头
    companylist: true,//公司选项
    applyList: [],       //保存表单传递的值
    comList: [],           //存储机构列表
    start: 1,             // 机构列表开始
    perpage: 10,          // 机构列表显示页面数量
    mobile: '',                // 存储手机号码
    codes: "获取验证码",     // 存储验证码按钮
    count: 60,             // 存储倒计时
    flag: true,
  },

  // 接口调用失败
  Funfail: function (res) {
    console.log(res);
  },
  onShow: function () {
    var that = this;
    var start = that.data.start;
    var perpage = that.data.perpage;
    var url = app.apiUrl + "/Supplier/BusinessList";    //调用机构列表          
    var params = {
      start: 1,
      perpage: 10,
    }
    app.request.requestGetApi(url, params, this, function (res) {
      var res = JSON.parse(decodeURIComponent(JSON.stringify(res)));
      if (res.status == 200) {
        that.setData({
          comList: res.result,
        })
      }
    }, this.Funfail)
  },
  // 失去焦点获取验证码
  blur: function (e) {
    var mobile = e.detail.value;
    var that = this;
    that.setData({
      mobile: mobile,
    })
  },
  // 获取验证码
  getTel: function (e) {
    var that = this;
    var mobile = that.data.mobile;
    var flag = that.data.flag;        // 获取按钮禁用
    var url = app.apiUrl + "/Consumer/ApplySend";    // 调用获取验证码接口
    var params = {                                   // 请求的参数
      mobile: mobile,
    }
    if (flag) {
      that.setData({
        flag: false,
      })
      // 调用网络接口
      app.request.requestPostApi(url, params, this, function (res) {
        var res = JSON.parse(decodeURIComponent(JSON.stringify(res)));   // 解决字符集问题
        if (res.status == 200) {
          console.log('发送成功');
          wx.showToast({
            title: '验证码已发送',
          });
          var mobile = that.data.mobile;
          var timer = setInterval(function () {
            var count = that.data.count - 1;
            that.setData({
              codes: count + "s" + "重新发送",
              count: count,
            })
            if (count < 1) {
              clearInterval(timer);
              that.setData({
                count: 59,
                codes: "获取验证码",
                flag: true,
              })
            } else if (res.status == 4040) {
              wx.showToast({
                title: '手机号已存在',
              })
            } else if (res.status == 2003) {
              wx.showToast({
                title: '手机号码格式错误',
              })
            } else if (res.status == 2002) {
              wx.showToast({
                title: res.msg,
              })
              console.log('请输入手机号码')
            } else {
              console.log(res.msg);
            }
          }, 1000)
        } else {
          wx.showToast({
            title: res.msg,
          })
        }
      }, this.Funfail)
    }

  },
  // 选择公司
  company: function () {
    this.setData({
      companytop: false,//公司选项上箭头
      companybottom: true,//公司选项下箭头
      companylist: false,//公司选项

    })
  },
  // 选择公司结果
  companyls: function (e) {
    var that = this;
    var cname = e.currentTarget.dataset.name;
    var id = e.currentTarget.dataset.id;
    that.setData({
      companyName: cname,
      companytop: true,//公司选项上箭头
      companybottom: false,//公司选项下箭头
      companylist: true,//公司选项
      companyId: id,
    })
  },


  // 表单提交
  apply: function (e) {
    var that = this;
    var fullname = e.detail.value.fullname;
    var mobile = e.detail.value.mobile;
    var code = e.detail.value.code;
    var company = that.data.companyId;
    var companys = e.detail.value.company;
    var url = app.apiUrl + "/Consumer/Apply";
    var params = {
      fullname: fullname,
      mobile: mobile,
      code: code,
      businessId: company,
    }
    // 调用网络接口
    app.request.requestPostApi(url, params, this, function (res) {
      var res = JSON.parse(decodeURIComponent(JSON.stringify(res)));    //修正字符集。  
      // var flags = res.status;
      if (res.status == 200) {
        wx.reLaunch({
          url: '/pages/ucenter/certifiedMember/applicationResult/applicationResult?fullname=' + fullname + '&mobile=' + mobile + '&companys=' + companys + '&flags=' + 1,
        })
      } else if (res.status == 4049) {
        console.log('无此会员')
        wx.reLaunch({
          url: '/pages/ucenter/certifiedMember/applicationResult/applicationResult?fullname=' + fullname + '&mobile=' + mobile + '&companys=' + companys + '&flags=' + 2,
        })
      } else if (res.status == 4050) {
        wx.showToast({
          title: '验证码错误',
        })
        console.log(res,'验证码错误')
      }else if(res.status ==4048){
        wx.reLaunch({
          url: '/pages/ucenter/certifiedMember/applicationResult/applicationResult?fullname=' + fullname + '&mobile=' + mobile + '&companys=' + companys + '&flags=' + 2,
        })
        console.log(res, '机构下无此会员')
        
      } else if(res.status ==4047){
        wx.reLaunch({
          url: '/pages/ucenter/certifiedMember/applicationResult/applicationResult?fullname=' + fullname + '&mobile=' + mobile + '&companys=' + companys + '&flags=' + 2,
        })
        console.log(res, '此会员已被认证为高级会员')
      }
    }, this.Funfail)
  },
})