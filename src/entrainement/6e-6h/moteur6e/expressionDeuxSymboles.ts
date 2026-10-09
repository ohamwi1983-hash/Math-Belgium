import type { StatutVerification } from "../moteur/statutVerification";

/**
 * Couche B (6e) — évaluateur d'expressions algébriques à 2 SYMBOLES CONFIGURABLES, NEUF et propre à
 * `6gen62`. `moteur6e/expressionQuadratiqueXY.ts` (6gen58/59) est hardcodé sur `x`,`y` — inutilisable
 * ici : plusieurs écrans de `6gen62` demandent une équation en `x` ET un symbole INCONNU
 * supplémentaire (`k` famille B, `m` famille C) ou en 2 symboles qui n'ont RIEN à voir avec des
 * coordonnées (`a`,`b` famille D) — jamais `x`/`y` eux-mêmes (qui désignent déjà les coordonnées du
 * plan ailleurs sur le même écran, réutiliser ces lettres pour autre chose serait trompeur pour
 * l'élève). Plutôt que hardcoder chaque paire, CE module accepte 2 lettres en paramètre — mirroir
 * ALGORITHMIQUE de `expressionQuadratiqueXY.ts` (même tokenizer/arbre/évaluateur/technique
 * d'échantillonnage par proportionnalité), réécrit ici de façon autonome (locale à ce générateur,
 * jamais réutilisé ailleurs — voir mission, "algèbre neuve").
 */

type TypeJeton = "NOMBRE" | "VAR1" | "VAR2" | "PLUS" | "MOINS" | "FOIS" | "DIVISE" | "PUISSANCE" | "PAR_OUVRANTE" | "PAR_FERMANTE";

interface Jeton {
  type: TypeJeton;
  valeur?: number;
}

function tokeniser(expression: string, lettre1: string, lettre2: string): Jeton[] {
  const l1 = lettre1.toLowerCase();
  const l2 = lettre2.toLowerCase();
  const jetons: Jeton[] = [];
  let i = 0;
  while (i < expression.length) {
    const c = expression[i]!;
    if (c === " " || c === "\t") {
      i++;
      continue;
    }
    if ((c >= "0" && c <= "9") || c === "." || c === ",") {
      let j = i;
      while (j < expression.length && ((expression[j]! >= "0" && expression[j]! <= "9") || expression[j] === "." || expression[j] === ",")) j++;
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
    if (c.toLowerCase() === l1) {
      jetons.push({ type: "VAR1" });
      i++;
      continue;
    }
    if (c.toLowerCase() === l2) {
      jetons.push({ type: "VAR2" });
      i++;
      continue;
    }
    const correspondance: Record<string, TypeJeton> = { "+": "PLUS", "-": "MOINS", "*": "FOIS", "·": "FOIS", "×": "FOIS", "/": "DIVISE", "^": "PUISSANCE", "(": "PAR_OUVRANTE", ")": "PAR_FERMANTE" };
    if (c in correspondance) {
      jetons.push({ type: correspondance[c]! });
      i++;
      continue;
    }
    throw new Error(`Caractère inattendu dans l'expression : "${c}"`);
  }
  return jetons;
}

type Noeud = { type: "nombre"; valeur: number } | { type: "var1" } | { type: "var2" } | { type: "negation"; operande: Noeud } | { type: "somme"; operateur: "+" | "-"; gauche: Noeud; droite: Noeud } | { type: "produit"; operateur: "*" | "/"; gauche: Noeud; droite: Noeud } | { type: "puissance"; base: Noeud; exposant: Noeud } | { type: "groupe"; interieur: Noeud };

class Parseur {
  private position = 0;
  private readonly jetons: Jeton[];

  constructor(jetons: Jeton[]) {
    this.jetons = jetons;
  }

  analyser(): Noeud {
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

  private expression(): Noeud {
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
    return !!jeton && (jeton.type === "NOMBRE" || jeton.type === "VAR1" || jeton.type === "VAR2" || jeton.type === "PAR_OUVRANTE");
  }

  private terme(): Noeud {
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

  private unaire(): Noeud {
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

  private puissance(): Noeud {
    const base = this.primaire();
    if (this.regarder()?.type === "PUISSANCE") {
      this.consommer();
      return { type: "puissance", base, exposant: this.unaire() };
    }
    return base;
  }

  private primaire(): Noeud {
    const jeton = this.consommer();
    if (jeton.type === "NOMBRE") return { type: "nombre", valeur: jeton.valeur as number };
    if (jeton.type === "VAR1") return { type: "var1" };
    if (jeton.type === "VAR2") return { type: "var2" };
    if (jeton.type === "PAR_OUVRANTE") {
      const interieur = this.expression();
      if (this.regarder()?.type !== "PAR_FERMANTE") throw new Error("Parenthèse fermante manquante");
      this.consommer();
      return { type: "groupe", interieur };
    }
    throw new Error("Expression mal formée");
  }
}

function evaluer(noeud: Noeud, v1: number, v2: number): number {
  switch (noeud.type) {
    case "nombre":
      return noeud.valeur;
    case "var1":
      return v1;
    case "var2":
      return v2;
    case "negation":
      return -evaluer(noeud.operande, v1, v2);
    case "somme":
      return noeud.operateur === "+" ? evaluer(noeud.gauche, v1, v2) + evaluer(noeud.droite, v1, v2) : evaluer(noeud.gauche, v1, v2) - evaluer(noeud.droite, v1, v2);
    case "produit":
      return noeud.operateur === "*" ? evaluer(noeud.gauche, v1, v2) * evaluer(noeud.droite, v1, v2) : evaluer(noeud.gauche, v1, v2) / evaluer(noeud.droite, v1, v2);
    case "puissance":
      return Math.pow(evaluer(noeud.base, v1, v2), evaluer(noeud.exposant, v1, v2));
    case "groupe":
      return evaluer(noeud.interieur, v1, v2);
  }
}

function parserExpression(texte: string, lettre1: string, lettre2: string): Noeud | null {
  try {
    return new Parseur(tokeniser(texte, lettre1, lettre2)).analyser();
  } catch {
    return null;
  }
}

interface EquationAnalysee {
  gauche: Noeud;
  droite: Noeud;
}

function parserEquation(texte: string, lettre1: string, lettre2: string): EquationAnalysee | null {
  const morceaux = texte.split("=");
  if (morceaux.length !== 2) return null;
  const gauche = parserExpression(morceaux[0] ?? "", lettre1, lettre2);
  const droite = parserExpression(morceaux[1] ?? "", lettre1, lettre2);
  if (!gauche || !droite) return null;
  return { gauche, droite };
}

/** Décalages d'échantillonnage (jamais des valeurs rondes, jamais 0 exactement) — mirroir
 * `expressionQuadratiqueXY.ts` (Bézout : un accord de rapport sur ≥6 points à décalages non ronds
 * est une preuve quasi certaine d'équivalence). */
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
 * Vrai si `texte` (équation en `lettre1`,`lettre2` — l'un des deux peut rester inutilisé dans la
 * cible, ex. une équation purement en `lettre2`) est un multiple scalaire non nul de `cible`,
 * échantillonné autour de `(ref1,ref2)` — mêmes principe et garanties que
 * `diagnostiquerEquivalenceQuadratiqueXY` (accepte toute reformulation développée/réordonnée/mise à
 * l'échelle).
 */
export function diagnostiquerEquivalenceDeuxSymboles(texte: string, lettre1: string, lettre2: string, ref1: number, ref2: number, cible: (v1: number, v2: number) => number): StatutVerification {
  const equation = parserEquation(texte, lettre1, lettre2);
  if (!equation) return "parse_error";

  const points: { soumis: number; cible: number }[] = [];
  for (const [d1, d2] of DECALAGES_ECHANTILLONS) {
    const v1 = ref1 + d1;
    const v2 = ref2 + d2;
    const valeurCible = cible(v1, v2);
    if (!Number.isFinite(valeurCible) || Math.abs(valeurCible) < TOLERANCE) continue;
    let soumis: number;
    try {
      soumis = evaluer(equation.gauche, v1, v2) - evaluer(equation.droite, v1, v2);
    } catch {
      return "parse_error";
    }
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
