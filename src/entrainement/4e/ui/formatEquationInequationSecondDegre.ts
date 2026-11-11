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

function symboleEquationInequation(exercice: ExerciceEquationInequationSecondDegre): string {
  return exercice.variante === "equation" ? "=" : exercice.sens === "gt" ? ">" : "<";
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
  const { inf, sup } = exercice.intervalleBrut;
  return `${label} \\in \\left] ${formatNombre(inf)} \\, ; \\, ${formatNombre(sup)} \\right[`;
}

function ligneValidation(exercice: ExerciceEquationInequationSecondDegre): string {
  const label = exercice.base.contexte.labelVariable;
  if (exercice.variante === "equation") {
    if (exercice.racinesValides.length === 0) return "\\text{aucune racine valide}";
    return exercice.racinesValides.map((r) => `${label} = ${formatNombre(r)}`).join(" \\text{ ou } ");
  }
  const { inf, sup } = exercice.intervalleValide;
  const gauche = inf === exercice.intervalleBrut.inf ? "\\left]" : "\\left[";
  const droite = sup === exercice.intervalleBrut.sup ? "\\right[" : "\\right]";
  return `${label} \\in ${gauche} ${formatNombre(inf)} \\, ; \\, ${formatNombre(sup)} ${droite}`;
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
  const relation = exercice.sens === "gt" ? "dépasse" : "est en dessous de";
  return `${capitaliser(nomGrandeur)} ${relation} ${k} ${uniteGrandeur} : pose l'inéquation correspondante.`;
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
    : `Dans cette situation, le domaine de validité est ${domaine}. Détermine l'intervalle-solution valide, en tenant compte de ce domaine — arrondi au centième accepté si besoin.`;
}

export function consigneInterpretation(): string {
  return "Choisis la phrase de conclusion correcte.";
}

// ============================================================================
// Aides.
// ============================================================================

export function texteAidePoserEquationInequationNiveau1(): string {
  return "Rappel : exprime la grandeur en fonction de la variable (développée), et pose l'égalité/l'inégalité avec le seuil donné.";
}

/** LaTeX pur — l'appelant préfixe son propre texte avant de rendre via `<Katex>`. */
export function texteAidePoserEquationInequationNiveau2(exercice: ExerciceEquationInequationSecondDegre): string {
  return formatEquationInequationLatex(exercice);
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
  return `${label} ∈ ]${formatNombreTexte(exercice.intervalleBrut.inf)} ; ${formatNombreTexte(exercice.intervalleBrut.sup)}[`;
}

export function formatValidationAttendueTexte(exercice: ExerciceEquationInequationSecondDegre): string {
  const label = exercice.base.contexte.labelVariable;
  if (exercice.variante === "equation") {
    if (exercice.racinesValides.length === 0) return "aucune racine valide";
    return exercice.racinesCandidates.map((r) => `${label} = ${formatNombreTexte(r)} : ${exercice.racinesValides.includes(r) ? "valide" : "rejetée"}`).join(", ");
  }
  // Borne venant d'une racine de l'inéquation (toujours stricte) : exclue ; borne venant du domaine
  // de validité : incluse — même règle que le corrigé papier (exportEvaluation.ts).
  const { inf, sup } = exercice.intervalleValide;
  const gauche = inf === exercice.intervalleBrut.inf ? "]" : "[";
  const droite = sup === exercice.intervalleBrut.sup ? "[" : "]";
  return `${label} ∈ ${gauche}${formatNombreTexte(inf)} ; ${formatNombreTexte(sup)}${droite}`;
}

// ============================================================================
// Divers.
// ============================================================================

export function libelleFamilleEquationInequationSecondDegre(famille: FamilleEquationInequationSecondDegre): string {
  return CATALOGUE_FAMILLES.find((f) => f.id === famille)?.label ?? famille;
}
