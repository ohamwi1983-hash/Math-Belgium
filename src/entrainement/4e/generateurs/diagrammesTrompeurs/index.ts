import type {
  ConditionGroupe,
  ContexteCategoriel,
  ContexteEvolution,
  ExerciceBatons,
  ExerciceCirculaire,
  ExerciceDiagrammesTrompeurs,
  ExerciceTrompeurBarres,
  ExerciceTrompeurCirculaire,
  Manipulation,
  SousTypeDiagrammes,
  VarianteDiagrammes,
} from "../../core/diagrammesTrompeurs.types";
import { CONTEXTES_DISCRETS, dansGroupe } from "../../moteur/modeleDiagrammesTrompeurs";

/**
 * Générateur de gen111 — « Diagrammes et graphiques trompeurs ». Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR
 * code d'une feuille rouvre le MÊME exercice.
 *
 * Variante → sous-type tiré uniformément (`direct`/`inverse`, `batons`/`circulaire`, ou l'une des
 * quatre manipulations) : chaque forme sort avec une probabilité ≥ 25 % dans sa variante (séries
 * équilibrées faciles à reproduire, `profil.ts`).
 *
 * Garanties (vérifiées par tirages massifs) :
 * - diagramme circulaire : fréquences multiples de 2,5 % ou 5 %, angles entiers (multiples de 9° ou
 *   18°), chaque secteur ≥ 10 % (36°) pour rester lisible à 390 px et sur papier ;
 * - diagramme en bâtons : effectifs entiers de 1 à 15 (lus sur un quadrillage d'une unité), effectif
 *   total 20, 25, 40 ou 50 (pourcentage du groupe exact, au plus une décimale) ;
 * - graphiques trompeurs : toutes les valeurs à lire tombent SUR une graduation ; évolution réelle
 *   entière (en %) ; l'évolution suggérée par le dessin vaut au moins le double de la réelle ;
 * - total ≠ 100 % : pourcentages multiples de 5, somme entre 110 % et 150 %, nombre de réponses
 *   entier.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

/** `k` entiers ≥ `min` et ≤ `max`, de somme `total` (répartition aléatoire du reste). */
function composition(k: number, total: number, min: number, max: number): number[] | null {
  const parts = Array.from({ length: k }, () => min);
  let reste = total - k * min;
  if (reste < 0) return null;
  let garde = 0;
  while (reste > 0 && garde++ < 10_000) {
    const i = Math.floor(Math.random() * k);
    if (parts[i]! < max) {
      parts[i]!++;
      reste--;
    }
  }
  return reste === 0 ? parts : null;
}

// ---------------------------------------------------------------------------------------------
// Contextes
// ---------------------------------------------------------------------------------------------

const CONTEXTES_CATEGORIELS: { contexte: ContexteCategoriel; noms: string[] }[] = [
  {
    contexte: { phrase: "On a interrogé {n} élèves sur le moyen de transport qu'ils utilisent pour venir à l'école.", titre: "Moyen de transport", colonne: "Transport", individus: "élèves" },
    noms: ["Bus", "Vélo", "Voiture", "À pied", "Train", "Tram"],
  },
  {
    contexte: { phrase: "On a demandé à {n} élèves quel est leur sport préféré.", titre: "Sport préféré", colonne: "Sport", individus: "élèves" },
    noms: ["Football", "Natation", "Basket", "Tennis", "Danse", "Judo"],
  },
  {
    contexte: { phrase: "On a demandé à {n} élèves ce qu'ils mangent le plus souvent au petit-déjeuner.", titre: "Petit-déjeuner", colonne: "Petit-déjeuner", individus: "élèves" },
    noms: ["Céréales", "Tartines", "Fruits", "Yaourt", "Rien"],
  },
  {
    contexte: { phrase: "On a demandé à {n} familles quel est leur animal de compagnie principal.", titre: "Animal de compagnie", colonne: "Animal", individus: "familles" },
    noms: ["Chien", "Chat", "Poisson", "Lapin", "Aucun"],
  },
  {
    contexte: { phrase: "On a demandé à {n} jeunes quel est leur loisir préféré.", titre: "Loisir préféré", colonne: "Loisir", individus: "jeunes" },
    noms: ["Lecture", "Jeux vidéo", "Sport", "Musique", "Cinéma"],
  },
  {
    contexte: { phrase: "On a relevé le type de logement de {n} familles d'un village.", titre: "Type de logement", colonne: "Logement", individus: "familles" },
    noms: ["Maison", "Appartement", "Ferme", "Studio"],
  },
];

const CONTEXTES_EVOLUTION: ContexteEvolution[] = [
  { auteur: "Un magasin de vélos", grandeur: "ses ventes de vélos électriques", complement: "de ses ventes", court: "Ventes de vélos", unite: "vélos" },
  { auteur: "Un musée", grandeur: "son nombre de visiteurs", complement: "du nombre de visiteurs", court: "Visiteurs", unite: "visiteurs" },
  { auteur: "Une chaîne vidéo", grandeur: "son nombre d'abonnés", complement: "du nombre d'abonnés", court: "Abonnés", unite: "abonnés" },
  { auteur: "Une cantine", grandeur: "le nombre de repas qu'elle sert", complement: "du nombre de repas servis", court: "Repas servis", unite: "repas" },
  { auteur: "Un club de sport", grandeur: "son nombre d'inscrits", complement: "du nombre d'inscrits", court: "Inscrits", unite: "inscrits" },
];

const CONTEXTES_PICTOGRAMMES: { contexte: ContexteEvolution; dessin: "maison" | "bouteille" }[] = [
  {
    contexte: { auteur: "Une commune", grandeur: "le nombre de logements construits sur son territoire", complement: "du nombre de logements construits", court: "Logements construits", unite: "logements" },
    dessin: "maison",
  },
  {
    contexte: { auteur: "Une coopérative", grandeur: "sa production de jus de pommes", complement: "de sa production", court: "Production de jus", unite: "litres" },
    dessin: "bouteille",
  },
];

const CONTEXTES_REPONSES_MULTIPLES: { caractere: string; objet: string; individus: string; noms: string[] }[] = [
  { caractere: "Sports pratiqués", objet: "sports", individus: "jeunes", noms: ["Football", "Natation", "Tennis", "Basket", "Danse"] },
  { caractere: "Réseaux sociaux utilisés", objet: "réseaux sociaux", individus: "adolescents", noms: ["Vidéos", "Photos", "Messagerie", "Forums", "Jeux"] },
  { caractere: "Instruments joués", objet: "instruments", individus: "élèves de l'académie", noms: ["Piano", "Guitare", "Violon", "Batterie", "Flûte"] },
  { caractere: "Moyens de s'informer", objet: "moyens", individus: "personnes", noms: ["Télévision", "Internet", "Radio", "Journal"] },
];

const MANIPULATIONS: Manipulation[] = ["axe-tronque", "pictogrammes", "echelle-irreguliere", "total-faux"];

// ---------------------------------------------------------------------------------------------
// Diagramme circulaire (construire / lire)
// ---------------------------------------------------------------------------------------------

function tirerCirculaire(variante: "circulaire-construire" | "lire-diagramme", sousType: "direct" | "inverse" | "circulaire"): ExerciceCirculaire {
  for (;;) {
    const { contexte, noms } = choisir(CONTEXTES_CATEGORIELS);
    const k = entier(3, Math.min(5, noms.length));
    const base = choisir([20, 40] as const);
    const unites = composition(k, base, base / 10, Math.floor(base * 0.55));
    if (!unites || unites.every((u) => u === unites[0])) continue;
    const m = base === 20 ? choisir([1, 2, 3, 5, 6, 10]) : choisir([1, 2, 3, 5]);
    const choisis = melanger(noms).slice(0, k);
    const secteurs = choisis.map((nom, i) => ({ nom, effectif: unites[i]! * m }));
    return { variante, sousType, contexte, secteurs, n: base * m, inconnu: sousType === "circulaire" ? Math.floor(Math.random() * k) : null };
  }
}

// ---------------------------------------------------------------------------------------------
// Diagramme en bâtons
// ---------------------------------------------------------------------------------------------

function tirerBatons(): ExerciceBatons {
  for (;;) {
    const indice = Math.floor(Math.random() * CONTEXTES_DISCRETS.length);
    const ctx = CONTEXTES_DISCRETS[indice]!;
    const xs = ctx.xs;
    const n = choisir([20, 25, 40, 50] as const);
    const effectifs = composition(xs.length, n, 1, 15);
    if (!effectifs) continue;
    const condition = choisir<ConditionGroupe>(["au-moins", "au-plus", "plus-de", "moins-de"]);
    const seuil = choisir(xs.slice(1, -1));
    const dedans = xs.filter((x) => dansGroupe(condition, seuil, x)).length;
    // Un vrai groupe : au moins deux valeurs dedans et au moins deux dehors.
    if (dedans < 2 || xs.length - dedans < 2) continue;
    return { variante: "lire-diagramme", sousType: "batons", contexte: indice, valeurs: xs.map((x, i) => ({ x, effectif: effectifs[i]! })), condition, seuil };
  }
}

// ---------------------------------------------------------------------------------------------
// Graphiques trompeurs
// ---------------------------------------------------------------------------------------------

function annees(nombre: number): number[] {
  const debut = entier(2018, 2026 - nombre);
  return Array.from({ length: nombre }, (_, i) => debut + i);
}

/** Barres intermédiaires : valeurs sur des graduations, entre deux bornes (rangs inclus). */
function intermediaires(graduations: number[], rangMin: number, rangMax: number, nombre: number): number[] {
  return Array.from({ length: nombre }, () => graduations[entier(rangMin, rangMax)]!);
}

function tirerAxeTronque(): ExerciceTrompeurBarres {
  for (;;) {
    const j = choisir([1, 2]);
    const m = choisir([2, 3, 4]);
    const p = choisir([4, 5, 6, 8, 10, 12, 15, 20, 25]);
    const v1 = choisir([200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000, 2400, 2500, 3000, 4000, 5000]);
    const d = (v1 * p) / 100;
    const s = d / m;
    if (![5, 10, 20, 25, 40, 50, 100, 200, 250, 500].includes(s)) continue;
    const a = v1 - j * s;
    if (a < 0.5 * v1) continue;
    const nombreGrad = j + m + 2;
    if (nombreGrad > 8) continue;
    // Le dessin doit exagérer nettement : évolution suggérée (m/j × 100 %) ≥ 2 × la réelle.
    if ((m / j) * 100 < 2 * p) continue;
    const graduations = Array.from({ length: nombreGrad }, (_, i) => a + i * s);
    const v2 = v1 + d;
    const nb = entier(2, 4);
    const valeurs = [v1, ...intermediaires(graduations, 1, j + m, nb - 2), v2];
    const ans = annees(nb);
    return {
      variante: "trompeur",
      sousType: "axe-tronque",
      contexte: choisir(CONTEXTES_EVOLUTION),
      dessin: null,
      barres: ans.map((annee, i) => ({ annee, valeur: valeurs[i]! })),
      graduations,
      options: melanger(MANIPULATIONS),
    };
  }
}

function tirerEchelleIrreguliere(): ExerciceTrompeurBarres {
  for (;;) {
    const j = choisir([1, 2]);
    const i = choisir([2, 3, 4]);
    const L = choisir([100, 200, 500, 1000]);
    const S = choisir([L / 20, L / 10, L / 5, L / 4]);
    if (!Number.isInteger(S)) continue;
    const v1 = j * L;
    const v2 = v1 + i * S;
    const p = ((v2 - v1) / v1) * 100;
    if (!Number.isInteger(p) || p > 60) continue;
    if ((i / j) * 100 < 2 * p) continue;
    const graduations = [...Array.from({ length: j + 1 }, (_, t) => t * L), ...Array.from({ length: i + 1 }, (_, t) => v1 + (t + 1) * S)];
    if (graduations.length > 8) continue;
    const nb = entier(2, 4);
    const valeurs = [v1, ...intermediaires(graduations, j, j + i, nb - 2), v2];
    const ans = annees(nb);
    return {
      variante: "trompeur",
      sousType: "echelle-irreguliere",
      contexte: choisir(CONTEXTES_EVOLUTION),
      dessin: null,
      barres: ans.map((annee, t) => ({ annee, valeur: valeurs[t]! })),
      graduations,
      options: melanger(MANIPULATIONS),
    };
  }
}

function tirerPictogrammes(): ExerciceTrompeurBarres {
  for (;;) {
    const k = choisir([1.5, 2, 2.5, 3]);
    const u = choisir([1, 2, 3, 4]);
    const rang2 = u * k;
    if (!Number.isInteger(rang2) || rang2 > 8) continue;
    const { contexte, dessin } = choisir(CONTEXTES_PICTOGRAMMES);
    const s = dessin === "bouteille" ? choisir([100, 200, 500, 1000]) : choisir([5, 10, 20, 50]);
    const graduations = Array.from({ length: rang2 + 2 }, (_, t) => t * s);
    const ans = annees(2);
    return {
      variante: "trompeur",
      sousType: "pictogrammes",
      contexte,
      dessin,
      barres: [
        { annee: ans[0]!, valeur: u * s },
        { annee: ans[1]!, valeur: rang2 * s },
      ],
      graduations,
      options: melanger(MANIPULATIONS),
    };
  }
}

function tirerTotalFaux(): ExerciceTrompeurCirculaire {
  for (;;) {
    const ctx = choisir(CONTEXTES_REPONSES_MULTIPLES);
    const k = entier(3, Math.min(5, ctx.noms.length));
    const somme = 5 * entier(22, 30);
    const unites = composition(k, somme / 5, 2, 12);
    if (!unites) continue;
    const n = choisir([200, 300, 400, 500, 600, 800]);
    const noms = melanger(ctx.noms).slice(0, k);
    const parts = noms.map((nom, i) => ({ nom, pourcentage: unites[i]! * 5 })).sort((a, b) => b.pourcentage - a.pourcentage);
    return { variante: "trompeur", sousType: "total-faux", caractere: ctx.caractere, objet: ctx.objet, individus: ctx.individus, n, parts, options: melanger(MANIPULATIONS) };
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: VarianteDiagrammes; label: string }[] = [
  { id: "circulaire-construire", label: "Diagramme circulaire : fréquences et angles" },
  { id: "lire-diagramme", label: "Lire un diagramme (bâtons ou circulaire)" },
  { id: "trompeur", label: "Graphique trompeur : repérer et corriger" },
];

export const SOUS_TYPES: Record<VarianteDiagrammes, SousTypeDiagrammes[]> = {
  "circulaire-construire": ["direct", "inverse"],
  "lire-diagramme": ["batons", "circulaire"],
  trompeur: ["axe-tronque", "pictogrammes", "echelle-irreguliere", "total-faux"],
};

export function genererSousType(sousType: SousTypeDiagrammes): ExerciceDiagrammesTrompeurs {
  switch (sousType) {
    case "direct":
    case "inverse":
      return tirerCirculaire("circulaire-construire", sousType);
    case "circulaire":
      return tirerCirculaire("lire-diagramme", "circulaire");
    case "batons":
      return tirerBatons();
    case "axe-tronque":
      return tirerAxeTronque();
    case "echelle-irreguliere":
      return tirerEchelleIrreguliere();
    case "pictogrammes":
      return tirerPictogrammes();
    case "total-faux":
      return tirerTotalFaux();
  }
}

export function construireAvecVariante(id: string): ExerciceDiagrammesTrompeurs {
  const sousTypes = SOUS_TYPES[id as VarianteDiagrammes];
  if (!sousTypes) return genererExerciceDiagrammesTrompeurs();
  return genererSousType(choisir(sousTypes));
}

/** Tirage libre : une variante au hasard, puis un sous-type de cette variante. */
export function genererExerciceDiagrammesTrompeurs(): ExerciceDiagrammesTrompeurs {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
