import type { Exercice } from "../core/generateur.types";
import type { FragmentConsigne } from "./formatEquationDroite";
import { latex, texte } from "../../export/corrigeTableau";
import { q, qp } from "./corrigeChapitre3";
import type { ChoixMethode } from "../moteur/methodeSecondDegre";
import type { ReponseZeros } from "../moteur/types";
import type { ExerciceInequation, Morceau, ReponseRacines, SolutionEnsemble } from "../core/inequation.types";
import type { SolutionEnsembleProduit } from "../core/signesProduit.types";
import { racLatex, racPuissance, trinomeDe } from "./corrigeSecondDegre1";
import type { ExerciceRelationsRacines } from "../core/relationsRacines.types";
import { diagnostiquerFormeFactorisee } from "../moteur/expressionAlgebrique";

/**
 * Aides à deux niveaux (formule en KaTeX) et messages ciblés des générateurs du chapitre 2 de 4e
 * (audit 4e ch. 2, lot B, G4). Niveau 1 : la propriété du cours ; niveau 2 : comment l'appliquer
 * sur l'instance. Jamais la réponse. Les messages ciblés reconnaissent les erreurs du cours
 * (carré de b négatif, −b oublié, dénominateur a au lieu de 2a, signe de a lu entre les racines,
 * valeur interdite incluse) dans la DERNIÈRE réponse fausse, et disent où regarder.
 */

export type Aides = FragmentConsigne[][];

const egal = (x: number, y: number) => Math.abs(x - y) < 1e-7;

function nombreLu(v: string): number | null {
  const t = v.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** « a = 2, b = −3, c = 1 » (variante irrationnelle comprise). */
export function coefficientsLatex(ex: Exercice): string {
  const t = trinomeDe(ex);
  return `a=${q(t.a)},\\ b=${racLatex(t.b)},\\ c=${q(t.c)}`;
}

// ---------------------------------------------------------------------------------------------
// Écrans communs (gen1, gen3, gen4, gen5, gen6)
// ---------------------------------------------------------------------------------------------

export function aidesSimplification(objet: "équation" | "inéquation" | "polynôme" = "équation"): Aides {
  return [
    [texte(`Diviser les deux membres d'une ${objet === "polynôme" ? "égalité" : objet} par un même nombre non nul ne change pas ses solutions :`), latex("ax^2+bx+c=0\\iff \\dfrac{a}{d}x^2+\\dfrac{b}{d}x+\\dfrac{c}{d}=0")],
    [
      texte("Cherche le plus grand nombre "),
      latex("d"),
      texte(" qui divise les trois coefficients, puis divise chacun par "),
      latex("d"),
      texte(objet === "inéquation" ? ". Si tu divises par un nombre négatif, le symbole change de sens." : ". Garde « = 0 »."),
    ],
  ];
}

export function aidesIsolement(produitNonDeveloppe: boolean): Aides {
  return [
    [texte("Ajouter ou soustraire un même terme aux deux membres donne une équation équivalente :"), latex("A=B\\iff A-B=0")],
    [
      texte("Soustrais tout le second membre aux deux membres (attention aux signes), pour obtenir "),
      latex("\\ldots=0"),
      texte(produitNonDeveloppe ? ". Ne développe pas encore le produit ni le carré." : "."),
    ],
  ];
}

export function aidesDevelopper(): Aides {
  return [
    [texte("Distributivité :"), latex("x(x+b)=x^2+bx")],
    [texte("Distribue, puis regroupe les termes de même degré pour obtenir "), latex("ax^2+bx+c=0"), texte(".")],
  ];
}

export function aidesMethode(): Aides {
  return [
    [
      texte("Avant le discriminant, teste les raccourcis du cours dans l'ordre : "),
      latex("c=0"),
      texte(", puis "),
      latex("b=0"),
      texte(" (signes de a et c), puis le carré parfait "),
      latex("b^2=4ac"),
      texte(", puis la racine évidente "),
      latex("a+b+c=0"),
      texte(" ou "),
      latex("a-b+c=0"),
      texte("."),
    ],
    [texte("Lis les coefficients de l'équation réduite à 0 : "), texte("repère d'abord les termes absents, puis compare "), latex("b^2"), texte(" et "), latex("4ac"), texte(".")],
  ];
}

/** Δ = b² − 4ac (écran « Δ = »). */
export function aidesDelta(ex: Exercice): Aides {
  const t = trinomeDe(ex);
  return [
    [texte("Le discriminant de "), latex("ax^2+bx+c"), texte(" se calcule avec la formule :"), latex("\\Delta=b^2-4ac")],
    [texte("Ici "), latex(coefficientsLatex(ex)), texte(". Remplace sans oublier les parenthèses : "), latex(`\\Delta=${racPuissance(t.b)}^2-4\\cdot ${qp(t.a)}\\cdot ${qp(t.c)}`), texte(" ; un carré est toujours positif.")],
  ];
}

/** Message ciblé sur Δ : carré de b écrit négatif, signe de −4ac. */
export function messageDelta(ex: Exercice, valeur: string): FragmentConsigne[] | null {
  const v = nombreLu(valeur);
  if (v === null) return null;
  const t = trinomeDe(ex);
  const b2 = t.b.c * t.b.c * t.b.k;
  if (b2 !== 0 && egal(v, -b2 - 4 * t.a * t.c)) return [texte("Le carré de b est toujours positif : "), latex(`${racPuissance(t.b)}^2=${q(b2)}`), texte(".")];
  if (t.a * t.c !== 0 && egal(v, b2 + 4 * t.a * t.c)) return [texte("Attention au signe du terme "), latex("-4ac"), texte(" : calcule d'abord "), latex("4ac"), texte(", puis soustrais-le.")];
  return null;
}

export function aidesFactorisation(ex: Exercice, methode: ChoixMethode | "mise_en_evidence_generalisee"): Aides {
  switch (methode) {
    case "mise_en_evidence":
      return [
        [texte("Pas de terme constant : x est un facteur commun aux deux termes :"), latex("ax^2+bx=x(ax+b)")],
        [texte("Mets x en évidence (et le facteur numérique commun, s'il y en a un) ; garde « = 0 ». Un signe moins doit rester dans un facteur.")],
      ];
    case "binome_conjugue":
      return [
        [texte("Différence de deux carrés :"), latex("A^2-B^2=(A-B)(A+B)")],
        [texte("Mets d'abord a en évidence si besoin, puis écris le reste comme "), latex("x^2-B^2"), texte(".")],
      ];
    case "produit_remarquable":
      return [
        [texte("Carré parfait :"), latex("A^2\\pm 2AB+B^2=(A\\pm B)^2")],
        [texte("Repère A et B dans les termes extrêmes (après avoir mis a en évidence si besoin), puis vérifie le double produit "), latex("2AB"), texte(".")],
      ];
    case "racine_evidente":
      return [
        [texte("Si "), latex("a+b+c=0"), texte(", 1 est racine et "), latex("ax^2+bx+c=(x-1)(ax-c)"), texte(" ; si "), latex("a-b+c=0"), texte(", −1 est racine et "), latex("ax^2+bx+c=(x+1)(ax+c)"), texte(".")],
        [texte("Ici "), latex(coefficientsLatex(ex)), texte(" : calcule "), latex("a+b+c"), texte(" et "), latex("a-b+c"), texte(" pour savoir quelle racine est évidente.")],
      ];
    case "mise_en_evidence_generalisee": {
      const p = ex.parametresAffichage?.p ?? 0;
      return [
        [texte("La même expression entre parenthèses apparaît dans les deux termes : mets-la en évidence, sans développer :"), latex("A^2-mA=A(A-m)")],
        [texte("Ici l'expression commune est "), latex(`(x${p >= 0 ? "+" : "-"}${Math.abs(p)})`), texte(". Ne divise jamais les deux membres par elle : tu perdrais une solution.")],
      ];
    }
    default:
      return aidesDelta(ex);
  }
}

// ---------------------------------------------------------------------------------------------
// Solutions (écran « zéros » de gen1)
// ---------------------------------------------------------------------------------------------

export function aidesZeros(ex: Exercice, methode: ChoixMethode | "mise_en_evidence_generalisee" | null): Aides {
  if (ex.categorie === "irreductible") {
    return [
      [texte("Isole "), latex("x^2"), texte(" : "), latex("ax^2+c=0\\iff x^2=-\\dfrac{c}{a}"), texte(".")],
      [texte("Un carré n'est jamais négatif : regarde le signe de "), latex("-\\dfrac{c}{a}"), texte(".")],
    ];
  }
  if (methode === "cas_general") {
    return [
      [texte("Formule : "), latex("x_{1,2}=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), texte(" si Δ ≥ 0 ; si Δ < 0, aucune solution réelle.")],
      [texte("Regarde d'abord le signe de Δ. Puis remplace : c'est "), latex("-b"), texte(" (l'opposé de b) au numérateur et "), latex("2a"), texte(" au dénominateur.")],
    ];
  }
  return [
    [texte("Produit nul : "), latex("A\\cdot B=0\\iff A=0\\ \\text{ou}\\ B=0"), texte(".")],
    [texte("Égale chaque facteur à 0 et résous ; un carré nul donne une seule solution (racine double).")],
  ];
}

/** Erreurs du cours sur les solutions : −b oublié, a au lieu de 2a, solution opposée oubliée, signe de Δ. */
export function messageZeros(ex: Exercice, reponse: ReponseZeros): FragmentConsigne[] | null {
  const [r1, r2] = ex.solution.racines;
  if (Number.isNaN(r1)) return reponse.aucun ? null : [texte("Regarde le signe de "), latex(ex.categorie === "irreductible" ? "-\\dfrac{c}{a}" : "\\Delta"), texte(" avant de chercher des solutions.")];
  if (reponse.aucun) return [texte(ex.categorie === "cas_general" ? "Relis le signe de Δ : " : "Relis la forme factorisée : "), texte("cette équation a des solutions.")];
  const v = [...reponse.valeurs].sort((x, y) => x - y);
  const attendu = [r1!, r2!].sort((x, y) => x - y);
  const opp = attendu.map((x) => -x).sort((x, y) => x - y);
  const memes = (a: number[], b: number[]) => a.length === b.length && a.every((x, i) => egal(x, b[i]!));
  if (ex.categorie === "cas_general" && v.length === 2 && memes(v, opp)) return [texte("Dans la formule, c'est "), latex("-b"), texte(", l'opposé de b : tes deux solutions ont le mauvais signe.")];
  if (ex.categorie === "cas_general" && v.length === 2 && memes(v, attendu.map((x) => 2 * x).sort((x, y) => x - y))) return [texte("Le dénominateur de la formule est "), latex("2a"), texte(", pas a.")];
  if (ex.categorie === "binome_conjugue" && v.length === 1 && attendu.some((x) => egal(x, v[0]!))) return [texte("Une différence de deux carrés nulle donne deux solutions opposées, pas seulement une.")];
  if ((ex.categorie === "mise_en_evidence" || ex.categorie === "mise_en_evidence_generalisee") && v.length === 1) return [texte("Chaque facteur égalé à 0 donne une solution : n'en oublie pas une (ne divise jamais par x ni par la parenthèse).")];
  return null;
}


// ---------------------------------------------------------------------------------------------
// gen2 — inéquation du second degré
// ---------------------------------------------------------------------------------------------

export function aidesRacinesInequation(e: ExerciceInequation): Aides {
  const { a, b, c } = e.enonce;
  return [
    [texte("Résous l'équation associée par un raccourci du cours, sinon avec "), latex("\\Delta=b^2-4ac"), texte(" et "), latex("x_{1,2}=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), texte(".")],
    [texte("Ici "), latex(`a=${q(a)},\\ b=${q(b)},\\ c=${q(c)}`), texte(". Regarde d'abord le signe de Δ : négatif, aucune solution ; nul, une racine double "), latex("-\\dfrac{b}{2a}"), texte(".")],
  ];
}

export function messageRacinesInequation(e: ExerciceInequation, rep: ReponseRacines): FragmentConsigne[] | null {
  const r = e.racines;
  if (!r) return rep.type === "aucune" ? null : [texte("Regarde le signe de "), latex("\\Delta"), texte(" avant de chercher des solutions.")];
  if (rep.type === "aucune") return [texte("Relis le signe de "), latex("\\Delta"), texte(" : cette équation a des solutions.")];
  const v = [rep.x1, rep.x2].sort((x, y) => x - y);
  const opp = [-r[1], -r[0]];
  if (r[0] !== r[1] && egal(v[0]!, opp[0]!) && egal(v[1]!, opp[1]!)) return [texte("Dans la formule, c'est "), latex("-b"), texte(", l'opposé de b : tes deux solutions ont le mauvais signe.")];
  if (r[0] !== r[1] && egal(v[0]!, 2 * r[0]) && egal(v[1]!, 2 * r[1])) return [texte("Le dénominateur de la formule est "), latex("2a"), texte(", pas a.")];
  return null;
}

export function aidesSigneTrinome(): Aides {
  return [
    [texte("Le signe du trinôme "), latex("ax^2+bx+c"), texte(" est celui de "), latex("a"), texte(" à l'extérieur des racines (partout s'il n'y en a pas), le signe opposé entre elles.")],
    [texte("Lis le coefficient de "), latex("x^2"), texte(" dans l'inéquation simplifiée : seul son signe compte.")],
  ];
}

export function aideTexteIntervalle(e: ExerciceInequation): FragmentConsigne[] {
  const large = e.symbole === "≤" || e.symbole === "≥";
  return [
    texte("On garde les x pour lesquels le trinôme a le signe demandé par "),
    latex(e.symbole === "≤" ? "\\leq" : e.symbole === "≥" ? "\\geq" : e.symbole),
    texte(large ? " ; inégalité large : les racines sont solutions (crochets fermés)." : " ; inégalité stricte : les racines sont exclues (crochets ouverts)."),
  ];
}

function bornesMorceau(m: Morceau): [number, number] {
  const v = (b: Morceau["borneGauche"]) => (b === "-inf" ? -Infinity : b === "+inf" ? Infinity : b);
  return [v(m.borneGauche), v(m.borneDroite)];
}

const memeNombre = (x: number, y: number) => x === y || egal(x, y);

/** Signe de a lu entre les racines (intervalle ↔ union), crochets, Δ < 0 / racine double. */
export function messageInequation(e: ExerciceInequation, rep: SolutionEnsemble): FragmentConsigne[] | null {
  const sol = e.solution;
  const exterieur: FragmentConsigne[] = [texte("Le trinôme a le signe de a à l'extérieur des racines, le signe opposé entre elles : relis le signe de "), latex("a"), texte(" et le symbole.")];
  if (sol.forme === "union" && rep.forme === "intervalle") {
    const [g, d] = bornesMorceau(rep.morceau);
    if (memeNombre(g, bornesMorceau(sol.morceau1)[1]) && memeNombre(d, bornesMorceau(sol.morceau2)[0])) return exterieur;
  }
  if (sol.forme === "intervalle" && rep.forme === "union") {
    const [g, d] = bornesMorceau(sol.morceau);
    if (memeNombre(bornesMorceau(rep.morceau1)[1], g) && memeNombre(bornesMorceau(rep.morceau2)[0], d)) return exterieur;
  }
  if (sol.forme === rep.forme && (sol.forme === "intervalle" || sol.forme === "union")) {
    const ms = sol.forme === "intervalle" ? [sol.morceau] : [sol.morceau1, sol.morceau2];
    const mr = rep.forme === "intervalle" ? [rep.morceau] : rep.forme === "union" ? [rep.morceau1, rep.morceau2] : [];
    const memesBornes = ms.every((m, i) => mr[i] && bornesMorceau(m).every((x, j) => memeNombre(x, bornesMorceau(mr[i]!)[j]!)));
    if (memesBornes) return [texte("Les bornes sont justes : relis les crochets. Inégalité large → racines comprises ; stricte → exclues ; l'infini a toujours un crochet ouvert.")];
  }
  if ((sol.forme === "vide" || sol.forme === "reel") && (rep.forme === "vide" || rep.forme === "reel")) return [texte("Sans racine, le trinôme garde le signe de a pour tout x : compare ce signe au symbole.")];
  if ((sol.forme === "point" || sol.forme === "reel_sauf_point") && (rep.forme === "point" || rep.forme === "reel_sauf_point" || rep.forme === "vide" || rep.forme === "reel")) return [texte("Racine double : le trinôme a le signe de a partout, sauf en la racine où il est nul.")];
  return null;
}

// ---------------------------------------------------------------------------------------------
// gen3–gen6 — écrans communs des fractions, produits et quotients
// ---------------------------------------------------------------------------------------------

/** Reconnaissance de la méthode d'un facteur (gen3–gen6 : pas de racine évidente à ces écrans). */
export function aidesMethodeFacteur(): Aides {
  return [
    [texte("Teste les raccourcis du cours dans l'ordre : "), latex("c=0"), texte(" (x en évidence), "), latex("b=0"), texte(" avec a et c de signes opposés (différence de deux carrés), "), latex("b^2=4ac"), texte(" (carré parfait) ; sinon la formule du discriminant (Δ < 0 : non factorisable).")],
    [texte("Repère d'abord les termes absents du polynôme, puis compare "), latex("b^2"), texte(" et "), latex("4ac"), texte(".")],
  ];
}

/** Écran « Δ = » ou « factorise » d'un polynôme du 2nd degré (gen3–gen6). */
export function aidesChamp1Categorie(ex: Exercice): Aides {
  if (ex.categorie === "cas_general") return aidesDelta(ex);
  if (ex.categorie === "mise_en_evidence" || ex.categorie === "binome_conjugue" || ex.categorie === "produit_remarquable") return aidesFactorisation(ex, ex.categorie);
  return aidesFactorisation(ex, "mise_en_evidence_generalisee");
}

/** Factorisation après Δ : a(x − x₁)(x − x₂). */
export function aidesFactorisationApresDelta(): Aides {
  return [
    [texte("Avec deux racines "), latex("x_1"), texte(" et "), latex("x_2"), texte(" (ou une racine double) :"), latex("ax^2+bx+c=a(x-x_1)(x-x_2)")],
    [texte("Reprends les racines trouvées à l'écran précédent ; n'oublie pas le coefficient "), latex("a"), texte(" devant les parenthèses, ni le signe de chaque racine.")],
  ];
}

/** Racines lues sur une forme factorisée (produit nul) ou par la formule. */
export function aidesRacinesFacteur(ex: Exercice): Aides {
  if (ex.categorie === "cas_general" || ex.categorie === "irreductible")
    return [
      [texte("Formule : "), latex("x_{1,2}=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), texte(" ; si Δ < 0, pas de racine.")],
      [texte("Regarde le signe de Δ, puis remplace : "), latex("-b"), texte(" au numérateur, "), latex("2a"), texte(" au dénominateur.")],
    ];
  return [
    [texte("Produit nul : "), latex("A\\cdot B=0\\iff A=0\\ \\text{ou}\\ B=0"), texte(".")],
    [texte("Égale chaque facteur de la forme factorisée à 0 ; un carré nul donne une seule racine.")],
  ];
}

/** Conditions d'existence d'une fraction. */
export function aidesCE(): Aides {
  return [
    [texte("Une fraction n'existe que si son dénominateur est non nul : "), latex("\\dfrac{A}{B}"), texte(" existe "), latex("\\iff B\\neq 0"), texte(".")],
    [texte("Factorise le dénominateur (ou lis sa forme factorisée) : chaque facteur égal à 0 donne une valeur interdite, à exclure.")],
  ];
}

export function aidesReduction(miseEnEvidence: boolean): Aides {
  return miseEnEvidence
    ? [
        [texte("Facteur commun numérique : "), latex("ka^{\\prime}x^2+kb^{\\prime}x+kc^{\\prime}=k(a^{\\prime}x^2+b^{\\prime}x+c^{\\prime})"), texte(".")],
        [texte("Cherche le plus grand diviseur commun aux trois coefficients et mets-le devant une parenthèse : il doit rester visible (on ne divise pas un polynôme seul).")],
      ]
    : aidesSimplification();
}

export function aidesSimplificationFraction(): Aides {
  return [
    [texte("On simplifie une fraction par un facteur commun au numérateur et au dénominateur :"), latex("\\dfrac{A\\cdot C}{B\\cdot C}=\\dfrac{A}{B}"), texte(" pour "), latex("C\\neq 0"), texte(".")],
    [texte("Écris les deux formes factorisées, barre le facteur commun ; la condition d'existence reste celle de la fraction de départ.")],
  ];
}

export function aidesRacineLineaire(): Aides {
  return [
    [texte("Racine d'un facteur du premier degré : "), latex("kx+c=0\\iff x=-\\dfrac{c}{k}"), texte(".")],
    [texte("Isole x : passe la constante dans l'autre membre, puis divise par le coefficient de x (avec son signe).")],
  ];
}

export function aidesSigneIrreductible(): Aides {
  return [
    [texte("Un trinôme sans racine (Δ < 0) garde le même signe pour tout x : celui de "), latex("a"), texte(".")],
    [texte("Lis le coefficient de "), latex("x^2"), texte(" du facteur étudié : seul son signe compte.")],
  ];
}

export function aidesGrilleSignes(quotient: boolean): Aides {
  return [
    [
      texte("Dans chaque colonne, le signe du "),
      texte(quotient ? "quotient" : "produit"),
      texte(" suit la règle des signes ; en une racine d'un facteur, ce facteur vaut 0"),
      texte(quotient ? " ; une valeur qui annule le dénominateur est interdite (double barre)." : "."),
    ],
    [texte("Un facteur "), latex("kx+c"), texte(" a le signe de k à droite de sa racine, le signe opposé à gauche ; un trinôme, le signe de a à l'extérieur de ses racines.")],
  ];
}

export function aideTexteIntervalleProduit(symbole: string, quotient: boolean): FragmentConsigne[] {
  const large = symbole === "≤" || symbole === "≥";
  return [
    texte("On garde les colonnes où le signe convient au symbole "),
    latex(symbole === "≤" ? "\\leq" : symbole === "≥" ? "\\geq" : symbole),
    texte(large ? ` ; inégalité large : les racines ${quotient ? "du numérateur" : "des facteurs"} sont solutions` : " ; inégalité stricte : les racines sont exclues"),
    texte(quotient ? ", une valeur interdite est toujours exclue." : "."),
  ];
}

function dansMorceau(m: Morceau, x: number): boolean {
  const g = m.borneGauche === "-inf" ? -Infinity : m.borneGauche === "+inf" ? Infinity : m.borneGauche;
  const d = m.borneDroite === "-inf" ? -Infinity : m.borneDroite === "+inf" ? Infinity : m.borneDroite;
  const okG = m.crochetGauche === "[" ? x >= g - 1e-9 : x > g + 1e-9;
  const okD = m.crochetDroit === "]" ? x <= d + 1e-9 : x < d - 1e-9;
  return okG && okD;
}

export function appartientProduit(s: SolutionEnsembleProduit, x: number): boolean {
  switch (s.forme) {
    case "vide":
      return false;
    case "reel":
      return true;
    case "point":
      return egal(s.valeur, x);
    case "reel_sauf_points":
      return !s.valeurs.some((v) => egal(v, x));
    case "intervalle":
      return dansMorceau(s.morceau, x);
    case "union":
      return s.morceaux.some((m) => dansMorceau(m, x));
    case "mixte":
      return s.morceaux.some((m) => dansMorceau(m, x)) || s.points.some((p) => egal(p, x));
  }
}

function bornesProduit(s: SolutionEnsembleProduit): number[] {
  const finies = (m: Morceau) => [m.borneGauche, m.borneDroite].filter((b): b is number => typeof b === "number");
  switch (s.forme) {
    case "point":
      return [s.valeur];
    case "reel_sauf_points":
      return s.valeurs;
    case "intervalle":
      return finies(s.morceau);
    case "union":
      return s.morceaux.flatMap(finies);
    case "mixte":
      return [...s.morceaux.flatMap(finies), ...s.points];
    default:
      return [];
  }
}

/** Valeur interdite incluse, signe opposé gardé, crochets (gen5, gen6). */
export function messageIntervalleProduit(solution: SolutionEnsembleProduit, rep: SolutionEnsembleProduit, interdites: number[] = []): FragmentConsigne[] | null {
  if (interdites.some((v) => appartientProduit(rep, v))) return [texte("Une valeur qui annule le dénominateur est toujours exclue, même avec une inégalité large : crochet ouvert.")];
  const bornes = [...new Set([...bornesProduit(solution), ...bornesProduit(rep), ...interdites])].sort((x, y) => x - y);
  const tests = bornes.length === 0 ? [0] : [bornes[0]! - 1, ...bornes.slice(1).map((b, i) => (b + bornes[i]!) / 2), bornes[bornes.length - 1]! + 1];
  const zonesSol = tests.map((x) => appartientProduit(solution, x));
  const zonesRep = tests.map((x) => appartientProduit(rep, x));
  if (zonesSol.every((v, i) => v === zonesRep[i])) return [texte("Les zones sont justes : relis ce qui se passe aux bornes (crochets, racines comprises ou exclues).")];
  if (zonesSol.every((v, i) => v !== zonesRep[i])) return [texte("Tu as gardé les zones du signe opposé : relis le symbole de l'inéquation.")];
  return null;
}

/** Valeurs interdites (CE) d'une inéquation rationnelle, quel que soit son niveau (`ce` : nombre ou liste). */
export function valeursInterditesQuotient(ex: object): number[] {
  const plat = (v: unknown): number[] => (Array.isArray(v) ? v.flatMap(plat) : typeof v === "number" ? [v] : []);
  return plat((ex as { ce?: unknown }).ce);
}

/** gen4, écran « Élimine les dénominateurs ». */
export function aidesEliminerDenominateurs(): Aides {
  return [
    [
      texte("On multiplie les deux membres par un dénominateur commun, non nul sous les conditions d'existence. Si les dénominateurs ont un facteur commun, prends le plus petit dénominateur commun : "),
      latex("\\dfrac{A}{x-p}=\\dfrac{N}{(x-p)(x-s)}\\iff A(x-s)=N"),
      texte(" ; sinon le produit en croix "),
      latex("\\dfrac{A}{B}=\\dfrac{C}{D}\\iff AD=CB"),
      texte("."),
    ],
    [texte("Développe chaque membre, puis ramène tout dans le membre de gauche pour obtenir "), latex("\\ldots=0"), texte(".")],
  ];
}

// ————————————————————————— gen67 : relations entre racines et coefficients —————————————————————————

export function aidesSommeProduit(e: ExerciceRelationsRacines): Aides {
  const { a, b, c } = e.enonce;
  return [
    [texte("Relations entre racines et coefficients : "), latex("S = x_1 + x_2 = -\\dfrac{b}{a}"), texte(" et "), latex("P = x_1 \\cdot x_2 = \\dfrac{c}{a}"), texte(".")],
    [texte("Ici "), latex(`a = ${q(a)},\\; b = ${q(b)},\\; c = ${q(c)}`), texte(" : remplace dans les deux formules, sans oublier le signe « − » devant "), latex("\\dfrac{b}{a}"), texte(" dans S.")],
  ];
}

/** Message ciblé : signe de S oublié, signe ajouté dans P, division par a oubliée. */
export function messageSommeProduit(e: ExerciceRelationsRacines, rep: { s: number; p: number }): FragmentConsigne[] | null {
  const { a, b, c } = e.enonce;
  const s = -b / a;
  const p = c / a;
  if (!egal(rep.s, s) && s !== 0 && egal(rep.s, -s)) return [texte("Vérifie le signe de S : la formule est "), latex("S = -\\dfrac{b}{a}"), texte(", avec un « − » devant.")];
  if (!egal(rep.p, p) && p !== 0 && egal(rep.p, -p)) return [texte("Vérifie le signe de P : la formule "), latex("P = \\dfrac{c}{a}"), texte(" n'a pas de « − ».")];
  if (!egal(rep.s, s) && egal(rep.s, -b) && a !== 1) return [texte("N'oublie pas de diviser par "), latex(`a = ${q(a)}`), texte(" dans S.")];
  if (!egal(rep.p, p) && egal(rep.p, c) && a !== 1) return [texte("N'oublie pas de diviser par "), latex(`a = ${q(a)}`), texte(" dans P.")];
  return null;
}

export function aidesFactorisationRacines(e: ExerciceRelationsRacines): Aides {
  const double = e.racines[0] === e.racines[1];
  return [
    double
      ? [texte("Avec une racine double "), latex("x_0"), texte(", le membre de gauche s'écrit "), latex("a(x - x_0)^2"), texte(".")]
      : [texte("Si "), latex("x_1"), texte(" et "), latex("x_2"), texte(" sont les racines, le membre de gauche s'écrit "), latex("a(x - x_1)(x - x_2)"), texte(".")],
    [texte("Garde le même coefficient "), latex(`a = ${q(e.enonce.a)}`), texte(" que l'équation, et pour chaque racine écris « x moins la racine » : une racine négative donne un « + » dans la parenthèse.")],
  ];
}

export function aidesEquationDepuisRacines(): Aides {
  return [
    [texte("L'équation la plus simple qui a ces racines a pour coefficient "), latex("a = 1"), texte(" : "), latex("(x - x_1)(x - x_2) = 0"), texte(", ou en développant "), latex("x^2 - Sx + P = 0"), texte(".")],
    [texte("Reprends S et P trouvés en a) : le coefficient de "), latex("x"), texte(" est "), latex("-S"), texte(" et le terme constant est "), latex("P"), texte(".")],
  ];
}

/** Factorisation (gen67 b) ou équation (gen67 c, `unitaire`) : signes des racines inversés, coefficient a oublié ou gardé. */
export function messageFormeRacines(e: ExerciceRelationsRacines, saisie: string, unitaire: boolean): FragmentConsigne[] | null {
  const { a, b, c } = e.enonce;
  const cible = unitaire ? { a: 1, b: b / a, c: c / a } : e.enonce;
  if (cible.b !== 0 && diagnostiquerFormeFactorisee(saisie, { a: cible.a, b: -cible.b, c: cible.c }) === "correct")
    return [texte("Les signes des racines sont inversés : pour la racine "), latex("x_1"), texte(", la parenthèse est "), latex("(x - x_1)"), texte(".")];
  if (a !== 1 && !unitaire && diagnostiquerFormeFactorisee(saisie, { a: 1, b: b / a, c: c / a }) === "correct")
    return [texte("Il manque le coefficient "), latex(`a = ${q(a)}`), texte(" devant le produit.")];
  if (a !== 1 && unitaire && diagnostiquerFormeFactorisee(saisie, e.enonce) === "correct")
    return [texte("Ton équation a bien ces racines, mais la plus simple a pour coefficient "), latex("a = 1"), texte(".")];
  return null;
}
