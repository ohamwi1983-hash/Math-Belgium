import type { ChapterContent } from '../../content/types'

/**
 * Export HTML (A4) — quatrième format, à côté de docx/pdf/pptx. Contrairement aux trois autres,
 * `runExport.ts` ne passe JAMAIS par `captureBlocks.ts`/`html2canvas` pour ce format : une formule
 * reste du vrai HTML KaTeX (sélectionnable, net à toute résolution d'impression), pas une image
 * rasterisée — même principe que `genererFeuilleExercicesHtml.ts` côté plateforme-maths (projet
 * jumeau du même auteur), adapté ici pour reprendre l'INTÉGRALITÉ du CSS du site (typographie,
 * `.diagram-frame`, `.callout`, `.exemple`, tableaux...) plutôt qu'un CSS minimal reconstruit à la
 * main, puisqu'on exporte un chapitre déjà mis en forme et pas une feuille d'exercices générée.
 */

/** Toutes les règles CSS déjà chargées par le site (Vite bundle `index.css` + `katex.min.css` dans
 * le(s) même(s) `<style>` en prod) — il en faut l'intégralité ici, pas seulement les règles
 * `.katex` (contrairement à `katexImage.ts` côté plateforme-maths, qui ne rasterise QUE la formule
 * elle-même) : le fichier exporté doit reproduire la mise en page complète du chapitre. */
function toutesLesReglesCss(): string {
  const regles: string[] = []
  for (const feuille of Array.from(document.styleSheets)) {
    let ensemble: CSSRuleList
    try {
      ensemble = feuille.cssRules
    } catch {
      continue // feuille cross-origin (ex. police Google Fonts servie en <link>) — sans objet ici.
    }
    if (!ensemble) continue
    for (const regle of Array.from(ensemble)) regles.push(regle.cssText)
  }
  return regles.join('\n')
}

/** Retire le bloc de préférence sombre du CSS copié. L'export est TOUJOURS en thème clair — même
 * intention que `withLightTheme()` dans `captureBlocks.ts` pour les 3 autres formats — mais le
 * mécanisme diffère : un fichier HTML téléchargé n'a plus le JS de ce site pour poser
 * `data-theme="light"` à l'ouverture, donc on retire la règle plutôt que de compter sur un
 * attribut qui ne sera jamais posé. (Cette règle ne teste de toute façon aujourd'hui aucun
 * `data-theme` dans `src/index.css` — voir le bug séparé sur `captureBlocks.ts`/`withLightTheme()`,
 * sans rapport avec cet export.) */
function retirerPreferenceSombre(css: string): string {
  return css.replace(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{[\s\S]*?\n\}\n?/g, '')
}

async function urlVersDataUrl(url: string): Promise<string> {
  const reponse = await fetch(url)
  const blob = await reponse.blob()
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader()
    lecteur.onload = () => resolve(lecteur.result as string)
    lecteur.onerror = () => reject(lecteur.error ?? new Error('Échec de lecture de police.'))
    lecteur.readAsDataURL(blob)
  })
}

/** Inline chaque police référencée par `url(...)` en `data:` URI — fichier téléchargé totalement
 * autonome (aucune requête réseau à l'ouverture, y compris hors ligne). Même technique que
 * `plateforme-maths/src/export/katexImage.ts` (`construireCssKatexAutonome`), appliquée ici à
 * l'ensemble du CSS du site plutôt qu'au seul CSS KaTeX. */
async function inlinerPolices(css: string): Promise<string> {
  const urls = new Set<string>()
  const motif = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g
  let correspondance: RegExpExecArray | null
  while ((correspondance = motif.exec(css))) {
    const url = correspondance[2]
    if (!url.startsWith('data:')) urls.add(url)
  }

  const remplacements = new Map<string, string>()
  await Promise.all(
    Array.from(urls).map(async (url) => {
      try {
        const absolue = new URL(url, document.baseURI).href
        remplacements.set(url, await urlVersDataUrl(absolue))
      } catch {
        // Police non essentielle (variante non prioritaire pour ce navigateur) — ignorée plutôt que bloquante.
      }
    }),
  )

  let resultat = css
  for (const [url, dataUrl] of remplacements) resultat = resultat.split(url).join(dataUrl)
  return resultat
}

/** Pagination A4 propre à l'impression (ou "Enregistrer en PDF" depuis le navigateur) — sans ce
 * bloc, Chrome coupe un `.diagram-frame`/`.callout`/`.exemple` pile à cheval sur un saut de page,
 * et les fonds colorés des callouts peuvent ne pas s'imprimer sans `print-color-adjust`. Le fond
 * quadrillé décoratif du `<body>` (`repeating-linear-gradient`, copié depuis `src/index.css`) doit
 * être neutralisé explicitement : sans ce `background: #fff`, ce motif traverse visuellement les
 * boîtes opaques (`.diagram-frame` etc.) à l'impression — confirmé empiriquement (rendu PDF
 * inspecté page par page), pas juste théorique.
 *
 * Numérotation "n / total" en bas de chaque page (`@bottom-center` + `counter(page)`/
 * `counter(pages)`, CSS Paged Media) — confirmé empiriquement fonctionner sous Chromium (testé via
 * Playwright, `page.pdf()`, texte extrait page par page). Support inégal hors Chromium/Edge (ex.
 * Firefox l'ignore silencieusement à ce jour) : dégradation gracieuse, la page s'imprime
 * normalement, seule la numérotation manque — jamais bloquant. `var(--mono)`/`var(--ink-faint)` ne
 * sont pas garantis résolus dans une boîte de marge `@page` par tous les moteurs, donc valeurs en
 * dur ici plutôt que les tokens du reste du fichier (mêmes valeurs que `--mono`/`--ink-faint`
 * définis plus haut dans le CSS copié). */
const STYLE_IMPRESSION = `
@page {
  size: A4;
  margin: 18mm 15mm 20mm 15mm;
  @bottom-center {
    content: counter(page) " / " counter(pages);
    font-family: "IBM Plex Mono", "SFMono-Regular", Menlo, monospace;
    font-size: 9.5pt;
    color: #8a97a1;
  }
}
@media print {
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { background: #ffffff !important; }
  figure, .diagram-frame, .cas-grid, .cas-item, .exemple, .callout, .synthese,
  table.tableau, .table-scroll, .generator-card, .generator-pair {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
`

function echapperHtml(texte: string): string {
  return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Construit le fichier HTML A4 complet (`Blob`, type `text/html`) à partir du chapitre déjà
 * affiché à l'écran. `.no-export` (nav, cartes vers les générateurs) est retiré du clone AVANT
 * capture du HTML — même filtre que `collectBlocks.ts` pour les 3 autres formats, mais appliqué
 * directement en DOM plutôt qu'élément par élément puisqu'aucune rasterisation n'a lieu ici. */
export async function buildHtmlBlob(chapter: ChapterContent): Promise<Blob> {
  const page = document.querySelector('.page')
  if (!page) throw new Error('buildHtmlBlob : .page introuvable dans le DOM')

  const clone = page.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.no-export, iframe').forEach((el) => el.remove())

  const css = await inlinerPolices(retirerPreferenceSombre(toutesLesReglesCss()))
  const titre = echapperHtml(chapter.title)

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titre}</title>
<style>${css}${STYLE_IMPRESSION}</style>
</head>
<body>
${clone.outerHTML}
</body>
</html>`

  return new Blob([html], { type: 'text/html;charset=utf-8' })
}
