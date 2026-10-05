/**
 * Couche B (5e) — moteur de session pour 5gen15 ("Suites géométriques, formule générale et
 * termes"). REFONTE (`prompt5gen15refontefamillesbonus.md`, miroir direct de `sessionSuiteArithmetique.ts`,
 * 5gen14). N'importe jamais rien de `src/generateurs5e/`.
 *
 * "principal" garde ses 15 écrans potentiellement dupliqués (trouverU1/formuleGenerale/termesProches/
 * termeEloigne/sommeSn/sommeInfinie, chacun en 3 variantes "nue"/"B1"/"B2"), couverts par 3 exports
 * chacun, tous délégant à un helper interne partagé (`soumettreXxx(etat, phase, ...)`) qui extrait la
 * BONNE branche via `brancheActive`. Les 3 familles bonus ("algebriqueTermeGeneral"/
 * "algebriqueSommeSn"/"algebriqueRangN") suivent le patron 5gen14.
 */
import type {
  BrancheSuiteGeometrique,
  ExerciceAlgebriqueRangN,
  ExerciceAlgebriqueSommeSn,
  ExerciceAlgebriqueSommeSnB,
  ExerciceAlgebriqueTermeGeneral,
  ExercicePrincipalSuiteGeometrique,
  ExerciceSuiteGeometrique,
  FractionQ,
} from "../core5e/suitesGeometriques.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { additionnerFractionQ, diviserFractionQ, entierVersFractionQ, fractionQVersNombre, multiplierFractionQ, puissanceFractionQ, soustraireFractionQ, sommeGeometriqueFinieQ, termeGeometriqueQ } from "./fractionQ";
import { phaseApres, phaseInitiale } from "./typesSuiteGeometrique";
import type { EtatSessionSuiteGeometrique, PhaseSuiteGeometrique, ResultatExerciceSuiteGeometrique } from "./typesSuiteGeometrique";
import {
  diagnostiquerEquationComplete,
  diagnostiquerEquationCompleteEnN,
  diagnostiquerFormuleGenerale,
  diagnostiquerNombre,
  diagnostiquerRangEntierPositif,
  diagnostiquerSommeInfinie,
  diagnostiquerSommeSn,
  diagnostiquerTermes,
  diagnostiquerTrouverQ,
  diagnostiquerTrouverU1,
} from "./verificationSuiteGeometrique";
import type { ReponseSommeInfinie } from "./verificationSuiteGeometrique";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX_SUITE_GEOMETRIQUE = 2;

/** Comparaison tolérante avec la saisie décimale/fractionnaire de l'élève — seul point légitime de
 * conversion en flottant (`fractionQVersNombre`), APRÈS calcul exact (`fraction.ts`) — voir
 * `prompt5gen155gen16arithmetiqueexacte.md`. */
function termeGeometriqueLocal(u1: FractionQ, q: FractionQ, n: number): number {
  return fractionQVersNombre(termeGeometriqueQ(u1, q, n));
}
function sommeGeometriqueFinieLocal(u1: FractionQ, q: FractionQ, n: number): number {
  return fractionQVersNombre(sommeGeometriqueFinieQ(u1, q, n));
}

function etatInitial(exercice: ExerciceSuiteGeometrique): Pick<EtatSessionSuiteGeometrique, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionSuiteGeometrique(reglages: ReglagesSession5e, generateur: () => ExerciceSuiteGeometrique): EtatSessionSuiteGeometrique {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionSuiteGeometrique): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

/** Plafond d'aide PAR PHASE — phases sans aide DU TOUT (0, décision explicite de la refonte des 3
 * familles bonus : seul l'écran "poser l'équation"/"calculerSn" garde une aide, jamais les écrans de
 * résolution/déduction qui suivent) et phases sans aide niveau 2 réelle (plafonnées à 1, le bouton
 * "Aide supplémentaire" resterait sinon cliquable/pénalisant pour un niveau 2 vide). */
const PHASES_SANS_AIDE = new Set<PhaseSuiteGeometrique>(["resoudreXAlgebrique", "calculerTermesAlgebrique", "resoudreRangN"]);
const PHASES_SANS_AIDE_NIVEAU2 = new Set<PhaseSuiteGeometrique>(["trouverQ", "poserEquationAlgebrique", "calculerSn", "poserEquationRangN"]);

export function niveauAideMaxSuiteGeometrique(phase: PhaseSuiteGeometrique): number {
  if (PHASES_SANS_AIDE.has(phase)) return 0;
  if (PHASES_SANS_AIDE_NIVEAU2.has(phase)) return 1;
  return NIVEAU_AIDE_MAX_SUITE_GEOMETRIQUE;
}

export function activerAideSuivante(etat: EtatSessionSuiteGeometrique): EtatSessionSuiteGeometrique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxSuiteGeometrique(etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionSuiteGeometrique, resultat: ResultatExerciceSuiteGeometrique, revele: boolean): EtatSessionSuiteGeometrique {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionSuiteGeometrique, phaseAttendue: PhaseSuiteGeometrique, reponse: T, verifier: (r: T) => boolean): EtatSessionSuiteGeometrique {
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

function commePrincipal(exercice: ExerciceSuiteGeometrique): ExercicePrincipalSuiteGeometrique {
  if (exercice.famille !== "principal") throw new Error("commePrincipal : famille hors 'principal'");
  return exercice;
}
function commeAlgebrique(exercice: ExerciceSuiteGeometrique): ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn {
  if (exercice.famille !== "algebriqueTermeGeneral" && exercice.famille !== "algebriqueSommeSn") throw new Error("commeAlgebrique : famille hors 'algebriqueTermeGeneral'/'algebriqueSommeSn'");
  return exercice;
}
function commeRangN(exercice: ExerciceSuiteGeometrique): ExerciceAlgebriqueRangN {
  if (exercice.famille !== "algebriqueRangN") throw new Error("commeRangN : famille hors 'algebriqueRangN'");
  return exercice;
}
function commeSommeSnB(exercice: ExerciceSuiteGeometrique): ExerciceAlgebriqueSommeSnB {
  if (exercice.famille !== "algebriqueSommeSn" || exercice.sousCas !== "B") throw new Error("commeSommeSnB : famille/sousCas hors 'algebriqueSommeSn'/'B'");
  return exercice;
}

/** La branche ACTIVE pour une phase suffixée B1/B2 (ou la branche unique pour une phase nue) —
 * `branches[0]` porte aussi bien "unique" (seule branche) que "B1" (première des 2). */
function brancheActive(exercice: ExercicePrincipalSuiteGeometrique, phase: PhaseSuiteGeometrique): BrancheSuiteGeometrique {
  const index = phase.endsWith("B2") ? 1 : 0;
  return exercice.branches[index];
}

// ============================================================================
// Écran "trouverQ" — jamais dupliqué (voir typesSuiteGeometrique.ts).
// ============================================================================

export function soumettreReponseTrouverQ(etat: EtatSessionSuiteGeometrique, valeurs: string[]): EtatSessionSuiteGeometrique {
  const exo = commePrincipal(etat.exerciceCourant);
  return soumettreEcran(etat, "trouverQ", valeurs, (v) => diagnostiquerTrouverQ(exo, v) === "correct");
}

// ============================================================================
// Écrans potentiellement dupliqués B1/B2 — helper interne partagé + 3 exports chacun.
// ============================================================================

function soumettreTrouverU1(etat: EtatSessionSuiteGeometrique, phase: "trouverU1" | "trouverU1B1" | "trouverU1B2", texte: string): EtatSessionSuiteGeometrique {
  const exo = commePrincipal(etat.exerciceCourant);
  const { u1 } = brancheActive(exo, phase);
  return soumettreEcran(etat, phase, texte, (t) => diagnostiquerTrouverU1(t, u1) === "correct");
}
export function soumettreReponseTrouverU1(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  return soumettreTrouverU1(etat, "trouverU1", texte);
}
export function soumettreReponseTrouverU1B1(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  return soumettreTrouverU1(etat, "trouverU1B1", texte);
}
export function soumettreReponseTrouverU1B2(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  return soumettreTrouverU1(etat, "trouverU1B2", texte);
}

function soumettreFormuleGenerale(etat: EtatSessionSuiteGeometrique, phase: "formuleGenerale" | "formuleGeneraleB1" | "formuleGeneraleB2", texte: string): EtatSessionSuiteGeometrique {
  const exo = commePrincipal(etat.exerciceCourant);
  const { u1, q } = brancheActive(exo, phase);
  return soumettreEcran(etat, phase, texte, (t) => diagnostiquerFormuleGenerale(u1, q, t) === "correct");
}
export function soumettreReponseFormuleGenerale(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  return soumettreFormuleGenerale(etat, "formuleGenerale", texte);
}
export function soumettreReponseFormuleGeneraleB1(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  return soumettreFormuleGenerale(etat, "formuleGeneraleB1", texte);
}
export function soumettreReponseFormuleGeneraleB2(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  return soumettreFormuleGenerale(etat, "formuleGeneraleB2", texte);
}

function soumettreTermesProches(etat: EtatSessionSuiteGeometrique, phase: "termesProches" | "termesProchesB1" | "termesProchesB2", textes: string[]): EtatSessionSuiteGeometrique {
  const exo = commePrincipal(etat.exerciceCourant);
  const { u1, q } = brancheActive(exo, phase);
  const cibles = exo.indicesTermesProches.map((n) => termeGeometriqueLocal(u1, q, n));
  return soumettreEcran(etat, phase, textes, (t) => diagnostiquerTermes(t, cibles) === "correct");
}
export function soumettreReponseTermesProches(etat: EtatSessionSuiteGeometrique, textes: string[]): EtatSessionSuiteGeometrique {
  return soumettreTermesProches(etat, "termesProches", textes);
}
export function soumettreReponseTermesProchesB1(etat: EtatSessionSuiteGeometrique, textes: string[]): EtatSessionSuiteGeometrique {
  return soumettreTermesProches(etat, "termesProchesB1", textes);
}
export function soumettreReponseTermesProchesB2(etat: EtatSessionSuiteGeometrique, textes: string[]): EtatSessionSuiteGeometrique {
  return soumettreTermesProches(etat, "termesProchesB2", textes);
}

function soumettreTermeEloigne(etat: EtatSessionSuiteGeometrique, phase: "termeEloigne" | "termeEloigneB1" | "termeEloigneB2", texte: string): EtatSessionSuiteGeometrique {
  const exo = commePrincipal(etat.exerciceCourant);
  const { u1, q } = brancheActive(exo, phase);
  const cible = termeGeometriqueLocal(u1, q, exo.indiceTermeEloigne);
  return soumettreEcran(etat, phase, texte, (t) => diagnostiquerNombre(t, cible) === "correct");
}
export function soumettreReponseTermeEloigne(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  return soumettreTermeEloigne(etat, "termeEloigne", texte);
}
export function soumettreReponseTermeEloigneB1(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  return soumettreTermeEloigne(etat, "termeEloigneB1", texte);
}
export function soumettreReponseTermeEloigneB2(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  return soumettreTermeEloigne(etat, "termeEloigneB2", texte);
}

function soumettreSommeSn(etat: EtatSessionSuiteGeometrique, phase: "sommeSn" | "sommeSnB1" | "sommeSnB2", texte: string): EtatSessionSuiteGeometrique {
  const exo = commePrincipal(etat.exerciceCourant);
  const { u1, q } = brancheActive(exo, phase);
  return soumettreEcran(etat, phase, texte, (t) => diagnostiquerSommeSn(u1, q, exo.indiceSn, t) === "correct");
}
export function soumettreReponseSommeSn(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  return soumettreSommeSn(etat, "sommeSn", texte);
}
export function soumettreReponseSommeSnB1(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  return soumettreSommeSn(etat, "sommeSnB1", texte);
}
export function soumettreReponseSommeSnB2(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  return soumettreSommeSn(etat, "sommeSnB2", texte);
}

function soumettreSommeInfinie(etat: EtatSessionSuiteGeometrique, phase: "sommeInfinie" | "sommeInfinieB1" | "sommeInfinieB2", reponse: ReponseSommeInfinie): EtatSessionSuiteGeometrique {
  const exo = commePrincipal(etat.exerciceCourant);
  const { u1, q } = brancheActive(exo, phase);
  return soumettreEcran(etat, phase, reponse, (r) => diagnostiquerSommeInfinie(u1, q, r) === "correct");
}
export function soumettreReponseSommeInfinie(etat: EtatSessionSuiteGeometrique, reponse: ReponseSommeInfinie): EtatSessionSuiteGeometrique {
  return soumettreSommeInfinie(etat, "sommeInfinie", reponse);
}
export function soumettreReponseSommeInfinieB1(etat: EtatSessionSuiteGeometrique, reponse: ReponseSommeInfinie): EtatSessionSuiteGeometrique {
  return soumettreSommeInfinie(etat, "sommeInfinieB1", reponse);
}
export function soumettreReponseSommeInfinieB2(etat: EtatSessionSuiteGeometrique, reponse: ReponseSommeInfinie): EtatSessionSuiteGeometrique {
  return soumettreSommeInfinie(etat, "sommeInfinieB2", reponse);
}

// ============================================================================
// Écrans propres aux 3 familles "algebrique*" — REFONTE `prompt5gen15refontefamillesbonus.md`.
// ============================================================================

/** Champ d'équation UNIQUE : l'élève tape l'équation COMPLÈTE, "=" inclus. */
export interface ReponseEquation {
  texte: string;
}

/** Coefficients (pente, constante) de l'équation CIBLE de l'écran "poserEquationAlgebrique",
 * dispatchés par famille/sous-cas :
 * - famille A (u_p ET u_n algébriques) : u_n(x)=C·u_p(x), C=q^(n-p) constante.
 * - famille B sous-cas A (u1(x) algébrique) : C·u1(x)=k, C=(q^n-1)/(q-1).
 * - famille B sous-cas B (Sn(x) algébrique, mécanique différente) : Sn(x)=k, k déjà TROUVÉ par
 *   l'élève à l'écran "calculerSn" précédent (jamais re-dérivé depuis u1/q/n ici). */
function penteConstanteEquationAlgebrique(exo: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): { pente: number; constante: number } {
  if (exo.famille === "algebriqueTermeGeneral") {
    const { up, un, p, n, q } = exo;
    const C = puissanceFractionQ(q, n - p);
    const pente = soustraireFractionQ(entierVersFractionQ(un.a), multiplierFractionQ(C, entierVersFractionQ(up.a)));
    const constante = soustraireFractionQ(un.b, multiplierFractionQ(C, entierVersFractionQ(up.b)));
    return { pente: fractionQVersNombre(pente), constante: fractionQVersNombre(constante) };
  }
  if (exo.sousCas === "A") {
    const { u1, q, n, k } = exo;
    const C = diviserFractionQ(soustraireFractionQ(puissanceFractionQ(q, n), entierVersFractionQ(1)), soustraireFractionQ(q, entierVersFractionQ(1)));
    const pente = multiplierFractionQ(C, entierVersFractionQ(u1.a));
    const constante = soustraireFractionQ(multiplierFractionQ(C, entierVersFractionQ(u1.b)), k);
    return { pente: fractionQVersNombre(pente), constante: fractionQVersNombre(constante) };
  }
  const { sn, k } = exo;
  return { pente: sn.a, constante: fractionQVersNombre(soustraireFractionQ(sn.b, k)) };
}

export function soumettreReponsePoserEquationAlgebrique(etat: EtatSessionSuiteGeometrique, reponse: ReponseEquation): EtatSessionSuiteGeometrique {
  const exo = commeAlgebrique(etat.exerciceCourant);
  const { pente, constante } = penteConstanteEquationAlgebrique(exo);
  return soumettreEcran(etat, "poserEquationAlgebrique", reponse, (r) => diagnostiquerEquationComplete(r.texte, pente, constante) === "correct");
}

export function soumettreReponseResoudreXAlgebrique(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  const exo = commeAlgebrique(etat.exerciceCourant);
  return soumettreEcran(etat, "resoudreXAlgebrique", texte, (t) => diagnostiquerNombre(t, fractionQVersNombre(exo.xReel)) === "correct");
}

/** Cibles numériques de l'écran "calculerTermesAlgebrique" — 2 champs pour la famille A (u_p et
 * u_n), 1 SEUL champ pour le sous-cas A de la famille B (u1) — jamais atteint pour le sous-cas B
 * (aucun écran "en déduire", voir `ORDRE_SOMME_SN_B`). Calcul EXACT (`fractionQ.ts`), conversion en
 * flottant réservée au point de comparaison avec la saisie de l'élève. Exportée : réutilisée par
 * `ui5e/formatSuiteGeometrique.ts`/présentation pour les labels. */
export function ciblesCalculerTermesAlgebrique(exo: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): number[] {
  if (exo.famille === "algebriqueTermeGeneral") {
    const { up, un, xReel } = exo;
    const upSubstitue = additionnerFractionQ(multiplierFractionQ(entierVersFractionQ(up.a), xReel), entierVersFractionQ(up.b));
    const unSubstitue = additionnerFractionQ(multiplierFractionQ(entierVersFractionQ(un.a), xReel), un.b);
    return [fractionQVersNombre(upSubstitue), fractionQVersNombre(unSubstitue)];
  }
  if (exo.sousCas === "A") {
    const { u1, xReel } = exo;
    const u1Substitue = additionnerFractionQ(multiplierFractionQ(entierVersFractionQ(u1.a), xReel), entierVersFractionQ(u1.b));
    return [fractionQVersNombre(u1Substitue)];
  }
  return [];
}

export function soumettreReponseCalculerTermesAlgebrique(etat: EtatSessionSuiteGeometrique, textes: string[]): EtatSessionSuiteGeometrique {
  const exo = commeAlgebrique(etat.exerciceCourant);
  const cibles = ciblesCalculerTermesAlgebrique(exo);
  return soumettreEcran(etat, "calculerTermesAlgebrique", textes, (t) => diagnostiquerTermes(t, cibles) === "correct");
}

/** Écran "calculerSn" — SEUL au sous-cas B (`ORDRE_SOMME_SN_B`) : calcul numérique direct de S_n
 * depuis u1/q/n (tous numériques, aucune inconnue) — AVANT de poser l'équation Sn(x)=[valeur]. */
export function soumettreReponseCalculerSn(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  const exo = commeSommeSnB(etat.exerciceCourant);
  return soumettreEcran(etat, "calculerSn", texte, (t) => diagnostiquerNombre(t, fractionQVersNombre(exo.k)) === "correct");
}

export function soumettreReponsePoserEquationRangN(etat: EtatSessionSuiteGeometrique, reponse: ReponseEquation): EtatSessionSuiteGeometrique {
  const exo = commeRangN(etat.exerciceCourant);
  return soumettreEcran(etat, "poserEquationRangN", reponse, (r) => diagnostiquerEquationCompleteEnN(r.texte, exo.u1, fractionQVersNombre(exo.q), exo.k) === "correct");
}

export function soumettreReponseResoudreRangN(etat: EtatSessionSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  const exo = commeRangN(etat.exerciceCourant);
  return soumettreEcran(etat, "resoudreRangN", texte, (t) => diagnostiquerRangEntierPositif(t, exo.n) === "correct");
}

// Réutilisée par la présentation pour l'écran final "Sn" (formule répliquée, jamais importée depuis
// generateurs5e — voir l'en-tête de fichier).
export { sommeGeometriqueFinieLocal };
