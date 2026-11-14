import type { ExerciceContenanceObjets, Frac, ObjetContenance, ProfilContenance, SecondObjet, TransfertContenance } from "../../core6e/contenanceObjets.types";
import { carreProfil, frac, rayonProfil, valeur, volumeJusqua, volumeSurPiEntre } from "../../core6e/contenanceObjetsCalcul";

/**
 * Couche A (6e) — génération de `6gen83` « Contenance d'objets de révolution ». Une variante par
 * OBJET (verre à vin, vase, tonneau, flacon de parfum, pot de fleurs) ; la question de transfert
 * (hauteur du liquide, nombre de récipients, comparaison) est tirée dans la variante.
 *
 * Construction « depuis des valeurs propres » : rayons, hauteurs et coefficients choisis d'abord
 * (tables ci-dessous) pour que [f(x)]² soit un polynôme à coefficients rationnels simples et le
 * volume un multiple rationnel EXACT de π. Les quantités de transfert sont choisies ensuite pour
 * éviter les cas limites (rapport presque entier pour un nombre de récipients, comparaison serrée).
 */

function tirer<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}
function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

export type IdVarianteContenanceObjets = ObjetContenance;

export const CATALOGUE_VARIANTES: { id: IdVarianteContenanceObjets; label: string }[] = [
  { id: "verre", label: "Verre à vin (profil racine)" },
  { id: "vase", label: "Vase évasé (profil parabolique)" },
  { id: "tonneau", label: "Tonneau (profil parabolique bombé)" },
  { id: "flacon", label: "Flacon de parfum (profil en demi-ellipse)" },
  { id: "pot", label: "Pot de fleurs (tronc de cône)" },
];

export const TRANSFERTS_PAR_OBJET: Record<ObjetContenance, TransfertContenance[]> = {
  verre: ["hauteur", "nombre", "comparer"],
  vase: ["nombre", "comparer"],
  tonneau: ["nombre", "comparer"],
  flacon: ["nombre", "comparer"],
  pot: ["hauteur", "nombre"],
};

interface Base {
  profil: ProfilContenance;
  a: number;
  b: number;
  horsCavite: number;
  hauteurTotale: number;
}

function baseVerre(): Base {
  const a = tirer([2, 3, 4]);
  const h = tirer(a === 2 ? [6, 7, 8, 9, 10] : a === 3 ? [4, 5, 6] : [3, 4, 5]);
  const pied = entier(8, 12);
  return { profil: { type: "racine", a }, a: 0, b: h, horsCavite: pied, hauteurTotale: h + pied };
}

/** (h ; n) avec h²/n entier entre 2 et 5 : ouverture f(h) = r + h²/n entière. */
const VASES: [number, number][] = [
  [15, 45],
  [15, 75],
  [16, 64],
  [18, 81],
  [18, 108],
  [20, 80],
  [20, 100],
  [20, 200],
  [24, 144],
  [25, 125],
];
function baseVase(): Base {
  const r = tirer([3, 4, 5, 6]);
  const [h, n] = tirer(VASES);
  const fond = tirer([1, 1.5, 2]);
  return { profil: { type: "parabole", r, n }, a: 0, b: h, horsCavite: fond, hauteurTotale: h + fond };
}

/** (H ; R ; d) : demi-hauteur, rayon à la bonde, R − rayon des fonds ; n = H²/d entier. */
const TONNEAUX: [number, number, number][] = [
  [20, 15, 4],
  [25, 20, 5],
  [30, 25, 9],
  [30, 22, 5],
  [30, 24, 6],
  [35, 25, 7],
  [40, 30, 8],
  [40, 28, 4],
  [40, 32, 10],
  [45, 30, 9],
];
function baseTonneau(): Base {
  const [H, R, d] = tirer(TONNEAUX);
  return { profil: { type: "bombe", R, n: (H * H) / d }, a: -H, b: H, horsCavite: 0, hauteurTotale: 2 * H };
}

const FLACONS: [number, number][] = [
  [3, 2],
  [4, 2],
  [5, 2],
  [4, 3],
  [6, 3],
];
function baseFlacon(): Base {
  const [a, b] = tirer(FLACONS);
  const bouchon = tirer([2, 3, 4]);
  return { profil: { type: "ellipse", a, b }, a: -a, b: a, horsCavite: bouchon, hauteurTotale: 2 * a + bouchon };
}

function basePot(): Base {
  const r = tirer([4, 5, 6, 7]);
  const d = tirer([2, 3, 4]);
  const h = tirer([10, 12, 14, 15, 16, 18, 20]);
  const fond = tirer([1, 2]);
  return { profil: { type: "droite", r, R: r + d, h }, a: 0, b: h, horsCavite: fond, hauteurTotale: h + fond };
}

const BASES: Record<ObjetContenance, () => Base> = { verre: baseVerre, vase: baseVase, tonneau: baseTonneau, flacon: baseFlacon, pot: basePot };

/** Hauteur t (depuis la borne a) telle que π∫ₐᵗ [f(x)]² dx = cible (cm³) — dichotomie (volume
 * croissant en t). */
function hauteurPourVolume(e: ExerciceContenanceObjets, cible: number): number {
  let bas = e.a;
  let haut = e.b;
  for (let i = 0; i < 80; i++) {
    const m = (bas + haut) / 2;
    if (volumeJusqua(e, m) < cible) bas = m;
    else haut = m;
  }
  return (bas + haut) / 2 - e.a;
}

function partieFractionnaireCorrecte(x: number): boolean {
  const p = x - Math.floor(x);
  return p >= 0.1 && p <= 0.9;
}

const SOURCES: Record<ObjetContenance, { libelle: string; cm3: number }[]> = {
  verre: [
    { libelle: "une bouteille de 75 cL", cm3: 750 },
    { libelle: "un magnum de 1,5 L", cm3: 1500 },
  ],
  vase: [
    { libelle: "verres de 25 cL", cm3: 250 },
    { libelle: "carafes de 50 cL", cm3: 500 },
  ],
  tonneau: [
    { libelle: "bouteilles de 75 cL", cm3: 750 },
    { libelle: "bouteilles de 1 L", cm3: 1000 },
  ],
  flacon: [
    { libelle: "un flacon de recharge de 1 L", cm3: 1000 },
    { libelle: "un flacon de recharge de 50 cL", cm3: 500 },
  ],
  pot: [
    { libelle: "un sac de terreau de 10 L", cm3: 10000 },
    { libelle: "un sac de terreau de 20 L", cm3: 20000 },
    { libelle: "un sac de terreau de 40 L", cm3: 40000 },
    { libelle: "un sac de terreau de 50 L", cm3: 50000 },
  ],
};

/** Second objet de la comparaison et son volume (V₂/π exact) — cotes en diamètre. */
function candidatsSecond(e: ExerciceContenanceObjets): { second: SecondObjet; surPi: Frac }[] {
  const liste: { second: SecondObjet; surPi: Frac }[] = [];
  const ajouter = (forme: SecondObjet["forme"], diametre: number, hauteur: number) => {
    const surPi = forme === "cone" ? frac(diametre * diametre * hauteur, 12) : frac(diametre * diametre * hauteur, 4);
    liste.push({ second: { forme, diametre, hauteur }, surPi });
  };
  if (e.objet === "verre") for (let D = 6; D <= 12; D++) for (let k = 6; k <= 14; k++) ajouter("cone", D, k);
  // Vase, tonneau : diamètre strictement entre le plus petit et le plus grand diamètre intérieur
  // (sinon la comparaison se voit sans calcul : cylindre plus large ou plus étroit partout).
  const dMin = 2 * Math.min(rayonProfil(e.profil, e.a), rayonProfil(e.profil, (e.a + e.b) / 2), rayonProfil(e.profil, e.b));
  const dMax = 2 * Math.max(rayonProfil(e.profil, e.a), rayonProfil(e.profil, (e.a + e.b) / 2), rayonProfil(e.profil, e.b));
  if (e.objet === "vase") for (let D = 4; D <= 24; D++) if (D > dMin && D < dMax) ajouter("cylindre", D, e.b);
  if (e.objet === "tonneau") for (let D = 20; D <= 80; D += 2) if (D > dMin && D < dMax) ajouter("cylindre", D, e.b - e.a);
  if (e.objet === "flacon") for (let D = 2; D <= 10; D++) for (let k = 3; k <= 12; k++) ajouter("cylindre", D, k);
  return liste;
}

function completerTransfert(e: ExerciceContenanceObjets): boolean {
  const V = Math.PI * valeur(e.volumeSurPi);
  if (e.transfert === "hauteur") {
    if (e.objet === "verre" && Math.random() < 0.5) {
      e.fraction = tirer([frac(1, 2), frac(1, 3), frac(1, 4)]);
      e.hauteurLiquide = e.b * Math.sqrt(valeur(e.fraction));
      return true;
    }
    if (e.objet === "verre") {
      const vcl = V / 10;
      const min = Math.ceil(0.3 * vcl);
      const max = Math.floor(0.8 * vcl);
      if (max < min) return false;
      e.quantite = entier(min, max);
      e.hauteurLiquide = hauteurPourVolume(e, e.quantite * 10);
      return true;
    }
    // Pot : quantité en litres, au dixième.
    const vl = V / 1000;
    const min = Math.ceil(3 * vl);
    const max = Math.floor(8 * vl);
    if (max < min) return false;
    e.quantite = entier(min, max) / 10;
    e.hauteurLiquide = hauteurPourVolume(e, e.quantite * 1000);
    return e.hauteurLiquide > 1 && e.hauteurLiquide < e.b - 1;
  }
  if (e.transfert === "nombre") {
    e.arrondi = e.objet === "vase" ? "ceil" : "floor";
    // Vase : verres versés POUR le remplir ; tonneau : bouteilles remplies AVEC lui ; sinon :
    // objets remplis avec la source.
    const rapport = (s: { cm3: number }) => (e.objet === "vase" || e.objet === "tonneau" ? V / s.cm3 : s.cm3 / V);
    const possibles = SOURCES[e.objet].filter((s) => rapport(s) >= 2.5 && rapport(s) <= 160 && partieFractionnaireCorrecte(rapport(s)));
    if (possibles.length === 0) return false;
    e.source = tirer(possibles);
    e.nombre = e.arrondi === "ceil" ? Math.ceil(rapport(e.source)) : Math.floor(rapport(e.source));
    return true;
  }
  // Comparer : verdict (tiré une fois pour toutes, avant les essais : 50/50 exact), écart d'au moins 10 %.
  const v1 = valeur(e.volumeSurPi);
  const possibles = candidatsSecond(e).filter(({ surPi }) => {
    const r = valeur(surPi) / v1;
    return e.premierPlusGrand ? r >= 0.72 && r <= 0.9 : r >= 1.1 && r <= 1.35;
  });
  if (possibles.length === 0) return false;
  const choix = tirer(possibles);
  e.second = choix.second;
  e.secondSurPi = choix.surPi;
  return true;
}

export function construireContenanceObjets(objet: ObjetContenance, transfertImpose?: TransfertContenance): ExerciceContenanceObjets {
  // Transfert et verdict tirés AVANT la boucle d'essais : un rejet (comparaison impossible pour ces
  // dimensions, hauteur trop près d'un bord) ne doit pas biaiser leurs fréquences.
  const transfert = transfertImpose ?? tirer(TRANSFERTS_PAR_OBJET[objet]);
  const premierPlusGrand = Math.random() < 0.5;
  for (;;) {
    const base = BASES[objet]();
    const carre = carreProfil(base.profil);
    const e: ExerciceContenanceObjets = {
      objet,
      transfert,
      ...base,
      carre,
      volumeSurPi: volumeSurPiEntre(carre, base.a, base.b),
      ordreModele: melanger([0, 1, 2, 3]),
      fraction: null,
      quantite: 0,
      hauteurLiquide: 0,
      source: null,
      arrondi: "floor",
      nombre: 0,
      second: null,
      secondSurPi: null,
      premierPlusGrand,
    };
    if (completerTransfert(e)) return e;
  }
}

export function construireAvecVarianteId(id: IdVarianteContenanceObjets): ExerciceContenanceObjets {
  return construireContenanceObjets(id);
}

/** Tirage équiprobable de l'objet, puis de la question de transfert. */
export function genererExerciceContenanceObjets(): ExerciceContenanceObjets {
  return construireContenanceObjets(tirer(CATALOGUE_VARIANTES).id);
}
