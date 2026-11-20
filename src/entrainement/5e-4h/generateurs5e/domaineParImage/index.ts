import type { CasDomaineParImage, ExerciceDomaineParImage, Exterieure, FamilleExterieure, FamilleInterieure, Interieure, VarianteDomaineParImage } from "../../core5e/domaineParImage";
import { aPointIsole, contient, egalEns, intersection, normaliser, val } from "../../moteur5e/ensembleSaisi";
import type { Ensemble } from "../../moteur5e/ensembleSaisi";
import { domaineExterieure, domaineInterieure, imageInterieure, PasRationnel, preimage } from "./calcul";

export type IdVarianteDomaineParImage = VarianteDomaineParImage;

/**
 * Couche A — générateur de `5gen62` « Domaine d'une composée par l'image ». `Math.random()` seul
 * (le `?code=` rejoue le tirage). Le CAS est tiré d'abord : domaine vide 10 % (cas particulier,
 * décision de l'utilisateur ; jamais filtré), Im g ⊂ dom f 25 %, sinon intersection partielle ; puis
 * les paramètres sont tirés jusqu'à tomber dans ce cas. Une famille intérieure qui ne peut pas
 * donner le cas (affine ou inverse : jamais vide) est remplacée par l'autre de sa variante.
 * Contraintes : aucun point isolé (ni dans Im g ∩ dom f ni dans le domaine), bornes rationnelles de
 * dénominateur ≤ 6 et de valeur absolue ≤ 30 (racines prises de carrés parfaits seulement).
 */

const ent = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

export const PART_VIDE = 0.1;
export const PART_INCLUS = 0.25;

const FAMILLES: Record<VarianteDomaineParImage, FamilleInterieure[]> = {
  carre: ["carre", "oppCarre"],
  absolueAffine: ["absolue", "affine"],
  racineInverse: ["racine", "inverse"],
};
const EXTERIEURES: FamilleExterieure[] = ["racine", "racineMoins", "inverse", "inverseRacine", "inverseRacineMoins"];

function tirerInterieure(famille: FamilleInterieure): Interieure {
  switch (famille) {
    case "carre":
    case "oppCarre":
      return { famille, k: ent(-4, 4), m: 1 };
    case "absolue":
    case "racine":
      return { famille, k: ent(-3, 3), m: 1 };
    case "affine": {
      const m = parmi([-3, -2, -1, 1, 2, 3]);
      return { famille, k: ent(-5, 5), m };
    }
    case "inverse":
      return { famille, k: ent(-2, 2), m: 1 };
  }
}

function bornesLisibles(e: Ensemble): boolean {
  return e.every((i) => [i.g, i.d].every((b) => b.inf !== 0 || (b.q.d <= 6 && Math.abs(val(b)) <= 30)));
}

function casDe(imG: Ensemble, valeurs: Ensemble): CasDomaineParImage {
  if (valeurs.length === 0) return "vide";
  return egalEns(valeurs, imG) ? "inclus" : "partiel";
}

/** Un entier de dom(f∘g) (vérification du corrigé), de préférence petit et non nul. */
function xTest(domaine: Ensemble, racine: boolean): number | null {
  for (const x of racine ? [1, 4, 9, 16, 25, 0] : [1, 2, -1, -2, 3, -3, 4, -4, 5, -5, 6, -6, 8, 9, 10, 16, 0]) if (contient(domaine, x)) return x;
  return null;
}

function tenter(variante: VarianteDomaineParImage, cas: CasDomaineParImage): ExerciceDomaineParImage | null {
  const familles = FAMILLES[variante].filter((fam) => !(cas === "vide" && (fam === "affine" || fam === "inverse")));
  const g = tirerInterieure(parmi(familles));
  const f: Exterieure = { famille: parmi(EXTERIEURES), c: ent(-6, 6) };
  try {
    const domG = domaineInterieure(g);
    const imG = imageInterieure(g);
    const domF = domaineExterieure(f);
    const valeurs = intersection(imG, domF);
    if (casDe(imG, valeurs) !== cas) return null;
    if (aPointIsole(valeurs)) return null;
    const domaine = normaliser(preimage(g, valeurs));
    if (cas !== "vide" && domaine.length === 0) return null;
    if (aPointIsole(domaine) || !bornesLisibles(domaine)) return null;
    const xt = xTest(domaine, g.famille === "racine");
    if (cas !== "vide" && xt === null) return null;
    return { variante, g, f, domG, imG, domF, valeurs, domaine, cas, xTest: xt, cleCollecteur: `${variante}/${g.famille}-${f.famille}/${cas}` };
  } catch (err) {
    if (err instanceof PasRationnel) return null;
    throw err;
  }
}

function construire(variante: VarianteDomaineParImage, casImpose?: CasDomaineParImage): ExerciceDomaineParImage {
  const r = Math.random();
  const cas: CasDomaineParImage = casImpose ?? (r < PART_VIDE ? "vide" : r < PART_VIDE + PART_INCLUS ? "inclus" : "partiel");
  for (let essai = 0; ; essai++) {
    const e = tenter(variante, essai < 4000 ? cas : "partiel");
    if (e) return e;
  }
}

export const CATALOGUE_VARIANTES: { id: IdVarianteDomaineParImage; label: string }[] = [
  { id: "carre", label: "Carré ou opposé du carré à l'intérieur" },
  { id: "absolueAffine", label: "Valeur absolue ou affine à l'intérieur" },
  { id: "racineInverse", label: "Racine ou inverse à l'intérieur" },
];

export function construireAvecVarianteId(id: IdVarianteDomaineParImage): ExerciceDomaineParImage {
  return construire(id);
}

/** Pour les mesures : forcer le cas. */
export function construireAvecCas(id: IdVarianteDomaineParImage, cas: CasDomaineParImage): ExerciceDomaineParImage {
  return construire(id, cas);
}

export function genererExerciceDomaineParImage(): ExerciceDomaineParImage {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
