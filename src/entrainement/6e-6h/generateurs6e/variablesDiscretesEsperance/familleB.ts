import type { ExerciceEsperanceB, ExerciceEsperanceB_ContexteDirect, ExerciceEsperanceB_Hypergeometrique, IssueB } from "../../core6e/variablesDiscretesEsperance.types";
import { combinaisonBig, rationnel } from "../../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../../moteur6e/saisieCombinatoire";
import { genererPoids, tirerBooleen, tirerEntier, tirerParmi } from "./aleatoire";

/**
 * 6gen49, famille B : construire la loi de X, puis E(X). Audit : X toujours défini (« X est le gain
 * algébrique… ») ; contextes dont les probabilités viennent des effectifs (plus de « pièce truquée à
 * 3 issues » à poids arbitraires) ; plusieurs issues peuvent donner la même valeur de X (il faut les
 * regrouper : c'est l'étape de construction) ; hypergéométrique avec des objets nommés.
 */

function euros(n: number): string {
  return `${n} €`;
}

function listeFaces(faces: number[]): string {
  if (faces.length === 1) return `${faces[0]}`;
  const consecutif = faces.every((f, i) => i === 0 || f === faces[i - 1] + 1);
  if (consecutif && faces.length >= 3) return `de ${faces[0]} à ${faces[faces.length - 1]}`;
  return faces.slice(0, -1).join(", ") + " ou " + faces[faces.length - 1];
}

function construireDe(): ExerciceEsperanceB_ContexteDirect {
  const f = tirerParmi([6, 8, 10, 12]);
  // Trois groupes de faces consécutives, de gains distincts (une perte possible).
  for (;;) {
    const tailles = genererPoids(3, f);
    if (tailles.some((t) => t > f - 2)) continue;
    const gains = [tirerEntier(-4, -1), tirerEntier(0, 2), tirerEntier(3, 8)];
    if (tirerBooleen(0.5)) gains.reverse();
    let debut = 1;
    const issues: IssueB[] = tailles.map((t, i) => {
      const faces = Array.from({ length: t }, (_, j) => debut + j);
      debut += t;
      const g = gains[i];
      const regle = g > 0 ? `on gagne ${euros(g)}` : g < 0 ? `on perd ${euros(-g)}` : "on ne gagne rien";
      return { label: `${listeFaces(faces)} : ${regle}`, valeur: g, effectif: t };
    });
    const texte = `On lance un dé équilibré à ${f} faces numérotées de 1 à ${f}. Résultat ${issues.map((i) => i.label).join(" ; ")}.`;
    return { famille: "B", sousType: "contexteDirect", texte, definitionX: "le gain algébrique du joueur, en euros (une perte est un gain négatif)", issues, total: f, unite: "€" };
  }
}

function construireRoue(): ExerciceEsperanceB_ContexteDirect {
  const total = tirerParmi([10, 12, 16, 20]);
  const couleurs = ["rouges", "bleus", "verts", "jaunes"];
  const k = tirerParmi([3, 4]);
  const effectifs = genererPoids(k, total);
  const gainsPossibles = [0, 1, 2, 3, 5, 10, 20];
  // Deux couleurs peuvent rapporter le même montant : la loi les regroupe.
  const gains = effectifs.map(() => tirerParmi(gainsPossibles));
  if (new Set(gains).size < 2) gains[0] = gains[0] === 0 ? 5 : 0;
  const issues: IssueB[] = effectifs.map((e, i) => ({ label: `${couleurs[i]}`, valeur: gains[i], effectif: e }));
  const description = issues.map((i) => `${i.effectif} ${i.effectif > 1 ? i.label : i.label.slice(0, -1)}`).join(", ");
  const regles = issues.map((i) => `un secteur ${i.label.slice(0, -1)} rapporte ${euros(i.valeur)}`).join(", ");
  const texte = `Une roue de loterie est partagée en ${total} secteurs égaux : ${description}. On fait tourner la roue une fois : ${regles}.`;
  return { famille: "B", sousType: "contexteDirect", texte, definitionX: "le montant gagné, en euros", issues, total, unite: "€" };
}

function construireEnquete(): ExerciceEsperanceB_ContexteDirect {
  const total = tirerParmi([20, 25, 40, 50]);
  const k = tirerParmi([4, 5]);
  const effectifs = genererPoids(k, total);
  const objet = tirerParmi([
    { groupe: "familles d'un quartier", quoi: "enfants", x: "le nombre d'enfants d'une famille choisie au hasard" },
    { groupe: "élèves d'une école", quoi: "frères et sœurs", x: "le nombre de frères et sœurs d'un élève choisi au hasard" },
    { groupe: "ménages d'un immeuble", quoi: "voitures", x: "le nombre de voitures d'un ménage choisi au hasard" },
  ]);
  const issues: IssueB[] = effectifs.map((e, i) => ({ label: `${i} ${objet.quoi}`, valeur: i, effectif: e }));
  const texte = `Une enquête auprès de ${total} ${objet.groupe} donne : ${issues.map((i) => (i.valeur === 0 ? `${i.effectif} n'en ont aucun` : `${i.effectif} en ont ${i.valeur}`)).join(", ")}.`;
  return { famille: "B", sousType: "contexteDirect", texte, definitionX: objet.x, issues, total, unite: "" };
}

export function construireContexteDirect(): ExerciceEsperanceB_ContexteDirect {
  return tirerParmi([construireDe, construireRoue, construireEnquete])();
}

const CONTEXTES_HYPER = [
  { quoi: (N: number, K: number) => `Une urne contient ${N} boules : ${K} rouges et ${N - K} blanches.`, tirage: (n: number) => `On tire ${n} boules simultanément.`, x: "le nombre de boules rouges tirées" },
  { quoi: (N: number, K: number) => `Un lot de ${N} pièces contient ${K} pièces défectueuses.`, tirage: (n: number) => `On prélève ${n} pièces au hasard, sans remise.`, x: "le nombre de pièces défectueuses prélevées" },
  { quoi: (N: number, K: number) => `Une classe compte ${N} élèves, dont ${K} filles.`, tirage: (n: number) => `On tire au sort un groupe de ${n} élèves.`, x: "le nombre de filles du groupe" },
];

export function construireHypergeometrique(): ExerciceEsperanceB_Hypergeometrique {
  const N = tirerEntier(6, 10);
  const K = tirerEntier(2, N - 2);
  const n = tirerEntier(2, Math.min(4, N - 2));
  const c = tirerParmi(CONTEXTES_HYPER);
  return { famille: "B", sousType: "hypergeometrique", texte: `${c.quoi(N, K)} ${c.tirage(n)}`, definitionX: c.x, N, K, n };
}

export function construireFamilleB(): ExerciceEsperanceB {
  return tirerBooleen(0.5) ? construireContexteDirect() : construireHypergeometrique();
}

/** Loi de X (valeurs croissantes, probabilités exactes réduites). */
export function loiB(e: ExerciceEsperanceB): { valeur: number; p: Rationnel }[] {
  if (e.sousType === "hypergeometrique") {
    const r: { valeur: number; p: Rationnel }[] = [];
    const total = combinaisonBig(e.N, e.n);
    for (let k = Math.max(0, e.n - (e.N - e.K)); k <= Math.min(e.n, e.K); k++) r.push({ valeur: k, p: rationnel(combinaisonBig(e.K, k) * combinaisonBig(e.N - e.K, e.n - k), total) });
    return r;
  }
  const parValeur = new Map<number, number>();
  for (const i of e.issues) parValeur.set(i.valeur, (parValeur.get(i.valeur) ?? 0) + i.effectif);
  return [...parValeur.entries()].sort((a, b) => a[0] - b[0]).map(([valeur, eff]) => ({ valeur, p: rationnel(eff, e.total) }));
}

export function esperanceB(e: ExerciceEsperanceB): Rationnel {
  if (e.sousType === "hypergeometrique") return rationnel(e.n * e.K, e.N);
  return rationnel(e.issues.reduce((s, i) => s + i.valeur * i.effectif, 0), e.total);
}
