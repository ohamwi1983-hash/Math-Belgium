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
import { LIBELLE_VARIANTE, formatFoyerLatex, formatSommetLatex } from "./formatEquationParabole";

export { LIBELLE_VARIANTE, formatFoyerLatex, formatSommetLatex };
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

/** Forme « … = 0 » du cours (`y^2-6y-4x+5=0`), jamais « … = c » : la constante fait partie des
 * termes à passer de l'autre côté à l'écran 1. */
export function formatEquationDeveloppeeLatex(exercice: ExerciceEquationParaboleDeveloppee): string {
  const { a, bCarre, bAutre, c } = exercice;
  const carre = variableCarree(exercice);
  const autre = variableAutre(exercice);
  const gauche = formatSommeTermes([
    { valeur: a, suffixe: `${carre}^2` },
    { valeur: bCarre, suffixe: carre },
    { valeur: bAutre, suffixe: autre },
    { valeur: -c, suffixe: "" },
  ]);
  return `${gauche} = 0`;
}

// ============================================================================
// Écran 1 — orientation et factorisation du coefficient.
// ============================================================================

/** Consigne de l'écran 1 — ADAPTATIVE selon l'orientation réelle de l'instance, jamais figée sur
 * une seule variable (`promptgen52modificationscompletes.md`, partie C.1) : l'étape « isoler le
 * carré » du cours (`y^2-6y = 4x-5`). La mise en évidence du coefficient de la variable au carré
 * n'est proposée que s'il vaut autre chose que 1 — jamais celle du coefficient de l'autre variable,
 * que ni la réponse attendue ni le cours ne font (audit chapitre 7). */
export function segmentsConsigneRegroupement(exercice: ExerciceEquationParaboleDeveloppee): FragmentConsigne[] {
  const carre = variableCarree(exercice);
  const fragments: FragmentConsigne[] = [
    texte("Isole dans un membre les termes en "),
    latex(carre),
    texte(" ("),
    latex(`${carre}^2`),
    texte(` et ${carre}), et passe tous les autres termes dans l'autre membre.`),
  ];
  if (exercice.a !== 1) {
    fragments.push(texte(" Mets ensuite en évidence le coefficient "), latex(String(exercice.a)), texte(" de "), latex(`${carre}^2`), texte("."));
  }
  return fragments;
}

/** Aide 1 — repérer la variable au carré, la seule dont les termes restent dans le premier membre. */
export const TEXTE_AIDE_REGROUPEMENT_NIVEAU1 =
  "Une seule des deux variables est au carré : garde tous ses termes (son carré et son terme du premier degré) dans un membre, et passe le reste (l'autre variable et la constante) dans l'autre membre, en changeant leur signe.";

/** Réponse de référence de l'écran 1 — `a([carré]²+(bCarre/a)[carré]) = -bAutre·[autre]+c`, sans
 * parenthèses superflues : `x^2-2x = 16y+31` quand a=1, `2x^2 = …` quand le terme du premier degré
 * est absent (jamais `(x^2-2x)`, `(x^2)` ni `2(x^2)`). */
export function formatRegroupementLatex(exercice: ExerciceEquationParaboleDeveloppee): string {
  const { a, bCarre, bAutre, c } = exercice;
  const carre = variableCarree(exercice);
  const autre = variableAutre(exercice);
  const droite = formatSommeTermes([
    { valeur: -bAutre, suffixe: autre },
    { valeur: c, suffixe: "" },
  ]);
  if (bCarre === 0) return `${prefixeCoefficient(a)}${carre}^2 = ${droite}`;
  const interieur = formatSommeTermes([
    { valeur: 1, suffixe: `${carre}^2` },
    { valeur: bCarre / a, suffixe: carre },
  ]);
  return a === 1 ? `${interieur} = ${droite}` : `${a}(${interieur}) = ${droite}`;
}

/** Aide niveau 2 — ADAPTATIVE : la variable au carré, l'axe de la parabole qui s'en déduit
 * (vocabulaire du cours : axe vertical/horizontal, jamais « concavité ») et les termes à déplacer. */
export function texteAideRegroupementNiveau2(exercice: ExerciceEquationParaboleDeveloppee): string {
  const carre = variableCarree(exercice);
  const autre = variableAutre(exercice);
  const axe = exercice.variante === "vertical" ? "vertical" : "horizontal";
  return `C'est ${carre} qui est au carré, donc la parabole a un axe ${axe} : garde ${carre}² et ${carre} dans le premier membre, passe le terme en ${autre} et la constante dans le second.`;
}

// ============================================================================
// Écran 2 — complétion du carré.
// ============================================================================

/** Consigne de l'écran 2 — ADAPTATIVE selon l'orientation (forme du tableau du cours). */
export function segmentsConsigneCompletion(exercice: ExerciceEquationParaboleDeveloppee): FragmentConsigne[] {
  const forme = exercice.variante === "vertical" ? "(x-x_S)^2=2p(y-y_S)" : "(y-y_S)^2=2p(x-x_S)";
  return [texte("Complète le carré pour obtenir la forme "), latex(forme), texte(".")];
}

/** Aide 1 — ADAPTATIVE selon l'orientation réelle de l'instance (`promptgen52modificationscompletes.md`,
 * partie D.2). Le coefficient du premier degré est noté b, JAMAIS p : sur ce même écran, l'aide 2
 * donne « 2p = … », où p est le paramètre de la parabole (audit chapitre 7 — deux « p » de sens
 * différent sur le même écran). La remarque sur le coefficient commun n'apparaît que si a ≠ 1. */
export function segmentsAideCompletionNiveau1(exercice: ExerciceEquationParaboleDeveloppee): FragmentConsigne[] {
  const carre = variableCarree(exercice);
  const fragments: FragmentConsigne[] = [
    texte("Écris "),
    latex(`${carre}^2+b${carre}`),
    texte(` (b : le coefficient de ${carre}) sous la forme `),
    latex(`(${carre}+\\tfrac{b}{2})^2-(\\tfrac{b}{2})^2`),
    texte(", puis passe la constante dans l'autre membre et mets en évidence le coefficient de l'autre variable."),
  ];
  if (exercice.a !== 1) {
    fragments.push(texte(` Attention : la parenthèse est multipliée par ${exercice.a} — multiplie aussi `), latex("(\\tfrac{b}{2})^2"), texte(" par ce coefficient."));
  }
  return fragments;
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

/** Écrans 1-2 — équation juste (équivalente à celle de départ) mais forme demandée pas encore
 * atteinte : jamais un simple « Incorrect », qui ferait croire à une erreur de calcul (ex. l'étape
 * intermédiaire du cours `(y-3)^2-9 = 4x-5`). */
export function messageFormeNonAtteinte(tentativesUtilisees: number, tentativesMax: number): string {
  return `Ton équation est juste, mais elle n'a pas encore la forme demandée — tentative ${tentativesUtilisees}/${tentativesMax}, poursuis la transformation.`;
}

/** Placeholders HORS de l'espace des tirages (`generateurs/equationParaboleDeveloppee`) — jamais
 * une réponse possible : S et F dans [−7 ; 7], p toujours pair, directrice dans [−7 ; 7], coefficient
 * intérieur du regroupement toujours pair, 2p toujours multiple de 4. */
export const PLACEHOLDER_COORDONNEE = "ex : 8";
export const PLACEHOLDER_P = "ex : 5";

export function placeholderDirectrice(exercice: ExerciceEquationParaboleDeveloppee): string {
  return `ex : ${variableAutre(exercice)}=-9`;
}

export function placeholderRegroupement(exercice: ExerciceEquationParaboleDeveloppee): string {
  const carre = variableCarree(exercice);
  return `ex : 2(${carre}^2-3${carre})=32${variableAutre(exercice)}+62`;
}

export function placeholderCompletion(exercice: ExerciceEquationParaboleDeveloppee): string {
  return `ex : (${variableCarree(exercice)}-1)^2=6(${variableAutre(exercice)}+2)`;
}
