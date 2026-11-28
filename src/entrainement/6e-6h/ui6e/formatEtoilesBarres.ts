import type { Exercice104, Phase104 } from "../core6e/etoilesBarres";
import { barres, pLibre, reponse104, symboles } from "../core6e/etoilesBarres";
import type { AideEcran, ChampEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { CL, GL, mil } from "./nombresCombinatoireLotH";

/**
 * Couche C — textes de `6gen104` « Étoiles et barres » : situation, consignes d'écran, champs,
 * aides à deux niveaux (propriété du cours, puis posée pour l'instance — jamais le résultat),
 * réponses. Source unique de l'écran, du papier et du corrigé. Notation du cours : Γₙᵖ = C₍ₙ₊ₚ₋₁₎ᵖ.
 */

type E = Exercice104;
type P = Phase104;
const t = tx;
const l = lx;

export const phases104 = (): P[] => ["np", "codage", "calcul"];

const COURS = "(cours, point 1)";

/** Somme x₁ + x₂ + … + xₙ écrite en entier (n ≤ 5). */
export const sommeX = (n: number) => Array.from({ length: n }, (_, i) => `x_{${i + 1}}`).join("+");

/** Nom des cases et des objets de la situation. */
export function noms(e: E): { cases: string; objets: string; caseSing: string } {
  switch (e.contexte) {
    case "glace":
      return { cases: "parfums", objets: "boules", caseSing: "parfum" };
    case "viennoiseries":
      return { cases: "sortes de viennoiseries", objets: "viennoiseries", caseSing: "sorte" };
    case "des":
      return { cases: "faces possibles", objets: "dés", caseSing: "face" };
    case "bonbons":
      return { cases: "enfants", objets: "bonbons", caseSing: "enfant" };
    case "votes":
      return { cases: "candidats", objets: "voix", caseSing: "candidat" };
    case "billes":
      return { cases: "boîtes", objets: "billes", caseSing: "boîte" };
    case "equation":
      return { cases: "inconnues", objets: "unités", caseSing: "inconnue" };
  }
}

/** Situation (avec la question), sans la consigne globale. */
export function situation104(e: E): Frag[] {
  const au = e.variante === "auMoinsUn";
  switch (e.contexte) {
    case "glace":
      return [t(`Un glacier propose ${e.n} parfums. Tu choisis une coupe de ${e.p} boules : plusieurs boules peuvent être du même parfum, et l'ordre des boules dans la coupe ne compte pas. Combien de coupes différentes peux-tu composer ?`)];
    case "viennoiseries":
      return [t(`Une boulangerie vend ${e.n} sortes de viennoiseries. Tu en achètes ${e.p}, et tu peux en prendre plusieurs de la même sorte. Combien de sacs différents peux-tu rapporter (seul compte le nombre de viennoiseries de chaque sorte) ?`)];
    case "des":
      return [t(`On lance ensemble ${e.p} dés à 6 faces identiques, qu'on ne peut pas distinguer : on note seulement combien de dés montrent chaque face. Combien de résultats différents peut-on noter ?`)];
    case "bonbons":
      return au
        ? [t(`On distribue ${e.p} bonbons identiques à ${e.n} enfants, et chaque enfant doit recevoir au moins un bonbon. De combien de façons peut-on faire la distribution (seul compte le nombre de bonbons de chaque enfant) ?`)]
        : [t(`On distribue ${e.p} bonbons identiques à ${e.n} enfants ; un enfant peut n'en recevoir aucun. De combien de façons peut-on faire la distribution (seul compte le nombre de bonbons de chaque enfant) ?`)];
    case "votes":
      return au
        ? [t(`${e.p} élèves votent chacun pour l'un des ${e.n} candidats au poste de délégué, et chaque candidat obtient au moins une voix. On ne regarde que le nombre de voix de chaque candidat. Combien de résultats différents le dépouillement peut-il donner ?`)]
        : [t(`${e.p} élèves votent chacun pour l'un des ${e.n} candidats au poste de délégué ; un candidat peut n'obtenir aucune voix. On ne regarde que le nombre de voix de chaque candidat. Combien de résultats différents le dépouillement peut-il donner ?`)];
    case "billes":
      return [t(`On range ${e.p} billes identiques dans ${e.n} boîtes de couleurs différentes ; une boîte peut rester vide. De combien de façons peut-on ranger les billes ?`)];
    case "equation":
      return au
        ? [t("Combien l'équation "), l(`${sommeX(e.n)}=${e.p}`), t(" a-t-elle de solutions dont toutes les inconnues sont des entiers strictement positifs ("), l("x_i\\ge 1"), t(") ?")]
        : [t("Combien l'équation "), l(`${sommeX(e.n)}=${e.p}`), t(" a-t-elle de solutions dont toutes les inconnues sont des entiers naturels ("), l("x_i\\ge 0"), t(") ?")];
  }
}

/** Consigne globale (papier et en-tête de l'écran). */
export const consigneGlobale104 = (): Frag[] => [t("Calcule ce nombre en justifiant par la méthode des étoiles et des barres.")];

export const consigneGenerale104 = (e: E): Frag[] => [...situation104(e), t(" "), ...consigneGlobale104()];

export function libelle104(e: E, p: P): string {
  if (p === "np") return e.variante === "auMoinsUn" ? "Cases et objets restants" : "Cases et objets";
  if (p === "codage") return "Étoiles et barres";
  return "Nombre cherché";
}

export function consigne104(e: E, p: P): Frag[] {
  const nm = noms(e);
  switch (p) {
    case "np":
      return e.variante === "auMoinsUn"
        ? [t(`On commence par donner un objet à chaque case (une unité à chaque inconnue). Combien y a-t-il de cases (${nm.cases}), et combien d'objets restent ensuite à répartir librement ?`)]
        : [t(`Combien y a-t-il de cases (ici, les ${nm.cases}) et combien d'objets à répartir (ici, les ${nm.objets}) ?`)];
    case "codage":
      return [t("On code chaque répartition par une rangée d'étoiles (les objets) et de barres (les séparations entre deux cases voisines). Combien de symboles compte la rangée en tout, et combien de barres ?")];
    case "calcul":
      return [t("Calcule le nombre cherché. Tu peux écrire un calcul (avec « ! » pour une factorielle) au lieu du résultat.")];
  }
}

export function champs104(e: E, p: P): ChampEcran[] {
  if (p === "np")
    return [
      { label: "n, nombre de cases", labelLatex: "n=", placeholder: "nombre de cases" },
      { label: e.variante === "auMoinsUn" ? "p, objets restants" : "p, nombre d'objets", labelLatex: "p=", placeholder: e.variante === "auMoinsUn" ? "objets restants" : "nombre d'objets" },
    ];
  if (p === "codage")
    return [
      { label: "Symboles en tout", labelLatex: "\\text{symboles}=", placeholder: "étoiles + barres" },
      { label: "Barres", labelLatex: "\\text{barres}=", placeholder: "nombre de barres" },
    ];
  return [{ label: "Nombre cherché", labelLatex: "N=", placeholder: "nombre ou calcul", raccourcis: [{ libelle: "!", texte: "!" }] }];
}

export function reponse104Frag(e: E, p: P): Frag[] {
  if (p === "np") return [l(`n=${e.n}`), t(" et "), l(`p=${pLibre(e)}`)];
  if (p === "codage") return [l(`${symboles(e)}`), t(" symboles, dont "), l(`${barres(e)}`), t(" barres")];
  return [l(`${GL(e.n, pLibre(e))}=${CL(symboles(e), barres(e))}=${mil(reponse104(e))}`)];
}
export const recap104 = reponse104Frag;

export function messageIllisible104(_e: E, p: P): string {
  if (p === "calcul") return "Nombre non reconnu : écris un entier (par exemple 120) ou un calcul (par exemple 7!/(3!·4!)). Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre entier dans chaque champ. Cette saisie ne compte pas comme une tentative.";
}

export function aide1_104(e: E, p: P): AideEcran {
  switch (p) {
    case "np":
      return e.variante === "auMoinsUn"
        ? { texte: [t(`« Au moins un par case » ${COURS} : on place d'abord un objet dans chaque case ; il ne reste ensuite que les objets en trop, à répartir sans contrainte.`)] }
        : { texte: [t(`Combinaison avec répétition ${COURS} : les cases sont les choix possibles (elles sont distinctes), les objets sont identiques et une case peut en recevoir plusieurs, ou aucun.`)] };
    case "codage":
      return { texte: [t("Une étoile par objet ; entre deux cases voisines, une barre. Avec "), l("n"), t(" cases, il y a une barre de moins que de cases :")], latex: "\\text{symboles}=p+(n-1)" };
    case "calcul":
      return { texte: [t(`Une répartition = le choix des places des barres parmi tous les symboles ${COURS} :`)], latex: `${GL("n", "p")}=${CL("n+p-1", "p")}=${CL("n+p-1", "n-1")}` };
  }
}

/** Une répartition d'exemple, codée en étoiles et barres (jamais la réponse d'un écran). */
export function exempleCodage(e: E): { repartition: number[]; latex: string } {
  const libre = pLibre(e);
  const rep = Array.from({ length: e.n }, () => 0);
  // Répartition déterministe : la première case reçoit la moitié, la deuxième rien, le reste à la fin.
  rep[0] = Math.ceil(libre / 2);
  rep[e.n - 1] = libre - rep[0];
  const latex = rep.map((k) => (k === 0 ? "" : Array.from({ length: k }, () => "\\star").join(""))).join("\\,|\\,");
  return { repartition: rep, latex };
}

export function aide2_104(e: E, p: P): AideEcran | null {
  const nm = noms(e);
  switch (p) {
    case "np":
      return e.variante === "auMoinsUn"
        ? { texte: [t(`Il y a ${e.n} ${nm.cases}. Après avoir donné un objet à chacun, il reste :`)], latex: `${e.p}-${e.n}` }
        : { texte: [t(`Les cases sont les ${nm.cases} (on peut en choisir un même plusieurs fois) ; les objets sont les ${nm.objets}.`)] };
    case "codage":
      return {
        texte: [t("Par exemple, 5 objets répartis (2 ; 0 ; 3) dans 3 cases se codent "), l("\\star\\star\\,|\\,|\\,\\star\\star\\star"), t(" : 5 étoiles et 2 barres. Ici :")],
        latex: `\\text{symboles}=${pLibre(e)}+(${e.n}-1)`,
      };
    case "calcul":
      return { texte: [t("Ici, on choisit les places des barres parmi tous les symboles :")], latex: CL(symboles(e), barres(e)) };
  }
}
