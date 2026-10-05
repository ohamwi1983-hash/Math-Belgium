/**
 * Couche B (5e) — types + dérivation pure pour 5gen22 ("Limites et asymptotes, lecture
 * graphique"). N'importe jamais rien de `src/generateurs5e/`. Contrairement aux autres générateurs
 * (phases FIXES par famille), ici c'est le NOMBRE DE CHAMPS dans chaque écran qui varie avec la
 * richesse réelle du tirage (2 à 6 comportements écran 1, 0 à 3 équations écran 2) — les 2 fonctions
 * `listeComportements`/`listeAsymptotes` en sont la SEULE source de vérité, jamais dupliquées.
 */
import type { ExerciceLectureGraphiqueLimites, SigneInfini } from "../core5e/lectureGraphiqueLimites.types";

export type PhaseLectureGraphiqueLimites = "completerLimites" | "nommerAsymptotes";

// ============================================================================
// Écran 1 — "completerLimites" : un slot par comportement visible sur le graphique.
// ============================================================================

export type IdComportement = { kind: "va"; index: number; cote: "gauche" | "droit" } | { kind: "infini"; cote: "gauche" | "droit" };

export type CibleComportement = { kind: "infini"; signe: SigneInfini } | { kind: "fini"; valeur: number };

export interface SlotComportement {
  id: IdComportement;
  cible: CibleComportement;
}

/** Ordre de lecture GAUCHE→DROITE le long de l'axe des x : x→−∞, puis chaque AV (côté gauche puis
 * droit) dans l'ordre de leurs positions, puis x→+∞. */
export function listeComportements(exercice: ExerciceLectureGraphiqueLimites): SlotComportement[] {
  const { infini } = exercice;
  let cibleInfiniGauche: CibleComportement;
  let cibleInfiniDroit: CibleComportement;
  if (infini.type === "horizontale") {
    cibleInfiniGauche = { kind: "fini", valeur: infini.limiteMoinsInfini };
    cibleInfiniDroit = { kind: "fini", valeur: infini.limitePlusInfini };
  } else if (infini.type === "oblique") {
    const signeDroit: SigneInfini = infini.pente > 0 ? 1 : -1;
    cibleInfiniDroit = { kind: "infini", signe: signeDroit };
    cibleInfiniGauche = { kind: "infini", signe: (-signeDroit) as SigneInfini };
  } else {
    cibleInfiniGauche = { kind: "infini", signe: infini.signeMoinsInfini };
    cibleInfiniDroit = { kind: "infini", signe: infini.signePlusInfini };
  }

  const slots: SlotComportement[] = [{ id: { kind: "infini", cote: "gauche" }, cible: cibleInfiniGauche }];
  exercice.vas.forEach((va, index) => {
    const cibleGauche: CibleComportement = va.pointIsoleGauche !== undefined ? { kind: "fini", valeur: va.pointIsoleGauche } : { kind: "infini", signe: va.signeGauche };
    const cibleDroit: CibleComportement = va.pointIsoleDroit !== undefined ? { kind: "fini", valeur: va.pointIsoleDroit } : { kind: "infini", signe: va.signeDroit };
    slots.push({ id: { kind: "va", index, cote: "gauche" }, cible: cibleGauche });
    slots.push({ id: { kind: "va", index, cote: "droit" }, cible: cibleDroit });
  });
  slots.push({ id: { kind: "infini", cote: "droit" }, cible: cibleInfiniDroit });
  return slots;
}

// ============================================================================
// Écran 2 — "nommerAsymptotes" : une équation par asymptote RÉELLEMENT présente, jamais un champ
// pour un type absent du tirage (AV toujours nommées ; AH 1 ou 2 champs selon égalité en ±∞ ; AO 1
// champ ; "aucune" à l'infini = 0 champ pour ce comportement).
// ============================================================================

export type IdAsymptote = { kind: "va"; index: number } | { kind: "horizontale"; cote?: "gauche" | "droit" } | { kind: "oblique" };

export type CibleAsymptote = { kind: "verticale"; x: number } | { kind: "horizontale"; y: number } | { kind: "oblique"; pente: number; ordonnee: number };

export interface SlotAsymptote {
  id: IdAsymptote;
  cible: CibleAsymptote;
}

export function listeAsymptotes(exercice: ExerciceLectureGraphiqueLimites): SlotAsymptote[] {
  const slots: SlotAsymptote[] = exercice.vas.map((va, index) => ({ id: { kind: "va", index }, cible: { kind: "verticale", x: va.position } }));
  const { infini } = exercice;
  if (infini.type === "horizontale") {
    if (infini.limitePlusInfini === infini.limiteMoinsInfini) {
      slots.push({ id: { kind: "horizontale" }, cible: { kind: "horizontale", y: infini.limitePlusInfini } });
    } else {
      slots.push({ id: { kind: "horizontale", cote: "gauche" }, cible: { kind: "horizontale", y: infini.limiteMoinsInfini } });
      slots.push({ id: { kind: "horizontale", cote: "droit" }, cible: { kind: "horizontale", y: infini.limitePlusInfini } });
    }
  } else if (infini.type === "oblique") {
    slots.push({ id: { kind: "oblique" }, cible: { kind: "oblique", pente: infini.pente, ordonnee: infini.ordonnee } });
  }
  return slots;
}

// ============================================================================
// Ordre des écrans — "nommerAsymptotes" SAUTÉ s'il n'y a strictement rien à nommer (0 AV + "aucune"
// à l'infini : la fonction diverge sans la moindre asymptote, cas rare mais valide).
// ============================================================================

export function ordreComplet(exercice: ExerciceLectureGraphiqueLimites): PhaseLectureGraphiqueLimites[] {
  const phases: PhaseLectureGraphiqueLimites[] = ["completerLimites"];
  if (listeAsymptotes(exercice).length > 0) phases.push("nommerAsymptotes");
  return phases;
}

export function phaseInitiale(exercice: ExerciceLectureGraphiqueLimites): PhaseLectureGraphiqueLimites {
  return ordreComplet(exercice)[0];
}

export function phaseApres(exercice: ExerciceLectureGraphiqueLimites, phase: PhaseLectureGraphiqueLimites): PhaseLectureGraphiqueLimites | "termine" {
  const ordre = ordreComplet(exercice);
  const i = ordre.indexOf(phase);
  return i === ordre.length - 1 ? "termine" : ordre[i + 1];
}

// ============================================================================
// État de session — même patron que les autres générateurs 5e (5gen20/5gen21).
// ============================================================================

import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceLectureGraphiqueLimites {
  exercice: ExerciceLectureGraphiqueLimites;
  scores: Partial<Record<PhaseLectureGraphiqueLimites, number>>;
}

export interface EtatSessionLectureGraphiqueLimites {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceLectureGraphiqueLimites;
  exerciceCourant: ExerciceLectureGraphiqueLimites;
  phase: PhaseLectureGraphiqueLimites;
  etapeCourante: EtatEtapeTentatives;
  scoresPartiels: Partial<Record<PhaseLectureGraphiqueLimites, number>>;
  indexExercice: number;
  resultats: ResultatExerciceLectureGraphiqueLimites[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
