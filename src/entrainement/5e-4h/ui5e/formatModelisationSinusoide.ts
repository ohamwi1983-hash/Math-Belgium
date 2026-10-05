/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen13 ("Modéliser une fonction
 * sinusoïdale en contexte"). 17 phases possibles (Phase 1 : 9 réparties sur 3 techniques, Phase 2 :
 * 3+3+4 réparties sur 3 types) — `consignePhase`/`texteAideNiveau1`/`texteAideNiveau2` dispatchent
 * TOUJOURS par phase, `texteAideNiveau1`/`consignePhase` prennent aussi l'exercice quand le contenu
 * dépend de la technique/du type réellement tiré (ex. "fonctionFinale", dont l'aide diffère
 * radicalement entre B1 — φ symbolique — et les 3 autres techniques).
 */
import type { BrancheModelisation, DonneesPhase1, ExerciceModelisationSinusoide, QuestionInequation } from "../core5e/modelisationSinusoide.types";
import type { PhaseModelisationSinusoide } from "../moteur5e/typesModelisationSinusoide";
import { ordreComplet } from "../moteur5e/typesModelisationSinusoide";

export function arrondi(v: number): number {
  return Math.round(v * 100) / 100;
}

/** Arrondi à 4 décimales — réservé à ω/φ (B3, écran "resolution") : ces 2 valeurs ne sont JAMAIS
 * des multiples exacts de π (contrairement à B1/B2, voir `formatOmegaExactPiLatex`), et
 * `arrondi` (2 décimales) les rendait visiblement incohérentes avec des grandeurs dérivées plus
 * précises affichées ailleurs sur l'écran (ex. la fenêtre t∈[0;220.39], qui implique ω≈0.057 —
 * pas "0.06"). Bug documenté dans `prompt5gen8913conventionphiPhi.md`. */
export function arrondiPrecis(v: number): number {
  return Math.round(v * 10000) / 10000;
}

/** Arrondi à 5 décimales — réservé aux formules affichées dont l'élève recopie ω/φ pour un calcul
 * EN AVAL sensible à l'arrondi (division par ω pour isoler t, ou multiplication par un t pouvant
 * atteindre plusieurs dizaines) : 2 décimales (`arrondi`) laissent un écart qui peut dépasser
 * LARGEMENT la tolérance de vérification réelle une fois amplifié — jusqu'à 64× sur certains
 * écrans, mesuré empiriquement par simulation sur toute la plage de génération
 * (`prompt-corrections-precision-5e.md`, Partie 1 : ~100% d'échec à 2 décimales sur B1/B2/donnée,
 * 0% à 5 décimales, marge ≥2× confirmée). Distincte de `arrondiPrecis` (4 décimales, motif
 * différent : cohérence d'affichage entre 2 grandeurs dérivées sur l'écran "resolution" B3, pas
 * correction d'un risque d'échec). */
function arrondiFormuleSubstituee(v: number): number {
  return Math.round(v * 100000) / 100000;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction irréductible de π (`numerateur`·π/`denominateur`), signe porté par le numérateur —
 * primitive commune à ω (`formatOmegaExactPiLatex`) et φ B2 (`formatPhiExactPiLatex`). */
function formatFractionPiLatex(numerateur: number, denominateur: number): string {
  if (numerateur === 0) return "0";
  const signe = numerateur < 0 ? "-" : "";
  const n = Math.abs(numerateur);
  const g = pgcd(n, denominateur);
  const nReduit = n / g;
  const dReduit = denominateur / g;
  const piPart = nReduit === 1 ? "\\pi" : `${nReduit}\\pi`;
  return dReduit === 1 ? `${signe}${piPart}` : `${signe}\\dfrac{${piPart}}{${dReduit}}`;
}

/** ω=2π/N EN FRACTION IRRÉDUCTIBLE DE π (`prompt5gen13B1B2.md`, B1 écran 4 — "ω doit être affiché
 * en fraction irréductible ou fraction irréductible de π (jamais en décimal)... la tolérance
 * décimale ne s'applique qu'à la validation... pas à l'affichage interne") — reconstruit depuis
 * l'entier SOURCE `N` (`dureeTour` pour B1, `periode` pour B2), JAMAIS depuis le flottant `omega`
 * lui-même (qui perdrait la fraction exacte à la reconstruction). Bien que l'en-tête de ce fichier
 * documente ce générateur comme travaillant en "décimales ordinaires, jamais des multiples exacts de
 * π" — ω fait exception : par construction (ω=2π/T, T toujours entier), ω EST toujours un multiple
 * rationnel exact de π, seul son stockage est un flottant. Scope volontairement ÉTROIT : seule la
 * ligne "ω=..." autonome de l'état actuel (phase "pulsation", partagée B1/B2) en bénéficie — jamais le
 * ω réaffiché À L'INTÉRIEUR de la formule f(t) complète (`formatFonctionLatex`, phase
 * "fonctionFinale"), partagée avec B3/donnée où ω n'est en général PAS un multiple exact de π. */
function formatOmegaExactPiLatex(N: number): string {
  return formatFractionPiLatex(2, N);
}

/** φ (B2 uniquement) EN FRACTION IRRÉDUCTIBLE DE π — même raisonnement que `formatOmegaExactPiLatex` :
 * φ=argumentCible−ω·t₀ avec argumentCible∈{π/2,3π/2} et ω=2π/periode, donc
 * φ=(periode∓4·t₀)·π/(2·periode) (signe − pour un maximum, + pour un minimum, voir `techniqueB2.ts`)
 * — TOUJOURS un multiple rationnel exact de π puisque `periode`/`t0` sont des entiers tirés,
 * reconstruit depuis ces entiers SOURCE, jamais depuis le flottant `fonction.phi`. */
function formatPhiExactPiLatex(periode: number, t0: number, estMax: boolean): string {
  const numerateur = estMax ? periode - 4 * t0 : 3 * periode - 4 * t0;
  return formatFractionPiLatex(numerateur, 2 * periode);
}

function formatDecimalFr(v: number): string {
  const r = arrondi(v);
  return Number.isInteger(r) ? String(r) : r.toString().replace(".", ",");
}

/** Même rendu que `formatDecimalFr`, mais à 5 décimales (`arrondiFormuleSubstituee`) — réservé aux
 * formules dont l'élève recopie ω/φ pour ISOLER t (division par ω), jamais aux formules "u=...t+..."
 * simplement informatives où u ne dépend PAS de ω/φ dans la vérification en aval. */
function formatDecimalFrPrecis(v: number): string {
  const r = arrondiFormuleSubstituee(v);
  return Number.isInteger(r) ? String(r) : r.toString().replace(".", ",");
}

/** Fraction exacte de π SUIVIE de sa valeur décimale approximative (`prompt5gen13B1B2B3.md`, ex.
 * "ω=π/11≈0.29") — B1/B2 uniquement (ω toujours, φ pour B2 uniquement) : la forme exacte seule ne
 * permet pas à l'élève de vérifier facilement l'ordre de grandeur de sa réponse décimale. B3
 * n'utilise JAMAIS cette fonction — ω/φ n'y sont pas des multiples exacts de π (2 points quelconques
 * de la courbe), seule la valeur décimale y est affichée (`arrondiPrecis`). */
function formatAvecApprox(exactLatex: string, valeurDecimale: number): string {
  return `${exactLatex} \\approx ${arrondi(valeurDecimale)}`;
}

/** u=ωt+φ, ω et φ substitués en DÉCIMAL (jamais en fraction exacte, cohérent avec le style déjà
 * utilisé pour f(t)=k/fenêtre dans les consignes — `formatDecimalFr`), t restant SYMBOLIQUE — texte
 * brut (pas de KaTeX), consommé dans une consigne `<p>` ordinaire. Partagée par B2 ET B3
 * (`prompt5gen13B1B2B3.md`, écrans "poser u"/"isoler t" reformulés identiquement pour les 2
 * techniques). */
function formatArgumentUTexte(omega: number, phi: number): string {
  const termePhi = phi >= 0 ? `+${formatDecimalFr(phi)}` : formatDecimalFr(phi);
  return `u=${formatDecimalFr(omega)}t${termePhi}`;
}

/** Même formule que `formatArgumentUTexte`, à 5 décimales — réservée aux 2 écrans où l'élève
 * l'utilise pour ISOLER t (division par ω) : "isolerTResoudre"/"isolerTExtremum". Sur ces 2 écrans
 * SEULEMENT, un ω recopié à 2 décimales puis utilisé au dénominateur peut amplifier l'écart bien
 * au-delà de la tolérance de vérification (mesuré empiriquement, ~100% d'échec à 2 décimales sur
 * B1/B2/donnée, 0% à 5 décimales) — jamais utilisée pour "argumentResoudre"/"poserExtremum"/
 * "isolerSinInequation", où u=ωt+φ n'est que RAPPELÉ (la vérification de CES écrans ne dépend pas
 * de ω/φ), 2 décimales y restent cohérentes avec le reste des consignes. */
function formatArgumentUTextePrecis(omega: number, phi: number): string {
  const termePhi = phi >= 0 ? `+${formatDecimalFrPrecis(phi)}` : formatDecimalFrPrecis(phi);
  return `u=${formatDecimalFrPrecis(omega)}t${termePhi}`;
}

// ============================================================================
// Consigne générale + bloc de données.
// ============================================================================

/** 1re phrase de tête de page — TOUJOURS présente. Sur B2/B3 (`prompt5gen13B1B2B3.md`, 2.1/3.1) le
 * modèle cible `f(t)=A·sin(ωt+φ)+b` est désormais explicite ici (jamais seulement dans le bloc de
 * données), cohérent avec la formule déjà substituée dans les consignes de phase. */
export function consigneGeneralePartie1(exercice: ExerciceModelisationSinusoide): string {
  switch (exercice.phase1.technique) {
    case "b1":
      return "Construis, étape par étape, le modèle sinusoïdal de la grande roue de rayon R. Cette roue, située à hₛₒₗ du sol, fait un tour complet en un temps T.";
    case "b2":
      return "Construis le modèle sinusoïdal f(t)=A·sin(ωt+φ)+b à partir du maximum, du minimum et d'un point extremum connu.";
    case "b3":
      return "Construis le modèle sinusoïdal f(t)=A·sin(ωt+φ)+b à partir de deux points connus de la courbe.";
    case "donnee":
      return "Cette fonction sinusoïdale est déjà connue — réponds aux questions suivantes.";
  }
}

/** 2e phrase de tête de page — introduit la CONDITION à résoudre (Phase 2), jamais fusionnée dans
 * la 1re phrase (`prompt5gen13B1B2B3.md`, 2.1/3.1 — "même principe que B2" pour B3) : `null` sur B1
 * (jamais de Phase 2, `phase2` structurellement `null`) et sur "donnee" (hors périmètre de ce
 * prompt, comportement PRÉ-EXISTANT préservé — une seule phrase de tête, jamais de "Ensuite...").
 * Adapte le verbe/la formule au TYPE de Phase 2 réellement tiré (B3 peut tirer les 3 types, B2
 * TOUJOURS "resoudre" — voir `generateurs5e/modelisationSinusoide/index.ts`). */
export function consigneGeneralePartie2(exercice: ExerciceModelisationSinusoide): string | null {
  if (exercice.phase1.technique === "donnee" || exercice.phase2 === null) return null;
  const q = exercice.phase2;
  const fenetre = formatDecimalFr(q.fenetre);
  switch (q.type) {
    case "resoudre":
      return `Ensuite résous l'équation f(t)=${formatDecimalFr(q.k)} pour les valeurs de t comprises entre 0 et ${fenetre}.`;
    case "extremum":
      return `Ensuite, détermine les positions des extremums (maximums et minimums) atteints par la fonction pour les valeurs de t comprises entre 0 et ${fenetre}.`;
    case "inequation":
      return `Ensuite, résous l'inéquation f(t)${q.sens === "ge" ? "≥" : "≤"}${formatDecimalFr(q.k)} pour les valeurs de t comprises entre 0 et ${fenetre}.`;
  }
}

/** Compat — texte combiné (jamais utilisé pour le rendu écran, qui affiche les 2 parties SÉPARÉES
 * dans 2 `<p>` distincts au-dessus de leurs boîtes de données respectives,
 * `BlocDonneesModelisation.tsx` — même motif que `blocDonneesLatex` ci-dessous pour les fragments de
 * données), réservée aux tests/usages qui n'ont pas besoin de la séparation visuelle. */
export function consigneGenerale(exercice: ExerciceModelisationSinusoide): string {
  const partie1 = consigneGeneralePartie1(exercice);
  const partie2 = consigneGeneralePartie2(exercice);
  return partie2 === null ? partie1 : `${partie1} ${partie2}`;
}

/** "Bloc fitter" (convention transversale, voir CLAUDE.md "Audit 'bloc fitter'") — un fragment
 * KaTeX par élément COMPLET, jamais un unique bloc `\quad`-joined qui ne retourne jamais à la
 * ligne à l'intérieur d'un seul rendu KaTeX (`white-space: nowrap` interne). Le pire cas (B3 + une
 * Phase 2 quelconque, jusqu'à 5 grandeurs + le seuil/la fenêtre) déborderait sinon largement un
 * écran mobile 375px — trouvé par vérification Playwright, corrigé avant livraison. */
function formatTermesDonneesPhase1Latex(donnees: DonneesPhase1): string[] {
  switch (donnees.technique) {
    case "b1":
      return [`R=${donnees.rayon}\\text{m}`, `h_{sol}=${donnees.hauteurSol}\\text{m}`, `T=${donnees.dureeTour}\\text{s}`];
    case "b2":
      return [`\\max=${donnees.max}`, `\\min=${donnees.min}`, `T=${arrondi(donnees.periode)}`, `t_0=${donnees.t0}\\ (${donnees.estMax ? "\\text{maximum}" : "\\text{minimum}"})`];
    case "b3":
      // f_1/f_2 en précision 4 décimales (`arrondiPrecis`) — même valeur RECOPIÉE littéralement
      // par l'élève dans l'équation de l'écran "systeme" (label `EtapeSysteme.tsx`, arcsin((f-b)/A)) :
      // 2 décimales laissaient passer un écart jusqu'à ~9× la tolérance de `diagnostiquerSysteme`
      // (mesuré empiriquement, `prompt-corrections-precision-5e.md`, Partie 1).
      return [`A=${donnees.A}`, `b=${donnees.b}`, `t_1=${donnees.t1},\\ f_1=${arrondiPrecis(donnees.v1)}`, `t_2=${donnees.t2},\\ f_2=${arrondiPrecis(donnees.v2)}`];
    case "donnee":
      return [formatFonctionLatex(donnees.fonction.A, donnees.fonction.omega, donnees.fonction.phi as number, donnees.fonction.b)];
  }
}

/** ω/φ en précision 5 décimales (`arrondiFormuleSubstituee`) — cette formule est le SEUL point
 * d'accès de l'élève à ω/φ pour la technique "donnée" (en-tête), et sert aussi de modèle recopié
 * dans l'aide niveau 2 de "fonctionFinale" (B2/B3/donnée) — un calcul en aval multipliant par t
 * (jusqu'à plusieurs dizaines) amplifiait un arrondi à 2 décimales bien au-delà de la tolérance de
 * vérification (`prompt-corrections-precision-5e.md`, Partie 1). */
function formatFonctionLatex(A: number, omega: number, phi: number, b: number): string {
  const termePhi = phi >= 0 ? `+${arrondiFormuleSubstituee(phi)}` : `${arrondiFormuleSubstituee(phi)}`;
  const termeB = b >= 0 ? `+${b}` : `${b}`;
  return `f(t) = ${A}\\sin(${arrondiFormuleSubstituee(omega)}t${termePhi})${termeB}`;
}

function formatTermesQuestionEnTeteLatex(exercice: ExerciceModelisationSinusoide): string[] {
  if (exercice.phase2 === null) return [];
  const q = exercice.phase2;
  const fenetreLatex = `t\\in[0\\,;\\,${arrondi(q.fenetre)}]`;
  switch (q.type) {
    case "resoudre":
      return [`f(t)=${arrondi(q.k)}`, fenetreLatex];
    case "extremum":
      return [fenetreLatex];
    case "inequation":
      return [`f(t)${q.sens === "ge" ? "\\geqslant" : "\\leqslant"}${arrondi(q.k)}`, fenetreLatex];
  }
}

/** Bloc de données PERSISTANT, en fragments — affiche toujours les données de Phase 1 (ou f(t)
 * directement pour "donnee"), PLUS, dès que Phase 2 existe, le seuil/la fenêtre — sur TOUS les
 * écrans de l'exercice, convention transversale de la plateforme (jamais seulement le premier
 * écran). Rendu via `.equation-box-termes` (un `<Katex>` par fragment), jamais un bloc unique. */
export function formatTermesDonneesLatex(exercice: ExerciceModelisationSinusoide): string[] {
  return [...formatTermesDonneesPhase1Latex(exercice.phase1), ...formatTermesQuestionEnTeteLatex(exercice)];
}

/** Les 2 moitiés de `formatTermesDonneesLatex` ci-dessus, exposées SÉPARÉMENT (`prompt5gen13B1B2.md`,
 * B2 — "grouper f(t)=k/fenêtre dans une boîte visuellement distincte des données de construction") :
 * `BlocDonneesModelisation.tsx` les rend dans 2 boîtes `.equation-box` séparées dès que la 2e est
 * non vide, jamais dans une seule boîte fusionnée comme avant. */
export function formatTermesDonneesConstructionLatex(exercice: ExerciceModelisationSinusoide): string[] {
  return formatTermesDonneesPhase1Latex(exercice.phase1);
}

export function formatTermesDonneesSeuilLatex(exercice: ExerciceModelisationSinusoide): string[] {
  return formatTermesQuestionEnTeteLatex(exercice);
}

/** Compat — chaîne unique reconstruite depuis les fragments, réservée aux usages qui n'ont pas
 * (encore) besoin du bloc fitter (aucun dans ce générateur ; conservée pour tests/cohérence avec
 * la convention établie ailleurs sur la plateforme). */
export function blocDonneesLatex(exercice: ExerciceModelisationSinusoide): string {
  return formatTermesDonneesLatex(exercice).join(" \\quad ");
}

// ============================================================================
// Bloc "État actuel" — rappelle, sur chaque écran, les valeurs déjà CONFIRMÉES aux écrans
// précédents de la séquence RÉELLE de l'instance (`ordreComplet`, voir CLAUDE.md "Motifs partagés
// entre plusieurs exercices — Bloc 'État actuel'"). Toujours dérivé de `exercice` (jamais de la
// saisie brute de l'élève), jamais sur le tout premier écran de la séquence.
// ============================================================================

/** Variable libre "k" — UNIFORME sur tout 5gen13 depuis `prompt5gen13ftDonnee3variantes.md`/
 * `prompt5gen13B3extremumInequationSansPhase2.md` (B2/B3/"donnee" confondus : plus aucune phase de
 * ce générateur n'utilise "n"). */
function formatBrancheLatex(variable: string, branche: BrancheModelisation): string {
  return `${variable}=${arrondi(branche.constante)}+k\\cdot ${arrondi(branche.periode)}`;
}

/** Fragment(s) représentant la valeur CONFIRMÉE à une phase déjà traversée — `[]` si cette phase
 * n'a rien à récapituler (terminale au sein de sa propre sous-séquence, donc jamais consultée par
 * une phase ultérieure) ou si `phaseConfirmee` n'appartient de toute façon pas à la technique/au
 * type réel de l'instance (garde défensive, jamais atteinte en pratique — `ordreComplet` ne liste
 * que des phases cohérentes avec `exercice`). */
function fragmentsEtatActuelPourPhase(exercice: ExerciceModelisationSinusoide, phaseConfirmee: PhaseModelisationSinusoide): string[] {
  const donnees = exercice.phase1;
  switch (phaseConfirmee) {
    case "amplitude":
      if (donnees.technique !== "b1" && donnees.technique !== "b2") return [];
      return [`A=${donnees.fonction.A}`];
    case "decalage":
      if (donnees.technique !== "b1" && donnees.technique !== "b2") return [];
      return [`b=${donnees.fonction.b}`];
    case "pulsation": {
      if (donnees.technique !== "b1" && donnees.technique !== "b2") return [];
      const N = donnees.technique === "b1" ? donnees.dureeTour : donnees.periode;
      return [`\\omega=${formatAvecApprox(formatOmegaExactPiLatex(N), donnees.fonction.omega)}`];
    }
    case "phi":
      if (donnees.technique !== "b2") return [];
      return [`\\varphi=${formatAvecApprox(formatPhiExactPiLatex(donnees.periode, donnees.t0, donnees.estMax), donnees.fonction.phi as number)}`];
    case "systeme":
      if (donnees.technique !== "b3") return [];
      return [`\\omega\\cdot${donnees.t1}+\\varphi=${arrondi(donnees.alpha1)}`, `\\omega\\cdot${donnees.t2}+\\varphi=${arrondi(donnees.alpha2)}`];
    case "resolution":
      if (donnees.technique !== "b3") return [];
      return [`\\omega=${arrondiPrecis(donnees.fonction.omega)}`, `\\varphi=${arrondiPrecis(donnees.fonction.phi as number)}`];
    case "fonctionFinale":
      if (donnees.technique === "donnee") return [];
      return [formatFonctionLatex(donnees.fonction.A, donnees.fonction.omega, donnees.fonction.phi as number, donnees.fonction.b)];
    case "argumentResoudre": {
      if (exercice.phase2 === null || exercice.phase2.type !== "resoudre") return [];
      return exercice.phase2.branchesU.map((br) => formatBrancheLatex("u", br));
    }
    case "isolerTResoudre": {
      if (exercice.phase2 === null || exercice.phase2.type !== "resoudre") return [];
      return exercice.phase2.branchesT.map((br) => formatBrancheLatex("t", br));
    }
    case "poserExtremum": {
      if (exercice.phase2 === null || exercice.phase2.type !== "extremum") return [];
      return [`u=\\dfrac{\\pi}{2}+k\\cdot\\pi`];
    }
    case "isolerTExtremum": {
      if (exercice.phase2 === null || exercice.phase2.type !== "extremum") return [];
      return [formatBrancheLatex("t", exercice.phase2.brancheT)];
    }
    case "isolerSinInequation": {
      if (exercice.phase2 === null || exercice.phase2.type !== "inequation") return [];
      if (exercice.phase2.casSpecial !== null) return [exercice.phase2.casSpecial === "toujoursVrai" ? "\\text{Toujours vraie}" : "\\text{Toujours fausse}"];
      const symbole = exercice.phase2.sens === "ge" ? "\\geqslant" : "\\leqslant";
      return [`\\sin(u)${symbole}${arrondi(exercice.phase2.m)}`];
    }
    case "resoudreUInequation": {
      if (exercice.phase2 === null || exercice.phase2.type !== "inequation") return [];
      return [`u\\in[${arrondi(exercice.phase2.borneInfU)}\\,;\\,${arrondi(exercice.phase2.borneSupU)}]`];
    }
    case "isolerTInequation": {
      if (exercice.phase2 === null || exercice.phase2.type !== "inequation") return [];
      return [`t\\in[${arrondi(exercice.phase2.borneInfT)}\\,;\\,${arrondi(exercice.phase2.borneSupT)}]`];
    }
    // Terminales au sein de leur propre sous-séquence — jamais consultées par une phase ultérieure.
    case "solutionsResoudre":
    case "solutionsExtremum":
    case "listerIntervallesInequation":
      return [];
  }
}

/** Bloc "état actuel" pour l'écran `phase` — récapitule, dans l'ORDRE, les valeurs confirmées à
 * chaque phase RÉELLEMENT traversée avant `phase` dans la séquence de CETTE instance
 * (`ordreComplet`) — `[]` sur le tout premier écran de la séquence, quelle que soit la technique/le
 * type réels (rien n'est encore accumulable). */
export function formatTermesEtatActuelModelisationSinusoide(exercice: ExerciceModelisationSinusoide, phase: PhaseModelisationSinusoide): string[] {
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  if (index <= 0) return [];
  return ordre.slice(0, index).flatMap((p) => fragmentsEtatActuelPourPhase(exercice, p));
}

/** Réponse CORRECTE attendue pour l'écran `phase` lui-même (jamais celle d'un écran antérieur) —
 * consommée par le panneau de révélation (`ResultatPanelModelisationSinusoide.tsx`), une ligne par
 * phase RÉELLEMENT traversée (`ordreComplet`). Réutilise `fragmentsEtatActuelPourPhase` pour la
 * quasi-totalité des phases (la valeur "confirmée" à une phase EST, par définition, sa réponse
 * correcte) — complétée pour les phases dont le contenu diffère du cas "état actuel" : les 3 phases
 * TERMINALES au sein de leur propre sous-séquence (jamais consultées comme état actuel par une
 * phase ultérieure, mais toujours nécessaires ici), et "argumentResoudre" quand `aucuneSolution`
 * (dont la réponse correcte est le choix "Aucune solution", jamais une liste de branches vide). */
export function formatTermesReponseAttendueModelisationSinusoide(exercice: ExerciceModelisationSinusoide, phase: PhaseModelisationSinusoide): string[] {
  switch (phase) {
    case "argumentResoudre": {
      if (exercice.phase2 === null || exercice.phase2.type !== "resoudre") return [];
      if (exercice.phase2.aucuneSolution) return ["\\text{Aucune solution}"];
      return fragmentsEtatActuelPourPhase(exercice, phase);
    }
    case "solutionsResoudre": {
      if (exercice.phase2 === null || exercice.phase2.type !== "resoudre") return [];
      return exercice.phase2.solutions.map((s) => `t=${arrondi(s)}`);
    }
    case "solutionsExtremum": {
      if (exercice.phase2 === null || exercice.phase2.type !== "extremum") return [];
      return exercice.phase2.solutions.map((s) => `t=${arrondi(s)}`);
    }
    case "listerIntervallesInequation": {
      if (exercice.phase2 === null || exercice.phase2.type !== "inequation") return [];
      return exercice.phase2.intervalles.map((iv) => `[${arrondi(iv.inf)}\\,;\\,${arrondi(iv.sup)}]`);
    }
    default:
      return fragmentsEtatActuelPourPhase(exercice, phase);
  }
}

// ============================================================================
// Label / consigne par phase.
// ============================================================================

const LABELS: Record<PhaseModelisationSinusoide, string> = {
  amplitude: "A =",
  decalage: "b =",
  pulsation: "ω =",
  phi: "φ =",
  systeme: "",
  resolution: "",
  fonctionFinale: "f(t) =",
  argumentResoudre: "",
  isolerTResoudre: "",
  solutionsResoudre: "",
  poserExtremum: "u =",
  isolerTExtremum: "t =",
  solutionsExtremum: "",
  isolerSinInequation: "",
  resoudreUInequation: "",
  isolerTInequation: "",
  listerIntervallesInequation: "",
};

export function labelPhase(phase: PhaseModelisationSinusoide): string {
  return LABELS[phase];
}

/** Libellé lisible par phase, pour les panneaux de révélation/résumé de session — jamais un
 * jargon de conception (ex. "b1"/"b2"/"b3"), toujours la compétence testée en clair. */
export const LIBELLE_PHASE: Record<PhaseModelisationSinusoide, string> = {
  amplitude: "Amplitude A",
  decalage: "Décalage vertical b",
  pulsation: "Pulsation ω",
  phi: "Déphasage φ",
  systeme: "Système en (ω,φ)",
  resolution: "Résolution du système",
  fonctionFinale: "Fonction f(t) complète",
  argumentResoudre: "Argument u (résolution)",
  isolerTResoudre: "Isolement de t",
  solutionsResoudre: "Solutions dans la fenêtre",
  poserExtremum: "Équation fusionnée (u)",
  isolerTExtremum: "Isolement de t",
  solutionsExtremum: "Positions d'extremum",
  isolerSinInequation: "Isolement de sin(u)",
  resoudreUInequation: "Résolution en u",
  isolerTInequation: "Isolement de t",
  listerIntervallesInequation: "Intervalles solutions",
};

const CONSIGNES_FIXES: Partial<Record<PhaseModelisationSinusoide, string>> = {
  amplitude: "Quelle est l'amplitude A du mouvement ?",
  decalage: "Quel est le décalage vertical b ?",
  systeme: "Pose le système : une équation linéarisée en (ω,φ) pour chacun des 2 points.",
  resolution: "Résous le système par COMBINAISON (addition puis soustraction membre à membre) pour trouver ω puis φ.",
  solutionsExtremum: "Liste toutes les positions d'extremum t dans la fenêtre demandée (arrondi au centième accepté si besoin).",
  resoudreUInequation: "Résous sin(u)◇m (cas général) : donne les 2 bornes en u (arrondi au centième accepté si besoin).",
  isolerTInequation: "Isole t depuis les 2 bornes en u (divise par ω, translate par φ) (arrondi au centième accepté si besoin).",
  listerIntervallesInequation: "Balaie et liste tous les sous-intervalles de t contenus dans la fenêtre (arrondi au centième accepté si besoin).",
};

/** "Pose l'équation fusionnée"/"isole t" (Phase 2 "extremum") — même reformulation avec u=ωt+φ
 * instancié numériquement que "argumentResoudre"/"isolerTResoudre" (`prompt5gen13B3extremum
 * InequationSansPhase2.md`/`prompt5gen13ftDonnee3variantes.md`), variable libre "k" désormais
 * uniforme sur tout le générateur — ω/φ TOUJOURS numériquement connus ici (b1, seule technique où
 * φ reste symbolique, n'a jamais de Phase 2). Singulier ("cette équation", jamais "chaque série") :
 * cette phase fusionne max et min en UNE SEULE famille de période π, contrairement à "resoudre" qui
 * garde 2 branches distinctes. */
function consignePoserExtremum(exercice: ExerciceModelisationSinusoide): string {
  const { omega, phi } = exercice.phase1.fonction;
  return `Pose l'équation fusionnée qui traduit un extremum (utilise « k » comme entier libre). Où ${formatArgumentUTexte(omega, phi as number)}.`;
}

function consigneIsolerTExtremum(exercice: ExerciceModelisationSinusoide): string {
  const { omega, phi } = exercice.phase1.fonction;
  return `Isole t depuis cette équation avec u (arrondi au centième accepté si besoin). Où ${formatArgumentUTextePrecis(omega, phi as number)}.`;
}

/** "Isole sin(u)◇m" (Phase 2 "inequation") — même clarificateur "où u=..." que les autres écrans
 * "poser"/"isoler" de ce générateur (`prompt5gen13B3extremumInequationSansPhase2.md`). Couvre les 2
 * présentations (cas spécial ET cas général, `EtapeIsolerSinInequation.tsx`) — le texte ne dépend
 * jamais de `casSpecial` lui-même, seuls les CONTRÔLES affichés en dessous changent. */
function consigneIsolerSin(exercice: ExerciceModelisationSinusoide, question: QuestionInequation): string {
  const { omega, phi } = exercice.phase1.fonction;
  const symbole = question.sens === "ge" ? "≥" : "≤";
  return `Isole sin(u)${symbole}m (m=(k−b)/A, arrondi au centième accepté si besoin) — où ${formatArgumentUTexte(omega, phi as number)}. Si |m|>1, l'inéquation est TOUJOURS vraie ou TOUJOURS fausse sur tout l'intervalle.`;
}

/** Écran "pulsation" PARTAGÉ entre B1 (ω=2π/dureeTour calculé DIRECTEMENT, jamais via une étape
 * intermédiaire en degrés/seconde — écran supprimé, `prompt5gen13B1B2B3.md`) et B2 (ω=2π/periode).
 * La formule ω=2π/T, elle, reste réservée à l'aide niveau 1 (`AIDES_NIVEAU1_FIXES.pulsation`),
 * jamais répétée dans la question elle-même. */
const CONSIGNE_PULSATION = "Quelle est la pulsation ω ?";

function consigneFonctionFinale(donnees: DonneesPhase1): string {
  if (donnees.technique === "b2") return "Donne la fonction f(t) sous la forme de A·sin(ωt+φ)+b en remplaçant A, ω, φ et b par leur valeur.";
  return "Écris f(t) complète, avec A/ω/b substitués.";
}

/** "argumentResoudre"/"isolerTResoudre"/"solutionsResoudre" sont PARTAGÉES entre B2 (toujours), B3
 * et "donnée" (les deux quand leur Phase 2 optionnelle/tirée vaut "resoudre") — la reformulation
 * avec instanciation numérique de u (variable libre "k", "série" plutôt que "branche", cible
 * f(t)=k substituée, u=ωt+φ affiché avec ω/φ substitués) s'applique désormais UNIFORMÉMENT aux 3
 * techniques (`prompt5gen13ftDonnee3variantes.md` — "donnée" n'a plus de formulation symbolique à
 * part, ω/φ y sont de toute façon TOUJOURS numériquement connus, comme pour B2/B3). */
function consigneArgumentResoudre(exercice: ExerciceModelisationSinusoide): string {
  if (exercice.phase2 === null || exercice.phase2.type !== "resoudre") throw new Error("consigneArgumentResoudre : phase2 hors type 'resoudre'");
  const { omega, phi } = exercice.phase1.fonction;
  return `Donne les angles u tels que f(t)=${formatDecimalFr(exercice.phase2.k)} (utilise « k » comme entier libre, arrondi au centième accepté si besoin). Ici ${formatArgumentUTexte(omega, phi as number)}.`;
}

function consigneIsolerTResoudre(exercice: ExerciceModelisationSinusoide): string {
  const { omega, phi } = exercice.phase1.fonction;
  return `Isole t depuis chaque série d'équation avec u (arrondi au centième accepté si besoin). Où ${formatArgumentUTextePrecis(omega, phi as number)}.`;
}

function consigneSolutionsResoudre(donnees: DonneesPhase1): string {
  return donnees.technique === "b2"
    ? "Liste toutes les solutions t dans l'intervalle demandé (arrondi au centième accepté si besoin)."
    : "Liste toutes les solutions t dans la fenêtre demandée (arrondi au centième accepté si besoin).";
}

export function consignePhase(exercice: ExerciceModelisationSinusoide, phase: PhaseModelisationSinusoide): string {
  if (phase === "isolerSinInequation") {
    if (exercice.phase2 === null || exercice.phase2.type !== "inequation") throw new Error("consignePhase : 'isolerSinInequation' hors contexte 'inequation'");
    return consigneIsolerSin(exercice, exercice.phase2);
  }
  if (phase === "pulsation") return CONSIGNE_PULSATION;
  if (phase === "phi") return "Isole φ de A·sin(ωt+φ)+b.";
  if (phase === "fonctionFinale") return consigneFonctionFinale(exercice.phase1);
  if (phase === "argumentResoudre") return consigneArgumentResoudre(exercice);
  if (phase === "isolerTResoudre") return consigneIsolerTResoudre(exercice);
  if (phase === "solutionsResoudre") return consigneSolutionsResoudre(exercice.phase1);
  if (phase === "poserExtremum") return consignePoserExtremum(exercice);
  if (phase === "isolerTExtremum") return consigneIsolerTExtremum(exercice);
  return CONSIGNES_FIXES[phase] as string;
}

// ============================================================================
// Aides — niveau 1 (méthode), niveau 2 (formule/valeurs substituées, jamais le résultat).
// ============================================================================

const AIDES_NIVEAU1_FIXES: Partial<Record<PhaseModelisationSinusoide, string>> = {
  amplitude: "A = (max−min)/2 — la moitié de l'écart entre le point le plus haut et le plus bas.",
  decalage: "b = (max+min)/2 — la position d'équilibre, à mi-hauteur.",
  pulsation: "ω = 2π/T (T = période, la durée d'un cycle complet).",
  systeme: "Isole d'abord sin(ωt+φ) dans chaque équation, puis prends l'arcsin — tu obtiens 2 équations LINÉAIRES en (ω,φ).",
  resolution: "SOUSTRAIS les 2 équations membre à membre pour éliminer φ et isoler ω, puis ADDITIONNE-les pour isoler φ.",
  argumentResoudre: "sin(u)=m ⟺ u=arcsin(m)+k·2π OU u=π−arcsin(m)+k·2π.",
  isolerTResoudre: "t=(u−φ)/ω — divise CHAQUE terme de la branche (constante ET période) par ω. N'arrondis pas ω/φ davantage lors du calcul — utilise la calculatrice ou recopie-les tels quels.",
  solutionsResoudre: "Balaie k dans chaque branche en t, ne garde que les valeurs dans la fenêtre.",
  poserExtremum: "sin(u)=±1 ⟺ u=π/2+k·π — UNE SEULE branche fusionnée, de période π.",
  isolerTExtremum: "t=(u−φ)/ω — divise CHAQUE terme (constante ET période) par ω. N'arrondis pas ω/φ davantage lors du calcul — utilise la calculatrice ou recopie-les tels quels.",
  solutionsExtremum: "Balaie k dans la série en t, ne garde que les valeurs dans la fenêtre.",
  resoudreUInequation: "sin(u)≥m ⟺ u∈[arcsin(m);π−arcsin(m)] — l'arc contenant π/2, où sin est le plus grand. Pour ≤m, c'est l'arc complémentaire.",
  isolerTInequation: "t=(u−φ)/ω sur CHAQUE borne. N'arrondis pas ω/φ davantage lors du calcul — utilise la calculatrice ou recopie-les tels quels.",
  listerIntervallesInequation: "Les bornes en t se répètent tous les 2π/ω — ajoute des multiples entiers de cette période jusqu'à sortir de la fenêtre.",
};

function aideNiveau1FonctionFinale(donnees: DonneesPhase1): string {
  return donnees.technique === "b1"
    ? "Aucune donnée ne permet de déterminer φ ici : garde-le SYMBOLIQUE dans la formule (écris littéralement \"phi\"), n'invente jamais de valeur numérique."
    : "Substitue A/ω/φ/b, déjà tous connus, dans f(t)=A·sin(ω·t+φ)+b.";
}

function aideNiveau1IsolerSin(question: QuestionInequation): string {
  return question.casSpecial !== null
    ? "|m|>1 : sin(u) ne peut jamais atteindre m (sin(u)∈[−1;1]) — l'inéquation est donc soit toujours vraie, soit toujours fausse, quel que soit t."
    : "Isole d'abord sin(ωt+φ) seul d'un côté, puis calcule m=(k−b)/A de l'autre.";
}

export function texteAideNiveau1(exercice: ExerciceModelisationSinusoide, phase: PhaseModelisationSinusoide): string {
  if (phase === "phi") {
    const donnees = exercice.phase1;
    if (donnees.technique !== "b2") throw new Error("texteAideNiveau1 : 'phi' hors contexte 'b2'");
    return donnees.estMax
      ? "Le point donné est un MAXIMUM ⟹ l'argument (l'angle) du sinus vaut π/2 (jamais 3π/2)."
      : "Le point donné est un MINIMUM ⟹ l'argument (l'angle) du sinus vaut 3π/2 (jamais π/2).";
  }
  if (phase === "fonctionFinale") return aideNiveau1FonctionFinale(exercice.phase1);
  if (phase === "isolerSinInequation") {
    if (exercice.phase2 === null || exercice.phase2.type !== "inequation") throw new Error("texteAideNiveau1 : 'isolerSinInequation' hors contexte 'inequation'");
    return aideNiveau1IsolerSin(exercice.phase2);
  }
  return AIDES_NIVEAU1_FIXES[phase] as string;
}

/** Aide niveau 2 — LaTeX, formule/valeurs substituées, jamais le résultat final. */
export function texteAideNiveau2(exercice: ExerciceModelisationSinusoide, phase: PhaseModelisationSinusoide): string {
  const donnees = exercice.phase1;
  switch (phase) {
    case "amplitude":
      // "max-min" — jamais "max--3" quand min est négatif (audit transversal,
      // `promptauditdoublesigne.md`).
      if (donnees.technique === "b2") return `A = \\dfrac{${donnees.max}${donnees.min >= 0 ? "-" : "+"}${Math.abs(donnees.min)}}{2}`;
      if (donnees.technique === "b1") return `A = ${donnees.rayon}`;
      throw new Error("texteAideNiveau2 : 'amplitude' hors contexte 'b1'/'b2'");
    case "decalage":
      // "max+min" — jamais "max+-3" quand min est négatif.
      if (donnees.technique === "b2") return `b = \\dfrac{${donnees.max}${donnees.min >= 0 ? "+" : "-"}${Math.abs(donnees.min)}}{2}`;
      if (donnees.technique === "b1") return `b = ${donnees.rayon}+${donnees.hauteurSol}`;
      throw new Error("texteAideNiveau2 : 'decalage' hors contexte 'b1'/'b2'");
    case "pulsation": {
      if (donnees.technique !== "b1" && donnees.technique !== "b2") throw new Error("texteAideNiveau2 : 'pulsation' hors contexte 'b1'/'b2'");
      const N = donnees.technique === "b1" ? donnees.dureeTour : donnees.periode;
      return `\\omega = \\dfrac{2\\pi}{T} = \\dfrac{2\\pi}{${N}}`;
    }
    case "phi": {
      if (donnees.technique !== "b2") return "";
      const cible = donnees.estMax ? "\\dfrac{\\pi}{2}" : "\\dfrac{3\\pi}{2}";
      return `\\omega \\cdot ${donnees.t0} + \\varphi = ${cible}`;
    }
    case "systeme": {
      if (donnees.technique !== "b3") return "";
      // v1/v2 en précision 4 décimales (`arrondiPrecis`) — même valeur que le label du champ
      // (`formatTermesDonneesPhase1Latex`/`EtapeSysteme.tsx`), voir la note ci-dessus sur
      // `arrondiFormuleSubstituee` : 2 décimales laissaient passer un écart amplifié par la
      // sensibilité d'arcsin près des bords de la branche principale.
      const termeB = donnees.b >= 0 ? `-${donnees.b}` : `+${-donnees.b}`;
      return `\\omega\\cdot${donnees.t1}+\\varphi = \\arcsin\\!\\left(\\dfrac{${arrondiPrecis(donnees.v1)}${termeB}}{${donnees.A}}\\right) \\qquad \\omega\\cdot${donnees.t2}+\\varphi = \\arcsin\\!\\left(\\dfrac{${arrondiPrecis(donnees.v2)}${termeB}}{${donnees.A}}\\right)`;
    }
    case "resolution": {
      if (donnees.technique !== "b3") return "";
      const termeB = donnees.b >= 0 ? `-${donnees.b}` : `+${-donnees.b}`;
      const alpha1Latex = `\\alpha_1 = \\arcsin\\!\\left(\\dfrac{${arrondiPrecis(donnees.v1)}${termeB}}{${donnees.A}}\\right)`;
      const alpha2Latex = `\\alpha_2 = \\arcsin\\!\\left(\\dfrac{${arrondiPrecis(donnees.v2)}${termeB}}{${donnees.A}}\\right)`;
      return `${alpha1Latex} \\qquad ${alpha2Latex} \\qquad \\omega = \\dfrac{\\alpha_1-\\alpha_2}{t_1-t_2} \\qquad \\varphi = \\dfrac{(\\alpha_1+\\alpha_2)-\\omega(t_1+t_2)}{2}`;
    }
    case "fonctionFinale":
      // ω en précision 5 décimales (`arrondiFormuleSubstituee`) — φ reste symbolique pour B1 (piège
      // central de cette technique), mais un ω recopié à 2 décimales et multiplié par un t pouvant
      // atteindre plusieurs dizaines dépassait largement la tolérance de vérification (mesuré
      // empiriquement : ~100% d'échec à 2 décimales sur la plage réaliste `dureeTour∈[20;120]`).
      if (donnees.technique === "b1") return `f(t) = ${donnees.rayon}\\sin(${arrondiFormuleSubstituee(donnees.fonction.omega)}\\,t+\\varphi)+${donnees.rayon + donnees.hauteurSol}`;
      return formatFonctionLatex(donnees.fonction.A, donnees.fonction.omega, donnees.fonction.phi as number, donnees.fonction.b);
    case "argumentResoudre":
    case "isolerTResoudre":
    case "solutionsResoudre": {
      if (exercice.phase2 === null || exercice.phase2.type !== "resoudre") return "";
      return `m = \\dfrac{k-b}{A} = \\dfrac{${arrondi(exercice.phase2.k)}-${donnees.fonction.b}}{${donnees.fonction.A}}`;
    }
    case "poserExtremum":
    case "isolerTExtremum":
    case "solutionsExtremum":
      return `u = \\dfrac{\\pi}{2} + k\\cdot\\pi`;
    case "isolerSinInequation": {
      if (exercice.phase2 === null || exercice.phase2.type !== "inequation") return "";
      return `m = \\dfrac{k-b}{A} = \\dfrac{${arrondi(exercice.phase2.k)}-${donnees.fonction.b}}{${donnees.fonction.A}}`;
    }
    case "resoudreUInequation": {
      if (exercice.phase2 === null || exercice.phase2.type !== "inequation") return "";
      return `u \\in [\\arcsin(m)\\,;\\,\\pi-\\arcsin(m)]`;
    }
    case "isolerTInequation":
      return `t = \\dfrac{u-\\varphi}{\\omega}`;
    case "listerIntervallesInequation": {
      if (exercice.phase2 === null || exercice.phase2.type !== "inequation") return "";
      return `[t_{inf}+k\\cdot\\frac{2\\pi}{\\omega}\\,;\\,t_{sup}+k\\cdot\\frac{2\\pi}{\\omega}]`;
    }
  }
}
