/**
 * Couche B (6e) — évaluateur d'expression FRAIS, dédié aux NOMBRES COMPLEXES. Fonde le chapitre 7
 * ("Nombres complexes") — PREMIER module de ce chapitre, structure calquée sur
 * `moteur6e/expressionExponentielle.ts` (analyseur récursif-descendant, même découpage
 * tokeniser/Analyseur/atome/puissance/terme/expression) mais réimplémenté ICI, jamais importé ni
 * étendu depuis lui : `expressionExponentielle.ts` évalue vers `number` (réel pur) et reste
 * LOAD-BEARING pour les chapitres 2-4/8 — jamais modifié par ce chapitre (CLAUDE.md, mission
 * explicite). Ce module évalue vers `Complexe` (`{re,im}`) de bout en bout — l'imaginaire `i` est un
 * jeton NUMÉRIQUE (comme `pi`/`e` dans l'évaluateur réel), jamais une variable liée.
 *
 * ============================================================================
 * **CONTRAT DE RÉUTILISATION — 6gen34 à 6gen42 (lire avant de modifier ce fichier)**
 * ============================================================================
 * Ce module (avec `verificationComplexes.ts`, qui l'enveloppe pour la comparaison à une cible) est
 * LA fondation partagée du chapitre 7 entier — 8 générateurs en aval (6gen35 à 6gen42) en dépendent
 * directement, tous sur la convention "réponse sous forme a+bi, vérification par égalité EXACTE des
 * parties réelle et imaginaire" établie par `6gen34`. API STABLE, à ne jamais changer de signature
 * sans vérifier tous les appelants :
 * - `export interface Complexe { re: number; im: number }` — la représentation numérique partout.
 * - `evaluerExpressionComplexe(texte: string): Complexe` — lève sur toute erreur de SYNTAXE
 *   (parenthèse manquante, caractère inconnu, identifiant inconnu — jamais autre chose que "i" n'est
 *   un identifiant valide dans ce module, voir plus bas) ; ne lève JAMAIS pour un résultat en soi
 *   (aucune notion de domaine invalide pour +,-,*,/ sur ℂ, contrairement au réel — seule
 *   restriction : l'exposant de `^` doit être un entier ≥0, voir plus bas).
 * - `evaluerValeurComplexe(texte: string): Complexe | null` — variante non levante (`null` sur toute
 *   erreur), mirroir exact de `evaluerValeurExponentielle`.
 *
 * ============================================================================
 * **Grammaire supportée** (délibérément SANS variable liée — aucun écran de ce chapitre, à ce jour,
 * ne pose une équation en x/z à évaluer point par point ; si un futur générateur en a besoin, un
 * module frère `expressionComplexeAvecVariable.ts` serait le bon endroit, jamais une extension
 * bricolée ici — voir `evaluerExpressionExponentielle(texte, variables)` pour le PRÉCÉDENT structurel
 * à suivre le jour où ce besoin apparaît réellement)
 * ============================================================================
 * Entiers/décimaux (`.`/`,`, notation scientifique `1.5e3` incluse — tokenizer copié-adapté
 * du fix DÉJÀ EN PLACE dans `expressionExponentielle.ts`, voir son en-tête, "notation
 * scientifique" — vérifié indépendamment ici par les tests, pas seulement copié en confiance),
 * `i` (unité imaginaire, identifiant réservé — insensible à la casse, "I" accepté), `+ - * / ^`,
 * parenthèses, unaire `+`/`-`, multiplication implicite (`2i`, `3(1+i)`, `(1+i)(1-i)`). AUCUNE
 * fonction (`sqrt`/`sin`/... hors de portée de ce chapitre — un texte contenant un identifiant
 * multi-lettres autre que `i` lève "Identifiant inconnu").
 *
 * **`^` — restriction délibérée** : seul un exposant qui s'évalue en un entier ≥0 (partie
 * imaginaire nulle, partie réelle un entier non négatif) est accepté — `(1+i)^2`, `i^3`, `i^0`
 * fonctionnent (puissance entière = multiplications répétées, calculable pour TOUT complexe, y
 * compris 0), mais `i^0.5`/`i^(-1)`/`2^i` lèvent (puissance non entière ou négative d'un complexe =
 * branche multivaluée / division déjà exprimable via `/`, hors de portée ici — jamais rencontré
 * dans les 7 familles de 6gen34, toutes des additions/produits/carrés/cubes/divisions explicites).
 * Une puissance NÉGATIVE reste exprimable via une division explicite (`1/i^3`), jamais perdue.
 */

export interface Complexe {
  re: number;
  im: number;
}

// ============================================================================
// Arithmétique complexe pure — exportée séparément, réutilisable telle quelle (ex. par la Couche A
// de 6gen34, `generateurs6e/nombresComplexes/`, Couche A ↔ Couche B jamais autorisé — voir
// `generateurs6e/nombresComplexes/arithmetiqueComplexe.ts`, qui réimplique volontairement les mêmes
// opérations plutôt que d'importer celles-ci, CLAUDE.md "moteur*/ n'importe jamais generateurs*/ et
// vice versa").
// ============================================================================

/** Neutralise `-0` (produit par ex. par `opposeComplexe({re:0,...})`) en `0` — sans ça, un texte
 * "-i" évaluerait `re` à `-0`, structurellement différent de `0` pour `Object.is`/certaines
 * comparaisons strictes en aval (ex. `toEqual` de Vitest) tout en étant mathématiquement identique
 * ; normalisé au plus près de la source plutôt que laissé fuiter vers la Couche B/l'affichage. */
function normaliserZero(v: number): number {
  return v === 0 ? 0 : v;
}
function normaliser(c: Complexe): Complexe {
  return { re: normaliserZero(c.re), im: normaliserZero(c.im) };
}

export function ajouterComplexe(a: Complexe, b: Complexe): Complexe {
  return normaliser({ re: a.re + b.re, im: a.im + b.im });
}
export function soustraireComplexe(a: Complexe, b: Complexe): Complexe {
  return normaliser({ re: a.re - b.re, im: a.im - b.im });
}
export function multiplierComplexe(a: Complexe, b: Complexe): Complexe {
  return normaliser({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
}
/** Division par le conjugué : a/b = a·conj(b) / |b|². */
export function diviserComplexe(a: Complexe, b: Complexe): Complexe {
  const denom = b.re * b.re + b.im * b.im;
  return normaliser({ re: (a.re * b.re + a.im * b.im) / denom, im: (a.im * b.re - a.re * b.im) / denom });
}
export function opposeComplexe(a: Complexe): Complexe {
  return normaliser({ re: -a.re, im: -a.im });
}
/** Puissance ENTIÈRE ≥0 (multiplications répétées) — voir en-tête de fichier pour la restriction. */
export function puissanceEntiereComplexe(base: Complexe, n: number): Complexe {
  let resultat: Complexe = { re: 1, im: 0 };
  for (let i = 0; i < n; i++) resultat = multiplierComplexe(resultat, base);
  return resultat;
}

// ============================================================================
// Tokeniseur — mêmes règles que `expressionExponentielle.ts` (chiffres/notation scientifique,
// identifiants), restreint à l'identifiant "i" à l'analyse (voir `Analyseur.atome`).
// ============================================================================

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
      // Notation scientifique — voir en-tête de fichier (fix déjà en place dans
      // `expressionExponentielle.ts`, vérifié indépendamment ici).
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
      if (nom === "i") return { re: 0, im: 1 };
      throw new Error(`Identifiant inconnu : "${nom}"`);
    }
    throw new Error("Expression invalide");
  }
}

/** Lève sur toute erreur de SYNTAXE — voir en-tête de fichier pour la grammaire supportée et la
 * restriction sur `^`. */
export function evaluerExpressionComplexe(texte: string): Complexe {
  return new Analyseur(tokeniser(texte)).analyser();
}

/** Variante non levante — `null` sur toute erreur de syntaxe (mirroir
 * `evaluerValeurExponentielle`). */
export function evaluerValeurComplexe(texte: string): Complexe | null {
  try {
    return evaluerExpressionComplexe(texte);
  } catch {
    return null;
  }
}
