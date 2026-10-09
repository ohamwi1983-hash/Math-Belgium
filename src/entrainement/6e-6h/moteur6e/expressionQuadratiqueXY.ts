import type { StatutVerification } from "../moteur/statutVerification";

/**
 * Couche B (6e) — évaluateur d'expressions algébriques à DEUX variables (x,y) + garde structurelle,
 * écrit pour `6gen58` mais conçu pour être réutilisé TEL QUEL par `6gen59`-`6gen63` (chapitre "Les
 * coniques" tout entier manipule des équations à x ET y). Jamais une extension de
 * `expressionExponentielle.ts` (multi-variable numérique mais SANS arbre — aucune inspection
 * structurelle possible, voir plus bas pourquoi c'est nécessaire ici) : un second évaluateur,
 * dédié, avec un arbre `NoeudXY` explicite.
 *
 * Mirroir DÉLIBÉRÉ du patron déjà établi pour le 4e (`moteur/verificationEquationCercle.ts` +
 * `moteur/verificationEquationCercleDeveloppee.ts`, "garde structurelle contre une recopie de
 * l'équation de départ") — jamais importé tel quel (règle d'isolation stricte entre chantiers,
 * CLAUDE.md), réécrit ici de façon autonome pour le 6e.
 *
 * ## Pourquoi une garde structurelle, en plus de l'équivalence algébrique
 *
 * Les écrans "compléter le carré" de la famille B (`Ax²+By²+Dx+Ey+F=0` → `A(x-h)²+B(y-k)²=M`) et de
 * la famille C (compléter le carré sur la variable sous la racine) demandent une TRANSFORMATION
 * précise de l'équation de départ — pas seulement une équation équivalente. Or l'équation de départ
 * développée EST, par construction, algébriquement identique à sa propre forme complétée : un élève
 * qui recopie (même réordonnée/reformulée) l'équation de départ obtiendrait donc un statut
 * "correct" si seule l'équivalence algébrique était vérifiée. `estStructureDeuxCarresValide`
 * (famille B — exige DEUX carrés parfaits explicites, un par variable) et
 * `contientCarreParfaitExplicite` (famille C — exige AU MOINS UN carré parfait explicite dans la
 * variable qui était sous la racine) ferment cette échappatoire, appliquées EN PLUS de
 * `diagnostiquerEquivalenceQuadratiqueXY`, jamais à sa place.
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

export type NoeudXY =
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

function parserEquationXY(texte: string): EquationXYAnalysee | null {
  const morceaux = texte.split("=");
  if (morceaux.length !== 2) return null;
  const gauche = parserExpressionXY(morceaux[0] ?? "");
  const droite = parserExpressionXY(morceaux[1] ?? "");
  if (!gauche || !droite) return null;
  return { gauche, droite };
}

export { parserEquationXY, parserExpressionXY };

// ============================================================================
// Analyse STRUCTURELLE (inspection de l'arbre, jamais une simple équivalence numérique).
// ============================================================================

/** Éclate une chaîne additive (+/-) en ses termes de plus haut niveau — un noeud "groupe"
 * (explicitement parenthésé) est TOUJOURS un terme opaque, jamais éclaté plus loin : les
 * parenthèses font foi comme frontière structurelle (même principe que le 4e — voir en-tête). */
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

function depouillerGroupesRedondants(noeud: NoeudXY): NoeudXY {
  return noeud.type === "groupe" ? depouillerGroupesRedondants(noeud.interieur) : noeud;
}

function estNombrePur(noeud: NoeudXY): boolean {
  const n = depouillerGroupesRedondants(noeud);
  if (n.type === "nombre") return true;
  if (n.type === "negation") return estNombrePur(n.operande);
  return false;
}

/** Vrai si `noeud` (un éventuel groupe englobant dépouillé) est exactement `variable` seule, ou un
 * binôme `variable±nombre`/`nombre±variable` dans n'importe quel ordre/signe. */
function estBinomeOuVariable(noeud: NoeudXY, variable: "x" | "y"): boolean {
  const n = depouillerGroupesRedondants(noeud);
  if (n.type === variable) return true;
  if (n.type === "negation") return estBinomeOuVariable(n.operande, variable);
  if (n.type === "somme") {
    const g = depouillerGroupesRedondants(n.gauche);
    const d = depouillerGroupesRedondants(n.droite);
    const estVar = (u: NoeudXY) => u.type === variable;
    return (estVar(g) && estNombrePur(d)) || (estNombrePur(g) && estVar(d));
  }
  return false;
}

/** Extrait le noeud "puissance" d'un terme `coefficient·(...)²`, `(...)²·coefficient`, ou `(...)²`
 * seul — `null` sinon. */
function extraireTermePuissance(terme: NoeudXY): Extract<NoeudXY, { type: "puissance" }> | null {
  if (terme.type === "puissance") return terme;
  if (terme.type === "produit" && terme.operateur === "*") {
    if (estNombrePur(terme.gauche) && terme.droite.type === "puissance") return terme.droite;
    if (estNombrePur(terme.droite) && terme.gauche.type === "puissance") return terme.gauche;
  }
  return null;
}

/** Classe un terme `coefficient·(binôme)²` selon la variable du binôme au carré — exige un exposant
 * EXACTEMENT 2 et une base reconnue par `estBinomeOuVariable` (jamais un carré non encore complété
 * comme `x²-2x`, qui n'a pas de noeud "puissance" appliqué à un binôme). `null` sinon. */
export function classifierCarreParfaitXY(terme: NoeudXY): "x" | "y" | null {
  const puissanceNode = extraireTermePuissance(terme);
  if (!puissanceNode || puissanceNode.exposant.type !== "nombre" || puissanceNode.exposant.valeur !== 2) return null;
  for (const variable of ["x", "y"] as const) {
    if (estBinomeOuVariable(puissanceNode.base, variable)) return variable;
  }
  return null;
}

/** Applique `verifieStructure` à n'importe lequel des 2 membres d'une équation texte — `false` si
 * le texte n'est même pas parseable (ne devrait jamais arriver après un `diagnostiquer*` réussi —
 * défense en profondeur). */
function unCoteVerifie(texte: string, verifieStructure: (cote: NoeudXY) => boolean): boolean {
  const equation = parserEquationXY(texte);
  if (!equation) return false;
  return verifieStructure(equation.gauche) || verifieStructure(equation.droite);
}

/** Garde structurelle FAMILLE B (`bEcran1`) — exige, sur un des 2 membres, une somme de EXACTEMENT
 * 2 carrés parfaits explicites, un en x un en y (ex. `3(x-2)²+2(y+1)²`) — jamais une forme
 * développée équivalente (même recopie exacte de l'équation de départ, algébriquement identique par
 * construction — voir en-tête de fichier). */
export function estStructureDeuxCarresValide(cote: NoeudXY): boolean {
  const termes = flattenAdditif(cote);
  if (termes.length !== 2) return false;
  const [c1, c2] = termes.map((t) => classifierCarreParfaitXY(t.terme));
  return c1 !== null && c2 !== null && c1 !== c2;
}

export function uneStructureDeuxCarresValide(texte: string): boolean {
  return unCoteVerifie(texte, estStructureDeuxCarresValide);
}

/** Extrait l'intérieur d'un terme de la forme `coefficient·(...)`, `(...)·coefficient`, ou `(...)`
 * seul (coefficient 1 implicite) — `null` si le terme n'est PAS explicitement parenthésé ainsi. */
function extraireInterieurCoefficient(terme: NoeudXY): NoeudXY | null {
  if (terme.type === "groupe") return terme.interieur;
  if (terme.type === "produit" && terme.operateur === "*") {
    if (estNombrePur(terme.gauche) && terme.droite.type === "groupe") return terme.droite.interieur;
    if (estNombrePur(terme.droite) && terme.gauche.type === "groupe") return terme.gauche.interieur;
  }
  return null;
}

/** Vrai si `noeud`, une fois éclaté en termes additifs de plus haut niveau, contient EXACTEMENT 2
 * termes : un carré parfait explicite dans `variable`, et une constante pure — la forme précise
 * d'un carré tout juste complété PLUS sa constante résiduelle (`(v-h)²+c0`), ni plus ni moins de
 * termes (rejette donc une forme développée non complétée comme `v²-4v+7`, qui a 3 termes). */
function estGroupeCompletionUnique(noeud: NoeudXY, variable: "x" | "y"): boolean {
  const termes = flattenAdditif(noeud);
  if (termes.length !== 2) return false;
  const carres = termes.map((t) => classifierCarreParfaitXY(t.terme));
  const constantes = termes.map((t) => estNombrePur(t.terme));
  return (carres[0] === variable && constantes[1]) || (carres[1] === variable && constantes[0]);
}

/** Garde structurelle FAMILLE C (`cEcran2`) — exige, sur l'un des 2 membres, une forme
 * `(v-h)²+c0` (voir `estGroupeCompletionUnique`) soit DIRECTEMENT au premier niveau (élève ayant
 * distribué un coefficient global, ex. `m²(v-h)²+m²c0`), soit NICHÉE dans un groupe
 * `coefficient·(...)` (ex. `m²·((v-h)²+c0)`, la forme la plus naturelle) — plus souple que la garde
 * famille B (l'autre membre de l'équation famille C est déjà un carré parfait TRIVIAL, `(v_isolée-k)²`,
 * qui n'a pas besoin d'être "complété" une 2ᵉ fois). Descend UN SEUL niveau de parenthèse
 * (suffisant ici — jamais besoin de plus pour ce générateur). */
export function contientCarreParfaitExplicite(noeud: NoeudXY, variable: "x" | "y"): boolean {
  if (estGroupeCompletionUnique(noeud, variable)) return true;
  return flattenAdditif(noeud).some(({ terme }) => {
    const interieur = extraireInterieurCoefficient(terme);
    return interieur !== null && estGroupeCompletionUnique(interieur, variable);
  });
}

export function uneStructureCarreParfaitExplicite(texte: string, variable: "x" | "y"): boolean {
  const equation = parserEquationXY(texte);
  if (!equation) return false;
  return contientCarreParfaitExplicite(equation.gauche, variable) || contientCarreParfaitExplicite(equation.droite, variable);
}

// ============================================================================
// Équivalence algébrique par ÉCHANTILLONNAGE NUMÉRIQUE (jamais de bibliothèque de calcul formel —
// aucune n'est installée sur ce projet, convention déjà en place partout ailleurs).
// ============================================================================

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

/**
 * Vrai si l'équation `texte` (gauche−droite) est un multiple scalaire non nul de `cible(x,y)`,
 * échantillonné autour de `(xRef,yRef)` — généralisation à 2 variables du principe déjà utilisé
 * pour les équations de droites (`statutTripletProportionnel`, 4e) : deux polynômes du 2nd degré à
 * 2 variables décrivent la MÊME courbe si et seulement si l'un est un multiple scalaire non nul de
 * l'autre (Bézout : 2 coniques distinctes se croisent en au plus 4 points, un accord de rapport sur
 * ≥6 points à décalages non ronds est une preuve quasi certaine d'équivalence). Accepte donc
 * n'importe quelle reformulation algébriquement équivalente (développée, réordonnée, mise à
 * l'échelle par un facteur non nul y compris négatif) — cohérent avec la convention transversale du
 * projet.
 */
export function diagnostiquerEquivalenceQuadratiqueXY(texte: string, xRef: number, yRef: number, cible: (x: number, y: number) => number): StatutVerification {
  const equation = parserEquationXY(texte);
  if (!equation) return "parse_error";

  const points: { soumis: number; cible: number }[] = [];
  for (const [dx, dy] of DECALAGES_ECHANTILLONS) {
    const x = xRef + dx;
    const y = yRef + dy;
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
