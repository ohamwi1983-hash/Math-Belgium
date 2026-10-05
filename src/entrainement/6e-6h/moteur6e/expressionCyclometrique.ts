/**
 * Couche B (6e) — évaluateur d'expression FRAIS, partagé par 6gen2/6gen3/6gen4 (réutilisation
 * intra-chantier, autorisée — contrairement à `moteur/expressionGenerale.ts` (4e), dont le
 * `sin`/`cos`/`tan` est câblé en DEGRÉS (convention exclusive du chapitre 3, 4e — voir son
 * en-tête) et qui ne reconnaît ni "pi" ni `arcsin`/`arccos`/`arctan`. Un vrai analyseur
 * récursif-descendant (jamais une substitution textuelle + scan par profondeur de parenthèses,
 * la technique `evaluerTrigRadians` déjà utilisée côté 5e) : ce générateur manipule des
 * compositions PROFONDÉMENT imbriquées de trig/arctrig (ex. `cos(arcsin(2x))`,
 * `1/sqrt(1-(3x+1)^2)`) — l'imbrication est gérée nativement par la récursion de l'analyseur,
 * jamais par un scanner de parenthèses sujet aux bugs déjà rencontrés à deux reprises sur cette
 * plateforme (voir CLAUDE.md, section 5gen10 "evaluerTrigRadians").
 *
 * Supporte : `x`, `pi`, `e`, entiers/décimaux (`.`/`,`), `+ - * / ^`, parenthèses, multiplication
 * implicite (`2x`, `2sqrt(x)`, `(x+1)(x-1)`), unicode `²`/`³`, et les fonctions
 * `sqrt`/`abs`/`sin`/`cos`/`tan`/`asin`/`arcsin`/`acos`/`arccos`/`atan`/`arctan` — `sin`/`cos`/`tan`
 * et leurs réciproques toujours en RADIANS (contexte calcul différentiel, jamais le chapitre 3).
 * Aucune exception levée pour un problème de DOMAINE (sqrt négatif, asin hors [-1;1]) — `NaN`
 * propagé nativement (`Math.sqrt`/`Math.asin`/...), comme `evaluerExpressionGenerale` ; seule une
 * erreur de SYNTAXE lève.
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
      jetons.push({ type: "nombre", valeur: Number(s.slice(i, j).replace(",", ".")) });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      jetons.push({ type: "identifiant", nom: s.slice(i, j).toLowerCase() });
      i = j;
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
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  arcsin: Math.asin,
  acos: Math.acos,
  arccos: Math.acos,
  atan: Math.atan,
  arctan: Math.atan,
};

class Analyseur {
  private pos = 0;
  private readonly jetons: Jeton[];
  private readonly x: number;

  constructor(jetons: Jeton[], x: number) {
    this.jetons = jetons;
    this.x = x;
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
      return Math.pow(base, this.facteurUnaire());
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
      if (nom === "x") return this.x;
      if (nom === "pi") return Math.PI;
      if (nom === "e") return Math.E;
      if (this.actuel().type === "(") {
        this.avancer();
        const arg = this.expression();
        this.attendre(")");
        const fn = FONCTIONS[nom];
        if (!fn) throw new Error(`Fonction inconnue : "${nom}"`);
        return fn(arg);
      }
      throw new Error(`Identifiant inconnu : "${nom}"`);
    }
    throw new Error("Expression invalide");
  }
}

/** Lève sur toute erreur de syntaxe ; `NaN`/`Infinity` propagés nativement pour un problème de
 * domaine (jamais une exception pour ceux-là). */
export function evaluerExpressionCyclometrique(texte: string, x: number): number {
  return new Analyseur(tokeniser(texte), x).analyser();
}

/** Valeur numérique pure (pas de variable x) — angle en multiple de π, valeur remarquable
 * irrationnelle... `null` sur toute erreur de syntaxe OU résultat non fini (domaine invalide). */
export function evaluerValeurCyclometrique(texte: string): number | null {
  try {
    const v = evaluerExpressionCyclometrique(texte, 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}
