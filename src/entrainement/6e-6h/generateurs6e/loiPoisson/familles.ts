import type { ConditionPoisson, ExerciceLoiPoissonA, ExerciceLoiPoissonB, TypeQuestionPoissonB } from "../../core6e/loiPoisson.types";
import { tirerEntier, tirerParmi } from "./aleatoire";
import { probabilitePoisson } from "./poisson";

/**
 * Familles de `6gen53` (audit, lots B et C, G26–G28).
 * - A : verdict tiré d'abord (G8 : les trois conditions étaient TOUJOURS vraies) ; n et p varient.
 * - B : λ ≤ 15 (avant : λ = 75, 75⁷⁵ ≈ 10¹⁴⁰ dépassait la calculatrice) ; contextes « effectif » dans
 *   les conditions du cours (n ≥ 30, p ≤ 0,1, np ≤ 15 ; plus de gauchers à 12 %) ; k proche de λ et
 *   résultat entre 0,005 et 0,995 (plus de « au moins 2 » qui vaut 1) ; X défini.
 */

function virgule(x: number): string {
  return String(Number(x.toFixed(6))).replace(".", ",");
}
function milliers(n: number): string {
  return n >= 10000 ? String(n).replace(/\B(?=(\d{3})+$)/g, " ") : String(n);
}

const CONTEXTES_A: { texte: (n: number, p: string) => string; x: string }[] = [
  { texte: (n, p) => `Une machine produit des pièces ; chacune est défectueuse avec une probabilité de ${p}, indépendamment des autres. On prélève ${n} pièces.`, x: "le nombre de pièces défectueuses" },
  { texte: (n, p) => `À un péage, chaque voiture est en infraction avec une probabilité de ${p}, indépendamment des autres. On contrôle ${n} voitures.`, x: "le nombre de voitures en infraction" },
  { texte: (n, p) => `Un médicament provoque une réaction allergique chez un patient avec une probabilité de ${p}. On le donne à ${n} patients, de façon indépendante.`, x: "le nombre de patients allergiques" },
  { texte: (n, p) => `Chaque ordinateur d'un parc tombe en panne ce mois-ci avec une probabilité de ${p}, indépendamment des autres. Le parc compte ${n} ordinateurs.`, x: "le nombre d'ordinateurs en panne" },
];

const CONDITIONS: ConditionPoisson[] = ["n", "p", "np"];

export function construireFamilleA(): ExerciceLoiPoissonA {
  const approximable = Math.random() < 0.5;
  const condition = approximable ? null : tirerParmi(CONDITIONS);
  for (;;) {
    let n: number;
    let pc: number;
    if (condition === null) {
      pc = tirerParmi([1, 2, 3, 4, 5, 6, 8, 10]);
      n = tirerEntier(3, 40) * 10;
      if (n * pc < 100 || n * pc > 1500) continue;
    } else if (condition === "n") {
      pc = tirerParmi([5, 6, 8, 10]);
      n = tirerEntier(12, 29);
    } else if (condition === "p") {
      pc = tirerParmi([12, 15, 20, 25]);
      n = tirerEntier(3, Math.floor(1500 / pc / 10)) * 10;
      if (n < 30) continue;
    } else {
      pc = tirerParmi([4, 5, 6, 8, 10]);
      n = tirerEntier(10, 100) * 10;
      if (n * pc < 1600 || n * pc > 4000) continue;
    }
    const lambda = (n * pc) / 100;
    const k = Math.max(0, Math.round(lambda) + tirerEntier(-2, 2));
    const c = tirerParmi(CONTEXTES_A);
    const texte = `${c.texte(n, virgule(pc / 100))} On note $X$ ${c.x}.`;
    return { famille: "A", texte, n, pCentiemes: pc, k, approximable, condition };
  }
}

interface ModeleB {
  /** Taux et échelle : λ = taux × échelle / référence. */
  tirer: () => { taux: number; reference: number; cible: number };
  texte: (taux: string, cible: string) => string;
  x: string;
}

const MODELES_B: ModeleB[] = [
  {
    tirer: () => ({ taux: tirerParmi([2, 3, 4, 5, 8]), reference: 1000, cible: tirerParmi([500, 1000, 1500, 2000]) }),
    texte: (t, c) => `Une usine produit en moyenne ${t} articles défectueux pour 1 000 articles. On prélève un lot de ${c} articles.`,
    x: "le nombre d'articles défectueux du lot",
  },
  {
    tirer: () => ({ taux: tirerParmi([0.5, 1, 1.5, 2, 3]), reference: 1, cible: tirerParmi([2, 3, 4, 5, 6]) }),
    texte: (t, c) => `À un guichet, il arrive en moyenne ${t} client${Number(t.replace(",", ".")) >= 2 ? "s" : ""} par minute. On observe le guichet pendant ${c} minutes.`,
    x: "le nombre de clients arrivés pendant cette durée",
  },
  {
    tirer: () => ({ taux: tirerParmi([1, 2, 3]), reference: 10000, cible: tirerParmi([20000, 30000, 40000]) }),
    texte: (t, c) => `En moyenne, ${t} patient${t === "1" ? "" : "s"} sur 10 000 présente${t === "1" ? "" : "nt"} une réaction allergique à un vaccin. Un centre vaccine ${c} personnes.`,
    x: "le nombre de réactions allergiques dans ce centre",
  },
  {
    tirer: () => ({ taux: tirerParmi([1, 2, 3, 4]), reference: 1000, cible: tirerParmi([1000, 1500, 2000, 2500, 3000]) }),
    texte: (t, c) => `Un dactylographe fait en moyenne ${t} faute${t === "1" ? "" : "s"} de frappe pour 1 000 mots. Il tape un texte de ${c} mots.`,
    x: "le nombre de fautes de frappe du texte",
  },
  {
    tirer: () => ({ taux: tirerParmi([0.5, 1, 1.5, 2]), reference: 1, cible: tirerParmi([2, 3, 4, 6]) }),
    texte: (t, c) => `Un serveur informatique connaît en moyenne ${t} panne${Number(t.replace(",", ".")) >= 2 ? "s" : ""} par mois. On étudie une période de ${c} mois.`,
    x: "le nombre de pannes pendant cette période",
  },
];

const TYPES_B: TypeQuestionPoissonB[] = ["exactement", "entreAetB", "auPlus", "auMoins"];

export function resultatB(e: Pick<ExerciceLoiPoissonB, "lambda" | "typeQuestion" | "k" | "kHaut">): number {
  const P = (i: number) => probabilitePoisson(e.lambda, i);
  const somme = (a: number, b: number) => {
    let s = 0;
    for (let i = a; i <= b; i++) s += P(i);
    return s;
  };
  switch (e.typeQuestion) {
    case "exactement":
      return P(e.k);
    case "auPlus":
      return somme(0, e.k);
    case "auMoins":
      return 1 - somme(0, e.k - 1);
    case "entreAetB":
      return somme(e.k, e.kHaut as number);
  }
}

/** Nombre de termes à additionner (tolérance de la somme de termes arrondis). */
export function nombreTermesB(e: ExerciceLoiPoissonB): number {
  if (e.typeQuestion === "exactement") return 1;
  if (e.typeQuestion === "auPlus") return e.k + 1;
  if (e.typeQuestion === "auMoins") return e.k;
  return (e.kHaut as number) - e.k + 1;
}

export function construireFamilleB(typeQuestion?: TypeQuestionPoissonB): ExerciceLoiPoissonB {
  const type = typeQuestion ?? tirerParmi(TYPES_B);
  for (;;) {
    const m = tirerParmi(MODELES_B);
    const { taux, reference, cible } = m.tirer();
    const lambda = Math.round(((taux * cible) / reference) * 100) / 100;
    if (lambda < 1 || lambda > 15) continue;
    const c = Math.round(lambda);
    let k: number;
    let kHaut: number | null = null;
    if (type === "exactement") k = Math.max(0, c + tirerEntier(-2, 2));
    else if (type === "auPlus") k = Math.max(1, c + tirerEntier(-2, 1));
    else if (type === "auMoins") k = Math.max(1, c + tirerEntier(-2, 1));
    else {
      k = Math.max(0, c - tirerEntier(1, 2));
      kHaut = k + tirerEntier(1, 3);
    }
    const e = { lambda, typeQuestion: type, k, kHaut };
    const r = resultatB(e);
    if (r < 0.005 || r > 0.995) continue;
    if (type !== "exactement" && nombreTermesB({ famille: "B", texte: "", definitionX: "", calculLambda: "", ...e }) > 12) continue;
    const calculLambda = reference === 1 ? `${virgule(taux).replace(",", "{,}")}\\times ${cible}` : `${virgule(taux).replace(",", "{,}")}\\times\\dfrac{${milliers(cible).replace(" ", "\\,")}}{${milliers(reference).replace(" ", "\\,")}}`;
    return { famille: "B", texte: m.texte(virgule(taux), milliers(cible)), definitionX: m.x, calculLambda, ...e };
  }
}
