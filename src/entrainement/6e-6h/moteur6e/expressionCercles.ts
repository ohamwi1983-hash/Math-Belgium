import type { StatutVerification } from "../moteur/statutVerification";

/**
 * Couche B (6e) — algèbre minimale FRAÎCHE pour `6gen55` ("Cercles"), scopée aux fichiers de CE
 * générateur uniquement. Le chantier 6e n'a, à ce jour, AUCUNE infrastructure droite/cercle
 * préexistante (voir `docs/historique-6e.md`, section 6gen55) — ce module reconstruit, en plus
 * léger, ce qui est nécessaire ici plutôt que d'importer quoi que ce soit du chantier 4e
 * (`src/moteur/verificationEquationCercle.ts`, lu comme référence de CONCEPTION uniquement, jamais
 * importé — CLAUDE.md interdit tout contrat/moteur partagé entre chantiers).
 *
 * Deux briques :
 * 1. Un évaluateur arithmétique à variables nommées CONFIGURABLES (x, y, D, E, F, r selon l'écran —
 *    jamais plus d'une poignée de variables mono-lettre à la fois, aucune ambiguïté de tokenisation
 *    avec le mot-clé `sqrt`/`racine`), fractions, racine carrée, parenthèses, multiplication
 *    implicite (mirroir du patron déjà établi côté 4e dans `moteur/expressionGenerale.ts`, jamais
 *    importé pour autant — reconstruit ici en plus général sur les variables).
 * 2. Une vérification d'ÉQUIVALENCE D'ÉQUATION par ÉCHANTILLONNAGE DE RATIO : deux équations
 *    polynomiales représentent le même lieu géométrique ssi leurs membres (gauche−droite) sont
 *    proportionnels (facteur non nul, éventuellement négatif) en TOUT point — on échantillonne
 *    quelques points bien choisis (qui n'annulent pas la cible) et on vérifie un ratio constant.
 *    Fonctionne indifféremment pour une droite (degré 1) ou un cercle en forme générale (degré 2) :
 *    la méthode ne dépend pas du degré, seulement de la forme "expression = 0".
 */

// ============================================================================
// Tokenisation / parsing — expression à variables nommées.
// ============================================================================

type Jeton =
  | { type: "NOMBRE"; valeur: number }
  | { type: "VAR"; nom: string }
  | { type: "FONCTION"; nom: "sqrt" }
  | { type: "PLUS" }
  | { type: "MOINS" }
  | { type: "FOIS" }
  | { type: "DIVISE" }
  | { type: "PUISSANCE" }
  | { type: "OUVR" }
  | { type: "FERM" }
  | { type: "EGAL" };

function resoudreVariable(lettre: string, variablesAutorisees: readonly string[]): string {
  const trouve = variablesAutorisees.find((v) => v.toLowerCase() === lettre.toLowerCase());
  if (!trouve) throw new Error(`Variable inconnue dans l'expression : "${lettre}"`);
  return trouve;
}

function tokeniser(texte: string, variablesAutorisees: readonly string[]): Jeton[] {
  const jetons: Jeton[] = [];
  let i = 0;
  while (i < texte.length) {
    const c = texte[i];
    if (c === " " || c === "\t") {
      i++;
      continue;
    }
    if ((c >= "0" && c <= "9") || c === "." || c === ",") {
      let j = i;
      while (j < texte.length && ((texte[j] >= "0" && texte[j] <= "9") || texte[j] === "." || texte[j] === ",")) j++;
      // Notation scientifique ("1.5e-7", "3E+2") — UNIQUEMENT si "e"/"E" n'est pas une variable
      // autorisée sur cet écran (ambiguïté réelle pour la famille A, où "E" est une variable du
      // système D,E,F — "3E+2" y désigne bien "3 fois E, plus 2", jamais 300). Bug rencontré : un
      // résultat flottant quasi nul (ex. l'abscisse d'un centre inscrit mathématiquement nulle mais
      // entachée de bruit `Number` à 1e-16) se sérialise via `String(...)` en notation exponentielle
      // — sans ce cas, le parseur la rejetait à tort en `parse_error` (reproduit par
      // `session.integration.test.ts`, famille G, sur environ 1 tirage sur 20).
      if (j < texte.length && (texte[j] === "e" || texte[j] === "E") && !variablesAutorisees.some((v) => v.toLowerCase() === "e")) {
        let k = j + 1;
        if (texte[k] === "+" || texte[k] === "-") k++;
        const debutChiffres = k;
        while (k < texte.length && texte[k] >= "0" && texte[k] <= "9") k++;
        if (k > debutChiffres) j = k;
      }
      jetons.push({ type: "NOMBRE", valeur: Number(texte.slice(i, j).replace(",", ".")) });
      i = j;
      continue;
    }
    if (c === "²" || c === "³") {
      jetons.push({ type: "PUISSANCE" });
      jetons.push({ type: "NOMBRE", valeur: c === "²" ? 2 : 3 });
      i++;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < texte.length && /[a-zA-Z]/.test(texte[j])) j++;
      const mot = texte.slice(i, j);
      i = j;
      if (mot.toLowerCase() === "sqrt" || mot.toLowerCase() === "racine") {
        jetons.push({ type: "FONCTION", nom: "sqrt" });
        continue;
      }
      // Sinon : suite de variables mono-lettre collées (multiplication implicite, ex. "2x").
      for (const lettre of mot) {
        jetons.push({ type: "VAR", nom: resoudreVariable(lettre, variablesAutorisees) });
      }
      continue;
    }
    const correspondance: Record<string, Jeton["type"]> = {
      "+": "PLUS",
      "-": "MOINS",
      "*": "FOIS",
      "·": "FOIS",
      "×": "FOIS",
      "/": "DIVISE",
      "^": "PUISSANCE",
      "(": "OUVR",
      ")": "FERM",
      "=": "EGAL",
    };
    if (c in correspondance) {
      jetons.push({ type: correspondance[c] } as Jeton);
      i++;
      continue;
    }
    throw new Error(`Caractère inattendu dans l'expression : "${c}"`);
  }
  return jetons;
}

type Noeud =
  | { type: "nombre"; valeur: number }
  | { type: "var"; nom: string }
  | { type: "negation"; operande: Noeud }
  | { type: "somme"; operateur: "+" | "-"; gauche: Noeud; droite: Noeud }
  | { type: "produit"; operateur: "*" | "/"; gauche: Noeud; droite: Noeud }
  | { type: "puissance"; base: Noeud; exposant: Noeud }
  | { type: "groupe"; interieur: Noeud }
  | { type: "appel"; nom: "sqrt"; argument: Noeud };

interface EquationParsee {
  gauche: Noeud;
  droite: Noeud | null;
}

class Parseur {
  private position = 0;
  private readonly jetons: Jeton[];

  constructor(jetons: Jeton[]) {
    this.jetons = jetons;
  }

  analyserEquation(): EquationParsee {
    const gauche = this.expression();
    if (this.regarder()?.type === "EGAL") {
      this.consommer();
      const droite = this.expression();
      if (this.position < this.jetons.length) throw new Error("Expression mal formée après le signe =");
      return { gauche, droite };
    }
    if (this.position < this.jetons.length) throw new Error("Expression mal formée");
    return { gauche, droite: null };
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
    if (!jeton) return false;
    return jeton.type === "NOMBRE" || jeton.type === "VAR" || jeton.type === "OUVR" || jeton.type === "FONCTION";
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
    if (jeton.type === "NOMBRE") return { type: "nombre", valeur: jeton.valeur };
    if (jeton.type === "VAR") return { type: "var", nom: jeton.nom };
    if (jeton.type === "OUVR") {
      const interieur = this.expression();
      if (this.regarder()?.type !== "FERM") throw new Error("Parenthèse fermante manquante");
      this.consommer();
      return { type: "groupe", interieur };
    }
    if (jeton.type === "FONCTION") {
      if (this.regarder()?.type !== "OUVR") throw new Error(`Parenthèse ouvrante attendue après "${jeton.nom}"`);
      this.consommer();
      const argument = this.expression();
      if (this.regarder()?.type !== "FERM") throw new Error("Parenthèse fermante manquante");
      this.consommer();
      return { type: "appel", nom: jeton.nom, argument };
    }
    throw new Error("Expression mal formée");
  }
}

export type Variables = Record<string, number>;

function evaluer(noeud: Noeud, variables: Variables): number {
  switch (noeud.type) {
    case "nombre":
      return noeud.valeur;
    case "var": {
      const v = variables[noeud.nom];
      if (v === undefined) throw new Error(`Variable non fournie : "${noeud.nom}"`);
      return v;
    }
    case "negation":
      return -evaluer(noeud.operande, variables);
    case "somme":
      return noeud.operateur === "+" ? evaluer(noeud.gauche, variables) + evaluer(noeud.droite, variables) : evaluer(noeud.gauche, variables) - evaluer(noeud.droite, variables);
    case "produit":
      return noeud.operateur === "*" ? evaluer(noeud.gauche, variables) * evaluer(noeud.droite, variables) : evaluer(noeud.gauche, variables) / evaluer(noeud.droite, variables);
    case "puissance":
      return Math.pow(evaluer(noeud.base, variables), evaluer(noeud.exposant, variables));
    case "groupe":
      return evaluer(noeud.interieur, variables);
    case "appel":
      return Math.sqrt(evaluer(noeud.argument, variables));
  }
}

/** Évalue une expression arithmétique pure (pas d'équation) en substituant `variables`. Lève une
 * erreur si la syntaxe est invalide ou si une variable non listée dans `variablesAutorisees`
 * apparaît. */
export function evaluerExpressionCercles(texte: string, variables: Variables, variablesAutorisees: readonly string[]): number {
  const jetons = tokeniser(texte, variablesAutorisees);
  const parseur = new Parseur(jetons);
  const equation = parseur.analyserEquation();
  if (equation.droite !== null) throw new Error("Expression numérique attendue, pas une équation");
  return evaluer(equation.gauche, variables);
}

function parserEquation(texte: string, variablesAutorisees: readonly string[]): EquationParsee {
  const jetons = tokeniser(texte, variablesAutorisees);
  return new Parseur(jetons).analyserEquation();
}

// ============================================================================
// Diagnostics exposés — statut à 3 valeurs sur tout champ de saisie libre.
// ============================================================================

/** Champ numérique libre (peut contenir sqrt, fractions...) comparé à une valeur cible avec
 * tolérance. */
export function diagnostiquerValeurLibre(texte: string, cible: number, tolerance: number): StatutVerification {
  let valeur: number;
  try {
    valeur = evaluerExpressionCercles(texte, {}, []);
  } catch {
    return "parse_error";
  }
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= tolerance ? "correct" : "not_equivalent";
}

/** Champ à réponse LITTÉRALE (ex. "r", famille D écran 1 — le centre n'est pas encore résolu
 * numériquement) — comparaison insensible à la casse et aux espaces, jamais de `parse_error`
 * possible (une simple égalité de chaînes, pas une expression). */
export function diagnostiquerLiteral(texte: string, attendu: string): StatutVerification {
  return texte.trim().toLowerCase() === attendu.trim().toLowerCase() ? "correct" : "not_equivalent";
}

interface ResultatPoint {
  statut: StatutVerification;
  x: number;
  y: number;
}

/** Notation point `(x;y)` — CLAUDE.md, convention transversale. Tolérant sur le séparateur (`;` ou
 * `,`) et les parenthèses optionnelles ; chaque composante est elle-même une expression libre
 * (utile pour un centre irrationnel, ex. `(2+sqrt(5);-1)`). */
export function diagnostiquerPointLibre(texte: string, cibleX: number, cibleY: number, tolerance: number): ResultatPoint | { statut: "parse_error" } {
  const nettoye = texte.trim().replace(/^\(/, "").replace(/\)$/, "");
  const parties = nettoye.split(";").length === 2 ? nettoye.split(";") : nettoye.split(",");
  if (parties.length !== 2) return { statut: "parse_error" };
  let x: number;
  let y: number;
  try {
    x = evaluerExpressionCercles(parties[0], {}, []);
    y = evaluerExpressionCercles(parties[1], {}, []);
  } catch {
    return { statut: "parse_error" };
  }
  if (!Number.isFinite(x) || !Number.isFinite(y)) return { statut: "parse_error" };
  const statut: StatutVerification = Math.abs(x - cibleX) <= tolerance && Math.abs(y - cibleY) <= tolerance ? "correct" : "not_equivalent";
  return { statut, x, y };
}

interface PointCible {
  x: number;
  y: number;
}

/** Famille B écran 3 — add-as-needed, EXACTEMENT 2 centres attendus (PIÈGE CENTRAL de la famille :
 * n'en garder qu'un seul doit être rejeté). Comparaison en ENSEMBLE (ordre indifférent), bijection
 * stricte — un centre correct fourni deux fois ne "couvre" pas le second centre attendu. */
export function diagnostiquerEnsembleDeuxPoints(textes: string[], cibles: readonly [PointCible, PointCible], tolerance: number): StatutVerification {
  if (textes.length !== 2) return "not_equivalent";
  const parses = textes.map((t) => {
    const nettoye = t.trim().replace(/^\(/, "").replace(/\)$/, "");
    const parties = nettoye.split(";").length === 2 ? nettoye.split(";") : nettoye.split(",");
    if (parties.length !== 2) return null;
    try {
      const x = evaluerExpressionCercles(parties[0], {}, []);
      const y = evaluerExpressionCercles(parties[1], {}, []);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return { x, y };
    } catch {
      return null;
    }
  });
  if (parses.some((p) => p === null)) return "parse_error";
  const pts = parses as PointCible[];
  const utilise = [false, false];
  for (const p of pts) {
    let trouve = false;
    for (let i = 0; i < 2; i++) {
      if (utilise[i]) continue;
      if (Math.abs(p.x - cibles[i].x) <= tolerance && Math.abs(p.y - cibles[i].y) <= tolerance) {
        utilise[i] = true;
        trouve = true;
        break;
      }
    }
    if (!trouve) return "not_equivalent";
  }
  return "correct";
}

const TOLERANCE_RATIO_RELATIVE = 1e-4;
const SEUIL_POINT_SUR_CIBLE = 1e-6;
const SEUIL_RATIO_NUL = 1e-9;

/** Équivalence d'ÉQUATION (droite, cercle sous forme générale...) par échantillonnage de ratio —
 * voir en-tête de fichier. `cible(vars)` renvoie la valeur de "membre gauche − membre droit" de
 * l'équation ATTENDUE (calculée directement depuis les paramètres numériques déjà connus de
 * l'exercice, jamais en reparsant un texte) ; `points` est une poignée de points d'échantillonnage
 * fixes pour les variables concernées. */
export function diagnostiquerEquation(texte: string, variablesAutorisees: readonly string[], cible: (vars: Variables) => number, points: readonly Variables[]): StatutVerification {
  let equation: EquationParsee;
  try {
    equation = parserEquation(texte, variablesAutorisees);
  } catch {
    return "parse_error";
  }
  if (equation.droite === null) return "parse_error";
  const droite = equation.droite;

  let ratioRef: number | null = null;
  for (const p of points) {
    let s: number;
    try {
      s = evaluer(equation.gauche, p) - evaluer(droite, p);
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(s)) return "parse_error";
    const t = cible(p);
    if (Math.abs(t) < SEUIL_POINT_SUR_CIBLE) {
      if (Math.abs(s) > SEUIL_POINT_SUR_CIBLE * 10) return "not_equivalent";
      continue;
    }
    const ratio = s / t;
    if (ratioRef === null) {
      ratioRef = ratio;
    } else if (Math.abs(ratio - ratioRef) > TOLERANCE_RATIO_RELATIVE * Math.max(1, Math.abs(ratioRef))) {
      return "not_equivalent";
    }
  }
  if (ratioRef === null || Math.abs(ratioRef) < SEUIL_RATIO_NUL) return "not_equivalent";
  return "correct";
}
