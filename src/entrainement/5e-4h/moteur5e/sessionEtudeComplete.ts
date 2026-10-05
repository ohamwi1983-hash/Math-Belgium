/**
 * Couche B (5e) — moteur de session pour 5gen24 ("Étude complète"). N'importe jamais rien de
 * `src/generateurs5e/`. Refonte `prompt5gen24refontecomplete.md` — voir `typesEtudeComplete.ts` pour
 * le détail du nouveau pipeline à 8 écrans.
 */
import type { ComportementInfiniEtude, Exclusion, ExerciceEtudeComplete } from "../core5e/etudeComplete.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesEtudeComplete";
import type { EtatSessionEtudeComplete, PhaseEtudeComplete, ResultatExerciceEtudeComplete } from "./typesEtudeComplete";
import {
  diagnostiquerCasSpecial,
  diagnostiquerEnsembleEquationsAV,
  diagnostiquerEnsembleNombres,
  diagnostiquerNombre,
  diagnostiquerProprietesConstructionInverse,
  diagnostiquerQuotient,
  diagnostiquerSimplificationPointVide,
  diagnostiquerValeurOuInfini,
  verifierConclusionPointVide,
  verifierTypeLimite,
} from "./verificationEtudeComplete";
import type { CibleValeurOuInfini, ReponseCasSpecial } from "./verificationEtudeComplete";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Convention STANDARD de la plateforme (2 niveaux d'aide sur tout écran). */
export const NIVEAU_AIDE_MAX_ETUDE_COMPLETE = 2;

export function niveauAideMaxEtudeComplete(): number {
  return NIVEAU_AIDE_MAX_ETUDE_COMPLETE;
}

function etatInitial(exercice: ExerciceEtudeComplete): Pick<EtatSessionEtudeComplete, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionEtudeComplete(reglages: ReglagesSession5e, generateur: () => ExerciceEtudeComplete): EtatSessionEtudeComplete {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionEtudeComplete): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionEtudeComplete): EtatSessionEtudeComplete {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_ETUDE_COMPLETE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionEtudeComplete, resultat: ResultatExerciceEtudeComplete, revele: boolean): EtatSessionEtudeComplete {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionEtudeComplete, phaseAttendue: PhaseEtudeComplete, reponse: T, verifier: (r: T) => boolean): EtatSessionEtudeComplete {
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

function exerciceEtude(etat: EtatSessionEtudeComplete) {
  const ex = etat.exerciceCourant;
  if (ex.mode !== "etude") throw new Error("exerciceEtude : mode inattendu (variante bonus en cours)");
  return ex;
}

function exclusionPointVide(etat: EtatSessionEtudeComplete): Exclusion {
  const excl = exerciceEtude(etat).exclusions.find((e) => e.type === "pointVide");
  if (!excl) throw new Error("exclusionPointVide : cet exercice n'a pas de point vide");
  return excl;
}

// ============================================================================
// Écran "domaine" — liste add-as-needed des valeurs exclues (TOUTES, y compris "point vide").
// ============================================================================

export function soumettreReponseDomaine(etat: EtatSessionEtudeComplete, textes: string[]): EtatSessionEtudeComplete {
  const cibles = exerciceEtude(etat).exclusions.map((e) => e.position);
  return soumettreEcran(etat, "domaine", textes, (t) => diagnostiquerEnsembleNombres(t, cibles) === "correct");
}

// ============================================================================
// Écran "typeLimite" — UN combobox par exclusion (∞ ou 0/0), dans l'ordre de `exclusions`.
// ============================================================================

export function soumettreReponseTypeLimite(etat: EtatSessionEtudeComplete, choix: ("infini" | "pointVide")[]): EtatSessionEtudeComplete {
  const exclusions = exerciceEtude(etat).exclusions;
  return soumettreEcran(etat, "typeLimite", choix, (c) => c.length === exclusions.length && c.every((ch, i) => verifierTypeLimite(ch, exclusions[i].type === "pointVide")));
}

// ============================================================================
// Écrans spéciaux "pointVideSimplification"/"pointVideLimite"/"pointVideConclusion".
// ============================================================================

export function soumettreReponsePointVideSimplification(etat: EtatSessionEtudeComplete, texte: string): EtatSessionEtudeComplete {
  const ex = exerciceEtude(etat);
  const coeffsM = ex.coeffsM as number[];
  const coeffsDVraie = ex.coeffsDVraie as number[];
  return soumettreEcran(etat, "pointVideSimplification", texte, (t) => diagnostiquerSimplificationPointVide(t, coeffsM, coeffsDVraie) === "correct");
}

export function soumettreReponsePointVideLimite(etat: EtatSessionEtudeComplete, texte: string): EtatSessionEtudeComplete {
  const cible = exclusionPointVide(etat).valeurPointVide as number;
  return soumettreEcran(etat, "pointVideLimite", texte, (t) => diagnostiquerNombre(t, cible) === "correct");
}

export interface ReponseConclusionPointVide {
  estAV: boolean;
  appartientDomaine: boolean;
}

export function soumettreReponsePointVideConclusion(etat: EtatSessionEtudeComplete, reponse: ReponseConclusionPointVide): EtatSessionEtudeComplete {
  return soumettreEcran(etat, "pointVideConclusion", reponse, (r) => verifierConclusionPointVide(r.estAV, r.appartientDomaine));
}

// ============================================================================
// Écrans "limitesGD1"/"limitesGD2" — limites gauche/droite en saisie libre "valeur ou infini",
// UNIQUEMENT pour les exclusions NON-point-vide (toujours ±∞ des deux côtés par construction — vraie
// VA — mais le champ reste générique par convention transversale, voir `verificationEtudeComplete.ts`).
// ============================================================================

export interface ReponseLimitesGD {
  gauche: string;
  droite: string;
}

function exclusionDeLimitesGD(etat: EtatSessionEtudeComplete, phase: "limitesGD1" | "limitesGD2"): Exclusion {
  const ex = exerciceEtude(etat);
  const excl = phase === "limitesGD1" ? ex.exclusions[0] : ex.exclusions[1];
  if (!excl) throw new Error(`exclusionDeLimitesGD : aucune exclusion pour ${phase}`);
  return excl;
}

export function soumettreReponseLimitesGD(etat: EtatSessionEtudeComplete, phase: "limitesGD1" | "limitesGD2", reponse: ReponseLimitesGD): EtatSessionEtudeComplete {
  const excl = exclusionDeLimitesGD(etat, phase);
  const cibleGauche: CibleValeurOuInfini = { fini: false, signe: excl.signeGauche as 1 | -1 };
  const cibleDroite: CibleValeurOuInfini = { fini: false, signe: excl.signeDroit as 1 | -1 };
  return soumettreEcran(
    etat,
    phase,
    reponse,
    (r) => diagnostiquerValeurOuInfini(r.gauche, cibleGauche) === "correct" && diagnostiquerValeurOuInfini(r.droite, cibleDroite) === "correct",
  );
}

// ============================================================================
// Écran "av" — liste add-as-needed des équations d'AV (jamais les points vides, simplifiés).
// ============================================================================

export type ReponseAV = { aucuneAV: true } | { aucuneAV: false; textes: string[] };

export function soumettreReponseAV(etat: EtatSessionEtudeComplete, reponse: ReponseAV): EtatSessionEtudeComplete {
  const cibles = exerciceEtude(etat)
    .exclusions.filter((e) => e.type !== "pointVide")
    .map((e) => e.position);
  return soumettreEcran(etat, "av", reponse, (r) => {
    const textes = r.aucuneAV ? [] : r.textes;
    return diagnostiquerEnsembleEquationsAV(textes, cibles) === "correct";
  });
}

// ============================================================================
// Écran "infini" — UN écran, limite de f(x) en −∞ ET en +∞, TOUJOURS en saisie libre "valeur ou
// infini" (les 2 bornes partagent la MÊME classification horizontale/oblique/aucune dans ce modèle).
// ============================================================================

export interface ReponseInfini {
  moins: string;
  plus: string;
}

function cibleInfini(infini: ComportementInfiniEtude, borne: "moins" | "plus"): CibleValeurOuInfini {
  if (infini.type === "horizontale") return { fini: true, valeur: infini.limite };
  if (infini.type === "oblique") {
    const signe: 1 | -1 = borne === "plus" ? (infini.pente >= 0 ? 1 : -1) : infini.pente >= 0 ? -1 : 1;
    return { fini: false, signe };
  }
  return { fini: false, signe: borne === "plus" ? infini.signePlusInfini : infini.signeMoinsInfini };
}

export function soumettreReponseInfini(etat: EtatSessionEtudeComplete, reponse: ReponseInfini): EtatSessionEtudeComplete {
  const infini = exerciceEtude(etat).infini;
  const cibleMoins = cibleInfini(infini, "moins");
  const ciblePlus = cibleInfini(infini, "plus");
  return soumettreEcran(
    etat,
    "infini",
    reponse,
    (r) => diagnostiquerValeurOuInfini(r.moins, cibleMoins) === "correct" && diagnostiquerValeurOuInfini(r.plus, ciblePlus) === "correct",
  );
}

// ============================================================================
// Écran "coefDirecteur" (conditionnel, si infini.type !== "horizontale") — a=lim f(x)/x aux 2 bornes.
// ============================================================================

export interface ReponseCoefDirecteur {
  moins: string;
  plus: string;
}

function cibleCoefDirecteur(infini: ComportementInfiniEtude, phase: "moins" | "plus"): CibleValeurOuInfini {
  if (infini.type === "oblique") return { fini: true, valeur: infini.pente };
  if (infini.type === "aucune") return { fini: false, signe: phase === "plus" ? infini.signeCoefDirecteurPlus : infini.signeCoefDirecteurMoins };
  throw new Error("cibleCoefDirecteur : écran absent pour infini.type === 'horizontale'");
}

export function soumettreReponseCoefDirecteur(etat: EtatSessionEtudeComplete, reponse: ReponseCoefDirecteur): EtatSessionEtudeComplete {
  const infini = exerciceEtude(etat).infini;
  const cibleMoins = cibleCoefDirecteur(infini, "moins");
  const ciblePlus = cibleCoefDirecteur(infini, "plus");
  return soumettreEcran(
    etat,
    "coefDirecteur",
    reponse,
    (r) => diagnostiquerValeurOuInfini(r.moins, cibleMoins) === "correct" && diagnostiquerValeurOuInfini(r.plus, ciblePlus) === "correct",
  );
}

// ============================================================================
// Écran "coefB" (conditionnel, si infini.type === "oblique") — b=lim (f(x)-a·x) aux 2 bornes.
// a est FINI et IDENTIQUE aux deux bornes dans ce cas (une fraction rationnelle n'a qu'une seule
// asymptote oblique valide aux deux infinis — voir `core5e/etudeComplete.types.ts`), donc b aussi.
// ============================================================================

export interface ReponseCoefB {
  moins: string;
  plus: string;
}

function cibleCoefB(infini: ComportementInfiniEtude): CibleValeurOuInfini {
  if (infini.type !== "oblique") throw new Error("cibleCoefB : écran absent hors infini.type === 'oblique'");
  return { fini: true, valeur: infini.ordonnee };
}

export function soumettreReponseCoefB(etat: EtatSessionEtudeComplete, reponse: ReponseCoefB): EtatSessionEtudeComplete {
  const infini = exerciceEtude(etat).infini;
  const cible = cibleCoefB(infini);
  return soumettreEcran(etat, "coefB", reponse, (r) => diagnostiquerValeurOuInfini(r.moins, cible) === "correct" && diagnostiquerValeurOuInfini(r.plus, cible) === "correct");
}

// ============================================================================
// Écran "asymptoteInfini" — équation(s) AH/AO (ou "aucune"), 2 blocs indépendants (vers −∞/vers +∞),
// TOUJOURS vérifiés contre la MÊME cible `infini` (comportement identique aux 2 bornes dans ce
// modèle — une fraction rationnelle ne peut pas avoir une AH/AO différente selon le côté).
// ============================================================================

export type ReponseBlocAsymptote = { aucune: true } | { aucune: false; type: "horizontale"; valeur: string } | { aucune: false; type: "oblique"; equation: string };

export interface ReponseAsymptoteInfini {
  moins: ReponseBlocAsymptote;
  plus: ReponseBlocAsymptote;
}

function blocAsymptoteCorrect(bloc: ReponseBlocAsymptote, infini: ComportementInfiniEtude): boolean {
  if (infini.type === "aucune") return bloc.aucune === true;
  if (bloc.aucune) return false;
  if (infini.type === "horizontale") return bloc.type === "horizontale" && diagnostiquerNombre(bloc.valeur, infini.limite) === "correct";
  return bloc.type === "oblique" && diagnostiquerQuotient(bloc.equation, infini.pente, infini.ordonnee) === "correct";
}

export function soumettreReponseAsymptoteInfini(etat: EtatSessionEtudeComplete, reponse: ReponseAsymptoteInfini): EtatSessionEtudeComplete {
  const infini = exerciceEtude(etat).infini;
  return soumettreEcran(etat, "asymptoteInfini", reponse, (r) => blocAsymptoteCorrect(r.moins, infini) && blocAsymptoteCorrect(r.plus, infini));
}

// ============================================================================
// Écran conditionnel "casSpecial" — coordonnées du point de recoupement (inchangé).
// ============================================================================

export function soumettreReponseCasSpecial(etat: EtatSessionEtudeComplete, reponse: ReponseCasSpecial): EtatSessionEtudeComplete {
  const ex = exerciceEtude(etat);
  const cas = ex.casSpecial;
  if (!cas) throw new Error("soumettreReponseCasSpecial : cet exercice n'a pas de cas spécial");
  return soumettreEcran(etat, "casSpecial", reponse, (r) => {
    const s = diagnostiquerCasSpecial(r, cas.x, cas.y);
    return s.x === "correct" && s.y === "correct";
  });
}

// ============================================================================
// Variante bonus — "construction inverse" (inchangée).
// ============================================================================

export function soumettreReponseConstructionInverse(etat: EtatSessionEtudeComplete, texte: string): EtatSessionEtudeComplete {
  const ex = etat.exerciceCourant;
  if (ex.mode !== "constructionInverse") throw new Error("soumettreReponseConstructionInverse : mode inattendu");
  const proprietes = ex.proprietes;
  return soumettreEcran(etat, "constructionInverse", texte, (t) => diagnostiquerProprietesConstructionInverse(t, proprietes) === "correct");
}
