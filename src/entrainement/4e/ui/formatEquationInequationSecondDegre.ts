/**
 * Couche présentation — "Équations/inéquations du second degré en contexte" (position 57). Porte
 * l'écran "poserSysteme" (architecture D uniquement, voir `core/equationInequationSecondDegre.types.ts`,
 * en-tête) en plus des 4 écrans communs aux 4 architectures (l'écran "isolerSubstituer" réutilise
 * directement `consignePoserEquationInequation`/les aides de "poserEquationInequation", même
 * composant — voir `AppEquationInequationSecondDegre.tsx`). Réutilise `formatFonctionDeveloppeeLatex`/
 * `formatDomaineLatex` (`ui/formatOptimisation.ts`, ui→ui) plutôt que de dupliquer le formatage d'un
 * polynôme développé.
 */
import type { ExerciceEquationInequationSecondDegre, FamilleEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import { formatDomaineLatex, formatFonctionDeveloppeeLatex } from "./formatOptimisation";
import { CATALOGUE_FAMILLES } from "../generateurs/equationInequationSecondDegre";
import { ensembleTexte, relationTexte } from "../generateurs/equationInequationSecondDegre/interpretation";

/** Nombre en LaTeX : au plus 2 décimales, virgule décimale « {,} » (jamais un point). */
function formatNombre(valeur: number): string {
  return (Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "")).replace(".", "{,}");
}

/** Même nombre en TEXTE (consignes, réponses révélées) : virgule et « − » typographique. */
export function formatNombreTexte(valeur: number): string {
  return formatNombre(valeur).replace("{,}", ",").replace("-", "−");
}

/** Domaine de validité en texte (« [5 ; 21] ») — donnée de l'énoncé : il ne se déduit pas toujours
 * du texte narratif (bornes propres à la situation), il est donc toujours rappelé à l'élève. */
export function formatDomaineTexte(exercice: ExerciceEquationInequationSecondDegre): string {
  return `[${formatNombreTexte(exercice.base.domaine.inf)} ; ${formatNombreTexte(exercice.base.domaine.sup)}]`;
}

function capitaliser(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** Symbole de l'équation / l'inéquation en LaTeX (≥ et ≤ tirés aussi, audit G14). */
export function symboleEquationInequation(exercice: ExerciceEquationInequationSecondDegre): string {
  if (exercice.variante === "equation") return "=";
  return exercice.sens === "gt" ? (exercice.large ? "\\geq" : ">") : exercice.large ? "\\leq" : "<";
}

/** Relation en toutes lettres : « dépasse », « atteint au moins », « est en dessous de », « ne dépasse pas ». */
export function relationEquationInequation(exercice: ExerciceEquationInequationSecondDegre): string {
  if (exercice.variante === "equation") return "vaut exactement";
  return relationTexte(exercice.sens, exercice.large);
}

/** Ensemble des solutions de l'inéquation sur ℝ (avant le domaine) : entre les racines ou à l'extérieur. */
export function ensembleSurRLatex(exercice: Extract<ExerciceEquationInequationSecondDegre, { variante: "inequation" }>): string {
  const label = exercice.base.contexte.labelVariable;
  const { inf, sup } = exercice.intervalleBrut;
  const [o, f] = exercice.large ? ["[", "]"] : ["]", "["];
  if (exercice.entreRacines) return `${label} \\in \\,${o}${formatNombre(inf)}\\,;\\,${formatNombre(sup)}${f}`;
  return `${label} \\in \\,]-\\infty\\,;\\,${formatNombre(inf)}${f}\\cup${o}${formatNombre(sup)}\\,;\\,+\\infty[`;
}

/** Réponse de l'écran « validation » d'une inéquation : intervalle avec ses crochets, ou ensemble
 * d'ENTIERS (décision 5 : « x ∈ {0 ; 1 ; … ; 30} »). */
export function ensembleValideLatex(exercice: Extract<ExerciceEquationInequationSecondDegre, { variante: "inequation" }>): string {
  const label = exercice.base.contexte.labelVariable;
  if (exercice.entiers) {
    const { min, max } = exercice.entiers;
    const liste = max - min <= 3 ? Array.from({ length: max - min + 1 }, (_, i) => formatNombre(min + i)).join("\\,;\\,") : `${formatNombre(min)}\\,;\\,${formatNombre(min + 1)}\\,;\\,\\ldots\\,;\\,${formatNombre(max)}`;
    return `${label} \\in \\{${liste}\\}`;
  }
  return intervalleValideSeulLatex(exercice);
}

/** Intervalle-solution dans le domaine (même pour une variable entière : ligne qui précède les entiers). */
export function intervalleValideSeulLatex(exercice: Extract<ExerciceEquationInequationSecondDegre, { variante: "inequation" }>): string {
  const { inf, sup } = exercice.intervalleValide;
  return `${exercice.base.contexte.labelVariable} \\in \\,${exercice.inclusInf ? "[" : "]"}${formatNombre(inf)}\\,;\\,${formatNombre(sup)}${exercice.inclusSup ? "]" : "["}`;
}

/** Membre gauche (fonction développée) + symbole + `k`, en LaTeX — jamais résolu. */
export function formatEquationInequationLatex(exercice: ExerciceEquationInequationSecondDegre): string {
  const gauche = formatFonctionDeveloppeeLatex(exercice.base.fonction, exercice.base.contexte.labelVariable);
  return `${gauche} ${symboleEquationInequation(exercice)} ${formatNombre(exercice.k)}`;
}

function gathered(lignes: string[]): string {
  return `\\begin{gathered} ${lignes.join(" \\\\ ")} \\end{gathered}`;
}

function ligneFonction(exercice: ExerciceEquationInequationSecondDegre): string {
  return formatFonctionDeveloppeeLatex(exercice.base.fonction, exercice.base.contexte.labelVariable);
}

function ligneDomaine(exercice: ExerciceEquationInequationSecondDegre): string {
  return formatDomaineLatex(exercice.base.domaine, exercice.base.contexte.labelVariable);
}

function ligneResolution(exercice: ExerciceEquationInequationSecondDegre): string {
  const label = exercice.base.contexte.labelVariable;
  if (exercice.variante === "equation") {
    const [r1, r2] = exercice.racinesCandidates;
    return `${label} = ${formatNombre(r1)} \\text{ ou } ${label} = ${formatNombre(r2)}`;
  }
  return ensembleSurRLatex(exercice);
}

function ligneValidation(exercice: ExerciceEquationInequationSecondDegre): string {
  const label = exercice.base.contexte.labelVariable;
  if (exercice.variante === "equation") {
    if (exercice.racinesValides.length === 0) return "\\text{aucune racine valide}";
    return exercice.racinesValides.map((r) => `${label} = ${formatNombre(r)}`).join(" \\text{ ou } ");
  }
  void label;
  return ensembleValideLatex(exercice);
}

/** État actuel — écran "poserEquationInequation" : fonction+domaine déjà confirmés (écrans 1-3). */
export function formatDonneesConfirmeesLatex(exercice: ExerciceEquationInequationSecondDegre): string {
  return gathered([ligneFonction(exercice), ligneDomaine(exercice)]);
}

/** État actuel — écran "resoudre" : + l'équation/l'inéquation posée. */
export function formatDonneesAvecEquationLatex(exercice: ExerciceEquationInequationSecondDegre): string {
  return gathered([ligneFonction(exercice), ligneDomaine(exercice), formatEquationInequationLatex(exercice)]);
}

/** État actuel — écran "validation" : + la résolution mathématique brute (racines/intervalle non
 * encore confrontés au domaine). */
export function formatDonneesAvecResolutionLatex(exercice: ExerciceEquationInequationSecondDegre): string {
  return gathered([ligneFonction(exercice), ligneDomaine(exercice), formatEquationInequationLatex(exercice), ligneResolution(exercice)]);
}

/** État actuel — écran "interpretation" : + le résultat validé (intersecté avec le domaine). */
export function formatDonneesFinalesLatex(exercice: ExerciceEquationInequationSecondDegre): string {
  return gathered([ligneFonction(exercice), ligneDomaine(exercice), formatEquationInequationLatex(exercice), ligneResolution(exercice), ligneValidation(exercice)]);
}

// ============================================================================
// Écran "poserSysteme" — architecture D uniquement (`voieSysteme`).
// ============================================================================

export function consignePoserSysteme(): string {
  return "Traduis les deux relations décrites dans l'énoncé sous la forme de 2 équations à 2 inconnues (x et y).";
}

export function texteAidePoserSystemeNiveau1(exercice: ExerciceEquationInequationSecondDegre): string {
  if (!exercice.systeme) return "";
  return `Rappel : "${exercice.systeme.label1}" et "${exercice.systeme.label2}" se traduisent chacune directement par une égalité entre x et y.`;
}

/** LaTeX pur — l'appelant préfixe son propre texte avant de rendre via `<Katex>`. Dérivé de
 * `(x0,y0)` (le point-solution ancré sur `exercice.systeme`) — `x0+y0`/`x0·y0` sont TOUJOURS une
 * forme canonique valide des 2 relations (`diagnostiquerEquivalenceQuadratiqueXY` accepte toute
 * mise à l'échelle non nulle, voir `generateurs/.../systemeSubstitution.ts`, en-tête), même quand
 * la grandeur narrativement nommée est une mise à l'échelle (ex. un périmètre = 2·(x+y)). */
export function texteAidePoserSystemeNiveau2(exercice: ExerciceEquationInequationSecondDegre): string {
  if (!exercice.systeme) return "";
  const { x0, y0 } = exercice.systeme;
  return gathered([`x + y = ${formatNombre(x0 + y0)}`, `x \\cdot y = ${formatNombre(x0 * y0)}`]);
}

// ============================================================================
// Consignes par écran.
// ============================================================================

export function consignePoserEquationInequation(exercice: ExerciceEquationInequationSecondDegre): string {
  const { nomGrandeur, uniteGrandeur } = exercice.base.contexte;
  const k = formatNombreTexte(exercice.k);
  if (exercice.variante === "equation") {
    return `${capitaliser(nomGrandeur)} vaut exactement ${k} ${uniteGrandeur} : pose l'équation correspondante.`;
  }
  return `${capitaliser(nomGrandeur)} ${relationEquationInequation(exercice)} ${k} ${uniteGrandeur} : pose l'inéquation correspondante.`;
}

/** Tolérance réellement vérifiée = `0.005` (`verificationEquationInequationSecondDegre.ts`) — soit
 * un arrondi au centième, jamais annoncé jusqu'ici. */
export function consigneResoudre(): string {
  return "Résous algébriquement (les 2 valeurs limites, ordre indifférent — arrondi au centième accepté si besoin).";
}

export function consigneValidation(exercice: ExerciceEquationInequationSecondDegre): string {
  const domaine = `${exercice.base.contexte.labelVariable} ∈ ${formatDomaineTexte(exercice)}`;
  return exercice.variante === "equation"
    ? `Dans cette situation, le domaine de validité est ${domaine}. Chaque racine appartient-elle à ce domaine ? Classe chacune d'elles.`
    : exercice.entiers
      ? `Dans cette situation, le domaine de validité est ${domaine} et ${exercice.base.contexte.labelVariable} est un nombre entier. Donne le plus petit et le plus grand entier qui conviennent : la réponse est l'ensemble des entiers entre les deux.`
      : `Dans cette situation, le domaine de validité est ${domaine}. Détermine l'intervalle-solution valide, en tenant compte de ce domaine — arrondi au centième accepté si besoin.`;
}

export function consigneInterpretation(): string {
  return "Choisis la phrase de conclusion correcte.";
}

// ============================================================================
// Aides.
// ============================================================================

export function texteAidePoserEquationInequationNiveau1(): string {
  return "Exprime la grandeur en fonction de la variable, puis compare-la au seuil avec le symbole qui traduit la phrase (> « dépasse », ≥ « au moins », < « en dessous de », ≤ « ne dépasse pas »). Tu peux aussi tout ramener dans un membre : f(x) − k comparé à 0.";
}

/** LaTeX pur — l'expression de la grandeur seule (jamais l'inéquation complète : ce serait la
 * réponse de l'écran). */
export function texteAidePoserEquationInequationNiveau2(exercice: ExerciceEquationInequationSecondDegre): string {
  return `${formatFonctionDeveloppeeLatex(exercice.base.fonction, exercice.base.contexte.labelVariable)} \\;?\\; ${formatNombre(exercice.k)}`;
}

export function texteAideResoudreNiveau1(): string {
  return "Rappel : résous comme n'importe quelle équation/inéquation du second degré (discriminant, ou factorisation si possible).";
}

/** LaTeX pur — l'appelant préfixe son propre texte avant de rendre via `<Katex>`. */
export function texteAideResoudreNiveau2(exercice: ExerciceEquationInequationSecondDegre): string {
  return formatEquationInequationLatex(exercice);
}

export function texteAideValidationNiveau1(): string {
  return "Rappel : seules les valeurs comprises dans le domaine de validité ont un sens dans ce contexte.";
}

/** LaTeX pur — l'appelant préfixe son propre texte avant de rendre via `<Katex>`. */
export function texteAideValidationNiveau2(exercice: ExerciceEquationInequationSecondDegre): string {
  return gathered([ligneDomaine(exercice), ligneResolution(exercice)]);
}

export function texteAideValidationNiveau3(exercice: ExerciceEquationInequationSecondDegre): string {
  return exercice.variante === "equation"
    ? "Méthode : compare chaque racine aux bornes du domaine — hors de l'intervalle, elle est à rejeter."
    : "Méthode : intersecte l'intervalle trouvé avec le domaine — conserve uniquement la partie commune aux deux.";
}

export function texteAideInterpretationNiveau1(): string {
  return "Vérifie l'unité, le sens de la comparaison, et que tu n'as pas confondu la variable avec la grandeur.";
}

// ============================================================================
// Révélation.
// ============================================================================

export function formatResolutionAttendueTexte(exercice: ExerciceEquationInequationSecondDegre): string {
  const label = exercice.base.contexte.labelVariable;
  if (exercice.variante === "equation") {
    return exercice.racinesCandidates.map((r) => `${label} = ${formatNombreTexte(r)}`).join(" ; ");
  }
  const { inf, sup } = exercice.intervalleBrut;
  const [o, f] = exercice.large ? ["[", "]"] : ["]", "["];
  return exercice.entreRacines
    ? `${label} ∈ ${o}${formatNombreTexte(inf)} ; ${formatNombreTexte(sup)}${f}`
    : `${label} ∈ ]−∞ ; ${formatNombreTexte(inf)}${f} ∪ ${o}${formatNombreTexte(sup)} ; +∞[`;
}

export function formatValidationAttendueTexte(exercice: ExerciceEquationInequationSecondDegre): string {
  const label = exercice.base.contexte.labelVariable;
  if (exercice.variante === "equation") {
    if (exercice.racinesValides.length === 0) return "aucune racine valide";
    return exercice.racinesCandidates.map((r) => `${label} = ${formatNombreTexte(r)} : ${exercice.racinesValides.includes(r) ? "valide" : "rejetée"}`).join(", ");
  }
  // Borne venant d'une racine : comprise si le symbole est large ; borne du domaine : comprise.
  return ensembleTexte(label, exercice.intervalleValide, exercice.inclusInf, exercice.inclusSup, exercice.entiers).replace(/-/g, "−");
}

// ============================================================================
// Divers.
// ============================================================================

export function libelleFamilleEquationInequationSecondDegre(famille: FamilleEquationInequationSecondDegre): string {
  return CATALOGUE_FAMILLES.find((f) => f.id === famille)?.label ?? famille;
}
