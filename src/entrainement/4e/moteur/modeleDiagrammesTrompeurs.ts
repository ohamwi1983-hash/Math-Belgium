import type {
  ConditionGroupe,
  ContexteDiscret,
  ExerciceBatons,
  ExerciceCirculaire,
  ExerciceDiagrammesTrompeurs,
  ExerciceTrompeurBarres,
  ExerciceTrompeurCirculaire,
} from "../core/diagrammesTrompeurs.types";

/**
 * Modèle de gen111 (« Diagrammes et graphiques trompeurs ») : toutes les valeurs attendues, calculées
 * UNE fois ici et lues par l'écran (`ui/formatDiagrammesTrompeurs.ts`), les figures et l'adaptateur
 * papier — jamais une seconde source recalculée à part.
 */

/** Arrondi qui efface le bruit flottant (0,1 + 0,2…). */
export function net(v: number): number {
  return Math.round(v * 1e9) / 1e9;
}

// ---------------------------------------------------------------------------------------------
// Contextes discrets (diagramme en bâtons) — banque partagée (le contexte contient une fonction,
// l'exercice ne garde que son indice).
// ---------------------------------------------------------------------------------------------

function quantif(c: ConditionGroupe): string {
  return c === "au-moins" ? "au moins" : c === "au-plus" ? "au plus" : c === "plus-de" ? "plus de" : "moins de";
}

export const CONTEXTES_DISCRETS: (ContexteDiscret & { xs: number[]; phrase: string })[] = [
  {
    caractere: "le nombre de frères et sœurs",
    axe: "frères et sœurs",
    individus: "élèves",
    xs: [0, 1, 2, 3, 4, 5],
    phrase: "On a demandé à des élèves combien de frères et sœurs ils ont.",
    groupe: (c, s) => `ont ${quantif(c)} ${s} ${s <= 1 ? "frère ou sœur" : "frères et sœurs"}`,
  },
  {
    caractere: "le nombre de buts marqués par match",
    axe: "buts par match",
    individus: "matchs",
    xs: [0, 1, 2, 3, 4, 5],
    phrase: "Pendant un championnat, on a relevé le nombre de buts marqués à chaque match.",
    groupe: (c, s) => `comptent ${quantif(c)} ${s} ${s <= 1 ? "but" : "buts"}`,
  },
  {
    caractere: "la pointure",
    axe: "pointure",
    individus: "élèves",
    xs: [36, 37, 38, 39, 40, 41],
    phrase: "On a relevé la pointure des élèves de plusieurs classes.",
    groupe: (c, s) =>
      c === "au-moins" ? `chaussent du ${s} ou plus` : c === "au-plus" ? `chaussent du ${s} ou moins` : c === "plus-de" ? `chaussent plus grand que du ${s}` : `chaussent plus petit que du ${s}`,
  },
  {
    caractere: "la note sur 10",
    axe: "note sur 10",
    individus: "élèves",
    xs: [4, 5, 6, 7, 8, 9, 10],
    phrase: "Voici les notes (sur 10) obtenues par des élèves à une interrogation.",
    groupe: (c, s) => `ont obtenu ${quantif(c)} ${s} sur 10`,
  },
  {
    caractere: "le nombre de livres lus pendant les vacances",
    axe: "livres lus",
    individus: "élèves",
    xs: [0, 1, 2, 3, 4, 5],
    phrase: "On a demandé à des élèves combien de livres ils ont lus pendant les vacances.",
    groupe: (c, s) => `ont lu ${quantif(c)} ${s} ${s <= 1 ? "livre" : "livres"}`,
  },
];

// ---------------------------------------------------------------------------------------------
// Diagramme circulaire
// ---------------------------------------------------------------------------------------------

/** Fréquence d'un secteur, en %. */
export function pourcentageSecteur(e: ExerciceCirculaire, i: number): number {
  return net((e.secteurs[i]!.effectif / e.n) * 100);
}

/** Angle d'un secteur, en degrés (fᵢ × 360°). */
export function angleSecteur(e: ExerciceCirculaire, i: number): number {
  return net((e.secteurs[i]!.effectif / e.n) * 360);
}

// ---------------------------------------------------------------------------------------------
// Diagramme en bâtons
// ---------------------------------------------------------------------------------------------

export function contexteBatons(e: ExerciceBatons) {
  return CONTEXTES_DISCRETS[e.contexte]!;
}

export function totalBatons(e: ExerciceBatons): number {
  return e.valeurs.reduce((s, v) => s + v.effectif, 0);
}

export function dansGroupe(condition: ConditionGroupe, seuil: number, x: number): boolean {
  return condition === "au-moins" ? x >= seuil : condition === "au-plus" ? x <= seuil : condition === "plus-de" ? x > seuil : x < seuil;
}

export function indicesGroupe(e: ExerciceBatons): number[] {
  return e.valeurs.map((v, i) => (dansGroupe(e.condition, e.seuil, v.x) ? i : -1)).filter((i) => i >= 0);
}

export function effectifGroupe(e: ExerciceBatons): number {
  return indicesGroupe(e).reduce((s, i) => s + e.valeurs[i]!.effectif, 0);
}

export function pourcentageGroupe(e: ExerciceBatons): number {
  return net((effectifGroupe(e) / totalBatons(e)) * 100);
}

// ---------------------------------------------------------------------------------------------
// Graphiques trompeurs
// ---------------------------------------------------------------------------------------------

export function premiere(e: ExerciceTrompeurBarres) {
  return e.barres[0]!;
}

export function derniere(e: ExerciceTrompeurBarres) {
  return e.barres[e.barres.length - 1]!;
}

/** Évolution RÉELLE entre la première et la dernière année, en %. */
export function evolutionReelle(e: ExerciceTrompeurBarres): number {
  const v1 = premiere(e).valeur;
  return net(((derniere(e).valeur - v1) / v1) * 100);
}

/** Position (en nombre d'intervalles de graduation, depuis le bas de l'axe) d'une valeur posée sur
 * une graduation. */
export function rangGraduation(e: ExerciceTrompeurBarres, valeur: number): number {
  return e.graduations.indexOf(valeur);
}

/** Hauteur DESSINÉE (en intervalles de graduation) — c'est ce que l'œil compare. */
export function hauteurDessinee(e: ExerciceTrompeurBarres, valeur: number): number {
  return rangGraduation(e, valeur);
}

/** Coefficient que suggère le DESSIN : rapport des hauteurs (barres) ou des aires (pictogrammes). */
export function coefficientSuggere(e: ExerciceTrompeurBarres): number {
  const r = hauteurDessinee(e, derniere(e).valeur) / hauteurDessinee(e, premiere(e).valeur);
  return net(e.sousType === "pictogrammes" ? r * r : r);
}

/** Évolution que suggère le dessin (le slogan), en %. */
export function evolutionAffichee(e: ExerciceTrompeurBarres): number {
  return net((coefficientSuggere(e) - 1) * 100);
}

/** Pictogrammes : coefficient d'agrandissement des longueurs (= rapport réel des valeurs). */
export function coefficientLongueurs(e: ExerciceTrompeurBarres): number {
  return net(derniere(e).valeur / premiere(e).valeur);
}

export function sommeParts(e: ExerciceTrompeurCirculaire): number {
  return e.parts.reduce((s, p) => s + p.pourcentage, 0);
}

/** Nombre total de réponses données (somme des pourcentages × n). */
export function totalReponses(e: ExerciceTrompeurCirculaire): number {
  return net((sommeParts(e) / 100) * e.n);
}

export function estTrompeurBarres(e: ExerciceDiagrammesTrompeurs): e is ExerciceTrompeurBarres {
  return e.variante === "trompeur" && e.sousType !== "total-faux";
}
