import type {
  ExerciceAireIntegrale,
  ExerciceCalculIntegrale,
  ExerciceIntegraleGraphique,
  ExerciceProprietesIntegrale,
  Morceau,
  TypeDisque,
} from "../../core6e/integraleGraphique.types";

/**
 * Couche A (6e) — générateur de `6gen77` « L'intégrale lue sur un graphique (aire signée) ».
 * N'utilise QUE `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue donc
 * exactement le même tirage, ici comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * La FORME (variante, portion de disque, nombre de morceaux) est tirée d'abord, uniformément, puis
 * une courbe qui la respecte est construite par rejet : toutes les formes ont la même fréquence, ce
 * qui garde le tirage équilibré des évaluations rapide (profil : `profilEvaluation.ts`).
 *
 * Contraintes de lisibilité (390 px) : ordonnées entières dans [−3 ; 3], largeur 5 à 9 unités
 * (3 à 6 pour la partie connue de `proprietes`), au plus une portion de disque, zéros à abscisse
 * entière, jamais deux segments dans le prolongement l'un de l'autre (sauf traversée de l'axe).
 */

const Y_MAX = 3;

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

export function signeMorceau(m: Morceau): 1 | -1 {
  if (m.type === "segment") return m.y0 + m.y1 > 0 ? 1 : -1;
  return m.signe;
}

function finMorceau(m: Morceau): number {
  if (m.type === "segment") return m.y1;
  if (m.type === "demiDisque") return 0;
  return m.sens === "montant" ? m.signe * m.r : 0;
}

/** Nombre d'intervalles de signe constant (morceaux consécutifs de même signe regroupés). */
export function nombreIntervallesSigne(morceaux: Morceau[]): number {
  let n = 1;
  for (let i = 1; i < morceaux.length; i++) if (signeMorceau(morceaux[i]) !== signeMorceau(morceaux[i - 1])) n++;
  return n;
}

/**
 * Construit N morceaux à partir de x = 0 (décalés ensuite). `indiceDisque` : position de la portion
 * de disque (−1 si aucune). Renvoie `null` si la construction échoue (rejet).
 */
function construireMorceaux(n: number, disque: TypeDisque, largeurMin: number, largeurMax: number): Morceau[] | null {
  const indiceDisque = disque === "aucun" ? -1 : entier(0, n - 1);
  const morceaux: Morceau[] = [];
  let x = 0;
  let y = entier(-Y_MAX, Y_MAX);
  for (let i = 0; i < n; i++) {
    const precedent = morceaux[i - 1];
    if (i === indiceDisque) {
      if (disque === "demi") {
        if (y !== 0) return null;
        const r = entier(1, 2);
        morceaux.push({ type: "demiDisque", x0: x, x1: x + 2 * r, r, signe: Math.random() < 0.5 ? 1 : -1 });
        x += 2 * r;
        continue;
      }
      if (y === 0) {
        const r = entier(1, Y_MAX);
        const signe = Math.random() < 0.5 ? 1 : -1;
        morceaux.push({ type: "quartDisque", x0: x, x1: x + r, r, signe, sens: "montant" });
        x += r;
        y = signe * r;
      } else {
        const r = Math.abs(y);
        morceaux.push({ type: "quartDisque", x0: x, x1: x + r, r, signe: y > 0 ? 1 : -1, sens: "descendant" });
        x += r;
        y = 0;
      }
      continue;
    }
    // Segment : candidats (largeur, ordonnée d'arrivée).
    const candidats: { w: number; y1: number }[] = [];
    for (const w of [1, 1, 2, 2, 3]) {
      for (let y1 = -Y_MAX; y1 <= Y_MAX; y1++) {
        if (y * y1 < 0) continue;
        if (y === 0 && y1 === 0) continue;
        if (precedent?.type === "segment") {
          const pentePrec = (precedent.y1 - precedent.y0) / (precedent.x1 - precedent.x0);
          // Dans le prolongement : seulement une droite qui traverse l'axe (découpée au zéro).
          if (Math.abs((y1 - y) / w - pentePrec) < 1e-9 && y !== 0) continue;
        }
        // Le morceau suivant est-il la portion de disque ? Préparer son point de départ.
        if (i + 1 === indiceDisque) {
          if (disque === "demi" && y1 !== 0) continue;
        }
        candidats.push({ w, y1 });
      }
    }
    if (candidats.length === 0) return null;
    const { w, y1 } = choisir(candidats);
    morceaux.push({ type: "segment", x0: x, x1: x + w, y0: y, y1 });
    x += w;
    y = y1;
  }
  if (x < largeurMin || x > largeurMax) return null;
  return morceaux;
}

function decaler(morceaux: Morceau[], dx: number): Morceau[] {
  return morceaux.map((m) => ({ ...m, x0: m.x0 + dx, x1: m.x1 + dx }));
}

/** Un morceau qui touche l'axe sans que f change de signe (pointe posée sur l'axe) : interdit en
 * `aireIntegrale` (« change de signe » doit rester sans ambiguïté). */
function toucheSansChanger(morceaux: Morceau[]): boolean {
  for (let i = 1; i < morceaux.length; i++) {
    if (finMorceau(morceaux[i - 1]) === 0 && signeMorceau(morceaux[i]) === signeMorceau(morceaux[i - 1])) return true;
  }
  return false;
}

const DISQUES: TypeDisque[] = ["aucun", "demi", "quart"];

/** Tirage par rejet d'une suite de morceaux respectant la forme ; `accepter` filtre la suite. */
function tirer(n: number, disque: TypeDisque, largeurMin: number, largeurMax: number, accepter: (m: Morceau[]) => boolean): Morceau[] {
  for (let essai = 0; essai < 20000; essai++) {
    const m = construireMorceaux(n, disque, largeurMin, largeurMax);
    if (m && accepter(m)) return m;
  }
  throw new Error(`6gen77 : forme introuvable (${n} morceaux, disque ${disque})`);
}

/** Décalage horizontal : 0 reste dans [a ; b − 1] (l'axe des ordonnées traverse la figure). */
function decalageAvecOrigine(largeur: number): number {
  return -entier(1, largeur - 1);
}

export function construireCalcul(n?: 3 | 4 | 5, disque?: TypeDisque): ExerciceCalculIntegrale {
  const N = n ?? choisir([3, 4, 5] as const);
  const D = disque ?? choisir(DISQUES);
  const brut = tirer(N, D, 5, 9, (m) => m.some((x) => signeMorceau(x) > 0) && m.some((x) => signeMorceau(x) < 0));
  const largeur = brut[brut.length - 1].x1;
  const dx = decalageAvecOrigine(largeur);
  return { variante: "calcul", morceaux: decaler(brut, dx), disque: D, a: dx, b: dx + largeur };
}

export function construireAireIntegrale(k?: 2 | 3, disque?: TypeDisque): ExerciceAireIntegrale {
  const K = k ?? choisir([2, 3] as const);
  const D = disque ?? choisir(DISQUES);
  // Un segment ne commence et ne finit jamais tous deux sur l'axe : un intervalle de signe intérieur
  // demande deux segments (sauf demi-disque), d'où K + 1 ou K + 2 morceaux.
  const N = entier(K + 1, K + 2);
  const brut = tirer(N, D, 5, 9, (m) => nombreIntervallesSigne(m) === K && !toucheSansChanger(m));
  const largeur = brut[brut.length - 1].x1;
  const dx = decalageAvecOrigine(largeur);
  return { variante: "aireIntegrale", morceaux: decaler(brut, dx), disque: D, a: dx, b: dx + largeur };
}

export function construireProprietes(n?: 2 | 3, disque?: TypeDisque): ExerciceProprietesIntegrale {
  const N = n ?? choisir([2, 3] as const);
  const D = disque ?? choisir(DISQUES);
  const brut = tirer(N, D, 3, 6, () => true);
  const largeur = brut[brut.length - 1].x1;
  const cote = Math.random() < 0.5 ? "gauche" : "droite";
  const ecart = entier(2, 4);
  // 0 strictement dans la fenêtre tracée (partie connue + partie inconnue).
  const dx = cote === "gauche" ? entier(1 - largeur, ecart - 1) : entier(1 - largeur - ecart, -1);
  const c = dx;
  const d = dx + largeur;
  const lointaine = cote === "gauche" ? c - ecart : d + ecart;
  let inconnue = 0;
  while (inconnue === 0) inconnue = entier(-6, 6);
  return { variante: "proprietes", morceaux: decaler(brut, dx), disque: D, c, d, cote, lointaine, inconnue };
}

export type IdVarianteIntegraleGraphique = "calcul" | "calcul-disque" | "aireIntegrale" | "aireIntegrale-disque" | "proprietes" | "proprietes-disque";

export const CATALOGUE_VARIANTES: { id: IdVarianteIntegraleGraphique; label: string }[] = [
  { id: "calcul", label: "Calculer ∫ par des aires — segments seuls" },
  { id: "calcul-disque", label: "Calculer ∫ par des aires — avec un demi-disque ou un quart de disque" },
  { id: "aireIntegrale", label: "Aire ou intégrale ? — segments seuls" },
  { id: "aireIntegrale-disque", label: "Aire ou intégrale ? — avec une portion de disque" },
  { id: "proprietes", label: "Additivité et bornes inversées — segments seuls" },
  { id: "proprietes-disque", label: "Additivité et bornes inversées — avec une portion de disque" },
];

const AVEC_DISQUE: TypeDisque[] = ["demi", "quart"];

export function construireAvecVarianteId(id: IdVarianteIntegraleGraphique): ExerciceIntegraleGraphique {
  switch (id) {
    case "calcul":
      return construireCalcul(undefined, "aucun");
    case "calcul-disque":
      return construireCalcul(undefined, choisir(AVEC_DISQUE));
    case "aireIntegrale":
      return construireAireIntegrale(undefined, "aucun");
    case "aireIntegrale-disque":
      return construireAireIntegrale(undefined, choisir(AVEC_DISQUE));
    case "proprietes":
      return construireProprietes(undefined, "aucun");
    case "proprietes-disque":
      return construireProprietes(undefined, choisir(AVEC_DISQUE));
  }
}

/** Tirage libre : variante équiprobable, puis sa forme (disque, nombre de morceaux) uniforme. */
export function genererExerciceIntegraleGraphique(): ExerciceIntegraleGraphique {
  const r = Math.random();
  if (r < 1 / 3) return construireCalcul();
  if (r < 2 / 3) return construireAireIntegrale();
  return construireProprietes();
}
