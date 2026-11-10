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
      // L'unité suit le facteur tiré (10 ou 100) : « dizaines » ou « centaines » (les contextes sont
      // écrits en centaines — avec un facteur 10, « en centaines » contredisait « 1 unité = 10 »).
      const unite = exercice.facteur === 10 ? ctx.parentheseUnite.replace(/^centaines/, "dizaines") : ctx.parentheseUnite;
      return `${ctx.entiteDescription} évolue selon f(x) (en ${unite}), x étant le nombre de mois écoulés depuis ${ctx.origine} (x≥0). 1 unité de f(x) correspond à ${exercice.facteur} ${ctx.unitePluriel} réels.`;
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
// Nombres et texte riche.
// ============================================================================

/** Nombre décimal belge (virgule), arrondi au centième, pour du TEXTE. */
export function nombreTexte(valeur: number): string {
  const arrondi = Math.round(valeur * 100) / 100;
  return `${arrondi < 0 ? "−" : ""}${String(Math.abs(arrondi)).replace(".", ",")}`;
}

/** Même nombre, pour du LaTeX (virgule décimale `{,}`, signe moins LaTeX). */
export function nombreLatex(valeur: number): string {
  const arrondi = Math.round(valeur * 100) / 100;
  return `${arrondi < 0 ? "-" : ""}${String(Math.abs(arrondi)).replace(".", "{,}")}`;
}

/** Texte riche (`$…$` = formule KaTeX en ligne, rendu écran par `TexteRiche5e`) → texte brut lisible
 * (fractions « a/b », symboles Unicode) pour les usages texte seul — l'adaptateur papier, qui
 * réutilise `consignePhase` tel quel (refonte des feuilles à venir). */
export function richeVersTexte(riche: string): string {
  return riche.replace(/\$([^$]+)\$/g, (_, f: string) => {
    let t = f;
    for (let i = 0; i < 3; i++) t = t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, n: string, d: string) => `${/^[\w,]+$/.test(n) ? n : `(${n})`}/${/^[\w,]+$/.test(d) ? d : `(${d})`}`);
    return t
      .replace(/\\lim_\{([^{}]*)\}/g, "lim($1) ")
      .replace(/\\to/g, "→")
      .replace(/\\infty/g, "∞")
      .replace(/\\geq?/g, "≥")
      .replace(/\\leq?/g, "≤")
      .replace(/\\times/g, "×")
      .replace(/\\cdot/g, "·")
      .replace(/\\left|\\right/g, "")
      .replace(/\\[,;!]|\\quad|\\qquad/g, " ")
      .replace(/\\text\{([^{}]*)\}/g, "$1")
      .replace(/_\{([^{}]*)\}/g, "$1")
      .replace(/\{,\}/g, ",")
      .replace(/[{}]/g, "")
      .replace(/(\d)-/g, "$1 − ")
      .replace(/-/g, "−");
  });
}

function signeTerme(v: number): string {
  return v < 0 ? `-${Math.abs(v)}` : `+${v}`;
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
  if (phase === "identification") return "Division euclidienne";
  if (phase === "evaluerSeuil") return "Comparer au seuil";
  // "interpreter" — partagé par 3 familles, libellé identique.
  void famille;
  return "Interprétation";
}

/** Consigne d'écran en TEXTE RICHE (`$…$` = KaTeX, prose hors du mode maths) — rendue par
 * `TexteRiche5e`. Les consignes des QCM finissent par « Choisis la/l'… . » (attendu par
 * `versJustificationEcrite` de l'adaptateur papier). */
export function consignePhaseRiche(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): string {
  switch (exercice.famille) {
    case "prixRevient":
      if (phase === "asymptoteHorizontale") return "Calcule la limite du coût unitaire quand $x$ tend vers $+\\infty$.";
      if (phase === "interpreter") return "Choisis la phrase qui interprète correctement ce résultat.";
      return "L'asymptote verticale $x=0$ a-t-elle un sens dans ce contexte ? Choisis la justification correcte.";
    case "eauSalee":
      if (phase === "construireC") return `Construis $C(t)$, la concentration ${exercice.contexte.quantitePhrase} à l'instant $t$, à partir de $V(t)$ et $Q(t)$.`;
      if (phase === "limiteC") return "Calcule la limite de $C(t)$ quand $t$ tend vers $+\\infty$.";
      return "Ce résultat était prévisible sans recalcul. Choisis la bonne justification.";
    case "clubLoisirs": {
      const { facteur, xEval, k0, contexte } = exercice;
      if (phase === "evaluer")
        return `Calcule la valeur réelle (convertie, en ${contexte.unitePluriel}) à la création ($x=0$), puis après ${xEval} mois ($x=${xEval}$). Arrondis à l'unité.`;
      if (phase === "inequation")
        return `Résous $f(x)\\geq ${k0}$, c'est-à-dire ${k0 * facteur} ${contexte.unitePluriel} réels : donne le plus petit nombre entier de mois $x$ pour lequel ${contexte.grandeurArticle} atteint ce seuil.`;
      if (phase === "asymptoteOblique") return "Donne l'équation de l'asymptote oblique de la courbe de $f$ en $+\\infty$.";
      return `Interprète la pente de l'asymptote oblique comme un taux d'évolution réel (en ${contexte.unitePluriel} par mois).`;
    }
    case "population": {
      const x = exercice.anneeEval - exercice.anneeRef;
      if (phase === "identification")
        return "Écris $f(x)$ sous la forme $\\dfrac{a}{x+p}+b$ : effectue la division euclidienne du numérateur par le dénominateur ($b$ est le quotient, $a$ le reste).";
      if (phase === "interpreter") return `${capitaliser(exercice.contexte.grandeurArticle)} : croissance ou régression ? Choisis la phrase correcte.`;
      return `Évalue ${exercice.contexte.grandeurArticle} en ${exercice.anneeEval}, c'est-à-dire $f(${x})$ (arrondi au centième). Cette valeur est-elle supérieure ou inférieure au seuil de ${nombreTexte(exercice.seuil)} ${exercice.contexte.unitePourValeur} ?`;
    }
  }
}

/** Consigne d'écran en texte brut — conservée pour l'adaptateur papier (`exportEvaluation.ts`). */
export function consignePhase(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): string {
  return richeVersTexte(consignePhaseRiche(exercice, phase));
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
// Aides (2 niveaux) — TEXTE RICHE (`$…$`), jamais de formule au clavier. Niveau 1 : rappel de
// méthode ; niveau 2 : forme substituée NON résolue (ou exemple sur d'autres nombres) — jamais la
// conclusion de l'écran (audit 5c4b, point 16).
// ============================================================================

export function texteAideNiveau1(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): string {
  switch (exercice.famille) {
    case "prixRevient":
      if (phase === "asymptoteHorizontale") return "Quand $x\\to+\\infty$, un terme de la forme $\\dfrac{k}{x}$ ($k$ constant) tend vers $0$.";
      if (phase === "interpreter") return `Pour $x>0$, quel est le signe de $\\dfrac{${exercice.a}}{x}$ ? Compare alors $C_u(x)$ à sa limite, puis regarde si $C_u$ augmente ou diminue quand $x$ grandit.`;
      return "Une asymptote n'a de sens dans le contexte que si les valeurs de $x$ proches de $0$ appartiennent au domaine RÉEL du problème (les valeurs qui ont un sens concret).";
    case "eauSalee":
      if (phase === "construireC") return `La concentration est la quantité ${exercice.contexte.quantitePhrase} divisée par le volume total, au même instant : $C(t)=\\dfrac{Q(t)}{V(t)}$.`;
      if (phase === "limiteC") return "Divise le numérateur et le dénominateur par $t$, puis fais tendre $t$ vers $+\\infty$.";
      return `Compare, pour $t$ très grand, le volume initial ($${exercice.v0}$ L) et le volume ajouté ($${exercice.r}t$ L) : lequel impose sa concentration au mélange ?`;
    case "clubLoisirs":
      if (phase === "evaluer") return "Calcule d'abord $f(x)$ dans l'échelle du modèle, puis multiplie par le facteur de conversion.";
      if (phase === "inequation")
        return `Pose l'égalité $f(x)=${exercice.k0}$, multiplie les deux membres par $x+${exercice.d}$, résous l'équation du second degré obtenue, garde la solution positive, puis prends le premier entier qui la dépasse.`;
      if (phase === "asymptoteOblique") return `Quand $x\\to+\\infty$, la fraction $\\dfrac{${exercice.c}}{x+${exercice.d}}$ tend vers $0$ : que reste-t-il de $f(x)$ ?`;
      return "La pente $a$ est un taux dans l'échelle du modèle : multiplie-la par le facteur de conversion.";
    case "population":
      if (phase === "identification") return "Divise le numérateur par $x+p$ : $\\dfrac{N(x)}{x+p}=b+\\dfrac{a}{x+p}$, où $b$ est le quotient (un nombre) et $a$ le reste.";
      if (phase === "interpreter") return "Compare la valeur de départ $f(0)$ à la limite $b$ : si $f(0)>b$, la grandeur descend vers $b$ ; si $f(0)<b$, elle monte vers $b$.";
      return "Calcule $x$ = année demandée − année de référence, évalue $f(x)$, arrondis au centième, puis compare au seuil.";
  }
}

/** Aide fragmentée — `texte` en TEXTE RICHE (`$…$`), `latex` = formule affichée en bloc à part. */
export interface AideFragmentee {
  texte: string;
  latex: string | null;
}

export function texteAideNiveau2(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): AideFragmentee {
  switch (exercice.famille) {
    case "prixRevient": {
      const { a, b, seuil } = exercice;
      if (phase === "asymptoteHorizontale")
        return { texte: "Écris la limite terme par terme :", latex: `\\lim_{x\\to+\\infty}\\left(${b}+\\dfrac{${a}}{x}\\right)=${b}+\\lim_{x\\to+\\infty}\\dfrac{${a}}{x}` };
      if (phase === "interpreter")
        return {
          texte: "Compare le coût unitaire pour deux commandes (sans tout calculer, regarde le terme qui change) :",
          latex: `\\begin{gathered}C_u(${seuil})=${b}+\\dfrac{${a}}{${seuil}}\\\\[4pt] C_u(${seuil * 10})=${b}+\\dfrac{${a}}{${seuil * 10}}\\end{gathered}`,
        };
      return { texte: `Relis l'énoncé : quel est le plus petit nombre de ${exercice.contexte.unitePluriel} accepté ? $x=0$ en fait-il partie ?`, latex: null };
    }
    case "eauSalee": {
      const { v0, r, c } = exercice;
      if (phase === "construireC")
        return { texte: "Exemple, avec d'autres valeurs :", latex: "\\begin{gathered}V(t)=40+3t,\\ Q(t)=15t\\\\[4pt] \\Rightarrow\\; C(t)=\\dfrac{15t}{40+3t}\\end{gathered}" };
      if (phase === "limiteC")
        return { texte: "Après division par $t$ (il reste à faire tendre $t$ vers $+\\infty$) :", latex: `C(t)=\\dfrac{${c * r}t}{${v0}+${r}t}=\\dfrac{${c * r}}{\\frac{${v0}}{t}+${r}}` };
      return { texte: "Compare les deux volumes, par exemple pour $t=1000$ minutes :", latex: `\\text{initial : }${v0}\\qquad \\text{ajouté : }${r}\\times1000` };
    }
    case "clubLoisirs": {
      const { a, b, c, d, k0, facteur, xEval } = exercice;
      if (phase === "evaluer")
        return {
          texte: "Valeurs à calculer, puis à arrondir à l'unité :",
          latex: `\\begin{gathered}f(0)\\times${facteur}=\\left(${b}-\\dfrac{${c}}{${d}}\\right)\\times${facteur}\\\\[4pt] f(${xEval})\\times${facteur}=\\left(${a}\\times${xEval}+${b}-\\dfrac{${c}}{${xEval + d}}\\right)\\times${facteur}\\end{gathered}`,
        };
      if (phase === "inequation") {
        const B0 = b - k0;
        const facteurGauche = B0 === 0 ? `${a}x` : `(${a}x${signeTerme(B0)})`;
        return { texte: "Équation à résoudre (second degré en $x$, après développement) :", latex: `${facteurGauche}(x+${d})=${c}` };
      }
      if (phase === "asymptoteOblique")
        return { texte: "Exemple, avec une autre fonction :", latex: "f(x)=\\tfrac{3}{2}x-7-\\dfrac{4}{x+1} \\;\\Rightarrow\\; y=\\tfrac{3}{2}x-7" };
      return { texte: `Exemple, avec d'autres valeurs : une pente de $0{,}5$ (dans l'échelle du modèle) avec un facteur $10$ signifie $+5$ ${exercice.contexte.unitePluriel} réels par mois.`, latex: null };
    }
    case "population": {
      const { a, b, p, anneeRef, anneeEval } = exercice;
      if (phase === "identification")
        return { texte: "Exemple, avec d'autres valeurs :", latex: "\\begin{gathered}\\dfrac{60x+127}{x+2}=\\dfrac{60(x+2)+7}{x+2}\\\\[4pt] =60+\\dfrac{7}{x+2} \\;\\Rightarrow\\; b=60,\\ a=7\\end{gathered}" };
      if (phase === "interpreter")
        return { texte: "Écart entre la valeur de départ et la limite (regarde son signe) :", latex: `f(0)-b=\\dfrac{a}{p}=\\dfrac{${a}}{${p}}` };
      return { texte: "Valeurs à utiliser (il reste à calculer) :", latex: `\\begin{gathered}x=${anneeEval}-${anneeRef}\\\\[4pt] f(x)=\\dfrac{${a}}{x+${p}}+${b}\\end{gathered}` };
    }
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
      return [`f(${x})\\approx${nombreLatex(valeur)}`, `${nombreLatex(valeur)}${comparaison}${nombreLatex(seuil)}`];
    }
  }
  return [];
}
