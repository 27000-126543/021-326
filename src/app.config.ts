export default defineAppConfig({
  pages: [
    'pages/pending/index',
    'pages/verify/index',
    'pages/records/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/audit/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1e5eff',
    navigationBarTitleText: '停窝工索赔审核',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#1E5EFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/pending/index',
        text: '待审事件'
      },
      {
        pagePath: 'pages/verify/index',
        text: '现场核验'
      },
      {
        pagePath: 'pages/records/index',
        text: '已审记录'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
