/**
 * Agenda d'une période du carnet (phase 2 des comptes) — logique PURE, sans React ni supabase-js :
 * séances d'une classe (ou de toutes) entre deux dates INCLUSES, groupées par semaine, congés FWB de
 * la période, semaines sans séance, synthèse (séances, heures — heure double = 2 —, chapitres,
 * sections) et texte « Copier pour Smartschool » de toute la période. La fiche A4 HTML est dans
 * `carnetFiche.ts::agendaPeriodeHtml`. Aucune donnée nouvelle : tout se calcule à partir des séances.
 */
import { findChapter, LEVELS } from '../content/chaptersIndex'
import { ajouterJours, CALENDRIER_FWB, etatJour, estJourDeClasse, jourIso, type CongeFwb } from './calendrierFwb'
import {
  dateLongue,
  echapperHtml,
  heuresSeance,
  htmlSmartschool,
  lignesPartiesVues,
  minutesHeure,
  resoudreSeance,
  slugTitre,
  structureChapitre,
  texteBrut,
  texteSmartschool,
  type Classe,
  type FormatHoraire,
  type Seance,
  type SeanceResolue,
} from './carnet'
import { chapitresDansMonOrdre, numeroAffiche, ordreCourant } from './ordreChapitres'

/* ------------------------------------------------------------------------------- dates */

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

export function dateValide(iso: string): boolean {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!r) return false
  const a = Number(r[1])
  const m = Number(r[2])
  const j = Number(r[3])
  if (a < 2000 || a > 2100 || m < 1 || m > 12 || j < 1) return false
  return j <= new Date(Date.UTC(a, m, 0)).getUTCDate()
}

/** Lundi de la semaine d'une date. */
export function lundiDe(iso: string): string {
  return ajouterJours(iso, 1 - (jourIso(iso) || 1))
}

/** « 15 septembre » (avec l'année si `avecAnnee`). */
export function jourMois(iso: string, avecAnnee = false): string {
  const j = Number(iso.slice(8, 10))
  return `${j === 1 ? '1er' : j} ${MOIS[Number(iso.slice(5, 7)) - 1]}${avecAnnee ? ` ${iso.slice(0, 4)}` : ''}`
}

/** « du lundi 1er septembre au vendredi 18 décembre 2026 » ; « le lundi 2 novembre 2026 » pour un
 * seul jour ; deux années : chacune écrite. */
export function periodeTexte(du: string, au: string): string {
  if (du === au) return `le ${dateLongue(du)}`
  if (du.slice(0, 4) === au.slice(0, 4)) return `du ${dateLongue(du).replace(/ \d{4}$/, '')} au ${dateLongue(au)}`
  return `du ${dateLongue(du)} au ${dateLongue(au)}`
}

/* ------------------------------------------------------------------------- raccourcis */

export type Raccourci = 'semaine' | 'mois' | 'rentree' | 'dernierConge'

export const LIBELLE_RACCOURCI: Record<Raccourci, string> = {
  semaine: 'Cette semaine',
  mois: 'Ce mois-ci',
  rentree: 'Depuis la rentrée',
  dernierConge: 'Du dernier congé à aujourd’hui',
}

/** Rentrée de l'année scolaire en cours (ou de celle qui vient de finir, pendant l'été) ; année
 * absente du calendrier : 1er septembre. */
export function rentreeDe(aujourdhui: string): string {
  const passees = CALENDRIER_FWB.filter((a) => a.debut <= aujourdhui).sort((x, y) => (x.debut < y.debut ? 1 : -1))
  const a = passees[0]
  if (a && aujourdhui <= ajouterJours(a.fin, 80)) return a.debut
  const annee = Number(aujourdhui.slice(0, 4))
  return Number(aujourdhui.slice(5, 7)) >= 9 ? `${annee}-09-01` : `${annee - 1}-09-01`
}

/** Toutes les vacances et tous les jours de congé connus, vacances d'été comprises (entre deux années
 * du calendrier). */
function tousLesConges(): CongeFwb[] {
  const annees = [...CALENDRIER_FWB].sort((x, y) => (x.debut < y.debut ? -1 : 1))
  const liste: CongeFwb[] = annees.flatMap((a) => a.conges)
  for (let i = 0; i + 1 < annees.length; i++) liste.push({ du: ajouterJours(annees[i].fin, 1), au: ajouterJours(annees[i + 1].debut, -1), libelle: 'Vacances d’été' })
  return liste.sort((x, y) => (x.du < y.du ? -1 : 1))
}

/** Premier jour de classe après les dernières vacances (congé de plusieurs jours) finies avant
 * aujourd'hui ; aucune : la rentrée. */
export function debutDepuisDernierConge(aujourdhui: string): string {
  const fini = tousLesConges()
    .filter((c) => c.au > c.du && c.au < aujourdhui)
    .sort((x, y) => (x.au < y.au ? 1 : -1))[0]
  if (!fini) return rentreeDe(aujourdhui)
  let d = ajouterJours(fini.au, 1)
  for (let i = 0; i < 30 && d < aujourdhui && !estJourDeClasse(d); i++) d = ajouterJours(d, 1)
  return d
}

export function periodeRaccourci(r: Raccourci, aujourdhui: string): { du: string; au: string } {
  if (r === 'semaine') {
    const lundi = lundiDe(aujourdhui)
    return { du: lundi, au: ajouterJours(lundi, 4) }
  }
  if (r === 'mois') {
    const a = Number(aujourdhui.slice(0, 4))
    const m = Number(aujourdhui.slice(5, 7))
    return { du: `${aujourdhui.slice(0, 7)}-01`, au: `${aujourdhui.slice(0, 7)}-${String(new Date(Date.UTC(a, m, 0)).getUTCDate()).padStart(2, '0')}` }
  }
  if (r === 'rentree') return { du: rentreeDe(aujourdhui), au: aujourdhui }
  return { du: debutDepuisDernierConge(aujourdhui), au: aujourdhui }
}

/* ------------------------------------------------------------------------- congés */

export interface CongePeriode {
  /** Premier jour de semaine (lun.–ven.) du congé DANS la période. */
  du: string
  /** Dernier jour de semaine du congé dans la période. */
  au: string
  libelle: string
}

/** Congés FWB (vacances d'été comprises) qui touchent la période, réduits à leurs jours de semaine
 * dans la période (« du lundi 19 octobre au vendredi 30 octobre 2026 ») ; un congé tombé un week-end
 * (27 septembre 2026, un dimanche) n'est pas cité. */
export function congesDeLaPeriode(du: string, au: string): CongePeriode[] {
  const resultat: CongePeriode[] = []
  for (const c of tousLesConges()) {
    if (c.au < du || c.du > au) continue
    let d = c.du > du ? c.du : du
    let f = c.au < au ? c.au : au
    while (d <= f && jourIso(d) > 5) d = ajouterJours(d, 1)
    while (f >= d && jourIso(f) > 5) f = ajouterJours(f, -1)
    if (d <= f) resultat.push({ du: d, au: f, libelle: c.libelle })
  }
  return resultat
}

export function texteConge(c: CongePeriode): string {
  return `${c.libelle} : ${c.du === c.au ? dateLongue(c.du) : periodeTexte(c.du, c.au)}`
}

/* ------------------------------------------------------------------------- agenda */

export interface SeanceAgenda {
  seance: Seance
  classe: Classe
  r: SeanceResolue
  heures: number
  /** Sections vues (ids), pour la synthèse. */
  sections: string[]
}

export type ElementSemaine = { type: 'seance'; date: string; s: SeanceAgenda } | { type: 'conge'; date: string; conge: CongePeriode }

export type BlocAgenda =
  | { type: 'semaine'; lundi: string; elements: ElementSemaine[]; seances: number }
  /** Congé hors de toute semaine affichée (semaine entière de vacances sans séance). */
  | { type: 'conge'; conge: CongePeriode }

export interface SyntheseAgenda {
  seances: number
  heures: number
  chapitres: { cle: string; numero: number | null; titre: string; niveau: string; sections: number }[]
  sections: number
  parClasse: { classe: Classe; seances: number; heures: number }[]
}

export interface GroupeAgenda {
  /** `null` : toutes les classes ensemble (tableau unique). */
  classe: Classe | null
  blocs: BlocAgenda[]
  synthese: SyntheseAgenda
}

export interface Agenda {
  du: string
  au: string
  /** `null` : toutes les classes. */
  classe: Classe | null
  /** Classes ayant au moins une séance dans la période (ordre du nom). */
  classes: Classe[]
  ecoles: string[]
  groupes: GroupeAgenda[]
  synthese: SyntheseAgenda
  /** Années au calendrier FWB inconnu touchées par la période (« 2029-2030 »). */
  aConfirmer: string[]
  vide: boolean
}

export interface ParametresAgenda {
  seances: Seance[]
  classes: Classe[]
  /** Nom de chaque école (id → nom). */
  ecoles: Map<string, string>
  du: string
  au: string
  /** `null` : toutes mes classes. */
  classeId: string | null
  format: FormatHoraire
  /** L'école de la classe a une grille horaire (« H2 (09h35 → 10h25) »). */
  avecGrille: (classe: Classe) => boolean
  /** Durée d'une heure de cours pour la classe (séance sans numéro de fin). */
  dureeHeure: (classe: Classe) => number
  lienGenerateur?: (chantier: string, id: string) => string
  /** Toutes les classes : une section par classe au lieu d'un tableau unique. */
  parClasse: boolean
  /** Une semaine qui commence après ce jour n'est pas signalée « sans séance ». */
  aujourdhui: string
}

/** Clé de tri d'une séance dans sa journée : heure de début, sinon numéro d'heure, sinon la fin. */
function cleHeure(s: Seance): number {
  const d = minutesHeure(s.heure_debut)
  if (d !== null) return d
  if (s.numero_heure !== null && s.numero_heure !== undefined) return 7 * 60 + s.numero_heure * 55
  return 24 * 60
}

export function seancesDeLaPeriode(seances: Seance[], du: string, au: string, classeIds: Set<string> | null): Seance[] {
  return seances.filter((s) => s.date_seance >= du && s.date_seance <= au && (classeIds === null || classeIds.has(s.classe_id)))
}

function trier(liste: SeanceAgenda[]): SeanceAgenda[] {
  return [...liste].sort(
    (a, b) =>
      (a.seance.date_seance < b.seance.date_seance ? -1 : a.seance.date_seance > b.seance.date_seance ? 1 : 0) ||
      cleHeure(a.seance) - cleHeure(b.seance) ||
      a.classe.nom.localeCompare(b.classe.nom, 'fr') ||
      (a.seance.cree_le < b.seance.cree_le ? -1 : 1),
  )
}

/** Semaines de la période : séances, congés (une fois, dans la première semaine qu'ils touchent),
 * semaines sans séance ; une semaine entièrement en congé et sans séance ne laisse que la ligne du
 * congé. */
export function blocsParSemaine(liste: SeanceAgenda[], du: string, au: string, aujourdhui: string, conges = congesDeLaPeriode(du, au)): BlocAgenda[] {
  const blocs: BlocAgenda[] = []
  const annonces = new Set<CongePeriode>()
  for (let lundi = lundiDe(du); lundi <= au; lundi = ajouterJours(lundi, 7)) {
    const dimanche = ajouterJours(lundi, 6)
    const vendredi = ajouterJours(lundi, 4)
    const seances = liste.filter((s) => s.seance.date_seance >= lundi && s.seance.date_seance <= dimanche)
    const nouveaux = conges.filter((c) => !annonces.has(c) && c.du <= vendredi && c.au >= lundi)
    nouveaux.forEach((c) => annonces.add(c))
    let joursDeClasse = 0
    for (let d = lundi; d <= vendredi; d = ajouterJours(d, 1)) if (d >= du && d <= au && estJourDeClasse(d)) joursDeClasse++
    if (seances.length === 0 && (joursDeClasse === 0 || lundi > aujourdhui)) {
      nouveaux.forEach((c) => blocs.push({ type: 'conge', conge: c }))
      continue
    }
    const elements: ElementSemaine[] = [
      ...nouveaux.map((c): ElementSemaine => ({ type: 'conge', date: c.du < lundi ? lundi : c.du, conge: c })),
      ...seances.map((s): ElementSemaine => ({ type: 'seance', date: s.seance.date_seance, s })),
    ]
    // Ordre chronologique ; le même jour, le congé d'abord.
    elements.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.type === b.type ? 0 : a.type === 'conge' ? -1 : 1))
    blocs.push({ type: 'semaine', lundi, elements, seances: seances.length })
  }
  return blocs
}

export function syntheseAgenda(liste: SeanceAgenda[]): SyntheseAgenda {
  const chapitres = new Map<string, { cle: string; numero: number | null; titre: string; niveau: string; sections: Set<string>; ordre: number }>()
  const parClasse = new Map<string, { classe: Classe; seances: number; heures: number }>()
  for (const s of liste) {
    const cle = `${s.seance.niveau}/${s.seance.chapitre}`
    let c = chapitres.get(cle)
    if (!c) {
      const chap = findChapter(s.seance.niveau, s.seance.chapitre)
      const niveauIndex = LEVELS.findIndex((l) => l.slug === s.seance.niveau)
      c = {
        cle,
        // Agenda imprimé / copié : numéro du professeur s'il a rangé ses chapitres, sinon titre seul.
        numero: chap ? numeroAffiche(chap) : null,
        titre: chap ? texteBrut(chap.title) : s.seance.chapitre,
        niveau: chap ? chap.level : s.seance.niveau,
        sections: new Set(),
        ordre: (niveauIndex < 0 ? 99 : niveauIndex) * 1000 + (chap ? chapitresDansMonOrdre(chap.levelSlug, ordreCourant()).findIndex((x) => x.slug === chap.slug) + 1 : 999),
      }
      chapitres.set(cle, c)
    }
    s.sections.forEach((id) => c.sections.add(id))
    const k = parClasse.get(s.classe.id) ?? { classe: s.classe, seances: 0, heures: 0 }
    k.seances++
    k.heures += s.heures
    parClasse.set(s.classe.id, k)
  }
  const liste2 = [...chapitres.values()].sort((a, b) => a.ordre - b.ordre)
  return {
    seances: liste.length,
    heures: liste.reduce((t, s) => t + s.heures, 0),
    chapitres: liste2.map(({ cle, numero, titre, niveau, sections }) => ({ cle, numero, titre, niveau, sections: sections.size })),
    sections: liste2.reduce((t, c) => t + c.sections.size, 0),
    parClasse: [...parClasse.values()].sort((a, b) => a.classe.nom.localeCompare(b.classe.nom, 'fr')),
  }
}

export function construireAgenda(p: ParametresAgenda): Agenda {
  const du = p.du <= p.au ? p.du : p.au
  const au = p.du <= p.au ? p.au : p.du
  const classe = p.classeId ? (p.classes.find((c) => c.id === p.classeId) ?? null) : null
  const ids = p.classeId ? new Set([p.classeId]) : null
  const liste = trier(
    seancesDeLaPeriode(p.seances, du, au, ids).flatMap((seance): SeanceAgenda[] => {
      const k = p.classes.find((c) => c.id === seance.classe_id)
      if (!k) return []
      const chap = findChapter(seance.niveau, seance.chapitre)
      return [
        {
          seance,
          classe: k,
          r: resoudreSeance(seance, k, { format: p.format, ecole: p.ecoles.get(k.ecole_id) ?? '', lienGenerateur: p.lienGenerateur, avecGrille: p.avecGrille(k) }),
          heures: heuresSeance(seance, p.dureeHeure(k)),
          sections: chap ? lignesPartiesVues(seance.parties, structureChapitre(chap)).map((l) => l.sectionId) : [],
        },
      ]
    }),
  )
  const classes = [...new Map(liste.map((s) => [s.classe.id, s.classe])).values()].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
  const conges = congesDeLaPeriode(du, au)
  const groupes: GroupeAgenda[] =
    !classe && p.parClasse
      ? classes.map((k) => {
          const sous = liste.filter((s) => s.classe.id === k.id)
          return { classe: k, blocs: blocsParSemaine(sous, du, au, p.aujourdhui, conges), synthese: syntheseAgenda(sous) }
        })
      : [{ classe, blocs: blocsParSemaine(liste, du, au, p.aujourdhui, conges), synthese: syntheseAgenda(liste) }]
  const aConfirmer = new Set<string>()
  for (let d = du, i = 0; d <= au && i < 4000; d = ajouterJours(d, 1), i++) {
    const e = etatJour(d)
    if (e.type === 'inconnu') aConfirmer.add(e.annee)
  }
  const ecolesIds = classe ? [classe.ecole_id] : [...new Set(classes.map((k) => k.ecole_id))]
  return {
    du,
    au,
    classe,
    classes,
    ecoles: ecolesIds.map((id) => p.ecoles.get(id) ?? '').filter(Boolean),
    groupes,
    synthese: syntheseAgenda(liste),
    aConfirmer: [...aConfirmer],
    vide: liste.length === 0,
  }
}

/* ------------------------------------------------------------------------- textes */

export interface OptionsSortieAgenda {
  /** Remarques libres du professeur : DÉCOCHÉ par défaut (note privée, comme pour Smartschool). */
  remarques: boolean
  /** Liens vers les sections du cours et les générateurs : coché par défaut. */
  liens: boolean
}

export const OPTIONS_SORTIE_DEFAUT: OptionsSortieAgenda = { remarques: false, liens: true }

export function titreAgenda(a: Pick<Agenda, 'classe'>): string {
  return a.classe ? `Agenda — ${a.classe.nom.trim()}` : 'Agenda — toutes les classes'
}

/** « Semaine du 15 septembre » (avec l'année si la période s'étend sur deux années civiles). */
export function titreSemaine(lundi: string, a: Pick<Agenda, 'du' | 'au'>): string {
  return `Semaine du ${jourMois(lundi, a.du.slice(0, 4) !== a.au.slice(0, 4))}`
}

const pluriel = (n: number, mot: string, motPluriel = `${mot}s`) => `${n} ${n > 1 ? motPluriel : mot}`

/** « 12 séances · 15 heures de cours · 2 chapitres · 7 sections ». */
export function texteSynthese(s: SyntheseAgenda): string {
  return [pluriel(s.seances, 'séance'), `${pluriel(s.heures, 'heure')} de cours`, pluriel(s.chapitres.length, 'chapitre'), pluriel(s.sections, 'section')].join(' · ')
}

export function texteChapitreSynthese(c: SyntheseAgenda['chapitres'][number]): string {
  return `${c.niveau} — ${c.numero !== null ? `Ch. ${c.numero} — ` : ''}${c.titre} (${pluriel(c.sections, 'section')})`
}

export const MESSAGE_SEMAINE_VIDE = 'Aucune séance notée cette semaine.'

/** Texte brut de toute la période pour Smartschool : même format qu'une séance, semaine par semaine,
 * congés et semaines sans séance signalés, synthèse à la fin. */
export function texteSmartschoolAgenda(a: Agenda, options: OptionsSortieAgenda = OPTIONS_SORTIE_DEFAUT): string {
  const opt = { liens: options.liens, remarque: options.remarques }
  const lignes: string[] = [`${titreAgenda(a)} — ${periodeTexte(a.du, a.au)}`]
  for (const g of a.groupes) {
    if (g.classe && !a.classe) lignes.push('', `■ ${g.classe.nom.trim()}`)
    for (const b of g.blocs) {
      if (b.type === 'conge') {
        lignes.push('', texteConge(b.conge))
        continue
      }
      lignes.push('', `— ${titreSemaine(b.lundi, a)} —`)
      for (const e of b.elements) lignes.push('', e.type === 'conge' ? texteConge(e.conge) : texteSmartschool(e.s.r, opt))
      if (b.seances === 0) lignes.push('', MESSAGE_SEMAINE_VIDE)
    }
    if (g.classe && !a.classe) lignes.push('', `${g.classe.nom.trim()} : ${texteSynthese(g.synthese)}`)
  }
  lignes.push('', `Synthèse : ${texteSynthese(a.synthese)}`)
  return lignes.join('\n')
}

/** Même contenu en HTML simple (collage riche dans l'éditeur de Smartschool). */
export function htmlSmartschoolAgenda(a: Agenda, options: OptionsSortieAgenda = OPTIONS_SORTIE_DEFAUT): string {
  const e = echapperHtml
  const opt = { liens: options.liens, remarque: options.remarques }
  const h: string[] = [`<p><strong>${e(`${titreAgenda(a)} — ${periodeTexte(a.du, a.au)}`)}</strong></p>`]
  for (const g of a.groupes) {
    if (g.classe && !a.classe) h.push(`<h3>${e(g.classe.nom.trim())}</h3>`)
    for (const b of g.blocs) {
      if (b.type === 'conge') {
        h.push(`<p><em>${e(texteConge(b.conge))}</em></p>`)
        continue
      }
      h.push(`<h4>${e(titreSemaine(b.lundi, a))}</h4>`)
      for (const el of b.elements) h.push(el.type === 'conge' ? `<p><em>${e(texteConge(el.conge))}</em></p>` : htmlSmartschool(el.s.r, opt))
      if (b.seances === 0) h.push(`<p><em>${e(MESSAGE_SEMAINE_VIDE)}</em></p>`)
    }
  }
  h.push(`<p><strong>Synthèse :</strong> ${e(texteSynthese(a.synthese))}</p>`)
  return h.join('')
}

/** Nom ASCII du fichier téléchargé (un accent dans `download` fait perdre le nom dans Chromium) :
 * `agenda-5e-b-2026-09-01-au-2026-12-18.html`. */
export function nomFichierAgenda(a: Pick<Agenda, 'classe' | 'du' | 'au'>): string {
  return `agenda-${a.classe ? slugTitre(a.classe.nom) : 'toutes-classes'}-${a.du}-au-${a.au}.html`
}
