import type { BrancheSuiteGeometrique, ComboSuiteGeometrique, ExercicePrincipalSuiteGeometrique, FractionQ, StatutQ } from "../../core5e/suitesGeometriques.types";
import { diviserFractionQ, entierVersFractionQ, fractionQVersNombre, multiplierFractionQ, opposeFractionQ, puissanceFractionQ, termeGeometriqueQ } from "./fraction";

/**
 * Pool de raisons rationnelles SIGNÉES — q est TOUJOURS choisi DEPUIS CE POOL pour les 4 combos
 * (Partie 2 de la refonte, `prompt5gen15refontefamillesbonus.md`, remplace l'ancien mécanisme
 * "tirerParite" qui choisissait un exposant k puis dérivait éventuellement une racine k-ième) —
 * JAMAIS une racine k-ième calculée à la génération. Toutes les autres grandeurs (u1/up/um) sont
 * ensuite DÉRIVÉES via une puissance ENTIÈRE de ce q, en arithmétique EXACTE sur fractions
 * (`prompt5gen155gen16arithmetiqueexacte.md` — `fraction.ts` — jamais `Math.pow` flottant), un q
 * valide EXISTE donc TOUJOURS. Sur les combos "u1_up"/"up_um", q est choisi APRÈS les exposants
 * (p/m) plutôt qu'avant — un simple réordonnancement, jamais un changement de nature (toujours une
 * valeur du pool) : nécessaire pour FILTRER les q dont la magnitude, combinée à l'exposant déjà
 * fixé, ferait déborder u1/up/um vers un dénominateur déraisonnable à lire (voir
 * `qSurExposantSeul`/`qUpUmSurExposants` ci-dessous — le filtre reste conservé même si l'ancienne
 * raison technique, la bascule en notation exponentielle d'un flottant, n'existe plus une fois
 * l'affichage fait en fraction exacte : la magnitude reste un proxy raisonnable de lisibilité
 * pédagogique). Étendu par rapport à l'ancien pool (4 valeurs supplémentaires, magnitude 4 et 1/4)
 * pour plus de variété — exporté : réutilisé par `algebrique.ts` (3 nouvelles familles bonus, même
 * chantier).
 */
export const Q_SIGNE_POOL: FractionQ[] = [
  { num: 2, den: 1 },
  { num: 3, den: 1 },
  { num: 4, den: 1 },
  { num: -2, den: 1 },
  { num: -3, den: 1 },
  { num: -4, den: 1 },
  { num: 1, den: 2 },
  { num: -1, den: 2 },
  { num: 1, den: 3 },
  { num: -1, den: 3 },
  { num: 1, den: 4 },
  { num: -1, den: 4 },
  { num: 3, den: 2 },
  { num: -3, den: 2 },
  { num: 2, den: 3 },
  { num: -2, den: 3 },
];

// Seuil de magnitude conservé comme proxy de lisibilité pédagogique (voir doc de `Q_SIGNE_POOL`
// ci-dessus) — évalué UNIQUEMENT pour décider de l'éligibilité d'un candidat (`fractionQVersNombre`,
// jamais réutilisé ensuite pour dériver/afficher une valeur, voir `fraction.ts`).
const SEUIL_MAGNITUDE_MIN = 1e-6;

function entierNonNul(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = Math.floor(Math.random() * (max - min + 1)) + min;
  return v;
}

function elementAleatoire<T>(tab: readonly T[]): T {
  return tab[Math.floor(Math.random() * tab.length)];
}

function indicesTermesProchesAleatoires(): [number, number, number, number] {
  const n0 = Math.floor(Math.random() * 5) + 2; // 2..6
  return [n0, n0 + 1, n0 + 2, n0 + 3];
}

/** Statut déduit UNIQUEMENT de la parité d'un exposant entier (p-1 pour "u1_up", |m-p| pour
 * "up_um") — jamais d'un tirage séparé (voir en-tête de fichier) : impair → une seule valeur de q
 * convient ("unique", car `(-q)^impair=-q^impair≠q^impair` pour q≠0) ; pair → q ET -q conviennent
 * toutes les deux ("double", car `(-q)^pair=q^pair`). */
function statutDepuisExposant(exposant: number): StatutQ {
  return exposant % 2 === 0 ? "double" : "unique";
}

/** Combo "u1_up" — filtre `Q_SIGNE_POOL` sur l'exposant déjà fixé par p (jamais l'inverse : p reste
 * tiré uniformément sur [2,12], voir le commentaire au point d'appel) pour ne garder que les q dont
 * la magnitude de `up=u1·q^(p-1)` reste raisonnable à lire (donnée montrée à l'élève, jamais
 * saisie) — même défaut/remède que `qUpUmSurExposants` ci-dessous (exposant jusqu'à 11 ici aussi,
 * p∈[2,12]). Le calcul de `up` lui-même reste EXACT (`termeGeometrique`, arithmétique fractionnaire)
 * — `fractionQVersNombre` n'intervient ici que pour évaluer l'éligibilité du candidat, jamais pour
 * dériver la valeur retenue. */
function qSurExposantSeul(u1: number, exposant: number): FractionQ {
  const candidats = Q_SIGNE_POOL.filter((q) => {
    const upCandidat = fractionQVersNombre(termeGeometriqueQ(entierVersFractionQ(u1), q, exposant + 1));
    return Number.isFinite(upCandidat) && Math.abs(upCandidat) >= SEUIL_MAGNITUDE_MIN;
  });
  return elementAleatoire(candidats.length > 0 ? candidats : Q_SIGNE_POOL);
}

/** Combo "up_um" — filtre `Q_SIGNE_POOL` sur les 2 exposants déjà fixés par p/m (jamais l'inverse :
 * p/m restent tirés uniformément sur [1,12], voir le commentaire au point d'appel) pour ne garder
 * que les q qui laissent `u1=up/q^(pMoins1)` ET `um=up*q^k` tous deux de magnitude raisonnable — au
 * moins un candidat existe toujours (q=±2, ±3/2 ou ±2/3 restent sûrs jusqu'à l'exposant 11 le plus
 * défavorable, le pire cas possible avec p/m∈[1,12]). Même remarque que `qSurExposantSeul` : le
 * calcul retenu reste exact, `fractionQVersNombre` ne sert qu'à l'éligibilité. */
function qUpUmSurExposants(up: FractionQ, pMoins1: number, k: number): FractionQ {
  const candidats = Q_SIGNE_POOL.filter((q) => {
    const u1Candidat = fractionQVersNombre(diviserFractionQ(up, puissanceFractionQ(q, pMoins1)));
    const umCandidat = fractionQVersNombre(multiplierFractionQ(up, puissanceFractionQ(q, k)));
    return Number.isFinite(u1Candidat) && Number.isFinite(umCandidat) && Math.abs(u1Candidat) >= SEUIL_MAGNITUDE_MIN && Math.abs(umCandidat) >= SEUIL_MAGNITUDE_MIN;
  });
  return elementAleatoire(candidats.length > 0 ? candidats : Q_SIGNE_POOL);
}

export const CATALOGUE_COMBOS: { id: ComboSuiteGeometrique; label: string }[] = [
  { id: "direct", label: "u₁ et q donnés directement" },
  { id: "u1_up", label: "u₁ et un terme uₚ" },
  { id: "q_up", label: "q et un terme uₚ" },
  { id: "up_um", label: "Deux termes uₚ et uₘ" },
];

export function construireAvecComboId(combo: ComboSuiteGeometrique): ExercicePrincipalSuiteGeometrique {
  const indicesTermesProches = indicesTermesProchesAleatoires();
  // Borne absolue à 10 (jamais plus) : au-delà, un q=1/4 (le plus petit en magnitude du pool)
  // combiné à un u1=±1 (le plus petit possible) fait passer le terme sous 1e-6 en valeur absolue,
  // ce qui bascule son `String(...)` en notation exponentielle — vérifié empiriquement :
  // (1/4)^9≈3.81e-6 (sûr) mais (1/4)^10≈9.54e-7 (bascule). L'exposant vaut indiceTermeEloigne-1,
  // donc indiceTermeEloigne doit rester ≤10 dans TOUS les cas, y compris quand
  // indicesTermesProches[3] (d) est déjà proche de cette borne (n0 max=6 → d max=9) : l'offset
  // aléatoire se resserre alors en conséquence plutôt que de dépasser 10.
  const INDICE_TERME_ELOIGNE_MAX = 10;
  const d = indicesTermesProches[3];
  const offsetMax = Math.max(1, Math.min(4, INDICE_TERME_ELOIGNE_MAX - d));
  const indiceTermeEloigne = d + 1 + Math.floor(Math.random() * offsetMax);
  const indiceSn = Math.floor(Math.random() * 7) + 4; // 4..10 — une SOMME, toujours bornée près de
  // u1/(1-q) pour |q|<1 : aucun risque d'underflow comparable.
  const commun = { indicesTermesProches, indiceTermeEloigne, indiceSn };

  if (combo === "direct") {
    const q = elementAleatoire(Q_SIGNE_POOL);
    const u1 = entierVersFractionQ(entierNonNul(-10, 10));
    return { famille: "principal", donnees: { combo: "direct", u1, q }, k: null, statutQ: "unique", branches: [{ u1, q }], ...commun };
  }

  if (combo === "q_up") {
    const q = elementAleatoire(Q_SIGNE_POOL);
    const p = Math.floor(Math.random() * 8) + 2; // 2..9, p≠1
    const u1 = entierVersFractionQ(entierNonNul(-10, 10));
    const up = termeGeometriqueQ(u1, q, p);
    return { famille: "principal", donnees: { combo: "q_up", q, up: { indice: p, valeur: up } }, k: null, statutQ: "unique", branches: [{ u1, q }], ...commun };
  }

  if (combo === "u1_up") {
    // u1, p choisis EN PREMIER, q filtré ENSUITE sur l'exposant qu'ils fixent (voir
    // `qSurExposantSeul` ci-dessus) — up=u1·q^(p-1) DÉRIVÉ (puissance entière exacte, jamais une
    // racine). L'élève retrouve q depuis u1/up : statutQ dépend UNIQUEMENT de la parité de (p-1).
    const u1Entier = entierNonNul(-10, 10);
    const u1 = entierVersFractionQ(u1Entier);
    const p = Math.floor(Math.random() * 11) + 2; // 2..12, p≠1 — large éventail (exposant∈[1,11])
    const exposant = p - 1;
    const q = qSurExposantSeul(u1Entier, exposant);
    const up = termeGeometriqueQ(u1, q, p);
    const statutQ = statutDepuisExposant(exposant);
    const branches: BrancheSuiteGeometrique[] =
      statutQ === "double"
        ? [
            { u1, q },
            { u1, q: opposeFractionQ(q) },
          ]
        : [{ u1, q }];
    return { famille: "principal", donnees: { combo: "u1_up", u1, up: { indice: p, valeur: up } }, k: exposant, statutQ, branches, ...commun };
  }

  // combo === "up_um" — up (valeur libre) et 2 indices distincts p/m choisis EN PREMIER ; q est
  // filtré DANS `Q_SIGNE_POOL` en fonction des exposants déjà fixés par p/m (jamais une racine —
  // toujours une valeur du pool, voir `qUpUmSurExposants` ci-dessous) plutôt que choisi
  // aveuglément avant : um DÉRIVÉ (écart k=m-p, positif ou négatif, `q^(-n)=1/q^n` reste exact pour
  // q rationnel non nul) ET u1 DÉRIVÉ (division par `q^(p-1)`, voir `branches` plus bas) peuvent
  // TOUS DEUX voir leur magnitude devenir déraisonnable si p/m atteignent leurs bornes hautes
  // (jusqu'à 12) avec un q de magnitude extrême (4 ou 1/4) — même défaut de fond que
  // `INDICE_TERME_ELOIGNE_MAX` ci-dessus et que `algebrique.ts`/`tirerQPourExposant` (famille A),
  // même remède : filtrer q sur les exposants réellement en jeu plutôt que resserrer p/m (qui
  // doivent rester [1,12] complet).
  const up = entierVersFractionQ(entierNonNul(-10, 10));
  const p = Math.floor(Math.random() * 12) + 1; // 1..12
  let m = Math.floor(Math.random() * 12) + 1;
  while (m === p) m = Math.floor(Math.random() * 12) + 1;
  const k = m - p;
  const q = qUpUmSurExposants(up, p - 1, k);
  const um = multiplierFractionQ(up, puissanceFractionQ(q, k));
  const statutQ = statutDepuisExposant(Math.abs(k));
  // Pour chaque branche (q=+q0 ou q=-q0), le u1 associé se dérive depuis `up` — reste cohérent avec
  // `um` simultanément car k=m-p est pair dans ce cas (preuve : le u1 de la branche -q0 vaut
  // up/(-q0)^(p-1)=u1·(-1)^(p-1), et injecté dans u1_branche·(-q0)^(m-1) redonne u1·q0^(m-1)=um ssi
  // (-1)^(p+m)=1 ssi p+m pair ssi k=m-p pair — vérifié, k est toujours pair dans ce chemin).
  const qOppose = opposeFractionQ(q);
  const branches: BrancheSuiteGeometrique[] =
    statutQ === "double"
      ? [
          { u1: diviserFractionQ(up, puissanceFractionQ(q, p - 1)), q },
          { u1: diviserFractionQ(up, puissanceFractionQ(qOppose, p - 1)), q: qOppose },
        ]
      : [{ u1: diviserFractionQ(up, puissanceFractionQ(q, p - 1)), q }];
  return {
    famille: "principal",
    donnees: { combo: "up_um", up: { indice: p, valeur: up }, um: { indice: m, valeur: um } },
    k: Math.abs(k),
    statutQ,
    branches,
    ...commun,
  };
}

export function genererExercicePrincipal(): ExercicePrincipalSuiteGeometrique {
  const combo = elementAleatoire(CATALOGUE_COMBOS.map((c) => c.id));
  return construireAvecComboId(combo);
}
