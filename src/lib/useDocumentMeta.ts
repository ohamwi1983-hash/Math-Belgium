import { useEffect } from 'react'

const BASE_URL = 'https://math-belgium.vercel.app'

/** Retire la mini-syntaxe `RichText` ($latex$, **gras**) d'un texte de contenu pour en faire une
 * meta description lisible — jamais de code LaTeX ni d'astérisques littéraux dans les résultats
 * Google. Volontairement sommaire (garde le contenu, jette juste les délimiteurs) : une
 * description n'a pas besoin d'un vrai rendu KaTeX. */
function stripRichText(text: string): string {
  return text.replace(/\$([^$]+)\$/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1')
}

function upsertMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Met à jour `<title>`, `<meta name="description">` et `<link rel="canonical">` pour la page
 * courante — le site est une SPA sans SSR (`index.html` n'a qu'un seul `<title>` statique), donc
 * sans ce hook Google voit le même titre générique sur toutes les pages (accueil, chaque
 * chapitre), ce qui nuit directement au référencement de chaque page individuellement. À appeler
 * dans chaque route publique (`HomePage`, `ChapterRoute`) avec un `path` absolu (ex. `/4e/...`).
 */
export function useDocumentMeta(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title
    upsertMeta('description', stripRichText(description))

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `${BASE_URL}${path}`)
  }, [title, description, path])
}
