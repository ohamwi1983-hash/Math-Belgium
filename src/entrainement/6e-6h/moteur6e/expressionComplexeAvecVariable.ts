import { ajouterComplexe, diviserComplexe, multiplierComplexe, opposeComplexe, puissanceEntiereComplexe, soustraireComplexe } from "./expressionComplexe";
import type { Complexe } from "./expressionComplexe";

/**
 * Couche B (6e) — évaluateur d'expression complexe AVEC VARIABLE(S) LIÉE(S), module FRÈRE de
 * `moteur6e/expressionComplexe.ts` (`6gen34`), écrit pour `6gen42` famille C — anticipé explicitement
 * par l'en-tête de `expressionComplexe.ts` : *"si un futur générateur en a besoin, un module frère
 * `expressionComplexeAvecVariable.ts` serait le bon endroit, jamais une extension bricolée ici — voir
 * `evaluerExpressionExponentielle(texte, variables)` pour le PRÉCÉDENT structurel à suivre"*.
 *
 * ============================================================================
 * **Pourquoi ce module existe — famille C, "développer |num|²/|denom|² SANS poser z=x+yi"**
 * ============================================================================
 * L'élève doit taper une expression symbolique en `z` (ET son conjugué, noté `zb` — voir
 * ci-dessous) — jamais une valeur numérique fixe. Vérification par ÉCHANTILLONNAGE (même principe
 * que `moteur6e/verificationFormuleMoivre.ts`, généralisé à 1 variable réelle `φ` : `z=cos φ+i sin
 * φ` parcourt tout le cercle unité, `zb=cos φ-i sin φ` est son conjugué DÉRIVÉ — jamais indépendant,
 * contrairement aux 2 variables RÉELLES LIBRES `(x,i)` de Moivre) — voir
 * `moteur6e/verificationComplexesAvances.ts` pour le détail de cette adaptation.
 *
 * `zb` (ASCII, jamais `z̄`/`z_bar` — un identifiant de ce tokeniseur ne contient que `[a-zA-Z]`,
 * mêmes règles que `expressionComplexe.ts`) : nom choisi pour rester tapable au clavier, expliqué à
 * l'élève dans la consigne de l'écran (voir `ui6e/formatComplexesAvances.ts`, `consigneEcranC`).
 *
 * Reste, pour tout le reste, STRUCTURELLEMENT IDENTIQUE à `expressionComplexe.ts` (tokeniseur,
 * grammaire, restriction sur `^`) — SEULE différence : `atome()` résout un identifiant contre
 * `variables` (`Record<string,Complexe>`) AVANT de retomber sur `i` (unité imaginaire), mirroir exact
 * du patron `evaluerExpressionExponentielle`/`atome` (`expressionExponentielle.ts`, ligne
 * "nom in this.variables"). Arithmétique complexe (`ajouterComplexe`...) RÉIMPORTÉE (jamais
 * réimplémentée) depuis `expressionComplexe.ts` — même fondation, aucune divergence possible.
 */

type TypeJeton = "nombre" | "identifiant" | "+" | "-" | "*" | "/" | "^" | "(" | ")" | "fin";

interface Jeton {
  type: TypeJeton;
  valeur?: number;
  nom?: string;
}

function tokeniser(texte: string): Jeton[] {
  const s = texte;
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

class Analyseur {
  private pos = 0;
  private readonly jetons: Jeton[];
  private readonly variables: Record<string, Complexe>;

  constructor(jetons: Jeton[], variables: Record<string, Complexe>) {
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

  analyser(): Complexe {
    const v = this.expression();
    this.attendre("fin");
    return v;
  }

  private expression(): Complexe {
    let v = this.terme();
    while (this.actuel().type === "+" || this.actuel().type === "-") {
      const op = this.avancer().type;
      const d = this.terme();
      v = op === "+" ? ajouterComplexe(v, d) : soustraireComplexe(v, d);
    }
    return v;
  }

  private demarreAtome(): boolean {
    const t = this.actuel().type;
    return t === "nombre" || t === "identifiant" || t === "(";
  }

  private terme(): Complexe {
    let v = this.facteurUnaire();
    for (;;) {
      if (this.actuel().type === "*") {
        this.avancer();
        v = multiplierComplexe(v, this.facteurUnaire());
        continue;
      }
      if (this.actuel().type === "/") {
        this.avancer();
        v = diviserComplexe(v, this.facteurUnaire());
        continue;
      }
      if (this.demarreAtome()) {
        v = multiplierComplexe(v, this.facteurUnaire());
        continue;
      }
      break;
    }
    return v;
  }

  private facteurUnaire(): Complexe {
    if (this.actuel().type === "-") {
      this.avancer();
      return opposeComplexe(this.facteurUnaire());
    }
    if (this.actuel().type === "+") {
      this.avancer();
      return this.facteurUnaire();
    }
    return this.puissance();
  }

  private puissance(): Complexe {
    const base = this.atome();
    if (this.actuel().type === "^") {
      this.avancer();
      const exposant = this.facteurUnaire();
      if (exposant.im !== 0 || !Number.isInteger(exposant.re) || exposant.re < 0) {
        throw new Error("Exposant invalide : seul un entier ≥0 est accepté pour une puissance de complexe");
      }
      return puissanceEntiereComplexe(base, exposant.re);
    }
    return base;
  }

  private atome(): Complexe {
    const t = this.actuel();
    if (t.type === "nombre") {
      this.avancer();
      return { re: t.valeur as number, im: 0 };
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
      if (nom in this.variables) return this.variables[nom];
      if (nom === "i") return { re: 0, im: 1 };
      throw new Error(`Identifiant inconnu : "${nom}"`);
    }
    throw new Error("Expression invalide");
  }
}

/** Lève sur toute erreur de SYNTAXE — `variables` (ex. `{z: {re:1,im:0}, zb: {re:1,im:0}}`) résolue
 * EN PRIORITÉ sur `i` (unité imaginaire, toujours disponible en repli — voir en-tête de fichier). */
export function evaluerExpressionComplexeAvecVariable(texte: string, variables: Record<string, Complexe>): Complexe {
  return new Analyseur(tokeniser(texte), variables).analyser();
}

/** Variante non levante — `null` sur toute erreur de syntaxe. */
export function evaluerValeurComplexeAvecVariable(texte: string, variables: Record<string, Complexe>): Complexe | null {
  try {
    return evaluerExpressionComplexeAvecVariable(texte, variables);
  } catch {
    return null;
  }
}
