import type {
  DonneesDetectiveTrig,
  ErreurEquation,
  ErreurParametres,
  ErreurProduit,
  ErreurSecteur,
  ExerciceDetectiveTrig,
  ExerciceParametres,
  IdDescriptionTrig,
  LeurreTrig,
  TypeErreurTrig,
  VarianteDetectiveTrig,
} from "../../core5e/detectiveTrig.types";
import { choisir, entier, melanger, rat, val } from "../../moteur5e/trigExact";
import { calculParametres, resultat } from "../../moteur5e/modeleDetectiveTrig";
import { egauxModulo } from "../../moteur5e/saisieTrig";

/**
 * Générateur de 5gen50 « Détective d'erreurs : trigonométrie ». Tout le hasard passe par
 * `Math.random` : `genererAvecCode` le remplace par une graine (QR code d'une feuille → même
 * exercice, même ordre des descriptions).
 *
 * Variante = exercice support. Le TYPE D'ERREUR (donc la ligne fausse) est tiré uniformément AVANT
 * les nombres : c'est le verdict des écrans 1 et 2, jamais fixé par `forme`.
 * - secteur (§ 1) : π perdu (ligne 1) | ½ oublié (ligne 2) | degrés dans la formule (ligne 3) ;
 * - parametres (§ 4) : T = π/ω (ligne 1) | Φ = φ (ligne 2) | ordre des extremums (ligne 3) ;
 * - equation (§ 7) : mauvaise table (ligne 1) | seconde famille oubliée ou fausse (ligne 2) |
 *   2kπ non divisé (ligne 3) ;
 * - produit (§ 7) : période 2π de tan (ligne 2) | cos x = 0 ⟺ x = kπ (ligne 3) | valeur interdite
 *   gardée (ligne 4).
 * Garantie (contrôlée par tirages massifs) : l'erreur se VOIT, le résultat de la copie diffère du
 * bon résultat.
 */

function tirerSecteur(type: ErreurSecteur): DonneesDetectiveTrig {
  return { variante: "secteur", type, r: entier(2, 12), d: choisir([30, 40, 45, 60, 72, 90, 120, 135, 150]) };
}

const OMEGAS = [rat(2), rat(3), rat(4), rat(1, 2)];
const PHIS = [1, 2, 3, 4, 6, 8, 9, 10].flatMap((k) => [rat(k, 12), rat(-k, 12)]).concat([rat(1)]);

function tirerParametres(type: ErreurParametres): DonneesDetectiveTrig {
  for (;;) {
    const e: ExerciceParametres = {
      variante: "parametres",
      type,
      A: choisir([1, 2, 3, 4]) * (Math.random() < 0.5 ? -1 : 1),
      omega: choisir(OMEGAS),
      phi: choisir(PHIS),
      b: entier(-3, 3),
    };
    const juste = calculParametres(e, false);
    const copie = calculParametres(e, true);
    const T = val(juste.T) * Math.PI;
    if (egauxModulo(val(copie.xMax) * Math.PI, val(juste.xMax) * Math.PI, T)) continue;
    return e;
  }
}

function tirerEquation(type: ErreurEquation): DonneesDetectiveTrig {
  for (;;) {
    const c = entier(0, 5);
    // c = √2/2 : arcsin c = arccos c = π/4, l'erreur de table ne se verrait pas.
    if (type === "angleConfondu" && c === 1) continue;
    return { variante: "equation", type, fonction: Math.random() < 0.5 ? "sin" : "cos", c };
  }
}

function tirerProduit(type: ErreurProduit): DonneesDetectiveTrig {
  return { variante: "produit", type, c: entier(0, 5) };
}

/** Leurres de l'écran 2 : toujours FAUX pour la ligne visée. */
export const LEURRES: Record<TypeErreurTrig, LeurreTrig[]> = {
  piOublie: ["conversionInverse", "convertirInutile", "diviser360"],
  demi: ["rayonNonCarre", "formuleArc", "formuleDisque"],
  degres: ["carreDouble", "fractionTour", "demiEnTrop"],
  periode: ["periodeOmega", "periodeProduit", "periodeInverse"],
  phiPourPhi: ["phiSansSigne", "phiFoisOmega", "phiSurT"],
  ordre: ["ordreB", "ordreOmega", "maxEnPhi"],
  angleConfondu: ["alphaDegres", "alphaOppose", "alphaMoitie"],
  familleOubliee: ["uneFamilleSuffit", "familleKpi", "familleAlphaPlusPi"],
  familleFausse: ["famillePeriodePi", "famillePiSurDeux", "familleAlphaPlusPi"],
  periodeNonDivisee: ["periodeMultipliee", "alphaNonDivise", "periodeQuart"],
  periodeTan: ["tanDeuxFamilles", "tanPiSurDeux", "tanArccos"],
  cosZero: ["cosZeroDeuxKpi", "cosZeroAucune", "cosZeroKpiSur2"],
  valeurInterdite: ["produitDeuxNuls", "rejeterTan", "rejeterKpi"],
};

function avecOptions(d: DonneesDetectiveTrig): ExerciceDetectiveTrig {
  const options: IdDescriptionTrig[] = melanger([d.type, ...LEURRES[d.type]]);
  return { ...d, options };
}

export const CATALOGUE_VARIANTES: { id: VarianteDetectiveTrig; label: string }[] = [
  { id: "secteur", label: "Aire d'un secteur (conversion en radians)" },
  { id: "parametres", label: "Abscisse d'un maximum d'une sinusoïde" },
  { id: "equation", label: "Équation sin(2x) = c ou cos(2x) = c" },
  { id: "produit", label: "Produit nul avec une tangente" },
];

export function genererDetectiveTrig(variante: VarianteDetectiveTrig): ExerciceDetectiveTrig {
  switch (variante) {
    case "secteur":
      return avecOptions(tirerSecteur(choisir(["piOublie", "demi", "degres"] as const)));
    case "parametres":
      return avecOptions(tirerParametres(choisir(["periode", "phiPourPhi", "ordre"] as const)));
    case "equation":
      return avecOptions(tirerEquation(choisir(["angleConfondu", "familleOubliee", "familleFausse", "periodeNonDivisee"] as const)));
    case "produit":
      return avecOptions(tirerProduit(choisir(["periodeTan", "cosZero", "valeurInterdite"] as const)));
  }
}

export function construireAvecVariante(id: string): ExerciceDetectiveTrig {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceDetectiveTrig();
  return genererDetectiveTrig(id as VarianteDetectiveTrig);
}

export function genererExerciceDetectiveTrig(): ExerciceDetectiveTrig {
  return genererDetectiveTrig(choisir(CATALOGUE_VARIANTES).id);
}

/** Contrôle (tests) : le résultat de la copie diffère-t-il du bon résultat ? */
export function erreurVisible(e: DonneesDetectiveTrig): boolean {
  return JSON.stringify(resultat(e, true)) !== JSON.stringify(resultat(e, false));
}
