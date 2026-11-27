/**
 * Matière vue proposée en fin de projection : lecture du carnet (mêmes fonctions que `CarnetPage` :
 * classes, horaire 0003, agenda 0006 facultatif, séances avec les colonnes 0007 / 0008 si elles existent)
 * et construction de la proposition à partir du suivi de la projection. Client Supabase injecté.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ChapterContent } from '../../content/types'
import { dateIso, type Classe, type Seance } from '../carnet'
import { chargerHoraire, chargerSeances, ErreurCarnet, listerClasses, type DonneesHoraire } from '../carnetDonnees'
import { AGENDA_INACTIF, chargerAgenda, type DonneesAgenda } from '../agendaDonnees'
import { predicatSuppression } from '../agendaEvenements'
import type { HeureSupprimee } from '../horaire'
import { creneauDeLaProjection, etapesMontrees, type DiapoSuivie, type PropositionMatiere } from './matiereProjetee'
import type { SuiviProjection } from './suiviProjection'

export interface DonneesMatiere {
  classes: Classe[]
  seances: Seance[]
  horaire: DonneesHoraire
  agenda: DonneesAgenda
  /** 0007 appliqué (colonnes du devoir, « Pour le »). */
  devoirs: boolean
  /** 0008 appliqué. */
  generateursEval: boolean
}

/** `null` : carnet pas encore activé (0002 absent) — rien à proposer. */
export async function chargerDonneesMatiere(c: SupabaseClient): Promise<DonneesMatiere | null> {
  try {
    const [classes, horaire, agenda] = await Promise.all([listerClasses(c), chargerHoraire(c), chargerAgenda(c).catch(() => AGENDA_INACTIF)])
    const { seances, devoirs, generateursEval } = await chargerSeances(c, horaire.actif)
    return { classes, seances, horaire, agenda, devoirs, generateursEval }
  } catch (ex) {
    if (ex instanceof ErreurCarnet && ex.tableAbsente) return null
    throw ex
  }
}

/** Heures supprimées par l'agenda (sortie, journée pédagogique, absence…), si 0003 et 0006 sont là. */
export function suppressionDe(d: Pick<DonneesMatiere, 'horaire' | 'agenda' | 'classes'>): HeureSupprimee | undefined {
  if (!d.horaire.actif || !d.agenda.actif) return undefined
  return predicatSuppression({ evenements: d.agenda.evenements, classes: d.classes, grilles: d.horaire.grilles })
}

const minutesDuJour = (t: Date) => t.getHours() * 60 + t.getMinutes()

/**
 * Proposition de fin de projection, ou `null` : rien de montré, déjà enregistrée, carnet / horaire absents, ou
 * projection hors d'une heure de cours d'une classe de l'année du chapitre (préparation chez soi).
 */
export function propositionDepuisSuivi(chapitre: ChapterContent, diapos: DiapoSuivie[], suivi: SuiviProjection, donnees: DonneesMatiere | null, maintenant: number): PropositionMatiere | null {
  if (!donnees || suivi.enregistre || !donnees.horaire.actif) return null
  const etapes = etapesMontrees(chapitre, diapos, suivi.vues)
  if (etapes.length === 0 && suivi.generateurs.length === 0) return null
  const fin = new Date(maintenant)
  const date = dateIso(fin)
  const debut = new Date(suivi.debut)
  const trouve = creneauDeLaProjection({
    date,
    debut: dateIso(debut) === date ? minutesDuJour(debut) : 0,
    fin: minutesDuJour(fin),
    niveau: chapitre.levelSlug,
    classes: donnees.classes,
    grilles: donnees.horaire.grilles,
    cases: donnees.horaire.cases,
    supprimee: suppressionDe(donnees),
  })
  if (!trouve) return null
  const { creneau } = trouve
  return {
    id: suivi.id,
    niveau: chapitre.levelSlug,
    chapitre: chapitre.slug,
    debut: suivi.debut,
    fin: maintenant,
    etapes,
    generateurs: [...new Set(suivi.generateurs)],
    classeId: trouve.classe.id,
    date,
    creneau: { heureDebut: creneau.heureDebut, heureFin: creneau.heureFin, debut: creneau.debut, fin: creneau.fin },
  }
}
