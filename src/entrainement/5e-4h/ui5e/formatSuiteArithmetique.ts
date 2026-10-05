/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen14 ("Suites arithmétiques, formule
 * générale et termes"). 5 familles ("principal"/"coherence"/"algebriqueTermeGeneral"/
 * "algebriqueSommeSn"/"algebriqueRangN"), 13 phases — `consignePhase`/`texteAideNiveau1`/
 * `texteAideNiveau2` dispatchent par phase, combo-conscients pour trouverR/trouverU1 (la formule
 * substituée diffère selon la donnée de départ) et famille/sous-cas-conscients pour
 * poserEquationAlgebrique/resoudreXAlgebrique/calculerTermesAlgebrique/calculerSn (famille A vs les
 * 4 sous-cas de la famille B, REFONTE `prompt5gen14refontefamillesbonus.md`).
 *
 * Labels/fragments indexés TOUJOURS en LaTeX réel avec indice EXPLICITEMENT accolé (`u_{100}`,
 * jamais `u_100`, qui ne sous-indicerait que le "1" — piège multi-chiffres) — rendus via `<Katex>`
 * + `field-label-minuscule` côté composants, jamais un caractère `_` littéral affiché tel quel.
 */
import type {
  DonneesSuiteArithmetique,
  ExerciceAlgebriqueRangN,
  ExerciceAlgebriqueSommeSn,
  ExerciceAlgebriqueSommeSnD,
  ExerciceAlgebriqueTermeGeneral,
  ExerciceCoherenceSuiteArithmetique,
  ExercicePrincipalSuiteArithmetique,
  ExerciceSuiteArithmetique,
  TermeLineaire,
} from "../core5e/suitesArithmetiques.types";
import { ciblesCalculerTermesAlgebrique } from "../moteur5e/sessionSuiteArithmetique";
import { ordreComplet } from "../moteur5e/typesSuiteArithmetique";
import type { PhaseSuiteArithmetique } from "../moteur5e/typesSuiteArithmetique";

function u(indice: number | string): string {
  return `u_{${indice}}`;
}
function s(indice: number | string): string {
  return `S_{${indice}}`;
}

function commeAvecBase(exercice: ExerciceSuiteArithmetique): ExercicePrincipalSuiteArithmetique | ExerciceCoherenceSuiteArithmetique {
  if (exercice.famille !== "principal" && exercice.famille !== "coherence") throw new Error("commeAvecBase : famille hors 'principal'/'coherence'");
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
// Consigne générale + bloc de données (fragments, "bloc fitter" dès la conception).
// ============================================================================

export function consigneGenerale(exercice: ExerciceSuiteArithmetique): string {
  switch (exercice.famille) {
    case "principal":
      return "Détermine tous les termes de cette suite arithmétique à partir des données fournies.";
    case "coherence":
      return "Ces 3 données définissent-elles une suite arithmétique cohérente ?";
    case "algebriqueTermeGeneral":
      return "uₚ et uₙ, donnés en fonction de x, sont les termes d'une suite arithmétique de raison r. Détermine leurs valeurs.";
    case "algebriqueSommeSn":
      return exercice.sousCas === "D"
        ? "La somme Sₙ des n premiers termes d'une suite arithmétique, donnée en fonction de x, dépend de u₁, r et n (tous connus). Détermine sa valeur, puis x."
        : "La somme Sₙ des n premiers termes d'une suite arithmétique dépend de u₁ et r. Certaines de ces grandeurs sont données en fonction de x. Détermine leurs valeurs.";
    case "algebriqueRangN":
      return "Détermine le rang n pour lequel cette suite atteint la valeur donnée.";
  }
}

/** `t.b` passe par `formatValeurExacteLatex` (fraction irréductible si besoin) — pas toujours un
 * entier : pour la famille A (`algebriqueTermeGeneral`), `un.b` est dérivé de `xReel` (dénominateur
 * jusqu'à 4) et peut être une fraction propre (ex. `1.75`, bug Playwright confirmé avant ce fix —
 * affiché en décimal brut au lieu de `7/4`). */
function formatTermeLatex(t: TermeLineaire): string {
  const termeA = t.a === 1 ? "x" : t.a === -1 ? "-x" : `${t.a}x`;
  if (t.b === 0) return termeA;
  const valeurB = formatValeurExacteLatex(t.b);
  return t.b > 0 ? `${termeA}+${valeurB}` : `${termeA}${valeurB}`;
}

/** Constante signée, prête à être concaténée après un autre fragment ("+7"/"-7"/"" si nulle) — même
 * logique que le "terme b" de `formatTermeLatex`, factorisée pour être réutilisée telle quelle
 * (ex. équation confirmée de la famille A, où (n-p)·r est un nombre à ajouter à `up(x)`). */
function formatConstanteSigneeLatex(v: number): string {
  if (v === 0) return "";
  return v > 0 ? `+${v}` : `${v}`;
}

function pgcdLocal(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Formate une valeur NUMÉRIQUE substituée (k, x, up(x), un(x), u1(x), r(x)...) — entier si possible,
 * sinon fraction irréductible en LaTeX, jamais un décimal brut ("Fraction irréductible, jamais de
 * décimal", CLAUDE.md). Ces valeurs sont TOUJOURS un multiple exact de 1/8 par construction
 * (`xReel` limité aux dénominateurs {1,2,4}, un facteur 2 supplémentaire pouvant apparaître selon la
 * formule mobilisée) — `Math.round` est donc exact, jamais un arrondi qui masquerait une imprécision
 * flottante. */
function formatValeurExacteLatex(valeur: number): string {
  const DENOMINATEUR_MAX = 8;
  const numerateurBrut = Math.round(valeur * DENOMINATEUR_MAX);
  if (numerateurBrut === 0) return "0";
  const signe = numerateurBrut < 0 ? "-" : "";
  const g = pgcdLocal(numerateurBrut, DENOMINATEUR_MAX);
  const num = Math.abs(numerateurBrut) / g;
  const den = DENOMINATEUR_MAX / g;
  return den === 1 ? `${signe}${num}` : `${signe}\\dfrac{${num}}{${den}}`;
}

/** Bloc de données PERSISTANT, en fragments LaTeX — dispatch par famille (et par `sousCas` pour
 * "algebriqueSommeSn"). Pour "principal", les 2 fragments montrés dépendent du combo. Pour
 * "algebriqueTermeGeneral" (famille A refondue) : up(x)/un(x) TOUS DEUX algébriques, plus r
 * numérique — jamais de u1 ni de "k" séparé (l'équation à poser oppose directement up(x) et un(x)).
 * Pour "algebriqueSommeSn" (famille B), le bloc dépend du sous-cas : A/B/C montrent u1/r (l'un ou
 * les deux algébriques selon le sous-cas) puis "Sn=k" (k déjà connu, cible directe) ; D montre
 * u1/r NUMÉRIQUES puis "Sn(x)=..." (l'expression algébrique elle-même, PAS sa valeur k — celle-ci
 * doit être calculée par l'élève au premier écran, jamais révélée dans le bloc de données). */
export function formatTermesDonneesLatex(exercice: ExerciceSuiteArithmetique): string[] {
  switch (exercice.famille) {
    case "principal": {
      const { donnees, base } = exercice;
      switch (donnees.combo) {
        case "direct":
          return [`${u(1)}=${base.u1}`, `r=${base.r}`];
        case "u1_up":
          return [`${u(1)}=${base.u1}`, `${u(donnees.up.indice)}=${donnees.up.valeur}`];
        case "r_up":
          return [`r=${base.r}`, `${u(donnees.up.indice)}=${donnees.up.valeur}`];
        case "up_uq":
          return [`${u(donnees.up.indice)}=${donnees.up.valeur}`, `${u(donnees.uq.indice)}=${donnees.uq.valeur}`];
        case "un_sn":
          return [`${u(donnees.un.indice)}=${donnees.un.valeur}`, `${s(donnees.un.indice)}=${donnees.sn}`];
      }
      break;
    }
    case "coherence":
      return [`r=${exercice.r}`, `${u(exercice.p.indice)}=${exercice.p.valeur}`, `${u(exercice.q.indice)}=${exercice.q.valeur}`];
    case "algebriqueTermeGeneral":
      return [`${u(exercice.p)}=${formatTermeLatex(exercice.up)}`, `${u(exercice.n)}=${formatTermeLatex(exercice.un)}`, `r=${exercice.r}`];
    case "algebriqueSommeSn": {
      const e = exercice;
      switch (e.sousCas) {
        case "A":
          return [`${u(1)}=${formatTermeLatex(e.u1)}`, `r=${e.r}`, `${s(e.n)}=${formatValeurExacteLatex(e.k)}`];
        case "B":
          return [`${u(1)}=${e.u1}`, `r=${formatTermeLatex(e.r)}`, `${s(e.n)}=${formatValeurExacteLatex(e.k)}`];
        case "C":
          return [`${u(1)}=${formatTermeLatex(e.u1)}`, `r=${formatTermeLatex(e.r)}`, `${s(e.n)}=${formatValeurExacteLatex(e.k)}`];
        case "D":
          return [`${u(1)}=${e.u1}`, `r=${e.r}`, `${s(e.n)}=${formatTermeLatex(e.sn)}`];
      }
      break;
    }
    case "algebriqueRangN":
      return [`${u(1)}=${exercice.u1}`, `r=${exercice.r}`, `${u("n")}=${exercice.k}`];
  }
}

// ============================================================================
// Label / consigne par phase.
// ============================================================================

/** Label LaTeX du champ pour les écrans à un seul champ — rendu via `<Katex>` +
 * `field-label-minuscule`, jamais du texte brut (voir en-tête de fichier). */
export function labelPhase(exercice: ExerciceSuiteArithmetique, phase: PhaseSuiteArithmetique): string {
  switch (phase) {
    case "trouverR":
      return "r=";
    case "trouverU1":
      return `${u(1)}=`;
    case "formuleGenerale":
      return `${u("n")}=`;
    case "termeEloigne": {
      const e = commeAvecBase(exercice);
      return `${u(e.indiceTermeEloigne as number)}=`;
    }
    case "sommeSn": {
      const e = commeAvecBase(exercice);
      return `${s(e.indiceSn as number)}=`;
    }
    case "calculerSn": {
      const e = commeSommeSnD(exercice);
      return `${s(e.n)}=`;
    }
    case "resoudreXAlgebrique":
      return "x=";
    case "resoudreRangN":
      return "n=";
    default:
      return "";
  }
}

export function labelsTermesProches(exercice: ExercicePrincipalSuiteArithmetique | ExerciceCoherenceSuiteArithmetique): string[] {
  return (exercice.indicesTermesProches as [number, number, number, number]).map((n) => `${u(n)}=`);
}

/** Labels de l'écran "calculerTermesAlgebrique" — dispatch par famille/sous-cas : famille A → up/un
 * (2 champs), sous-cas B/A (1 seul, u1 OU r selon lequel était algébrique), sous-cas C → u1 ET r (2
 * champs, comme avant la refonte). Jamais atteinte pour le sous-cas D (pas de cet écran, voir
 * `ORDRE_SOMME_SN_D`). Fonction (et non plus une constante) — les labels dépendent désormais de
 * l'exercice réel, contrairement à l'ancien `LABELS_CALCULER_TERMES_ALGEBRIQUE` fixe. */
export function labelsCalculerTermesAlgebrique(exercice: ExerciceSuiteArithmetique): string[] {
  if (exercice.famille === "algebriqueTermeGeneral") return [`${u(exercice.p)}=`, `${u(exercice.n)}=`];
  if (exercice.famille === "algebriqueSommeSn") {
    switch (exercice.sousCas) {
      case "A":
        return [`${u(1)}=`];
      case "B":
        return ["r="];
      case "C":
        return [`${u(1)}=`, "r="];
      case "D":
        return [];
    }
  }
  return [];
}

/** Écrans dont l'aide niveau 1 est une formule LaTeX pure (rendue via `<Katex>`), jamais du texte
 * brut. "coherenceJugement" reste HORS scope (seul écran à garder une vraie aide niveau 2 — voir
 * aussi `niveauAideMaxSuiteArithmetique`). `resoudreXAlgebrique`/`calculerTermesAlgebrique` restent
 * dans cet ensemble par exhaustivité (le texte existe toujours, cf. `texteAideNiveau1`) même si
 * `niveauAideMaxSuiteArithmetique` les plafonne désormais à 0 — le bouton d'aide ne s'affiche donc
 * jamais pour ces 2 phases, cette entrée n'est en pratique plus jamais consommée. */
export const PHASES_AIDE1_LATEX = new Set<PhaseSuiteArithmetique>([
  "trouverR",
  "trouverU1",
  "formuleGenerale",
  "termesProches",
  "termeEloigne",
  "sommeSn",
  "calculerSn",
  "poserEquationAlgebrique",
  "resoudreXAlgebrique",
  "calculerTermesAlgebrique",
  "poserEquationRangN",
  "resoudreRangN",
]);

/** Libellé lisible par phase, pour les panneaux de révélation/résumé de session — jamais un
 * jargon de conception, toujours la compétence testée en clair. */
export const LIBELLE_PHASE_SUITE_ARITHMETIQUE: Record<PhaseSuiteArithmetique, string> = {
  trouverR: "Trouver la raison r",
  trouverU1: "Trouver le premier terme u₁",
  formuleGenerale: "Formule générale uₙ",
  termesProches: "Termes consécutifs",
  termeEloigne: "Terme éloigné",
  sommeSn: "Somme Sₙ",
  coherenceJugement: "Jugement de cohérence",
  calculerSn: "Calculer Sₙ",
  poserEquationAlgebrique: "Poser l'équation",
  resoudreXAlgebrique: "Résoudre pour x",
  calculerTermesAlgebrique: "Calculer les grandeurs algébriques",
  poserEquationRangN: "Poser l'équation",
  resoudreRangN: "Résoudre pour n",
};

function consigneTrouverR(combo: DonneesSuiteArithmetique["combo"]): string {
  switch (combo) {
    case "u1_up":
      return "Détermine la raison r à partir de u₁ et du terme donné.";
    case "up_uq":
      return "Détermine la raison r à partir des 2 termes donnés.";
    case "un_sn":
      return "Détermine la raison r, maintenant que u₁ est connu.";
    default:
      return "";
  }
}

function consigneTrouverU1(combo: DonneesSuiteArithmetique["combo"]): string {
  switch (combo) {
    case "r_up":
    case "up_uq":
      return "Détermine le premier terme u₁.";
    case "un_sn":
      return "Détermine le premier terme u₁ à partir de la somme Sₙ et du terme uₙ.";
    default:
      return "Détermine le premier terme u₁ (r est déjà connu).";
  }
}

/** Consigne de l'écran "poserEquationAlgebrique" — famille A : relation générale entre 2 termes.
 * Famille B, sous-cas A/B/C : Sn=k directement (u1/r substitués). Sous-cas D : Sn(x) doit être
 * égalée à la valeur DÉJÀ TROUVÉE à l'écran "calculerSn" précédent (jamais reformulée via la
 * formule générale de Sn, l'élève l'a déjà mobilisée). */
function consignePoserEquationAlgebrique(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): string {
  if (exercice.famille === "algebriqueTermeGeneral") return "Donne l'équation qui permet de déterminer la valeur de x.";
  if (exercice.sousCas === "D") return `Donne l'équation qui permet de déterminer la valeur de x, sachant que Sₙ=${formatValeurExacteLatex(exercice.k)} (trouvé à l'écran précédent).`;
  return "Donne l'équation qui permet de déterminer la valeur de x.";
}

export function consignePhase(exercice: ExerciceSuiteArithmetique, phase: PhaseSuiteArithmetique): string {
  switch (phase) {
    case "trouverR":
      // Jamais atteint pour la famille "coherence" (r y est toujours donné directement).
      return consigneTrouverR((exercice as ExercicePrincipalSuiteArithmetique).donnees.combo);
    case "trouverU1":
      // "coherence" se comporte comme le combo "r_up" pour cet écran (r déjà connu).
      return consigneTrouverU1(exercice.famille === "coherence" ? "r_up" : (exercice as ExercicePrincipalSuiteArithmetique).donnees.combo);
    case "formuleGenerale":
      return "Exprime la formule générale uₙ, avec u₁ et r substitués (utilise \"n\" comme variable).";
    case "termesProches":
      return "Calcule ces termes consécutifs.";
    case "termeEloigne":
      return "Calcule ce terme éloigné.";
    case "sommeSn":
      return "Calcule cette somme.";
    case "coherenceJugement":
      return "Juge si ces 3 données décrivent une suite arithmétique cohérente.";
    case "calculerSn":
      return "Calcule la valeur de Sₙ (u₁, r et n sont tous connus).";
    case "poserEquationAlgebrique":
      return consignePoserEquationAlgebrique(commeAlgebrique(exercice));
    case "resoudreXAlgebrique":
      return "Résous l'équation pour x.";
    case "calculerTermesAlgebrique":
      return "En déduire les valeurs numériques, maintenant que x est connu (substitue x dans chaque expression).";
    case "poserEquationRangN":
      return "Pose l'équation traduisant uₙ=k (valeurs dans le bloc de données).";
    case "resoudreRangN":
      return "Résous, trouve n (un rang est toujours un entier positif, aucun arrondi accepté).";
  }
}

// ============================================================================
// Aides — niveau 1 (méthode), niveau 2 (formule/valeurs substituées, jamais le résultat).
// ============================================================================

/** Formule générale (jamais de valeurs substituées, contrairement à l'ancienne aide niveau 2 —
 * `PHASES_AIDE1_LATEX`) — combo-consciente pour trouverR/trouverU1, famille/sous-cas-consciente pour
 * poserEquationAlgebrique (famille A : u_n=u_p+(n-p)r ; famille B sous-cas A/C : S_n=(n/2)(2u1+(n-1)r)
 * avec piège de distribution documenté pour B/C, où r(x) est algébrique ; sous-cas D : rappel
 * d'égaler Sn(x) à la valeur déjà trouvée, PAS la formule générale). */
export function texteAideNiveau1(exercice: ExerciceSuiteArithmetique, phase: PhaseSuiteArithmetique): string {
  switch (phase) {
    case "trouverR": {
      // Jamais atteint pour la famille "coherence" (r y est toujours donné directement).
      const combo = (exercice as ExercicePrincipalSuiteArithmetique).donnees.combo;
      if (combo === "un_sn") return "r=\\dfrac{u_n-u_1}{n-1}";
      if (combo === "up_uq") return "r=\\dfrac{u_q-u_p}{q-p}";
      return "r=\\dfrac{u_p-u_1}{p-1}"; // u1_up, seul combo restant à atteindre cette phase
    }
    case "trouverU1": {
      // "coherence" se comporte comme le combo "r_up" pour cet écran (r déjà connu).
      const combo = exercice.famille === "coherence" ? "r_up" : (exercice as ExercicePrincipalSuiteArithmetique).donnees.combo;
      if (combo === "un_sn") return "u_1=\\dfrac{2S_n}{n}-u_n";
      return "u_1=u_p-(p-1)\\times r"; // r_up / up_uq / coherence
    }
    case "formuleGenerale":
    case "termesProches":
    case "termeEloigne":
      return "u_n=u_1+(n-1)\\times r";
    case "sommeSn":
    case "calculerSn":
      return "S_n=\\dfrac{n}{2}(2u_1+(n-1)r)";
    case "coherenceJugement":
      return "Vérifie si u(q) − u(p) = (q−p)·r exactement.";
    case "poserEquationAlgebrique": {
      const e = commeAlgebrique(exercice);
      if (e.famille === "algebriqueTermeGeneral") return "u_n=u_p+(n-p)\\times r";
      if (e.sousCas === "D") return `S_n(x)=${formatValeurExacteLatex(e.k)}`;
      // Piège de distribution — UNIQUEMENT documenté quand r est algébrique (sous-cas B/C) : il
      // faut distribuer (n-1) sur TOUTE l'expression r(x), pas seulement son coefficient en x.
      return e.sousCas === "B" || e.sousCas === "C"
        ? "S_n=\\dfrac{n}{2}(2u_1+(n-1)r)\\ \\text{ (distribue }(n-1)\\text{ sur TOUT }r(x)\\text{)}"
        : "S_n=\\dfrac{n}{2}(2u_1+(n-1)r)";
    }
    case "resoudreXAlgebrique":
    case "calculerTermesAlgebrique": {
      const e = commeAlgebrique(exercice);
      if (e.famille === "algebriqueTermeGeneral") return "u_n=u_p+(n-p)\\times r";
      return "S_n=\\dfrac{n}{2}(2u_1+(n-1)r)";
    }
    case "poserEquationRangN":
    case "resoudreRangN":
      return "u_n=u_1+(n-1)\\times r";
  }
}

/** Aide niveau 2 — LaTeX, formule/valeurs substituées, jamais le résultat final calculé. TOUTE
 * phase hors "coherenceJugement" (le SEUL écran à garder une aide niveau 2 réelle) retourne `""` —
 * `niveauAideMaxSuiteArithmetique` les plafonne à 1 (ou 0), ces branches ne sont donc jamais
 * atteintes en pratique (gardées `""` par exhaustivité TypeScript, jamais supprimées du type
 * `PhaseSuiteArithmetique`). */
export function texteAideNiveau2(exercice: ExerciceSuiteArithmetique, phase: PhaseSuiteArithmetique): string {
  switch (phase) {
    case "trouverR":
    case "trouverU1":
    case "formuleGenerale":
    case "termesProches":
    case "termeEloigne":
    case "sommeSn":
    case "calculerSn":
    case "poserEquationAlgebrique":
    case "resoudreXAlgebrique":
    case "calculerTermesAlgebrique":
    case "poserEquationRangN":
    case "resoudreRangN":
      return "";
    case "coherenceJugement": {
      if (exercice.famille !== "coherence") return "";
      const produit = (exercice.q.indice - exercice.p.indice) * exercice.r;
      const ecart = exercice.q.valeur - exercice.p.valeur;
      return `(q-p)\\times r=(${exercice.q.indice}-${exercice.p.indice})\\times ${exercice.r}=${produit} \\quad ${u("q")}-${u("p")}=${ecart}`;
    }
  }
}

// ============================================================================
// Bloc "état actuel" — récapitule, à partir du 2e écran de `ordreComplet(exercice)`, les valeurs
// déjà CONFIRMÉES plus tôt dans CETTE séquence (r, u₁, la formule générale une fois substituée, ou
// l'équation/x/Sn pour les familles "algebrique*") — jamais la saisie brute de l'élève, toujours
// dérivé PUREMENT de `exercice` (même convention "état actuel" que le reste du projet). Itère
// `precedentes` (le PRÉFIXE réel de `ordreComplet(exercice)` avant `phase`) DANS L'ORDRE — reflète
// donc l'ordre RÉEL de résolution. `null` (rien rendu) tant que rien n'est encore accumulable pour
// l'écran courant — toujours le cas sur le tout premier écran d'une séquence.
// ============================================================================

function formatRConfirmeLatex(exercice: ExerciceSuiteArithmetique): string {
  const e = commeAvecBase(exercice);
  return `r=${e.base.r}`;
}

function formatUnConfirmeLatex(exercice: ExerciceSuiteArithmetique): string {
  const e = commeAvecBase(exercice);
  return `${u(1)}=${e.base.u1}`;
}

function formatFormuleGeneraleConfirmeeLatex(exercice: ExerciceSuiteArithmetique): string {
  const e = commeAvecBase(exercice);
  return `${u("n")}=${e.base.u1}+(n-1)\\times ${e.base.r}`;
}

/** Valeur de S_n trouvée à l'écran "calculerSn" (sous-cas D uniquement), une fois confirmée. */
function formatSnTrouveConfirmeLatex(exercice: ExerciceSuiteArithmetique): string {
  const e = commeSommeSnD(exercice);
  return `${s(e.n)}=${e.k}`;
}

/** Équation posée à l'écran "poserEquationAlgebrique" une fois confirmée — famille A : up(x) et
 * un(x) substitués ALGÉBRIQUEMENT (jamais résolus), (n-p)·r calculé en un nombre unique (r est
 * numérique dans cette famille, contrairement à la famille B). Famille B : u1/r substitués
 * ALGÉBRIQUEMENT selon le sous-cas, Sn factorisé en toutes lettres — sous-cas D : Sn(x)=k (k déjà
 * connu depuis l'écran "calculerSn"). */
function formatEquationAlgebriqueConfirmeeLatex(exercice: ExerciceSuiteArithmetique): string {
  const e = commeAlgebrique(exercice);
  if (e.famille === "algebriqueTermeGeneral") {
    const { up, un, p, n, r } = e;
    return `${formatTermeLatex(un)}=${formatTermeLatex(up)}${formatConstanteSigneeLatex((n - p) * r)}`;
  }
  switch (e.sousCas) {
    case "A":
      return `\\dfrac{${e.n}}{2}\\left(2(${formatTermeLatex(e.u1)})+${e.n - 1}\\times ${e.r}\\right)=${e.k}`;
    case "B":
      return `\\dfrac{${e.n}}{2}\\left(2\\times ${e.u1}+${e.n - 1}(${formatTermeLatex(e.r)})\\right)=${e.k}`;
    case "C":
      return `\\dfrac{${e.n}}{2}\\left(2(${formatTermeLatex(e.u1)})+${e.n - 1}(${formatTermeLatex(e.r)})\\right)=${e.k}`;
    case "D":
      return `${formatTermeLatex(e.sn)}=${e.k}`;
  }
}

function formatXAlgebriqueConfirmeLatex(exercice: ExerciceSuiteArithmetique): string {
  const e = commeAlgebrique(exercice);
  return `x=${formatValeurExacteLatex(e.xReel)}`;
}

/** Équation posée à l'écran "poserEquationRangN" une fois confirmée — u1/r NUMÉRIQUES (contrairement
 * à `formatEquationAlgebriqueConfirmeeLatex`), n reste symbolique (c'est l'inconnue). */
function formatEquationRangNConfirmeeLatex(exercice: ExerciceSuiteArithmetique): string {
  const e = commeRangN(exercice);
  return `${e.u1}+(n-1)\\times ${e.r}=${e.k}`;
}

export function formatTermesEtatActuelLatex(exercice: ExerciceSuiteArithmetique, phase: PhaseSuiteArithmetique): string[] | null {
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  const precedentes = index > 0 ? ordre.slice(0, index) : [];

  const termes: string[] = [];
  for (const p of precedentes) {
    if (p === "trouverR") termes.push(formatRConfirmeLatex(exercice));
    else if (p === "trouverU1") termes.push(formatUnConfirmeLatex(exercice));
    else if (p === "formuleGenerale") termes.push(formatFormuleGeneraleConfirmeeLatex(exercice));
    else if (p === "calculerSn") termes.push(formatSnTrouveConfirmeLatex(exercice));
    else if (p === "poserEquationAlgebrique") termes.push(formatEquationAlgebriqueConfirmeeLatex(exercice));
    else if (p === "resoudreXAlgebrique") termes.push(formatXAlgebriqueConfirmeLatex(exercice));
    else if (p === "poserEquationRangN") termes.push(formatEquationRangNConfirmeeLatex(exercice));
  }
  return termes.length > 0 ? termes : null;
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE pour chaque écran RÉELLEMENT traversé
// (`ordreComplet(exercice)`), jamais un score fractionnaire (voir `ResultatPanelSuiteArithmetique.tsx`).
// Réutilise les mêmes formateurs "confirmé" que le bloc état actuel ci-dessus pour les phases où
// les deux notions coïncident exactement ; `termesProches`/`termeEloigne`/`sommeSn`/
// `calculerTermesAlgebrique`/`resoudreRangN` (jamais accumulées dans l'état actuel) ont chacune leur
// propre calcul.
// ============================================================================

function termeArithmetiqueLocal(u1: number, r: number, n: number): number {
  return u1 + (n - 1) * r;
}
function sommeArithmetiqueLocal(u1: number, r: number, n: number): number {
  return (n / 2) * (2 * u1 + (n - 1) * r);
}

/** Labels associés aux cibles de `calculerTermesAlgebrique` (`ciblesCalculerTermesAlgebrique`,
 * `moteur5e/sessionSuiteArithmetique.ts`) — même dispatch que `labelsCalculerTermesAlgebrique`
 * ci-dessus, réutilisée pour le récapitulatif final plutôt que redupliquée. */
function nomsCalculerTermesAlgebrique(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): string[] {
  if (exercice.famille === "algebriqueTermeGeneral") return [u(exercice.p), u(exercice.n)];
  switch (exercice.sousCas) {
    case "A":
      return [u(1)];
    case "B":
      return ["r"];
    case "C":
      return [u(1), "r"];
    case "D":
      return [];
  }
}

/** Réponse attendue à un écran donné, en fragments LaTeX ("bloc fitter" — un fragment par valeur,
 * pour les écrans à plusieurs termes) — `[]` pour "coherenceJugement", traitée à part par
 * l'appelant (un texte "Cohérentes"/"Incohérentes", jamais du LaTeX). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceSuiteArithmetique, phase: PhaseSuiteArithmetique): string[] {
  switch (phase) {
    case "trouverR":
      return [formatRConfirmeLatex(exercice)];
    case "trouverU1":
      return [formatUnConfirmeLatex(exercice)];
    case "formuleGenerale":
      return [formatFormuleGeneraleConfirmeeLatex(exercice)];
    case "termesProches": {
      const e = commeAvecBase(exercice);
      const indices = e.indicesTermesProches as [number, number, number, number];
      return indices.map((n) => `${u(n)}=${termeArithmetiqueLocal(e.base.u1, e.base.r, n)}`);
    }
    case "termeEloigne": {
      const e = commeAvecBase(exercice);
      const n = e.indiceTermeEloigne as number;
      return [`${u(n)}=${termeArithmetiqueLocal(e.base.u1, e.base.r, n)}`];
    }
    case "sommeSn": {
      const e = commeAvecBase(exercice);
      const n = e.indiceSn as number;
      return [`${s(n)}=${sommeArithmetiqueLocal(e.base.u1, e.base.r, n)}`];
    }
    case "coherenceJugement":
      return [];
    case "calculerSn":
      return [formatSnTrouveConfirmeLatex(exercice)];
    case "poserEquationAlgebrique":
      return [formatEquationAlgebriqueConfirmeeLatex(exercice)];
    case "resoudreXAlgebrique":
      return [formatXAlgebriqueConfirmeLatex(exercice)];
    case "calculerTermesAlgebrique": {
      const e = commeAlgebrique(exercice);
      const noms = nomsCalculerTermesAlgebrique(e);
      const cibles = ciblesCalculerTermesAlgebrique(e);
      return noms.map((nom, i) => `${nom}=${formatValeurExacteLatex(cibles[i])}`);
    }
    case "poserEquationRangN":
      return [formatEquationRangNConfirmeeLatex(exercice)];
    case "resoudreRangN": {
      const e = commeRangN(exercice);
      return [`n=${e.n}`];
    }
  }
}
