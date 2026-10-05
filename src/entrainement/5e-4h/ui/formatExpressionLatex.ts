/**
 * Aperçu LaTeX en direct d'une expression libre — module transversal (4e/5e/6e), même statut que
 * `ui/mafsTransformation.ts` : consommé par `components/ApercuExpressionLatex.tsx` sur tout champ où
 * l'élève tape une expression algébrique en syntaxe texte (`/`, `^`, `sqrt(...)`, multiplication
 * implicite...) — voir `promptapercuexpressionlatex.md`.
 *
 * **Grammaire volontairement DUPLIQUÉE depuis `moteur/expressionGenerale.ts`, jamais importée** —
 * même principe que le reste du projet (dupliquer plutôt que partager un module entre deux
 * responsabilités différentes) : `expressionGenerale.ts` est un évaluateur NUMÉRIQUE dont le
 * comportement est déjà vérifié par des dizaines de générateurs (4e et 5e, `moteur5e/verification*.ts`
 * l'important directement) — le risque de régression d'un refactor partagé dépasse largement le
 * bénéfice de ne pas dupliquer ~90 lignes de tokeniseur/parseur. Cette copie diffère sur UN point
 * assumé : un identifiant inconnu (ex. "a", "k") n'est JAMAIS une erreur ici (rendu comme variable en
 * italique) — contrairement à `expressionGenerale.ts`, qui lève si l'appelant n'a pas fourni sa valeur
 * — un aperçu de saisie doit rester tolérant à un paramètre symbolique que l'élève est libre de
 * nommer, jamais bloquant sur un nom qu'il n'a pas encore "déclaré" quelque part.
 *
 * Couvre STRICTEMENT le même sous-ensemble de syntaxe que `expressionGenerale.ts`/
 * `expressionAlgebrique.ts` (leur grammaire commune, sur laquelle les deux convergent) : +, -, *, ·,
 * ×, /, ^, parenthèses, multiplication implicite, exposants unicode ²/³, sqrt/racine/racinecarree,
 * abs/valeurabsolue/|...|, cbrt/racinecubique/racine3, sin/cos/tan, pi — jamais une extension propre à
 * un domaine 6e (complexes, combinatoire...), qui nécessiterait sa PROPRE fonction d'aperçu dédiée
 * plutôt qu'une branche conditionnelle ici (voir le commentaire de tête de `ApercuExpressionLatex.tsx`).
 *
 * **Extension propre à ce module, absente d'`expressionGenerale.ts`** : un unique "=" OU symbole de
 * comparaison ("<",">","≤","≥", ou leur forme ASCII "<="/">=") optionnel au niveau le plus externe
 * ("membre gauche ◇ membre droit", ex. "(x-1)^2=16(y+2)", "x^2-2x-24<=0") — plusieurs champs du
 * projet (équation à poser/factoriser/compléter, inéquation à simplifier/isoler) attendent une
 * égalité ou une inégalité, pas une simple expression ; toute lettre autre que "x" (ex. "y") est
 * déjà tolérée comme variable symbolique (voir plus haut), ce qui couvre nativement une équation à
 * 2 variables sans changement supplémentaire. Symbole de comparaison ajouté suite à un bug
 * utilisateur du 26/09 (gen2, étape "Simplification" d'une inéquation) : sans ce support, taper le
 * symbole retourné après division par un facteur négatif (réponse par ailleurs correcte) faisait
 * échouer le tokeniseur, l'aperçu affichant alors indéfiniment son dernier rendu valide, assombri.
 */

type TypeJeton =
  | "NOMBRE"
  | "X"
  | "CONSTANTE"
  | "IDENTIFIANT"
  | "FONCTION"
  | "PLUS"
  | "MOINS"
  | "FOIS"
  | "DIVISE"
  | "PUISSANCE"
  | "PAR_OUVRANTE"
  | "PAR_FERMANTE"
  | "BARRE"
  | "EGAL"
  | "COMPARAISON";

interface Jeton {
  type: TypeJeton;
  texte?: string;
  nomFonction?: string;
  /** Symbole normalisé ("<",">","≤","≥") — uniquement pour un jeton COMPARAISON, "<="/">=" ASCII compris. */
  symboleComparaison?: "<" | ">" | "≤" | "≥";
}

/** Le nom canonique DOIT être une macro LaTeX standard valide (rendu générique `\<nom>\left(...\right)`,
 * voir `noeudVersLatex`, cas "appel") — aucune branche spéciale requise par fonction ajoutée ici. */
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
  // Ajoutés pour couvrir la grammaire de `moteur6e/expressionExponentielle.ts` (le plus réutilisé
  // du chantier 6e — exponentielles/logarithmes/hyperboliques/primitives/probabilités...) et
  // `moteur6e/expressionCyclometrique.ts` (fonctions réciproques) — voir l'inventaire 6e.
  ln: "ln",
  exp: "exp",
  sh: "sinh",
  sinh: "sinh",
  ch: "cosh",
  cosh: "cosh",
  arcsin: "arcsin",
  asin: "arcsin",
  arccos: "arccos",
  acos: "arccos",
  arctan: "arctan",
  atan: "arctan",
};

/** Constantes reconnues par leur nom — `pi` (déjà en place) + `e` (nombre d'Euler, chapitre
 * "Exponentielles" du 6e). Volontairement PAS "i" (unité imaginaire, chapitre "Nombres complexes")
 * : un identifiant inconnu se rend déjà, sans aucun ajout, exactement comme une constante (les deux
 * chemins produisent la même sortie LaTeX, `i` littéral — voir `ui6e/formatComplexesAvances.ts:88`,
 * convention déjà en place) — inutile de dupliquer un mécanisme pour un cas déjà correct. */
const MOTS_CONSTANTES: Record<string, string> = {
  pi: "\\pi",
  e: "e",
};

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
      const texteNombre = expression.slice(i, j).replace(",", ".");
      // Contrairement à `expressionGenerale.ts` (qui laisse `Number(...)` produire silencieusement
      // NaN pour un numéral mal formé, ex. "1..2", jamais vérifié au tokeniseur) : ici un aperçu
      // visuel doit rejeter ce cas explicitement plutôt que d'afficher un numéral cassé en LaTeX —
      // au plus UN point/virgule décimal, jamais deux.
      if (!/^\d*\.?\d*$/.test(texteNombre) || texteNombre === "" || texteNombre === ".") {
        throw new Error(`Nombre mal formé : "${texteNombre}"`);
      }
      jetons.push({ type: "NOMBRE", texte: texteNombre });
      i = j;
      continue;
    }
    if (c === "²" || c === "³") {
      jetons.push({ type: "PUISSANCE" });
      jetons.push({ type: "NOMBRE", texte: c === "²" ? "2" : "3" });
      i++;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      // Autorise un chiffre APRÈS la première lettre ("racine3" → un seul mot) — contrairement à
      // `expressionGenerale.ts` (`/[a-zA-Z]/` seul), qui scinderait "racine3(...)" en "racine" +
      // NOMBRE(3), rendant cet alias de `ALIAS_FONCTIONS` en pratique jamais atteignable ; corrigé
      // ici car cette copie n'a aucune raison de reproduire ce défaut latent non couvert par un test.
      while (j < expression.length && /[a-zA-Z0-9]/.test(expression[j])) j++;
      const mot = expression.slice(i, j);
      i = j;
      if (mot.toLowerCase() === "x") {
        jetons.push({ type: "X" });
        continue;
      }
      const latexConstante = MOTS_CONSTANTES[mot.toLowerCase()];
      if (latexConstante) {
        jetons.push({ type: "CONSTANTE", texte: latexConstante });
        continue;
      }
      const canonique = ALIAS_FONCTIONS[mot.toLowerCase()];
      if (canonique) {
        jetons.push({ type: "FONCTION", nomFonction: canonique });
        continue;
      }
      // Contrairement à `expressionGenerale.ts` : un identifiant inconnu n'est jamais une erreur —
      // rendu comme variable symbolique (voir commentaire de tête).
      jetons.push({ type: "IDENTIFIANT", texte: mot });
      continue;
    }
    if (c === "≤" || c === "≥") {
      jetons.push({ type: "COMPARAISON", symboleComparaison: c });
      i++;
      continue;
    }
    if (c === "<" || c === ">") {
      // Forme ASCII "<="/">=" (plus simple à taper au clavier) — jamais confondue avec "<"/">"
      // seul suivi d'un "=" d'équation séparé, puisqu'une équation/inéquation n'a jamais deux
      // symboles de comparaison à la suite (même principe que verificationInequationRationnelle.ts).
      if (expression[i + 1] === "=") {
        jetons.push({ type: "COMPARAISON", symboleComparaison: c === "<" ? "≤" : "≥" });
        i += 2;
        continue;
      }
      jetons.push({ type: "COMPARAISON", symboleComparaison: c });
      i++;
      continue;
    }
    const correspondance: Partial<Record<string, TypeJeton>> = {
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
      "=": "EGAL",
    };
    const type = correspondance[c];
    if (type) {
      jetons.push({ type });
      i++;
      continue;
    }
    throw new Error(`Caractère inattendu dans l'expression : "${c}"`);
  }
  return jetons;
}

type Noeud =
  | { type: "nombre"; texte: string }
  | { type: "x" }
  | { type: "variable"; nom: string }
  | { type: "negation"; operande: Noeud }
  | { type: "constante"; latex: string }
  | { type: "somme"; operateur: "+" | "-"; gauche: Noeud; droite: Noeud }
  | { type: "produit"; operateur: "*" | "/"; explicite: boolean; gauche: Noeud; droite: Noeud }
  | { type: "puissance"; base: Noeud; exposant: Noeud }
  | { type: "groupe"; interieur: Noeud }
  | { type: "appel"; nom: string; argument: Noeud }
  | { type: "equation"; gauche: Noeud; droite: Noeud }
  | { type: "comparaison"; symbole: "<" | ">" | "≤" | "≥"; gauche: Noeud; droite: Noeud };

class Parseur {
  private position = 0;
  private readonly jetons: Jeton[];
  private profondeurBarre = 0;

  constructor(jetons: Jeton[]) {
    this.jetons = jetons;
  }

  /** "=" ou symbole de comparaison optionnel au niveau le plus externe, jamais imbriqué (une seule
   * égalité/inégalité, jamais une chaîne "a=b=c" ou "a<b<c") — priorité la plus basse de la
   * grammaire, au-dessus même de +/-. */
  analyser(): Noeud {
    const gauche = this.expression();
    if (this.regarder()?.type === "EGAL") {
      this.consommer();
      const droite = this.expression();
      if (this.position < this.jetons.length) throw new Error("Expression mal formée");
      return { type: "equation", gauche, droite };
    }
    if (this.regarder()?.type === "COMPARAISON") {
      const symbole = this.consommer().symboleComparaison as "<" | ">" | "≤" | "≥";
      const droite = this.expression();
      if (this.position < this.jetons.length) throw new Error("Expression mal formée");
      return { type: "comparaison", symbole, gauche, droite };
    }
    if (this.position < this.jetons.length) throw new Error("Expression mal formée");
    return gauche;
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
    return jeton.type === "NOMBRE" || jeton.type === "X" || jeton.type === "CONSTANTE" || jeton.type === "IDENTIFIANT" || jeton.type === "PAR_OUVRANTE" || jeton.type === "FONCTION";
  }

  private terme(): Noeud {
    let gauche = this.unaire();
    for (;;) {
      const jeton = this.regarder();
      if (jeton?.type === "FOIS" || jeton?.type === "DIVISE") {
        const op = this.consommer().type;
        const droite = this.unaire();
        gauche = { type: "produit", operateur: op === "FOIS" ? "*" : "/", explicite: true, gauche, droite };
      } else if (this.commenceUnFacteur()) {
        const droite = this.unaire();
        gauche = { type: "produit", operateur: "*", explicite: false, gauche, droite };
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
      return { type: "nombre", texte: jeton.texte as string };
    }
    if (jeton.type === "X") {
      return { type: "x" };
    }
    if (jeton.type === "CONSTANTE") {
      return { type: "constante", latex: jeton.texte as string };
    }
    if (jeton.type === "IDENTIFIANT") {
      return { type: "variable", nom: jeton.texte as string };
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

/** Racine « atomique » au sens de la grammaire (jamais une somme/produit/négation non parenthésée) —
 * un `produit`/`puissance` n'a besoin d'aucune parenthèse ajoutée par l'imprimeur : `\frac{}{}` et
 * l'exposant en accolades `{}` groupent déjà visuellement leurs deux opérandes tels que la grammaire
 * les a acceptés (aucune ambiguïté possible, l'arbre encode déjà la priorité exacte de l'opérateur). */
function estAtomique(noeud: Noeud): boolean {
  return noeud.type !== "somme";
}

function latexGroupeSiNecessaire(noeud: Noeud): string {
  const rendu = noeudVersLatex(noeud);
  return estAtomique(noeud) ? rendu : `\\left(${rendu}\\right)`;
}

/** Un nombre décimal tapé avec une virgule française ("1,5") est déjà normalisé en point par le
 * tokeniseur — jamais réaffiché avec une virgule (LaTeX/KaTeX attend un point). */
function noeudVersLatex(noeud: Noeud): string {
  switch (noeud.type) {
    case "nombre":
      return noeud.texte;
    case "x":
      return "x";
    case "variable":
      return noeud.nom;
    case "constante":
      return noeud.latex;
    case "negation":
      return `-${latexGroupeSiNecessaire(noeud.operande)}`;
    case "somme":
      return `${noeudVersLatex(noeud.gauche)} ${noeud.operateur} ${noeudVersLatex(noeud.droite)}`;
    case "produit":
      if (noeud.operateur === "/") {
        return `\\frac{${noeudVersLatex(noeud.gauche)}}{${noeudVersLatex(noeud.droite)}}`;
      }
      // Point de multiplication affiché quand l'élève l'a tapé explicitement ("*"/"·"/"×") — jamais
      // avalé silencieusement, l'intention de l'écrire était délibérée. Sinon (multiplication
      // IMPLICITE, ex. "2x"/"2(x-3)") : juxtaposition SAUF entre deux nombres purs ("2 3" → "2 \cdot
      // 3", jamais "23"), seul cas où l'implicite resterait ambigu sans le point.
      const symbole = noeud.explicite || (noeud.gauche.type === "nombre" && noeud.droite.type === "nombre") ? " \\cdot " : "";
      return `${noeudVersLatex(noeud.gauche)}${symbole}${noeudVersLatex(noeud.droite)}`;
    case "puissance":
      return `${noeudVersLatex(noeud.base)}^{${noeudVersLatex(noeud.exposant)}}`;
    case "groupe":
      return `\\left(${noeudVersLatex(noeud.interieur)}\\right)`;
    case "appel":
      if (noeud.nom === "sqrt") return `\\sqrt{${noeudVersLatex(noeud.argument)}}`;
      if (noeud.nom === "cbrt") return `\\sqrt[3]{${noeudVersLatex(noeud.argument)}}`;
      if (noeud.nom === "abs") return `\\left|${noeudVersLatex(noeud.argument)}\\right|`;
      return `\\${noeud.nom}\\left(${noeudVersLatex(noeud.argument)}\\right)`;
    case "equation":
      return `${noeudVersLatex(noeud.gauche)} = ${noeudVersLatex(noeud.droite)}`;
    case "comparaison": {
      const latexSymbole = SYMBOLE_COMPARAISON_LATEX[noeud.symbole];
      return `${noeudVersLatex(noeud.gauche)} ${latexSymbole} ${noeudVersLatex(noeud.droite)}`;
    }
  }
}

/** "<"/">" déjà valides tels quels en LaTeX ; "≤"/"≥" ont leurs propres macros standard. */
const SYMBOLE_COMPARAISON_LATEX: Record<"<" | ">" | "≤" | "≥", string> = {
  "<": "<",
  ">": ">",
  "≤": "\\leq",
  "≥": "\\geq",
};

/**
 * Convertit une expression texte libre (même syntaxe que `expressionGenerale.ts`) en source LaTeX
 * prête pour `components/Katex.tsx` — lève une erreur si l'expression est syntaxiquement incomplète
 * ou mal formée (à l'appelant de garder le dernier rendu valide pendant la frappe, voir
 * `ApercuExpressionLatex.tsx`), jamais une chaîne partielle ou approximative.
 */
export function expressionLibreVersLatex(expression: string): string {
  const jetons = tokeniser(expression);
  const arbre = new Parseur(jetons).analyser();
  return noeudVersLatex(arbre);
}
