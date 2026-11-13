import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { ExerciceComposantes, ExerciceDecompositionVecteur, ExerciceGraphique, SystemeOption, Vec2 } from "../core/decompositionVecteur.types";
import { combinaison, lignesSysteme, nettoyer } from "../moteur/modeleDecompositionVecteur";

/**
 * Textes de gen82 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; virgule décimale ; demi-entiers en fraction. Vocabulaire du cours (section 7 et
 * exemple de la section 10) : \vec{u} = a\vec{v} + b\vec{w}, méthode du parallélogramme.
 */

export const U = "\\vec{u}";
export const V = "\\vec{v}";
export const W = "\\vec{w}";

// ---------------------------------------------------------------------------------------------
// Nombres et expressions
// ---------------------------------------------------------------------------------------------

/** Entier, ou demi-entier en fraction : 3, −2, \dfrac{1}{2}, −\dfrac{3}{2}. */
export function nombreLatex(x: number): string {
  const n = nettoyer(x);
  if (Number.isInteger(n)) return String(n);
  if (Number.isInteger(nettoyer(2 * n))) return `${n < 0 ? "-" : ""}\\dfrac{${Math.abs(nettoyer(2 * n))}}{2}`;
  return String(n).replace(".", "{,}");
}

/** Facteur entre parenthèses s'il est négatif (produits). */
export function facteurLatex(x: number): string {
  return x < 0 ? `\\left(${nombreLatex(x)}\\right)` : nombreLatex(x);
}

/** Terme « coef·inconnue » sans signe de tête (1 → « a », 3 → « 3a », 1/2 → « \dfrac{1}{2}a »). */
function termeSansSigne(coef: number, objet: string): string {
  const c = Math.abs(coef);
  return c === 1 ? objet : `${nombreLatex(c)}${objet}`;
}

/** Somme de termes : « 2a - 3b », « -a + b », « 3b » ; termes nuls omis. */
export function sommeTermes(termes: [number, string][]): string {
  let s = "";
  for (const [coef, objet] of termes) {
    if (coef === 0) continue;
    if (s === "") s = `${coef < 0 ? "-" : ""}${termeSansSigne(coef, objet)}`;
    else s += ` ${coef < 0 ? "-" : "+"} ${termeSansSigne(coef, objet)}`;
  }
  return s === "" ? "0" : s;
}

/** a\vec{v} + b\vec{w} (termes nuls omis). */
export function combinaisonLatex(a: number, b: number): string {
  return sommeTermes([
    [a, V],
    [b, W],
  ]);
}

export function composantesLatex(p: Vec2): string {
  return `\\begin{pmatrix} ${nombreLatex(p.x)} \\\\ ${nombreLatex(p.y)} \\end{pmatrix}`;
}

export function systemeLatex(lignes: [number, number, number][]): string {
  return `\\begin{cases} ${lignes.map(([a, b, c]) => `${sommeTermes([[a, "a"], [b, "b"]])} = ${nombreLatex(c)}`).join(" \\\\ ")} \\end{cases}`;
}

export function systemeOptionLatex(e: ExerciceComposantes, option: SystemeOption): string {
  return systemeLatex(lignesSysteme(e, option));
}

export function vecteurPoints(p: string, q: string): string {
  return `\\vec{${p}${q}}`;
}

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

export const CONSIGNE_GRAPHIQUE = "Décompose un vecteur selon les directions de deux vecteurs donnés, à l'aide de la figure (méthode du parallélogramme).";
export const CONSIGNE_COMPOSANTES = "Décompose un vecteur selon deux vecteurs donnés, à l'aide de leurs composantes.";

export function consigneGenerale(e: ExerciceDecompositionVecteur): string {
  return e.type === "graphique" ? CONSIGNE_GRAPHIQUE : CONSIGNE_COMPOSANTES;
}

const NOMS_FIGURES: Record<ExerciceGraphique["famille"], string> = {
  reseau: "un réseau de parallélogrammes",
  quadrillage: "un quadrillage",
  parallelogramme: "le parallélogramme ABCD, découpé par les milieux I, J, K, L de ses côtés et son centre O",
  hexagone: "l'hexagone régulier ABCDEF, de centre O",
};

export function enonceFragments(e: ExerciceDecompositionVecteur): FragmentConsigne[] {
  if (e.type === "graphique") {
    const vw: FragmentConsigne[] = e.nomsV
      ? [texte(" ; "), latex(`${V} = ${vecteurPoints(...e.nomsV)}`), texte(" et "), latex(`${W} = ${vecteurPoints(...e.nomsW!)}`)]
      : [texte(" ; les vecteurs "), latex(V), texte(" et "), latex(W), texte(" sont dessinés à part")];
    return [texte(`Sur la figure (${NOMS_FIGURES[e.famille]}) : `), latex(`${U} = ${vecteurPoints(e.origine, e.extremite)}`), ...vw, texte(".")];
  }
  return [texte("On donne "), latex(`${U}${composantesLatex(e.u)}`), texte(", "), latex(`${V}${composantesLatex(e.v)}`), texte(" et "), latex(`${W}${composantesLatex(e.w)}`), texte(".")];
}

/** Questions imprimées (énoncé papier) : la consigne globale, sans les étapes d'apprentissage. */
export function questionPapier(e: ExerciceDecompositionVecteur): FragmentConsigne[] {
  if (e.type === "graphique") {
    return [texte("Écris "), latex(U), texte(" sous la forme "), latex(`a${V} + b${W}`), texte(", où a et b sont des réels. Justifie par une construction.")];
  }
  if (e.famille === "composantes") {
    return [texte("Détermine les réels a et b tels que "), latex(`${U} = a${V} + b${W}`), texte(", puis vérifie ta réponse.")];
  }
  return [
    texte("La décomposition de "),
    latex(U),
    texte(" selon "),
    latex(V),
    texte(" et "),
    latex(W),
    texte(" est-elle possible ? Si oui, détermine les réels a et b tels que "),
    latex(`${U} = a${V} + b${W}`),
    texte(" ; sinon, justifie."),
  ];
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

export function titresEcrans(e: ExerciceDecompositionVecteur): string[] {
  if (e.type === "graphique") return ["Le point de construction M", "Le coefficient a", "Le coefficient b"];
  if (e.famille === "composantes") return ["Le système", "Résoudre le système", "Vérifier"];
  return ["Possible ou non ?", e.possible ? "Résoudre le système" : "Justifier : w = k·v"];
}

function u(e: ExerciceGraphique): string {
  return vecteurPoints(e.origine, e.extremite);
}

export function consignesEcrans(e: ExerciceDecompositionVecteur): FragmentConsigne[][] {
  if (e.type === "graphique") {
    const P = e.origine;
    const Q = e.extremite;
    return [
      [
        texte("On cherche le point M tel que "),
        latex(vecteurPoints(P, "M")),
        texte(" ait la direction de "),
        latex(V),
        texte(" et "),
        latex(vecteurPoints("M", Q)),
        texte(" celle de "),
        latex(W),
        texte(" : alors "),
        latex(`${u(e)} = ${vecteurPoints(P, "M")} + ${vecteurPoints("M", Q)}`),
        texte(". Quel point de la figure joue le rôle de M ?"),
      ],
      [texte(`Avec M = ${e.pointM}, `), latex(`${vecteurPoints(P, "M")} = a${V}`), texte(". Donne a.")],
      [latex(`${vecteurPoints("M", Q)} = b${W}`), texte(". Donne b pour compléter "), latex(`${U} = ${termePourB(e.a)} + b${W}`), texte(".")],
    ];
  }
  if (e.famille === "composantes") {
    const { a, b } = { a: e.a!, b: e.b! };
    return [
      [texte("Écrire "), latex(`${U} = a${V} + b${W}`), texte(" composante par composante donne un système. Lequel ?")],
      [texte("Résous ce système : donne a et b.")],
      [
        texte("Vérifie ta décomposition : calcule les composantes de "),
        latex(termeSansSigneSigne(a, V)),
        texte(" et de "),
        latex(termeSansSigneSigne(b, W)),
        texte(" ; leur somme doit redonner "),
        latex(U),
        texte("."),
      ],
    ];
  }
  return [
    [texte("La décomposition de "), latex(U), texte(" selon "), latex(V), texte(" et "), latex(W), texte(" est-elle possible ?")],
    e.possible
      ? [texte("Elle est possible : détermine a et b tels que "), latex(`${U} = a${V} + b${W}`), texte(".")]
      : [texte("Elle est impossible : "), latex(V), texte(" et "), latex(W), texte(" sont colinéaires. Trouve le réel k tel que "), latex(`${W} = k${V}`), texte(".")],
  ];
}

/** « 3\vec{v} », « -\vec{v} », « \dfrac{1}{2}\vec{v} » (terme isolé, signe compris). */
export function termeSansSigneSigne(coef: number, objet: string): string {
  return sommeTermes([[coef, objet]]);
}

/** Écran b : la partie déjà connue (a\vec{v}), « 0\vec{v} » écrit tel quel si a = 0. */
function termePourB(a: number): string {
  return a === 0 ? `0${V}` : termeSansSigneSigne(a, V);
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais la réponse finale : il reste toujours un calcul ou une lecture à faire)
// ---------------------------------------------------------------------------------------------

/** Équations « à une inconnue » ou multiplicateurs pour éliminer b (aide de niveau 2, corrigé). */
export interface PlanResolution {
  type: "directe" | "elimination";
  /** directe : indice (0 ou 1) de l'équation à une seule inconnue, et l'inconnue qu'elle contient. */
  equation?: number;
  inconnue?: "a" | "b";
  /** élimination : multiplicateurs (positifs) des deux équations et opération. */
  m1?: number;
  m2?: number;
  operation?: "addition" | "soustraction";
}

function pgcd(x: number, y: number): number {
  return y === 0 ? Math.abs(x) : pgcd(y, x % y);
}

export function planResolution(e: ExerciceComposantes): PlanResolution {
  const [l1, l2] = lignesSysteme(e, "correct") as [[number, number, number], [number, number, number]];
  for (const [k, l] of [l1, l2].entries()) {
    if (l[0] === 0) return { type: "directe", equation: k, inconnue: "b" };
    if (l[1] === 0) return { type: "directe", equation: k, inconnue: "a" };
  }
  const g = pgcd(Math.abs(l1[1]), Math.abs(l2[1]));
  const m1 = Math.abs(l2[1]) / g;
  const m2 = Math.abs(l1[1]) / g;
  const memeSigne = Math.sign(l1[1]) === Math.sign(l2[1]);
  return { type: "elimination", m1, m2, operation: memeSigne ? "soustraction" : "addition" };
}

function equationLatex(l: [number, number, number]): string {
  return `${sommeTermes([
    [l[0], "a"],
    [l[1], "b"],
  ])} = ${nombreLatex(l[2])}`;
}

/** Les deux équations multipliées (élimination), ou l'équation à une inconnue. */
export function premierPasResolution(e: ExerciceComposantes): FragmentConsigne[] {
  const lignes = lignesSysteme(e, "correct") as [number, number, number][];
  const plan = planResolution(e);
  if (plan.type === "directe") {
    return [texte(`L'équation (${plan.equation! + 1}) ne contient que l'inconnue ${plan.inconnue} : résous-la, puis remplace dans l'autre équation. Elle s'écrit :`), latex(equationLatex(lignes[plan.equation!]!))];
  }
  const [l1, l2] = lignes as [[number, number, number], [number, number, number]];
  const mult = (l: [number, number, number], m: number): [number, number, number] => [l[0] * m, l[1] * m, l[2] * m];
  const nom = (k: number, m: number) => (m === 1 ? `(${k})` : `(${k}) multipliée par ${m}`);
  return [
    texte(
      `Pour éliminer b, prends ${nom(1, plan.m1!)} et ${nom(2, plan.m2!)} : les termes en b ont alors le même coefficient au signe près ; ${plan.operation === "addition" ? "additionne" : "soustrais"} les deux équations membre à membre. Les deux équations deviennent :`,
    ),
    latex(`${equationLatex(mult(l1, plan.m1!))} \\quad ; \\quad ${equationLatex(mult(l2, plan.m2!))}`),
  ];
}

export function aidesEcran(e: ExerciceDecompositionVecteur, ecran: number): FragmentConsigne[][] {
  if (e.type === "graphique") return aidesGraphique(e, ecran);
  if (e.famille === "composantes") return aidesComposantes(e, ecran);
  return aidesPossible(e, ecran);
}

function aidesGraphique(e: ExerciceGraphique, ecran: number): FragmentConsigne[][] {
  const P = e.origine;
  const Q = e.extremite;
  if (ecran === 0) {
    return [
      [
        texte("Méthode du parallélogramme, en sens inverse : M est à la fois sur la parallèle à "),
        latex(V),
        texte(` menée par ${P} et sur la parallèle à `),
        latex(W),
        texte(` menée par ${Q}. Trace des parallèles, pas des perpendiculaires.`),
      ],
      [
        texte(`La droite en pointillés passe par ${P} parallèlement à `),
        latex(V),
        texte(" : M est sur cette droite. Lequel de ses points est atteint par la parallèle à "),
        latex(W),
        texte(` menée par ${Q} ?`),
      ],
    ];
  }
  const estA = ecran === 1;
  const coef = estA ? e.a : e.b;
  const nomCoef = estA ? "a" : "b";
  const vec = estA ? V : W;
  const seg = estA ? vecteurPoints(P, "M") : vecteurPoints("M", Q);
  const reel = estA ? vecteurPoints(P, e.pointM) : vecteurPoints(e.pointM, Q);
  const niveau1: FragmentConsigne[] = [
    texte(`Compare `),
    latex(`${seg} = ${reel === `\\vec{${P}${P}}` || reel === `\\vec{${Q}${Q}}` ? "\\vec{0}" : reel}`),
    texte(" à "),
    latex(vec),
    texte(` : la valeur absolue de ${nomCoef} est le nombre de fois que la longueur de `),
    latex(vec),
    texte(` tient dans ce vecteur ; ${nomCoef} est positif s'ils ont le même sens, négatif sinon. On cherche ${nomCoef} tel que :`),
    latex(`${seg} = ${nomCoef}${vec}`),
  ];
  const niveau2: FragmentConsigne[] =
    coef === 0
      ? [texte(estA ? `Ici, la parallèle à ` : `Ici, la parallèle à `), latex(estA ? W : V), texte(estA ? ` menée par ${Q} passe par ${P} lui-même : que vaut ` : ` menée par ${P} passe par ${Q} lui-même : que vaut `), latex(seg), texte(" ?")]
      : [texte("Ici, "), latex(seg), texte(" et "), latex(vec), texte(coef > 0 ? " ont le même sens." : " sont de sens contraires.")];
  return [niveau1, niveau2];
}

function aidesComposantes(e: ExerciceComposantes, ecran: number): FragmentConsigne[][] {
  if (ecran === 0) {
    return [
      [
        texte("Deux vecteurs sont égaux quand ils ont les mêmes composantes. Écris "),
        latex(`a${V} + b${W}`),
        texte(" composante par composante :"),
        latex(`a\\begin{pmatrix} x_v \\\\ y_v \\end{pmatrix} + b\\begin{pmatrix} x_w \\\\ y_w \\end{pmatrix} = \\begin{pmatrix} a\\,x_v + b\\,x_w \\\\ a\\,y_v + b\\,y_w \\end{pmatrix}`),
      ],
      [texte("La première équation n'utilise que les premières composantes de "), latex(U), texte(", "), latex(V), texte(" et "), latex(W), texte(" ; elle s'écrit :"), latex(equationLatex(lignesSysteme(e, "correct")[0]!))],
    ];
  }
  if (ecran === 1) return aidesResolution(e);
  const { a, b } = { a: e.a!, b: e.b! };
  return [
    [texte("Multiplier un vecteur par un réel, c'est multiplier chacune de ses composantes par ce réel :"), latex("k\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} k\\,x \\\\ k\\,y \\end{pmatrix}")],
    [
      texte("Ici :"),
      latex(
        `${termeSansSigneSigne(a, V)} = \\begin{pmatrix} ${facteurLatex(a)} \\times ${facteurLatex(e.v.x)} \\\\ ${facteurLatex(a)} \\times ${facteurLatex(e.v.y)} \\end{pmatrix} \\quad ; \\quad ${termeSansSigneSigne(b, W)} = \\begin{pmatrix} ${facteurLatex(b)} \\times ${facteurLatex(e.w.x)} \\\\ ${facteurLatex(b)} \\times ${facteurLatex(e.w.y)} \\end{pmatrix}`,
      ),
    ],
  ];
}

function aidesResolution(e: ExerciceComposantes): FragmentConsigne[][] {
  return [
    [
      texte("Élimine une inconnue : multiplie les équations pour que b ait le même coefficient au signe près, puis additionne-les ou soustrais-les. Le système est :"),
      latex(systemeOptionLatex(e, "correct")),
    ],
    premierPasResolution(e),
  ];
}

function aidesPossible(e: ExerciceComposantes, ecran: number): FragmentConsigne[][] {
  if (ecran === 0) {
    return [
      [
        texte("La décomposition est impossible exactement quand "),
        latex(V),
        texte(" et "),
        latex(W),
        texte(" sont colinéaires (même direction) : leurs composantes sont alors proportionnelles, c'est-à-dire :"),
        latex(`${W} = k${V}`),
      ],
      [
        texte("Compare les produits en croix des composantes de "),
        latex(V),
        texte(" et "),
        latex(W),
        texte(" ; ils sont égaux exactement quand les composantes sont proportionnelles :"),
        latex(`x_v \\cdot y_w = ${facteurLatex(e.v.x)} \\times ${facteurLatex(e.w.y)}`),
        texte(" et "),
        latex(`y_v \\cdot x_w = ${facteurLatex(e.v.y)} \\times ${facteurLatex(e.w.x)}`),
      ],
    ];
  }
  if (e.possible) return aidesResolution(e);
  return [
    [texte("Chaque composante de "), latex(W), texte(" vaut k fois la composante correspondante de "), latex(V), texte(" :"), latex("x_w = k \\cdot x_v")],
    [texte("Avec les premières composantes :"), latex(`${nombreLatex(e.w.x)} = k \\times ${facteurLatex(e.v.x)}`)],
  ];
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues et messages
// ---------------------------------------------------------------------------------------------

export function reponseAttendueFragments(e: ExerciceDecompositionVecteur, ecran: number): FragmentConsigne[] {
  if (e.type === "graphique") {
    if (ecran === 0) return [texte(`M = ${e.pointM}`)];
    if (ecran === 1) return [latex(`a = ${nombreLatex(e.a)}`)];
    return [latex(`b = ${nombreLatex(e.b)}`), texte(", donc "), latex(`${U} = ${combinaisonLatex(e.a, e.b)}`)];
  }
  if (e.famille === "composantes" || e.possible) {
    if (ecran === 0 && e.famille === "composantes") return [latex(systemeOptionLatex(e, "correct"))];
    if (ecran === 0) return [texte("Oui, elle est possible.")];
    if (ecran === 1) return [latex(`a = ${nombreLatex(e.a!)}`), texte(" et "), latex(`b = ${nombreLatex(e.b!)}`), texte(", donc "), latex(`${U} = ${combinaisonLatex(e.a!, e.b!)}`)];
    const { av, bw } = combinaison(e);
    return [latex(`${termeSansSigneSigne(e.a!, V)} = ${composantesLatex(av)}`), texte(" et "), latex(`${termeSansSigneSigne(e.b!, W)} = ${composantesLatex(bw)}`), texte(" : leur somme vaut bien "), latex(composantesLatex(e.u)), texte(".")];
  }
  if (ecran === 0) return [texte("Non, elle est impossible.")];
  return [latex(`k = ${nombreLatex(e.k!)}`), texte(" : "), latex(`${W} = ${termeSansSigneSigne(e.k!, V)}`)];
}

export function libelleOptionPoint(nom: string): string {
  return `Le point ${nom}`;
}

export const LIBELLES_VERDICT = { possible: "Oui, elle est possible", impossible: "Non, elle est impossible" } as const;

export function messageRevele(e: ExerciceDecompositionVecteur, ecran: number): string | undefined {
  if (ecran !== 0) return undefined;
  if (e.type === "graphique") return "Ce n'était pas le bon point.";
  if (e.famille === "composantes") return "Ce n'était pas le bon système.";
  return "Ce n'était pas le bon verdict.";
}

/** Message ciblé d'une tentative fausse sur a (écran 1) ou b (écran 2), `null` si rien de ciblé. */
export function messageCoefficient(e: ExerciceGraphique, ecran: 1 | 2, statut: string): FragmentConsigne[] | null {
  const estA = ecran === 1;
  const seg = estA ? vecteurPoints(e.origine, "M") : vecteurPoints("M", e.extremite);
  const vec = estA ? V : W;
  const autre = estA ? W : V;
  if (statut === "signe") return [texte("Attention au sens : "), latex(seg), texte(" et "), latex(vec), texte(" ont-ils le même sens ? S'ils sont de sens contraires, le coefficient est négatif.")];
  if (statut === "melange")
    return [texte("Ce nombre ressemble au coefficient de "), latex(autre), texte(" : ici, on compare "), latex(seg), texte(" à "), latex(vec), texte(".")];
  if (statut === "echelle") {
    const unite = e.famille === "quadrillage" || e.famille === "reseau" ? ", pas avec les côtés des cases" : "";
    return [texte("Mesure "), latex(seg), texte(" avec la longueur de "), latex(vec), texte(` comme unité${unite}.`)];
  }
  return null;
}

export function messageResolution(statut: string): FragmentConsigne[] | null {
  if (statut === "inverse") return [texte("Tu as échangé a et b : a multiplie "), latex(V), texte(", b multiplie "), latex(W), texte(".")];
  if (statut === "signe") return [texte("Les valeurs sont justes au signe près : vérifie les signes.")];
  if (statut === "une_equation") return [texte("Ta solution vérifie une seule des deux équations : elle doit vérifier les deux.")];
  return null;
}

export const MESSAGE_VERIFICATION: FragmentConsigne[] = [texte("Revois les composantes marquées en rouge : chaque composante est multipliée par le coefficient, signe compris.")];

export function messageK(statut: string): FragmentConsigne[] | null {
  if (statut === "inverse") return [texte("Ce nombre donne "), latex(`${V} = k${W}`), texte(" : ici, on cherche k tel que "), latex(`${W} = k${V}`), texte(".")];
  if (statut === "signe") return [texte("Attention au signe : "), latex(V), texte(" et "), latex(W), texte(" ont-ils le même sens ?")];
  return null;
}
