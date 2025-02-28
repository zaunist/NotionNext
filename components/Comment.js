import Tabs from '@/components/Tabs'
import { siteConfig } from '@/lib/config'
import { isBrowser, isSearchEngineBot } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

/**
 * 评论组件
 * 只有当前组件在浏览器可见范围内才会加载内容
 * @param {*} param0
 * @returns
 */
const Comment = ({ frontMatter, className }) => {
  const router = useRouter()
  const [shouldLoad, setShouldLoad] = useState(false)
  const commentRef = useRef(null)

  const COMMENT_ARTALK_SERVER = siteConfig('COMMENT_ARTALK_SERVER')
  const COMMENT_TWIKOO_ENV_ID = siteConfig('COMMENT_TWIKOO_ENV_ID')
  const COMMENT_WALINE_SERVER_URL = siteConfig('COMMENT_WALINE_SERVER_URL')
  const COMMENT_VALINE_APP_ID = siteConfig('COMMENT_VALINE_APP_ID')
  const COMMENT_GISCUS_REPO = siteConfig('COMMENT_GISCUS_REPO')
  const COMMENT_CUSDIS_APP_ID = siteConfig('COMMENT_CUSDIS_APP_ID')
  const COMMENT_UTTERRANCES_REPO = siteConfig('COMMENT_UTTERRANCES_REPO')
  const COMMENT_GITALK_CLIENT_ID = siteConfig('COMMENT_GITALK_CLIENT_ID')
  const COMMENT_WEBMENTION_ENABLE = siteConfig('COMMENT_WEBMENTION_ENABLE')

  useEffect(() => {
    // Check if the component is visible in the viewport
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.unobserve(entry.target)
        }
      })
    })

    if (commentRef.current) {
      observer.observe(commentRef.current)
    }

    return () => {
      if (commentRef.current) {
        observer.unobserve(commentRef.current)
      }
    }
  }, [frontMatter])

  // 当连接中有特殊参数时跳转到评论区
  if (
    isBrowser &&
    ('giscus' in router.query || router.query.target === 'comment')
  ) {
    setTimeout(() => {
      const url = router.asPath.replace('?target=comment', '')
      history.replaceState({}, '', url)
      document
        ?.getElementById('comment')
        ?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }, 1000)
  }

  if (!frontMatter) {
    return null
  }

  if (isSearchEngineBot) {
    return null
  }

  // 特定文章关闭评论区
  if (frontMatter?.comment === 'Hide') {
    return null
  }

  return (
    <div
      key={frontMatter?.id}
      id='comment'
      ref={commentRef}
      className={`comment mt-5 text-gray-800 dark:text-gray-300 ${className || ''}`}>
      {/* 延迟加载评论区 */}
      {!shouldLoad && (
        <div className='text-center'>
          Loading...
          <i className='fas fa-spinner animate-spin text-3xl ' />
        </div>
      )}

      {shouldLoad && COMMENT_UTTERRANCES_REPO && (
        <div key='Utterance'>
          <UtterancesComponent
            issueTerm={frontMatter.id}
                className='px-2'
              />
        </div>
      )}
    </div>
  )
}


const UtterancesComponent = dynamic(
  () => {
    return import('@/components/Utterances')
  },
  { ssr: false }
)

export default Comment
