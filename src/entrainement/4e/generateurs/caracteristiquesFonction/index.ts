import type {
  CasDiscontinuite,
  ExerciceCaracteristiquesFonction,
  GenerateurExerciceCaracteristiquesFonction,
  Zone4Gap,
} from "../../core/caracteristiquesFonction.types";

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randNonZero(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = randInt(min, max);
  return v;
}

/** Marges (en unités x) affichées au-delà de b1/AV — partagées avec le graphe (voir mafsCaracteristiquesFonction.ts). */
export const MARGE_GAUCHE_VISIBLE = 3;
export const MARGE_DROITE_VISIBLE = 8;

interface LayoutLocal {
  b1: number;
  b2: number;
  b3: number;
  b4: number;
  b5: number;
  AV: number;
  c: number;
  valeurNaturelleC: number;
  y1: number;
  y2: number;
  y3: number;
  y5Naturel: number;
  m1: number;
  L: number;
  k: number;
  zeros: number[];
  gaps: Zone4Gap[];
}

/**
 * Construit tout le squelette en coordonnées LOCALES (b1 toujours ancré à 0) — la position finale
 * absolue de x=0 est décidée APRÈS coup par un simple décalage global (voir genererExerciceCaracteristiquesFonction),
 * jamais par un ajustement a posteriori des bornes : plus simple et plus robuste que de forcer
 * x=0 à tomber au bon endroit en manipulant b1 directement.
 *
 * 4 générateurs de zéro indépendants (jamais un compte fixé à 2, refonte point 2) — chacun choisi
 * PAR CONSTRUCTION (jamais tirage-puis-vérification) :
 * - zone 1 (rayon croissant) : zéro visible dans la marge gauche si la valeur en b1 est assez
 *   petite ; sinon la valeur au bord de la marge reste positive (pas de zéro).
 * - zone 2/3 (couplées) : un zéro dans la zone 2 implique nécessairement un zéro dans la zone 3
 *   par continuité/monotonie (la zone 2 finit alors négative, la zone 3 repart de cette valeur
 *   négative vers y3>0) — les deux sont donc actives ou inactives ensemble.
 * - zone 5 (décroissante) : indépendante des précédentes.
 * - zone 7 (branche hyperbolique) : dérivée du signe relatif de k et L (jamais une position
 *   choisie indépendamment de ces deux valeurs, sinon le zéro tomberait à une position non
 *   entière) — voir le calcul de `d` ci-dessous.
 */
function construireLayoutLocal(): LayoutLocal {
  const b1 = 0;

  const hasZeroZone1 = Math.random() < 0.5;
  const m1 = randInt(1, 3);
  let y1: number;
  let zeroZone1: number | null = null;
  if (hasZeroZone1) {
    // |z0|=1 avec m1=1 donnerait y1=1, trop petit pour laisser de la place à zone 2 (voir plus
    // bas, randInt(1,y1-1) exige y1>=2) — forcé à |z0|=2 dans ce seul cas.
    const z0abs = m1 === 1 ? 2 : randInt(1, MARGE_GAUCHE_VISIBLE - 1);
    y1 = m1 * z0abs;
    zeroZone1 = -z0abs;
  } else {
    y1 = m1 * MARGE_GAUCHE_VISIBLE + randInt(1, 3);
  }

  const hasZeroZone2 = Math.random() < 0.5;
  const gapZone2 = randInt(4, 6);
  const b2 = b1 + gapZone2;
  const gapZone3 = hasZeroZone2 ? randInt(5, 7) : randInt(3, 5);
  const b3 = b2 + gapZone3;

  let y2: number;
  let zeroZone2: number | null = null;
  let zeroZone3: number | null = null;
  let c: number;
  let valeurNaturelleC: number;
  const y3 = randInt(3, 7);

  if (hasZeroZone2) {
    y2 = -randInt(1, 4);
    zeroZone2 = b1 + randInt(1, gapZone2 - 1);
    zeroZone3 = b2 + randInt(1, gapZone3 - 3);
    c = zeroZone3 + randInt(1, gapZone3 - (zeroZone3 - b2) - 1);
    valeurNaturelleC = randInt(1, y3 - 1);
  } else {
    // y2 doit rester strictement en dessous de y3, avec de la place pour valeurNaturelleC entre
    // les deux (voir zone 3, toujours croissante) — jamais seulement borné par y1.
    y2 = randInt(1, Math.min(y1 - 1, y3 - 2));
    c = b2 + randInt(1, gapZone3 - 1);
    valeurNaturelleC = y2 + randInt(1, y3 - y2 - 1);
  }

  const gapZone4 = randInt(2, 3);
  const rGaps = Math.random();
  const nombreGaps = rGaps < 0.4 ? 0 : rGaps < 0.85 ? 1 : 2;
  let b4: number;
  const gaps: Zone4Gap[] = [];
  if (nombreGaps === 0) {
    b4 = b3 + gapZone4;
  } else if (nombreGaps === 1) {
    const largeurGap = randInt(2, 3);
    const margeGauche = randInt(2, 3);
    const margeDroite = randInt(2, 3);
    const g1 = b3 + margeGauche;
    const g2 = g1 + largeurGap;
    b4 = g2 + margeDroite;
    gaps.push({ g1, g2 });
  } else {
    const largeurGap1 = randInt(2, 3);
    const largeurGap2 = randInt(2, 3);
    const marge = randInt(2, 3);
    const g1 = b3 + marge;
    const g2 = g1 + largeurGap1;
    const g3 = g2 + marge;
    const g4 = g3 + largeurGap2;
    b4 = g4 + marge;
    gaps.push({ g1, g2 }, { g1: g3, g2: g4 });
  }

  const hasZeroZone5 = Math.random() < 0.5;
  const gapZone5 = randInt(4, 6);
  const b5 = b4 + gapZone5;
  let y5Naturel: number;
  let zeroZone5: number | null = null;
  if (hasZeroZone5) {
    zeroZone5 = b4 + randInt(1, gapZone5 - 1);
    y5Naturel = -randInt(1, 4);
  } else {
    y5Naturel = randInt(1, Math.max(1, y3 - 1));
  }

  // Refonte 3, correction 2 : plus de `b6` séparé — AV est directement à distance `gapVA` de b5,
  // l'abscisse UNIQUE et partagée de la discontinuité (fin de zone 5 ET début de la branche
  // hyperbolique). `distB5` (distance entre le point de discontinuité et l'asymptote) et `gapVA`
  // sont donc désormais littéralement la même valeur — un seul nom (`gapVA`) suffit.
  const gapVA = randInt(3, 6);
  const AV = b5 + gapVA;

  const L = randNonZero(-5, 5);
  const hasZeroZone7 = Math.random() < 0.5;
  let k: number;
  let zeroZone7: number | null = null;
  if (hasZeroZone7) {
    // d = gapVA exactement (un multiple de gapVA, ici m=1) : garantit f(b5) = L + k/(b5-AV) =
    // L - k/gapVA = L + d = 2L, toujours entier — jamais calculé après coup par interpolation
    // (refonte 2, point 2). d <= gapVA <= 6 = MARGE_DROITE_VISIBLE-2, donc zeroZone7 reste dans
    // la marge visible, comme avant.
    const d = gapVA;
    k = -L * d;
    zeroZone7 = AV + d;
  } else {
    // Aucun zéro nulle part sur la branche hyperbolique (zone 6 ET zone 7 — pas seulement zone 7
    // comme avant refonte 2, où un zéro pouvait apparaître en zone 6 sans jamais être déclaré dans
    // `zeros`). L'unique zéro théorique de L+k/(x-AV) est x0 = AV - k/L : en choisissant k
    // multiple de gapVA (k = gapVA*n, sign(n) = sign(L)) avec |n| > |L| (donc |k|/|L| > gapVA),
    // x0 tombe strictement à gauche de b5 (hors du domaine visible de la courbe) — voir la preuve
    // dans index.test.ts. f(b5) = L - k/gapVA = L - n reste alors un entier exact, jamais
    // recalculé par interpolation.
    const n = (Math.abs(L) + randInt(1, 2)) * Math.sign(L);
    k = gapVA * n;
  }

  const zeros = [zeroZone1, zeroZone2, zeroZone3, zeroZone5, zeroZone7].filter((z): z is number => z !== null);

  return { b1, b2, b3, b4, b5, AV, c, valeurNaturelleC, y1, y2, y3, y5Naturel, m1, L, k, zeros, gaps };
}

/** Toutes les positions "spéciales" du squelette local — jamais choisies pour x=0. */
function positionsSpeciales(layout: LayoutLocal): number[] {
  const bornesGaps = layout.gaps.flatMap((g) => [g.g1, g.g2]);
  return [
    layout.b1,
    layout.b2,
    layout.b3,
    layout.b4,
    layout.b5,
    layout.AV,
    layout.c,
    ...layout.zeros,
    ...bornesGaps,
  ];
}

/**
 * Candidats "sûrs" pour x=0 quand l'ordonnée à l'origine doit exister — refonte 2, point 2 :
 * restreint désormais à la zone 1 (rayon, x<=b1) et à la zone 4 (constante, x entre b3 et b4 hors
 * gap), les DEUX SEULES zones où une position entière quelconque garantit une valeur f(x) elle
 * -même entière par construction (zone 1 : f(x)=y1+m1*(x-b1), toujours entier ; zone 4 :
 * f(x)=y3 identiquement). Toute autre zone (2, 3, 5, 6, 7) interpole linéairement ou passe par la
 * branche hyperbolique — une position quelconque y produit généralement une valeur décimale
 * (symptôme observé : f(0)=0,667), jamais garantie entière. Exclut toujours les positions déjà
 * spéciales (mêmes raisons qu'avant : éviter qu'un zéro/une borne de zone ne coïncide avec x=0).
 */
function candidatsSursIntegerSafe(layout: LayoutLocal): number[] {
  const speciaux = new Set(positionsSpeciales(layout));
  const candidats: number[] = [];
  const xMin = layout.b1 - MARGE_GAUCHE_VISIBLE;
  for (let x = xMin; x <= layout.b1; x++) {
    if (speciaux.has(x)) continue;
    candidats.push(x);
  }
  for (let x = layout.b3; x <= layout.b4; x++) {
    if (speciaux.has(x)) continue;
    if (layout.gaps.some((g) => x > g.g1 && x < g.g2)) continue;
    candidats.push(x);
  }
  return candidats;
}

/** Choisit où x=0 doit tomber (local) — décide en même temps si l'ordonnée à l'origine existe. */
function choisirCible0(layout: LayoutLocal): number {
  const candidats = candidatsSursIntegerSafe(layout);
  // Repli sur "n'existe pas" si aucune position entière-sûre n'est disponible (cas extrême,
  // jamais rencontré en pratique vu les marges — voir index.test.ts) plutôt que de planter.
  const ordonneeExiste = candidats.length > 0 && Math.random() < 0.55;
  if (!ordonneeExiste) {
    if (layout.gaps.length > 0 && Math.random() < 0.6) {
      const gap = layout.gaps[randInt(0, layout.gaps.length - 1)];
      return randInt(gap.g1 + 1, gap.g2 - 1);
    }
    return layout.c;
  }
  return candidats[randInt(0, candidats.length - 1)];
}

/**
 * Choisit l'ordonnée du point isolé du cas 3 ("pointRedefini") — un entier strictement au-dessus
 * du plus haut des deux cercles vides de b5, ou strictement en dessous du plus bas (jamais entre
 * les deux, jamais égal à l'un d'eux) — même mécanisme qualitatif que l'ancien "point redéfini" de
 * la zone 3 (retiré depuis, voir core/caracteristiquesFonction.types.ts), appliqué ici à la
 * discontinuité plutôt qu'à l'intérieur d'un seul morceau. Rejette seulement 0 (jamais l'ordonnée
 * à l'origine d'un point isolé sans lien avec x=0) ; distinct des deux cercles vides par
 * construction (toujours strictement hors de [bas,haut]), aucune vérification supplémentaire
 * nécessaire pour cette part-là.
 */
function choisirValeurPointRedefini(y5Naturel: number, valeurHyperboleNaturelle: number): number {
  const bas = Math.min(y5Naturel, valeurHyperboleNaturelle);
  const haut = Math.max(y5Naturel, valeurHyperboleNaturelle);
  let valeur = 0;
  do {
    const ecart = randInt(1, 4);
    valeur = Math.random() < 0.5 ? haut + ecart : bas - ecart;
  } while (valeur === 0);
  return valeur;
}

/**
 * Tire l'un des 3 cas de discontinuité à poids égal ("Trois cas possibles pour la discontinuité,
 * tirés aléatoirement") — voir `CasDiscontinuite` (core/caracteristiquesFonction.types.ts) pour la
 * sémantique de chacun. `y5Naturel`/`valeurHyperboleNaturelle` sont invariants au décalage global
 * (decaler ne change ni L ni k, et translate b5/AV de la même quantité t — leur différence, donc
 * cette valeur, reste inchangée) : peut donc être calculé indifféremment avant ou après le
 * décalage, calculé ici sur le layout final par simplicité.
 */
function tirerCasDiscontinuite(y5Naturel: number, valeurHyperboleNaturelle: number): CasDiscontinuite {
  const r = Math.random();
  if (r < 1 / 3) return { type: "pointPlein" };
  if (r < 2 / 3) return { type: "trou" };
  return { type: "pointRedefini", valeur: choisirValeurPointRedefini(y5Naturel, valeurHyperboleNaturelle) };
}

function decaler(layout: LayoutLocal, t: number): LayoutLocal {
  return {
    ...layout,
    b1: layout.b1 + t,
    b2: layout.b2 + t,
    b3: layout.b3 + t,
    b4: layout.b4 + t,
    b5: layout.b5 + t,
    AV: layout.AV + t,
    c: layout.c + t,
    zeros: layout.zeros.map((z) => z + t).sort((a, b) => a - b),
    gaps: layout.gaps.map((g) => ({ g1: g.g1 + t, g2: g.g2 + t })),
  };
}

/**
 * Vérifie que tous les invariants d'ordre stricts requis tiennent (b1<b2<...<AV, z3 strictement
 * entre b2 et c si présent, gaps non chevauchants et strictement à l'intérieur de [b3,b4]...) —
 * boucle de secours (comme construireDeuxDenominateurs/construireCas4a ailleurs dans le projet)
 * plutôt qu'une preuve arithmétique a priori, plus robuste face à la combinatoire des 4 générateurs
 * de zéro indépendants.
 */
function layoutValide(layout: LayoutLocal): boolean {
  const { b1, b2, b3, b4, b5, AV, c } = layout;
  if (!(b1 < b2 && b2 < b3 && b3 < b4 && b4 < b5 && b5 < AV)) return false;
  if (!(c > b2 && c < b3)) return false;

  let precedent = b3;
  for (const gap of layout.gaps) {
    if (!(gap.g1 > precedent && gap.g2 > gap.g1 + 1 && gap.g2 < b4)) return false;
    precedent = gap.g2;
  }

  const speciaux = positionsSpeciales(layout);
  if (new Set(speciaux).size !== speciaux.length) return false;

  // Refonte 3, correction 2 : une discontinuité de saut exige deux valeurs de y RÉELLEMENT
  // distinctes à l'abscisse partagée b5 (la valeur naturelle exclue, cercle vide, contre la
  // valeur réelle de la branche hyperbolique, cercle plein) — sinon les deux marqueurs se
  // superposeraient exactement, la discontinuité "disparaissant" visuellement. y5Naturel et
  // L+k/(b5-AV) sont deux valeurs tirées indépendamment, une coïncidence reste possible ; rejetée
  // ici comme n'importe quel autre invariant de construction, via la même boucle de secours.
  const valeurReelleEnB5 = layout.L + layout.k / (layout.b5 - layout.AV);
  if (valeurReelleEnB5 === layout.y5Naturel) return false;

  return true;
}

export function genererExerciceCaracteristiquesFonction(): ExerciceCaracteristiquesFonction {
  for (let tentative = 0; tentative < 500; tentative++) {
    const layout = construireLayoutLocal();
    if (!layoutValide(layout)) continue;

    const cible0 = choisirCible0(layout);
    const global = decaler(layout, -cible0);
    if (!layoutValide(global)) continue;

    // Évite que v coïncide avec x=0 : redondant avec la question "ordonnée à l'origine", qui
    // porte déjà sur ce même point (peut arriver quand x=0 est lui-même placé sur le point creux,
    // voir choisirCible0). c et b5 ne coïncident jamais entre eux, donc si l'un des deux vaut 0,
    // l'autre ne peut pas l'être aussi.
    const v = global.c === 0 ? global.b5 : global.b5 === 0 ? global.c : Math.random() < 0.5 ? global.c : global.b5;

    const valeurHyperboleNaturelle = global.L + global.k / (global.b5 - global.AV);
    const discontinuite = tirerCasDiscontinuite(global.y5Naturel, valeurHyperboleNaturelle);

    return {
      b1: global.b1,
      b2: global.b2,
      b3: global.b3,
      b4: global.b4,
      b5: global.b5,
      AV: global.AV,
      c: global.c,
      valeurNaturelleC: global.valeurNaturelleC,
      y1: global.y1,
      y2: global.y2,
      y3: global.y3,
      y5Naturel: global.y5Naturel,
      m1: global.m1,
      L: global.L,
      k: global.k,
      zeros: global.zeros,
      gaps: global.gaps,
      v,
      discontinuite,
    };
  }

  throw new Error("genererExerciceCaracteristiquesFonction : génération impossible après 500 tentatives");
}

export const genererCaracteristiquesFonction: GenerateurExerciceCaracteristiquesFonction = genererExerciceCaracteristiquesFonction;
