/**
 * Petits outils d'interface du carnet (presse-papiers, fiche, mémoire de la classe active, largeur
 * d'écran).
 */
import { useEffect, useState } from 'react'
import { findChapter, LEVELS } from '../../content/chaptersIndex'
import { ajouterJours, CALENDRIER_FWB, estJourDeClasse } from '../../lib/calendrierFwb'
import { dateLongue, jourSemaine, lignesPartiesVues, structureChapitre, texteBrut, type Classe, type Seance } from '../../lib/carnet'
import { lundiDe } from '../../lib/carnetAgenda'

/** Vrai si l'écran est assez large pour le tableau de la semaine (sinon : un jour à la fois). */
export function useEcranLarge(requete = '(min-width: 720px)'): boolean {
  const [large, setLarge] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(requete).matches)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const m = window.matchMedia(requete)
    const suivre = () => setLarge(m.matches)
    suivre()
    m.addEventListener('change', suivre)
    return () => m.removeEventListener('change', suivre)
  }, [requete])
  return large
}

const CLE_OUBLIEES = 'math-belgium-carnet-oubliees-depuis'

/** Date de départ choisie pour le rappel des oubliées (par appareil) ; `null` = par défaut. */
export function lireDepuisOubliees(): string | null {
  try {
    const v = localStorage.getItem(CLE_OUBLIEES)
    return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null
  } catch {
    return null
  }
}

export function memoriserDepuisOubliees(v: string | null): void {
  try {
    if (v) localStorage.setItem(CLE_OUBLIEES, v)
    else localStorage.removeItem(CLE_OUBLIEES)
  } catch {
    // stockage indisponible : simple confort perdu
  }
}
/** Copie `texte` (et `html` quand le navigateur sait coller du texte riche). Faux si aucune méthode
 * n'a marché : l'appelant affiche alors le texte à copier à la main. */
export async function copierTexte(texte: string, html?: string): Promise<boolean> {
  try {
    if (html && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/plain': new Blob([texte], { type: 'text/plain' }), 'text/html': new Blob([html], { type: 'text/html' }) }),
      ])
      return true
    }
  } catch {
    // collage riche refusé : on retente en texte seul
  }
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(texte)
      return true
    }
  } catch {
    // presse-papiers indisponible (page non sécurisée, permission refusée…)
  }
  const zone = document.createElement('textarea')
  zone.value = texte
  zone.setAttribute('readonly', '')
  zone.style.position = 'fixed'
  zone.style.top = '0'
  zone.style.opacity = '0'
  document.body.appendChild(zone)
  zone.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  zone.remove()
  return ok
}

/** Ouvre la fiche dans un nouvel onglet par un lien (jamais `window.open`) ; `#imprimer` lance
 * l'impression au chargement (même mécanisme que les documents du panneau). */
export function ouvrirFiche(html: string): void {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const lien = document.createElement('a')
  lien.href = `${url}#imprimer`
  lien.target = '_blank'
  lien.rel = 'noopener'
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  // L'onglet a lu le document : l'URL peut être libérée plus tard.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/** Téléchargement de la fiche (`<a download>`) ; l'URL n'est libérée qu'après coup (la libérer
 * aussitôt fait perdre le nom du fichier dans certains navigateurs). */
export function telechargerFiche(html: string, nomFichier: string): void {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nomFichier.replace(/[\\/:*?"<>|]/g, '-')
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

const CLE_CLASSE = 'math-belgium-carnet-classe'

export function lireClasseMemorisee(): string | null {
  try {
    return localStorage.getItem(CLE_CLASSE)
  } catch {
    return null
  }
}

export function memoriserClasse(id: string): void {
  try {
    localStorage.setItem(CLE_CLASSE, id)
  } catch {
    // stockage indisponible : simple confort perdu
  }
}

/* ------------------------------------------------------------ repères et résumés (refonte) */

export function capitale(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** Séances de la plus récente à la plus ancienne (même jour : la dernière créée d'abord). */
export function trierRecentes<S extends Pick<Seance, 'date_seance' | 'cree_le'>>(seances: S[]): S[] {
  return [...seances].sort((a, b) => (a.date_seance < b.date_seance ? 1 : a.date_seance > b.date_seance ? -1 : a.cree_le < b.cree_le ? 1 : -1))
}

/** Chapitre proposé pour une nouvelle séance d'une classe : celui de sa dernière séance (chapitre
 * « en cours »), sinon le premier de son niveau. */
export function chapitreParDefaut(classeId: string | undefined, classes: Classe[], seances: Seance[]): string {
  const enCours = classeId ? chapitreEnCours(classeId, seances) : ''
  if (enCours) return enCours
  const k = classes.find((c) => c.id === classeId)
  const premier = k?.niveau ? LEVELS.find((l) => l.slug === k.niveau)?.chapters[0] : undefined
  return premier && k?.niveau ? `${k.niveau}/${premier.slug}` : ''
}

/** Chapitre « en cours » d'une classe (celui de sa dernière séance AVEC matière vue — une séance d'annonce d'une
 * évaluation ou d'un devoir, sans matière, ne compte pas : elle porte le chapitre de l'évaluation), ou `''`. */
export function chapitreEnCours(classeId: string, seances: Seance[]): string {
  const siennes = seances.filter((s) => s.classe_id === classeId)
  const avecMatiere = siennes.filter((s) => s.parties.length > 0 || s.generateurs.length > 0)
  const derniere = trierRecentes(avecMatiere.length > 0 ? avecMatiere : siennes)[0]
  return derniere && findChapter(derniere.niveau, derniere.chapitre) ? `${derniere.niveau}/${derniere.chapitre}` : ''
}

/** Minutes → « 08h45 ». */
export function heureCourte(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}h${String(m % 60).padStart(2, '0')}`
}

/** « 20/11 ». */
export function jourMois(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
}

const JOURS_ABREGES = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.']
const MOIS_ABREGES = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

/** « Ven. 20 nov. » */
export function dateAbregee(iso: string): string {
  const j = Number(iso.slice(8, 10))
  return `${JOURS_ABREGES[jourSemaine(iso)] ?? ''} ${j === 1 ? '1er' : j} ${MOIS_ABREGES[Number(iso.slice(5, 7)) - 1] ?? ''}`
}

/** Période (entre deux vacances de plusieurs jours) et numéro de semaine de cours depuis la rentrée
 * FWB, pour l'en-tête « Période 2 · semaine 11 ». `null` hors d'une année connue du calendrier ;
 * `semaine` nulle si la semaine n'a aucun jour de classe (vacances). */
export function reperesScolaires(iso: string): { periode: number; semaine: number | null } | null {
  const annee = CALENDRIER_FWB.find((a) => iso >= a.debut && iso <= a.fin)
  if (!annee) return null
  const periode = 1 + annee.conges.filter((c) => c.au > c.du && c.au < iso).length
  const cible = lundiDe(iso)
  let semaine = 0
  let classeCetteSemaine = false
  for (let lundi = lundiDe(annee.debut); lundi <= cible; lundi = ajouterJours(lundi, 7)) {
    let classe = false
    for (let i = 0; i < 5; i++) if (estJourDeClasse(ajouterJours(lundi, i))) classe = true
    if (classe) semaine++
    if (lundi === cible) classeCetteSemaine = classe
  }
  return { periode, semaine: classeCetteSemaine ? semaine : null }
}

export function texteReperes(iso: string): string {
  const r = reperesScolaires(iso)
  if (!r) return ''
  return r.semaine === null ? `Période ${r.periode}` : `Période ${r.periode} · semaine ${r.semaine}`
}

/** Résumé court d'une séance : titre du chapitre, sections vues (« 6. Relation de Chasles »), et
 * numéros (« § 6, 7 »). */
export function resumeSeance(s: Pick<Seance, 'niveau' | 'chapitre' | 'parties'>): { chapitre: string; sections: string[]; numeros: string } {
  const ch = findChapter(s.niveau, s.chapitre)
  if (!ch) return { chapitre: `Chapitre retiré du site (${s.chapitre})`, sections: [], numeros: '' }
  const lignes = lignesPartiesVues(s.parties, structureChapitre(ch))
  return {
    chapitre: texteBrut(ch.title),
    sections: lignes.map((l) => `${l.numero}. ${l.titreSection}`),
    numeros: lignes.length > 0 ? `§ ${lignes.map((l) => l.numero).join(', ')}` : '',
  }
}

/** « Limites et asymptotes, § 3 Asymptotes » : la dernière séance de la classe AVANT ce créneau
 * (dernière section vue), pour « dernière fois : … ». */
export function derniereFois(seances: Seance[], classeId: string, date: string, numeroHeure: number | null = null): string | null {
  const avant = seances.filter(
    (s) => s.classe_id === classeId && (s.date_seance < date || (s.date_seance === date && numeroHeure !== null && s.numero_heure !== null && s.numero_heure < numeroHeure)),
  )
  const s = trierRecentes(avant)[0]
  if (!s) return null
  const ch = findChapter(s.niveau, s.chapitre)
  if (!ch) return null
  const lignes = lignesPartiesVues(s.parties, structureChapitre(ch))
  const derniere = lignes[lignes.length - 1]
  return derniere ? `${texteBrut(ch.title)}, § ${derniere.numero} ${derniere.titreSection}` : texteBrut(ch.title)
}

/** « Semaine du 16 au 20 novembre » / « … du 30 novembre au 4 décembre ». */
export function titreSemaine(lundi: string): string {
  const vendredi = ajouterJours(lundi, 4)
  const debut = dateLongue(lundi, false).replace(/ \d{4}$/, '')
  const fin = dateLongue(vendredi, false).replace(/ \d{4}$/, '')
  const memeMois = lundi.slice(5, 7) === vendredi.slice(5, 7)
  return `Semaine du ${memeMois ? debut.split(' ')[0] : debut} au ${fin}`
}
