import { useParams, Navigate } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { ChapterPage } from '../components/chapter/ChapterPage'
import { LEVELS, findChapter } from '../content/chaptersIndex'
import { useDocumentMeta } from '../lib/useDocumentMeta'

export function ChapterRoute() {
  const { levelSlug, chapterSlug } = useParams<{ levelSlug: string; chapterSlug: string }>()
  const chapter = levelSlug && chapterSlug ? findChapter(levelSlug, chapterSlug) : undefined
  const level = LEVELS.find((l) => l.slug === levelSlug)

  useDocumentMeta(
    chapter ? `${chapter.title} — ${level?.label ?? levelSlug} — Chapitres de maths` : 'Chapitres de maths — FWB',
    chapter?.lede ?? '',
    `/${levelSlug}/${chapterSlug}`,
  )

  if (!chapter) return <Navigate to="/" replace />

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
