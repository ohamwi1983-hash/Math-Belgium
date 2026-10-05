import type { Enonce } from "../core/generateur.types";
import type { StatutVerification } from "./statutVerification";

/**
 * Évaluateur générique d'expressions algébriques à une variable (x), utilisé pour vérifier
 * le champ "Factorise l'équation" sans jamais comparer de chaînes de caractères (section 4).
 * Supporte +, -, *, /, ·, ×, ^, les parenthèses et la multiplication implicite (ex: "2x",
 * "x(2x+6)", "(x-3)(x+3)"), pour un nombre quelconque de facteurs enchaînés.
 * Ne dépend d'aucune notion de catégorie ou de génération d'exercice.
 */

type TypeJeton = "NOMBRE" | "X" | "PLUS" | "MOINS" | "FOIS" | "DIVISE" | "PUISSANCE" | "PAR_OUVRANTE" | "PAR_FERMANTE";

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
    // "," accepté comme "." dans un nombre — virgule décimale française (AUDIT-comparaison-
    // réponses.md) : la grammaire de ce module n'utilise la virgule pour rien d'autre (pas de
    // séparateur d'arguments, un seul opérande par opérateur), aucune ambiguïté possible.
    if ((c >= "0" && c <= "9") || c === "." || c === ",") {
      let j = i;
      while (j < expression.length && ((expression[j] >= "0" && expression[j] <= "9") || expression[j] === "." || expression[j] === ",")) j++;
      jetons.push({ type: "NOMBRE", valeur: Number(expression.slice(i, j).replace(",", ".")) });
      i = j;
      continue;
    }
    // Exposant unicode ²/³ — équivalent à ^2/^3 (correctif transversal, point 5) : l'interface
    // affiche ces exposants sous forme de superscript rendu (KaTeX), qu'un élève peut recopier
    // littéralement via la touche dédiée d'un clavier français plutôt que taper "^2"/"^3". Émet
    // directement PUISSANCE puis le NOMBRE correspondant, sans jeton dédié : le reste de la
    // grammaire (base déjà consommée, puissance() qui regarde PUISSANCE) n'a besoin d'aucun autre
    // changement.
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

/** Arbre syntaxique minimal : assez riche pour évaluer une expression et pour inspecter sa forme. */
type Noeud =
  | { type: "nombre"; valeur: number }
  | { type: "x" }
  | { type: "negation"; operande: Noeud }
  | { type: "somme"; operateur: "+" | "-"; gauche: Noeud; droite: Noeud }
  | { type: "produit"; operateur: "*" | "/"; gauche: Noeud; droite: Noeud }
  | { type: "puissance"; base: Noeud; exposant: Noeud }
  | { type: "groupe"; interieur: Noeud };

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
    return !!jeton && (jeton.type === "NOMBRE" || jeton.type === "X" || jeton.type === "PAR_OUVRANTE");
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
      return { type: "nombre", valeur: jeton.valeur as number };
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
    throw new Error("Expression mal formée");
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
      return Math.pow(evaluer(noeud.base, x), evaluer(noeud.exposant, x));
    case "groupe":
      return evaluer(noeud.interieur, x);
  }
}

/** Dépouille les parenthèses englobantes redondantes, ex: "((x-3))" → le nœud "x-3". */
function depouiller(noeud: Noeud): Noeud {
  return noeud.type === "groupe" ? depouiller(noeud.interieur) : noeud;
}

/** Éclate un produit (à n'importe quelle profondeur d'imbrication via *, ÷ ou juxtaposition) en la liste de ses facteurs. */
function collecterFacteurs(noeud: Noeud): Noeud[] {
  const racine = depouiller(noeud);
  if (racine.type === "produit") return [...collecterFacteurs(racine.gauche), ...collecterFacteurs(racine.droite)];
  return [racine];
}

function estXExplicite(noeud: Noeud): boolean {
  return depouiller(noeud).type === "x";
}

type ClassificationFacteur =
  | { genre: "constante" }
  | { genre: "lineaire"; racine: number }
  | { genre: "puissance"; racine: number; exposant: number }
  | { genre: "inconnu" };

/**
 * Détermine si un facteur est une constante (ignorée pour l'extraction de racines), une
 * expression linéaire kx+m (racine = -m/k), ou une puissance entière d'un facteur linéaire
 * (ex: "(x-3)^2" compte comme la racine 3 prise deux fois). Le degré est déterminé en
 * échantillonnant le facteur lui-même à x=0,1,2 (pente constante = linéaire), pas en inspectant
 * la forme syntaxique — donc "3-x", "-2x-3", etc. sont tous reconnus correctement.
 *
 * Une négation en tête (ex: "-(x-3)^2") est dépouillée en premier, comme une parenthèse : elle ne
 * change ni la racine ni la multiplicité d'un facteur, seulement son signe. Sans ce dépouillage,
 * le nœud "puissance" resterait caché sous le nœud "negation" (depouiller ne défait que les
 * groupes), le cas spécial ci-dessous ne s'appliquerait jamais, et le repli générique (linéaire)
 * échouerait aussi puisque le facteur est réellement de degré 2 — extraction impossible malgré une
 * factorisation valide. Bug latent confirmé empiriquement (coefficient dominant négatif, possible
 * pour l'équation isolée des constructions "deux_denominateurs"/"deux_fractions_lineaires") avant
 * ce correctif ; jamais déclenché auparavant car les techniques historiques tirent toujours un
 * coefficient dominant positif.
 */
function classifierFacteur(noeud: Noeud): ClassificationFacteur {
  const racine = depouiller(noeud);

  if (racine.type === "negation") {
    return classifierFacteur(racine.operande);
  }

  if (racine.type === "puissance") {
    const exposant = evaluer(racine.exposant, 0);
    const base = classifierFacteur(racine.base);
    if (base.genre === "lineaire" && Number.isInteger(exposant) && exposant >= 1) {
      return { genre: "puissance", racine: base.racine, exposant };
    }
    return { genre: "inconnu" };
  }

  const f0 = evaluer(racine, 0);
  const f1 = evaluer(racine, 1);
  const f2 = evaluer(racine, 2);
  const pente1 = f1 - f0;
  const pente2 = f2 - f1;

  if (Math.abs(pente1) < 1e-9 && Math.abs(pente2) < 1e-9) return { genre: "constante" };
  if (Math.abs(pente2 - pente1) < 1e-9) return { genre: "lineaire", racine: -f0 / pente1 };
  return { genre: "inconnu" };
}

/**
 * Éclate l'expression en facteurs puis extrait la racine de chacun (les constantes n'en
 * apportent aucune, une puissance n en apporte n copies). Retourne null si un facteur n'est
 * ni constant ni linéaire ni une puissance de facteur linéaire — notamment le cas d'une
 * expression non factorisée (ex: "4x^2-9"), qui n'est composée d'aucun facteur linéaire valide.
 */
function extraireRacinesDuProduit(noeud: Noeud): number[] | null {
  const racines: number[] = [];
  for (const facteur of collecterFacteurs(noeud)) {
    const classification = classifierFacteur(facteur);
    if (classification.genre === "constante") continue;
    if (classification.genre === "lineaire") {
      racines.push(classification.racine);
      continue;
    }
    if (classification.genre === "puissance") {
      for (let i = 0; i < classification.exposant; i++) racines.push(classification.racine);
      continue;
    }
    return null;
  }
  return racines;
}

/**
 * true si l'expression est, au premier niveau, un produit d'un nombre quelconque de facteurs
 * (pas une somme/différence de termes) et que x apparaît explicitement comme l'un de ces facteurs —
 * ex: "2x(x-4)", "2·x·(x-4)", "x·2·(x-4)", "x(2x-8)" passent ; "2x^2-8x" (forme développée) échoue.
 */
function estUnProduitAvecXExplicite(noeud: Noeud): boolean {
  const racine = depouiller(noeud);
  if (racine.type === "somme") return false;
  return collecterFacteurs(racine).some(estXExplicite);
}

/**
 * Généralisation degré-agnostique de la structure "produit avec x explicite" — exportée pour être
 * réutilisée telle quelle par verifierMiseEnEvidenceCubique (exercice "inéquations rationnelles",
 * item b), qui vérifie la même contrainte structurelle sur un facteur cubique plutôt que
 * quadratique. Alias, aucune logique nouvelle : collecterFacteurs/estXExplicite ne dépendent déjà
 * d'aucun degré.
 */
export { estUnProduitAvecXExplicite };

/**
 * Extrait {a,b,c,d} si le nœud est bien un polynôme de degré 3 (ax³+bx²+cx+d), par différences
 * finies sur 6 points échantillonnés — même principe que extraireCoefficientsSiPolynomeDegre2
 * (3 inconnues à partir de 3 points, vérifiées par les 2 restants), généralisé à 4 inconnues à
 * partir de 5 points, vérifiées par le 6e. d=f(0) ; s1=(f(1)-f(-1))/2=a+c ;
 * s2=(f(2)-f(-2))/4=4a+c ; a=(s2-s1)/3 ; c=s1-a ; b=(f(1)+f(-1))/2-d ; cross-check contre f(3)
 * (prédit 27a+9b+3c+d).
 */
function extraireCoefficientsSiPolynomeDegre3(noeud: Noeud, tolerance: number): { a: number; b: number; c: number; d: number } | null {
  const [fm2, fm1, f0, f1, f2, f3] = [-2, -1, 0, 1, 2, 3].map((x) => evaluer(noeud, x));

  const d = f0;
  const s1 = (f1 - fm1) / 2;
  const s2 = (f2 - fm2) / 4;
  const a = (s2 - s1) / 3;
  const c = s1 - a;
  const b = (f1 + fm1) / 2 - d;

  const estBienUnPolynomeDeDegre3 = Math.abs(27 * a + 9 * b + 3 * c + d - f3) < tolerance;

  return estBienUnPolynomeDeDegre3 ? { a, b, c, d } : null;
}

/**
 * Généralisation de verifierMiseEnEvidence au degré 3 (exercice "inéquations rationnelles", item b) :
 * N(x) = x·(ax²+bx+c), un polynôme du 3e degré sans terme constant obtenu par mise en évidence de
 * x. `quadratique` est directement le facteur restant {a,b,c} (pas un Enonce cubique séparé — le
 * terme constant du cubique vaut toujours 0, dérivable sans stocker de champ dédié). Même principe
 * que verifierMiseEnEvidence : structure (x facteur explicite) + coefficients qui correspondent,
 * ici {a,b,c,0} plutôt que {a,b,c}.
 */
export function diagnostiquerMiseEnEvidenceCubique(
  expressionSaisie: string,
  quadratique: Enonce,
  tolerance = 1e-6,
): StatutVerification {
  let noeud: Noeud;
  try {
    noeud = new Parseur(tokeniser(retirerEgaliteAZero(expressionSaisie))).analyser();
  } catch {
    return "parse_error";
  }
  if (!estUnProduitAvecXExplicite(noeud)) return "not_equivalent";
  const coefficients = extraireCoefficientsSiPolynomeDegre3(noeud, tolerance);
  if (coefficients === null) return "not_equivalent";
  const correspond =
    Math.abs(coefficients.a - quadratique.a) < tolerance &&
    Math.abs(coefficients.b - quadratique.b) < tolerance &&
    Math.abs(coefficients.c - quadratique.c) < tolerance &&
    Math.abs(coefficients.d) < tolerance;
  return correspond ? "correct" : "not_equivalent";
}

export function verifierMiseEnEvidenceCubique(expressionSaisie: string, quadratique: Enonce, tolerance = 1e-6): boolean {
  return diagnostiquerMiseEnEvidenceCubique(expressionSaisie, quadratique, tolerance) === "correct";
}

function extraireCoefficientsSiPolynomeDegre2(noeud: Noeud, tolerance: number): { a: number; b: number; c: number } | null {
  const [fm2, fm1, f0, f1, f2] = [-2, -1, 0, 1, 2].map((x) => evaluer(noeud, x));

  const c = f0;
  const a = (f1 + fm1) / 2 - f0;
  const b = (f1 - fm1) / 2;

  const estBienUnPolynomeDeDegre2 =
    Math.abs(4 * a + 2 * b + c - f2) < tolerance && Math.abs(4 * a - 2 * b + c - fm2) < tolerance;

  return estBienUnPolynomeDeDegre2 ? { a, b, c } : null;
}

function coefficientsCorrespondent(
  coefficients: { a: number; b: number; c: number },
  enonce: Enonce,
  tolerance: number,
): boolean {
  return (
    Math.abs(coefficients.a - enonce.a) < tolerance &&
    Math.abs(coefficients.b - enonce.b) < tolerance &&
    Math.abs(coefficients.c - enonce.c) < tolerance
  );
}

export function evaluerExpression(expression: string, x: number): number {
  const noeud = new Parseur(tokeniser(expression)).analyser();
  return evaluer(noeud, x);
}

/**
 * Normalise l'exposant unicode ²/³ vers ^2/^3 — même équivalence que celle déjà appliquée
 * caractère par caractère dans le tokenizer ci-dessus, mais exposée en fonction de texte pure pour
 * les analyseurs STRUCTURELS (regex/`indexOf`, ex. `verificationFormeCanoniqueTransformations.ts`,
 * `verificationFormeCanoniqueFonctionsReference.ts`) qui cherchent le pivot "^2"/"^3" en dur dans la
 * chaîne plutôt que de tokeniser — sans cette normalisation préalable, une saisie élève avec
 * l'exposant unicode (touche dédiée d'un clavier) échoue silencieusement (AUDIT-robustesse-
 * verification-champs-libres.md, bug 1). Réutilisée telle quelle plutôt que dupliquée à nouveau
 * dans chaque analyseur structurel.
 */
export function normaliserExposantsUnicode(texte: string): string {
  return texte.replace(/²/g, "^2").replace(/³/g, "^3");
}

/**
 * Tolère qu'un élève recopie l'équation complète ("... = 0") plutôt que la seule expression
 * factorisée demandée — sans ça, le "=" (non reconnu par le tokenizer) fait échouer l'analyse
 * entière et rejette silencieusement une réponse par ailleurs correcte.
 */
function retirerEgaliteAZero(expression: string): string {
  return expression.replace(/=\s*0\s*$/, "");
}

/**
 * Vérifie qu'une expression saisie par l'élève, une fois développée, correspond au trinôme
 * ax²+bx+c de l'énoncé. Méthode : échantillonner l'expression en 5 points et résoudre pour
 * (a,b,c) à partir de 3 d'entre eux, puis valider avec les 2 autres — ce qui détecte aussi bien
 * une erreur de valeur qu'une expression qui ne serait pas un polynôme de degré 2.
 */
export function diagnostiquerFormeFactorisee(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): StatutVerification {
  let noeud: Noeud;
  try {
    noeud = new Parseur(tokeniser(retirerEgaliteAZero(expressionSaisie))).analyser();
  } catch {
    return "parse_error";
  }
  const coefficients = extraireCoefficientsSiPolynomeDegre2(noeud, tolerance);
  if (coefficients === null) return "not_equivalent";
  return coefficientsCorrespondent(coefficients, enonce, tolerance) ? "correct" : "not_equivalent";
}

export function verifierFormeFactorisee(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): boolean {
  return diagnostiquerFormeFactorisee(expressionSaisie, enonce, tolerance) === "correct";
}

/**
 * Vérification propre à la catégorie "mise_en_evidence" : en plus de la correspondance des
 * coefficients, exige que la réponse soit un produit (pas une somme de termes) où x apparaît
 * explicitement comme l'un des facteurs — pour empêcher qu'une simple recopie de la forme
 * développée (ex: "2x^2-8x") soit acceptée comme une factorisation.
 */
export function diagnostiquerMiseEnEvidence(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): StatutVerification {
  let noeud: Noeud;
  try {
    noeud = new Parseur(tokeniser(retirerEgaliteAZero(expressionSaisie))).analyser();
  } catch {
    return "parse_error";
  }
  if (!estUnProduitAvecXExplicite(noeud)) return "not_equivalent";
  const coefficients = extraireCoefficientsSiPolynomeDegre2(noeud, tolerance);
  if (coefficients === null) return "not_equivalent";
  return coefficientsCorrespondent(coefficients, enonce, tolerance) ? "correct" : "not_equivalent";
}

export function verifierMiseEnEvidence(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): boolean {
  return diagnostiquerMiseEnEvidence(expressionSaisie, enonce, tolerance) === "correct";
}

/**
 * true si le nœud est, au premier niveau, un produit (pas une somme) et que l'un de ses facteurs
 * est une constante NON triviale (|valeur| > 1) — structure attendue d'une mise en évidence d'un
 * facteur numérique commun (ex: "2(x^2-2x-24)"), à distinguer de la forme développée
 * ("2x^2-4x-48", rejetée) et d'un facteur "1" cosmétique qui n'extrairait rien
 * ("1*(2x^2-4x-48)", rejeté aussi).
 */
function estUnProduitAvecConstanteNonTrivialeExplicite(noeud: Noeud): boolean {
  const racine = depouiller(noeud);
  if (racine.type === "somme") return false;
  return collecterFacteurs(racine).some(
    (facteur) => classifierFacteur(facteur).genre === "constante" && Math.abs(evaluer(facteur, 0)) > 1 + 1e-9,
  );
}

/**
 * Vérification propre à la mise en évidence d'un facteur numérique commun — pendant de
 * `diagnostiquerMiseEnEvidence` (qui exige x comme facteur explicite) pour un facteur constant.
 * Utilisée quand le polynôme est le numérateur/dénominateur d'une FRACTION dont la valeur doit
 * rester exactement celle de l'énoncé d'origine — contrairement à une équation/inéquation
 * "...◇0", où diviser tout le polynôme par ce facteur ne changerait ni les racines ni le signe
 * (voir `moteur/verificationSimplification.ts`, `diagnostiquerMiseEnEvidenceFraction`, et le bug
 * qu'elle corrige) : compare donc à `enonce` tel quel, jamais à sa forme réduite. N'exige pas que
 * le facteur extrait soit le plus grand possible (juste non trivial) — un facteur partiel
 * resterait accepté (ex. "2(2x²-8x+8)" pour 4x²-16x+16) ; cas marginal qui reste une fraction
 * mathématiquement correcte dans tous les cas, jamais vérifié plus finement ici.
 */
export function diagnostiquerMiseEnEvidenceConstante(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): StatutVerification {
  let noeud: Noeud;
  try {
    noeud = new Parseur(tokeniser(retirerEgaliteAZero(expressionSaisie))).analyser();
  } catch {
    return "parse_error";
  }
  if (!estUnProduitAvecConstanteNonTrivialeExplicite(noeud)) return "not_equivalent";
  const coefficients = extraireCoefficientsSiPolynomeDegre2(noeud, tolerance);
  if (coefficients === null) return "not_equivalent";
  return coefficientsCorrespondent(coefficients, enonce, tolerance) ? "correct" : "not_equivalent";
}

export function verifierMiseEnEvidenceConstante(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): boolean {
  return diagnostiquerMiseEnEvidenceConstante(expressionSaisie, enonce, tolerance) === "correct";
}

/**
 * Vérification commune à "binome_conjugue" et "produit_remarquable" : extrait la racine
 * impliquée par chaque facteur du produit saisi, vérifie que le motif (racines opposées ou
 * racines identiques, selon `motifAttendu`) correspond, puis développe l'expression complète
 * comme double vérification algébrique contre les coefficients a,b,c de l'énoncé. Les deux
 * vérifications doivent réussir — la correspondance des coefficients seule ne suffit pas à
 * distinguer "non factorisé" d'une factorisation valide.
 */
function diagnostiquerFactorisationParRacines(
  expressionSaisie: string,
  enonce: Enonce,
  motifAttendu: (racine1: number, racine2: number) => boolean,
  tolerance: number,
): StatutVerification {
  let noeud: Noeud;
  try {
    noeud = new Parseur(tokeniser(retirerEgaliteAZero(expressionSaisie))).analyser();
  } catch {
    return "parse_error";
  }

  const racines = extraireRacinesDuProduit(noeud);
  if (!racines || racines.length !== 2) return "not_equivalent";
  if (!motifAttendu(racines[0], racines[1])) return "not_equivalent";

  const coefficients = extraireCoefficientsSiPolynomeDegre2(noeud, tolerance);
  if (coefficients === null) return "not_equivalent";
  return coefficientsCorrespondent(coefficients, enonce, tolerance) ? "correct" : "not_equivalent";
}

/**
 * Vérification propre à la catégorie "binome_conjugue" : les deux racines extraites doivent
 * être opposées (r et -r) — ex: "(2x-3)(2x+3)", "4(x-1.5)(x+1.5)", "(8x-12)(0.5x+0.75)".
 */
export function diagnostiquerBinomeConjugue(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): StatutVerification {
  return diagnostiquerFactorisationParRacines(
    expressionSaisie,
    enonce,
    (r1, r2) => Math.abs(r1 + r2) < tolerance && Math.abs(r1) > tolerance,
    tolerance,
  );
}

export function verifierBinomeConjugue(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): boolean {
  return diagnostiquerBinomeConjugue(expressionSaisie, enonce, tolerance) === "correct";
}

/**
 * Vérification propre à la catégorie "produit_remarquable" : les deux racines extraites
 * doivent être identiques — ex: "(x-3)^2", "(3-x)^2", "(2x-6)(0.5x-1.5)".
 */
export function diagnostiquerProduitRemarquable(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): StatutVerification {
  return diagnostiquerFactorisationParRacines(expressionSaisie, enonce, (r1, r2) => Math.abs(r1 - r2) < tolerance, tolerance);
}

export function verifierProduitRemarquable(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): boolean {
  return diagnostiquerProduitRemarquable(expressionSaisie, enonce, tolerance) === "correct";
}

/**
 * Vérification propre à la catégorie "mise_en_evidence_generalisee" : réutilise la même
 * extraction de racines par facteur que binome_conjugue/produit_remarquable (exige un produit
 * de facteurs linéaires, rejette la forme développée), mais sans exiger de motif particulier
 * entre les deux racines — elles n'ont ici aucune relation fixe (ni opposées, ni identiques).
 */
export function diagnostiquerMiseEnEvidenceGeneralisee(
  expressionSaisie: string,
  enonce: Enonce,
  tolerance = 1e-6,
): StatutVerification {
  return diagnostiquerFactorisationParRacines(expressionSaisie, enonce, () => true, tolerance);
}

export function verifierMiseEnEvidenceGeneralisee(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): boolean {
  return diagnostiquerMiseEnEvidenceGeneralisee(expressionSaisie, enonce, tolerance) === "correct";
}

/**
 * Vérifie que `coefficients` est un multiple non nul de `enonce` (même équation, à un facteur
 * d'échelle près — ex: -6x²+36x-30=0 et x²-6x+5=0 sont la même équation, correctif 1 de
 * prompt-3-simplifier-et-isolement-flexible.md). `enonce.a` est non nul pour toute équation
 * quadratique réelle, mais peut valoir 0 pour une cible linéaire bx+c=0 (chemin linéaire de
 * l'exercice "L'inconnue au dénominateur", sous-variante 3(a) — prompt-4-chemin-lineaire.md,
 * section 1) : dans ce cas, la saisie doit elle aussi n'avoir aucun terme en x², et le facteur
 * d'échelle k se calcule sur b ou c (le premier non nul de l'énoncé — b est toujours non nul en
 * pratique pour ce générateur, mais c est couvert par robustesse).
 */
function coefficientsProportionnels(
  coefficients: { a: number; b: number; c: number },
  enonce: Enonce,
  tolerance: number,
): boolean {
  if (enonce.a === 0) {
    if (Math.abs(coefficients.a) >= tolerance) return false;
    const reference = Math.abs(enonce.b) >= tolerance ? enonce.b : enonce.c;
    if (Math.abs(reference) < tolerance) return false;
    const saisieReference = reference === enonce.b ? coefficients.b : coefficients.c;
    const k = saisieReference / reference;
    if (Math.abs(k) < tolerance) return false;
    return Math.abs(coefficients.b - k * enonce.b) < tolerance && Math.abs(coefficients.c - k * enonce.c) < tolerance;
  }

  if (Math.abs(coefficients.a) < tolerance) return false;
  const k = coefficients.a / enonce.a;
  return Math.abs(coefficients.b - k * enonce.b) < tolerance && Math.abs(coefficients.c - k * enonce.c) < tolerance;
}

/**
 * Vérification propre à l'étape d'isolement : contrairement à verifierFormeFactorisee (qui
 * tolère un "= 0" final sans l'exiger), celle-ci EXIGE explicitement la structure "... = 0" —
 * une saisie algébriquement équivalente mais qui laisse un terme non nul de l'autre côté
 * (ex: "ax²+bx = -c" au lieu de "ax²+bx+c = 0") est refusée : il ne s'agit pas juste de
 * développer, mais d'isoler. Accepte **tout multiple non nul** de l'équation de référence, pas
 * l'égalité stricte des coefficients — une saisie déjà réduite (ex: par un facteur commun de -6)
 * reste correcte.
 */
type ResultatAnalyseEquation =
  | { statut: "parse_error" | "not_equivalent" }
  | { statut: "coefficients"; coefficients: { a: number; b: number; c: number } };

/**
 * Analyse commune à diagnostiquerFormeCanonique et diagnostiquerFormeReduite : exige la structure
 * "... = 0" (voir commentaire historique ci-dessous), extrait les coefficients (a,b,c) du membre
 * gauche si c'est bien un polynôme de degré 2. Les deux fonctions ne diffèrent que par la
 * comparaison finale appliquée à `coefficients` (multiple non nul vs égalité exacte).
 *
 * Structure "... = 0" manquante : la saisie n'a même pas été tentée comme équation isolée — un
 * manquement à la consigne, pas nécessairement une syntaxe illisible (le texte peut très bien
 * être un polynôme parfaitement valide, juste pas égalé à 0, ex. "x^2 - 9"). Mais un texte
 * réellement illisible (ex. "Bbb", prompt-generateurs123vague2.md, générateur 1, point 3 —
 * confirmé manquant ici avant ce correctif : "Bbb" retournait à tort "not_equivalent") doit
 * rester signalé "parse_error" même sans "= 0" final — les deux manquements sont distincts, donc
 * chaque côté d'un éventuel "=" est encore vérifié syntaxiquement avant de conclure.
 */
function analyserEquationEgaleZero(expressionSaisie: string, tolerance: number): ResultatAnalyseEquation {
  const texte = expressionSaisie.trim();
  if (!/=\s*0\s*$/.test(texte)) {
    try {
      for (const cote of texte.split("=")) {
        new Parseur(tokeniser(cote)).analyser();
      }
    } catch {
      return { statut: "parse_error" };
    }
    return { statut: "not_equivalent" };
  }

  let noeud: Noeud;
  try {
    noeud = new Parseur(tokeniser(texte.replace(/=\s*0\s*$/, ""))).analyser();
  } catch {
    return { statut: "parse_error" };
  }
  const coefficients = extraireCoefficientsSiPolynomeDegre2(noeud, tolerance);
  if (coefficients === null) return { statut: "not_equivalent" };
  return { statut: "coefficients", coefficients };
}

export function diagnostiquerFormeCanonique(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): StatutVerification {
  const resultat = analyserEquationEgaleZero(expressionSaisie, tolerance);
  if (resultat.statut !== "coefficients") return resultat.statut;
  return coefficientsProportionnels(resultat.coefficients, enonce, tolerance) ? "correct" : "not_equivalent";
}

export function verifierFormeCanonique(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): boolean {
  return diagnostiquerFormeCanonique(expressionSaisie, enonce, tolerance) === "correct";
}

/**
 * Analyse "membre gauche = membre droit" sans exiger "= 0" (contrairement à
 * analyserEquationEgaleZero, réservé à l'isolement) — nécessaire pour l'étape "simplification"
 * (gen1) : l'énoncé de départ n'est pas toujours affiché sous forme canonique (`formeAffichage`
 * peut être "isolee_constante" (ax²+bx=-c) ou "isolee_carre" (ax²=-bx-c)), et l'élève doit pouvoir
 * simplifier SANS que ça exige d'isoler en même temps — étape distincte, qui suit (voir
 * session.ts::phaseApresSimplification). Bug utilisateur du 26/09 : "x²=-11x-30", pourtant la
 * simplification correcte de "3x²=-33x-90" (isolee_carre), était rejetée par
 * analyserEquationEgaleZero faute de "= 0" explicite. Les coefficients (a,b,c) retournés sont ceux
 * de "membre gauche - membre droit" — identiques à la forme canonique quelle que soit la
 * répartition réelle des termes entre les deux membres, donc une saisie déjà canonique
 * ("x²+11x+30=0") reste également acceptée.
 */
function analyserEquationLibre(expressionSaisie: string, tolerance: number): ResultatAnalyseEquation {
  const parties = expressionSaisie.trim().split("=");
  if (parties.length !== 2) {
    try {
      for (const cote of parties) {
        new Parseur(tokeniser(cote)).analyser();
      }
    } catch {
      return { statut: "parse_error" };
    }
    return { statut: "not_equivalent" };
  }

  let gauche: Noeud;
  let droite: Noeud;
  try {
    gauche = new Parseur(tokeniser(parties[0])).analyser();
    droite = new Parseur(tokeniser(parties[1])).analyser();
  } catch {
    return { statut: "parse_error" };
  }

  const coeffGauche = extraireCoefficientsSiPolynomeDegre2(gauche, tolerance);
  const coeffDroite = extraireCoefficientsSiPolynomeDegre2(droite, tolerance);
  if (coeffGauche === null || coeffDroite === null) return { statut: "not_equivalent" };

  return {
    statut: "coefficients",
    coefficients: {
      a: coeffGauche.a - coeffDroite.a,
      b: coeffGauche.b - coeffDroite.b,
      c: coeffGauche.c - coeffDroite.c,
    },
  };
}

/**
 * Vérification propre à l'étape de simplification (nouvelle, précède désormais l'isolement quand
 * pgcd(|a|,|b|,|c|) > 1 — voir simplificationEquation.ts) : contrairement à
 * diagnostiquerFormeCanonique, qui accepte tout multiple non nul de l'équation de référence, celle-
 * ci exige l'égalité EXACTE des coefficients avec la forme réduite fournie en `enonce` — recopier
 * l'équation d'origine (non réduite) doit être refusé, puisque simplifier au maximum est
 * précisément l'objet de cette étape. Utilise analyserEquationLibre (pas analyserEquationEgaleZero)
 * : contrairement à l'isolement, cette étape n'exige jamais "= 0" (voir sa doc-string).
 */
export function diagnostiquerFormeReduite(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): StatutVerification {
  const resultat = analyserEquationLibre(expressionSaisie, tolerance);
  if (resultat.statut !== "coefficients") return resultat.statut;
  return coefficientsCorrespondent(resultat.coefficients, enonce, tolerance) ? "correct" : "not_equivalent";
}

export function verifierFormeReduite(expressionSaisie: string, enonce: Enonce, tolerance = 1e-6): boolean {
  return diagnostiquerFormeReduite(expressionSaisie, enonce, tolerance) === "correct";
}
