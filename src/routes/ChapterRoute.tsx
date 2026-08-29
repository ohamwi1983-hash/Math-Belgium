import { useParams, Navigate } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { ChapterPage } from '../components/chapter/ChapterPage'
import { LEVELS, findChapter } from '../content/chaptersIndex'

export function ChapterRoute() {
  const { levelSlug, chapterSlug } = useParams<{ levelSlug: string; chapterSlug: string }>()
  const chapter = levelSlug && chapterSlug ? findChapter(levelSlug, chapterSlug) : undefined

  if (!chapter) return <Navigate to="/" replace />

  const level = LEVELS.find((l) => l.slug === levelSlug)

  return (
    <>
      <SiteHeader
        breadcrumb={[
          { label: level?.label ?? levelSlug!, to: '/' },
          { label: chapter.title },
        ]}
      />
      <ChapterPage chapter={chapter} />
    </>
  )
}
