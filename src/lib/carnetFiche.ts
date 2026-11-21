/**
 * Fiche d'une séance du carnet : page HTML A4 autonome (aucune ressource externe), imprimable ou
 * enregistrable en PDF depuis le navigateur. Même esprit que les documents du panneau : ouverte
 * dans un nouvel onglet par un lien (`#imprimer` lance l'impression au chargement), ou téléchargée.
 */
import { dateLongue, echapperHtml as e, type SeanceResolue } from './carnet'
import {
  MESSAGE_SEMAINE_VIDE,
  periodeTexte,
  texteChapitreSynthese,
  texteConge,
  texteSynthese,
  titreAgenda,
  titreSemaine,
  type Agenda,
  type BlocAgenda,
  type CongePeriode,
  type OptionsSortieAgenda,
  type SeanceAgenda,
  type SyntheseAgenda,
} from './carnetAgenda'

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

/* ------------------------------------------------------------------ agenda d'une période */

/** Texte sûr dans une chaîne CSS `content: "…"` (boîte de marge du pied de page). */
function chaineCss(t: string): string {
  return t.replace(/["\\]/g, '').replace(/[\r\n]+/g, ' ')
}

/** Agenda d'une période (une classe ou toutes) : page HTML A4 autonome, même style que la fiche d'une
 * séance, légère (aucune figure, aucune ressource externe) ; semaines, congés FWB, synthèse ; pied de
 * page « nom du professeur · page n / N » (boîtes de marge CSS, Chromium / Edge / Safari récents ;
 * ignorées ailleurs, jamais bloquant). Chaque séance est insécable (`break-inside: avoid`), un titre de
 * semaine reste collé à sa première ligne. */
export function agendaPeriodeHtml(a: Agenda, options: OptionsSortieAgenda & { professeur: string }): string {
  const plusieurs = !a.classe
  const lienOuTexte = (url: string, texte: string) => (options.liens && url ? `<a href="${e(url)}">${e(texte)}</a>` : e(texte))
  const url = (u: string) => (options.liens && u ? `<span class="lien">${e(u)}</span>` : '')
  const texteLibre = (t: string) => e(t).replace(/\n/g, '<br>')

  const ligneSeance = (s: SeanceAgenda, avecClasse: boolean) => {
    const r = s.r
    const contenu: string[] = []
    contenu.push(
      r.chapitre
        ? `<p class="chapitre">${lienOuTexte(r.chapitre.url, `Ch. ${r.chapitre.numero} — ${r.chapitre.titre}`)}${plusieurs ? ` <span class="niveau">· ${e(r.chapitre.niveau)}</span>` : ''}</p>`
        : `<p class="chapitre">Chapitre retiré du site (${e(s.seance.chapitre)})</p>`,
    )
    contenu.push(r.parties.length > 0 ? `<ul>${r.parties.map((p) => `<li>${lienOuTexte(p.url, p.texte)}${url(p.url)}</li>`).join('')}</ul>` : '<p class="vide">Aucune partie cochée.</p>')
    if (r.generateurs.length > 0)
      contenu.push(
        options.liens
          ? `<p class="detail"><strong>Exercices :</strong></p><ul class="exercices">${r.generateurs.map((g) => `<li>${lienOuTexte(g.url, g.titre)}${url(g.url)}</li>`).join('')}</ul>`
          : `<p class="detail"><strong>Exercices :</strong> ${r.generateurs.map((g) => e(g.titre)).join(' · ')}</p>`,
      )
    if (r.devoir) contenu.push(`<p class="detail"><strong>Devoir :</strong> ${texteLibre(r.devoir)}</p>`)
    if (options.remarques && r.remarque) contenu.push(`<p class="detail remarque"><strong>Remarque :</strong> ${texteLibre(r.remarque)}</p>`)
    return `<div class="seance${avecClasse ? ' avec-classe' : ''}">
  <div class="quand"><strong>${e(capitaleDate(r.date).replace(/ \d{4}$/, ''))}</strong>${r.horaire ? `<span class="horaire">${e(r.horaire)}</span>` : ''}${s.heures > 1 ? `<span class="heures">${s.heures} heures</span>` : ''}</div>
  ${avecClasse ? `<div class="classe">${e(r.classe)}</div>` : ''}
  <div class="contenu">${contenu.join('')}</div>
</div>`
  }
  const ligneConge = (c: CongePeriode) => `<p class="conge">${e(texteConge(c))}</p>`

  const blocs = (liste: BlocAgenda[], avecClasse: boolean) =>
    liste
      .map((b) => {
        if (b.type === 'conge') return ligneConge(b.conge)
        const elements = b.elements.map((el) => (el.type === 'conge' ? ligneConge(el.conge) : ligneSeance(el.s, avecClasse)))
        if (b.seances === 0) elements.push(`<p class="vide semaine-vide">${e(MESSAGE_SEMAINE_VIDE)}</p>`)
        const [premier, ...suite] = elements
        return `<section class="semaine"><div class="tete-semaine"><h2>${e(titreSemaine(b.lundi, a))}</h2>${premier ?? ''}</div>${suite.join('')}</section>`
      })
      .join('\n')

  const synthese = (s: SyntheseAgenda, titre: string, globale: boolean) => `<section class="synthese${globale ? ' globale' : ''}">
  <p><strong>${e(titre)} :</strong> ${e(texteSynthese(s))}.</p>
  ${s.chapitres.length > 0 ? `<ul>${s.chapitres.map((c) => `<li>${e(texteChapitreSynthese(c))}</li>`).join('')}</ul>` : ''}
  ${globale && s.parClasse.length > 1 ? `<p class="par-classe">${s.parClasse.map((k) => e(`${k.classe.nom.trim()} : ${k.seances} séance${k.seances > 1 ? 's' : ''}, ${k.heures} h`)).join(' · ')}</p>` : ''}
</section>`

  const enteteColonnes = (avecClasse: boolean) =>
    `<div class="seance colonnes${avecClasse ? ' avec-classe' : ''}" aria-hidden="true"><div>Date · horaire</div>${avecClasse ? '<div>Classe</div>' : ''}<div>Matière vue</div></div>`

  const corps = a.groupes
    .map((g) => {
      if (g.classe && plusieurs)
        return `<section class="groupe-classe"><h2 class="titre-classe">${e(g.classe.nom.trim())}</h2>${enteteColonnes(false)}${blocs(g.blocs, false)}${synthese(g.synthese, `Synthèse ${g.classe.nom.trim()}`, false)}</section>`
      return `${enteteColonnes(plusieurs)}${blocs(g.blocs, plusieurs)}`
    })
    .join('\n')
  const parClasse = plusieurs && a.groupes.some((g) => g.classe)
  const periode = periodeTexte(a.du, a.au)
  const pied = chaineCss([options.professeur, titreAgenda(a)].filter(Boolean).join(' · '))

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=820">
<title>${e(`${titreAgenda(a)} — ${periode}`)}</title>
<style>
  @page { size: A4; margin: 1.5cm 1.6cm 1.7cm;
    @bottom-left { content: "${pied}"; font-family: Arial, sans-serif; font-size: 8pt; color: #4a5468; text-align: left; vertical-align: middle; }
    @bottom-right { content: "page " counter(page) " / " counter(pages); font-family: Arial, sans-serif; font-size: 8pt; color: #4a5468; text-align: right; vertical-align: middle; } }
  * { box-sizing: border-box; }
  html { background: #fff; color: #1d2433; }
  body { font-family: "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif; font-size: 10.5pt; line-height: 1.4; width: 21cm; max-width: 100%; margin: 0 auto; padding: 1.4cm 1.6cm; }
  @media print { body { width: auto; padding: 0; } .pied-ecran { display: none; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  a { color: inherit; text-decoration: none; }
  header { border-bottom: 2px solid #1d2433; padding-bottom: 0.3cm; margin-bottom: 0.35cm; }
  .surtitre { font-size: 9pt; color: #4a5468; margin: 0 0 0.1cm; }
  h1 { font-size: 16pt; margin: 0; line-height: 1.2; }
  .periode { font-size: 11.5pt; margin: 0.1cm 0 0; }
  .note { font-size: 9pt; color: #4a5468; margin: 0.08cm 0 0; }
  .semaine { margin: 0 0 0.15cm; }
  .tete-semaine { break-inside: avoid; }
  h2 { font-size: 11pt; margin: 0.35cm 0 0; padding: 0.06cm 0; border-bottom: 1px solid #8a93a6; }
  .titre-classe { font-size: 14pt; border-bottom: 2px solid #1d2433; margin-top: 0; }
  .groupe-classe + .groupe-classe { break-before: page; }
  .seance { display: grid; grid-template-columns: 3.7cm minmax(0, 1fr); gap: 0 0.35cm; padding: 0.14cm 0; border-bottom: 1px dotted #c8cdd8; break-inside: avoid; }
  .seance.avec-classe { grid-template-columns: 3.7cm 1.5cm minmax(0, 1fr); }
  .seance.colonnes { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.04em; color: #4a5468; border-bottom: 1px solid #c8cdd8; padding: 0 0 0.06cm; }
  .quand strong { display: block; }
  .horaire, .heures { display: block; font-size: 9pt; color: #4a5468; }
  .classe { font-weight: 700; overflow-wrap: anywhere; }
  .contenu { min-width: 0; }
  .chapitre { margin: 0; font-weight: 600; }
  .niveau { font-weight: 400; color: #4a5468; font-size: 9pt; }
  ul { margin: 0.04cm 0 0; padding-left: 0.5cm; }
  li { margin: 0 0 0.03cm; overflow-wrap: anywhere; }
  .lien { display: block; font-size: 7.5pt; color: #4a5468; overflow-wrap: anywhere; }
  .exercices { font-size: 10pt; }
  p { margin: 0; overflow-wrap: anywhere; }
  .detail { margin-top: 0.04cm; font-size: 10pt; }
  .remarque { color: #4a5468; }
  .vide { color: #4a5468; font-style: italic; }
  .semaine-vide { padding: 0.12cm 0; }
  .conge { margin: 0.18cm 0; padding: 0.1cm 0.25cm; background: #eef0f5; border-left: 3px solid #8a93a6; font-style: italic; break-inside: avoid; }
  .synthese { margin-top: 0.45cm; padding-top: 0.15cm; border-top: 1px solid #1d2433; break-inside: avoid; }
  .synthese.globale { border-top-width: 2px; }
  .synthese ul { font-size: 9.5pt; }
  .par-classe { font-size: 9.5pt; margin-top: 0.06cm; }
  .pied-ecran { margin-top: 0.6cm; font-size: 8.5pt; color: #4a5468; border-top: 1px solid #c8cdd8; padding-top: 0.15cm; }
</style>
</head>
<body>
<header>
  <p class="surtitre">${e(['Carnet de matière vue', ...a.ecoles, options.professeur].filter(Boolean).join(' · '))}</p>
  <h1>${e(titreAgenda(a))}</h1>
  <p class="periode">${e(periode.charAt(0).toUpperCase() + periode.slice(1))}</p>
  ${plusieurs && a.classes.length > 0 ? `<p class="note">Classes : ${e(a.classes.map((k) => k.nom.trim()).join(', '))}</p>` : ''}
  ${a.aConfirmer.length > 0 ? `<p class="note">Calendrier FWB ${e(a.aConfirmer.join(', '))} à confirmer : ses congés ne sont pas indiqués.</p>` : ''}
</header>
${corps}
${synthese(a.synthese, parClasse ? 'Synthèse de toutes les classes' : 'Synthèse de la période', true)}
<footer class="pied-ecran">${e([options.professeur, 'math-belgium.vercel.app — agenda du professeur'].filter(Boolean).join(' · '))}</footer>
${SCRIPT_IMPRESSION}
</body>
</html>`
}
