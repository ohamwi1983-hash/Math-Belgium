import type { DemandeEcran2FamilleB, EvenementFamilleB, ExerciceFamilleB, SousTypeFamilleB } from "../../core6e/probabilitesEnsembles.types";

/**
 * Couche A (6e) — génération famille B ("Cartes, dés et indépendance") pour `6gen30`. Tous les
 * effectifs (`count`, `countAetB`) sont dénombrés par ÉNUMÉRATION COMPLÈTE de l'univers (52 cartes,
 * ou n² couples de dés) — jamais par une formule combinatoire recopiée à la main : aucun risque
 * d'erreur de dénombrement, l'univers entier tient en quelques dizaines d'éléments dans les deux
 * cas.
 */

function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

// ============================================================================
// Sous-type "cartes" — jeu de 52 cartes.
// ============================================================================

type Suite = "coeur" | "carreau" | "trefle" | "pique";
const SUITES: readonly Suite[] = ["coeur", "carreau", "trefle", "pique"];
const LABEL_SUITE: Record<Suite, string> = { coeur: "cœur", carreau: "carreau", trefle: "trèfle", pique: "pique" };

interface Carte {
  rang: number; // 1..13 (1=as, 11=valet, 12=dame, 13=roi)
  suite: Suite;
}

function jeuDe52Cartes(): Carte[] {
  const cartes: Carte[] = [];
  for (const suite of SUITES) {
    for (let rang = 1; rang <= 13; rang++) cartes.push({ rang, suite });
  }
  return cartes;
}

interface DescripteurEvenement<T> {
  categorie: string;
  label: string;
  predicat: (item: T) => boolean;
}

function catalogueCartes(): DescripteurEvenement<Carte>[] {
  const valeurAleatoire = tirerEntier(2, 10);
  const suiteAleatoire = tirerParmi(SUITES);
  return [
    { categorie: "couleur", label: "la carte est rouge (cœur ou carreau)", predicat: (c) => c.suite === "coeur" || c.suite === "carreau" },
    { categorie: "couleur", label: "la carte est noire (trèfle ou pique)", predicat: (c) => c.suite === "trefle" || c.suite === "pique" },
    { categorie: "rang", label: "la carte est une figure (valet, dame ou roi)", predicat: (c) => c.rang >= 11 },
    { categorie: "rang", label: "la carte est un as", predicat: (c) => c.rang === 1 },
    { categorie: "rang", label: `la carte porte la valeur ${valeurAleatoire}`, predicat: (c) => c.rang === valeurAleatoire },
    { categorie: "suite", label: `la carte est un ${LABEL_SUITE[suiteAleatoire]}`, predicat: (c) => c.suite === suiteAleatoire },
  ];
}

// ============================================================================
// Sous-type "dés" — deux dés à n faces (n∈{4,6}).
// ============================================================================

interface JetDes {
  d1: number;
  d2: number;
}

function toutesLesPaires(facesParDe: number): JetDes[] {
  const paires: JetDes[] = [];
  for (let d1 = 1; d1 <= facesParDe; d1++) {
    for (let d2 = 1; d2 <= facesParDe; d2++) paires.push({ d1, d2 });
  }
  return paires;
}

function catalogueDes(facesParDe: number): DescripteurEvenement<JetDes>[] {
  const sommeCible = tirerEntier(3, 2 * facesParDe - 1); // évite les extrêmes 2/2n (effectif=1, peu instructif)
  const ecartCible = tirerEntier(0, facesParDe - 2);
  return [
    { categorie: "somme", label: `la somme des deux dés vaut ${sommeCible}`, predicat: (j) => j.d1 + j.d2 === sommeCible },
    { categorie: "ecart", label: ecartCible === 0 ? "les deux dés affichent la même valeur" : `l'écart entre les deux dés vaut ${ecartCible}`, predicat: (j) => Math.abs(j.d1 - j.d2) === ecartCible },
    { categorie: "parite", label: "la somme des deux dés est paire", predicat: (j) => (j.d1 + j.d2) % 2 === 0 },
  ];
}

/** Choisit 2 événements DISTINCTS dans `catalogue`, en évitant de coupler 2 événements de la MÊME
 * catégorie (ex. "rouge" ET "noire" — un couple parfaitement complémentaire, peu instructif pour un
 * exercice d'indépendance) — retirage borné (30 tentatives, catalogue toujours petit donc convergence
 * quasi immédiate). */
function choisirDeuxEvenements<T>(catalogue: readonly DescripteurEvenement<T>[]): [DescripteurEvenement<T>, DescripteurEvenement<T>] {
  for (let tentative = 0; tentative < 30; tentative++) {
    const i = tirerEntier(0, catalogue.length - 1);
    let j = tirerEntier(0, catalogue.length - 1);
    while (j === i) j = tirerEntier(0, catalogue.length - 1);
    const [a, b] = [catalogue[i], catalogue[j]];
    if (a.categorie !== b.categorie) return [a, b];
  }
  // Filet de sécurité théorique (catalogues réels ont toujours ≥2 catégories distinctes) : renvoie
  // les 2 premiers éléments de catégories différentes trouvés par balayage simple.
  for (let i = 0; i < catalogue.length; i++) {
    for (let j = 0; j < catalogue.length; j++) {
      if (i !== j && catalogue[i].categorie !== catalogue[j].categorie) return [catalogue[i], catalogue[j]];
    }
  }
  throw new Error("choisirDeuxEvenements : catalogue trop homogène");
}

const DEMANDES_ECRAN2_B: readonly DemandeEcran2FamilleB[] = ["intersection", "union"];

/** Construction déterministe (sous-type + demande écran 2 fixés) — utilisée par
 * `CATALOGUE_VARIANTES`/`construireAvecVarianteId`. */
export function construireFamilleB(sousType: SousTypeFamilleB, demandeEcran2: DemandeEcran2FamilleB): ExerciceFamilleB {
  if (sousType === "cartes") {
    const deck = jeuDe52Cartes();
    const [descA, descB] = choisirDeuxEvenements(catalogueCartes());
    const eventA: EvenementFamilleB = { label: descA.label, count: deck.filter(descA.predicat).length };
    const eventB: EvenementFamilleB = { label: descB.label, count: deck.filter(descB.predicat).length };
    const countAetB = deck.filter((c) => descA.predicat(c) && descB.predicat(c)).length;
    return { famille: "B", sousType, denominateur: 52, eventA, eventB, countAetB, demandeEcran2 };
  }
  const facesParDe = tirerParmi([4, 6] as const);
  const paires = toutesLesPaires(facesParDe);
  const [descA, descB] = choisirDeuxEvenements(catalogueDes(facesParDe));
  const eventA: EvenementFamilleB = { label: descA.label, count: paires.filter(descA.predicat).length };
  const eventB: EvenementFamilleB = { label: descB.label, count: paires.filter(descB.predicat).length };
  const countAetB = paires.filter((j) => descA.predicat(j) && descB.predicat(j)).length;
  return { famille: "B", sousType, facesParDe, denominateur: facesParDe * facesParDe, eventA, eventB, countAetB, demandeEcran2 };
}

const SOUS_TYPES_B: readonly SousTypeFamilleB[] = ["cartes", "des"];

/** Tirage ÉQUIPROBABLE du sous-type (cartes/dés) et de la demande écran 2. Retire (bornée à 20
 * tentatives) tant que `eventB.count===0` — ne devrait normalement jamais se produire (tous les
 * descripteurs de `catalogueCartes`/`catalogueDes` ont un effectif ≥1 par construction), filet de
 * sécurité pour garder P(A|B) toujours définie. */
export function genererFamilleB(): ExerciceFamilleB {
  for (let tentative = 0; tentative < 20; tentative++) {
    const exercice = construireFamilleB(tirerParmi(SOUS_TYPES_B), tirerParmi(DEMANDES_ECRAN2_B));
    if (exercice.eventB.count > 0) return exercice;
  }
  throw new Error("genererFamilleB : impossible d'obtenir un événement B non vide après 20 tentatives");
}
