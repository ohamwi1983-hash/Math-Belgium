import { LEVELS } from '../content/chaptersIndex'
import { lireDernieresEtapes } from './parcoursChapitre'

/**
 * Année choisie sur la page d'accueil (« Mon année d'abord »), mémorisée dans CE navigateur
 * seulement (`localStorage`, rien d'envoyé ; try/catch partout : navigation privée, stockage bloqué).
 *
 * L'année est aussi posée sur `<html data-annee-accueil="…">`, qui décide en CSS ce que l'accueil
 * montre (cartes « Tu es en… » ou chapitres de l'année). Le petit script en ligne de `index.html`
 * pose le même attribut AVANT le chargement du JS, à partir des mêmes clés (année choisie, sinon
 * année de la dernière étape ouverte) : la page pré-rendue n'affiche pas les cartes de choix à un
 * élève qui a déjà choisi. Garder les deux en accord (noms des clés ci-dessous).
 */
export const CLE_ANNEE = 'accueil:annee'
export const ATTRIBUT_ANNEE = 'data-annee-accueil'

const existe = (slug: string | null | undefined): slug is string => !!slug && LEVELS.some((l) => l.slug === slug)

export function lireAnneeChoisie(): string | null {
  try {
    const v = window.localStorage.getItem(CLE_ANNEE)
    return existe(v) ? v : null
  } catch {
    return null
  }
}

export function ecrireAnneeChoisie(slug: string): void {
  try {
    window.localStorage.setItem(CLE_ANNEE, slug)
  } catch {
    // Stockage indisponible : le choix vaut pour la visite.
  }
}

/** Année choisie, sinon celle de la dernière étape ouverte (un élève qui a déjà lu un chapitre n'a
 * pas à choisir), sinon `null` (première visite : cartes « Tu es en… »). */
export function anneeDeDepart(): string | null {
  const choisie = lireAnneeChoisie()
  if (choisie) return choisie
  const dernieres = Object.entries(lireDernieresEtapes()).filter(([niveau]) => existe(niveau))
  if (!dernieres.length) return null
  return dernieres.reduce((a, b) => (b[1].quand > a[1].quand ? b : a))[0]
}
