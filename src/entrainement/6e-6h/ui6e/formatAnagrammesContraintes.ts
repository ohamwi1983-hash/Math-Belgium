import type { Exercice103, Phase103 } from "../core6e/anagrammesContraintes";
import { consonnesDe, effectifs, effectifsCollees, nbOccurrences, phases103, sansUne, valeur103, voyellesDe } from "../core6e/anagrammesContraintes";
import type { AideEcran, ChampEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { mil, multinomialeLatex } from "./nombresCombinatoireLotH";
import { descriptionLettres } from "../core6e/motsLotH";

/**
 * Couche C — textes de `6gen103` « Anagrammes et contraintes » : situation, consignes d'écran, champs,
 * aides à deux niveaux (propriété du cours, puis posée pour l'instance — jamais le résultat), réponses.
 * Source unique de l'écran, du papier et du corrigé. Notation du cours : n!/(n₁!·n₂!…).
 */

type E = Exercice103;
type P = Phase103;
const t = tx;
const l = lx;

const COURS = "(cours, point 2)";
export const DEFINITION_ANAGRAMME = "Une anagramme d'un mot est un mot (ayant un sens ou non) écrit avec toutes ses lettres et différent de lui.";

export { phases103 };

/** Le mot tel qu'il est imprimé (capitales : c'est un mot-objet, pas une insistance). */
const motTx = (e: E) => e.mot;

/** Situation (sans la consigne globale, qui porte la question). */
export function situation103(e: E): Frag[] {
  if (e.variante === "anagrammes") return [t(DEFINITION_ANAGRAMME)];
  return [t(`On écrit des mots (ayant un sens ou non, le mot ${motTx(e)} compris) en utilisant une fois chacune toutes les lettres du mot ${motTx(e)}.`)];
}

/** Question de l'exercice (consigne globale, papier et écran). */
export function consigneGlobale103(e: E): Frag[] {
  switch (e.variante) {
    case "anagrammes":
      return [t(`Combien d'anagrammes le mot ${motTx(e)} a-t-il ? Justifie ton calcul.`)];
    case "commencePar":
      return [t(`Combien de ces mots commencent par la lettre ${e.lettre} ? Justifie ton calcul.`)];
    case "bloc":
      return [t("Combien de ces mots ont toutes leurs voyelles côte à côte (en un seul bloc) ? Justifie ton calcul.")];
    case "jamaisCote":
      return [t(`Combien de ces mots n'ont jamais les deux lettres ${e.lettre} côte à côte ? Justifie ton calcul.`)];
  }
}

export const consigneGenerale103 = (e: E): Frag[] => [...situation103(e), t(" "), ...consigneGlobale103(e)];

export function libelle103(_e: E, p: P): string {
  switch (p) {
    case "total":
      return "Mots en tout";
    case "anagrammes":
      return "Anagrammes";
    case "fixe":
      return "Première lettre fixée";
    case "interne":
      return "Ordre dans le bloc";
    case "externe":
      return "Bloc et consonnes";
    case "produit":
      return "Voyelles groupées";
    case "collees":
      return "Lettres collées";
    case "jamais":
      return "Jamais côte à côte";
  }
}

export function consigne103(e: E, p: P): Frag[] {
  switch (p) {
    case "total":
      return [t(`Combien de mots différents (ayant un sens ou non) peut-on écrire avec toutes les lettres du mot ${motTx(e)}, sans contrainte ?`)];
    case "anagrammes":
      return [t(`Combien d'anagrammes le mot ${motTx(e)} a-t-il ?`)];
    case "fixe":
      return [t(`On place la lettre ${e.lettre} en premier. Combien de façons reste-t-il de ranger les autres lettres ?`)];
    case "interne":
      return [t(`Les voyelles du mot forment un bloc. De combien de façons peut-on ranger les voyelles à l'intérieur de ce bloc ?`)];
    case "externe":
      return [t("Le bloc compte maintenant comme une seule lettre. De combien de façons peut-on ranger ce bloc et les consonnes ?")];
    case "produit":
      return [t("Combien de mots ont toutes leurs voyelles côte à côte ?")];
    case "collees":
      return [t(`Combien de mots ont les deux lettres ${e.lettre} côte à côte (collées) ?`)];
    case "jamais":
      return [t(`Combien de mots n'ont jamais les deux lettres ${e.lettre} côte à côte ?`)];
  }
}

export function champs103(_e: E, p: P): ChampEcran[] {
  return [{ label: libelle103(_e, p), labelLatex: "N=", placeholder: "nombre ou calcul", raccourcis: [{ libelle: "!", texte: "!" }] }];
}

/** Calcul de l'écran (LaTeX, sans le résultat). */
export function formule103(e: E, p: P): string {
  const m = e.mot;
  switch (p) {
    case "total":
      return multinomialeLatex(m.length, effectifs(m));
    case "anagrammes":
      return `${mil(valeur103(e, "total"))}-1`;
    case "fixe": {
      const r = sansUne(m, e.lettre!);
      return multinomialeLatex(r.length, effectifs(r));
    }
    case "interne": {
      const v = voyellesDe(m);
      return multinomialeLatex(v.length, effectifs(v));
    }
    case "externe": {
      const c = consonnesDe(m);
      return multinomialeLatex(c.length + 1, effectifs(c));
    }
    case "produit":
      return `${mil(valeur103(e, "interne"))}\\times ${mil(valeur103(e, "externe"))}`;
    case "collees":
      return multinomialeLatex(m.length - 1, effectifsCollees(m, e.lettre!));
    case "jamais":
      return `${mil(valeur103(e, "total"))}-${mil(valeur103(e, "collees"))}`;
  }
}

export function reponse103(e: E, p: P): Frag[] {
  return [l(`${formule103(e, p)}=${mil(valeur103(e, p))}`)];
}
export const recap103 = reponse103;

export const messageIllisible103 = (): string =>
  "Nombre non reconnu : écris un entier (par exemple 180) ou un calcul (par exemple 6!/(2!·2!) ou 180 − 1). Cette saisie ne compte pas comme une tentative.";

export function aide1_103(e: E, p: P): AideEcran {
  switch (p) {
    case "total":
      return { texte: [t(`Permutation avec répétitions ${COURS} : `), l("n"), t(" lettres dont certaines sont identiques ; on divise par la factorielle du nombre de chaque lettre répétée :")], latex: "\\dfrac{n!}{n_1!\\times n_2!\\times\\cdots}" };
    case "anagrammes":
      return { texte: [t(`Anagramme ${COURS} : un mot différent du mot de départ. Le mot ${motTx(e)} lui-même est compté parmi les permutations.`)] };
    case "fixe":
      return { texte: [t("La première place est prise : on range les lettres restantes, avec leurs répétitions (une lettre placée en moins).")] };
    case "interne":
      return { texte: [t(`On range seulement les voyelles entre elles, comme une petite permutation avec répétitions ${COURS}.`)] };
    case "externe":
      return { texte: [t("Le bloc des voyelles se déplace d'un seul tenant : il compte pour une lettre parmi les consonnes.")] };
    case "produit":
      return { texte: [t("Principe multiplicatif : on choisit l'ordre du bloc et des consonnes, puis l'ordre des voyelles dans le bloc.")] };
    case "collees":
      return { texte: [t(`Colle les deux lettres ${e.lettre} : elles forment un seul symbole « ${e.lettre}${e.lettre} », et il reste un symbole de moins à ranger.`)] };
    case "jamais":
      return { texte: [t("Complément : les mots où elles ne sont jamais côte à côte sont tous les mots sauf ceux où elles sont collées.")] };
  }
}

export function aide2_103(e: E, p: P): AideEcran | null {
  const m = e.mot;
  switch (p) {
    case "total":
      return { texte: [t(`Le mot ${motTx(e)} a ${m.length} lettres : ${descriptionLettres(m)}.`)] };
    case "anagrammes":
      return { texte: [t("Ici, on retire le mot de départ du nombre de l'écran précédent :")], latex: `${mil(valeur103(e, "total"))}-1` };
    case "fixe": {
      const r = sansUne(m, e.lettre!);
      return { texte: [t(`Après ${e.lettre}, il reste ${r.length} lettres : ${descriptionLettres(r)}.`)] };
    }
    case "interne": {
      const v = voyellesDe(m);
      return { texte: [t(`Les voyelles sont ${[...v].join(", ")} (${v.length} lettres : ${descriptionLettres(v)}).`)] };
    }
    case "externe": {
      const c = consonnesDe(m);
      return { texte: [t(`On range ${c.length + 1} symboles : le bloc et les consonnes ${[...c].join(", ")} (${descriptionLettres(c)}).`)] };
    }
    case "produit":
      return { texte: [t("Ici :")], latex: formule103(e, "produit") };
    case "collees":
      return { texte: [t(`On range ${m.length - 1} symboles : « ${e.lettre}${e.lettre} » et les autres lettres (${descriptionLettres(sansUne(sansUne(m, e.lettre!), e.lettre!))}).`)] };
    case "jamais":
      return { texte: [t("Ici :")], latex: formule103(e, "jamais") };
  }
}

export { nbOccurrences };
