import type { ContexteExtD, ExerciceExtA, ExerciceExtD, ExerciceExtF } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Familles de `6gen52` (audit, lot C, G22–G23) : contextes COHÉRENTS (plus de « probabilité de tirer un
 * as : 0,3 », plus de contrôle qualité où le produit « rate » le contrôle) ; la probabilité de succès
 * se déduit du texte (dé, cartes, roues, deux épreuves indépendantes).
 */

function virgule(x: number): string {
  return String(Number(x.toFixed(6))).replace(".", ",");
}

function pgcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return Math.abs(a);
}

export function frontiereA(p: number, seuil: number): number {
  return Math.log(1 - seuil) / Math.log(1 - p);
}

const SEUILS = [0.75, 0.8, 0.9, 0.95, 0.99];

interface ModeleA {
  sousType: "compose" | "direct";
  /** Tire p (fraction) et le texte. */
  tirer: () => { num: number; den: number; texte: string; facteurs: string[] | null };
  evenement: string;
  unite: string;
}

const MODELES_A: ModeleA[] = [
  {
    sousType: "compose",
    tirer: () => {
      const p1 = tirerEntier(2, 8);
      const p2 = tirerEntier(2, 8);
      return {
        num: p1 * p2,
        den: 100,
        texte: `Dans un jeu télévisé, un candidat doit réussir deux épreuves indépendantes : il réussit la première avec une probabilité de ${virgule(p1 / 10)} et la seconde avec une probabilité de ${virgule(p2 / 10)}. Il gagne s'il réussit les deux.`,
        facteurs: [virgule(p1 / 10).replace(",", "{,}"), virgule(p2 / 10).replace(",", "{,}")],
      };
    },
    evenement: "au moins un candidat gagne",
    unite: "candidats",
  },
  {
    sousType: "compose",
    tirer: () => ({ num: 1, den: 36, texte: "On lance deux dés équilibrés à six faces ; on gagne la partie si l'on obtient un double six.", facteurs: ["\\dfrac{1}{6}", "\\dfrac{1}{6}"] }),
    evenement: "au moins une partie soit gagnée",
    unite: "parties",
  },
  {
    sousType: "compose",
    tirer: () => ({ num: 1, den: 12, texte: "Un joueur lance une pièce équilibrée et un dé équilibré à six faces ; il gagne s'il obtient pile et un 6.", facteurs: ["\\dfrac{1}{2}", "\\dfrac{1}{6}"] }),
    evenement: "au moins une partie soit gagnée",
    unite: "parties",
  },
  {
    sousType: "compose",
    tirer: () => {
      const a = tirerParmi([1, 3]);
      const b = tirerParmi([1, 2, 3]);
      const g = pgcd(a * b, 32);
      return {
        num: (a * b) / g,
        den: 32 / g,
        texte: `On fait tourner deux roues indépendantes : la première a ${a} secteur${a > 1 ? "s" : ""} gagnant${a > 1 ? "s" : ""} sur 8 secteurs égaux, la seconde ${b} sur 4. On gagne si les deux roues s'arrêtent sur un secteur gagnant.`,
        facteurs: [`\\dfrac{${a}}{8}`, `\\dfrac{${b}}{4}`],
      };
    },
    evenement: "au moins une partie soit gagnée",
    unite: "parties",
  },
  {
    sousType: "direct",
    tirer: () => {
      const p = tirerParmi([2, 4, 5, 8, 10]);
      return { num: p, den: 100, texte: `Dans une loterie, chaque billet est gagnant avec une probabilité de ${p} %, indépendamment des autres.`, facteurs: null };
    },
    evenement: "au moins un billet soit gagnant",
    unite: "billets",
  },
  {
    sousType: "direct",
    tirer: () => {
      const c = tirerParmi([
        { quoi: "un as", n: 4 },
        { quoi: "une figure (valet, dame ou roi)", n: 12 },
        { quoi: "le roi de cœur", n: 1 },
      ]);
      const g = pgcd(c.n, 52);
      return { num: c.n / g, den: 52 / g, texte: `On tire une carte au hasard dans un jeu de 52 cartes, on la remet, et on recommence. On gagne une partie si l'on tire ${c.quoi}.`, facteurs: null };
    },
    evenement: "au moins une partie soit gagnée",
    unite: "parties",
  },
  {
    sousType: "direct",
    tirer: () => ({ num: 1, den: 6, texte: "On lance un dé équilibré à six faces ; on gagne une partie si l'on obtient un 6.", facteurs: null }),
    evenement: "au moins une partie soit gagnée",
    unite: "parties",
  },
];

export function construireFamilleA(sousType?: "compose" | "direct"): ExerciceExtA {
  const modeles = MODELES_A.filter((m) => !sousType || m.sousType === sousType);
  for (;;) {
    const m = tirerParmi(modeles);
    const t = m.tirer();
    const seuil = tirerParmi(SEUILS);
    const p = t.num / t.den;
    const f = frontiereA(p, seuil);
    const n = Math.floor(f) + 1;
    if (n < 3 || n > 300 || Math.abs(f - Math.round(f)) < 0.05) continue;
    return { famille: "A", sousType: m.sousType, texte: t.texte, evenement: m.evenement, unite: m.unite, pNum: t.num, pDen: t.den, facteurs: t.facteurs, seuil, valeurN: n };
  }
}

const CONTEXTES_D: ContexteExtD[] = [
  { id: "assurance", intro: "Une compagnie d'assurance classe ses clients en trois catégories de risque", categories: ["risque faible", "risque moyen", "risque élevé"], critere: "le client déclare un sinistre dans l'année", individu: "un client" },
  { id: "usine", intro: "Une usine achète ses pièces à trois fournisseurs", categories: ["fournisseur 1", "fournisseur 2", "fournisseur 3"], critere: "la pièce est défectueuse", individu: "une pièce" },
  { id: "ecole", intro: "Les élèves d'une école suivent l'une de trois options", categories: ["option sciences", "option langues", "option arts"], critere: "l'élève poursuit des études supérieures", individu: "un élève" },
  { id: "test", intro: "Une population est répartie en trois tranches d'âge", categories: ["moins de 30 ans", "30 à 60 ans", "plus de 60 ans"], critere: "la personne est vaccinée contre la grippe", individu: "une personne" },
];

export function construireFamilleD(): ExerciceExtD {
  const contexte = tirerParmi(CONTEXTES_D);
  for (;;) {
    const q1 = tirerParmi([20, 25, 30, 35, 40, 45, 50]);
    const q2 = tirerParmi([15, 20, 25, 30, 35, 40]);
    const q3 = 100 - q1 - q2;
    if (q3 < 10 || q3 > 60) continue;
    const r = [tirerEntier(1, 12) * 5, tirerEntier(1, 12) * 5, tirerEntier(1, 12) * 5] as [number, number, number];
    if (new Set(r).size < 3) continue;
    const j = tirerParmi([0, 1, 2] as const);
    return { famille: "D", contexte, q: [q1, q2, q3], r, j };
  }
}

interface ModeleF {
  texte: string;
  definitionX: string;
  labels: [string, string, string];
  individus: string;
  valeurs: () => [number, number, number];
}

const MODELES_F: ModeleF[] = [
  {
    texte: "Une salle de sport propose trois formules d'abonnement mensuel",
    definitionX: "le montant mensuel, en euros, payé par un abonné choisi au hasard",
    labels: ["Basique", "Standard", "Premium"],
    individus: "abonnés",
    valeurs: () => {
      const a = tirerEntier(15, 25);
      const b = a + tirerEntier(8, 15);
      return [a, b, b + tirerEntier(10, 20)];
    },
  },
  {
    texte: "Une compagnie de bus propose trois forfaits mensuels",
    definitionX: "le prix, en euros, du forfait d'un client choisi au hasard",
    labels: ["Jeune", "Adulte", "Illimité"],
    individus: "clients",
    valeurs: () => {
      const a = tirerEntier(12, 20);
      const b = a + tirerEntier(10, 20);
      return [a, b, b + tirerEntier(10, 25)];
    },
  },
  {
    texte: "Une plateforme de musique propose trois offres mensuelles",
    definitionX: "le montant mensuel, en euros, payé par un client choisi au hasard",
    labels: ["Découverte", "Solo", "Famille"],
    individus: "clients",
    valeurs: () => [tirerParmi([0, 3, 5]), tirerEntier(9, 12), tirerEntier(15, 20)],
  },
];

export function construireFamilleF(): ExerciceExtF {
  const m = tirerParmi(MODELES_F);
  for (;;) {
    const p1 = tirerParmi([15, 20, 25, 30, 35, 40, 45]);
    const p2 = tirerParmi([15, 20, 25, 30, 35, 40]);
    if (100 - p1 - p2 < 10) continue;
    return { famille: "F", texte: m.texte, definitionX: m.definitionX, labels: m.labels, valeurs: m.valeurs(), pourcentage1: p1, pourcentage2: p2, population: tirerParmi([200, 400, 500, 800, 1000, 1500]), individus: m.individus };
  }
}
