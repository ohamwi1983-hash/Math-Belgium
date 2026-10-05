/**
 * Couche présentation — "Équations/inéquations du second degré en contexte" (position 57). Ne porte
 * que les écrans 0a/0b (`poserSysteme`/`eliminerSysteme`, `voieSysteme` uniquement) et 5-8
 * (`poserEquationInequation`/`resoudre`/`validation`/`interpretation`), propres à ce générateur —
 * les écrans 1-4 réutilisent directement les fonctions de `ui/formatOptimisation.ts`
 * (`consigneContrainteEtGrandeur`/`consigneSysteme`/`consigneDomaine`, etc., via `exercice.base`) —
 * voir CLAUDE.md pour la justification complète de cette réutilisation. Réutilise `formatFonctionDeveloppeeLatex`/
 * `formatDomaineLatex` (`ui/formatOptimisation.ts`, ui→ui) plutôt que de dupliquer le formatage d'un
 * polynôme développé.
 */
import type { ExerciceEquationInequationSecondDegre, FamilleEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import { formatDomaineLatex, formatFonctionDeveloppeeLatex } from "./formatOptimisation";
import { CATALOGUE_FAMILLES } from "../generateurs/equationInequationSecondDegre";

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
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
  return `${label} \\in \\left[ ${formatNombre(inf)} \\, ; \\, ${formatNombre(sup)} \\right]`;
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
// Écrans "poserSysteme"/"eliminerSysteme" — `voieSysteme` uniquement (famille `achatGroupe`).
// ============================================================================

export function consignePoserSysteme(): string {
  return "Traduis la situation réelle et la situation hypothétique du contexte sous la forme de 2 équations à 2 inconnues (x et y).";
}

export function consigneEliminerSysteme(): string {
  return "Soustrais les 2 équations du système pour éliminer le terme x·y, et donne la relation linéaire obtenue.";
}

/** État actuel — écran "eliminerSysteme" : le système confirmé à l'écran précédent
 * ("poserSysteme") — audit checklist chapitre 1, point 1 : tout écran ≥2 doit montrer un bloc "état
 * actuel" (seul écran qui en manquait). Réutilise le même format que `texteAidePoserSystemeNiveau2`
 * (jamais dupliqué). */
export function formatSystemeConfirmeLatex(exercice: ExerciceEquationInequationSecondDegre): string {
  if (!exercice.systeme) return "";
  const { M, a, b } = exercice.systeme;
  return gathered([`x \\cdot y = ${M}`, `(x+${a})(y-${b}) = ${M}`]);
}

export function texteAidePoserSystemeNiveau1(): string {
  return "Rappel : la situation réelle donne un produit x·y égal au montant total. La situation hypothétique modifie x et y mais donne le même montant.";
}

/** LaTeX pur — l'appelant préfixe son propre texte avant de rendre via `<Katex>`. */
export function texteAidePoserSystemeNiveau2(exercice: ExerciceEquationInequationSecondDegre): string {
  if (!exercice.systeme) return "";
  const { M, a, b } = exercice.systeme;
  return gathered([`x \\cdot y = ${M}`, `(x+${a})(y-${b}) = ${M}`]);
}

export function texteAideEliminerSystemeNiveau1(): string {
  return "Rappel : développe la seconde équation, puis soustrais-la à la première — le terme x·y s'annule.";
}

/** LaTeX pur — l'appelant préfixe son propre texte avant de rendre via `<Katex>`. */
export function texteAideEliminerSystemeNiveau2(exercice: ExerciceEquationInequationSecondDegre): string {
  if (!exercice.systeme) return "";
  const { a, b } = exercice.systeme;
  return `${a}y - ${b}x = ${a * b}`;
}

// ============================================================================
// Consignes par écran.
// ============================================================================

export function consignePoserEquationInequation(exercice: ExerciceEquationInequationSecondDegre): string {
  const { nomGrandeur, uniteGrandeur } = exercice.base.contexte;
  const k = formatNombre(exercice.k);
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
  return exercice.variante === "equation"
    ? "Chaque racine appartient-elle au domaine de validité (établi à l'écran 3) ? Classe chacune d'elles."
    : "Détermine l'intervalle-solution valide, en tenant compte du domaine de validité (établi à l'écran 3) — arrondi au centième accepté si besoin.";
}

export function consigneInterpretation(): string {
  return "Choisis la phrase de conclusion correcte.";
}

// ============================================================================
// Aides.
// ============================================================================

export function texteAidePoserEquationInequationNiveau1(): string {
  return "Rappel : reprends l'expression développée de la grandeur (établie à l'écran 2), et pose l'égalité/l'inégalité avec le seuil donné.";
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
  return "Rappel : seules les valeurs comprises dans le domaine de validité (établi à l'écran 3) ont un sens dans ce contexte.";
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
    return exercice.racinesCandidates.map((r) => `${label} = ${formatNombre(r)}`).join(" ; ");
  }
  return `${label} ∈ ]${formatNombre(exercice.intervalleBrut.inf)} ; ${formatNombre(exercice.intervalleBrut.sup)}[`;
}

export function formatValidationAttendueTexte(exercice: ExerciceEquationInequationSecondDegre): string {
  const label = exercice.base.contexte.labelVariable;
  if (exercice.variante === "equation") {
    if (exercice.racinesValides.length === 0) return "aucune racine valide";
    return exercice.racinesCandidates.map((r) => `${label} = ${formatNombre(r)} : ${exercice.racinesValides.includes(r) ? "valide" : "rejetée"}`).join(", ");
  }
  return `${label} ∈ [${formatNombre(exercice.intervalleValide.inf)} ; ${formatNombre(exercice.intervalleValide.sup)}]`;
}

// ============================================================================
// Divers.
// ============================================================================

export function libelleBoutonAide(niveau: number, max: number): string {
  if (niveau >= max) return "Aide utilisée";
  return niveau === 0 ? "Aide" : "Aide supplémentaire";
}

export function libelleFamilleEquationInequationSecondDegre(famille: FamilleEquationInequationSecondDegre): string {
  return CATALOGUE_FAMILLES.find((f) => f.id === famille)?.label ?? famille;
}
