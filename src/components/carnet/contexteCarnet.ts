/**
 * Contexte partagé par les vues du carnet (Aujourd'hui, Ma semaine, page d'une classe, panneaux) :
 * données de base, réglages et actions sur une séance, pour ne pas les faire passer de composant en
 * composant.
 */
import { createContext, useContext } from 'react'
import { generatorLink } from '../../lib/generatorLink'
import { resoudreSeance, type Classe, type FormatHoraire, type Seance, type SeanceResolue } from '../../lib/carnet'
import type { Ecole } from '../../lib/compteValidation'
import type { GrilleHoraire } from '../../lib/horaire'
import type { ContexteAgenda, Evenement, SaisieEvenement } from '../../lib/agendaEvenements'
import type { DonneesAgenda } from '../../lib/agendaDonnees'
import type { ReglagesTexte } from '../../lib/carnetDonnees'
import { donneesTexteAgenda, htmlAgenda, texteAgenda, type DonneesTexteAgenda, type Rubriques } from '../../lib/carnetDevoirs'
import { processusConnus } from './processusCarnet'

export interface ContexteCarnet {
  classes: Classe[]
  ecoles: Ecole[]
  /** Grilles horaires (vide sans 0003). */
  grilles: GrilleHoraire[]
  format: FormatHoraire
  professeur: string
  occupe: boolean
  /** Ouvre la séance dans le panneau latéral (copier, fiche, modifier). */
  voir: (s: Seance) => void
  modifier: (s: Seance) => void
  supprimer: (s: Seance) => void
  /** Agenda (0006) : événements, périodes du bulletin, seuil ; `actif` faux sans 0006. */
  agenda: DonneesAgenda
  /** Horaire + événements + classes (heures supprimées) ; `null` sans horaire (0003). */
  ctxAgenda: ContexteAgenda | null
  /** Ouvre le formulaire « Nouvel événement » (valeurs pré-remplies facultatives). */
  nouvelEvenement: (prerempli?: Partial<SaisieEvenement>) => void
  /** Ouvre le formulaire sur un événement existant (le toucher dans l'agenda). */
  ouvrirEvenement: (e: Evenement) => void
  /** 0007 appliqué : devoirs (date de remise, exercices joints), évaluations, texte mémorisé. */
  devoirs: boolean
  /** 0008 appliqué : les générateurs retenus pour une évaluation sont gardés avec la séance. */
  generateursEval: boolean
  /** Rubriques du texte pour l'agenda scolaire et liste des compétences transversales (0007). */
  texte: ReglagesTexte
  /** Ouvre le panneau « Texte pour l'agenda scolaire » d'une séance (rubriques, objectif, compétences). */
  ouvrirTexte: (s: Seance) => void
}

export const CarnetContexte = createContext<ContexteCarnet | null>(null)

export function useCarnet(): ContexteCarnet {
  const c = useContext(CarnetContexte)
  if (!c) throw new Error('useCarnet hors du carnet')
  return c
}

/** Nombre de couleurs de classe (`.carnet-c0` … `.carnet-c5`). */
export const NB_COULEURS = 6

/** Couleur d'une classe : son rang dans la liste des classes (stable tant que la liste ne change pas). */
export function couleurClasse(classes: Pick<Classe, 'id'>[], id: string): number {
  const i = classes.findIndex((c) => c.id === id)
  return i < 0 ? NB_COULEURS - 1 : i % NB_COULEURS
}

export function nomEcole(ctx: Pick<ContexteCarnet, 'ecoles'>, ecoleId: string): string {
  return ctx.ecoles.find((e) => e.id === ecoleId)?.nom ?? ''
}

/** L'école de la classe a une grille horaire : « H2 (09h35 → 10h25) ». */
export function avecGrille(ctx: Pick<ContexteCarnet, 'grilles'>, classe: Pick<Classe, 'ecole_id'>): boolean {
  return ctx.grilles.some((g) => g.ecole_id === classe.ecole_id)
}

/** Séance résolue pour le texte Smartschool et la fiche — MÊMES options qu'avant la refonte (texte
 * identique pour les mêmes données). */
export function resoudre(ctx: Pick<ContexteCarnet, 'grilles' | 'ecoles' | 'format'>, seance: Seance, classe: Classe): SeanceResolue {
  return resoudreSeance(seance, classe, { format: ctx.format, ecole: nomEcole(ctx, classe.ecole_id), lienGenerateur: generatorLink, avecGrille: avecGrille(ctx, classe) })
}

/** Interro de l'agenda liée à la séance (annonce / contrôle-bilan), si elle existe encore. */
export function evenementDeSeance(ctx: Pick<ContexteCarnet, 'agenda'>, seance: Seance): Evenement | null {
  return seance.evaluation_evenement ? (ctx.agenda.evenements.find((e) => e.id === seance.evaluation_evenement) ?? null) : null
}

/** Données du texte en rubriques d'une séance (processus si la table est chargée). `valeurs` : objectif
 * et compétences en cours de modification dans le panneau du texte. */
export function donneesTexte(
  ctx: Pick<ContexteCarnet, 'grilles' | 'ecoles' | 'format' | 'agenda'>,
  seance: Seance,
  classe: Classe,
  valeurs: { objectif?: string; transversales?: string[]; evenement?: Evenement | null } = {},
): DonneesTexteAgenda {
  return donneesTexteAgenda(seance, resoudre(ctx, seance, classe), {
    lienGenerateur: generatorLink,
    processusDe: processusConnus(seance.chapitre) ?? undefined,
    evenement: valeurs.evenement !== undefined ? valeurs.evenement : evenementDeSeance(ctx, seance),
    objectif: valeurs.objectif,
    transversales: valeurs.transversales,
  })
}

/** Texte brut + HTML « Copier pour Smartschool » d'une séance, avec les rubriques du professeur. */
export function textesSeance(
  ctx: Pick<ContexteCarnet, 'grilles' | 'ecoles' | 'format' | 'agenda' | 'texte'>,
  seance: Seance,
  classe: Classe,
  rubriques: Rubriques = ctx.texte.rubriques,
  valeurs: { objectif?: string; transversales?: string[]; evenement?: Evenement | null } = {},
): { texte: string; html: string } {
  const d = donneesTexte(ctx, seance, classe, valeurs)
  return { texte: texteAgenda(d, rubriques), html: htmlAgenda(d, rubriques) }
}
