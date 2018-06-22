// pages/ucenter/addressList/addressEdit/addressEdit.js
const app = getApp();
var address = require('../../../../res/city.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hidden: true,
    region: [],
    addressDetails:[],//收货地址详情
    pca: '',//地区
    province: '',// 省
    city: '',// 市 
    area: '',//区
    contactId: '',//地址id
    defaultChecked: '',//默认状态是否选中
    selected: '',//默认状态的值
    value: [0, 0, 0],
    provinces: [],  //provinces:所有省份
    citys: [],      //citys选择省对应的所有市
    areas: [],      //areas选择市对应的所有区
    cityId:'',//城市id
  },

  // 进入页面初次加载
  onLoad: function (options) {
    var that = this;
    if (options.hasOwnProperty("contactId")) {
      var contactId = options.contactId;
      var params = {
        contactId: contactId,
      };
      var url = app.apiUrl + '/Customer/ContactDetail';
      app.request.requestGetApi(url, params, this, function (res) {
        var res = JSON.parse(decodeURIComponent(JSON.stringify(res)));
        if (res.status == 200) {
          if (res.result.selected == 0) {
            var defaultChecked = true
          }
          console.log(res.result)
          that.setData({
            contactId: res.result.identity,
            fullname: res.result.fullname,
            telephone: res.result.telephone,
            pca: res.district[0].fullname + " " + res.district[1].fullname + " " + res.district[2].fullname,
            address: res.result.address,
            defaultChecked: defaultChecked,
            cityId: res.district[1].identity
          })
        } else {
          console.log(res.msg)
        }
      }, this.failAdde)  //路径，参数，this，成功函数，失败函数
    }
    else {
      var contactId = 0
    }
    console.log(contactId)
    that.setData({
      contactId: contactId
    })

    // 初始化动画变量
    var animation = wx.createAnimation({
      duration: 500,
      transformOrigin: "50% 50%",
      timingFunction: 'ease',
    })

    this.animation = animation;

    // 默认联动显示北京
    var id = address.provinces[0].id
    this.setData({
      provinces: address.provinces,
      citys: address.citys[id],
      areas: address.areas[address.citys[id][0].id],
    });



    //表单验证规则
    this.WxValidate = app.wxValidate({
      fullname: {
        required: true,
        minlength: 2,
        maxlength: 10,
      },
      telephone: {
        required: true,
        tel: true,
      },
      pca: {
        required: true,
      },
      address: {
        required: true,
        minlength: 2,
        maxlength: 100,
      },
    },
      {
        fullname: {
          required: '您填写的姓名格式错误',
        },
        telephone: {
          required: '您填写的联系方式错误',
        },
        pca: {
          required: '请选择收货地区',
        },
        address: {
          required: '请输入详细收货地址',
        },
      })


  },




  // 修改地址管理获取的地址信息
  successAdde: function (res) {
    var that = this;
    var res = JSON.parse(decodeURIComponent(JSON.stringify(res)));
    if (res.status == 200) {
      if (res.result.selected == 0) {
        var defaultChecked = true
      }
      that.setData({
        contactId: contactId,
        fullname: fullname,
        telephone: telephone,
        pca: province + "," + city + "," + area,
        address: address,
        defaultChecked: defaultChecked
      })
    } else {
      console.log(res.msg)
    }
  },


  // 点击所在地区弹出选择框
  selectDistrict: function (e) {
    var that = this
    if (that.data.addressMenuIsShow) {
      return
    }
    that.startAddressAnimation(true)
  },
  // 执行动画
  startAddressAnimation: function (isShow) {
    console.log(isShow)
    var that = this
    if (isShow) {
      that.animation.translateY(0 + 'vh').step()
    } else {
      that.animation.translateY(40 + 'vh').step()
    }
    that.setData({
      animationAddressMenu: that.animation.export(),
      addressMenuIsShow: isShow,
    })
  },
  // 点击地区选择取消按钮
  cityCancel: function (e) {
    this.startAddressAnimation(false)
  },
  // 点击地区选择确定按钮
  citySure: function (e) {
    console.log(222);
    var that = this
    var city = that.data.city
    var value = that.data.value
    that.startAddressAnimation(false)
    // 将选择的城市信息显示到输入框
    var areaInfo = that.data.provinces[value[0]].name + ' ' + that.data.citys[value[1]].name + ' ' + that.data.areas[value[2]].name
    that.setData({
      pca: areaInfo,
      cityId: that.data.areas[value[2]].id,
    })
  },
  hideCitySelected: function (e) {
    this.startAddressAnimation(false)
  },
  // 处理省市县联动逻辑
  cityChange: function (e) {
    var value = e.detail.value
    var provinces = this.data.provinces
    var citys = this.data.citys
    var areas = this.data.areas
    var provinceNum = value[0]
    var cityNum = value[1]
    var countyNum = value[2]
    if (this.data.value[0] != provinceNum) {
      var id = provinces[provinceNum].id
      this.setData({
        value: [provinceNum, 0, 0],
        citys: address.citys[id],
        areas: address.areas[address.citys[id][0].id],
      })
    } else if (this.data.value[1] != cityNum) {
      var id = citys[cityNum].id
      this.setData({
        value: [provinceNum, cityNum, 0],
        areas: address.areas[citys[cityNum].id],
      })
    } else {
      this.setData({
        value: [provinceNum, cityNum, countyNum]
      })
    }
  },
  // 编辑地址
  addreform: function (e) {
    var that = this;
    var formData = e.detail.value;
    console.log(formData);
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0]
      wx.showToast({
        title: `${error.msg} `,
        duration: 2000
      })
    } else {
      console.log(formData);
      var fullname = formData.fullname;
      var telephone = formData.telephone;
      var district_identity = that.data.cityId;
      var address = formData.address;
      var selected = formData.selected;
      if (selected == "") {
        var delu = 1
      }
      else {
        var delu = 0
      }
      console.log(that.data.contactId);
      if (that.data.contactId == 0) {
        var params = {
          fullname: fullname,
          telephone: telephone,
          district_identity: district_identity,
          address: address,
          selected: delu
        };
        var url = app.apiUrl + '/Customer/ContactSave';
        app.request.requestPostApi(url, params, this, this.successAdd, this.failAdd)  //路径，参数，this，成功函数，失败函数

      }
      else {
        var id = that.data.contactId;
        var params = {
          contactId: id,
          "property[fullname]": fullname,
          "property[telephone]": telephone,
          "property[district_identity]": district_identity,
          "property[address]": address,
          "property[selected]": delu
        };

        var url = app.apiUrl + '/Customer/ContactChange';
        app.request.requestPostApi(url, params, this, this.successEdit, this.failEdit)  //路径，参数，this，成功函数，失败函数
      }
    }
  },
  // 新增地址的反馈
  successAdd: function (res) {
    var that = this;
    var res = JSON.parse(decodeURIComponent(JSON.stringify(res)));
    if (res.status == 200) {
      wx.showToast({
        title: '新增成功',
      })
      wx.reLaunch({
        url: '/pages/ucenter/addressList/addressList/addressList',
      })
    } else {
      console.log(res.msg)
    }
  },
  // 编辑地址的反馈
  successEdit: function (res) {
    var that = this;
    var res = JSON.parse(decodeURIComponent(JSON.stringify(res)));
    if (res.status == 200) {
      wx.showToast({
        title: '修改成功',
      })
      wx.reLaunch({
        url: '/pages/ucenter/addressList/addressList/addressList',
      })
    } else if (res.status == 404) {
      console.log("收货地址不存在")
    }
    else {
      console.log(res.msg)
    }
  },
  //删除地址
  del: function (e) {
    console.log(e.currentTarget.id);
    var id = e.currentTarget.id;
    wx.showModal({
      content: '是否确定删除该地址',
      success: function (res) {
        if (res.confirm) {
          var del = app.apiUrl + '/Customer/ContactDelete';
          var del_params = { contactId: id };
          app.request.requestPostApi(del, del_params, this, function (res) {
            console.log(res);
            console.log(res.status);
            if (res.status == 200) {
              wx.showToast({
                title: '删除成功',
              })
              //验证成功--跳转
              wx.reLaunch({
                url: '/pages/ucenter/addressList/addressList/addressList',
              })
            } else {
              console.log(res.msg);
            }
          }, this.failFun)
        }
      }
    })
  }
})