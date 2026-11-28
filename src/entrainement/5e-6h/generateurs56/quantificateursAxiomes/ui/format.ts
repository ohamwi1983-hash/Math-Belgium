import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { AideEcran, Frag, OptionEcran } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { axiome } from "../core/banque";
import type { ExerciceQuantif, IdAxiome, PhaseQuantif } from "../core/types";

/**
 * Couche C — textes de `56gen17` « Énoncés quantifiés et axiomes » : consignes, options, aides à deux
 * niveaux (propriété du cours, puis posée pour l'instance ; jamais la réponse), réponses. Source
 * unique de l'écran, du corrigé et du papier.
 */

type E = ExerciceQuantif;
type P = PhaseQuantif;

export const phases = (e: E): P[] => (e.variante === "quantifies" ? ["enonce1", "enonce2", "negation"] : ["etape1", "etape2", "etape3"]);
export const indexEtape = (p: P): number => ({ etape1: 0, etape2: 1, etape3: 2, enonce1: 0, enonce2: 1, negation: 2 })[p];

/** Égalité (ou inégalité) complète de l'étape i : « (x + 3) + (−3) = x + (3 + (−3)) ». */
export function egaliteEtape(e: E, i: number): string {
  const et = e.etapes[i];
  if (!e.depart) return et.latex;
  const avant = i === 0 ? e.depart : e.etapes[i - 1].latex.replace(/^=/, "");
  return `${avant}${et.latex}`;
}

/** Le calcul entier, étapes numérotées (KaTeX `aligned`). */
export function calculL(e: E): string {
  if (!e.depart) return `\\begin{aligned}${e.etapes.map((et, i) => `&(${i + 1})\\quad ${et.latex}`).join("\\\\")}\\end{aligned}`;
  return `\\begin{aligned}${e.depart}${e.etapes.map((et, i) => `&\\overset{(${i + 1})}{=}${et.latex.replace(/^=/, "")}`).join("\\\\")}\\end{aligned}`;
}

export function consigneGenerale(e: E): Frag[] {
  if (e.variante === "quantifies") return [tx("Dis si chacun de deux énoncés est vrai ou faux, puis trouve la négation d'un troisième énoncé.")];
  const hyp: Frag[] = e.hypotheses ? [tx("Soit x et y des réels tels que "), lx(e.hypotheses), tx(". ")] : [tx("Soit x, y et z des réels. ")];
  return [...hyp, tx("Quel axiome (ou quelle définition) des réels justifie chacune des étapes du calcul suivant ? "), lx(calculL(e))];
}

export function libelle(_e: E, p: P): string {
  return { enonce1: "Énoncé 1", enonce2: "Énoncé 2", negation: "Négation", etape1: "Étape (1)", etape2: "Étape (2)", etape3: "Étape (3)" }[p];
}

export function consigne(e: E, p: P): Frag[] {
  if (p === "enonce1" || p === "enonce2") return [tx("Cet énoncé est-il vrai ou faux ? "), lx(e.enonces[indexEtape(p)].latex)];
  if (p === "negation") return [tx("Quelle est la négation de l'énoncé "), lx(e.aNier), tx(" ?")];
  const i = indexEtape(p);
  return [tx(`Quel axiome justifie l'étape (${i + 1}) : `), lx(egaliteEtape(e, i)), tx(" ?")];
}

export function options(e: E, p: P): OptionEcran[] {
  if (p === "enonce1" || p === "enonce2")
    return [
      { id: "vrai", fragments: [tx("Vrai")] },
      { id: "faux", fragments: [tx("Faux")] },
    ];
  if (p === "negation") return e.optionsNegation.map((o) => ({ id: o.id, fragments: [lx(o.latex)] }));
  return e.etapes[indexEtape(p)].options.map((id) => ({ id, fragments: [tx(nomAxiomeMaj(id))] }));
}

export const nomAxiomeMaj = (id: IdAxiome): string => {
  const n = axiome(id).nom;
  return n[0].toLocaleUpperCase("fr") + n.slice(1);
};

export function bonneOptionId(e: E, p: P): string {
  if (p === "enonce1" || p === "enonce2") return e.enonces[indexEtape(p)].vrai ? "vrai" : "faux";
  if (p === "negation") return "juste";
  return e.etapes[indexEtape(p)].axiome;
}

const AIDE_QUANTIF: AideEcran = {
  texte: [tx("« ∀ » se lit « pour tout », « ∃ » se lit « il existe (au moins un) ». Un énoncé « pour tout » est faux dès qu'il a un contre-exemple ; un énoncé « il existe » est vrai dès qu'il a un exemple. Dans « ∀x ∃y », y peut dépendre de x ; dans « ∃y ∀x », le même y doit convenir pour tous les x (cours, point 3).")],
};

const AIDE2_AXIOME: Record<IdAxiome, string> = {
  addAssoc: "Ici, les mêmes termes apparaissent dans le même ordre : regarde où sont les parenthèses.",
  mulAssoc: "Ici, les mêmes facteurs apparaissent dans le même ordre : regarde où sont les parenthèses.",
  addComm: "Ici, les mêmes termes sont regroupés de la même façon : regarde leur ordre.",
  mulComm: "Ici, les mêmes facteurs sont là : regarde leur ordre.",
  addNeutre: "Ici, un terme a disparu : lequel, et pourquoi n'a-t-il rien changé ?",
  mulNeutre: "Ici, un facteur a disparu : lequel, et pourquoi n'a-t-il rien changé ?",
  addSym: "Ici, deux nombres ont été remplacés par un seul : que vaut leur somme ?",
  mulSym: "Ici, deux nombres ont été remplacés par un seul : que vaut leur produit ?",
  distrib: "Ici, un produit est devenu une somme de produits.",
  ordAdd: "Ici, on a fait la même opération sur les deux membres de l'inégalité : laquelle ?",
  ordTrans: "Ici, on enchaîne deux inégalités déjà connues.",
  ordMul: "Ici, on a multiplié les deux membres par un même nombre : quel est son signe ?",
  defSous: "Ici, une soustraction a été réécrite autrement.",
  defDiv: "Ici, une division a été réécrite autrement.",
};

export function aide1(_e: E, p: P): AideEcran {
  if (p === "enonce1" || p === "enonce2") return AIDE_QUANTIF;
  if (p === "negation")
    return { texte: [tx("La négation de « ∀x, P » est « ∃x, non P » ; celle de « ∃x, P » est « ∀x, non P ». Chaque quantificateur change, leur ordre reste le même, et la condition est niée (cours, point 3).")] };
  return { texte: [tx("Compare les deux membres : l'ordre des termes a-t-il changé (commutativité) ? Les parenthèses ont-elles bougé (associativité) ? Un facteur a-t-il été distribué ? Un terme a-t-il disparu (neutre) ou une somme est-elle devenue 0 (opposé) ? Pour une inégalité, pense aux axiomes de l'ordre (tableaux de l'étape 3).")] };
}

export function aide2(e: E, p: P): AideEcran {
  if (p === "enonce1" || p === "enonce2") return { texte: e.enonces[indexEtape(p)].aide2 };
  if (p === "negation") return { texte: [tx("Ici, commence par nier la condition "), lx(e.predicat), tx(", puis change chaque quantificateur sans changer leur ordre.")] };
  return { texte: [tx(AIDE2_AXIOME[e.etapes[indexEtape(p)].axiome])] };
}

export function messageIllisible(): string {
  return "Choisis une des propositions. Cette saisie ne compte pas comme une tentative.";
}

export function reponse(e: E, p: P): Frag[] {
  if (p === "enonce1" || p === "enonce2") {
    const en = e.enonces[indexEtape(p)];
    return [lx(en.latex), tx(en.vrai ? " : vrai" : " : faux")];
  }
  if (p === "negation") return [lx(e.optionsNegation.find((o) => o.sorte === "juste")!.latex)];
  const et = e.etapes[indexEtape(p)];
  return [tx(nomAxiomeMaj(et.axiome)), tx(" : "), lx(axiome(et.axiome).latex)];
}

export const recap = reponse;

export function explication(e: E, p: P): string {
  if (p === "enonce1" || p === "enonce2") return e.enonces[indexEtape(p)].vrai ? "L'énoncé est vrai." : "L'énoncé est faux.";
  if (p === "negation") return "Chaque quantificateur change, leur ordre reste, et la condition est niée.";
  return `C'est la ${axiome(e.etapes[indexEtape(p)].axiome).nom}.`;
}
