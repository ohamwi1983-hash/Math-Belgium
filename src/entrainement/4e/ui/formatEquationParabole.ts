/**
 * Couche présentation — "Équation d'une parabole depuis un graphe"
 * (`src/generateurs/equationParabole/`, `src/moteur/sessionEquationParabole.ts`). Consignes/textes
 * d'aide/formatage LaTeX — dérivés uniquement des champs déjà présents sur le contrat, jamais
 * recalculés différemment côté vérification (`moteur/verificationEquationParabole.ts`).
 *
 * `formatBinome` DUPLIQUÉE (jamais importée) depuis `ui/formatEquationCercleDeveloppee.ts` — même
 * petit helper de signe répliqué entre générateurs indépendants, convention transversale du projet.
 *
 * `texte`/`latex` — helpers locaux dupliqués pour construire un `FragmentConsigne[]`, même patron
 * que `formatCaracteristiquesDroite.ts`/`formatEquationCercleDeveloppee.ts` : l'aide 1 de l'écran
 * "Équation" mélange texte brut et LaTeX inline, adaptative selon l'orientation réelle de
 * l'instance (`promptgen51modificationscompletes.md`, partie C.2).
 */
import type { ExerciceEquationParabole, OrientationParabole } from "../core/equationParabole.types";
import type { Point } from "../core/vecteur.types";
import type { FragmentConsigne } from "./formatEquationDroite";


function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

/** Consigne générale, affichée sur les 2 écrans (Sommet et foyer, Équation) —
 * `promptgen51modificationscompletes.md`, partie B.0. */
export const CONSIGNE_GENERALE_EQUATION_PARABOLE = "Détermine l'équation de la parabole suivante";

export const LIBELLE_VARIANTE: Record<OrientationParabole, string> = {
  vertical: "Axe vertical",
  horizontal: "Axe horizontal",
};

/** "x - a" ou "x + |a|" — jamais "x - -2" ; "a=0" retourne la variable nue ("x"), jamais "x - 0". */
function formatBinome(variable: "x" | "y", valeur: number): string {
  if (valeur === 0) return variable;
  return valeur > 0 ? `${variable} - ${valeur}` : `${variable} + ${-valeur}`;
}

/** Binôme carré/multiplié — parenthèses UNIQUEMENT si le binôme est composé ("x - a"), jamais
 * autour de la variable nue ("x"), qui donnerait "(x)²"/"2p(x)" superflu (audit transversal,
 * `promptauditparenthesessuperflues.md`). */
function formatBinomeCarreLatex(variable: "x" | "y", valeur: number): string {
  const binome = formatBinome(variable, valeur);
  return valeur === 0 ? `${binome}^2` : `(${binome})^2`;
}

function formatBinomeGroupeLatex(variable: "x" | "y", valeur: number): string {
  const binome = formatBinome(variable, valeur);
  return valeur === 0 ? binome : `(${binome})`;
}

export function formatSommetLatex(sommet: Point): string {
  return `(${sommet.x} \\; ; \\; ${sommet.y})`;
}

export function formatFoyerLatex(foyer: Point): string {
  return `(${foyer.x} \\; ; \\; ${foyer.y})`;
}

/** `(x-x_S)^2=2p(y-y_S)` (vertical) ou `(y-y_S)^2=2p(x-x_S)` (horizontal) — coefficient TOUJOURS
 * `2p` (jamais `p` seul), conformément à la définition du paramètre `p` (`p=2(y_F-y_S)` ou
 * `p=2(x_F-x_S)`). */
export function formatEquationAttendueLatex(exercice: ExerciceEquationParabole): string {
  const { sommet, p } = exercice;
  const deuxP = 2 * p;
  return exercice.variante === "vertical"
    ? `${formatBinomeCarreLatex("x", sommet.x)} = ${deuxP}${formatBinomeGroupeLatex("y", sommet.y)}`
    : `${formatBinomeCarreLatex("y", sommet.y)} = ${deuxP}${formatBinomeGroupeLatex("x", sommet.x)}`;
}

export const CONSIGNE_SOMMET_FOYER = "Lis les coordonnées du sommet S et du foyer F sur le graphe.";

export const TEXTE_AIDE_SOMMET_FOYER_NIVEAU1 = "Repère précisément le sommet S (le point le plus \"resserré\" de la courbe) et le foyer F, tous deux à coordonnées entières.";

/** Aide niveau 2 — ne révèle JAMAIS les coordonnées de S en texte (`promptgen51modificationscompletes.md`,
 * partie B.3) : le point S est marqué visuellement sur le graphe (`EquationParaboleGraph`,
 * `afficherSommet={niveauAide >= 2}`), ce texte se contente de l'annoncer. */
export const TEXTE_AIDE_SOMMET_FOYER_NIVEAU2 = "Le sommet S est désormais localisé sur la parabole.";

export const CONSIGNE_EQUATION = "Écris l'équation de cette parabole.";

/** Aide 1 — ADAPTATIVE selon l'orientation réelle de l'instance, jamais figée sur une seule forme
 * (`promptgen51modificationscompletes.md`, partie C.2). Le vecteur rouge illustratif (directrice→
 * foyer) qui accompagne ce texte est affiché par `EquationParaboleGraph`
 * (`afficherVecteurP={niveauAide >= 1}`), pas construit ici — ce module ne connaît que le texte. */
export function segmentsAideEquationNiveau1(exercice: ExerciceEquationParabole): FragmentConsigne[] {
  const equation = exercice.variante === "vertical" ? "(x-x_S)^2=2p(y-y_S)" : "(y-y_S)^2=2p(x-x_S)";
  return [texte("Rappel : l'équation de la parabole est "), latex(equation), texte(", où "), latex("p=\\vec{\\text{dist}}(d,F)")];
}

/** Aide niveau 2 — p déjà calculé (valeur signée), reste à assembler l'équation dans la bonne
 * forme. */
export function formatAideEquationNiveau2Latex(exercice: ExerciceEquationParabole): string {
  return `p = ${exercice.p}`;
}

export const PLACEHOLDER_COORDONNEE = "ex : 3";
export const PLACEHOLDER_EQUATION_VERTICAL = "ex : (x-1)^2=16(y+2)";
export const PLACEHOLDER_EQUATION_HORIZONTAL = "ex : (y-1)^2=16(x+2)";
