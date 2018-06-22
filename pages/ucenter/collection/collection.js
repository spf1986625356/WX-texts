var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

    windowHeight: 0,                           //获取屏幕高度  
    cliHeight: 0,                              //获取高度  
    collectList: [],                             //全部列表
    start: 1,           //开始数量
    perpage: 5,            //每页数量
    page: 0,//总页数
    loadMore: true,    //能否加载能多
    hidden1: true,
    dataTotal: 0,      //请求回来的数据总数


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //获取屏幕高度  
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          cliHeight: res.windowHeight
        });
      }
    });

    that.setData({
      hidden1: true,
      start: 1,
      perpage: 5,
    });
    //获取初始数据
    var start = that.data.start;
    var perpage = that.data.perpage;

    that.getUserinfo(start, perpage);
  },


  // 收藏列表
  getUserinfo: function (_start, _perpage) {
    var that = this
    var url = app.apiUrl + '/Consumer/CollectionList';
    var params = {
      start: _start,
      perpage: _perpage
    };
    console.log(_perpage);
    app.request.requestGetApi(url, params, this, function (res) {
      console.log(res);
      var perpage = that.data.perpage;
      var res = JSON.parse(decodeURIComponent(JSON.stringify(res)));     //解决乱码问题
      if (res.status == 200) {
        if (res.result != null) {
          //将获取到的用户信息存放在数组datalist中
          if (res.total <= perpage) {
            that.setData({
              collectList: res.result,
              loadMore: false,
              dataTotal: res.total,
              hidden1: false,
            })
          } else {
            that.setData({
              collectList: res.result,
              loadMore: true,
              dataTotal: res.total,
              hidden1: true,
            })
          }

        }
      }
      else {
        console.log(res.status, res.msg);
      }
    }, this.failc)
  },


  // 加载更多
  loadMore: function (e) {
    var that = this;
    if (that.data.loadMore) {
      console.log(that.data.loadMore);
      var loadMore = that.data.loadMore;
      var start = that.data.start;
      var perpage = that.data.perpage;
      var url = app.apiUrl + '/Consumer/CollectionList';
      that.FunMore(that, url, start, perpage)
    }
  },

  // 调用函数
  FunMore: function (that, url, start, perpage) {
    var start = start + 1;
    that.setData({
      start: start,
      loadMore: false,
    })
    var params = {
      start: start,
      perpage: perpage,
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
      console.log(res.result);
      console.log(res.result.length);
      if (res.result.length < that.data.perpage) {
        that.setData({
          loadMore: true,
          collectList: that.data.collectList.concat(res.result),
          hidden1: true,
        })
      } else {
        that.setData({
          loadMore: false,
          collectList: that.data.collectList.concat(res.result),
          hidden1: false,
        })
      }
    }
  },
  // 链接商品详情
  details:function(e){
    var id = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: '/pages/products/productDetails/productDetails?productId=' + id,
    })
  },


  // 删除收藏
  collectad: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      content: '是否删除收藏',
      success: function (res) {
        if (res.confirm) {
          var url = app.apiUrl + '/Consumer/CollectionDelete';
          var params = { collectionId: id }
          app.request.requestGetApi(url, params, this, function (res) {
            console.log(res);
            if (res.status == 200) {
              wx.showToast({
                title: "成功取消收藏"
              })
              var start = 1;
              var perpage = 5;
              that.getUserinfo(start, perpage);
            }
            else {
              console.log(res.status, res.msg);
            }
          }, this.failc)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  }
})
