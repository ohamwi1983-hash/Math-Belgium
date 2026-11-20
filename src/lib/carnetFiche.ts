/**
 * Fiche d'une séance du carnet : page HTML A4 autonome (aucune ressource externe), imprimable ou
 * enregistrable en PDF depuis le navigateur. Même esprit que les documents du panneau : ouverte
 * dans un nouvel onglet par un lien (`#imprimer` lance l'impression au chargement), ou téléchargée.
 */
import { dateLongue, echapperHtml as e, type SeanceResolue } from './carnet'

function capitaleDate(iso: string): string {
  const t = dateLongue(iso)
  return t.charAt(0).toUpperCase() + t.slice(1)
}

const SCRIPT_IMPRESSION = `<script>if(location.hash==='#imprimer'){addEventListener('load',function(){setTimeout(function(){window.print()},300)})}</script>`

export function ficheSeanceHtml(r: SeanceResolue & { professeur: string }): string {
  const bloc = (titre: string, contenu: string) => `<section><h2>${e(titre)}</h2>${contenu}</section>`
  const liste = (items: string[]) => `<ul>${items.join('')}</ul>`
  const paragraphe = (t: string) => `<p>${e(t).replace(/\n/g, '<br>')}</p>`
  const parties =
    r.parties.length > 0
      ? liste(r.parties.map((p) => `<li>${e(p.texte)}<span class="lien">${e(p.url)}</span></li>`))
      : '<p class="vide">Aucune partie cochée.</p>'
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=820">
<title>${e(`Séance — ${r.classe} — ${capitaleDate(r.date)}`)}</title>
<style>
  @page { size: A4; margin: 1.6cm 1.8cm; }
  * { box-sizing: border-box; }
  html { background: #fff; color: #1d2433; }
  body { font-family: "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif; font-size: 11.5pt; line-height: 1.45; width: 21cm; max-width: 100%; margin: 0 auto; padding: 1.4cm 1.6cm; }
  @media print { body { width: auto; padding: 0; } }
  header { border-bottom: 2px solid #1d2433; padding-bottom: 0.35cm; margin-bottom: 0.5cm; }
  .surtitre { font-size: 9.5pt; color: #4a5468; margin: 0 0 0.1cm; }
  h1 { font-size: 17pt; margin: 0; line-height: 1.2; }
  .horaire { font-size: 12pt; margin: 0.12cm 0 0; }
  .chapitre { font-size: 12pt; margin: 0.12cm 0 0; font-weight: 600; }
  section { margin: 0 0 0.45cm; break-inside: avoid; }
  h2 { font-size: 11pt; margin: 0 0 0.12cm; padding-bottom: 0.05cm; border-bottom: 1px solid #c8cdd8; }
  ul { margin: 0; padding-left: 0.55cm; }
  li { margin: 0 0 0.08cm; }
  .lien { display: block; font-size: 8.5pt; color: #4a5468; overflow-wrap: anywhere; }
  p { margin: 0 0 0.12cm; overflow-wrap: anywhere; }
  .vide { color: #4a5468; font-style: italic; }
  footer { margin-top: 0.6cm; font-size: 8.5pt; color: #4a5468; border-top: 1px solid #c8cdd8; padding-top: 0.15cm; }
</style>
</head>
<body>
<header>
  <p class="surtitre">${e(['Carnet de matière vue', r.ecole, r.professeur].filter(Boolean).join(' · '))}</p>
  <h1>${e(r.classe)} — ${e(capitaleDate(r.date))}</h1>
  ${r.horaire ? `<p class="horaire">${e(r.horaire)}</p>` : ''}
  ${r.chapitre ? `<p class="chapitre">${e(r.chapitre.niveau)} — Chapitre ${r.chapitre.numero} : ${e(r.chapitre.titre)}</p>` : ''}
</header>
${bloc('Vu en classe', parties)}
${r.generateurs.length > 0 ? bloc('Exercices et générateurs utilisés', liste(r.generateurs.map((g) => `<li>${e(g.titre)}${g.url ? `<span class="lien">${e(g.url)}</span>` : ''}</li>`))) : ''}
${bloc('Devoir', r.devoir ? paragraphe(r.devoir) : '<p class="vide">Pas de devoir.</p>')}
${r.remarque ? bloc('Remarque', paragraphe(r.remarque)) : ''}
<footer>math-belgium.vercel.app — fiche du professeur</footer>
${SCRIPT_IMPRESSION}
</body>
</html>`
}
