import type { ExerciceInjectiviteFonctions } from "../../../core6e/injectiviteFonctions.types";
import { ensemblePrivePoints, ensembleReel, ensembleUnMorceau, versLeBasJusque, versLeHautDepuis } from "../../ensembleReel";
import { tirerEntierNonNul, tirerParmi } from "../aleatoire";
import { construireOptionsCombobox } from "../distracteurs";
import { formatRacineNiemeLatex } from "../formatFLatex";
import { racineReelle } from "../racineReelle";

/**
 * Famille b) f(x) = (ax+b)^(1/n) — TOUJOURS injective sur son domaine, quel que soit n (racine
 * réelle n-ième composée avec une affine : strictement monotone sur son domaine, jamais de pivot,
 * jamais de sous-question à l'écran 2 — voir en-tête de `core6e/injectiviteFonctions.types.ts`).
 *
 * - n impair (n>0) : domaine=ℝ, image=ℝ.
 * - n pair : domaine={x | ax+b≥0}, image=[0;+∞[.
 * - n<0 (impair ou pair) : exclure EN PLUS le pôle où ax+b=0 (spec explicite).
 *
 * Réciproque : y=(ax+b)^(1/n) ⟹ ax+b=y^n (n entier, `Math.pow` gère nativement une base négative
 * pour un exposant entier, qu'il soit pair ou impair, positif ou négatif — aucun besoin de
 * `racineReelle` ici, seulement pour la fonction directe qui doit calculer une racine n-ième).
 */
const CANDIDATS_N = [-4, -3, -2, 2, 3, 4] as const;

export function construireRacineNieme(): ExerciceInjectiviteFonctions {
  const a = tirerEntierNonNul(-5, 5);
  const b = tirerEntierNonNul(-5, 5);
  const n = tirerParmi(CANDIDATS_N);
  const pivot = -b / a; // borne (n pair) et/ou pôle (n<0)
  const pair = n % 2 === 0;
  const parametres = { famille: "racineNieme" as const, a, b, n };
  const fLatex = `f(x) = ${formatRacineNiemeLatex(a, b, n)}`;
  const fReference = (x: number) => racineReelle(a * x + b, n);
  const fInverse = (y: number) => (Math.pow(y, n) - b) / a;

  let domaine;
  let image;
  if (!pair && n > 0) {
    domaine = ensembleReel();
    image = ensembleReel();
  } else if (!pair && n < 0) {
    domaine = ensemblePrivePoints([pivot]);
    image = ensemblePrivePoints([0]);
  } else if (pair && n > 0) {
    domaine = a > 0 ? ensembleUnMorceau(versLeHautDepuis(pivot, true)) : ensembleUnMorceau(versLeBasJusque(pivot, true));
    image = ensembleUnMorceau(versLeHautDepuis(0, true));
  } else {
    // pair, n<0 : ax+b>0 strictement (image exclut 0).
    domaine = a > 0 ? ensembleUnMorceau(versLeHautDepuis(pivot, false)) : ensembleUnMorceau(versLeBasJusque(pivot, false));
    image = ensembleUnMorceau(versLeHautDepuis(0, false));
  }

  return {
    parametres,
    fLatex,
    domaine,
    injective: true,
    pivot: null,
    intervalleGauche: domaine,
    intervalleDroite: domaine,
    image,
    fReference,
    fInverseGauche: fInverse,
    fInverseDroite: fInverse,
    optionsX: construireOptionsCombobox([domaine]),
    optionsY: construireOptionsCombobox([image]),
  };
}
