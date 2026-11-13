import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type {
  ExerciceDetectiveVecteurs,
  IdDescriptionVecteurs,
  IdScenarioVecteurs,
  LigneCopie,
  Point,
  SousVarianteVecteurs,
  SupportVecteurs,
  TypeErreurVecteurs,
  ValeurLigne,
} from "../core/detectiveVecteurs.types";

/**
 * Modèle de gen91 (« Le détective d'erreurs vectoriel ») : résolution pure de l'exercice support,
 * ligne par ligne, avec ou sans le défaut du scénario. UNE seule source pour l'écran, les aides, la
 * vérification et l'adaptateur de feuilles.
 *
 * - `copieEleve(e)` : la copie fictive (le défaut est injecté à la ligne fausse ; les lignes
 *   suivantes réutilisent les valeurs FAUSSES avec la bonne méthode : la copie reste cohérente avec
 *   son erreur, verdict compris) ;
 * - `resolutionCorrecte(e)` : la même résolution, sans défaut (même nombre de lignes).
 *
 * Toutes les valeurs sont exactes (entiers, demi-entiers pour un milieu, racines carrées pour une
 * norme, fractions pour un rapport) : aucune calculatrice.
 */

export const SCENARIOS: Record<IdScenarioVecteurs, { type: TypeErreurVecteurs; support: SupportVecteurs; ligne: number; nombreLignes: number }> = {
  S1: { type: "sens", support: "relation", ligne: 0, nombreLignes: 5 },
  S2: { type: "sens", support: "relation", ligne: 1, nombreLignes: 5 },
  S3: { type: "sens", support: "parallelogramme", ligne: 1, nombreLignes: 5 },
  C1: { type: "chasles", support: "chasles", ligne: 0, nombreLignes: 4 },
  N1: { type: "norme", support: "isocele", ligne: 1, nombreLignes: 5 },
  N2: { type: "norme", support: "isocele", ligne: 3, nombreLignes: 5 },
  K1: { type: "colinearite", support: "alignement", ligne: 2, nombreLignes: 4 },
  O1: { type: "orthogonalite", support: "rectangle", ligne: 2, nombreLignes: 4 },
  P1: { type: "parallelogramme", support: "parallelogramme", ligne: 0, nombreLignes: 5 },
  P2: { type: "parallelogramme", support: "milieu", ligne: 1, nombreLignes: 4 },
};

export const SCENARIOS_PAR_TYPE: Record<TypeErreurVecteurs, IdScenarioVecteurs[]> = {
  sens: ["S1", "S2", "S3"],
  chasles: ["C1"],
  norme: ["N1", "N2"],
  colinearite: ["K1"],
  orthogonalite: ["O1"],
  parallelogramme: ["P1", "P2"],
};

export const SOUS_VARIANTES: Partial<Record<IdScenarioVecteurs, readonly Exclude<SousVarianteVecteurs, null>[]>> = {
  C1: ["difference", "enchainement"],
  N1: ["racine", "carre"],
  N2: ["racine", "carre"],
  K1: ["signe", "rapports"],
  O1: ["formule", "produit"],
};

export function typeErreur(e: { scenario: IdScenarioVecteurs }): TypeErreurVecteurs {
  return SCENARIOS[e.scenario].type;
}

export function support(e: { scenario: IdScenarioVecteurs }): SupportVecteurs {
  return SCENARIOS[e.scenario].support;
}

/** Indice (0 = ligne 1) de la ligne fausse. */
export function indiceLigneFausse(e: { scenario: IdScenarioVecteurs }): number {
  return SCENARIOS[e.scenario].ligne;
}

/** Description juste de l'erreur (écran 2). */
export function descriptionCorrecte(e: { scenario: IdScenarioVecteurs; sousVariante: SousVarianteVecteurs }): IdDescriptionVecteurs {
  switch (e.scenario) {
    case "S1":
    case "S2":
    case "S3":
      return "sens";
    case "C1":
      return e.sousVariante === "enchainement" ? "chaslesEnchainement" : "chaslesDifference";
    case "N1":
    case "N2":
      return e.sousVariante === "carre" ? "carre" : "racine";
    case "K1":
      return e.sousVariante === "rapports" ? "rapports" : "detSigne";
    case "O1":
      return e.sousVariante === "produit" ? "produitSigne" : "scalaireSigne";
    case "P1":
      return "parallelogrammeCD";
    case "P2":
      return "milieu";
  }
}

// ---------------------------------------------------------------------------------------------
// Écriture des nombres (LaTeX, virgule décimale)
// ---------------------------------------------------------------------------------------------

function estEntier(x: number): boolean {
  return Math.abs(x - Math.round(x)) < 1e-9;
}

/** Nombre LaTeX : entier, ou décimal (demi-entier d'un milieu) avec la virgule `{,}`. */
export function nb(x: number): string {
  if (estEntier(x)) {
    const r = Math.round(x);
    return String(r === 0 ? 0 : r);
  }
  const r = Math.round(x * 100) / 100;
  return String(r).replace(".", "{,}");
}

/** Facteur d'un produit ou terme soustrait : un négatif entre parenthèses. */
export function par(x: number): string {
  return x < 0 ? `(${nb(x)})` : nb(x);
}

/** « a - b » (b négatif entre parenthèses). */
function moins(a: number, b: number): string {
  return `${nb(a)} - ${par(b)}`;
}

/** « a + b » (b négatif entre parenthèses). */
function plus(a: number, b: number): string {
  return `${nb(a)} + ${par(b)}`;
}

/** Terme ajouté à une lettre : « + 3 » ou « - 3 ». */
function terme(t: number): string {
  return t < 0 ? `- ${nb(-t)}` : `+ ${nb(t)}`;
}

export function colonne(x: string, y: string): string {
  return `\\begin{pmatrix} ${x} \\\\ ${y} \\end{pmatrix}`;
}

export function pointLatex(nom: string, x: number, y: number): string {
  return `${nom}(${nb(x)}\\,;\\,${nb(y)})`;
}

/** Fraction réduite (rapport de composantes). */
function fraction(n: number, d: number): string {
  const pgcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : pgcd(b, a % b));
  const g = pgcd(n, d) || 1;
  let p = n / g;
  let q = d / g;
  if (q < 0) {
    p = -p;
    q = -q;
  }
  if (q === 1) return nb(p);
  return p < 0 ? `-\\dfrac{${-p}}{${q}}` : `\\dfrac{${p}}{${q}}`;
}

function brute(n: number, d: number): string {
  return `\\dfrac{${nb(n)}}{${nb(d)}}`;
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function vecteurValeur(quantite: string, x: number, y: number): ValeurLigne {
  return { genre: "vecteur", quantite, x, y };
}

/** Ligne « \vec{PQ} = (xQ − xP ; yQ − yP) = (… ; …) » ; `inverse` : la copie calcule P − Q. */
function ligneVecteur(nom: string, P: Point, Q: Point, inverse: boolean): LigneCopie & { x: number; y: number } {
  const [O, E] = inverse ? [Q, P] : [P, Q];
  const x = E.x - O.x;
  const y = E.y - O.y;
  const formule = `\\vec{${nom}} = ${colonne(moins(E.x, O.x), moins(E.y, O.y))}`;
  return { fragments: [l(`${formule} = ${colonne(nb(x), nb(y))}`)], valeur: vecteurValeur(`\\vec{${nom}}`, x, y), formule, x, y };
}

function lignePointFinal(nom: string, x: number, y: number, prefixe = "Conclusion : "): LigneCopie {
  return { fragments: [t(prefixe), l(pointLatex(nom, x, y)), t(".")], valeur: { genre: "point", nom, x, y }, formule: null };
}

// ---------------------------------------------------------------------------------------------
// Support « relation » : M tel que AM = AB + k·AC (S1, S2)
// ---------------------------------------------------------------------------------------------

export function relationLatex(k: number): string {
  return k > 0 ? `\\vec{AB} + ${k}\\vec{AC}` : `\\vec{AB} - ${-k}\\vec{AC}`;
}

function lignesRelation(e: ExerciceDetectiveVecteurs, fautive: boolean): LigneCopie[] {
  const { A, B, C } = e.donnees;
  const k = e.donnees.k!;
  const f = fautive ? e.scenario : null;
  const u = ligneVecteur("AB", A, B, f === "S1");
  const v = ligneVecteur("AC", A, C, f === "S2");
  const kx = k * v.x;
  const ky = k * v.y;
  const f3 = `${k}\\vec{AC} = ${colonne(`${k} \\times ${par(v.x)}`, `${k} \\times ${par(v.y)}`)}`;
  const l3: LigneCopie = { fragments: [l(`${f3} = ${colonne(nb(kx), nb(ky))}`)], valeur: vecteurValeur(`${k}\\vec{AC}`, kx, ky), formule: f3 };
  const wx = u.x + kx;
  const wy = u.y + ky;
  const f4 = `\\vec{AM} = ${relationLatex(k)} = ${colonne(plus(u.x, kx), plus(u.y, ky))}`;
  const l4: LigneCopie = { fragments: [l(`${f4} = ${colonne(nb(wx), nb(wy))}`)], valeur: vecteurValeur("\\vec{AM}", wx, wy), formule: f4 };
  const mx = A.x + wx;
  const my = A.y + wy;
  const l5: LigneCopie = {
    fragments: [
      l(`x_M = x_A ${terme(wx)} = ${nb(A.x)} ${terme(wx)} = ${nb(mx)}`),
      t(" et "),
      l(`y_M = y_A ${terme(wy)} = ${nb(A.y)} ${terme(wy)} = ${nb(my)}`),
      t(", donc "),
      l(pointLatex("M", mx, my)),
      t("."),
    ],
    valeur: { genre: "point", nom: "M", x: mx, y: my },
    formule: null,
  };
  return [u, v, l3, l4, l5];
}

// ---------------------------------------------------------------------------------------------
// Support « chasles » : M tel que DM = AB − AC (différence) ou DM = BA + CB (enchaînement) (C1)
// ---------------------------------------------------------------------------------------------

export function expressionChasles(sousVariante: SousVarianteVecteurs): string {
  return sousVariante === "enchainement" ? "\\vec{BA} + \\vec{CB}" : "\\vec{AB} - \\vec{AC}";
}

/** Vecteur réduit (nom, origine, extrémité) : juste ou celui de la copie. */
function vecteurReduit(e: ExerciceDetectiveVecteurs, fautive: boolean): { nom: string; reduction: string; O: Point; E: Point } {
  const { A, B, C } = e.donnees;
  if (e.sousVariante === "enchainement") {
    return fautive ? { nom: "AC", reduction: "\\vec{BA} + \\vec{CB} = \\vec{AC}", O: A, E: C } : { nom: "CA", reduction: "\\vec{BA} + \\vec{CB} = \\vec{CB} + \\vec{BA} = \\vec{CA}", O: C, E: A };
  }
  return fautive ? { nom: "BC", reduction: "\\vec{AB} - \\vec{AC} = \\vec{BC}", O: B, E: C } : { nom: "CB", reduction: "\\vec{AB} - \\vec{AC} = \\vec{AB} + \\vec{CA} = \\vec{CB}", O: C, E: B };
}

function lignesChasles(e: ExerciceDetectiveVecteurs, fautive: boolean): LigneCopie[] {
  const D = e.donnees.D!;
  const r = vecteurReduit(e, fautive);
  const x = r.E.x - r.O.x;
  const y = r.E.y - r.O.y;
  const formule = `${r.reduction} = ${colonne(moins(r.E.x, r.O.x), moins(r.E.y, r.O.y))}`;
  const l1: LigneCopie = { fragments: [t("Chasles : "), l(`${formule} = ${colonne(nb(x), nb(y))}`)], valeur: vecteurValeur(`\\vec{${r.nom}}`, x, y), formule };
  const mx = D.x + x;
  const my = D.y + y;
  const l2: LigneCopie = {
    fragments: [l(`\\vec{DM} = \\vec{${r.nom}}`), t(", donc "), l(`x_M = x_D ${terme(x)} = ${nb(D.x)} ${terme(x)} = ${nb(mx)}`)],
    valeur: { genre: "nombre", quantite: "x_M", valeur: mx, latex: nb(mx) },
    formule: null,
  };
  const l3: LigneCopie = {
    fragments: [t("De même, "), l(`y_M = y_D ${terme(y)} = ${nb(D.y)} ${terme(y)} = ${nb(my)}`)],
    valeur: { genre: "nombre", quantite: "y_M", valeur: my, latex: nb(my) },
    formule: null,
  };
  return [l1, l2, l3, lignePointFinal("M", mx, my)];
}

// ---------------------------------------------------------------------------------------------
// Support « isocele » : ABC est-il isocèle en A ? (N1, N2)
// ---------------------------------------------------------------------------------------------

/** Racine exacte : « \sqrt{25} = 5 » si carré parfait, « \sqrt{20} » sinon. */
export function racineLatex(n: number): string {
  const r = Math.round(Math.sqrt(n));
  return r * r === n ? `\\sqrt{${n}} = ${r}` : `\\sqrt{${n}}`;
}

/** Valeur exacte d'une norme, sous forme simplifiée (« 5 », « 2\sqrt{5} », « \sqrt{13} »). */
export function racineSimplifiee(n: number): string {
  let a = 1;
  let b = n;
  for (let d = Math.floor(Math.sqrt(n)); d >= 2; d--) {
    if (n % (d * d) === 0) {
      a = d;
      b = n / (d * d);
      break;
    }
  }
  if (b === 1) return String(a);
  return a === 1 ? `\\sqrt{${b}}` : `${a}\\sqrt{${b}}`;
}

function carreLatex(x: number): string {
  return `${par(x)}^2`;
}

/** Ligne de norme (nom « AB ») ; `defaut` : racine oubliée ou carré d'un négatif compté négatif. */
function ligneNorme(nom: string, x: number, y: number, defaut: SousVarianteVecteurs): LigneCopie {
  const somme = `${carreLatex(x)} + ${carreLatex(y)}`;
  const formule = `${nom} = \\|\\vec{${nom}}\\| = \\sqrt{${somme}}`;
  if (defaut === "racine") {
    const v = x * x + y * y;
    return {
      fragments: [l(`${nom} = \\|\\vec{${nom}}\\| = ${somme} = ${x * x} + ${y * y} = ${v}`)],
      valeur: { genre: "nombre", quantite: nom, valeur: v, latex: String(v) },
      formule,
    };
  }
  const cx = defaut === "carre" && x < 0 ? -(x * x) : x * x;
  const cy = defaut === "carre" && y < 0 ? -(y * y) : y * y;
  const n = cx + cy;
  const termes = `${nb(cx)} ${cy < 0 ? "-" : "+"} ${Math.abs(cy)}`;
  return {
    fragments: [l(`${formule} = \\sqrt{${termes}} = ${racineLatex(n)}`)],
    valeur: { genre: "nombre", quantite: nom, valeur: Math.sqrt(n), latex: racineSimplifiee(n) },
    formule,
  };
}

const VERDICT_ISOCELE = { libelleVrai: "ABC est isocèle en A", libelleFaux: "ABC n'est pas isocèle en A" };
const VERDICT_ALIGNES = { libelleVrai: "A, B et C sont alignés", libelleFaux: "A, B et C ne sont pas alignés" };
const VERDICT_RECTANGLE = { libelleVrai: "ABC est rectangle en A", libelleFaux: "ABC n'est pas rectangle en A" };

function lignesIsocele(e: ExerciceDetectiveVecteurs, fautive: boolean): LigneCopie[] {
  const { A, B, C } = e.donnees;
  const u = ligneVecteur("AB", A, B, false);
  const v = ligneVecteur("AC", A, C, false);
  const defautAB = fautive && e.scenario === "N1" ? e.sousVariante : null;
  const defautAC = fautive && e.scenario === "N2" ? e.sousVariante : null;
  const nAB = ligneNorme("AB", u.x, u.y, defautAB);
  const nAC = ligneNorme("AC", v.x, v.y, defautAC);
  const vAB = (nAB.valeur as { valeur: number }).valeur;
  const vAC = (nAC.valeur as { valeur: number }).valeur;
  const egales = Math.abs(vAB - vAC) < 1e-9;
  const conclusion: LigneCopie = {
    fragments: egales
      ? [t("Conclusion : "), l("AB = AC"), t(", donc le triangle ABC est isocèle en A.")]
      : [t("Conclusion : "), l("AB \\neq AC"), t(", donc le triangle ABC n'est pas isocèle en A.")],
    valeur: { genre: "verdict", vrai: egales, ...VERDICT_ISOCELE },
    formule: null,
  };
  return [u, nAB, v, nAC, conclusion];
}

// ---------------------------------------------------------------------------------------------
// Support « alignement » : A, B, C sont-ils alignés ? (K1)
// ---------------------------------------------------------------------------------------------

/** « 2 \times 3 - 1 \times 6 = 6 - 6 = 0 » : produits, différence (ou somme), résultat. */
function combinaison(p1: [number, number], p2: [number, number], signe: "+" | "-"): { formule: string; texte: string; valeur: number } {
  const a = p1[0] * p1[1];
  const b = p2[0] * p2[1];
  const valeur = signe === "+" ? a + b : a - b;
  const formule = `${par(p1[0])} \\times ${par(p1[1])} ${signe} ${par(p2[0])} \\times ${par(p2[1])}`;
  return { formule, texte: `${formule} = ${nb(a)} ${signe} ${par(b)} = ${nb(valeur)}`, valeur };
}

function lignesAlignement(e: ExerciceDetectiveVecteurs, fautive: boolean): LigneCopie[] {
  const { A, B, C } = e.donnees;
  const u = ligneVecteur("AB", A, B, false);
  const v = ligneVecteur("AC", A, C, false);
  const det = combinaison([u.x, v.y], [u.y, v.x], "-");
  let l3: LigneCopie;
  let alignes: boolean;
  let raison: string;
  if (fautive && e.sousVariante === "rapports") {
    const r1 = u.x / v.x;
    const r2 = v.y / u.y;
    alignes = Math.abs(r1 - r2) < 1e-9;
    const ecrire = (n: number, d: number) => {
      const b = brute(n, d);
      const s = fraction(n, d);
      return b === s ? b : `${b} = ${s}`;
    };
    l3 = { fragments: [t("Rapports des composantes : "), l(ecrire(u.x, v.x)), t(" et "), l(ecrire(v.y, u.y))], valeur: null, formule: null };
    raison = alignes ? "les rapports sont égaux" : "les rapports sont différents";
  } else {
    const c = fautive ? combinaison([u.x, v.y], [u.y, v.x], "+") : det;
    alignes = c.valeur === 0;
    l3 = { fragments: [t("Déterminant : "), l(c.texte)], valeur: { genre: "nombre", quantite: "", valeur: c.valeur, latex: nb(c.valeur) }, formule: c.formule };
    raison = alignes ? "le déterminant est nul" : "le déterminant n'est pas nul";
  }
  const conclusion: LigneCopie = {
    fragments: [t(`Conclusion : ${raison}, donc A, B et C ${alignes ? "sont alignés" : "ne sont pas alignés"}.`)],
    valeur: { genre: "verdict", vrai: alignes, ...VERDICT_ALIGNES },
    formule: null,
  };
  return [u, v, l3, conclusion];
}

/** Déterminant juste (valeur de la ligne 3 corrigée). */
export function determinant(e: ExerciceDetectiveVecteurs): number {
  const { A, B, C } = e.donnees;
  return (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
}

// ---------------------------------------------------------------------------------------------
// Support « rectangle » : ABC est-il rectangle en A ? (O1)
// ---------------------------------------------------------------------------------------------

function lignesRectangle(e: ExerciceDetectiveVecteurs, fautive: boolean): LigneCopie[] {
  const { A, B, C } = e.donnees;
  const u = ligneVecteur("AB", A, B, false);
  const v = ligneVecteur("AC", A, C, false);
  const f = fautive ? e.sousVariante : null;
  const a = u.x * v.x;
  const b = u.y * v.y;
  const formule = `\\vec{AB} \\cdot \\vec{AC} = ${par(u.x)} \\times ${par(v.x)} ${f === "formule" ? "-" : "+"} ${par(u.y)} \\times ${par(v.y)}`;
  // Défaut « produit » : un produit de deux négatifs est compté négatif.
  const pa = f === "produit" && u.x < 0 && v.x < 0 ? -a : a;
  const pb = f === "produit" && u.y < 0 && v.y < 0 && !(u.x < 0 && v.x < 0) ? -b : b;
  const valeur = f === "formule" ? a - b : pa + pb;
  const milieu = f === "formule" ? `${nb(a)} - ${par(b)}` : `${nb(pa)} + ${par(pb)}`;
  const l3: LigneCopie = {
    fragments: [t("Produit scalaire : "), l(`${formule} = ${milieu} = ${nb(valeur)}`)],
    valeur: { genre: "nombre", quantite: "\\vec{AB} \\cdot \\vec{AC}", valeur, latex: nb(valeur) },
    formule,
  };
  const rectangle = valeur === 0;
  const conclusion: LigneCopie = {
    fragments: [
      t(`Conclusion : le produit scalaire ${rectangle ? "est nul" : "n'est pas nul"}, donc le triangle ABC ${rectangle ? "est rectangle en A" : "n'est pas rectangle en A"}.`),
    ],
    valeur: { genre: "verdict", vrai: rectangle, ...VERDICT_RECTANGLE },
    formule: null,
  };
  return [u, v, l3, conclusion];
}

// ---------------------------------------------------------------------------------------------
// Support « parallelogramme » : D tel que ABCD soit un parallélogramme (P1, S3)
// ---------------------------------------------------------------------------------------------

/** « 6 - x_D » ou « x_D + 2 » : expression d'une composante avec l'inconnue. */
function avecInconnue(connu: number, inconnue: string, inconnueEnPremier: boolean): string {
  if (connu === 0) return inconnueEnPremier ? inconnue : `-${inconnue}`;
  if (!inconnueEnPremier) return `${nb(connu)} - ${inconnue}`;
  return `${inconnue} ${terme(-connu)}`;
}

function lignesParallelogramme(e: ExerciceDetectiveVecteurs, fautive: boolean): LigneCopie[] {
  const { A, B, C } = e.donnees;
  const cd = fautive && e.scenario === "P1";
  const l1: LigneCopie = { fragments: [t("ABCD est un parallélogramme, donc "), l(cd ? "\\vec{AB} = \\vec{CD}" : "\\vec{AB} = \\vec{DC}"), t(".")], valeur: null, formule: null };
  const u = ligneVecteur("AB", A, B, fautive && e.scenario === "S3");
  const nom = cd ? "CD" : "DC";
  const ex = avecInconnue(C.x, "x_D", cd);
  const ey = avecInconnue(C.y, "y_D", cd);
  const lettres = cd ? colonne("x_D - x_C", "y_D - y_C") : colonne("x_C - x_D", "y_C - y_D");
  const l3: LigneCopie = { fragments: [l(`\\vec{${nom}} = ${lettres} = ${colonne(ex, ey)}`)], valeur: null, formule: null };
  const l4: LigneCopie = { fragments: [l(`${ex} = ${nb(u.x)}`), t(" et "), l(`${ey} = ${nb(u.y)}`)], valeur: null, formule: null };
  // CD = AB ⟹ D = C + AB ; DC = AB ⟹ D = C − AB.
  const dx = cd ? C.x + u.x : C.x - u.x;
  const dy = cd ? C.y + u.y : C.y - u.y;
  const l5: LigneCopie = {
    fragments: [l(`x_D = ${nb(dx)}`), t(" et "), l(`y_D = ${nb(dy)}`), t(", donc "), l(pointLatex("D", dx, dy)), t(".")],
    valeur: { genre: "point", nom: "D", x: dx, y: dy },
    formule: null,
  };
  return [l1, u, l3, l4, l5];
}

// ---------------------------------------------------------------------------------------------
// Support « milieu » : D par les diagonales (P2)
// ---------------------------------------------------------------------------------------------

function lignesMilieu(e: ExerciceDetectiveVecteurs, fautive: boolean): LigneCopie[] {
  const { A, B, C } = e.donnees;
  const l1: LigneCopie = { fragments: [t("ABCD est un parallélogramme, donc ses diagonales [AC] et [BD] ont le même milieu M.")], valeur: null, formule: null };
  const coord = (a: number, c: number, lettre: "x" | "y") =>
    fautive
      ? { formule: `${lettre}_M = \\dfrac{${lettre}_C - ${lettre}_A}{2} = \\dfrac{${moins(c, a)}}{2}`, valeur: (c - a) / 2 }
      : { formule: `${lettre}_M = \\dfrac{${lettre}_A + ${lettre}_C}{2} = \\dfrac{${plus(a, c)}}{2}`, valeur: (a + c) / 2 };
  const mx = coord(A.x, C.x, "x");
  const my = coord(A.y, C.y, "y");
  const l2: LigneCopie = {
    fragments: [t("M milieu de [AC] : "), l(`${mx.formule} = ${nb(mx.valeur)}`), t(" et "), l(`${my.formule} = ${nb(my.valeur)}`)],
    valeur: { genre: "point", nom: "M", x: mx.valeur, y: my.valeur },
    formule: `${mx.formule} \\text{ et } ${my.formule}`,
  };
  const dx = 2 * mx.valeur - B.x;
  const dy = 2 * my.valeur - B.y;
  const l3: LigneCopie = {
    fragments: [
      t("M milieu de [BD] : "),
      l(`x_D = 2x_M - x_B = 2 \\times ${par(mx.valeur)} - ${par(B.x)} = ${nb(dx)}`),
      t(" et "),
      l(`y_D = 2y_M - y_B = 2 \\times ${par(my.valeur)} - ${par(B.y)} = ${nb(dy)}`),
    ],
    valeur: null,
    formule: null,
  };
  return [l1, l2, l3, lignePointFinal("D", dx, dy)];
}

// ---------------------------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------------------------

function lignes(e: ExerciceDetectiveVecteurs, fautive: boolean): LigneCopie[] {
  switch (support(e)) {
    case "relation":
      return lignesRelation(e, fautive);
    case "chasles":
      return lignesChasles(e, fautive);
    case "isocele":
      return lignesIsocele(e, fautive);
    case "alignement":
      return lignesAlignement(e, fautive);
    case "rectangle":
      return lignesRectangle(e, fautive);
    case "parallelogramme":
      return lignesParallelogramme(e, fautive);
    case "milieu":
      return lignesMilieu(e, fautive);
  }
}

/** La copie de l'élève fictif (une ligne fausse, la suite cohérente avec elle). */
export function copieEleve(e: ExerciceDetectiveVecteurs): LigneCopie[] {
  return lignes(e, true);
}

/** La résolution sans erreur (même nombre de lignes). */
export function resolutionCorrecte(e: ExerciceDetectiveVecteurs): LigneCopie[] {
  return lignes(e, false);
}

/**
 * Valeurs attendues à l'écran 3 : la bonne valeur de la ligne fausse (si elle en porte une et n'est
 * pas la dernière), puis la conclusion corrigée (point, ou verdict pour une question à décider).
 */
export function valeursAttendues(e: ExerciceDetectiveVecteurs): ValeurLigne[] {
  const correcte = resolutionCorrecte(e);
  const i = indiceLigneFausse(e);
  const finale = correcte[correcte.length - 1]!.valeur!;
  const ligne = correcte[i]!.valeur;
  return ligne && i < correcte.length - 1 ? [ligne, finale] : [finale];
}

/** Égalité de deux valeurs (même genre) — sert à vérifier que l'erreur se VOIT. */
export function memeValeur(a: ValeurLigne | null, b: ValeurLigne | null): boolean {
  if (!a || !b || a.genre !== b.genre) return false;
  const proche = (x: number, y: number) => Math.abs(x - y) < 1e-9;
  switch (a.genre) {
    case "nombre":
      return proche(a.valeur, (b as typeof a).valeur);
    case "vecteur":
    case "point":
      return proche(a.x, (b as typeof a).x) && proche(a.y, (b as typeof a).y);
    case "verdict":
      return a.vrai === (b as typeof a).vrai;
  }
}
