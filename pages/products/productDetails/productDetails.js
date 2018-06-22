// pages/products/productDetails/productDetails.js
var app = getApp();
Page({

  data: {
    proList: [],      // 存储数组
    proLists: [],      // 存储用户评价
    data: [],
    total: 1,
    page: 0,
    num: 0,           // 数量默认显示
    tag: 0,           // 设置选项卡默认值
    tagValue: 0,
    productId: '',     // 商品ID
    start: 1,          // 数据从第几页开始
    perpage: 5,       // 页码显示多少个
    loadMore: true,   // 设置默认加载更多
    hidden1: true,    // 设置加载完毕提示到底
    tip: '未选',       //是否选择商品
  },

  /********  接口请求失败  **********/
  funFail: function (res) {
    console.log("failFun", res);
  },

  onLoad: function (options) {
    var that = this;
    var productId = options.productId;
    that.setData({
      productId: productId
    })
    // 获取商品信息
    var url = app.apiUrl + "/Material/ProductDetail";
    var params = { productId: productId, };
    app.request.requestGetApi(url, params, this, function (res) {
      if (res.status == 200) {
        that.setData({
          proList: res.result,
          data: res.property,
        })
      } else {
        console.log(res);
      }
    }, that.funFail)

    // 获取商品评论
    var start = that.data.start;
    var perpage = that.data.perpage;
    var urls = app.apiUrl + "/Interaction/CommentList";
    var paramsed = {
      id: productId,
      idtype: 'product',
      start: start,
      perpage: perpage
    }
    app.request.requestGetApi(urls, paramsed, this, function (res) {
      var list = res.result;
      if (res.status == 200) {
        if (list != null) {
          //转化时间戳处理
          for (var i = 0; i < list.length; i++) {
            list[i].dateline = app.toDate(list[i].dateline, 'data');
          }

        }
        if (res.result.length < that.data.perpage)
          that.setData({
            loadMore: false,
            proLists: list,
            hidden1: false,
          })
        else {
          that.setData({
            loadMore: true,
            proLists: list,
            hidden1: true,
          })
        }
        console.log("proLists", that.data.proLists);
      } else {
        console.log(res);
      }
    }, this.funFail)

    //检测是否收藏
    that.getCellect();

    //获取屏幕高度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight
        })
      },
    })
  },

  //检测是否收藏
  getCellect: function () {
    var that = this;
    var productId = that.data.productId;
    var url_collect = app.apiUrl + "/Consumer/CollectionChecked";
    var params_collect = { id: productId, idtype: 'product' }
    app.request.requestGetApi(url_collect, params_collect, that, function (res) {
      console.log(res);
      if (res.status == 200) {
        that.setData({
          collectId: res.result.collection_identity,
        })
      } else {
        console.log(res);
      }
    }, that.funFail)
  },

  //点击 收藏 按钮
  collect: function () {
    var that = this;
    var collectId = that.data.collectId;
    var productId = that.data.productId;
    if (collectId) {
      var url_collect = app.apiUrl + "/Consumer/CollectionDelete";
      var params_collect = { collectionId: collectId, }
    } else {
      var url_collect = app.apiUrl + "/Consumer/CollectionAdd";
      var params_collect = { id: productId, idtype: 'product' }
    }
    app.request.requestGetApi(url_collect, params_collect, that, function (res) {
      console.log(res);
      if (res.status == 200) {
        that.getCellect();
      } else {
        console.log(res);
      }
    }, that.funFail)
  },

  // 商品选项卡
  radioTab: function (e) {
    var that = this;
    var num = e.currentTarget.dataset.num;          //当前规格的属性id
    var id = e.currentTarget.dataset.id;            //当前规格的id
    var flag = e.currentTarget.dataset.flag;            //当前规格的id
    var list = that.data.data;
    var select = that.data.select;

    var data = '';
    for (var i = 0; i < list.length; i++) {
      if (list.hasOwnProperty(flag)) {
        if (num == list[i].identity) {
          list[i].type = id;
        }
      }
    }
    that.setData({
      data: list,
      select: id,
      tip: "已选"
    })
  },

  // 数量减
  bindJian: function (e) {
    var that = this;
    var num = that.data.num;
    if (num > 0) {
      num--;
    }
    var minusStatus = num <= 0 ? 'disabled' : 'normal'
    that.setData({
      num: num,
      minusStatus: minusStatus,
    })
  },

  // 数量加
  bindJia: function (e) {
    var that = this;
    var num = that.data.num;
    num++;
    var minusStatus = num < 0 ? 'disabled' : 'normal'
    that.setData({
      num: num,
      minusStatus: minusStatus,
    })
  },

  // 加载更多
  loadMore: function (e) {
    var that = this;
    if (that.data.loadMore) {
      console.log(that.data.loadMore);
      var loadMore = that.data.loadMore;
      var start = that.data.start;
      var perpage = that.data.perpage;
      var url = app.apiUrl + "/Interaction/CommentList";
      that.FunMore(that, url, start, perpage)
    }
  },

  // 调用函数
  FunMore: function (that, url, start, perpage) {
    var start = start + 1;
    var productId = that.data.productId;
    that.setData({
      start: start,
      loadMore: false,
    })
    var params = {
      id: productId,
      idtype: 'product',
      start: start,
      perpage: perpage
    }
    wx.showToast({
      title: '加载更多',
      icon: 'loading',
      duration: 500,
    })
    app.request.requestPostApi(url, params, this, function (res) {
      if (res.status == 200) {
        if (res.result != null) {
          if (res.result.length < that.data.perpage) {
            console.log(11111);
            that.setData({
              loadMore: true,
              proLists: that.data.proLists.concat(res.result),
              hidden1: true,
            })
          } else {
            console.log(3333);
            that.setData({
              loadMore: false,
              proLists: that.data.proLists.concat(res.result),
              hidden1: false,
            })
          }
        } else {
          that.setData({
            loadMore: false,
            gifLists: that.data.gifLists.concat(res.result),
            hidden1: false,
          })
        }
      }
    }, that.funFail)
  },

  //点击 添加购物车 按钮
  proBtn: function (e) {
    var that = this;
    var id = that.data.productId;
    var num = that.data.num;
    var list = that.data.data;
    var flag = true;
    for (var i = 0; i < list.length; i++) {
      if (list[i].type == 0) {
        flag = false;
        break;
      }
    }
    if (!flag) {
      wx.showToast({
        title: '请选择商品属性',
      })
    } else if (num == 0) {
      wx.showToast({
        title: '请选择商品数量',
      })
    } else {
      //加入购物车数据请求
      var url = app.apiUrl + "/Market/ShoppingSave";

      var params = {
        id: id,
        quantity: num,
        idtype: "product",
        univalent: that.data.proList.univalent,
      }
      var data = that.data.data;
      console.log(data);
      var paramsx = JSON.stringify(params);
      console.log(paramsx);

      for (var i = 0; i < list.length; i++) {
        paramsx += ",property[" + i + "]:" + data[i].type;
      }
      console.log(paramsx);
      paramsx = paramsx.replace('},', ',');
      console.log(paramsx)
      paramsx = paramsx.replace(/,p/g, ',"p');
      console.log(paramsx)
      paramsx = paramsx.replace(/]:/g, ']":');
      console.log(paramsx)
      paramsx = paramsx.replace(/":'/g, '":"');
      console.log(paramsx)
      paramsx = paramsx.replace(/',"/g, '","');
      console.log(paramsx)
      paramsx = paramsx + "}";
      console.log(paramsx)
      paramsx = paramsx.replace(/'}/g, '"}');
      console.log(paramsx)
      params = JSON.parse(paramsx);
      console.log("params", params);

      // 网络接口
      app.request.requestPostApi(url, params, that, function (res) {
        console.log(res);
        if (res.status == 200) {
          wx.showToast({
            title: '加入成功',
          })
          // setTimeout(function () {
          //   wx.reLaunch({
          //     url: '/pages/shopping/cart/cart',
          //   })
          // }, 1000);
        }
      }, that.funFail)
    }
  },

  //点击 立即购买 按钮
  proBuy: function (e) {
    var that = this;
    var id = that.data.productId;
    var num = that.data.num;
    var list = that.data.data;
    var flag = true;
    for (var i = 0; i < list.length; i++) {
      if (list[i].type == 0) {
        flag = false;
        break;
      }
    }

    if (!flag) {
      wx.showToast({
        title: '请选择商品属性',
      })
    } else if (num == 0) {
      wx.showToast({
        title: '请选择商品数量',
      })
    } else {
      //加入购物车数据请求
      var url = app.apiUrl + "/Market/ShoppingSave";
      var params = {
        id: id,
        quantity: num,
        idtype: "product",
        univalent: that.data.proList.univalent,
        status: 1
      }

      //重组字符串
      var data = that.data.data;
      var paramsx = JSON.stringify(params);

      for (var i = 0; i < list.length; i++) {
        paramsx += ",property[" + i + "]:" + data[i].type;
      }
      console.log(paramsx);
      paramsx = paramsx.replace('},', ',');
      console.log(paramsx)
      paramsx = paramsx.replace(/,p/g, ',"p');
      console.log(paramsx)
      paramsx = paramsx.replace(/]:/g, ']":');
      console.log(paramsx)
      paramsx = paramsx.replace(/":'/g, '":"');
      console.log(paramsx)
      paramsx = paramsx.replace(/',"/g, '","');
      console.log(paramsx)
      paramsx = paramsx + "}";
      console.log(paramsx)
      paramsx = paramsx.replace(/'}/g, '"}');
      console.log(paramsx)
      params = JSON.parse(paramsx);
      console.log("params", params);

      // 网络接口
      app.request.requestPostApi(url, params, that, function (res) {
        console.log(res);
        if (res.status == 200) {
          // wx.showToast({
          //   title: '加入成功',
          // })
          var orderddId = res.orderddIdentity;
          // setTimeout(function () {
            wx.navigateTo({
              url: '/pages/shopping/order/order?orderddId=' + orderddId,
            })
          // }, 1000);
        }
      }, that.funFail)
    }
  },
})
