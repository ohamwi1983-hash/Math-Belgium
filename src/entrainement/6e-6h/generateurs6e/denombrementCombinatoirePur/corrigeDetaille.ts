import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import type { ExerciceDenombCombPurA, ExerciceDenombCombPurB, ExerciceDenombCombPurC, ExerciceDenombCombPurD, ExerciceDenombrementCombinatoirePur, SousTypeDenombCombPurA } from "../../core6e/denombrementCombinatoirePur.types";
import { combinaisonBig, factorielleBig } from "../../moteur6e/saisieCombinatoire";
import { milliers } from "../../ui6e/fragmentsCombinatoire";
import { tripletLatex46 } from "../../ui6e/formatDenombrementCombinatoirePur";
import { CC, COURS_COMBINE, COURS_FONDAMENTAL, COURS_PROBLEMES, calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";

/**
 * Corrigé détaillé « comme au tableau » de `6gen46` (6e ch. 7, § 4, Transférer), une lettre par écran —
 * MÊME source pour l'écran révélé et pour le papier :
 * A) poker : la combinaison (hauteur puis couleurs), les cartes qui complètent la main, le produit ;
 * B) groupes supposés nommés (multinomiale), puis division par m! ; C) nᵏ ;
 * D) trois dés : décompositions, ordres de chacune, totaux, comparaison (216 triplets équiprobables).
 */

type E = ExerciceDenombrementCombinatoirePur;

function c(n: number, k: number): bigint {
  return combinaisonBig(n, k);
}

function etapesPoker(e: ExerciceDenombCombPurA): { f1: string; v1: string; f2: string; v2: string } {
  const h = e.hauteurs;
  const k = e.couleurs;
  switch (e.sousType) {
    case "carre":
      return { f1: `${h}\\times ${CC(4, 4)}`, v1: `${h}\\times 1`, f2: `${h - 1}\\times ${k}`, v2: "" };
    case "brelan":
      return { f1: `${h}\\times ${CC(k, 3)}`, v1: `${h}\\times ${c(k, 3)}`, f2: `${CC(h - 1, 2)}\\times ${k}^{2}`, v2: `${milliers(c(h - 1, 2))}\\times ${k * k}` };
    case "paire":
      return { f1: `${h}\\times ${CC(k, 2)}`, v1: `${h}\\times ${c(k, 2)}`, f2: `${CC(h - 1, 3)}\\times ${k}^{3}`, v2: `${milliers(c(h - 1, 3))}\\times ${k ** 3}` };
    case "deuxPaires":
      return { f1: `${CC(h, 2)}\\times\\big(${CC(k, 2)}\\big)^{2}`, v1: `${milliers(c(h, 2))}\\times ${c(k, 2)}^{2}`, f2: `${h - 2}\\times ${k}`, v2: "" };
  }
}

const RAISON1: Record<SousTypeDenombCombPurA, string> = {
  carre: "la hauteur du carré, puis ses 4 couleurs",
  brelan: "la hauteur du brelan, puis 3 de ses couleurs",
  paire: "la hauteur de la paire, puis 2 de ses couleurs",
  deuxPaires: "les 2 hauteurs des paires (sans ordre), puis 2 couleurs pour chacune",
};
const RAISON2: Record<SousTypeDenombCombPurA, string> = {
  carre: "une carte d'une autre hauteur, de n'importe quelle couleur",
  brelan: "2 autres hauteurs, puis une couleur pour chaque carte",
  paire: "3 autres hauteurs, puis une couleur pour chaque carte",
  deuxPaires: "une troisième hauteur, puis sa couleur",
};
const PIEGE_A: Record<SousTypeDenombCombPurA, string> = {
  carre: "Prendre la cinquième carte parmi toutes les cartes restantes est juste ici (aucune ne peut refaire un carré) ; l'erreur classique est d'oublier le choix de la hauteur.",
  brelan: "Choisir les deux autres cartes parmi toutes les cartes restantes compterait aussi les mains où elles forment une paire (un full).",
  paire: "Choisir les trois autres cartes parmi toutes les cartes restantes compterait aussi les doubles paires et les brelans.",
  deuxPaires: "Choisir les hauteurs des paires l'une après l'autre compte chaque main deux fois : les deux paires ne sont pas ordonnées.",
};

function corrigeA(e: ExerciceDenombCombPurA): EtapeCorrection[] {
  const p = etapesPoker(e);
  const l1: LigneCalcul[] = [ligne(`N_1=${p.f1}`, RAISON1[e.sousType])];
  if (p.v1 && p.v1 !== p.f1) l1.push(ligne(`=${p.v1}`));
  l1.push(ligne(`=${milliers(e.etape1)}`));
  const l2: LigneCalcul[] = [ligne(`N_2=${p.f2}`, RAISON2[e.sousType])];
  if (p.v2) l2.push(ligne(`=${p.v2}`));
  l2.push(ligne(`=${milliers(e.etape2)}`));
  return [
    utiliseCours("a", fx(`Principe multiplicatif : une main se construit en choisissant les hauteurs, puis les couleurs ; un jeu de ${e.hauteurs * e.couleurs} cartes a ${e.hauteurs} hauteurs et ${e.couleurs} couleurs`), COURS_PROBLEMES),
    calcul("a", l1),
    resultat("a", fx(`$N_1=${milliers(e.etape1)}$ façons de choisir la combinaison.`)),
    utiliseCours("b", fx("Les cartes qui complètent la main sont de hauteurs différentes entre elles et de celles déjà prises"), COURS_PROBLEMES),
    calcul("b", l2),
    resultat("b", fx(`$N_2=${milliers(e.etape2)}$ façons de compléter la main.`)),
    utiliseCours("c", fx("Principe multiplicatif : on multiplie les nombres de façons des deux étapes"), COURS_FONDAMENTAL),
    calcul("c", [ligne(`N=N_1\\times N_2`), ligne(`=${milliers(e.etape1)}\\times ${milliers(e.etape2)}`), ligne(`=${milliers(e.resultatFinal)}`)]),
    resultat("c", fx(`$N=${milliers(e.resultatFinal)}$ mains.`)),
    piege("c", fx(PIEGE_A[e.sousType])),
  ];
}

function corrigeB(e: ExerciceDenombCombPurB): EtapeCorrection[] {
  const fn = factorielleBig(e.n);
  const ft = factorielleBig(e.t);
  const fm = factorielleBig(e.m);
  return [
    utiliseCours("a", fx("Si les groupes portaient un nom, ce serait une répartition en groupes nommés : $\\dfrac{n!}{n_1!\\times n_2!\\times\\cdots}$"), COURS_COMBINE),
    calcul("a", [ligne(`N'=\\dfrac{${e.n}!}{(${e.t}!)^{${e.m}}}`, `${e.m} groupes de ${e.t}`), ligne(`=\\dfrac{${milliers(fn)}}{${milliers(ft ** BigInt(e.m))}}`, fx(`$${e.n}!=${milliers(fn)}$ et $(${e.t}!)^{${e.m}}=${ft}^{${e.m}}$`)), ligne(`=${milliers(e.nommes)}`)]),
    resultat("a", fx(`$N'=${milliers(e.nommes)}$ répartitions en groupes nommés.`)),
    utiliseCours("b", fx(`Sans nom, deux répartitions qui ne diffèrent que par l'ordre des groupes sont les mêmes : chacune a été comptée $m!$ fois`), COURS_PROBLEMES),
    calcul("b", [ligne(`N=\\dfrac{N'}{${e.m}!}`, `${e.m} groupes : ${e.m}! ordres`), ligne(`=\\dfrac{${milliers(e.nommes)}}{${fm}}`), ligne(`=${milliers(e.resultat)}`)]),
    resultat("b", fx(`$N=${milliers(e.resultat)}$ répartitions.`)),
    piege("b", fx(`Garder $${milliers(e.nommes)}$ : ce nombre distingue les groupes, alors qu'ils n'ont ni nom ni numéro.`)),
  ];
}

function corrigeC(e: ExerciceDenombCombPurC): EtapeCorrection[] {
  return [
    utiliseCours("a", fx("Chaque élément se règle indépendamment des autres, avec répétition possible : arrangement avec répétition $B_n^k=n^k$"), COURS_FONDAMENTAL),
    calcul("a", [ligne(`n=${e.n}`, "possibilités pour chaque élément"), ligne(`k=${e.k}`, "éléments"), ligne(`N=${e.n}^{${e.k}}`, "principe multiplicatif"), ligne(`=${milliers(e.resultat)}`)]),
    resultat("a", fx(`$N=${milliers(e.resultat)}$ possibilités.`)),
    piege("a", fx(`Inverser base et exposant ($${e.k}^{${e.n}}$) : la base est le nombre de possibilités de chaque élément, l'exposant le nombre d'éléments.`)),
  ];
}

function corrigeD(e: ExerciceDenombCombPurD): EtapeCorrection[] {
  const ligneSomme = (s: number, ds: ExerciceDenombCombPurD["decompositionsS1"]) => ligne(`${s}=${ds.map((d) => d.valeurs.join("+")).join("=")}`, `${ds.length} décompositions`);
  const ordres = (ds: ExerciceDenombCombPurD["decompositionsS1"]) => ds.map((d) => ligne(`${tripletLatex46(d)}\\to ${new Set(d.valeurs).size === 3 ? "3!" : new Set(d.valeurs).size === 2 ? "\\dfrac{3!}{2!}" : "\\dfrac{3!}{3!}"}=${d.arrangements}`));
  const liste = (ds: ExerciceDenombCombPurD["decompositionsS1"]) => ds.map((d) => `$${tripletLatex46(d)}$`).join(" ");
  const gagnante = e.comparaison === "egal" ? null : e.comparaison === "s1" ? e.s1 : e.s2;
  return [
    utiliseCours("a", fx("On écrit chaque somme avec trois nombres de 1 à 6 rangés par ordre croissant, pour n'en oublier aucune ni en compter deux fois"), COURS_PROBLEMES),
    calcul("a", [ligneSomme(e.s1, e.decompositionsS1), ligneSomme(e.s2, e.decompositionsS2)]),
    resultat("a", fx(`Somme ${e.s1} : ${liste(e.decompositionsS1)} ; somme ${e.s2} : ${liste(e.decompositionsS2)}.`)),
    utiliseCours("b", fx("Trois nombres différents donnent $3!=6$ triplets ordonnés, deux égaux et un différent en donnent 3, trois égaux 1"), COURS_FONDAMENTAL),
    calcul("b", [...ordres(e.decompositionsS1), ...ordres(e.decompositionsS2)]),
    resultat("b", fx(`Somme ${e.s1} : ${e.decompositionsS1.map((d) => d.arrangements).join(", ")} ordres ; somme ${e.s2} : ${e.decompositionsS2.map((d) => d.arrangements).join(", ")} ordres.`)),
    utiliseCours("c", fx("Les triplets d'une somme sont ceux de toutes ses décompositions : on additionne"), COURS_PROBLEMES),
    calcul("c", [ligne(`N_{${e.s1}}=${e.decompositionsS1.map((d) => d.arrangements).join("+")}`), ligne(`=${e.totalS1}`), ligne(`N_{${e.s2}}=${e.decompositionsS2.map((d) => d.arrangements).join("+")}`), ligne(`=${e.totalS2}`)]),
    resultat("c", fx(`$N_{${e.s1}}=${e.totalS1}$ triplets ; $N_{${e.s2}}=${e.totalS2}$ triplets.`)),
    utiliseCours("d", fx("Les $6^3=216$ triplets ordonnés sont équiprobables : la somme la plus fréquente est celle qui a le plus de triplets"), COURS_PROBLEMES),
    calcul("d", [ligne(`P(S=${e.s1})=\\dfrac{${e.totalS1}}{216}`, "triplets favorables sur 216"), ligne(`P(S=${e.s2})=\\dfrac{${e.totalS2}}{216}`, "triplets favorables sur 216")]),
    resultat("d", fx(gagnante === null ? `Les sommes ${e.s1} et ${e.s2} sont aussi fréquentes l'une que l'autre ($${e.totalS1}$ triplets chacune).` : `La somme ${gagnante} sort plus souvent ($${Math.max(e.totalS1, e.totalS2)}$ triplets contre $${Math.min(e.totalS1, e.totalS2)}$).`)),
    ...(e.decompositionsS1.length === e.decompositionsS2.length && gagnante !== null ? [verification("d", fx(`Les deux sommes ont pourtant autant de décompositions (${e.decompositionsS1.length}) : c'est le problème des trois dés posé à Galilée.`))] : []),
    piege("d", fx("Comparer les nombres de décompositions : les décompositions ne sont pas équiprobables, seuls les 216 triplets ordonnés le sont.")),
  ];
}

export function correctionDetailleeDenombrementCombinatoirePur(e: E): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return finaliserCombinatoire(corrigeA(e));
    case "B":
      return finaliserCombinatoire(corrigeB(e));
    case "C":
      return finaliserCombinatoire(corrigeC(e));
    case "D":
      return finaliserCombinatoire(corrigeD(e));
  }
}
