import type {
  ExerciceEffectif,
  ExerciceGroupes,
  ExerciceMediane,
  ExerciceNote,
  ExerciceValeurManquante,
  FormeGroupes,
  FormeMediane,
  FormeNote,
  VarianteValeurManquante,
} from "../../core/valeurManquante.types";
import { CONTEXTES_GROUPES, CONTEXTES_NOTE_AVEC_COEF, CONTEXTES_NOTE_SANS_COEF, CONTEXTES_TABLEAU, PRENOMS } from "../../moteur/contextesValeurManquante";

/**
 * Générateur de « Retrouver une valeur manquante » (gen109). Tout le hasard passe par `Math.random` :
 * `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR code d'une
 * feuille rouvre ainsi le MÊME exercice.
 *
 * Garanties (vérifiées par tirages massifs, scratchpad gen109) :
 * - toutes les réponses sont EXACTES et courtes : note sur une grille de 0,5 ; effectifs entiers ;
 *   moyennes données ou attendues à au plus deux décimales — aucun arrondi n'est demandé ;
 * - la FORME (signature de difficulté) et le VERDICT de « note à obtenir » (possible / impossible,
 *   ≈ 20 % d'impossibles) sont tirés AVANT les nombres : leurs fréquences ne dépendent pas de la
 *   boucle de rejet ;
 * - les quatre équations proposées à l'écran 1 ont des solutions deux à deux distinctes, et les
 *   pièges de l'écran 3 ne coïncident jamais avec la bonne réponse.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melange(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j]!, t[i]!];
  }
  return t;
}

export function arrondi9(x: number): number {
  const r = Math.round(x * 1e9) / 1e9;
  return r === 0 ? 0 : r;
}

/** Nombre de décimales d'un décimal (après arrondi à 1e-9 contre le bruit flottant). */
export function decimales(x: number): number {
  const s = arrondi9(x).toFixed(9).replace(/0+$/, "");
  const i = s.indexOf(".");
  return i < 0 || i === s.length - 1 ? 0 : s.length - i - 1;
}

function surGrille(min: number, max: number, pas: number): number {
  return arrondi9(min + entier(0, Math.round((max - min) / pas)) * pas);
}

function ordres(): { ordreEquations: number[]; ordreConclusions: number[] } {
  return { ordreEquations: melange(4), ordreConclusions: melange(4) };
}

// ---------------------------------------------------------------------------------------------
// Note à obtenir
// ---------------------------------------------------------------------------------------------

/** Part des « impossibles » (verdict tiré à part, peu fréquent mais présent). */
export const PART_IMPOSSIBLE = 0.2;

function noteConnue(): number {
  return Math.random() < 0.3 ? entier(12, 35) / 2 : entier(6, 17);
}

function inconnueValable(x: number, possible: boolean, cible: number): boolean {
  if (decimales(x) > 1 || Math.round(x * 2) !== x * 2) return false;
  if (possible) return x >= 4 && x <= 19.5 && Math.abs(x - cible) > 1e-9;
  return x >= 20.5 && x <= 30;
}

export function genererNote(forme: FormeNote, possible: boolean): ExerciceNote {
  const { prenom } = choisir(PRENOMS);
  for (;;) {
    let contexte: string;
    let coefs: number[];
    let coefDernier: number;
    if (forme === "sans-coef") {
      contexte = choisir(CONTEXTES_NOTE_SANS_COEF).id;
      const nb = choisir([2, 3, 3, 4]);
      coefs = Array.from({ length: nb }, () => 1);
      coefDernier = 1;
    } else {
      const c = choisir(CONTEXTES_NOTE_AVEC_COEF);
      contexte = c.id;
      coefs = c.connues.map((e) => choisir(e.coefs));
      coefDernier = choisir(c.derniere.coefs);
    }
    const notes = coefs.map(() => noteConnue());
    const cible = Math.random() < 0.3 ? entier(21, 31) / 2 : entier(10, 15);
    const total = coefs.reduce((s, c) => s + c, 0) + coefDernier;
    const somme = notes.reduce((s, n, i) => s + n * coefs[i]!, 0);
    const inconnue = arrondi9((cible * total - somme) / coefDernier);
    if (!inconnueValable(inconnue, possible, cible)) continue;
    // Les notes connues ne sont pas toutes au-dessus de la cible (sinon le problème est artificiel).
    if (notes.every((n) => n >= cible)) continue;
    const e: ExerciceNote = { variante: "note-a-obtenir", forme, contexte, prenom, notes, coefs, coefDernier, cible, inconnue, possible, ...ordres() };
    if (!solutionsDistinctes(solutionsEquationsNote(e))) continue;
    return e;
  }
}

/** Solutions des quatre équations de l'écran 1 (indice 0 : la bonne). `null` : pas de solution. */
export function solutionsEquationsNote(e: ExerciceNote): (number | null)[] {
  const k = e.notes.length;
  const somme = e.notes.reduce((s, n, i) => s + n * e.coefs[i]!, 0);
  const sommeCoefs = e.coefs.reduce((s, c) => s + c, 0);
  const total = sommeCoefs + e.coefDernier;
  const sommeNotes = e.notes.reduce((s, n) => s + n, 0);
  if (e.forme === "sans-coef") {
    return [
      e.inconnue,
      // Dénominateur non mis à jour : (Σ + x)/k = M.
      arrondi9(e.cible * k - somme),
      // Moyenne des moyennes : (Σ/k + x)/2 = M.
      arrondi9(2 * e.cible - somme / k),
      // Division oubliée : Σ + x = M.
      arrondi9(e.cible - somme),
    ];
  }
  return [
    e.inconnue,
    // Dénominateur sans le dernier coefficient.
    arrondi9((e.cible * sommeCoefs - somme) / e.coefDernier),
    // Coefficient de x oublié au numérateur.
    arrondi9(e.cible * total - somme),
    // Tous les coefficients oubliés.
    arrondi9(e.cible * (k + 1) - sommeNotes),
  ];
}

function solutionsDistinctes(s: (number | null)[]): boolean {
  const valeurs = s.filter((v): v is number => v !== null);
  return valeurs.every((v, i) => valeurs.every((w, j) => i === j || Math.abs(v - w) > 1e-9));
}

// ---------------------------------------------------------------------------------------------
// Effectif manquant
// ---------------------------------------------------------------------------------------------

export function genererEffectif(): ExerciceEffectif {
  for (;;) {
    const c = choisir(CONTEXTES_TABLEAU);
    const r = Math.min(c.max - c.min + 1, entier(4, 6));
    const debut = entier(c.min, c.max - r + 1);
    const valeurs = Array.from({ length: r }, (_, i) => debut + i);
    const effectifs = valeurs.map(() => entier(1, 12));
    const indexInconnu = entier(0, r - 1);
    const k = effectifs[indexInconnu]!;
    // Valeur 0 ou 1 sur la ligne inconnue : « v·k » se confondrait avec « k » ou disparaîtrait.
    if (k < 2 || valeurs[indexInconnu]! < 2) continue;
    const n = effectifs.reduce((s, x) => s + x, 0);
    if (n > 60 || n < 15) continue;
    const somme = valeurs.reduce((s, v, i) => s + v * effectifs[i]!, 0);
    const moyenne = arrondi9(somme / n);
    if (decimales(moyenne) > 2 || moyenne === valeurs[indexInconnu]) continue;
    const e: ExerciceEffectif = { variante: "effectif-manquant", forme: "effectif", contexte: c.id, valeurs, effectifs, indexInconnu, moyenne, ...ordres() };
    if (!solutionsDistinctes(solutionsEquationsEffectif(e))) continue;
    return e;
  }
}

/** Sommes connues (sans la ligne inconnue) : Σ(xᵢ·nᵢ) et Σnᵢ. */
export function sommesConnues(e: ExerciceEffectif): { somme: number; n: number } {
  let somme = 0;
  let n = 0;
  e.valeurs.forEach((v, i) => {
    if (i === e.indexInconnu) return;
    somme += v * e.effectifs[i]!;
    n += e.effectifs[i]!;
  });
  return { somme, n };
}

export function solutionsEquationsEffectif(e: ExerciceEffectif): (number | null)[] {
  const { somme, n } = sommesConnues(e);
  const v = e.valeurs[e.indexInconnu]!;
  const m = e.moyenne;
  return [
    e.effectifs[e.indexInconnu]!,
    // Effectif total non mis à jour : (Σ + v·k)/N = m.
    v === 0 ? null : arrondi9((m * n - somme) / v),
    // k sans sa valeur : (Σ + k)/(N + k) = m.
    m === 1 ? null : arrondi9((m * n - somme) / (1 - m)),
    // Ligne inconnue oubliée au numérateur : Σ/(N + k) = m.
    arrondi9(somme / m - n),
  ];
}

// ---------------------------------------------------------------------------------------------
// Combien de valeurs ajouter pour obtenir une médiane
// ---------------------------------------------------------------------------------------------

export function cumules(effectifs: number[]): number[] {
  const c: number[] = [];
  effectifs.reduce((s, x) => {
    c.push(s + x);
    return s + x;
  }, 0);
  return c;
}

/** Indice de la médiane (règle du seuil : premier effectif cumulé > n/2 STRICTEMENT). */
export function indexMediane(effectifs: number[]): number {
  const c = cumules(effectifs);
  const n = c[c.length - 1]!;
  return c.findIndex((x) => x > n / 2);
}

export function genererMediane(forme: FormeMediane): ExerciceMediane {
  for (;;) {
    const c = choisir(CONTEXTES_TABLEAU);
    const r = Math.min(c.max - c.min + 1, entier(5, 6));
    const debut = entier(c.min, c.max - r + 1);
    const valeurs = Array.from({ length: r }, (_, i) => debut + i);
    const effectifs = valeurs.map(() => entier(1, 10));
    const cum = cumules(effectifs);
    const s = cum[r - 1]!;
    if (s < 15 || s > 50) continue;
    const im = indexMediane(effectifs);
    let indexCible: number;
    let k0: number;
    if (forme === "haut") {
      // On ajoute k fois la plus grande valeur : la médiane monte. Cible entre la médiane et le max.
      if (im + 1 > r - 2) continue;
      indexCible = entier(im + 1, r - 2);
      k0 = 2 * cum[indexCible - 1]! - s;
    } else {
      // On ajoute k fois la plus petite valeur : la médiane descend. Cible entre le min et la médiane.
      if (im - 1 < 1) continue;
      indexCible = entier(1, im - 1);
      k0 = s - 2 * cum[indexCible]!;
    }
    if (k0 < 2 || k0 > 16) continue;
    const kMin = forme === "haut" ? k0 : k0 + 1;
    const e: ExerciceMediane = { variante: "valeur-pour-mediane", forme, contexte: c.id, valeurs, effectifs, indexMedianeActuelle: im, indexCible, k0, kMin, ...ordres() };
    if (!verifierMediane(e)) continue;
    return e;
  }
}

/** Contrôle direct par la règle du seuil : kMin donne la médiane voulue, kMin − 1 ne la donne pas. */
export function verifierMediane(e: ExerciceMediane): boolean {
  const avec = (k: number) => {
    const eff = [...e.effectifs];
    if (e.forme === "haut") eff[eff.length - 1]! += k;
    else eff[0]! += k;
    return indexMediane(eff);
  };
  return avec(e.kMin) === e.indexCible && avec(e.kMin - 1) !== e.indexCible && avec(e.kMin + 1) === e.indexCible;
}

export function solutionsEquationsMediane(e: ExerciceMediane): (number | null)[] {
  const cum = cumules(e.effectifs);
  const s = cum[cum.length - 1]!;
  const j = e.indexCible;
  if (e.forme === "haut") {
    return [
      e.k0,
      // Effectif cumulé de la valeur visée au lieu de la précédente : (S + k)/2 = C_j.
      2 * cum[j]! - s,
      // k compté dans l'effectif cumulé : (S + k)/2 = C + k.
      s - 2 * cum[j - 1]!,
      // Seuil oublié (n au lieu de n/2) : S + k = C.
      cum[j - 1]! - s,
    ];
  }
  return [
    e.k0,
    // k oublié dans l'effectif cumulé : C = (S + k)/2.
    2 * cum[j]! - s,
    // Effectif cumulé de la valeur précédente : C_{j−1} + k = (S + k)/2.
    s - 2 * cum[j - 1]!,
    // Effectif total non mis à jour : C + k = S/2.
    arrondi9(s / 2 - cum[j]!),
  ];
}

// ---------------------------------------------------------------------------------------------
// Deux groupes
// ---------------------------------------------------------------------------------------------

export function genererGroupes(forme: FormeGroupes): ExerciceGroupes {
  for (;;) {
    const c = choisir(CONTEXTES_GROUPES);
    const n1 = entier(c.effectifs[0], c.effectifs[1]);
    const n2 = entier(c.effectifs[0], c.effectifs[1]);
    if (Math.abs(n1 - n2) < 3) continue;
    const [min, max, pas] = c.moyennes;
    const m1 = surGrille(min, max, pas);
    const m2 = surGrille(min, max, pas);
    if (Math.abs(m1 - m2) < 3 * pas - 1e-9) continue;
    const globale = arrondi9((n1 * m1 + n2 * m2) / (n1 + n2));
    if (decimales(globale) > 2) continue;
    const e: ExerciceGroupes = { variante: "moyenne-groupes", forme, contexte: c.id, n1, m1, n2, m2, globale, ...ordres() };
    if (!solutionsDistinctes(solutionsEquationsGroupes(e))) continue;
    return e;
  }
}

export function solutionsEquationsGroupes(e: ExerciceGroupes): (number | null)[] {
  const { n1, m1, n2, m2, globale: g } = e;
  if (e.forme === "globale") {
    return [g, arrondi9((m1 + m2) / 2), arrondi9((n1 * m1 + n2 * m2) / 2), arrondi9((n2 * m1 + n1 * m2) / (n1 + n2))];
  }
  return [
    m2,
    // Moyenne des moyennes : (m1 + y)/2 = G.
    arrondi9(2 * g - m1),
    // y sans son effectif : (n1·m1 + y)/(n1 + n2) = G.
    arrondi9((n1 + n2) * g - n1 * m1),
    // Effectif total non mis à jour : (n1·m1 + n2·y)/n2 = G.
    arrondi9((n2 * g - n1 * m1) / n2),
  ];
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: VarianteValeurManquante; label: string }[] = [
  { id: "note-a-obtenir", label: "Note à obtenir pour atteindre une moyenne (avec ou sans coefficients)" },
  { id: "effectif-manquant", label: "Effectif manquant dans un tableau, moyenne connue" },
  { id: "valeur-pour-mediane", label: "Combien de valeurs ajouter pour obtenir une médiane donnée" },
  { id: "moyenne-groupes", label: "Moyenne de deux groupes réunis (et sens inverse)" },
];

export function genererVariante(variante: VarianteValeurManquante): ExerciceValeurManquante {
  switch (variante) {
    case "note-a-obtenir": {
      const possible = Math.random() >= PART_IMPOSSIBLE;
      const forme: FormeNote = Math.random() < 0.4 ? "sans-coef" : "avec-coef";
      return genererNote(forme, possible);
    }
    case "effectif-manquant":
      return genererEffectif();
    case "valeur-pour-mediane":
      return genererMediane(Math.random() < 0.5 ? "haut" : "bas");
    case "moyenne-groupes":
      return genererGroupes(Math.random() < 0.5 ? "globale" : "groupe");
  }
}

export function construireAvecVariante(id: string): ExerciceValeurManquante {
  const v = CATALOGUE_VARIANTES.find((c) => c.id === id);
  return v ? genererVariante(v.id) : genererExerciceValeurManquante();
}

/** Tirage libre : une des quatre variantes, au hasard. */
export function genererExerciceValeurManquante(): ExerciceValeurManquante {
  return genererVariante(choisir(CATALOGUE_VARIANTES).id);
}

export function solutionsEquations(e: ExerciceValeurManquante): (number | null)[] {
  switch (e.variante) {
    case "note-a-obtenir":
      return solutionsEquationsNote(e);
    case "effectif-manquant":
      return solutionsEquationsEffectif(e);
    case "valeur-pour-mediane":
      return solutionsEquationsMediane(e);
    case "moyenne-groupes":
      return solutionsEquationsGroupes(e);
  }
}
