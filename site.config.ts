import { defineSiteConfig } from 'valaxy'


export default defineSiteConfig({
  url: 'https://blog.blueg.top/',
  lang: 'zh-CN',
  title: "BlueGlassBlock's Blog",
  subtitle: 'Think and build more.',
  description: 'A blog focusing on code & craft',

  author: {
    email: 'self@blueg.top',
    name: 'BlueGlassBlock',
    avatar: '/avatar.jpg',
    status: {
      emoji: '📚',
      message: 'Learning to build'
    }
  },
  favicon: 'favicon.png',
  social: [
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
    {
      name: 'GitHub',
      link: 'https://github.com/BlueGlassBlock',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
    {
      name: '哔哩哔哩',
      link: 'https://space.bilibili.com/62021739',
      icon: 'i-ri-bilibili-line',
      color: '#FF8EB3',
    },
    {
      name: 'Twitter',
      link: 'https://twitter.com/BlueGlassBlock',
      icon: 'i-ri-twitter-line',
      color: '#1da1f2',
    },
    {
      name: 'E-Mail',
      link: 'mailto:self@blueg.top',
      icon: 'i-ri-mail-line',
      color: '#8E71C1',
    },
  ],
  sponsor: {
    enable: false,
  },
  search: {
    enable: true,
    type: 'fuse'
  },
  license: {
    enabled: true,
    type: 'by-nc-sa'
  }
})
