export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/index/index',
    'pages/upload/index',
    'pages/report/index',
    'pages/tutor/index',
    'pages/feedback/index',
    'pages/complete/index',
    'pages/archive/index',
    'pages/study/index',
    'pages/profile/index',
  ],
  tabBar: {
    color: '#999999',
    selectedColor: '#4F6EF7',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/tab-home.png',
        selectedIconPath: 'assets/tab-home-active.png',
      },
      {
        pagePath: 'pages/study/index',
        text: '学情',
        iconPath: 'assets/tab-study.png',
        selectedIconPath: 'assets/tab-study-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tab-profile.png',
        selectedIconPath: 'assets/tab-profile-active.png',
      },
    ],
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4F6EF7',
    navigationBarTitleText: '智思家长AI',
    navigationBarTextStyle: 'white',
  },
})
