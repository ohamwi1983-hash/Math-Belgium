/**
 * Évaluateur générique d'expressions algébriques à une variable (x), généralisation de
 * expressionAlgebrique.ts (qui reste polynomial-only, utilisé par les exercices 1-6) pour couvrir
 * les 6 familles de référence du générateur "Transformations graphiques — fonctions de référence"
 * (chapitre 2) : puissances, racines (carrée et cubique, signées), valeur absolue, fractions.
 *
 * spec-fonctions-reference.md section 4 : "Nécessite un évaluateur d'expression général... utiliser
 * une bibliothèque d'évaluation mathématique existante plutôt qu'un parseur from scratch si
 * disponible" — aucune bibliothèque de ce type n'est présente dans l'écosystème du projet (aucune
 * dépendance mathjs/expr-eval), et le projet a déjà pour convention un évaluateur maison
 * (expressionAlgebrique.ts) ; ce module suit la même approche, étendue aux fonctions nécessaires.
 *
 * Contrairement à expressionAlgebrique.ts (comparaison de coefficients développés), ce module
 * n'expose qu'une évaluation numérique point par point — la vérification par échantillonnage
 * (src/moteur/verificationFonctionsReference.ts) compare les valeurs obtenues à celles de la
 * fonction cible, jamais une comparaison symbolique (motivé par l'incertitude sur d'éventuelles
 * équivalences de paramètres sur des fonctions non polynomiales, section 0 de la spec).
 */

type TypeJeton =
  | "NOMBRE"
  | "X"
  | "FONCTION"
  | "PLUS"
  | "MOINS"
  | "FOIS"
  | "DIVISE"
  | "PUISSANCE"
  | "PAR_OUVRANTE"
  | "PAR_FERMANTE"
  | "BARRE";

interface Jeton {
  type: TypeJeton;
  valeurNombre?: number;
  nomFonction?: string;
}

/**
 * Alias tolérés pour chaque fonction, en plus de son nom canonique anglais standard. `sin`/`cos`/
 * `tan` (chapitre 3, "Cercle trigonométrique et triangles quelconques") évaluent leur argument en
 * DEGRÉS, jamais en radians — convention exclusive de ce chapitre (angles toujours exprimés en
 * degrés, ex. `θ=210°`), contrairement à `Math.sin`/`cos`/`tan` natifs — extension purement
 * additive, aucune fonction existante modifiée.
 */
const ALIAS_FONCTIONS: Record<string, string> = {
  sqrt: "sqrt",
  racine: "sqrt",
  racinecarree: "sqrt",
  abs: "abs",
  valeurabsolue: "abs",
  cbrt: "cbrt",
  racinecubique: "cbrt",
  racine3: "cbrt",
  sin: "sin",
  cos: "cos",
  tan: "tan",
};

function tokeniser(expression: string, variables: Record<string, number>): Jeton[] {
  // Table de recherche insensible à la casse — même convention que "pi" ci-dessous (mot entier,
  // comparé en minuscules).
  const variablesMinuscules: Record<string, number> = {};
  for (const [nom, valeur] of Object.entries(variables)) variablesMinuscules[nom.toLowerCase()] = valeur;

  const jetons: Jeton[] = [];
  let i = 0;
  while (i < expression.length) {
    const c = expression[i];
    if (c === " " || c === "\t") {
      i++;
      continue;
    }
    // "," accepté comme "." dans un nombre — virgule décimale française (AUDIT-comparaison-
    // réponses.md) : la grammaire de ce module réserve déjà un jeton dédié à la virgule éventuelle
    // (aucun — les arguments de fonction sont à un seul opérande, "|...|" utilise BARRE), aucune
    // ambiguïté possible.
    if ((c >= "0" && c <= "9") || c === "." || c === ",") {
      let j = i;
      while (j < expression.length && ((expression[j] >= "0" && expression[j] <= "9") || expression[j] === "." || expression[j] === ",")) j++;
      jetons.push({ type: "NOMBRE", valeurNombre: Number(expression.slice(i, j).replace(",", ".")) });
      i = j;
      continue;
    }
    // Exposant unicode ²/³ — équivalent à ^2/^3 (correctif transversal, point 5), même principe
    // que expressionAlgebrique.ts : émet directement PUISSANCE puis le NOMBRE correspondant.
    if (c === "²" || c === "³") {
      jetons.push({ type: "PUISSANCE" });
      jetons.push({ type: "NOMBRE", valeurNombre: c === "²" ? 2 : 3 });
      i++;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < expression.length && /[a-zA-Z]/.test(expression[j])) j++;
      const mot = expression.slice(i, j);
      i = j;
      if (mot.toLowerCase() === "x") {
        jetons.push({ type: "X" });
        continue;
      }
      // "pi" traité comme un NOMBRE (π), pas comme un identifiant à part — fait bénéficier "3pi",
      // "2pi", "pi3", "-3pi/2" (coefficient collé, sans espace ni astérisque) du mécanisme de
      // multiplication implicite déjà en place pour NOMBRE via commenceUnFacteur(), sans aucun
      // changement dans Parseur. Avant ce correctif, tous les appelants pré-substituaient "pi" par
      // sa valeur via une regex `\bpi\b` AVANT d'appeler ce tokeniseur — mais `\b` ne matche jamais
      // entre deux caractères `\w` (un chiffre et une lettre en sont tous les deux), donc "3pi"
      // n'était jamais substitué et échouait ici avec "Identifiant inconnu" (audit
      // promptauditparsingpisqrt.md). Reconnaître "pi" directement ici rend ces pré-substitutions
      // inutiles (mais inoffensives si un appelant les conserve encore).
      if (mot.toLowerCase() === "pi") {
        jetons.push({ type: "NOMBRE", valeurNombre: Math.PI });
        continue;
      }
      // Variable nommée (ex: "a"/"b" pour un système à 2 inconnues, "V"/"k"/"omega"/"phi"/"t" selon
      // l'appelant) fournie via le paramètre `variables` de `evaluerExpressionGenerale` — GÉNÉRALISE
      // le traitement natif de "pi" ci-dessus à un nom arbitraire plutôt qu'un seul cas câblé en dur.
      // Même bénéfice : émise comme un NOMBRE, "3a"/"2.V"/"-3k" profitent gratuitement de la
      // multiplication implicite (commenceUnFacteur()) sans aucun changement dans Parseur — jamais
      // une pré-substitution textuelle par regex `\bnom\b` AVANT tokenisation (le bug historique de
      // "pi" ci-dessus, `\b` ne matchant jamais entre un chiffre et une lettre) : voir
      // `docs/conventions-transversales.md`, "Multiplication implicite — variable nommée".
      if (mot.toLowerCase() in variablesMinuscules) {
        jetons.push({ type: "NOMBRE", valeurNombre: variablesMinuscules[mot.toLowerCase()] });
        continue;
      }
      const canonique = ALIAS_FONCTIONS[mot.toLowerCase()];
      if (!canonique) throw new Error(`Identifiant inconnu dans l'expression : "${mot}"`);
      jetons.push({ type: "FONCTION", nomFonction: canonique });
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
      "|": "BARRE",
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

type Noeud =
  | { type: "nombre"; valeur: number }
  | { type: "x" }
  | { type: "negation"; operande: Noeud }
  | { type: "somme"; operateur: "+" | "-"; gauche: Noeud; droite: Noeud }
  | { type: "produit"; operateur: "*" | "/"; gauche: Noeud; droite: Noeud }
  | { type: "puissance"; base: Noeud; exposant: Noeud }
  | { type: "groupe"; interieur: Noeud }
  | { type: "appel"; nom: string; argument: Noeud };

class Parseur {
  private position = 0;
  private readonly jetons: Jeton[];
  /** Profondeur d'imbrication des barres de valeur absolue ouvertes mais pas encore refermées —
   * "|" sert à la fois d'ouvrante et de fermante (même jeton, contrairement à ( et )), donc
   * commenceUnFacteur() doit savoir si la prochaine BARRE rencontrée doit être lue comme "ouvre un
   * nouveau facteur implicite" (profondeur 0, ex: le "2" devant "2|x-3|") ou "referme le groupe
   * courant" (profondeur > 0, ex: la barre finale de "|x-3|" elle-même) — sans ce compteur, la
   * barre fermante était interprétée à tort comme le début d'un nouveau facteur (multiplication
   * implicite), consommant les jetons restants et levant "Expression incomplète".
   */
  private profondeurBarre = 0;

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
    if (!jeton) return false;
    if (jeton.type === "BARRE") return this.profondeurBarre === 0;
    return jeton.type === "NOMBRE" || jeton.type === "X" || jeton.type === "PAR_OUVRANTE" || jeton.type === "FONCTION";
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
    if (jeton.type === "NOMBRE") {
      return { type: "nombre", valeur: jeton.valeurNombre as number };
    }
    if (jeton.type === "X") {
      return { type: "x" };
    }
    if (jeton.type === "PAR_OUVRANTE") {
      const interieur = this.expression();
      if (this.regarder()?.type !== "PAR_FERMANTE") throw new Error("Parenthèse fermante manquante");
      this.consommer();
      return { type: "groupe", interieur };
    }
    if (jeton.type === "BARRE") {
      this.profondeurBarre++;
      const interieur = this.expression();
      if (this.regarder()?.type !== "BARRE") throw new Error("Barre de valeur absolue fermante manquante");
      this.consommer();
      this.profondeurBarre--;
      return { type: "appel", nom: "abs", argument: interieur };
    }
    if (jeton.type === "FONCTION") {
      if (this.regarder()?.type !== "PAR_OUVRANTE") throw new Error(`Parenthèse ouvrante attendue après "${jeton.nomFonction}"`);
      this.consommer();
      const argument = this.expression();
      if (this.regarder()?.type !== "PAR_FERMANTE") throw new Error("Parenthèse fermante manquante");
      this.consommer();
      return { type: "appel", nom: jeton.nomFonction as string, argument };
    }
    throw new Error("Expression mal formée");
  }
}

const TOLERANCE_FRACTION = 1e-9;
const DENOMINATEUR_MAX_FRACTION = 12;

/** Meilleure approximation p/q (q ≤ DENOMINATEUR_MAX_FRACTION) d'un exposant décimal, ou null si
 * aucune fraction simple ne correspond d'assez près — distingue un exposant "rond" tapé comme
 * "1/3" (qui retombe pile dessus à la précision flottante near) d'un exposant quelconque. */
function meilleureFraction(valeur: number): { p: number; q: number } | null {
  for (let q = 1; q <= DENOMINATEUR_MAX_FRACTION; q++) {
    const p = Math.round(valeur * q);
    if (Math.abs(valeur - p / q) < TOLERANCE_FRACTION) return { p, q };
  }
  return null;
}

/**
 * Puissance à signe préservé pour une base négative et un exposant fractionnaire — Math.pow natif
 * renvoie NaN dans ce cas (ex: Math.pow(-8, 1/3)), ce qui rejetterait à tort une saisie élève
 * mathématiquement valide écrite "x^(1/3)" plutôt que "cbrt(x)" pour la famille racine cubique
 * (spec section 1 : "ne pas utiliser une simple exponentiation qui échouerait pour les valeurs
 * négatives"). Un exposant entier passe toujours par Math.pow nativement (déjà correct pour une
 * base négative, ex: (-3)^2=9, (-3)^3=-27) ; seul un exposant non entier sur une base négative
 * déclenche la détection de fraction p/q — racine paire (q pair) reste NaN (racine réelle non
 * définie, ex: x^(1/2) pour x<0), racine impaire (q impair) réutilise |base|^(p/q) avec le signe de
 * (-1)^p.
 */
function puissance(base: number, exposant: number): number {
  if (base >= 0 || Number.isInteger(exposant)) return Math.pow(base, exposant);
  const fraction = meilleureFraction(exposant);
  if (!fraction || fraction.q % 2 === 0) return NaN;
  const magnitude = Math.pow(-base, exposant);
  return fraction.p % 2 === 0 ? magnitude : -magnitude;
}

function appliquerFonction(nom: string, valeur: number): number {
  switch (nom) {
    case "sqrt":
      return valeur < 0 ? NaN : Math.sqrt(valeur);
    case "abs":
      return Math.abs(valeur);
    case "cbrt":
      return Math.sign(valeur) * Math.pow(Math.abs(valeur), 1 / 3);
    case "sin":
      return Math.sin((valeur * Math.PI) / 180);
    case "cos":
      return Math.cos((valeur * Math.PI) / 180);
    case "tan":
      return Math.tan((valeur * Math.PI) / 180);
    default:
      throw new Error(`Fonction inconnue : "${nom}"`);
  }
}

function evaluer(noeud: Noeud, x: number): number {
  switch (noeud.type) {
    case "nombre":
      return noeud.valeur;
    case "x":
      return x;
    case "negation":
      return -evaluer(noeud.operande, x);
    case "somme":
      return noeud.operateur === "+" ? evaluer(noeud.gauche, x) + evaluer(noeud.droite, x) : evaluer(noeud.gauche, x) - evaluer(noeud.droite, x);
    case "produit":
      return noeud.operateur === "*" ? evaluer(noeud.gauche, x) * evaluer(noeud.droite, x) : evaluer(noeud.gauche, x) / evaluer(noeud.droite, x);
    case "puissance":
      return puissance(evaluer(noeud.base, x), evaluer(noeud.exposant, x));
    case "groupe":
      return evaluer(noeud.interieur, x);
    case "appel":
      return appliquerFonction(noeud.nom, evaluer(noeud.argument, x));
  }
}

/** Évalue `expression` en x, gérant +,-,*,/,^ (multiplication implicite comprise), les
 * parenthèses, sqrt/racine, abs/valeurabsolue/|...|, cbrt/racinecubique/racine3, sin/cos/tan (en
 * DEGRÉS, chapitre 3) — voir ALIAS_FONCTIONS. Lève une erreur si l'expression est syntaxiquement
 * invalide ; renvoie NaN (pas une erreur) pour une valeur hors domaine mathématique (ex: sqrt d'un
 * négatif), et Infinity/NaN pour une division par zéro, conformément au comportement natif de
 * l'arithmétique flottante — la vérification par échantillonnage (verificationFonctionsReference.ts)
 * filtre ces points via Number.isFinite plutôt que de les traiter comme une erreur de parsing.
 *
 * `variables` (optionnel, additif — tout appelant existant qui ne le fournit pas garde exactement
 * son comportement d'avant) : table nom→valeur numérique de constantes/paramètres symboliques
 * supplémentaires (ex: `{ a: 3, b: -2 }` pour un système à 2 inconnues, `{ V: 125 }` pour un volume
 * connu, `{ k: 4, n: 4 }` pour une variable libre acceptant 2 noms). Chaque nom est résolu NATIVEMENT
 * pendant la tokenisation (insensible à la casse), exactement comme "pi" — voir le commentaire dans
 * `tokeniser` ci-dessus. Généralise à un nom arbitraire ce qui était fait au cas par cas pour "pi" :
 * remplace tout mécanisme appelant de pré-substitution textuelle par regex `\bnom\b` (qui ne
 * matche jamais entre un chiffre et une lettre, cassant silencieusement "3a"/"2V"/"3k" — le même bug
 * que l'ancien traitement de "pi", voir promptauditparsingpisqrt.md) — ces call sites doivent migrer
 * vers ce paramètre plutôt que de continuer à pré-substituer.
 */
export function evaluerExpressionGenerale(expression: string, x: number, variables: Record<string, number> = {}): number {
  const noeud = new Parseur(tokeniser(expression, variables)).analyser();
  return evaluer(noeud, x);
}
