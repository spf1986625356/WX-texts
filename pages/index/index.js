//获取应用实例
var app = getApp()

Page({
  data: {
    catalogueId: "",
    start: 1,               // 从第几页开始
    perpage: 10,            // 一页显示多少数据
    popList: [],            // 存储首页广告图数组
    popLists: [],           // 存储礼包区域数据
    popListe: [],           //  存储公告栏
    loadMore: true,         // 设置默认加载更多
    hidden1: true,          // 设置加载完毕提示到底
  },

  // 获取广告图
  onLoad: function (catalogueId) {
    var that = this;
    var url = app.apiUrl + "/Popularize/BlackboardList";
    var params = {};
    that.botDe()
    // 网络请求 接口 传递 参数
    app.request.requestGetApi(url, params, this, this.adventSuccess, this.adventFail)

    // 获取公告
    var that = this;
    var urlnotice = app.apiUrl + "/Message/NoticeList"; // 获取公告列表
    var params = {};

    // 网络请求 接口
    app.request.requestGetApi(urlnotice, params, this, this.noticeSuccess, this.adventFail)
  },

  //  获取广告图成功函数
  adventSuccess: function (res) {
    var that = this;
    if (res.status == 200) {
      // 将数据缓存
      that.setData({
        popList: res.result,
      })
    } else {
      console.log(res);
      console.log('返回的值不是200')
    }
  },

  // 获取公告栏
  noticeSuccess: function (res) {
    var that = this;
    if (res.status == 200) {
      that.setData({
        popListe: res.result,
      })
    } else {
      console.log(res);
    }
    console.log(that.data.popList);
  },


  // 获取屏幕高度
  onShow: function (e) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
        })
      },
    })
    that.botDe();
  },


  // 获取数据
  botDe: function (e) {
    var that = this;
    var start = that.data.start;
    var perpage = that.data.perpage;
    var catalogueId = that.data.catalogueId;
    var url = app.apiUrl + "/Material/ProductList";
    var params = {
      catalogueId: 1,
      start: start,
      perpage: perpage,
    }
    // 网络请求
    app.request.requestPostApi(url, params, this, this.gitSuccess, this.gitFail)
  },
  // 回调函数
  gitSuccess: function (res) {
    var that = this;
    var perpage = that.data.perpage;
    var catalogueId = res.result;
    var start;
    if (res.status == 200) {
      if (res.result != null) {
        if (res.result.length < that.data.perpage)
          that.setData({
            loadMore: false,
            popLists: res.result,
            hidden1: false,
          })
        else {
          that.setData({
            loadMore: true,
            popLists: res.result,
            hidden1: true,
          })
        }
      } else {
        that.setData({
          popLists:res.result,
        })
        console.log(res);
      }
      console.log(that.data.popLists);
    }
  },

  // 加载更多
  loadMore: function (e) {
    var that = this;
    if (that.data.loadMore) {
      var loadMore = that.data.loadMore;
      var start = that.data.start;
      var perpage = that.data.perpage;
      var url = app.apiUrl + '/Material/ProductList';
      that.FunMore(that, url, start, perpage)
    }
  },

  // 调用函数
  FunMore: function (that, url, start, perpage) {
    var start = start + 1;
    // 加载更多以后 loadMore:false 关闭开关 防止请求多次
    that.setData({
      start: start,
      loadMore: false,
    })
    var params = {
      start: start,
      perpage: perpage,
      catalogueId: 1,  // 传递分类名 以防数据有多种类型
    } // 请求的参数
    wx.showToast({
      title: '加载更多',
      icon: 'loading',
      duration: 500,
    })
    app.request.requestGetApi(url, params, this, this.giftSuccess, this.adventFail)
  },
  // FunMore 回调函数
  giftSuccess: function (res) {
    var that = this;
    if (res.status == 200) {
      if (res.result.length < that.data.perpage) {
        that.setData({
          loadMore: false,
          popLists: that.data.popLists.concat(res.result),
          hidden1: false,
        })
      } else {
        that.setData({	
          loadMore: true,
          popLists: that.data.popLists.concat(res.result),
          hidden1: true,
        })
      }
    }
  },
  // 广告图跳转
  wncBoard: function (e) {
    var id = e.currentTarget.id;
    var catalogue_identity = e.currentTarget.dataset.text;
    console.log(e);
    if (catalogue_identity == 1) {
      wx.navigateTo({
        url: '/pages/products/giftDetails/giftDetails?productId=' + id,
      })
    } else if (catalogue_identity == 0) {
      wx.navigateTo({
        url: '/pages/products/productDetails/productDetails?productId=' + id,
      })
    }

  },

  // 全部商品按钮
  allBtn: function (e) {
    var productId = e.target.dataset.id;
    wx.navigateTo({
      url: '/pages/products/productList/productList',
    })
  },

  // 券票兑换按钮
  ticketBtn: function (e) {
    wx.navigateTo({
      url: '/pages/ticket/ticketExchange/ticketExchange',
    })
  },

  // 加入购物车按钮
  joinCart: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var univalent = e.target.dataset.text;
    console.log(e);
    var url = app.apiUrl + "/Market/ShoppingSave";
    var params = {
      id: id,
      univalent: univalent,
    }
    // 网络接口
    app.request.requestPostApi(url, params, this, this.successJoin, this.failJoin)
  },
  // 成功回调函数
  successJoin: function (res) {
    var that = this;
    var id = res.result;
    if (res.status == 200) {
      wx.showToast({
        title: '加入成功',
        icon:'success',
        duration:1000,
      })
      console.log(res,'加入成功')
    } else {
      console.log(res);
    }

  },

  // 跳转到商品详情页
  joinDetail: function (e) {
    var that = this;
    var productId = e.target.dataset.id;
    wx.navigateTo({
      url: '/pages/products/giftDetails/giftDetails?productId=' + productId
    })
  },

  // 失败
  gitFail: function () { console.log('git' + '失败') },
  adventFail: function () { console.log('advent' + '回调函数失败') },
  failJoin: function () { console.log('failJoin' + '失败') }
})
