import type { Exercice } from "../core/generateur.types";
import type { FragmentConsigne } from "./formatEquationDroite";
import { latex, texte } from "../../export/corrigeTableau";
import { q, qp } from "./corrigeChapitre3";
import type { ChoixMethode } from "../moteur/methodeSecondDegre";
import type { ReponseZeros } from "../moteur/types";
import { racLatex, racPuissance, trinomeDe } from "./corrigeSecondDegre1";

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

