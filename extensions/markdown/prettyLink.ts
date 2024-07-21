import MarkdownIt from 'markdown-it'

const ICONS = {
  GHUser: 'i-mdi-github',
  GHRepo: 'i-mdi-git',
  GHGist: 'i-mdi-file-code',
  GHIssue: 'i-mdi-alert-circle',
  GHCommit: 'i-mdi-source-commit',
  TwitUser: 'i-mdi-twitter',
  TwitPost: 'i-mdi-post',
  WaybackMachine: 'i-mdi-archive',
  MailTo: 'i-mdi-email',
}


const SITE_REGEXES = {
  GHUser: /github\.com\/([a-zA-Z0-9_-]+)\/?(?=$|\/)$/,
  GHRepo: /github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)\/?(?=$|\/)$/,
  GHGist: /gist\.github\.com\/([a-zA-Z0-9_-]+)\/?(?=$|\/)$/,
  GHIssue: /github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)\/(issues|pull)\/([0-9]+)\/?(?=$|\/)$/,
  GHCommit: /github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)\/commit\/([a-f0-9]+)\/?(?=$|\/)$/,
  TwitUser: /(twitter|x)\.com\/([a-zA-Z0-9_]+)\/?(?=$|\/)$/,
  TwitPost: /(twitter|x)\.com\/([a-zA-Z0-9_]+)\/status\/([0-9]+)\/?(?=$|\/)$/,
  WaybackMachine: /web\.archive\.org\/web\//,
  MailTo: /mailto:/
}

export const LINK_ICON_LIST = Object.values(ICONS)

export function prettyLinkPlugin(md: MarkdownIt) {
  md.use(linkifyPlugin)
  md.use(iconifyPlugin)
}

/**
 * Handles GitHub and Twitter aliases
*/
function linkifyPlugin(md: MarkdownIt) {
  const linkify = md.linkify

  const SUFFIX_PART = '(?!_)(?=$|' + linkify.re.src_ZPCc + ')'

  // Twitter: @username
  linkify.add('@', {
    validate: function (text, pos, self) {
      const tail = text.slice(pos);

      if (!self.re.twitter) {
        self.re.twitter = new RegExp(
          '^([a-zA-Z0-9_]){1,15}' + SUFFIX_PART
        );
      }
      if (self.re.twitter.test(tail)) {
        // Linkifier allows punctuation chars before prefix,
        // but we additionally disable `@` ("@@mention" is invalid)
        if (pos >= 2 && tail[pos - 2] === '@') {
          return false;
        }
        return tail.match(self.re.twitter)?.[0].length || false;
      }
      return 0;
    },
    normalize: function (match) {
      match.text = match.text.replace(/^@/, '');
      match.url = 'https://x.com/' + match.text; // Yes Musk
    }
  });

  // GitHub: gh:username, gh:user/repo, gh:user/repo#issue
  const GH_REGEXES = [
    new RegExp('^([a-zA-Z0-9_-]+)' + SUFFIX_PART),
    new RegExp('^([a-zA-Z0-9_-]+)/([a-zA-Z0-9_-]+)' + SUFFIX_PART),
    new RegExp('^([a-zA-Z0-9_-]+)/([a-zA-Z0-9_-]+)#([0-9]+)' + SUFFIX_PART),
  ]
  linkify.add('gh:', {
    validate: function (text, pos, self) {
      const tail = text.slice(pos);
      for (const regex of GH_REGEXES) {
        if (regex.test(tail)) {
          const len = tail.match(regex)?.[0].length;
          if (len) {
            return len;
          }
        }
      }
      return 0;
    },
    normalize: function (match) {
      match.text = match.text.replace(/^gh:/, '')
      const parts = match.text.split(/[#/]/)
      if (parts.length === 1) {
        match.url = `https://github.com/${parts[0]}`
      } else if (parts.length === 2) {
        match.url = `https://github.com/${parts[0]}/${parts[1]}`
      }
      else {
        match.url = `https://github.com/${parts[0]}/${parts[1]}/issues/${parts[2]}`
      }
    }
  })
}


function getLinkIconClass(url: string) {
  for (const [type, regex] of Object.entries(SITE_REGEXES)) {
    if (regex.test(url)) {
      return ICONS[type as keyof typeof ICONS]
    }
  }
  return ''
}

function iconifyPlugin(md: MarkdownIt) {
  const defaultOpenRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const hrefIndex = token.attrIndex('href')
    let iconClass = ''
    let result = ''
    if (hrefIndex >= 0) {
      let href = token.attrs![hrefIndex][1]
      iconClass = getLinkIconClass(href)
      if (iconClass == ICONS.WaybackMachine) {
        const waybackUrl = href
        href = waybackUrl.replace(/(https?:\/\/)?web\.archive\.org\/web\/[0-9]+\//, '')
        const waybackLinkOpen = defaultOpenRender(tokens, idx, options, env, self)
        token.attrs![hrefIndex][1] = href
        result += waybackLinkOpen + `<div class="iconify-icon-wayback ${iconClass}" /></a>`
        iconClass = getLinkIconClass(href)
      }
    }
    result += defaultOpenRender(tokens, idx, options, env, self)
    if (iconClass)
      result += `<div class="iconify-icon ${iconClass}" />`
    return result
  }

}
