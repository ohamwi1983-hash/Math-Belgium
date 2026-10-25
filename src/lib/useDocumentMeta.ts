import { useEffect } from 'react'

const BASE_URL = 'https://math-belgium.vercel.app'

/** Image de marque par défaut pour og:image/twitter:image — carrée (icône PWA 512×512), pas le
 * format paysage 1200×630 idéal pour un aperçu de partage, mais la seule image de marque
 * existante : un vrai visuel 1200×630 par page (ou même générique) est un chantier de design à
 * part, hors du lot de gains rapides dont ce correctif fait partie. */
const IMAGE_DEFAUT = `${BASE_URL}/icons/icon-512.png`

/** Retire la mini-syntaxe `RichText` ($latex$, **gras**) d'un texte de contenu pour en faire une
 * meta description lisible — jamais de code LaTeX ni d'astérisques littéraux dans les résultats
 * Google. Volontairement sommaire (garde le contenu, jette juste les délimiteurs) : une
 * description n'a pas besoin d'un vrai rendu KaTeX. */
export function stripRichText(text: string): string {
  return text.replace(/\$([^$]+)\$/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1')
}

function upsertMeta(attribut: 'name' | 'property', cle: string, content: string) {
  let el = document.querySelector(`meta[${attribut}="${cle}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attribut, cle)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Injecte/remplace un bloc JSON-LD identifié par `id` — jamais plus d'un bloc par `id` à la fois
 * (une page de chapitre qui se recharge avec un autre chapitre, via React Router sans démontage,
 * doit remplacer son propre bloc, pas en empiler un second). */
function upsertJsonLd(id: string, donnees: object) {
  let el = document.querySelector(`script[type="application/ld+json"]#${id}`)
  if (!el) {
    el = document.createElement('script')
    el.setAttribute('type', 'application/ld+json')
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(donnees)
}

function supprimerJsonLd(id: string) {
  document.querySelector(`script[type="application/ld+json"]#${id}`)?.remove()
}

interface OptionsDocumentMeta {
  title: string
  /** Passe par `stripRichText` avant usage — jamais du LaTeX/gras littéral dans une meta
   * description ou un og:description. */
  description: string
  /** Chemin absolu de la page (ex. `/4e/fonction-second-degre`), utilisé pour le canonical ET
   * og:url/twitter:url. */
  path: string
  /** 'website' pour l'accueil, 'article' pour une page de chapitre — convention Open Graph
   * standard (og:type), seules les deux valeurs dont ce site a besoin. */
  type: 'website' | 'article'
  /** Chemin public de l'image à utiliser pour og:image/twitter:image (ex. `/icons/icon-512.png`)
   * — par défaut `IMAGE_DEFAUT` (le seul visuel de marque disponible aujourd'hui). */
  image?: string
  /** Un ou plusieurs objets de données structurées JSON-LD (schema.org) — ex. `LearningResource`
   * pour une page de chapitre, `BreadcrumbList` pour son fil d'Ariane. `undefined`/tableau vide :
   * aucun bloc injecté (l'accueil n'en a pas besoin). */
  jsonLd?: object | object[]
}

/**
 * Met à jour `<title>`, `<meta name="description">`, `<link rel="canonical">`, les balises Open
 * Graph (og:*) et Twitter Card (twitter:*), et les données structurées JSON-LD pour la page
 * courante — le site est une SPA sans SSR (`index.html` n'a qu'un seul `<title>` statique), donc
 * sans ce hook Google voit le même titre générique sur toutes les pages (accueil, chaque
 * chapitre), ce qui nuit directement au référencement de chaque page individuellement. À appeler
 * dans chaque route publique (`HomePage`, `ChapterRoute`) avec un `path` absolu (ex. `/4e/...`).
 *
 * Limite assumée, commune à tout ce que pose ce hook (title/description déjà en place compris) :
 * posé en JavaScript après montage, donc invisible au premier passage d'un robot qui ne EXÉCUTE
 * pas JS (la plupart des crawlers de réseaux sociaux — Facebook/Slack/Discord — contrairement à
 * Googlebot, qui finit par exécuter le JS en différé). Un aperçu de partage sur un réseau social
 * ne profitera donc probablement pas de ces balises tant que le site reste une SPA pure sans
 * pré-rendu — un chantier à part, plus lourd, voir la discussion SEO plus large.
 */
export function useDocumentMeta({ title, description, path, type, image, jsonLd }: OptionsDocumentMeta) {
  useEffect(() => {
    const descriptionPropre = stripRichText(description)
    const url = `${BASE_URL}${path}`
    const imageUrl = image ?? IMAGE_DEFAUT

    document.title = title
    upsertMeta('name', 'description', descriptionPropre)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', descriptionPropre)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:image', imageUrl)
    upsertMeta('property', 'og:locale', 'fr_BE')
    upsertMeta('property', 'og:site_name', 'Chapitres de maths — FWB')

    upsertMeta('name', 'twitter:card', 'summary')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', descriptionPropre)
    upsertMeta('name', 'twitter:image', imageUrl)

    const blocsJsonLd = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
    const idsJsonLd = blocsJsonLd.map((_, i) => `jsonld-page-${i}`)
    blocsJsonLd.forEach((donnees, i) => upsertJsonLd(idsJsonLd[i], donnees))

    // Nettoyage React standard (pas une borne codée en dur) : retire EXACTEMENT les blocs posés
    // par CETTE exécution avant la suivante (ex. une page de chapitre avec BreadcrumbList en plus
    // de LearningResource, suivie de l'accueil sans aucun bloc) — jamais un bloc JSON-LD obsolète
    // laissé derrière en changeant de page.
    return () => {
      for (const id of idsJsonLd) supprimerJsonLd(id)
    }
  }, [title, description, path, type, image, jsonLd])
}
