import type { ContextePoissonA, ContextePoissonB } from "../../core6e/loiPoisson.types";

/**
 * Couche A (6e) — banque de contextes narratifs pour `6gen53`, familles A/B. Thèmes de la spec :
 * articles défectueux, trafic routier (péage), incidents rares (virus, allergie, anniversaires
 * coïncidents), erreurs typographiques, pannes informatiques, gauchers dans un groupe.
 *
 * **Famille A — `n`/`p` DONNÉS, jamais à identifier** (contrairement à `ContexteLoiBinomialeA` de
 * `6gen50` où l'élève doit les extraire) — `texteTemplate` les embarque simplement en toutes
 * lettres, à titre de mise en situation.
 *
 * **Famille B — taux de base + cible à ajuster** (voir en-tête `familleB.ts` pour le piège
 * d'échelle) : `type:"temporel"` (taux par unité de temps, cible = durée demandée) ou
 * `type:"effectif"` (taux "pour N", cible = effectif demandé). `%` jamais utilisé nulle part dans
 * ce fichier (évite le piège LaTeX `\%` documenté par `6gen50` — ici tous les taux restent des
 * COMPTAGES, jamais des pourcentages).
 */

function formatDecimalFr(v: number): string {
  const s = `${v}`;
  return s.replace(".", ",");
}

export const CONTEXTES_A: readonly ContextePoissonA[] = [
  { id: "defectueuxA", texte: "Une chaîne de production fabrique un grand nombre de pièces indépendantes, chacune ayant la même probabilité d'être défectueuse." },
  { id: "peageA", texte: "On observe un grand nombre de voitures indépendantes passant à un poste de péage, chacune ayant la même probabilité d'être en infraction." },
  { id: "typoA", texte: "Un correcteur relit un grand nombre de mots indépendants d'un texte, chacun ayant la même probabilité de contenir une faute de frappe." },
  { id: "pannesA", texte: "On observe un grand nombre d'ordinateurs indépendants d'un parc informatique, chacun ayant la même probabilité de tomber en panne ce mois-ci." },
  { id: "gauchersA", texte: "On interroge un grand nombre de personnes indépendantes, chacune ayant la même probabilité d'être gauchère." },
  { id: "allergieA", texte: "Un médicament est administré à un grand nombre de patients indépendants, chacun ayant la même probabilité de présenter une réaction allergique." },
];

export const CONTEXTES_B: readonly ContextePoissonB[] = [
  {
    id: "defectueuxB",
    type: "effectif",
    effectifReference: 1000,
    texteTauxBase: (taux) => `Dans une usine, on observe en moyenne ${formatDecimalFr(taux)} article(s) défectueux pour 1000 articles produits.`,
    texteCible: (cible) => `On prélève un lot de ${cible} articles.`,
  },
  {
    id: "peageB",
    type: "temporel",
    effectifReference: null,
    texteTauxBase: (taux) => `À un poste de péage, les voitures arrivent en moyenne à un taux de ${formatDecimalFr(taux)} par minute.`,
    texteCible: (cible) => `On observe le trafic pendant ${cible} minutes.`,
  },
  {
    id: "virusB",
    type: "temporel",
    effectifReference: null,
    texteTauxBase: (taux) => `Dans cette région, on détecte en moyenne ${formatDecimalFr(taux)} nouveau(x) cas de ce virus rare chaque semaine.`,
    texteCible: (cible) => `On étudie une période de ${cible} semaines.`,
  },
  {
    id: "allergieB",
    type: "effectif",
    effectifReference: 10000,
    texteTauxBase: (taux) => `En moyenne, ${formatDecimalFr(taux)} patient(s) sur 10000 présentent une réaction allergique à ce médicament.`,
    texteCible: (cible) => `Un hôpital traite un groupe de ${cible} patients.`,
  },
  {
    id: "typoB",
    type: "effectif",
    effectifReference: 1000,
    texteTauxBase: (taux) => `Dans un texte donné, on trouve en moyenne ${formatDecimalFr(taux)} faute(s) de frappe pour 1000 mots.`,
    texteCible: (cible) => `On examine un texte de ${cible} mots.`,
  },
  {
    id: "pannesB",
    type: "temporel",
    effectifReference: null,
    texteTauxBase: (taux) => `En moyenne, un serveur connaît ${formatDecimalFr(taux)} panne(s) par mois.`,
    texteCible: (cible) => `On étudie une période de ${cible} mois.`,
  },
  {
    id: "gauchersB",
    type: "effectif",
    effectifReference: 100,
    texteTauxBase: (taux) => `Dans la population, on compte en moyenne ${formatDecimalFr(taux)} gaucher(s) pour 100 personnes.`,
    texteCible: (cible) => `On observe un groupe de ${cible} personnes.`,
  },
];
