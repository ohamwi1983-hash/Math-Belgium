import type { ExerciceEquationCercle } from "../core/equationCercle.types";
import type { StatutVerification } from "./statutVerification";

/**
 * Évaluateur générique d'expressions algébriques à DEUX variables (x, y), dédié à la vérification
 * de l'équation d'un cercle — jamais une extension d'`expressionAlgebrique.ts` (mono-variable x,
 * extraction de coefficients polynomiaux, réservé aux exercices du second degré) ni
 * d'`expressionGenerale.ts` (mono-variable x, fonctions sqrt/abs/trig) : les deux évaluateurs déjà
 * en place dans le projet sont structurellement mono-variable, les étendre à une seconde variable
 * risquerait une régression sur leurs nombreux consommateurs respectifs pour un besoin qui ne leur
 * appartient pas. Un troisième évaluateur, minimal (seulement +,-,*,/,^, parenthèses, exposants
 * unicode ²/³, multiplication implicite — aucune fonction n'est nécessaire pour une équation de
 * cercle), est donc écrit ici, dédié à ce seul générateur — même principe de duplication assumée
 * qu'ailleurs dans le projet pour un besoin structurellement différent.
 *
 * Vérification par ÉCHANTILLONNAGE NUMÉRIQUE, pas par développement symbolique — généralisation à
 * une équation quadratique à 2 variables du même principe de proportionnalité déjà utilisé pour les
 * équations de droites (`statutTripletProportionnel`, `verificationDroite.ts`, cas linéaire à 2
 * variables) : deux polynômes du 2nd degré à 2 variables décrivent la MÊME courbe (le même cercle)
 * si et seulement si l'un est un multiple scalaire non nul de l'autre — jamais une comparaison de
 * coefficients développés à la main, jamais de dépendance à une bibliothèque de calcul formel
 * externe (aucune n'est présente dans ce projet, confirmé par lecture de `package.json` avant
 * d'écrire ce module). La justification mathématique : par le théorème de Bézout, deux coniques
 * (courbes planes de degré 2) DISTINCTES se croisent en au plus 4 points — un accord de rapport
 * cohérent sur au moins 6 points choisis à des décalages non ronds (jamais alignés par coïncidence
 * sur le centre/rayon entier de l'exercice) constitue donc une preuve quasi certaine que les deux
 * équations décrivent la même courbe à un facteur scalaire non nul près, c'est-à-dire
 * algébriquement équivalentes — cohérent avec la convention transversale du projet d'accepter
 * "n'importe quelle formulation algébriquement équivalente" (reformulation développée, réordonnée,
 * mise à l'échelle par un facteur non nul, y compris négatif).
 */

type TypeJeton = "NOMBRE" | "X" | "Y" | "PLUS" | "MOINS" | "FOIS" | "DIVISE" | "PUISSANCE" | "PAR_OUVRANTE" | "PAR_FERMANTE";

interface Jeton {
  type: TypeJeton;
  valeur?: number;
}

function tokeniser(expression: string): Jeton[] {
  const jetons: Jeton[] = [];
  let i = 0;
  while (i < expression.length) {
    const c = expression[i];
    if (c === " " || c === "\t") {
      i++;
      continue;
    }
    // "," accepté comme "." dans un nombre — virgule décimale française, même convention que le
    // reste du projet.
    if ((c >= "0" && c <= "9") || c === "." || c === ",") {
      let j = i;
      while (j < expression.length && ((expression[j] >= "0" && expression[j] <= "9") || expression[j] === "." || expression[j] === ",")) j++;
      jetons.push({ type: "NOMBRE", valeur: Number(expression.slice(i, j).replace(",", ".")) });
      i = j;
      continue;
    }
    if (c === "²" || c === "³") {
      jetons.push({ type: "PUISSANCE" });
      jetons.push({ type: "NOMBRE", valeur: c === "²" ? 2 : 3 });
      i++;
      continue;
    }
    if (c === "x" || c === "X") {
      jetons.push({ type: "X" });
      i++;
      continue;
    }
    if (c === "y" || c === "Y") {
      jetons.push({ type: "Y" });
      i++;
      continue;
    }
    const correspondance: Record<string, TypeJeton> = {
      "+": "PLUS",
      "-": "MOINS",
      "*": "FOIS",
      "·": "FOIS",
      "×": "FOIS",
      "/": "DIVISE",
      "^": "PUISSANCE",
      "(": "PAR_OUVRANTE",
      ")": "PAR_FERMANTE",
    };
    if (c in correspondance) {
      jetons.push({ type: correspondance[c] });
      i++;
      continue;
    }
    throw new Error(`Caractère inattendu dans l'expression : "${c}"`);
  }
  return jetons;
}

type NoeudXY =
  | { type: "nombre"; valeur: number }
  | { type: "x" }
  | { type: "y" }
  | { type: "negation"; operande: NoeudXY }
  | { type: "somme"; operateur: "+" | "-"; gauche: NoeudXY; droite: NoeudXY }
  | { type: "produit"; operateur: "*" | "/"; gauche: NoeudXY; droite: NoeudXY }
  | { type: "puissance"; base: NoeudXY; exposant: NoeudXY }
  | { type: "groupe"; interieur: NoeudXY };

class ParseurXY {
  private position = 0;
  private readonly jetons: Jeton[];

  constructor(jetons: Jeton[]) {
    this.jetons = jetons;
  }

  analyser(): NoeudXY {
    const resultat = this.expression();
    if (this.position < this.jetons.length) throw new Error("Expression mal formée");
    return resultat;
  }

  private regarder(): Jeton | undefined {
    return this.jetons[this.position];
  }

  private consommer(): Jeton {
    const jeton = this.jetons[this.position];
    if (!jeton) throw new Error("Expression incomplète");
    this.position++;
    return jeton;
  }

  private expression(): NoeudXY {
    let gauche = this.terme();
    while (this.regarder()?.type === "PLUS" || this.regarder()?.type === "MOINS") {
      const op = this.consommer().type;
      const droite = this.terme();
      gauche = { type: "somme", operateur: op === "PLUS" ? "+" : "-", gauche, droite };
    }
    return gauche;
  }

  private commenceUnFacteur(): boolean {
    const jeton = this.regarder();
    return !!jeton && (jeton.type === "NOMBRE" || jeton.type === "X" || jeton.type === "Y" || jeton.type === "PAR_OUVRANTE");
  }

  private terme(): NoeudXY {
    let gauche = this.unaire();
    for (;;) {
      const jeton = this.regarder();
      if (jeton?.type === "FOIS" || jeton?.type === "DIVISE") {
        const op = this.consommer().type;
        const droite = this.unaire();
        gauche = { type: "produit", operateur: op === "FOIS" ? "*" : "/", gauche, droite };
      } else if (this.commenceUnFacteur()) {
        const droite = this.unaire();
        gauche = { type: "produit", operateur: "*", gauche, droite };
      } else {
        break;
      }
    }
    return gauche;
  }

  private unaire(): NoeudXY {
    if (this.regarder()?.type === "MOINS") {
      this.consommer();
      return { type: "negation", operande: this.unaire() };
    }
    if (this.regarder()?.type === "PLUS") {
      this.consommer();
      return this.unaire();
    }
    return this.puissance();
  }

  private puissance(): NoeudXY {
    const base = this.primaire();
    if (this.regarder()?.type === "PUISSANCE") {
      this.consommer();
      return { type: "puissance", base, exposant: this.unaire() };
    }
    return base;
  }

  private primaire(): NoeudXY {
    const jeton = this.consommer();
    if (jeton.type === "NOMBRE") return { type: "nombre", valeur: jeton.valeur as number };
    if (jeton.type === "X") return { type: "x" };
    if (jeton.type === "Y") return { type: "y" };
    if (jeton.type === "PAR_OUVRANTE") {
      const interieur = this.expression();
      if (this.regarder()?.type !== "PAR_FERMANTE") throw new Error("Parenthèse fermante manquante");
      this.consommer();
      return { type: "groupe", interieur };
    }
    throw new Error("Expression mal formée");
  }
}

function evaluerXY(noeud: NoeudXY, x: number, y: number): number {
  switch (noeud.type) {
    case "nombre":
      return noeud.valeur;
    case "x":
      return x;
    case "y":
      return y;
    case "negation":
      return -evaluerXY(noeud.operande, x, y);
    case "somme":
      return noeud.operateur === "+" ? evaluerXY(noeud.gauche, x, y) + evaluerXY(noeud.droite, x, y) : evaluerXY(noeud.gauche, x, y) - evaluerXY(noeud.droite, x, y);
    case "produit":
      return noeud.operateur === "*" ? evaluerXY(noeud.gauche, x, y) * evaluerXY(noeud.droite, x, y) : evaluerXY(noeud.gauche, x, y) / evaluerXY(noeud.droite, x, y);
    case "puissance":
      return Math.pow(evaluerXY(noeud.base, x, y), evaluerXY(noeud.exposant, x, y));
    case "groupe":
      return evaluerXY(noeud.interieur, x, y);
  }
}

function parserExpressionXY(texte: string): NoeudXY | null {
  try {
    return new ParseurXY(tokeniser(texte)).analyser();
  } catch {
    return null;
  }
}

export interface EquationXYAnalysee {
  gauche: NoeudXY;
  droite: NoeudXY;
}

/** Sépare sur le "=" de l'équation — jamais 0 ni plusieurs occurrences, sinon `null` (structure invalide). */
function parserEquationXY(texte: string): EquationXYAnalysee | null {
  const morceaux = texte.split("=");
  if (morceaux.length !== 2) return null;
  const gauche = parserExpressionXY(morceaux[0] ?? "");
  const droite = parserExpressionXY(morceaux[1] ?? "");
  if (!gauche || !droite) return null;
  return { gauche, droite };
}

export { parserEquationXY, parserExpressionXY };
export type { NoeudXY };

// ============================================================================
// Analyse STRUCTURELLE (par inspection de l'arbre `NoeudXY`, jamais une simple équivalence
// numérique) — introduite pour "Centre et rayon d'un cercle depuis l'équation développée" et
// "Sommet, foyer, p et directrice d'une parabole depuis l'équation développée"
// (`promptcorrectiongen50gen52verificationstructurelle.md`) : leurs écrans "regroupement" et
// "complétion du carré" attendaient jusqu'ici une forme précise mais n'étaient vérifiés que par
// équivalence algébrique globale à l'équation de départ — un élève recopiant cette dernière telle
// quelle était donc accepté à tort (l'équation de départ est trivialement équivalente à
// elle-même). Ces primitives ajoutent un GARDE STRUCTUREL, appliqué EN PLUS de
// `diagnostiquerEquivalenceQuadratiqueXY` (jamais à sa place — l'équivalence algébrique reste la
// seule source de vérité sur la justesse numérique) : même principe que
// `estUnProduitAvecXExplicite`/`extraireRacinesDuProduit` (`expressionAlgebrique.ts`, exercice 1),
// qui exigent une forme produit plutôt qu'une simple somme équivalente — ici, une forme "somme de
// groupes parenthésés" (regroupement) ou "somme de carrés parfaits explicites" (complétion) plutôt
// qu'une forme développée équivalente mais non transformée. Exportées ici (moteur→moteur, jamais
// dupliquées) car partagées à l'identique par `verificationEquationCercleDeveloppee.ts` et
// `verificationEquationParaboleDeveloppee.ts` — les deux générateurs manipulent la MÊME grammaire
// `NoeudXY`, seule la composition (2 groupes symétriques pour le cercle, 1 seul groupe pour la
// parabole) diffère, et reste propre à chaque fichier consommateur.
//
// Un point de conception délibéré : la présence de PARENTHÈSES explicites fait foi comme frontière
// de terme — `flattenAdditif` ne descend JAMAIS à l'intérieur d'un noeud "groupe" pour continuer à
// l'éclater, contrairement à un simple aplatissement algébrique qui ignorerait la parenthésation.
// C'est précisément ce qui permet de distinguer "k(x²-2x)+k(y²+4y)" (2 termes de haut niveau, la
// structure attendue) de sa forme développée "kx²+ky²-2kx+4ky" (4 termes de haut niveau, aucune
// parenthèse) — les deux sont algébriquement identiques, mais seule la première a la forme
// structurelle demandée.
// ============================================================================

/** Éclate une chaîne additive (+/-) en ses termes de plus haut niveau — un noeud "groupe" (donc
 * explicitement parenthésé) est TOUJOURS traité comme un terme opaque, jamais éclaté plus loin :
 * les parenthèses font foi comme frontière structurelle (voir en-tête de section). `signe` reflète
 * le signe cumulé porté par les "-"/négations traversés jusqu'à ce terme. */
export function flattenAdditif(noeud: NoeudXY): { signe: 1 | -1; terme: NoeudXY }[] {
  if (noeud.type === "somme") {
    const gauche = flattenAdditif(noeud.gauche);
    const droite = flattenAdditif(noeud.droite).map((t) => (noeud.operateur === "-" ? { ...t, signe: (-t.signe) as 1 | -1 } : t));
    return [...gauche, ...droite];
  }
  if (noeud.type === "negation") {
    return flattenAdditif(noeud.operande).map((t) => ({ ...t, signe: (-t.signe) as 1 | -1 }));
  }
  return [{ signe: 1, terme: noeud }];
}

/** Vrai si `variable` (x ou y) apparaît N'IMPORTE OÙ dans l'arbre — recherche récursive complète,
 * jamais limitée au premier niveau. */
function contientVariableUsage(noeud: NoeudXY, variable: "x" | "y"): boolean {
  switch (noeud.type) {
    case "x":
      return variable === "x";
    case "y":
      return variable === "y";
    case "nombre":
      return false;
    case "negation":
      return contientVariableUsage(noeud.operande, variable);
    case "somme":
    case "produit":
      return contientVariableUsage(noeud.gauche, variable) || contientVariableUsage(noeud.droite, variable);
    case "puissance":
      return contientVariableUsage(noeud.base, variable) || contientVariableUsage(noeud.exposant, variable);
    case "groupe":
      return contientVariableUsage(noeud.interieur, variable);
  }
}

/** Vrai si `noeud` contient, parmi ses termes additifs de plus haut niveau (voir `flattenAdditif`,
 * appliqué ICI SANS respecter la frontière des parenthèses d'un niveau supérieur — `noeud` est déjà
 * l'INTÉRIEUR d'un groupe au moment de cet appel), un terme syntaxiquement égal à `variable^2` —
 * jamais un carré déjà complété comme `(variable-p)^2` (voir `classifierCarreParfaitXY` pour ce
 * cas), seulement le monôme carré nu tel qu'il apparaît avant toute complétion. */
export function contientVariableCarreeExplicite(noeud: NoeudXY, variable: "x" | "y"): boolean {
  return flattenAdditif(noeud).some(({ terme }) => {
    return terme.type === "puissance" && terme.exposant.type === "nombre" && terme.exposant.valeur === 2 && terme.base.type === variable;
  });
}

/** Extrait l'intérieur d'un terme de la forme `coefficient·(...)`, `(...)·coefficient`, ou `(...)`
 * seul (coefficient 1 implicite) — `null` si le terme n'est PAS explicitement parenthésé de cette
 * façon (ex. un monôme brut `2x²`, jamais confondu avec un groupe). */
export function extraireInterieurCoefficient(terme: NoeudXY): NoeudXY | null {
  if (terme.type === "groupe") return terme.interieur;
  if (terme.type === "produit" && terme.operateur === "*") {
    if (estNombrePur(terme.gauche) && terme.droite.type === "groupe") return terme.droite.interieur;
    if (estNombrePur(terme.droite) && terme.gauche.type === "groupe") return terme.gauche.interieur;
  }
  return null;
}

/** Étape "regroupement" : classe un terme `coefficient·(groupe)` selon la variable dont le groupe
 * contient le carré explicite (`contientVariableCarreeExplicite`) SANS référencer l'autre variable
 * — `null` si le terme n'est pas de cette forme (parenthèses/coefficient manquants), si les deux
 * variables sont mélangées dans le même groupe, ou si le carré de la variable concernée est absent
 * (ex. un groupe purement linéaire). */
export function classifierGroupeRegroupementXY(terme: NoeudXY): "x" | "y" | null {
  const interieur = extraireInterieurCoefficient(terme);
  if (interieur === null) return null;
  for (const variable of ["x", "y"] as const) {
    const autre = variable === "x" ? "y" : "x";
    if (!contientVariableUsage(interieur, autre) && contientVariableCarreeExplicite(interieur, variable)) return variable;
  }
  return null;
}

/** Extrait le noeud "puissance" d'un terme `coefficient·(...)²`, `(...)²·coefficient`, ou `(...)²`
 * seul — `null` si le terme n'est pas une puissance (même schéma coefficient optionnel que
 * `extraireInterieurCoefficient`, mais recherche un noeud "puissance" plutôt que "groupe"). */
function extraireTermePuissance(terme: NoeudXY): Extract<NoeudXY, { type: "puissance" }> | null {
  if (terme.type === "puissance") return terme;
  if (terme.type === "produit" && terme.operateur === "*") {
    if (estNombrePur(terme.gauche) && terme.droite.type === "puissance") return terme.droite;
    if (estNombrePur(terme.droite) && terme.gauche.type === "puissance") return terme.gauche;
  }
  return null;
}

/** Dépouille récursivement tout groupe englobant redondant — ex. "((x))" → le noeud "x". */
function depouillerGroupesRedondants(noeud: NoeudXY): NoeudXY {
  return noeud.type === "groupe" ? depouillerGroupesRedondants(noeud.interieur) : noeud;
}

/** Vrai si `noeud` est (une fois les groupes redondants dépouillés) exactement `variable` seule, ou
 * une négation/un nombre pur — utilisé pour reconnaître le membre NUMÉRIQUE d'un binôme, y compris
 * une double négation explicite comme "-(-1.5)" (ex. "y-(-1.5)", écrit par un élève pour "y+1.5"). */
function estNombrePur(noeud: NoeudXY): boolean {
  const n = depouillerGroupesRedondants(noeud);
  if (n.type === "nombre") return true;
  if (n.type === "negation") return estNombrePur(n.operande);
  return false;
}

/** Vrai si `noeud` (une fois un éventuel groupe englobant dépouillé) est exactement `variable` seule
 * (p=0 implicite, ex. base nue de "x²"), ou un binôme `variable±nombre`/`nombre±variable` dans
 * n'importe quel ordre/signe — jamais un mélange des deux variables ni une expression plus complexe. */
function estBinomeOuVariable(noeud: NoeudXY, variable: "x" | "y"): boolean {
  const n = depouillerGroupesRedondants(noeud);
  if (n.type === variable) return true;
  if (n.type === "negation") return estBinomeOuVariable(n.operande, variable);
  if (n.type === "somme") {
    const g = depouillerGroupesRedondants(n.gauche);
    const d = depouillerGroupesRedondants(n.droite);
    const estVar = (x: NoeudXY) => x.type === variable;
    return (estVar(g) && estNombrePur(d)) || (estNombrePur(g) && estVar(d));
  }
  return false;
}

/** Étape "complétion du carré" : classe un terme `coefficient·(binôme)²` selon la variable du
 * binôme au carré — exige un exposant EXACTEMENT 2 et une base reconnue par `estBinomeOuVariable`
 * (jamais un carré non encore complété comme `x²-2x`, qui n'a pas de noeud "puissance" appliqué à
 * un binôme). `null` sinon. */
export function classifierCarreParfaitXY(terme: NoeudXY): "x" | "y" | null {
  const puissanceNode = extraireTermePuissance(terme);
  if (!puissanceNode || puissanceNode.exposant.type !== "nombre" || puissanceNode.exposant.valeur !== 2) return null;
  for (const variable of ["x", "y"] as const) {
    if (estBinomeOuVariable(puissanceNode.base, variable)) return variable;
  }
  return null;
}

/** Décalages fixes, non ronds — jamais alignés par coïncidence sur un centre/rayon entier. */
const DECALAGES_ECHANTILLONS: [number, number][] = [
  [0.37, 1.53],
  [-0.82, 2.19],
  [-1.41, 0.91],
  [2.63, -1.77],
  [1.19, -2.31],
  [-2.07, 1.42],
  [0.68, -3.14],
  [-3.29, -0.55],
];

const NOMBRE_MIN_POINTS_COMPARABLES = 6;
const TOLERANCE = 1e-6;

/** `(x-x0)²+(y-y0)²-r²` — la seule référence de vérité, jamais recalculée différemment ailleurs. */
function cibleCercle(x: number, y: number, x0: number, y0: number, r2: number): number {
  return (x - x0) * (x - x0) + (y - y0) * (y - y0) - r2;
}

/**
 * Généralisation de la vérification "soumis proportionnel à cible" à N'IMPORTE QUELLE référence
 * quadratique à 2 variables — pas seulement la forme canonique de cercle `cibleCercle` : `cible`
 * est un simple callback numérique, jamais un texte à reparser. Extraite pour être réutilisée par
 * "Centre et rayon d'un cercle depuis l'équation développée" (`verificationEquationCercleDeveloppee.ts`),
 * dont les écrans "regroupement" et "complétion du carré" doivent accepter n'importe quelle
 * reformulation algébriquement équivalente de l'équation développée elle-même (jamais une forme
 * canonique fixe) — même principe de duplication de tolérance/points minimaux qu'ailleurs dans le
 * projet, mais mécanique de sondage/ratio partagée à l'identique (comportement de
 * `diagnostiquerEquationCercle` strictement inchangé, voir ci-dessous).
 */
export function diagnostiquerEquivalenceQuadratiqueXY(texte: string, x0: number, y0: number, cible: (x: number, y: number) => number): StatutVerification {
  const equation = parserEquationXY(texte);
  if (!equation) return "parse_error";

  const points: { soumis: number; cible: number }[] = [];
  for (const [dx, dy] of DECALAGES_ECHANTILLONS) {
    const x = x0 + dx;
    const y = y0 + dy;
    const valeurCible = cible(x, y);
    if (Math.abs(valeurCible) < TOLERANCE) continue;
    const soumis = evaluerXY(equation.gauche, x, y) - evaluerXY(equation.droite, x, y);
    if (!Number.isFinite(soumis)) continue;
    points.push({ soumis, cible: valeurCible });
  }

  if (points.length < NOMBRE_MIN_POINTS_COMPARABLES) return "parse_error";

  const ratio = points[0]!.soumis / points[0]!.cible;
  if (!Number.isFinite(ratio) || Math.abs(ratio) < TOLERANCE) return "not_equivalent";

  for (const { soumis, cible: valeurCible } of points) {
    if (Math.abs(soumis - ratio * valeurCible) > TOLERANCE * Math.max(1, Math.abs(valeurCible))) return "not_equivalent";
  }

  return "correct";
}

/**
 * Statut à 3 valeurs sur l'équation de cercle saisie par l'élève — `parse_error` sur toute syntaxe
 * non reconnue (structure "...=..." absente/dupliquée, expression mal formée des deux côtés), ou
 * si moins de `NOMBRE_MIN_POINTS_COMPARABLES` points restent comparables (domaine de la saisie trop
 * restreint pour conclure — jamais un faux positif par absence de points à comparer, même principe
 * que `verifierEquationFonctionReference`). `not_equivalent` si le rapport soumis/cible n'est pas
 * cohérent sur l'échantillon (courbe différente, rayon/rayon² inversé, équation dégénérée) ;
 * `correct` sinon — accepte n'importe quelle reformulation algébriquement équivalente (développée,
 * réordonnée, mise à l'échelle par un facteur non nul, y compris négatif). Simple wrapper autour de
 * `diagnostiquerEquivalenceQuadratiqueXY` — comportement strictement inchangé (couvert par la suite
 * de tests existante, jamais réécrite pour ce refactor).
 */
export function diagnostiquerEquationCercle(texte: string, x0: number, y0: number, r2: number): StatutVerification {
  return diagnostiquerEquivalenceQuadratiqueXY(texte, x0, y0, (x, y) => cibleCercle(x, y, x0, y0, r2));
}

export function verifierEquationCercle(texte: string, x0: number, y0: number, r2: number): boolean {
  return diagnostiquerEquationCercle(texte, x0, y0, r2) === "correct";
}

// ============================================================================
// Vérification "exercice-aware" — les 3 écrans de "Équation d'un cercle (non développée) à partir
// d'un graphe" (centre / rayon / équation). `TOLERANCE_CENTRE_RAYON`/`statutNumeriqueSimple`/
// `combinerStatutsSimple` sont DUPLIQUÉS depuis `verificationDroite.ts` plutôt qu'importés — ce
// module reste volontairement autonome (voir l'en-tête de fichier), même principe de petite
// fonction pure dupliquée qu'ailleurs dans le projet entre familles de générateurs indépendantes.
// ============================================================================

/** Tolérance pour un champ numérique isolé (centre, rayon) — même valeur que le reste du projet. */
const TOLERANCE_CENTRE_RAYON = 0.01;

function statutNumeriqueSimple(valeur: number, cible: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE_CENTRE_RAYON ? "correct" : "not_equivalent";
}

/** `parse_error` prioritaire (si un seul champ n'a pas pu être interprété, la note entière est
 * `parse_error`, jamais un `not_equivalent` qui masquerait cette information à l'élève). */
function combinerStatutsSimple(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export interface ReponseCentre {
  x: number;
  y: number;
}

/** Écran "centre" — 2 champs x/y diagnostiqués indépendamment puis combinés, pour isoler une
 * erreur de signe sur une seule coordonnée (même principe que le reste du projet). */
export function diagnostiquerCentre(exercice: ExerciceEquationCercle, reponse: ReponseCentre): StatutVerification {
  return combinerStatutsSimple(statutNumeriqueSimple(reponse.x, exercice.centre.x), statutNumeriqueSimple(reponse.y, exercice.centre.y));
}

export function verifierCentre(exercice: ExerciceEquationCercle, reponse: ReponseCentre): boolean {
  return diagnostiquerCentre(exercice, reponse) === "correct";
}

/** Écran "rayon" — un seul champ, toujours le RAYON lui-même (jamais r² — le piège central de
 * l'exercice, "rayon donné au lieu du rayon carré", n'a de sens que sur l'écran équation final,
 * qui compare bien r² une fois la vraie valeur de rayon confirmée ici). */
export function diagnostiquerRayon(exercice: ExerciceEquationCercle, rayon: number): StatutVerification {
  return statutNumeriqueSimple(rayon, exercice.rayon);
}

export function verifierRayon(exercice: ExerciceEquationCercle, rayon: number): boolean {
  return diagnostiquerRayon(exercice, rayon) === "correct";
}

/** Écran "équation" (dernier, clôture l'exercice) — réutilise directement `diagnostiquerEquationCercle`
 * contre le centre/rayon RÉELS de l'exercice, jamais une resaisie des 2 écrans précédents. */
export function diagnostiquerEquationExercice(exercice: ExerciceEquationCercle, texte: string): StatutVerification {
  return diagnostiquerEquationCercle(texte, exercice.centre.x, exercice.centre.y, exercice.rayon * exercice.rayon);
}

export function verifierEquationExercice(exercice: ExerciceEquationCercle, texte: string): boolean {
  return diagnostiquerEquationExercice(exercice, texte) === "correct";
}
