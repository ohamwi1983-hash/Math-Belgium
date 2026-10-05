/**
 * Couche présentation (5e) — consignes/libellés/formatage pour 5gen23 ("Limites et asymptotes en
 * contexte"). 4 familles fixes, chaque phase dispatche par (famille, phase) — certains noms de
 * phase sont partagés (ex. "interpreter") sans porter le même contenu selon la famille.
 */
import type { ExerciceLimitesContexte } from "../core5e/limitesContexte.types";
import { capitaliser } from "../generateurs5e/limitesContexte/utils";
import { ordreComplet } from "../moteur5e/typesLimitesContexte";
import type { PhaseLimitesContexte } from "../moteur5e/typesLimitesContexte";

export function consigneGenerale(): string {
  return "Résous ce problème en t'appuyant sur le contexte donné, étape par étape.";
}

// ============================================================================
// Bloc de données — contexte narratif + formule(s), une paire par famille.
// ============================================================================

export function formatContexteTexte(exercice: ExerciceLimitesContexte): string {
  switch (exercice.famille) {
    case "prixRevient": {
      const ctx = exercice.contexte;
      return `${ctx.sujetPhrase} facture un coût fixe de ${exercice.a} € (${ctx.activiteFixe}), plus ${exercice.b} € par ${ctx.uniteSingulier}. Le coût unitaire moyen pour x ${ctx.unitePluriel} ${ctx.verbeParticipePluriel} est noté Cᵤ(x). Le nombre minimal accepté est de ${exercice.seuil} ${ctx.unitePluriel}.`;
    }
    case "eauSalee": {
      const ctx = exercice.contexte;
      return `${ctx.sujetPhrase} contient initialement ${exercice.v0} L ${ctx.contenuInitial}. On y ajoute en continu ${ctx.ajoutPhrase} au débit de ${exercice.r} L/min, à la concentration de ${exercice.c} g/L. V(t) est le volume total (L) après t minutes, Q(t) la quantité ${ctx.quantitePhrase} ${ctx.etatAccord} (g).`;
    }
    case "clubLoisirs": {
      const ctx = exercice.contexte;
      return `${ctx.entiteDescription} évolue selon f(x) (en ${ctx.parentheseUnite}), x étant le nombre de mois écoulés depuis ${ctx.origine} (x≥0). 1 unité de f(x) correspond à ${exercice.facteur} ${ctx.unitePluriel} réels.`;
    }
    case "population": {
      const ctx = exercice.contexte;
      return `${ctx.entiteDescription} (${ctx.uniteParenthese}) suit le modèle f(x), x étant le nombre d'années écoulées depuis ${exercice.anneeRef}.`;
    }
  }
}

function formatMonomeLatex(coeff: number, degre: number, premier: boolean): string {
  if (coeff === 0) return premier ? "0" : "";
  const abs = Math.abs(coeff);
  const signe = coeff < 0 ? "-" : premier ? "" : "+";
  const variable = degre === 0 ? "" : "x";
  const coeffAffiche = abs === 1 && degre !== 0 ? "" : `${abs}`;
  return `${signe}${coeffAffiche}${variable}`;
}

export function formatTermesDonneesLatex(exercice: ExerciceLimitesContexte): string[] {
  switch (exercice.famille) {
    case "prixRevient":
      return [`C_u(x)=${exercice.b}+\\dfrac{${exercice.a}}{x}`];
    case "eauSalee":
      return [`V(t)=${exercice.v0}+${exercice.r}t`, `Q(t)=${exercice.c * exercice.r}t`];
    case "clubLoisirs": {
      const { a, b, c, d } = exercice;
      return [`f(x)=${formatMonomeLatex(a, 1, true)}${formatMonomeLatex(b, 0, false)}-\\dfrac{${c}}{x${d >= 0 ? "+" : "-"}${Math.abs(d)}}`];
    }
    case "population": {
      const { a, b, p } = exercice;
      const coeffX = b;
      const constante = a + b * p;
      const numerateur = formatMonomeLatex(coeffX, 1, true) + formatMonomeLatex(constante, 0, coeffX === 0);
      return [`f(x)=\\dfrac{${numerateur}}{x${p >= 0 ? "+" : "-"}${Math.abs(p)}}`];
    }
  }
}

// ============================================================================
// Consignes par écran.
// ============================================================================

export function labelPhase(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): string {
  const famille = exercice.famille;
  if (phase === "asymptoteHorizontale") return "Asymptote horizontale";
  if (phase === "vaSens") return "Sens de l'AV en contexte";
  if (phase === "construireC") return "Construire C(t)";
  if (phase === "limiteC") return "Limite de C(t)";
  if (phase === "evaluer") return "Évaluer f";
  if (phase === "inequation") return "Résoudre l'inéquation";
  if (phase === "asymptoteOblique") return "Asymptote oblique";
  if (phase === "interpreterPente") return "Interpréter la pente";
  if (phase === "identification") return "Coefficients indéterminés";
  if (phase === "evaluerSeuil") return "Comparer au seuil";
  // "interpreter" — partagé par 3 familles, libellé identique.
  void famille;
  return "Interprétation";
}

export function consignePhase(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): string {
  switch (exercice.famille) {
    case "prixRevient":
      if (phase === "asymptoteHorizontale") return "Calcule la limite du coût unitaire quand x tend vers +∞.";
      if (phase === "interpreter") return "Choisis la phrase qui interprète correctement ce résultat.";
      return "L'AV mathématique (x=0) a-t-elle un sens dans ce contexte ? Choisis la justification correcte.";
    case "eauSalee":
      if (phase === "construireC") return `Construis C(t), la concentration ${exercice.contexte.quantitePhrase} à l'instant t, à partir de V(t) et Q(t).`;
      if (phase === "limiteC") return "Calcule la limite de C(t) quand t tend vers +∞.";
      return "Ce résultat était prévisible sans recalcul. Choisis la bonne justification.";
    case "clubLoisirs":
      if (phase === "evaluer") return "Calcule la valeur réelle (convertie) à la création (x=0) puis après x mois (arrondi à l'unité accepté si besoin).";
      if (phase === "inequation") return `Résous f(x)≥${exercice.k0} : trouve après combien de mois complets ${exercice.contexte.grandeurArticle} atteint ce seuil (arrondi au mois supérieur).`;
      if (phase === "asymptoteOblique") return "Donne l'équation de l'asymptote oblique (ignore le terme en 1/(x+d)).";
      return `Interprète la pente de l'asymptote oblique comme un taux d'évolution réel (${exercice.contexte.unitePluriel} par mois).`;
    case "population":
      if (phase === "identification") return "Réécris f(x) sous la forme a/(x+p)+b : identifie a et b par coefficients indéterminés.";
      if (phase === "interpreter") return `${capitaliser(exercice.contexte.grandeurArticle)} : croissance ou régression ? Choisis la phrase correcte.`;
      return `Évalue ${exercice.contexte.grandeurArticle} en ${exercice.anneeEval} et compare cette valeur au seuil de ${exercice.seuil} ${exercice.contexte.unitePourValeur} (arrondi au centième accepté si besoin).`;
  }
}

// ============================================================================
// Labels de champ — format mathématique (LaTeX), toujours terminés par "=". Reprennent le membre de
// gauche déjà utilisé par `formatReponseAttenduePhaseLatex` (même notation label ↔ réponse attendue,
// jamais un vocabulaire distinct) — le contexte narratif (à la création/après x mois, unité, seuil,
// arrondi) reste dans `consignePhase`, jamais dupliqué dans le label lui-même.
// ============================================================================

export function labelsChampsLatex(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): string[] {
  if (exercice.famille === "prixRevient" && phase === "asymptoteHorizontale") return ["\\lim_{x\\to+\\infty}C_u(x)="];
  if (exercice.famille === "eauSalee" && phase === "construireC") return ["C(t)="];
  if (exercice.famille === "eauSalee" && phase === "limiteC") return ["\\lim_{t\\to+\\infty}C(t)="];
  if (exercice.famille === "clubLoisirs") {
    const { facteur, xEval } = exercice;
    if (phase === "evaluer") return [`f(0)\\times${facteur}=`, `f(${xEval})\\times${facteur}=`];
    if (phase === "inequation") return ["x="];
    if (phase === "asymptoteOblique") return ["y="];
    if (phase === "interpreterPente") return [`a\\times${facteur}=`];
  }
  if (exercice.famille === "population") {
    if (phase === "identification") return ["a=", "b="];
    if (phase === "evaluerSeuil") {
      const x = exercice.anneeEval - exercice.anneeRef;
      return [`f(${x})=`];
    }
  }
  return [];
}

// ============================================================================
// Aide (2 niveaux standard).
// ============================================================================

export function texteAideNiveau1(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): string {
  switch (exercice.famille) {
    case "prixRevient":
      if (phase === "asymptoteHorizontale") return "Quand x→+∞, le terme a/x tend vers 0 : il ne reste que le coût marginal b.";
      if (phase === "interpreter") return "a/x est TOUJOURS strictement positif pour x>0 : Cᵤ(x) reste toujours au-dessus de b, jamais égal.";
      return "Le domaine réel de validité n'est pas x∈ℝ* mais x≥seuil (une commande minimale existe).";
    case "eauSalee":
      if (phase === "construireC") return `La concentration est la quantité ${exercice.contexte.quantitePhrase} divisée par le volume total, au même instant t.`;
      if (phase === "limiteC") return "Factorise numérateur et dénominateur par t avant de passer à la limite.";
      return "Pour t très grand, le volume initial devient négligeable face au volume ajouté.";
    case "clubLoisirs":
      if (phase === "evaluer") return "Calcule d'abord f(x) dans l'échelle du modèle, puis multiplie par le facteur de conversion.";
      if (phase === "inequation") return "Pose l'égalité f(x)=seuil, réduis au même dénominateur, résous le polynôme obtenu.";
      if (phase === "asymptoteOblique") return "L'asymptote oblique est la partie ax+b de f(x) — le terme en 1/(x+d) disparaît à l'infini.";
      return "La pente a est un taux dans l'échelle du modèle : multiplie-la par le facteur de conversion.";
    case "population":
      if (phase === "identification") return "a/(x+p)+b réduit au même dénominateur donne (bx+(a+bp))/(x+p) — compare aux coefficients affichés.";
      if (phase === "interpreter") return "Compare f(0) à la limite b : ne conclus jamais uniquement à partir du signe de a.";
      return "Calcule x = année demandée − année de référence, puis évalue f(x).";
  }
}

export function texteAideNiveau2(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): string {
  switch (exercice.famille) {
    case "prixRevient":
      if (phase === "asymptoteHorizontale") return "Exemple : si Cᵤ(x)=15+300/x, alors lim Cᵤ(x) quand x→+∞ vaut 15.";
      if (phase === "interpreter") return "Exemple : avec Cᵤ(x)=15+300/x, le coût unitaire descend vers 15 € sans jamais l'atteindre exactement.";
      return `Exemple : si le seuil minimal est de 20 ${exercice.contexte.unitePluriel}, x=0 n'appartient jamais au domaine réel du problème.`;
    case "eauSalee":
      if (phase === "construireC") return "Exemple : V(t)=50+2t, Q(t)=3·2·t=6t ⟹ C(t)=6t/(50+2t).";
      if (phase === "limiteC") return "Exemple : C(t)=6t/(50+2t)=6/(50/t+2) → 6/2=3 quand t→+∞.";
      return "Exemple : ajouter en continu une solution à 3 g/L finit par imposer sa concentration au contenant tout entier.";
    case "clubLoisirs":
      if (phase === "evaluer") return `Exemple : si f(0)=4 (échelle centaines) et le facteur est 100, ${exercice.contexte.grandeurArticle} réel à la création est de 400.`;
      if (phase === "inequation") return "Exemple : (ax+b−k)(x+d)=c est un polynôme du second degré en x — résous-le via le discriminant.";
      if (phase === "asymptoteOblique") return "Exemple : f(x)=2x−1−5/(x+3) a pour asymptote oblique y=2x−1.";
      return `Exemple : une pente de 3 (échelle centaines) avec un facteur 100 signifie +300 ${exercice.contexte.unitePluriel} réels par mois.`;
    case "population":
      if (phase === "identification") return "Exemple : (10x+25)/(x+2) — coefficient de x : b=10 ; terme constant : a+2b=25 ⟹ a=25−20=5.";
      if (phase === "interpreter") return "Exemple : f(0)=12, limite b=10 : la valeur initiale est supérieure à la limite ⟹ régression, MÊME si a>0.";
      return "Exemple : pour l'année 2030 avec une référence 2010, x=2030−2010=20.";
  }
}

// ============================================================================
// Bloc "état actuel" — dès l'écran 2, récapitule les réponses confirmées des écrans précédents.
// Motif générique : chaque phase déjà traversée ajoute une ligne, dérivée de l'exercice seul.
// ============================================================================

export function formatTermesEtatActuelLatex(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): string[] | null {
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  if (index <= 0) return null;
  const dejaTraversees = ordre.slice(0, index);
  const termes = dejaTraversees.map((p) => formatEtatLigne(exercice, p)).filter((t): t is string => t !== null);
  return termes.length > 0 ? termes : null;
}

function formatEtatLigne(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): string | null {
  if (exercice.famille === "prixRevient") {
    if (phase === "asymptoteHorizontale") return `\\lim_{x\\to+\\infty}C_u(x)=${exercice.b}`;
    return null; // "interpreter"/"vaSens" sont des QCM, pas de terme LaTeX synthétique pertinent
  }
  if (exercice.famille === "eauSalee") {
    if (phase === "construireC") return `C(t)=\\dfrac{${exercice.c * exercice.r}t}{${exercice.v0}+${exercice.r}t}`;
    if (phase === "limiteC") return `\\lim_{t\\to+\\infty}C(t)=${exercice.c}`;
    return null;
  }
  if (exercice.famille === "clubLoisirs") {
    if (phase === "evaluer") return `f(0)\\times${exercice.facteur}=${Math.round((exercice.b - exercice.c / exercice.d) * exercice.facteur)}`;
    if (phase === "inequation") return `x_{\\text{critique}}\\Rightarrow ${exercice.moisAttendu}\\text{ mois}`;
    if (phase === "asymptoteOblique") return `y=${formatMonomeLatex(exercice.a, 1, true)}${formatMonomeLatex(exercice.b, 0, false)}`;
    return null;
  }
  if (exercice.famille === "population") {
    if (phase === "identification") return `a=${exercice.a},\\ b=${exercice.b}`;
    return null;
  }
  return null;
}

// ============================================================================
// Récapitulatif final.
// ============================================================================

export function estPhaseQCM(phase: PhaseLimitesContexte): boolean {
  if (phase === "interpreter") return true;
  if (phase === "vaSens") return true;
  return false;
}

export function formatReponseAttendueTexte(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): string | null {
  if (exercice.famille === "prixRevient" && (phase === "interpreter" || phase === "vaSens")) {
    const options = phase === "interpreter" ? exercice.optionsInterpretation : exercice.optionsVASens;
    return options.find((o) => o.correcte)?.texte ?? null;
  }
  if (exercice.famille === "eauSalee" && phase === "interpreter") {
    return exercice.optionsInterpretation.find((o) => o.correcte)?.texte ?? null;
  }
  if (exercice.famille === "population" && phase === "interpreter") {
    return exercice.optionsInterpretation.find((o) => o.correcte)?.texte ?? null;
  }
  return null;
}

export function formatReponseAttenduePhaseLatex(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): string[] {
  if (estPhaseQCM(phase)) return [];
  if (exercice.famille === "prixRevient" && phase === "asymptoteHorizontale") return [`\\lim_{x\\to+\\infty}C_u(x)=${exercice.b}`];
  if (exercice.famille === "eauSalee" && phase === "construireC") return [`C(t)=\\dfrac{${exercice.c * exercice.r}t}{${exercice.v0}+${exercice.r}t}`];
  if (exercice.famille === "eauSalee" && phase === "limiteC") return [`\\lim_{t\\to+\\infty}C(t)=${exercice.c}`];
  if (exercice.famille === "clubLoisirs") {
    const { a, b, c, d, facteur, xEval, moisAttendu } = exercice;
    if (phase === "evaluer") {
      const f0 = Math.round((b - c / d) * facteur);
      const fX = Math.round((a * xEval + b - c / (xEval + d)) * facteur);
      return [`f(0)\\times${facteur}=${f0}`, `f(${xEval})\\times${facteur}=${fX}`];
    }
    if (phase === "inequation") return [`${moisAttendu}\\text{ mois}`];
    if (phase === "asymptoteOblique") return [`y=${formatMonomeLatex(a, 1, true)}${formatMonomeLatex(b, 0, false)}`];
    if (phase === "interpreterPente") return [`${a * facteur}\\text{ ${exercice.contexte.unitePluriel}/mois}`];
  }
  if (exercice.famille === "population") {
    const { a, b, p, anneeRef, anneeEval, seuil } = exercice;
    if (phase === "identification") return [`a=${a}`, `b=${b}`];
    if (phase === "evaluerSeuil") {
      const x = anneeEval - anneeRef;
      const valeur = a / (x + p) + b;
      const comparaison = valeur > seuil ? ">" : "<";
      return [`f(${x})\\approx${Math.round(valeur * 100) / 100}`, `${Math.round(valeur * 100) / 100}${comparaison}${seuil}`];
    }
  }
  return [];
}
