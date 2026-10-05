/**
 * Couche présentation — "Sommet, foyer, p et directrice d'une parabole depuis l'équation
 * développée" (`src/generateurs/equationParaboleDeveloppee/`,
 * `src/moteur/sessionEquationParaboleDeveloppee.ts`). Consignes/textes d'aide/formatage LaTeX par
 * écran — dérivés uniquement des champs déjà présents sur le contrat, jamais recalculés
 * différemment côté vérification (`moteur/verificationEquationParaboleDeveloppee.ts`).
 *
 * `formatSommetLatex`/`formatFoyerLatex`/`LIBELLE_VARIANTE` réutilisés TELS QUELS depuis
 * `ui/formatEquationParabole.ts` (générateur symétrique) — génériques sur `Point`/`OrientationParabole`,
 * jamais dupliqués. Réutilise `formatSommeTermes` (`ui/formatEquation.ts`) pour le formatage signé
 * des termes, même principe que `formatEquationCercleDeveloppee.ts`. Aucun formatage décimal
 * nécessaire : tous les champs de ce contrat sont TOUJOURS des entiers par construction (voir
 * `equationParaboleDeveloppee.types.ts`), contrairement au générateur cercle équivalent.
 *
 * `texte`/`latex` — helpers locaux dupliqués pour construire un `FragmentConsigne[]`, même patron
 * que `formatEquationParabole.ts`/`formatCaracteristiquesDroite.ts` : la consigne de l'écran 1 et
 * l'aide 1 de l'écran 2 mélangent texte brut et LaTeX inline, adaptatifs selon l'orientation réelle
 * de l'instance (`promptgen52modificationscompletes.md`, parties C.1/D.2).
 */
import type { ExerciceEquationParaboleDeveloppee } from "../core/equationParaboleDeveloppee.types";
import { formatSommeTermes } from "./formatEquation";
import type { FragmentConsigne } from "./formatEquationDroite";
import { LIBELLE_VARIANTE, formatFoyerLatex, formatSommetLatex, libelleBoutonAide } from "./formatEquationParabole";

export { LIBELLE_VARIANTE, formatFoyerLatex, formatSommetLatex, libelleBoutonAide };
export type { FragmentConsigne };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

/** Consigne générale, affichée sur les 3 écrans (`promptgen52modificationscompletes.md`, partie B). */
export const CONSIGNE_GENERALE_CARACTERISTIQUES_PARABOLE = "Détermine toutes les caractéristiques de cette parabole";

/** Préfixe "a(" — jamais "1(" (coefficient 1 implicite). */
function prefixeCoefficient(a: number): string {
  return a === 1 ? "" : String(a);
}

/** "x - a" ou "x + |a|" — jamais "x - -2" ; "a=0" retourne la variable nue ("x"), jamais "x - 0". */
function formatBinome(variable: "x" | "y", valeur: number): string {
  if (valeur === 0) return variable;
  return valeur > 0 ? `${variable} - ${valeur}` : `${variable} + ${-valeur}`;
}

/** Binôme carré/multiplié — parenthèses UNIQUEMENT si le binôme est composé, jamais autour de la
 * variable nue, qui donnerait "(x)²"/"2p(x)" superflu (audit transversal,
 * `promptauditparenthesessuperflues.md`). */
function formatBinomeCarreLatex(variable: "x" | "y", valeur: number): string {
  const binome = formatBinome(variable, valeur);
  return valeur === 0 ? `${binome}^2` : `(${binome})^2`;
}

function formatBinomeGroupeLatex(variable: "x" | "y", valeur: number): string {
  const binome = formatBinome(variable, valeur);
  return valeur === 0 ? binome : `(${binome})`;
}

function variableCarree(exercice: ExerciceEquationParaboleDeveloppee): "x" | "y" {
  return exercice.variante === "vertical" ? "x" : "y";
}

function variableAutre(exercice: ExerciceEquationParaboleDeveloppee): "x" | "y" {
  return exercice.variante === "vertical" ? "y" : "x";
}

function sommetCarre(exercice: ExerciceEquationParaboleDeveloppee): number {
  return exercice.variante === "vertical" ? exercice.sommet.x : exercice.sommet.y;
}

function sommetAutre(exercice: ExerciceEquationParaboleDeveloppee): number {
  return exercice.variante === "vertical" ? exercice.sommet.y : exercice.sommet.x;
}

// ============================================================================
// Énoncé fixe — toujours affiché, sur les 3 écrans.
// ============================================================================

export function formatEquationDeveloppeeLatex(exercice: ExerciceEquationParaboleDeveloppee): string {
  const { a, bCarre, bAutre, c } = exercice;
  const carre = variableCarree(exercice);
  const autre = variableAutre(exercice);
  const gauche = formatSommeTermes([
    { valeur: a, suffixe: `${carre}^2` },
    { valeur: bCarre, suffixe: carre },
    { valeur: bAutre, suffixe: autre },
  ]);
  return `${gauche} = ${c}`;
}

// ============================================================================
// Écran 1 — orientation et factorisation du coefficient.
// ============================================================================

/** Consigne de l'écran 1 — ADAPTATIVE selon l'orientation réelle de l'instance, jamais figée sur
 * une seule variable (`promptgen52modificationscompletes.md`, partie C.1). */
export function segmentsConsigneRegroupement(exercice: ExerciceEquationParaboleDeveloppee): FragmentConsigne[] {
  const carre = variableCarree(exercice);
  const autre = variableAutre(exercice);
  return [
    texte(`Sépare les termes en ${carre} des autres termes et mets en évidence les coefficients de `),
    latex(`${carre}^2`),
    texte(` et de ${autre} dans chacun des membres de l'équation.`),
  ];
}

export const TEXTE_AIDE_REGROUPEMENT_NIVEAU1 = "La variable seule au carré détermine la direction de la concavité de la parabole.";

/** Réponse de référence de l'écran 1 — a([carré]²+(bCarre/a)[carré]) = -bAutre·[autre]+c. */
export function formatRegroupementLatex(exercice: ExerciceEquationParaboleDeveloppee): string {
  const { a, bCarre, bAutre, c } = exercice;
  const carre = variableCarree(exercice);
  const autre = variableAutre(exercice);
  const prefixe = prefixeCoefficient(a);
  const interieur = formatSommeTermes([
    { valeur: 1, suffixe: `${carre}^2` },
    { valeur: bCarre / a, suffixe: carre },
  ]);
  const droite = formatSommeTermes([
    { valeur: -bAutre, suffixe: autre },
    { valeur: c, suffixe: "" },
  ]);
  return `${prefixe}(${interieur}) = ${droite}`;
}

/** Aide niveau 2 — ADAPTATIVE, annonce la concavité déduite de la variable au carré
 * (`promptgen52modificationscompletes.md`, partie C.3). */
export function texteAideRegroupementNiveau2(exercice: ExerciceEquationParaboleDeveloppee): string {
  const carre = variableCarree(exercice);
  const concavite = exercice.variante === "vertical" ? "verticale" : "horizontale";
  return `C'est ${carre} qui est au carré, donc la parabole a une concavité ${concavite}`;
}

// ============================================================================
// Écran 2 — complétion du carré.
// ============================================================================

export const CONSIGNE_COMPLETION = "Complète le carré pour obtenir la forme (variable-sommet)² = 2p(autre variable-sommet).";

/** Aide 1 — ADAPTATIVE selon l'orientation réelle de l'instance (`promptgen52modificationscompletes.md`,
 * partie D.2) : réutilise désormais explicitement la lettre "p" (le coefficient linéaire déjà
 * factorisé à l'écran précédent) — remplace l'ancienne formulation générique "[variable]²+
 * (coefficient)[variable]" qui évitait "p" par prudence (`promptgen46etcorrectionstransversaleschapitre6.md`,
 * point B.4, alors motivée par un risque de conflit avec le "p" de l'écran 3 — ce nouveau prompt
 * demande explicitement cette formulation malgré ce risque, la portée du point B.4 étant limitée à
 * l'ancienne formulation qu'il corrigeait). */
export function segmentsAideCompletionNiveau1(exercice: ExerciceEquationParaboleDeveloppee): FragmentConsigne[] {
  const carre = variableCarree(exercice);
  return [
    texte("Dans la parenthèse "),
    latex(`${carre}^2+p${carre}`),
    texte(" (p étant le coefficient linéaire déjà factorisé à l'écran précédent), ajoute et retranche "),
    latex("(p/2)^2"),
    texte(" pour obtenir "),
    latex(`(${carre}+p/2)^2`),
    texte(" — attention à multiplier ce terme par le coefficient commun avant de le déplacer de l'autre côté."),
  ];
}

/** Forme de référence — TOUJOURS coefficient-free (a=1 implicite), conformément au prompt ; la
 * vérification accepte aussi bien cette forme que sa mise à l'échelle par `a` (voir l'en-tête de
 * `verificationEquationParaboleDeveloppee.ts`). */
export function formatCompletionLatex(exercice: ExerciceEquationParaboleDeveloppee): string {
  const carre = variableCarree(exercice);
  const autre = variableAutre(exercice);
  const carreLatex = formatBinomeCarreLatex(carre, sommetCarre(exercice));
  const groupeAutre = formatBinomeGroupeLatex(autre, sommetAutre(exercice));
  return `${carreLatex} = ${2 * exercice.p}${groupeAutre}`;
}

/** Aide niveau 2 — coefficient du terme linéaire (2p) déjà isolé, reste à finaliser la forme. */
export function texteAideCompletionNiveau2(exercice: ExerciceEquationParaboleDeveloppee): string {
  return `2p = ${2 * exercice.p}`;
}

// ============================================================================
// Écran 3 — caractéristiques finales.
// ============================================================================

export const CONSIGNE_CARACTERISTIQUES = "Détermine le sommet S, le foyer F, le paramètre p (signé) et l'équation de la droite directrice.";

/** Aide 1 — formule de F, ADAPTATIVE selon l'orientation réelle de l'instance
 * (`promptgen52modificationscompletes.md`, partie E.3) — remplace l'ancien texte générique qui
 * donnait les 2 orientations à la fois plus un avertissement de signe. */
export function formatAideCaracteristiquesNiveau1Latex(exercice: ExerciceEquationParaboleDeveloppee): string {
  return exercice.variante === "vertical" ? "F(x_S \\; ; \\; y_S+p/2)" : "F(x_S+p/2 \\; ; \\; y_S)";
}

/** Aide 2 — formule de la directrice, ADAPTATIVE selon l'orientation réelle de l'instance
 * (`promptgen52modificationscompletes.md`, partie E.3) — remplace l'ancienne valeur numérique de p
 * (déjà validée séparément par son propre champ, `diagnostiquerP`) : notation `\equiv` pour nommer
 * la droite, même convention que le reste du chapitre 6 (groupe droites/cercles). */
export function formatAideCaracteristiquesNiveau2Latex(exercice: ExerciceEquationParaboleDeveloppee): string {
  return exercice.variante === "vertical" ? "d \\equiv y=y_S-p/2" : "d \\equiv x=x_S-p/2";
}

/** Droite horizontale `y=...` (axe vertical) ou verticale `x=...` (axe horizontal) — gère les 2
 * orientations UNIFORMÉMENT (même principe que "Lecture graphique — équation d'une droite"). */
export function formatDirectriceLatex(exercice: ExerciceEquationParaboleDeveloppee): string {
  const variable = variableAutre(exercice);
  return `${variable} = ${exercice.directrice}`;
}

export const PLACEHOLDER_COORDONNEE = "ex : 3";
export const PLACEHOLDER_P = "ex : -8";
export const PLACEHOLDER_DIRECTRICE_VERTICAL = "ex : y=-6";
export const PLACEHOLDER_DIRECTRICE_HORIZONTAL = "ex : x=-5";
