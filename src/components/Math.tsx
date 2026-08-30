import { Fragment, memo } from 'react'
import type { ReactNode } from 'react'
import katex from 'katex'

/** Renders a single LaTeX expression inline via KaTeX. */
export const MathInline = memo(function MathInline({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    output: 'html',
  })
  return <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />
})

// Splits a content string on `$...$` (KaTeX) and `**...**` (bold) segments,
// so chapter content can stay plain data instead of JSX.
const TOKEN_RE = /\$([^$]+)\$|\*\*([^*]+)\*\*/g

/** Renders a data string containing `$latex$` math and `**bold**` emphasis. */
export const RichText = memo(function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0
  TOKEN_RE.lastIndex = 0
  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<Fragment key={key++}>{text.slice(lastIndex, match.index)}</Fragment>)
    }
    if (match[1] !== undefined) {
      parts.push(<MathInline key={key++} tex={match[1]} />)
    } else if (match[2] !== undefined) {
      parts.push(<strong key={key++}>{match[2]}</strong>)
    }
    lastIndex = TOKEN_RE.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>)
  }
  return <>{parts}</>
})

/** Renders a data string as a full paragraph of rich text. */
export function RichParagraph({ text }: { text: string }) {
  return (
    <p>
      <RichText text={text} />
    </p>
  )
}
