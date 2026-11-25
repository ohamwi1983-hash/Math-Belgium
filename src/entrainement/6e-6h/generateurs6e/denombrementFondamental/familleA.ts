import type { ExerciceDenombrementA, SousTypeDenombA } from "../../core6e/denombrementFondamental.types";
import { melanger, tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Famille A de `6gen43` — principe multiplicatif, case par case : nombres à n chiffres tous
 * différents, premier chiffre non nul, formés avec un ENSEMBLE DE CHIFFRES tiré (audit 6e ch. 7,
 * lot C : variété — les dix chiffres une fois sur deux, sinon 6 à 8 chiffres, avec ou sans 0).
 * Chaque sous-type calcule les valeurs attendues de ses écrans (`valeursEcrans`).
 */

const TOUS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Nombre de nombres à n chiffres distincts formés avec `chiffres`, premier chiffre non nul. */
export function compterNombres(chiffres: number[], n: number): number {
  const m = chiffres.length;
  if (m < n) return 0;
  let r = m - (chiffres.includes(0) ? 1 : 0);
  for (let i = 1; i < n; i++) r *= m - i;
  return r;
}

function decroissants(depart: number, combien: number): number[] {
  return Array.from({ length: combien }, (_, i) => depart - i);
}

function produit(l: number[]): number {
  return l.reduce((a, b) => a * b, 1);
}

function tirerChiffres(contraintes: { avecZero?: boolean; contenir?: number[]; tailleMin?: number } = {}): number[] {
  if (contraintes.avecZero !== false && Math.random() < 0.5) return [...TOUS];
  const taille = tirerEntier(Math.max(6, contraintes.tailleMin ?? 6), 8);
  const avecZero = contraintes.avecZero ?? Math.random() < 0.75;
  const imposes = new Set<number>(contraintes.contenir ?? []);
  if (avecZero) imposes.add(0);
  const reste = melanger(TOUS.filter((c) => !imposes.has(c) && c !== 0));
  const choisis = [...imposes, ...reste.slice(0, Math.max(0, taille - imposes.size))];
  return choisis.sort((a, b) => a - b);
}

function base(sousType: SousTypeDenombA, chiffres: number[], n: number): Pick<ExerciceDenombrementA, "famille" | "sousType" | "chiffres" | "n" | "totalSansContrainte"> {
  return { famille: "A", sousType, chiffres, n, totalSansContrainte: compterNombres(chiffres, n) };
}

export function construireTotal(): ExerciceDenombrementA {
  const chiffres = tirerChiffres();
  const m = chiffres.length;
  const n = tirerEntier(3, Math.min(5, m - 1));
  const premier = m - (chiffres.includes(0) ? 1 : 0);
  const reste = decroissants(m - 1, n - 1);
  const total = premier * produit(reste);
  return { ...base("total", chiffres, n), valeursEcrans: [[premier], [...reste, total]], resultat: total };
}

export function construirePositionFixeeDernier(): ExerciceDenombrementA {
  const chiffres = tirerChiffres();
  const m = chiffres.length;
  const n = tirerEntier(3, Math.min(5, m - 1));
  const valeur = tirerParmi(chiffres);
  const z = chiffres.includes(0) ? 1 : 0;
  const premier = valeur === 0 ? m - 1 : m - 1 - z;
  const milieu = decroissants(m - 2, n - 2);
  const total = premier * produit(milieu);
  return { ...base("positionFixee", chiffres, n), variante: "dernier", fixes: [{ position: n, valeur }], valeursEcrans: [[1, premier], [...milieu, total]], resultat: total };
}

export function construirePositionFixeePremiers(): ExerciceDenombrementA {
  const chiffres = tirerChiffres();
  const m = chiffres.length;
  const n = tirerEntier(4, Math.min(5, m - 1));
  const combien = tirerParmi([1, 2] as const);
  const valeurs = melanger(chiffres.filter((c) => c !== 0)).slice(0, 1);
  if (combien === 2) valeurs.push(tirerParmi(chiffres.filter((c) => c !== valeurs[0])));
  const fixes = valeurs.map((valeur, i) => ({ position: i + 1, valeur }));
  const libres = decroissants(m - combien, n - combien);
  const total = produit(libres);
  return { ...base("positionFixee", chiffres, n), variante: "premiers", fixes, valeursEcrans: [[...libres, total]], resultat: total };
}

export function construireContientUnChiffre(): ExerciceDenombrementA {
  const chiffres = tirerChiffres({ tailleMin: 7 });
  const m = chiffres.length;
  const n = tirerEntier(3, Math.min(5, m - 2));
  const chiffre = tirerParmi(chiffres);
  const sans = chiffres.filter((c) => c !== chiffre);
  const premierSans = sans.length - (sans.includes(0) ? 1 : 0);
  const resteSans = decroissants(sans.length - 1, n - 1);
  const nbSans = premierSans * produit(resteSans);
  const total = compterNombres(chiffres, n);
  return { ...base("contientUnChiffre", chiffres, n), chiffre, valeursEcrans: [[premierSans], [...resteSans, nbSans], [total - nbSans]], resultat: total - nbSans };
}

export function construireContientDeuxChiffres(): ExerciceDenombrementA {
  const chiffres = tirerChiffres({ tailleMin: 8 });
  const m = chiffres.length;
  const n = tirerEntier(3, Math.min(4, m - 3));
  const [chiffre, chiffre2] = melanger(chiffres).slice(0, 2).sort((a, b) => a - b);
  const sans1 = compterNombres(chiffres.filter((c) => c !== chiffre), n);
  const sans2 = compterNombres(chiffres.filter((c) => c !== chiffre2), n);
  const sansLesDeux = chiffres.filter((c) => c !== chiffre && c !== chiffre2);
  const premier = sansLesDeux.length - (sansLesDeux.includes(0) ? 1 : 0);
  const reste = decroissants(sansLesDeux.length - 1, n - 1);
  const nbSansLesDeux = premier * produit(reste);
  const total = compterNombres(chiffres, n);
  const resultat = total - sans1 - sans2 + nbSansLesDeux;
  return {
    ...base("contientDeuxChiffres", chiffres, n),
    chiffre,
    chiffre2,
    sansChiffre1: sans1,
    sansChiffre2: sans2,
    valeursEcrans: [[premier], [...reste, nbSansLesDeux], [resultat]],
    resultat,
  };
}

export function construireBorneSuperieure(): ExerciceDenombrementA {
  const chiffres = tirerChiffres();
  const m = chiffres.length;
  const n = tirerEntier(3, Math.min(5, m - 1));
  const nonNuls = chiffres.filter((c) => c !== 0);
  // Borne b : entre 2 et 1 + l'avant-dernier chiffre non nul (au moins un chiffre admis, pas tous).
  const candidats = [];
  for (let b = 2; b <= 9; b++) {
    const admis = nonNuls.filter((c) => c < b).length;
    if (admis >= 1 && admis < nonNuls.length) candidats.push(b);
  }
  const borne = tirerParmi(candidats);
  const premier = nonNuls.filter((c) => c < borne).length;
  const reste = decroissants(m - 1, n - 1);
  const total = premier * produit(reste);
  return { ...base("borneSuperieure", chiffres, n), borne, valeursEcrans: [[premier], [...reste, total]], resultat: total };
}

export function construireParite(): ExerciceDenombrementA {
  const multipleDe5 = Math.random() < 0.35;
  const chiffres = multipleDe5 ? tirerChiffres({ avecZero: true, contenir: [5] }) : tirerChiffres({ avecZero: true, contenir: [tirerParmi([2, 4, 6, 8])] });
  const m = chiffres.length;
  const n = tirerEntier(3, Math.min(5, m - 1));
  const ensembleDernier = chiffres.filter((c) => (multipleDe5 ? c % 5 === 0 : c % 2 === 0));
  const milieu = decroissants(m - 2, n - 2);
  const M = produit(milieu);
  const resultat = (m - 1) * M + (ensembleDernier.length - 1) * (m - 2) * M;
  return {
    ...base("parite", chiffres, n),
    ensembleDernier,
    labelEnsemble: multipleDe5 ? "un multiple de 5" : "pair",
    valeursEcrans: [[m - 1, m - 2], milieu, [resultat]],
    resultat,
  };
}
