import type { Exercice161, Jeu, Verdict161 } from "../core6e/quelJeuChoisir";
import { CONTEXTES_161, apres, proba } from "../core6e/quelJeuChoisir";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { qL } from "./nombresExp";

/**
 * Couche C — textes de `6gen161` « Quel jeu choisir ? » : énoncé (contexte + deux jeux), consignes,
 * champs, options, aides à deux niveaux (méthode du cours, puis posée pour le jeu — il reste
 * toujours un calcul), réponses. Source unique de l'écran, du papier et du corrigé. Notation : G_A
 * « gagner au jeu A », événement contraire noté avec une barre (cours, § 1).
 */

type E = Exercice161;
export type Phase161 = "pA" | "pB" | "choix";
export const PHASES_161: Phase161[] = ["pA", "pB", "choix"];
const t = tx;
const l = lx;

const NOMBRE: Record<number, string> = { 2: "deux", 3: "trois", 4: "quatre" };
const FOIS: Record<number, string> = { 1: "une fois", 2: "deux fois", 3: "trois fois", 4: "quatre fois" };

/** Description d'un jeu (phrase complète, sans « Jeu A : »). */
export function descriptionJeu(j: Jeu): Frag[] {
  switch (j.type) {
    case "somme":
      return [t(`On lance deux dés équilibrés à six faces ; on gagne si la somme des deux résultats vaut ${j.mode === "egal" ? j.s : `au moins ${j.s}`}.`)];
    case "auMoinsUnDe":
      return [t(`On lance deux dés équilibrés à six faces ; on gagne si au moins un des deux dés montre ${j.k === 6 ? "un 6" : `${j.k} ou plus`}.`)];
    case "double":
      return [t("On lance deux dés équilibrés à six faces ; on gagne si les deux dés montrent le même nombre.")];
    case "ecart":
      return [t(`On lance deux dés équilibrés à six faces ; on gagne si l'écart entre les deux résultats (le plus grand moins le plus petit) vaut ${j.mode === "egal" ? j.d : `au moins ${j.d}`}.`)];
    case "produitPair":
      return [t("On lance deux dés équilibrés à six faces ; on gagne si le produit des deux résultats est pair.")];
    case "repete":
      return [t(`On lance ${NOMBRE[j.n]} fois un dé équilibré à six faces ; on gagne si on obtient au moins un 6.`)];
    case "pieces": {
      const quoi = j.mode === "exactement" ? `exactement ${FOIS[j.k]} pile` : j.k === 1 ? "au moins une fois pile" : `au moins ${FOIS[j.k]} pile`;
      return [t(`On lance ${NOMBRE[j.n]} pièces équilibrées ; on gagne si on obtient ${quoi}.`)];
    }
    case "urne": {
      const boules = `${j.r} boule${j.r > 1 ? "s" : ""} rouge${j.r > 1 ? "s" : ""} et ${j.v} boule${j.v > 1 ? "s" : ""} verte${j.v > 1 ? "s" : ""}`;
      const gain = j.evt === "deuxR" ? "si les deux boules sont rouges" : j.evt === "meme" ? "si les deux boules sont de la même couleur" : j.evt === "auMoinsUneR" ? "si au moins une des deux boules est rouge" : "si les deux boules sont de couleurs différentes";
      return [t(`Une urne contient ${boules}, indiscernables au toucher. On tire au hasard une boule, ${j.remise ? "on la remet dans l'urne" : "on la garde"}, puis on en tire une seconde ; on gagne ${gain}.`)];
    }
    case "roue": {
      const gain = j.evt === "deuxFois" ? "si la flèche s'arrête les deux fois sur un secteur gagnant" : j.evt === "auMoinsUne" ? "si la flèche s'arrête au moins une fois sur un secteur gagnant" : "si la flèche s'arrête exactement une fois sur un secteur gagnant";
      return [t(`Une roue est partagée en ${j.n} secteurs de même taille, dont ${j.k} gagnant${j.k > 1 ? "s" : ""}. On la fait tourner deux fois ; on gagne ${gain}.`)];
    }
  }
}

/** Description après « Jeu A : » : première lettre en minuscule. */
function apresDeuxPoints(f: Frag[]): Frag[] {
  return f.map((x, i) => (i === 0 && x.type === "texte" ? { ...x, valeur: x.valeur.charAt(0).toLocaleLowerCase("fr") + x.valeur.slice(1) } : x));
}

export function consigneGenerale(e: E): Frag[] {
  return [
    t(`${CONTEXTES_161[e.ctx]} Jeu A : `),
    ...apresDeuxPoints(descriptionJeu(e.jeuA)),
    t(" Jeu B : "),
    ...apresDeuxPoints(descriptionJeu(e.jeuB)),
    t(" On note "),
    l("G_A"),
    t(" l'événement « gagner au jeu A » et "),
    l("G_B"),
    t(" l'événement « gagner au jeu B »."),
  ];
}

export function consignePapier(): Frag[] {
  return [t("À quel jeu as-tu le plus de chances de gagner ? Justifie en calculant la probabilité exacte de gagner à chaque jeu.")];
}

export function libelle(_e: E, p: Phase161): string {
  return p === "pA" ? "Gagner au jeu A" : p === "pB" ? "Gagner au jeu B" : "Jeu choisi";
}

export function consigne(_e: E, p: Phase161): Frag[] {
  if (p === "pA") return [t("Calcule la probabilité de gagner au jeu A, "), l("P(G_A)"), t(" (valeur exacte).")];
  if (p === "pB") return [t("Calcule la probabilité de gagner au jeu B, "), l("P(G_B)"), t(" (valeur exacte).")];
  return [t("À quel jeu as-tu le plus de chances de gagner ?")];
}

export function champs(_e: E, p: Phase161): ChampEcran[] {
  return [{ label: p === "pA" ? "P(G_A) =" : "P(G_B) =", labelLatex: p === "pA" ? "P(G_A)=" : "P(G_B)=", placeholder: "ex. : 11/36" }];
}

export function options(): OptionEcran[] {
  return [
    { id: "A", fragments: [t("Au jeu A")] },
    { id: "B", fragments: [t("Au jeu B")] },
    { id: "egal", fragments: [t("Autant de chances aux deux jeux")] },
  ];
}

export function jeuDe(e: E, p: Phase161): Jeu {
  return p === "pB" ? e.jeuB : e.jeuA;
}

export function verdict161(e: E): Verdict161 {
  const a = proba(e.jeuA);
  const b = proba(e.jeuB);
  const d = a.n * b.d - b.n * a.d;
  return d === 0 ? "egal" : d > 0 ? "A" : "B";
}

export function reponse(e: E, p: Phase161): Frag[] {
  if (p === "pA") return [l(`P(G_A)=${qL(proba(e.jeuA))}`)];
  if (p === "pB") return [l(`P(G_B)=${qL(proba(e.jeuB))}`)];
  return options().find((o) => o.id === verdict161(e))!.fragments;
}

export const recap = reponse;

export function messageIllisible(): string {
  return "Je n'arrive pas à lire ta réponse (exemples d'écritures : 11/36, 5/12, 0,25). Cela ne compte pas comme une tentative.";
}

/** Le jeu se traite-t-il par l'événement contraire (« au moins un ») ? */
export function parContraire(j: Jeu): boolean {
  return j.type === "auMoinsUnDe" || j.type === "repete" || j.type === "produitPair" || (j.type === "pieces" && j.mode === "auMoins" && j.k === 1) || (j.type === "urne" && j.evt === "auMoinsUneR") || (j.type === "roue" && j.evt === "auMoinsUne");
}

const fr = (n: number, d: number) => `\\dfrac{${n}}{${d}}`;

export function aide1(e: E, p: Phase161): AideEcran {
  if (p === "choix") return { texte: [t("Pour comparer deux fractions, écris-les au même dénominateur (ou compare les produits en croix).")] };
  const j = jeuDe(e, p);
  const G = p === "pA" ? "G_A" : "G_B";
  if (parContraire(j)) return { texte: [t("« Au moins un » : passe par l'événement contraire (cours, point 4) :")], latex: `P(${G})=1-P(\\overline{${G}})` };
  if (j.type === "pieces") return { texte: [t("Épreuves répétées (cours, point 4) : tous les chemins de l'arbre ont la même probabilité ; compte les chemins gagnants.")] };
  if (j.type === "urne" || j.type === "roue")
    return { texte: [t(`Arbre pondéré (cours, point 2) : on multiplie les probabilités le long d'un chemin, puis on additionne les chemins gagnants.${j.type === "urne" && !j.remise ? " Sans remise, le second tirage se fait avec une boule de moins." : ""}`)] };
  return { texte: [t("Deux dés : 36 couples équiprobables (diagramme cartésien, cours, point 2) :")], latex: `P(${G})=\\dfrac{n(${G})}{36}` };
}

export function aide2(e: E, p: Phase161): AideEcran | null {
  if (p === "choix") {
    const a = proba(e.jeuA);
    const b = proba(e.jeuB);
    const L = ppcm(a.d, b.d);
    return { texte: [t("Un dénominateur commun aux deux probabilités : "), l(`${L}`), t(".")] };
  }
  const j = jeuDe(e, p);
  const G = p === "pA" ? "G_A" : "G_B";
  switch (j.type) {
    case "somme":
      return { texte: [t(`Compte les couples (premier dé ; second dé) dont la somme vaut ${j.mode === "egal" ? j.s : `${j.s} ou plus`} — par exemple `), l(j.mode === "egal" ? `(${Math.max(1, j.s - 6)}\\,;${Math.min(6, j.s - 1)})` : "(6\\,;6)"), t(" — puis divise par 36.")] };
    case "double":
      return { texte: [t("Compte les couples de la forme "), l("(1\\,;1)"), t(", "), l("(2\\,;2)"), t("… parmi les 36.")] };
    case "ecart":
      return { texte: [t(`Compte les couples dont l'écart vaut ${j.mode === "egal" ? j.d : `${j.d} ou plus`} — par exemple `), l(`(1\\,;${1 + j.d})`), t(" et "), l(`(${1 + j.d}\\,;1)`), t(" — puis divise par 36.")] };
    case "produitPair":
      return { texte: [t("Le produit est impair seulement si les deux dés sont impairs :")], latex: `P(\\overline{${G}})=\\dfrac{3}{6}\\times\\dfrac{3}{6}` };
    case "auMoinsUnDe":
      return { texte: [t(`Contraire : aucun des deux dés ne montre ${j.k === 6 ? "un 6" : `${j.k} ou plus`} :`)], latex: `P(\\overline{${G}})=${fr(j.k - 1, 6)}\\times ${fr(j.k - 1, 6)}` };
    case "repete":
      return { texte: [t(`Contraire : aucun 6 en ${NOMBRE[j.n]} lancers indépendants :`)], latex: `P(\\overline{${G}})=\\left(\\dfrac{5}{6}\\right)^{${j.n}}` };
    case "pieces":
      if (j.mode === "auMoins" && j.k === 1) return { texte: [t("Contraire : aucun pile, c'est-à-dire face à chaque lancer :")], latex: `P(\\overline{${G}})=\\left(\\dfrac{1}{2}\\right)^{${j.n}}` };
      return {
        texte: [t("L'arbre a "), l(`2^{${j.n}}=${2 ** j.n}`), t(" chemins équiprobables (P pour pile, F pour face) ; compte ceux qui ont "), t(j.mode === "exactement" ? `exactement ${j.k} P` : `au moins ${j.k} P`), t(`, par exemple ${"P".repeat(j.k)}${"F".repeat(j.n - j.k)}.`)],
      };
    case "urne": {
      const n = j.r + j.v;
      const ar = apres(j, "r");
      const av = apres(j, "v");
      const RR = `${fr(j.r, n)}\\times ${fr(ar.r, ar.n)}`;
      const VV = `${fr(j.v, n)}\\times ${fr(av.v, av.n)}`;
      const RV = `${fr(j.r, n)}\\times ${fr(ar.v, ar.n)}`;
      const VR = `${fr(j.v, n)}\\times ${fr(av.r, av.n)}`;
      if (j.evt === "deuxR") return { texte: [t("Un seul chemin gagnant : rouge, puis rouge :")], latex: `P(${G})=${RR}` };
      if (j.evt === "meme") return { texte: [t("Deux chemins gagnants : rouge puis rouge, vert puis vert :")], latex: `P(${G})=${RR}+${VV}` };
      if (j.evt === "auMoinsUneR") return { texte: [t("Contraire : aucune rouge, c'est-à-dire verte puis verte :")], latex: `P(\\overline{${G}})=${VV}` };
      return { texte: [t("Deux chemins gagnants : rouge puis verte, verte puis rouge :")], latex: `P(${G})=${RV}+${VR}` };
    }
    case "roue": {
      const g = fr(j.k, j.n);
      const pp = fr(j.n - j.k, j.n);
      if (j.evt === "deuxFois") return { texte: [t("Un seul chemin gagnant : gagnant, puis gagnant (deux lancers indépendants) :")], latex: `P(${G})=${g}\\times ${g}` };
      if (j.evt === "auMoinsUne") return { texte: [t("Contraire : perdant les deux fois :")], latex: `P(\\overline{${G}})=${pp}\\times ${pp}` };
      return { texte: [t("Deux chemins gagnants : gagnant puis perdant, perdant puis gagnant :")], latex: `P(${G})=${g}\\times ${pp}+${pp}\\times ${g}` };
    }
  }
}

export function explicationChoix(): string {
  return "Compare les deux probabilités exactes, écrites au même dénominateur : la plus grande donne le meilleur jeu ; égales, autant de chances.";
}

export function pgcd(a: number, b: number): number {
  return b ? pgcd(b, a % b) : Math.abs(a);
}
export function ppcm(a: number, b: number): number {
  return (a / pgcd(a, b)) * b;
}

export function syntheseVerdict161(e: E): Frag[] {
  return [l(`P(G_A)=${qL(proba(e.jeuA))}`), t(" et "), l(`P(G_B)=${qL(proba(e.jeuB))}`), t(" : "), t(verdict161(e) === "egal" ? "autant de chances aux deux jeux" : `le jeu ${verdict161(e)} est le meilleur`), t(".")];
}
