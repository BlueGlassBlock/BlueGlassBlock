import { defineValaxyConfig } from 'valaxy'
import type { UserThemeConfig } from 'valaxy-theme-yun'
import { addonBangumi } from 'valaxy-addon-bangumi'
import { addonTwikoo } from 'valaxy-addon-twikoo'
import { contentGroupPlugin } from './extensions/markdown/contentGroup'
import { prettyLinkPlugin } from './extensions/markdown/prettyLink'
import { easyAssetsPlugin } from './extensions/markdown/easyAssets'

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts

  theme: 'yun',

  themeConfig: {
    banner: {
      enable: true,
      title: '蓝玻璃のブログ',
      cloud: {
        enable: true,
      },
    },

    footer: {
      since: 2023,
      icon: {
        enable: false
      }
    },
    
    menu: {
      custom: {
        title: 'menu.links',
        url: '/links',
        icon: 'i-ri-link'
      }
    }
  },

  markdown: {
    config(md) {
      md.use(contentGroupPlugin, false)
      md.use(prettyLinkPlugin)
      md.use(easyAssetsPlugin)
    },
  },

  addons: [
    addonBangumi(
      {
        api: 'https://blog-api.blueg.top/api/bangumi',
        bgmEnabled: true,
        bilibiliEnabled: false,
        bgmUid: 'BlueGlassBlock'
      }
    ),
    addonTwikoo({
      envId: 'https://blog-api.blueg.top/api/twikoo'
    })
  ],
})
