/**
 * Couche B (5e) — moteur de session pour 5gen20 ("Limites, reconnaissance et calcul"). N'importe
 * jamais rien de `src/generateurs5e/`.
 */
import type { ExerciceLimite, ExerciceLimiteFormeIndeterminee, ExerciceLimiteInfini, ExerciceLimiteInfiniePoint } from "../core5e/limites.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesLimites";
import type { EtatSessionLimite, PhaseLimite, ResultatExerciceLimite } from "./typesLimites";
import { diagnostiquerFacteurs, diagnostiquerNombre, diagnostiquerRatioDominant, diagnostiquerTermeDominant, verifierReconnaissance, verifierSigne } from "./verificationLimites";
import { estFormeFactorisee } from "./formeSaisieLimites";

/** Écran "conclureLimite" (famille "limiteInfiniePoint") — 3 options : ±∞ ou "n'existe pas". */
export type ReponseConclureLimite = 1 | -1 | "nexistepas";

const POINTS_DE_BASE = 100;

/** Convention STANDARD de la plateforme (2 niveaux d'aide sur tout écran) — contrairement à
 * l'exception à 1 niveau retenue pour 5gen14 (`prompt5gen14corrections.md`), explicitement écartée
 * ici par `prompt5gen20limites.md` ("pas le traitement spécifique à 1 niveau retenu pour 5gen14"). */
export const NIVEAU_AIDE_MAX_LIMITE = 2;

export function niveauAideMaxLimite(): number {
  return NIVEAU_AIDE_MAX_LIMITE;
}

function etatInitial(exercice: ExerciceLimite): Pick<EtatSessionLimite, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "reveleesPartielles"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, reveleesPartielles: {} };
}

export function demarrerSessionLimite(reglages: ReglagesSession5e, generateur: () => ExerciceLimite): EtatSessionLimite {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionLimite): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax };
}

/** Tentatives affichées pour l'écran en cours : 1 sur les écrans à choix fermé (décision F) — sauf
 * « reconnaissance » d'un nombre réel, où la valeur numérique garde les tentatives du réglage. */
export function tentativesMaxLimite(etat: EtatSessionLimite): number {
  const exercice = etat.exerciceCourant;
  if (etat.phase === "reconnaissance") return exercice.famille === "limiteReelle" ? etat.reglages.tentativesMax : 1;
  if (etat.phase === "limitesGaucheDroite" || etat.phase === "conclureLimite") return 1;
  if (etat.phase === "evaluerLimiteFinale" && exercice.famille === "limiteInfini" && exercice.natureLimite === "infinie") return 1;
  return etat.reglages.tentativesMax;
}

export function activerAideSuivante(etat: EtatSessionLimite): EtatSessionLimite {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_LIMITE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionLimite, resultat: ResultatExerciceLimite, revele: boolean): EtatSessionLimite {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    // Les scores/révélations de la DERNIÈRE phase restent dans l'état terminé : récapitulatif et fiche
    // de puce du dernier écran (audit 5c4a point 6 : fiche absente ou mal nommée).
    return { ...etat, resultats, indexExercice, terminee: true, scoresPartiels: resultat.scores, reveleesPartielles: resultat.revelees, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

/** `choixFermeFaux` : vrai quand la partie « choix fermé » de la réponse est fausse — l'écran se clôt
 * alors dès cette tentative (décision F : une seule tentative sur un choix fermé). */
function soumettreEcran<T>(etat: EtatSessionLimite, phaseAttendue: PhaseLimite, reponse: T, verifier: (r: T) => boolean, choixFermeFaux?: (r: T) => boolean): EtatSessionLimite {
  if (etat.terminee || etat.phase !== phaseAttendue) throw new Error(`soumettreEcran : la session n'est pas à l'étape ${phaseAttendue}`);

  const derniereTentative = choixFermeFaux?.(reponse) ?? false;
  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: derniereTentative ? etat.etapeCourante.tentativesUtilisees + 1 : reglagesEtape(etat).tentativesMax,
    verifier,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = etapeCourante.score as number;
  const scoresPartiels = { ...etat.scoresPartiels, [phaseAttendue]: score };
  const reveleesPartielles = { ...etat.reveleesPartielles, [phaseAttendue]: revele };
  const phaseSuivante = phaseApres(etat.exerciceCourant, phaseAttendue);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels, revelees: reveleesPartielles }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, scoresPartiels, reveleesPartielles, derniereEtapeRevelee: revele };
}

// ============================================================================
// Accesseurs narrowed — gardes défensives (jamais atteintes en pratique).
// ============================================================================

function commeFormeIndeterminee(exercice: ExerciceLimite): ExerciceLimiteFormeIndeterminee {
  if (exercice.famille !== "formeIndeterminee") throw new Error("commeFormeIndeterminee : famille hors 'formeIndeterminee'");
  return exercice;
}
function commeInfiniePoint(exercice: ExerciceLimite): ExerciceLimiteInfiniePoint {
  if (exercice.famille !== "limiteInfiniePoint") throw new Error("commeInfiniePoint : famille hors 'limiteInfiniePoint'");
  return exercice;
}
function commeInfini(exercice: ExerciceLimite): ExerciceLimiteInfini {
  if (exercice.famille !== "limiteInfini") throw new Error("commeInfini : famille hors 'limiteInfini'");
  return exercice;
}

// ============================================================================
// Écran commun aux 4 familles (0 — reconnaissance).
// ============================================================================

/** Noté normalement, mais la réponse de l'élève N'INFLUENCE JAMAIS la suite — `ordreComplet`/les
 * écrans suivants dispatchent uniquement sur `etat.exerciceCourant.famille` (la vraie famille),
 * jamais sur `choix` (voir en-tête `typesLimites.ts`). EXCEPTION : famille "limiteReelle", où
 * `reconnaissance` est le SEUL et DERNIER écran — `valeurTexte` (le champ apparu sous le bouton
 * "Nombre réel R", même geste) est alors OBLIGATOIRE et fait partie de la même soumission. */
export function soumettreReponseReconnaissance(etat: EtatSessionLimite, choix: string, valeurTexte?: string): EtatSessionLimite {
  const exercice = etat.exerciceCourant;
  return soumettreEcran(
    etat,
    "reconnaissance",
    { choix, valeurTexte },
    (r) => verifierReconnaissance(r.choix, exercice, r.valeurTexte),
    (r) => r.choix !== exercice.famille,
  );
}

// ============================================================================
// Écrans propres à "formeIndeterminee".
// ============================================================================

export interface ReponseFactoriser {
  numerateur: string[];
  denominateur: string[];
}

export function soumettreReponseFactoriser(etat: EtatSessionLimite, reponse: ReponseFactoriser): EtatSessionLimite {
  const exo = commeFormeIndeterminee(etat.exerciceCourant);
  return soumettreEcran(
    etat,
    "factoriser",
    reponse,
    (r) =>
      diagnostiquerFacteurs(r.numerateur, exo.a, exo.kN, exo.p) === "correct" &&
      diagnostiquerFacteurs(r.denominateur, exo.a, exo.kD, exo.q) === "correct" &&
      r.numerateur.every(estFormeFactorisee) &&
      r.denominateur.every(estFormeFactorisee),
  );
}

export function soumettreReponseSimplifierEvaluer(etat: EtatSessionLimite, texte: string): EtatSessionLimite {
  const exo = commeFormeIndeterminee(etat.exerciceCourant);
  const cible = exo.limite.num / exo.limite.den;
  return soumettreEcran(etat, "simplifierEvaluer", texte, (t) => diagnostiquerNombre(t, cible) === "correct");
}

// ============================================================================
// Écrans propres à "limiteInfiniePoint".
// ============================================================================

/** Écran "factoriserDenominateur" — champ libre UNIQUE (le dénominateur est donné sous forme non
 * factorisée, quel que soit `sousCas`) ; réutilise `diagnostiquerFacteurs` (même mécanisme
 * d'équivalence par échantillonnage que l'écran "factoriser" de "formeIndeterminee"/le composant 4e
 * de factorisation) avec `autreRacine=a` en racine double (D(x)=kD·(x-a)²). */
export function soumettreReponseFactoriserDenominateur(etat: EtatSessionLimite, textes: string[]): EtatSessionLimite {
  const exo = commeInfiniePoint(etat.exerciceCourant);
  const autreRacine = exo.sousCas === "racineDouble" ? exo.a : (exo.q as number);
  return soumettreEcran(etat, "factoriserDenominateur", textes, (t) => diagnostiquerFacteurs(t, exo.a, exo.kD, autreRacine) === "correct" && t.every(estFormeFactorisee));
}

export interface ReponseLimitesGaucheDroite {
  gauche: 1 | -1;
  droite: 1 | -1;
}

/** Écran "limitesGaucheDroite" — 2 questions sur le même écran (limite à gauche puis à droite),
 * TOUJOURS posées même en racine double (`signeLimiteGauche===signeLimiteDroite` alors, la question
 * reste posée 2 fois — l'élève trouve simplement la même valeur des deux côtés). */
export function soumettreReponseLimitesGaucheDroite(etat: EtatSessionLimite, reponse: ReponseLimitesGaucheDroite): EtatSessionLimite {
  const exo = commeInfiniePoint(etat.exerciceCourant);
  return soumettreEcran(
    etat,
    "limitesGaucheDroite",
    reponse,
    (r) => verifierSigne(r.gauche, exo.signeLimiteGauche) && verifierSigne(r.droite, exo.signeLimiteDroite),
    () => true,
  );
}

/** Écran "conclureLimite" — 3 options (−∞/+∞/∄) : racine simple ⟹ la limite bilatérale N'EXISTE
 * JAMAIS (gauche≠droite par construction) ; racine double ⟹ elle existe TOUJOURS (même signe des 2
 * côtés, valeur = `signeLimiteGauche`). Pas d'aide sur cet écran (inchangé du prompt). */
export function soumettreReponseConclureLimite(etat: EtatSessionLimite, choix: ReponseConclureLimite): EtatSessionLimite {
  const exo = commeInfiniePoint(etat.exerciceCourant);
  const attendu: ReponseConclureLimite = exo.sousCas === "racineSimple" ? "nexistepas" : exo.signeLimiteGauche;
  return soumettreEcran(etat, "conclureLimite", choix, (c) => c === attendu, () => true);
}

// ============================================================================
// Écrans propres à "limiteInfini".
// ============================================================================

export interface ReponseTermeDominant {
  numerateur: string;
  denominateur: string;
}

export function soumettreReponseTermeDominant(etat: EtatSessionLimite, reponse: ReponseTermeDominant): EtatSessionLimite {
  const exo = commeInfini(etat.exerciceCourant);
  return soumettreEcran(
    etat,
    "termeDominant",
    reponse,
    (r) => diagnostiquerTermeDominant(r.numerateur, exo.coeffsN[exo.degN], exo.degN) === "correct" && diagnostiquerTermeDominant(r.denominateur, exo.coeffsD[exo.degD], exo.degD) === "correct",
  );
}

export function soumettreReponseSimplifierLimiteRef(etat: EtatSessionLimite, texte: string): EtatSessionLimite {
  const exo = commeInfini(etat.exerciceCourant);
  return soumettreEcran(etat, "simplifierLimiteRef", texte, (t) => diagnostiquerRatioDominant(t, exo.ratioCoefficients, exo.degreResultat) === "correct");
}

/** "evaluerLimiteFinale" — champ NUMÉRIQUE quand `natureLimite` est "finie"/"zero" (jamais atteint
 * si "infinie", voir `soumettreReponseEvaluerLimiteFinaleSigne` pour ce cas). */
export function soumettreReponseEvaluerLimiteFinaleNumerique(etat: EtatSessionLimite, texte: string): EtatSessionLimite {
  const exo = commeInfini(etat.exerciceCourant);
  const cible = exo.natureLimite === "zero" ? 0 : exo.ratioCoefficients.num / exo.ratioCoefficients.den;
  return soumettreEcran(etat, "evaluerLimiteFinale", texte, (t) => diagnostiquerNombre(t, cible) === "correct");
}

/** "evaluerLimiteFinale" — choix de signe (±∞) quand `natureLimite==="infinie"`. */
export function soumettreReponseEvaluerLimiteFinaleSigne(etat: EtatSessionLimite, choix: 1 | -1): EtatSessionLimite {
  const exo = commeInfini(etat.exerciceCourant);
  if (exo.signeLimiteInfinie === undefined) throw new Error("soumettreReponseEvaluerLimiteFinaleSigne : signeLimiteInfinie absent");
  const attendu = exo.signeLimiteInfinie;
  return soumettreEcran(etat, "evaluerLimiteFinale", choix, (c) => verifierSigne(c, attendu), () => true);
}
