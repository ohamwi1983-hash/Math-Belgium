/**
 * Couche B (5e) — moteur de session pour 5gen14 ("Suites arithmétiques, formule générale et
 * termes"). N'importe jamais rien de `src/generateurs5e/` — `termeArithmetiqueLocal`/
 * `sommeArithmetiqueLocal` répliquent (jamais importées) les 2 formules d'une ligne déjà exposées
 * par `generateurs5e/suitesArithmetiques/parametres.ts`.
 */
import type {
  ExerciceAlgebriqueRangN,
  ExerciceAlgebriqueSommeSn,
  ExerciceAlgebriqueSommeSnD,
  ExerciceAlgebriqueTermeGeneral,
  ExerciceCoherenceSuiteArithmetique,
  ExercicePrincipalSuiteArithmetique,
  ExerciceSuiteArithmetique,
} from "../core5e/suitesArithmetiques.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesSuiteArithmetique";
import type { EtatSessionSuiteArithmetique, PhaseSuiteArithmetique, ResultatExerciceSuiteArithmetique } from "./typesSuiteArithmetique";
import {
  diagnostiquerEquationComplete,
  diagnostiquerEquationCompleteEnN,
  diagnostiquerFormuleGenerale,
  diagnostiquerNombre,
  diagnostiquerRangEntierPositif,
  diagnostiquerTermes,
  verifierCoherence,
} from "./verificationSuiteArithmetique";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX_SUITE_ARITHMETIQUE = 2;

function termeArithmetiqueLocal(u1: number, r: number, n: number): number {
  return u1 + (n - 1) * r;
}
function sommeArithmetiqueLocal(u1: number, r: number, n: number): number {
  return (n / 2) * (2 * u1 + (n - 1) * r);
}

function etatInitial(exercice: ExerciceSuiteArithmetique): Pick<EtatSessionSuiteArithmetique, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionSuiteArithmetique(reglages: ReglagesSession5e, generateur: () => ExerciceSuiteArithmetique): EtatSessionSuiteArithmetique {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionSuiteArithmetique): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

/** Plafond d'aide PAR PHASE (B.3, `promptcorrectionsround2.md` ; étendu par
 * `prompt5gen14corrections.md`/`prompt5gen14remplacementvariante.md`/
 * `prompt5gen14refontefamillesbonus.md`) — remplace l'usage nu de `NIVEAU_AIDE_MAX_SUITE_ARITHMETIQUE`
 * (toujours 2). `texteAideNiveau2()` (`ui5e/formatSuiteArithmetique.ts`) retourne `""`
 * inconditionnellement pour TOUTE phase hors "coherenceJugement" (le SEUL écran à garder une aide
 * niveau 2 réelle) — sans ce garde, le bouton "Aide supplémentaire" resterait cliquable/pénalisant
 * pour un niveau 2 systématiquement vide.
 *
 * `resoudreXAlgebrique`/`calculerTermesAlgebrique` plafonnées à 0 (AUCUNE aide, `BoutonAide` ne rend
 * rien pour `niveauAideMax===0`) — décision EXPLICITE de la refonte des 3 familles bonus : seul
 * l'écran "poser l'équation" (`poserEquationAlgebrique`/`poserEquationRangN`) garde une aide (rappel
 * de formule) sur ces familles, jamais les écrans de résolution/déduction qui suivent. */
export function niveauAideMaxSuiteArithmetique(phase: PhaseSuiteArithmetique): number {
  if (phase === "coherenceJugement") return NIVEAU_AIDE_MAX_SUITE_ARITHMETIQUE;
  if (phase === "resoudreXAlgebrique" || phase === "calculerTermesAlgebrique") return 0;
  return 1;
}

export function activerAideSuivante(etat: EtatSessionSuiteArithmetique): EtatSessionSuiteArithmetique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxSuiteArithmetique(etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionSuiteArithmetique, resultat: ResultatExerciceSuiteArithmetique, revele: boolean): EtatSessionSuiteArithmetique {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionSuiteArithmetique, phaseAttendue: PhaseSuiteArithmetique, reponse: T, verifier: (r: T) => boolean): EtatSessionSuiteArithmetique {
  if (etat.terminee || etat.phase !== phaseAttendue) throw new Error(`soumettreEcran : la session n'est pas à l'étape ${phaseAttendue}`);

  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [phaseAttendue]: score };
  const phaseSuivante = phaseApres(etat.exerciceCourant, phaseAttendue);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, scoresPartiels, derniereEtapeRevelee: revele };
}

// ============================================================================
// Accesseurs narrowed — gardes défensives (jamais atteintes en pratique).
// ============================================================================

function commeAvecBase(exercice: ExerciceSuiteArithmetique): ExercicePrincipalSuiteArithmetique | ExerciceCoherenceSuiteArithmetique {
  if (exercice.famille !== "principal" && exercice.famille !== "coherence") throw new Error("commeAvecBase : famille hors 'principal'/'coherence'");
  return exercice;
}
function commeCoherence(exercice: ExerciceSuiteArithmetique): ExerciceCoherenceSuiteArithmetique {
  if (exercice.famille !== "coherence") throw new Error("commeCoherence : famille hors 'coherence'");
  return exercice;
}
function commeAlgebrique(exercice: ExerciceSuiteArithmetique): ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn {
  if (exercice.famille !== "algebriqueTermeGeneral" && exercice.famille !== "algebriqueSommeSn") throw new Error("commeAlgebrique : famille hors 'algebriqueTermeGeneral'/'algebriqueSommeSn'");
  return exercice;
}
function commeRangN(exercice: ExerciceSuiteArithmetique): ExerciceAlgebriqueRangN {
  if (exercice.famille !== "algebriqueRangN") throw new Error("commeRangN : famille hors 'algebriqueRangN'");
  return exercice;
}
function commeSommeSnD(exercice: ExerciceSuiteArithmetique): ExerciceAlgebriqueSommeSnD {
  if (exercice.famille !== "algebriqueSommeSn" || exercice.sousCas !== "D") throw new Error("commeSommeSnD : famille/sousCas hors 'algebriqueSommeSn'/'D'");
  return exercice;
}

// ============================================================================
// Écrans communs à "principal"/"coherence" (une fois u1/r tous deux connus).
// ============================================================================

export function soumettreReponseTrouverR(etat: EtatSessionSuiteArithmetique, texte: string): EtatSessionSuiteArithmetique {
  const cible = commeAvecBase(etat.exerciceCourant).base.r;
  return soumettreEcran(etat, "trouverR", texte, (t) => diagnostiquerNombre(t, cible) === "correct");
}

export function soumettreReponseTrouverU1(etat: EtatSessionSuiteArithmetique, texte: string): EtatSessionSuiteArithmetique {
  const cible = commeAvecBase(etat.exerciceCourant).base.u1;
  return soumettreEcran(etat, "trouverU1", texte, (t) => diagnostiquerNombre(t, cible) === "correct");
}

export function soumettreReponseFormuleGenerale(etat: EtatSessionSuiteArithmetique, texte: string): EtatSessionSuiteArithmetique {
  const { u1, r } = commeAvecBase(etat.exerciceCourant).base;
  return soumettreEcran(etat, "formuleGenerale", texte, (t) => diagnostiquerFormuleGenerale(u1, r, t) === "correct");
}

function indicesTermesProchesRequis(exercice: ExerciceSuiteArithmetique): [number, number, number, number] {
  const e = commeAvecBase(exercice);
  if (!e.indicesTermesProches) throw new Error("indicesTermesProches : absent (jamais atteint pour un exercice incohérent)");
  return e.indicesTermesProches;
}

export function soumettreReponseTermesProches(etat: EtatSessionSuiteArithmetique, textes: string[]): EtatSessionSuiteArithmetique {
  const { u1, r } = commeAvecBase(etat.exerciceCourant).base;
  const indices = indicesTermesProchesRequis(etat.exerciceCourant);
  const cibles = indices.map((n) => termeArithmetiqueLocal(u1, r, n));
  return soumettreEcran(etat, "termesProches", textes, (t) => diagnostiquerTermes(t, cibles) === "correct");
}

export function soumettreReponseTermeEloigne(etat: EtatSessionSuiteArithmetique, texte: string): EtatSessionSuiteArithmetique {
  const e = commeAvecBase(etat.exerciceCourant);
  if (e.indiceTermeEloigne === undefined) throw new Error("indiceTermeEloigne absent");
  const cible = termeArithmetiqueLocal(e.base.u1, e.base.r, e.indiceTermeEloigne);
  return soumettreEcran(etat, "termeEloigne", texte, (t) => diagnostiquerNombre(t, cible) === "correct");
}

export function soumettreReponseSommeSn(etat: EtatSessionSuiteArithmetique, texte: string): EtatSessionSuiteArithmetique {
  const e = commeAvecBase(etat.exerciceCourant);
  if (e.indiceSn === undefined) throw new Error("indiceSn absent");
  const cible = sommeArithmetiqueLocal(e.base.u1, e.base.r, e.indiceSn);
  return soumettreEcran(etat, "sommeSn", texte, (t) => diagnostiquerNombre(t, cible) === "correct");
}

// ============================================================================
// Écran propre à "coherence".
// ============================================================================

export function soumettreReponseCoherenceJugement(etat: EtatSessionSuiteArithmetique, choix: boolean): EtatSessionSuiteArithmetique {
  const exo = commeCoherence(etat.exerciceCourant);
  return soumettreEcran(etat, "coherenceJugement", choix, (c) => verifierCoherence(c, exo.coherent));
}

// ============================================================================
// Écrans propres aux 3 familles "algebrique*" — REFONTE `prompt5gen14refontefamillesbonus.md`.
// ============================================================================

/** Champ d'équation UNIQUE (remplace `{gauche;droite}` — 2 champs séparés par un "=" visuel) :
 * l'élève tape l'équation COMPLÈTE, "=" inclus. Nom conservé (`ReponseEquation`) pour limiter le
 * remous sur les sites d'appel déjà existants (`App5gen14.tsx`, `EtapePoserEquation.tsx`). */
export interface ReponseEquation {
  texte: string;
}

/** Coefficients (pente, constante) de l'équation CIBLE de l'écran "poserEquationAlgebrique",
 * dispatchés par famille/sous-cas :
 * - famille A (u_p ET u_n algébriques) : u_n(x)=u_p(x)+(n-p)r.
 * - famille B sous-cas A (u1(x) algébrique) : (n/2)(2u1(x)+(n-1)r)=k, développé n·u1(x)+(n/2)(n-1)r=k.
 * - famille B sous-cas B (r(x) algébrique) : (n/2)(2u1+(n-1)r(x))=k, développé n·u1+(n/2)(n-1)r(x)=k.
 * - famille B sous-cas C (u1(x) ET r(x) algébriques) : (n/2)(2u1(x)+(n-1)r(x))=k — inchangée.
 * - famille B sous-cas D (Sn(x) algébrique, mécanique différente) : Sn(x)=k, k déjà TROUVÉ par
 *   l'élève à l'écran "calculerSn" précédent (jamais re-dérivé depuis u1/r/n ici). */
function penteConstanteEquationAlgebrique(exo: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): { pente: number; constante: number } {
  if (exo.famille === "algebriqueTermeGeneral") {
    const { up, un, p, n, r } = exo;
    return { pente: un.a - up.a, constante: un.b - up.b - (n - p) * r };
  }
  switch (exo.sousCas) {
    case "A": {
      const { u1, r, n, k } = exo;
      return { pente: n * u1.a, constante: n * u1.b + (n / 2) * (n - 1) * r - k };
    }
    case "B": {
      const { u1, r, n, k } = exo;
      return { pente: (n / 2) * (n - 1) * r.a, constante: n * u1 + (n / 2) * (n - 1) * r.b - k };
    }
    case "C": {
      const { u1, r, n, k } = exo;
      return { pente: (n / 2) * (2 * u1.a + (n - 1) * r.a), constante: (n / 2) * (2 * u1.b + (n - 1) * r.b) - k };
    }
    case "D": {
      const { sn, k } = exo;
      return { pente: sn.a, constante: sn.b - k };
    }
  }
}

export function soumettreReponsePoserEquationAlgebrique(etat: EtatSessionSuiteArithmetique, reponse: ReponseEquation): EtatSessionSuiteArithmetique {
  const exo = commeAlgebrique(etat.exerciceCourant);
  const { pente, constante } = penteConstanteEquationAlgebrique(exo);
  return soumettreEcran(etat, "poserEquationAlgebrique", reponse, (r) => diagnostiquerEquationComplete(r.texte, pente, constante) === "correct");
}

export function soumettreReponseResoudreXAlgebrique(etat: EtatSessionSuiteArithmetique, texte: string): EtatSessionSuiteArithmetique {
  const exo = commeAlgebrique(etat.exerciceCourant);
  return soumettreEcran(etat, "resoudreXAlgebrique", texte, (t) => diagnostiquerNombre(t, exo.xReel) === "correct");
}

/** Cibles numériques de l'écran "calculerTermesAlgebrique" — 2 champs pour la famille A (u_p et
 * u_n) et le sous-cas C (u1 et r), 1 SEUL champ pour les sous-cas A (u1) et B (r) — jamais atteint
 * pour le sous-cas D (aucun écran "en déduire", voir `ORDRE_SOMME_SN_D`). Exportée : réutilisée par
 * `ui5e/formatSuiteArithmetique.ts`/`components5e/EtapeTermesMultiples.tsx` pour les labels (même
 * petite duplication de calcul déjà pratiquée ailleurs dans ce fichier, présentation pure). */
export function ciblesCalculerTermesAlgebrique(exo: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): number[] {
  if (exo.famille === "algebriqueTermeGeneral") {
    const { up, un, xReel } = exo;
    return [up.a * xReel + up.b, un.a * xReel + un.b];
  }
  const { xReel } = exo;
  switch (exo.sousCas) {
    case "A":
      return [exo.u1.a * xReel + exo.u1.b];
    case "B":
      return [exo.r.a * xReel + exo.r.b];
    case "C":
      return [exo.u1.a * xReel + exo.u1.b, exo.r.a * xReel + exo.r.b];
    case "D":
      return [];
  }
}

export function soumettreReponseCalculerTermesAlgebrique(etat: EtatSessionSuiteArithmetique, textes: string[]): EtatSessionSuiteArithmetique {
  const exo = commeAlgebrique(etat.exerciceCourant);
  const cibles = ciblesCalculerTermesAlgebrique(exo);
  return soumettreEcran(etat, "calculerTermesAlgebrique", textes, (t) => diagnostiquerTermes(t, cibles) === "correct");
}

/** Écran "calculerSn" — SEUL au sous-cas D (`ORDRE_SOMME_SN_D`) : calcul numérique direct de S_n
 * depuis u1/r/n (tous numériques, aucune inconnue) — AVANT de poser l'équation Sn(x)=[valeur]. */
export function soumettreReponseCalculerSn(etat: EtatSessionSuiteArithmetique, texte: string): EtatSessionSuiteArithmetique {
  const exo = commeSommeSnD(etat.exerciceCourant);
  return soumettreEcran(etat, "calculerSn", texte, (t) => diagnostiquerNombre(t, exo.k) === "correct");
}

export function soumettreReponsePoserEquationRangN(etat: EtatSessionSuiteArithmetique, reponse: ReponseEquation): EtatSessionSuiteArithmetique {
  const exo = commeRangN(etat.exerciceCourant);
  // u1+(n-1)r=k, variable "n" : pente=r, constante=u1-r-k (développé : u1+n·r-r-k).
  const pente = exo.r;
  const constante = exo.u1 - exo.r - exo.k;
  return soumettreEcran(etat, "poserEquationRangN", reponse, (r) => diagnostiquerEquationCompleteEnN(r.texte, pente, constante) === "correct");
}

export function soumettreReponseResoudreRangN(etat: EtatSessionSuiteArithmetique, texte: string): EtatSessionSuiteArithmetique {
  const exo = commeRangN(etat.exerciceCourant);
  return soumettreEcran(etat, "resoudreRangN", texte, (t) => diagnostiquerRangEntierPositif(t, exo.n) === "correct");
}
