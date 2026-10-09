import type { StatutVerification } from "../moteur/statutVerification";

/**
 * Couche B (6e) — évaluateur d'expression EXACT (BigInt/rationnel), dédié à `6gen44` ("Dénombrement
 * combiné et sélections contraintes"). N'importe JAMAIS rien de `src/generateurs6e/` (règle
 * non négociable, CLAUDE.md) — les petites fonctions combinatoires dont ce fichier a besoin
 * (`factorielleBigInt`/`coefficientBinomialBigInt`/`arrangementsBigInt`) sont donc redéfinies ICI en
 * BigInt, jamais importées de `generateurs6e/combinatoire.ts` (qui retourne `number`, voir
 * justification ci-dessous) — même principe de duplication assumée déjà établi par
 * `combinatoire.ts` lui-même (son en-tête, section "Pourquoi ne pas réutiliser...
 * probabilitesProblemes/familleB.ts").
 *
 * ============================================================================
 * **Pourquoi BigInt et pas `number` (contrairement à TOUS les autres évaluateurs `moteur6e/`,
 * ex. `expressionExponentielle.ts`)**
 * ============================================================================
 * `6gen44` famille A autorise `n` jusqu'à 52 (multinomiale à plusieurs groupes) — un exercice où
 * l'élève tape littéralement `52!` dans son expression. Vérifié empiriquement (script Node isolé
 * exécuté pendant la conception) : `52!` calculé en flottant IEEE-754 double (`Number`) vaut environ
 * `8.07×10^67`, un ordre de grandeur bien au-delà des ~15-17 chiffres significatifs qu'un double peut
 * représenter exactement — et le PROBLÈME ne se limite pas à la valeur finale (qui peut rester
 * petite après simplification, ex. `52!/(1!·51!)=52`) : c'est le calcul INTERMÉDIAIRE de `52!`
 * lui-même, tel quel, qui perd déjà toute précision utile avant même la division. Exemple mesuré :
 * la même multinomiale calculée (a) via factorielles brutes `52!/(26!·26!)` et (b) via la méthode
 * itérative de `coefficientBinomial` (qui évite de matérialiser un grand factoriel directement)
 * diffèrent de `0.0625` — largement au-delà de toute tolérance `0.01` utilisée ailleurs sur la
 * plateforme (`moteur6e/equivalenceExponentielle.ts`). Pour des groupes plus équilibrés (ex.
 * `52;17,17,18`), le résultat exact dépasse carrément `Number.MAX_SAFE_INTEGER` (`2^53`, environ
 * `9×10^15`) — AUCUNE méthode basée sur `number` ne peut alors garantir l'exactitude, quel que soit
 * l'algorithme utilisé. `BigInt` (précision arbitraire, natif JS) élimine le problème entièrement :
 * `52!` s'y calcule EXACTEMENT (68 chiffres, aucun arrondi), et toute expression combinatoire de ce
 * générateur (familles A à D) est donc comparée par ÉGALITÉ EXACTE — jamais une tolérance flottante
 * — ce qui correspond très précisément à l'exigence de la mission ("Toutes les valeurs numériques :
 * égalité exacte (nombres entiers)"), au-delà même de la convention `diagnostiquerValeur` (tolérance
 * fixe `0.01`) utilisée par les générateurs précédents du chantier.
 *
 * ============================================================================
 * **Grammaire supportée**
 * ============================================================================
 * Entiers, `+ - * / ^` (exposant entier ≥0), parenthèses, factorielle POSTFIXÉE (`5!`, `(n-k)!`,
 * empilable `3!!` — rarement utile mais non interdite), et 2 fonctions à 2 arguments :
 * `C(n,k)` (coefficient binomial) et `A(n,k)` (arrangements) — mêmes conventions aux bornes que
 * `generateurs6e/combinatoire.ts` (`k<0` ou `k>n` → `0`, jamais une exception). Pas de variable, pas
 * de constante `pi`/`e`, pas de fonctions trigo/log — ce générateur ne manipule que des comptages
 * entiers, contrairement à `expressionExponentielle.ts` (chapitre 2). Valeur interne représentée en
 * RATIONNEL BigInt (`{num, den}`, `den>0`, jamais réduit à `number` avant la toute dernière
 * comparaison) — nécessaire car une expression peut légitimement contenir une division
 * intermédiaire (`n!/n1!/n2!/...`) même quand le résultat final est entier.
 */

type Rationnel = { num: bigint; den: bigint };

function pgcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a === 0n ? 1n : a;
}

function reduire(r: Rationnel): Rationnel {
  let { num, den } = r;
  if (den < 0n) {
    num = -num;
    den = -den;
  }
  const d = pgcd(num, den);
  return { num: num / d, den: den / d };
}

function depuisEntier(n: bigint): Rationnel {
  return { num: n, den: 1n };
}

function estEntier(r: Rationnel): boolean {
  return r.den === 1n;
}

function additionner(a: Rationnel, b: Rationnel): Rationnel {
  return reduire({ num: a.num * b.den + b.num * a.den, den: a.den * b.den });
}
function soustraire(a: Rationnel, b: Rationnel): Rationnel {
  return reduire({ num: a.num * b.den - b.num * a.den, den: a.den * b.den });
}
function multiplier(a: Rationnel, b: Rationnel): Rationnel {
  return reduire({ num: a.num * b.num, den: a.den * b.den });
}
function diviser(a: Rationnel, b: Rationnel): Rationnel {
  if (b.num === 0n) throw new Error("Division par zéro");
  return reduire({ num: a.num * b.den, den: a.den * b.num });
}

/** `n!` en BigInt — duplication volontaire de `generateurs6e/combinatoire.ts::factorielle`, voir
 * en-tête de fichier (précision, pas de dépendance Couche A). */
function factorielleBigInt(n: bigint): bigint {
  if (n < 0n) throw new Error("factorielle : argument négatif");
  let resultat = 1n;
  for (let i = 2n; i <= n; i++) resultat *= i;
  return resultat;
}

/** `C(n,k)` en BigInt — mêmes conventions aux bornes que `coefficientBinomial` (`k<0||k>n` → `0`,
 * jamais d'exception). */
function coefficientBinomialBigInt(n: bigint, k: bigint): bigint {
  if (n < 0n) throw new Error("C(n,k) : n doit être ≥0");
  if (k < 0n || k > n) return 0n;
  const kEff = k < n - k ? k : n - k;
  let resultat = 1n;
  for (let i = 0n; i < kEff; i++) {
    resultat = (resultat * (n - i)) / (i + 1n);
  }
  return resultat;
}

/** `A(n,k)` en BigInt — mêmes conventions aux bornes. */
function arrangementsBigInt(n: bigint, k: bigint): bigint {
  if (n < 0n) throw new Error("A(n,k) : n doit être ≥0");
  if (k < 0n || k > n) return 0n;
  let resultat = 1n;
  for (let i = 0n; i < k; i++) resultat *= n - i;
  return resultat;
}

function factorielleRationnel(r: Rationnel): Rationnel {
  if (!estEntier(r) || r.num < 0n) throw new Error("! : argument invalide (entier ≥0 attendu)");
  return depuisEntier(factorielleBigInt(r.num));
}

function exigerEntierPositifOuNul(r: Rationnel, contexte: string): bigint {
  if (!estEntier(r) || r.num < 0n) throw new Error(`${contexte} : argument invalide (entier ≥0 attendu)`);
  return r.num;
}

/** Comme `exigerEntierPositifOuNul` mais SANS exiger la positivité — utilisé pour le 2ᵉ argument
 * (`k`) de `C(n,k)`/`A(n,k)` : `k<0` est une valeur d'entrée VALIDE (convention `combinatoire.ts`,
 * gérée à l'intérieur de `coefficientBinomialBigInt`/`arrangementsBigInt` qui retournent `0`, jamais
 * une exception) — seul un `k` non entier (rationnel non-entier) est une vraie erreur de domaine. */
function exigerEntier(r: Rationnel, contexte: string): bigint {
  if (!estEntier(r)) throw new Error(`${contexte} : argument invalide (entier attendu)`);
  return r.num;
}

// ============================================================================
// Analyseur récursif-descendant.
// ============================================================================

type TypeJeton = "nombre" | "identifiant" | "+" | "-" | "*" | "/" | "^" | "!" | "(" | ")" | "," | "fin";

interface Jeton {
  type: TypeJeton;
  valeur?: bigint;
  nom?: string;
}

function tokeniser(texte: string): Jeton[] {
  const jetons: Jeton[] = [];
  let i = 0;
  while (i < texte.length) {
    const c = texte[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < texte.length && /[0-9]/.test(texte[j])) j++;
      jetons.push({ type: "nombre", valeur: BigInt(texte.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < texte.length && /[a-zA-Z]/.test(texte[j])) j++;
      jetons.push({ type: "identifiant", nom: texte.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    if ("+-*/^!(),".includes(c)) {
      jetons.push({ type: c as TypeJeton });
      i++;
      continue;
    }
    throw new Error(`Caractère inattendu : "${c}"`);
  }
  jetons.push({ type: "fin" });
  return jetons;
}

const FONCTIONS_DEUX_ARGS: Record<string, (a: bigint, b: bigint) => bigint> = {
  c: coefficientBinomialBigInt,
  a: arrangementsBigInt,
};

class AnalyseurCombinatoire {
  private pos = 0;
  private readonly jetons: Jeton[];

  constructor(jetons: Jeton[]) {
    this.jetons = jetons;
  }

  private actuel(): Jeton {
    return this.jetons[this.pos];
  }
  private avancer(): Jeton {
    return this.jetons[this.pos++];
  }
  private attendre(type: TypeJeton): Jeton {
    if (this.actuel().type !== type) throw new Error(`Syntaxe invalide : "${type}" attendu`);
    return this.avancer();
  }

  analyser(): Rationnel {
    const v = this.expression();
    this.attendre("fin");
    return v;
  }

  private expression(): Rationnel {
    let v = this.terme();
    while (this.actuel().type === "+" || this.actuel().type === "-") {
      const op = this.avancer().type;
      const d = this.terme();
      v = op === "+" ? additionner(v, d) : soustraire(v, d);
    }
    return v;
  }

  private terme(): Rationnel {
    let v = this.facteurUnaire();
    for (;;) {
      if (this.actuel().type === "*") {
        this.avancer();
        v = multiplier(v, this.facteurUnaire());
        continue;
      }
      if (this.actuel().type === "/") {
        this.avancer();
        v = diviser(v, this.facteurUnaire());
        continue;
      }
      break;
    }
    return v;
  }

  private facteurUnaire(): Rationnel {
    if (this.actuel().type === "-") {
      this.avancer();
      const v = this.facteurUnaire();
      return { num: -v.num, den: v.den };
    }
    if (this.actuel().type === "+") {
      this.avancer();
      return this.facteurUnaire();
    }
    return this.puissance();
  }

  private puissance(): Rationnel {
    const base = this.postfixFactorielle();
    if (this.actuel().type === "^") {
      this.avancer();
      const exposant = this.facteurUnaire();
      const e = exigerEntierPositifOuNul(exposant, "^");
      if (e > 1000n) throw new Error("^ : exposant trop grand");
      let resultat: Rationnel = depuisEntier(1n);
      for (let i = 0n; i < e; i++) resultat = multiplier(resultat, base);
      return resultat;
    }
    return base;
  }

  private postfixFactorielle(): Rationnel {
    let v = this.atome();
    while (this.actuel().type === "!") {
      this.avancer();
      v = factorielleRationnel(v);
    }
    return v;
  }

  private atome(): Rationnel {
    const t = this.actuel();
    if (t.type === "nombre") {
      this.avancer();
      return depuisEntier(t.valeur as bigint);
    }
    if (t.type === "(") {
      this.avancer();
      const v = this.expression();
      this.attendre(")");
      return v;
    }
    if (t.type === "identifiant") {
      this.avancer();
      const nom = t.nom as string;
      const fn = FONCTIONS_DEUX_ARGS[nom];
      if (!fn) throw new Error(`Identifiant inconnu : "${nom}"`);
      this.attendre("(");
      const a = this.expression();
      this.attendre(",");
      const b = this.expression();
      this.attendre(")");
      const na = exigerEntierPositifOuNul(a, nom.toUpperCase());
      const nb = exigerEntier(b, nom.toUpperCase());
      return depuisEntier(fn(na, nb));
    }
    throw new Error("Expression invalide");
  }
}

/** `null` sur toute erreur de syntaxe ou de domaine (jamais une exception qui remonte). */
export function evaluerExpressionCombinatoire(texte: string): Rationnel | null {
  try {
    return new AnalyseurCombinatoire(tokeniser(texte)).analyser();
  } catch {
    return null;
  }
}

/** Compare une expression texte à une cible ENTIÈRE (`number` — converti via `BigInt(Math.round(.))`
 * — ou `bigint` directement, nécessaire pour la famille A dont les résultats dépassent
 * `Number.MAX_SAFE_INTEGER`) — ÉGALITÉ EXACTE, jamais de tolérance (voir en-tête de fichier). */
export function diagnostiquerValeurCombinatoire(texte: string, cible: number | bigint): StatutVerification {
  const r = evaluerExpressionCombinatoire(texte);
  if (r === null) return "parse_error";
  const cibleBigInt = typeof cible === "bigint" ? cible : BigInt(Math.round(cible));
  return estEntier(r) && r.num === cibleBigInt ? "correct" : "not_equivalent";
}

/** Compare un ENSEMBLE de textes à un ensemble de cibles, POSITION PAR POSITION (jamais ordre
 * indifférent — chaque champ d'écran a un rôle précis, mirroir `diagnostiquerValeurs` de
 * `verificationDenombrementFondamental.ts`). `parse_error` prioritaire sur `not_equivalent`. */
export function diagnostiquerValeursCombinatoire(textes: string[], cibles: (number | bigint)[]): StatutVerification {
  const statuts = cibles.map((c, i) => diagnostiquerValeurCombinatoire(textes[i] ?? "", c));
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}
