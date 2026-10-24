/**
 * Couche B (6e) — évaluateur d'expression FRAIS, partagé par les générateurs du chapitre 2
 * ("Fonctions exponentielles", 6gen6 à 6gen11) — réutilisation intra-chantier (moteur→moteur,
 * explicitement autorisée par l'architecture). Analyseur récursif-descendant, même principe que
 * `expressionCyclometrique.ts` (chapitre 1, 6e) mais réimplémenté ICI plutôt qu'étendu (ses
 * fonctions supportées et sa table `FONCTIONS` ne sont pas exportées, et ce module a besoin de
 * `ln`/`exp` en plus de `sqrt`/`abs`/`sin`/`cos`/`arccos`) — même principe de duplication assumée
 * déjà établi ailleurs sur la plateforme pour ce genre de petit module.
 *
 * DIFFÉRENCE STRUCTURELLE avec `expressionCyclometrique.ts` — MULTI-VARIABLE dès la conception :
 * `evaluerExpressionExponentielle(texte, variables)` prend un `Record<string,number>` plutôt
 * qu'un simple `x` unique, nécessaire pour les écrans qui posent une équation dans une AUTRE
 * variable (ex. "poser l'équation en t", 6gen9 famille C) sans avoir besoin d'un second module
 * dupliqué pour ce seul besoin.
 *
 * Supporte : identifiants multi-lettres comme variables (`x`, `t`...), `pi`, `e`, entiers/décimaux
 * (`.`/`,`), `+ - * / ^`, parenthèses, multiplication implicite (`2x`, `2sqrt(x)`), unicode
 * `²`/`³`, et les fonctions `sqrt`/`rac`/`abs`/`cbrt`/`sin`/`cos`/`tan`/`asin`/`arcsin`/`acos`/
 * `arccos`/`atan`/`arctan`/`ln`/`exp`/`sh`/`ch`/`log` (`sh`/`ch` ajoutés pour 6gen19, chapitre 3
 * "Sinus et cosinus hyperboliques" — additif pur, voir la table `FONCTIONS` ci-dessous ; `racN`,
 * N≥4 collé juste après "rac", pour une racine n-ième quelconque — ex. `rac4(x)` ; `log` seul =
 * base 10, `logN` (N collé juste après "log", ex. `log2(x)`) pour une base quelconque, changement
 * de base via `ln`). Aucune exception pour un problème de DOMAINE — `NaN`/`Infinity`
 * propagés nativement (`Math.log(-1)`, `Math.sqrt(-1)`...) ; seule une erreur de SYNTAXE lève.
 */

type TypeJeton = "nombre" | "identifiant" | "+" | "-" | "*" | "/" | "^" | "(" | ")" | "fin";

interface Jeton {
  type: TypeJeton;
  valeur?: number;
  nom?: string;
}

function tokeniser(texte: string): Jeton[] {
  const s = texte.replace(/²/g, "^2").replace(/³/g, "^3");
  const jetons: Jeton[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(s[i + 1] ?? ""))) {
      let j = i;
      while (j < s.length && /[0-9.,]/.test(s[j])) j++;
      // Notation scientifique ("1.5e3", "6.12e-17"...) : un "e"/"E" immédiatement après la partie
      // numérique, suivi d'un signe optionnel PUIS d'au moins un chiffre, fait partie du même nombre
      // — jamais confondu avec la constante d'Euler (qui n'est jamais collée à des chiffres sans
      // opérateur). Sans chiffre après le signe, on NE consomme rien : "e" reste un identifiant
      // séparé (comportement inchangé pour "2e" = 2*e, "e^x", etc.).
      if (j < s.length && /[eE]/.test(s[j])) {
        let k = j + 1;
        if (s[k] === "+" || s[k] === "-") k++;
        if (/[0-9]/.test(s[k] ?? "")) {
          while (k < s.length && /[0-9]/.test(s[k])) k++;
          j = k;
        }
      }
      jetons.push({ type: "nombre", valeur: Number(s.slice(i, j).replace(",", ".")) });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      const mot = s.slice(i, j).toLowerCase();
      i = j;
      // "racN" — racine n-ième (ex: rac4(x) = x^(1/4)), demandée par des élèves pour être plus
      // parlante que l'écriture en puissance. N est un entier collé juste après "rac" : le scan
      // ci-dessus ne lit que des lettres, donc il faut le consommer ici explicitement (sinon
      // "rac4(x)" se scinderait en identifiant "rac" + NOMBRE(4), jamais reconnu comme un seul
      // nom de fonction). Degré 2 → sqrt, 3 → cbrt (déjà câblées dans FONCTIONS ci-dessous),
      // sinon "racineN", résolu dynamiquement dans `atome()`.
      if (mot === "rac" && /[0-9]/.test(s[i] ?? "")) {
        let k = i;
        while (k < s.length && /[0-9]/.test(s[k])) k++;
        const degre = Number(s.slice(i, k));
        i = k;
        const nomCanonique = degre === 2 ? "sqrt" : degre === 3 ? "cbrt" : `racine${degre}`;
        jetons.push({ type: "identifiant", nom: nomCanonique });
        continue;
      }
      // "logN" — logarithme en base N (ex: log2(8)=3, log10(1000)=3), même principe que "racN"
      // ci-dessus : N est un entier collé juste après "log", consommé ici explicitement. Base 10
      // (explicite via "log10", ou implicite via "log" seul, sans chiffre) → canonique "log",
      // résolue par `Math.log10` dans FONCTIONS ci-dessous ; toute autre base → "logN", résolue par
      // changement de base dans `atome()`.
      if (mot === "log" && /[0-9]/.test(s[i] ?? "")) {
        let k = i;
        while (k < s.length && /[0-9]/.test(s[k])) k++;
        const base = Number(s.slice(i, k));
        i = k;
        jetons.push({ type: "identifiant", nom: base === 10 ? "log" : `log${base}` });
        continue;
      }
      jetons.push({ type: "identifiant", nom: mot });
      continue;
    }
    if ("+-*/^()".includes(c)) {
      jetons.push({ type: c as TypeJeton });
      i++;
      continue;
    }
    throw new Error(`Caractère inattendu : "${c}"`);
  }
  jetons.push({ type: "fin" });
  return jetons;
}

const FONCTIONS: Record<string, (v: number) => number> = {
  sqrt: Math.sqrt,
  rac: Math.sqrt,
  abs: Math.abs,
  cbrt: (v) => Math.sign(v) * Math.pow(Math.abs(v), 1 / 3),
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  arcsin: Math.asin,
  acos: Math.acos,
  arccos: Math.acos,
  atan: Math.atan,
  arctan: Math.atan,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
  // Ajoutés pour 6gen19 (chapitre 3, "Sinus et cosinus hyperboliques") — additif pur, aucune des
  // fonctions existantes n'est touchée. Définitions explicites (plutôt que `Math.sinh`/`Math.cosh`,
  // équivalentes mais moins traçables ici) : sh(u)=(e^u-e^(-u))/2, ch(u)=(e^u+e^(-u))/2.
  sh: (u: number) => (Math.exp(u) - Math.exp(-u)) / 2,
  ch: (u: number) => (Math.exp(u) + Math.exp(-u)) / 2,
};

/**
 * Comme `Math.pow`, mais gère aussi une base NÉGATIVE élevée à un exposant de la forme 1/n avec n
 * entier IMPAIR — racine réelle impaire d'un nombre négatif (ex. (-8)^(1/3) = -2), un cas où
 * `Math.pow` natif renvoie NaN bien que la racine réelle existe réellement. Introduit pour `6gen1`
 * (chapitre 1, refonte) : la réciproque d'une famille de degré impair (`(ax+b)^n` ou `a·x^n+b`, n
 * impair) s'écrit naturellement `(...)^(1/n)`, et l'image de f y est ℝ tout entier — un élève tape
 * donc légitimement cette forme pour une valeur négative, qui doit être acceptée.
 *
 * Aucun changement de comportement pour tout exposant qui n'est PAS de cette forme EXACTE
 * (tolérance 1e-9 sur l'inverse arrondi à un entier) : `Math.pow` reste utilisé tel quel dans tous
 * les autres cas, y compris une racine PAIRE d'un nombre négatif (aucune racine réelle, NaN
 * toujours renvoyé, comme avant) — additif pur, sans effet sur aucun générateur existant qui
 * n'exploite jamais une base négative avec un exposant fractionnaire (le seul cas où le résultat
 * change réellement).
 */
function puissanceReelle(base: number, exposant: number): number {
  if (base < 0 && Number.isFinite(exposant) && exposant !== 0) {
    const inverse = 1 / exposant;
    const n = Math.round(inverse);
    if (n !== 0 && Math.abs(inverse - n) < 1e-9 && n % 2 !== 0) {
      return Math.sign(base) * Math.pow(Math.abs(base), 1 / n);
    }
  }
  return Math.pow(base, exposant);
}

const MOTIF_RACINE_N = /^racine(\d+)$/;

/** Racine n-ième pour un degré ≥4 (rac2/rac3 passent par sqrt/cbrt ci-dessus) — simple alias de
 * `puissanceReelle(base, 1/n)`, qui gère déjà correctement le signe/domaine pour un exposant de la
 * forme 1/n (voir sa documentation juste au-dessus) : aucune nouvelle logique à dupliquer. */
function racineN(base: number, n: number): number {
  return puissanceReelle(base, 1 / n);
}

const MOTIF_LOG_N = /^log(\d+)$/;

/** Logarithme en base N quelconque (ex: log2(8)=3) par changement de base — base 10 passe par
 * `Math.log10` (table FONCTIONS ci-dessus), jamais par cette formule, pour éviter l'imprécision
 * flottante inutile de `Math.log(v)/Math.log(10)` face à `Math.log10` natif. */
function logN(valeur: number, base: number): number {
  return Math.log(valeur) / Math.log(base);
}

class Analyseur {
  private pos = 0;
  private readonly jetons: Jeton[];
  private readonly variables: Record<string, number>;

  constructor(jetons: Jeton[], variables: Record<string, number>) {
    this.jetons = jetons;
    this.variables = variables;
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

  analyser(): number {
    const v = this.expression();
    this.attendre("fin");
    return v;
  }

  private expression(): number {
    let v = this.terme();
    while (this.actuel().type === "+" || this.actuel().type === "-") {
      const op = this.avancer().type;
      const d = this.terme();
      v = op === "+" ? v + d : v - d;
    }
    return v;
  }

  private demarreAtome(): boolean {
    const t = this.actuel().type;
    return t === "nombre" || t === "identifiant" || t === "(";
  }

  private terme(): number {
    let v = this.facteurUnaire();
    for (;;) {
      if (this.actuel().type === "*") {
        this.avancer();
        v *= this.facteurUnaire();
        continue;
      }
      if (this.actuel().type === "/") {
        this.avancer();
        v /= this.facteurUnaire();
        continue;
      }
      if (this.demarreAtome()) {
        v *= this.facteurUnaire();
        continue;
      }
      break;
    }
    return v;
  }

  private facteurUnaire(): number {
    if (this.actuel().type === "-") {
      this.avancer();
      return -this.facteurUnaire();
    }
    if (this.actuel().type === "+") {
      this.avancer();
      return this.facteurUnaire();
    }
    return this.puissance();
  }

  private puissance(): number {
    const base = this.atome();
    if (this.actuel().type === "^") {
      this.avancer();
      return puissanceReelle(base, this.facteurUnaire());
    }
    return base;
  }

  private atome(): number {
    const t = this.actuel();
    if (t.type === "nombre") {
      this.avancer();
      return t.valeur as number;
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
      if (nom === "pi") return Math.PI;
      if (nom === "e" && !(nom in this.variables)) return Math.E;
      if (nom in this.variables) return this.variables[nom];
      if (this.actuel().type === "(") {
        this.avancer();
        const arg = this.expression();
        this.attendre(")");
        const fn = FONCTIONS[nom];
        if (fn) return fn(arg);
        const correspondanceRacineN = MOTIF_RACINE_N.exec(nom);
        if (correspondanceRacineN) return racineN(arg, Number(correspondanceRacineN[1]));
        const correspondanceLogN = MOTIF_LOG_N.exec(nom);
        if (correspondanceLogN) return logN(arg, Number(correspondanceLogN[1]));
        throw new Error(`Fonction inconnue : "${nom}"`);
      }
      throw new Error(`Identifiant inconnu : "${nom}"`);
    }
    throw new Error("Expression invalide");
  }
}

/** Lève sur toute erreur de syntaxe ; `NaN`/`Infinity` propagés nativement pour un problème de
 * domaine. `variables` : ex. `{x: 2}` ou `{t: -1}` — une variable non liée ET non `pi`/`e`/nom de
 * fonction lève "Identifiant inconnu". */
export function evaluerExpressionExponentielle(texte: string, variables: Record<string, number>): number {
  return new Analyseur(tokeniser(texte), variables).analyser();
}

/** Raccourci mono-variable `x` — le cas le plus courant. */
export function evaluerEnX(texte: string, x: number): number {
  return evaluerExpressionExponentielle(texte, { x });
}

/** Valeur numérique pure (aucune variable) — `null` sur toute erreur de syntaxe OU résultat non
 * fini (domaine invalide). */
export function evaluerValeurExponentielle(texte: string): number | null {
  try {
    const v = evaluerExpressionExponentielle(texte, {});
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}
