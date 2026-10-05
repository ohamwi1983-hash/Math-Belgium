/**
 * Couche A — "Inégalité de Bienaymé-Tchebychev" (chapitre 5) — refonte complète, 8 variantes.
 *
 * **Méthode "cascade de valeurs déjà arrondies", jamais de pool de valeurs "propres"** (voir
 * `core/bienaymeTchebychev.types.ts` pour la justification complète) : chaque champ "Attendu" est
 * calculé via la MÊME formule que l'élève applique, à partir du champ "Attendu" déjà confirmé de
 * l'écran précédent (ou d'une donnée brute de génération) — jamais recalculé depuis une valeur
 * "cible" cachée qu'il faudrait faire coïncider après coup. Ceci garantit par construction que la
 * cible finale est toujours auto-cohérente, quelle que soit l'irrationalité de k.
 */
import { randomInt } from "./aleatoire";
import { CONTEXTES } from "./contextes";
import { arrondi2, arrondiUnite, arrondiVersLeBas, arrondiVersLeHaut } from "./arrondis";
import type {
  ContexteBienaymeTchebychev,
  ExerciceBienaymeTchebychev,
  ExerciceBienaymeTchebychevIntervalleVersNombre,
  ExerciceBienaymeTchebychevIntervalleVersPourcent,
  ExerciceBienaymeTchebychevIntervalleVersSigma,
  ExerciceBienaymeTchebychevIntervalleVersXBar,
  ExerciceBienaymeTchebychevNombreVersIntervalle,
  ExerciceBienaymeTchebychevNombreVersSigma,
  ExerciceBienaymeTchebychevNombreVersXBar,
  ExerciceBienaymeTchebychevPourcentVersIntervalle,
  GenerateurExerciceBienaymeTchebychev,
  VarianteBienaymeTchebychev,
} from "../../core/bienaymeTchebychev.types";

function tirerContexte(): ContexteBienaymeTchebychev {
  return CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
}

function tirerXBar(contexte: ContexteBienaymeTchebychev): number {
  return randomInt(contexte.plageXBar[0], contexte.plageXBar[1]);
}

function tirerSigma(contexte: ContexteBienaymeTchebychev): number {
  return randomInt(contexte.plageSigma[0], contexte.plageSigma[1]);
}

/** Demi-largeur d'intervalle plausible — toujours strictement `> sigma` (garantit k > 1), tirée
 * comme un multiple non trivial de σ (entre 1,30 et 4,00 fois σ, arrondi à l'entier le plus
 * proche). */
function tirerDemiLargeur(sigma: number): number {
  const kCibleBrut = randomInt(130, 400) / 100;
  return Math.max(sigma + 1, Math.round(sigma * kCibleBrut));
}

const POURCENT_DONNE_MIN = 25;
const POURCENT_DONNE_MAX = 96;

/** Pourcentage minimal cible donné directement en énoncé (V2/V5/V6) ou servant à construire un
 * nombre minimal d'individus plausible (V4/V7/V8) — n'a besoin d'aucune propriété arithmétique
 * particulière, contrairement à la première version : c'est une simple DONNÉE, jamais une réponse
 * à faire tomber "juste". */
function tirerPourcentDonne(): number {
  return randomInt(POURCENT_DONNE_MIN, POURCENT_DONNE_MAX);
}

function kDepuisPourcent(pourcent: number): number {
  return Math.sqrt(100 / (100 - pourcent));
}

const N_MIN = 60;
const N_MAX = 400;

function tirerN(): number {
  return randomInt(N_MIN, N_MAX);
}

/** Nombre minimal d'individus donné directement en énoncé (V4/V7/V8) — dérivé d'un pourcentage
 * "brut" plausible, jamais lui-même une réponse à retrouver exactement (seul le pourcentage
 * RECALCULÉ à partir de ce nombre entier, à l'écran 0, devient la cible officielle). */
function tirerNombreMinDonne(n: number): number {
  const pourcentBrut = tirerPourcentDonne();
  return Math.min(n - 1, Math.max(1, Math.round((n * pourcentBrut) / 100)));
}

export const CATALOGUE_VARIANTES: { id: VarianteBienaymeTchebychev; label: string }[] = [
  { id: "intervalleVersPourcent", label: "Intervalle donné → pourcentage minimal" },
  { id: "pourcentVersIntervalle", label: "Pourcentage minimal donné → intervalle" },
  { id: "intervalleVersNombre", label: "Intervalle donné → nombre minimal d'individus" },
  { id: "nombreVersIntervalle", label: "Nombre minimal donné → intervalle" },
  { id: "intervalleVersSigma", label: "Intervalle + % minimal donnés → trouver σ" },
  { id: "intervalleVersXBar", label: "Intervalle + % minimal donnés → trouver x̄" },
  { id: "nombreVersSigma", label: "Intervalle + n + nombre minimal donnés → trouver σ" },
  { id: "nombreVersXBar", label: "Intervalle + n + nombre minimal donnés → trouver x̄" },
];

export function construireIntervalleVersPourcent(): ExerciceBienaymeTchebychevIntervalleVersPourcent {
  const contexte = tirerContexte();
  const xBar = tirerXBar(contexte);
  const sigma = tirerSigma(contexte);
  const d = tirerDemiLargeur(sigma);
  const borneInf = xBar - d;
  const borneSup = xBar + d;
  const kAttendu = arrondi2(d / sigma);
  const pourcentExact = 100 * (1 - 1 / (kAttendu * kAttendu));
  const pourcentAttendu = arrondiVersLeBas(pourcentExact);
  return { variante: "intervalleVersPourcent", contexte, xBar, sigma, borneInf, borneSup, kAttendu, pourcentAttendu };
}

export function construirePourcentVersIntervalle(): ExerciceBienaymeTchebychevPourcentVersIntervalle {
  const contexte = tirerContexte();
  const xBar = tirerXBar(contexte);
  const sigma = tirerSigma(contexte);
  const pourcentDonne = tirerPourcentDonne();
  const kAttendu = arrondi2(kDepuisPourcent(pourcentDonne));
  const borneInfAttendue = arrondiVersLeBas(xBar - kAttendu * sigma);
  const borneSupAttendue = arrondiVersLeHaut(xBar + kAttendu * sigma);
  return { variante: "pourcentVersIntervalle", contexte, xBar, sigma, pourcentDonne, kAttendu, borneInfAttendue, borneSupAttendue };
}

export function construireIntervalleVersNombre(): ExerciceBienaymeTchebychevIntervalleVersNombre {
  const contexte = tirerContexte();
  const xBar = tirerXBar(contexte);
  const sigma = tirerSigma(contexte);
  const d = tirerDemiLargeur(sigma);
  const borneInf = xBar - d;
  const borneSup = xBar + d;
  const n = tirerN();
  const kAttendu = arrondi2(d / sigma);
  const pourcentAttendu = arrondi2(100 * (1 - 1 / (kAttendu * kAttendu)));
  const nMinAttendu = arrondiVersLeBas((pourcentAttendu / 100) * n);
  return { variante: "intervalleVersNombre", contexte, xBar, sigma, borneInf, borneSup, n, kAttendu, pourcentAttendu, nMinAttendu };
}

export function construireNombreVersIntervalle(): ExerciceBienaymeTchebychevNombreVersIntervalle {
  const contexte = tirerContexte();
  const xBar = tirerXBar(contexte);
  const sigma = tirerSigma(contexte);
  const n = tirerN();
  const nombreMinDonne = tirerNombreMinDonne(n);
  const pourcentAttendu0 = arrondi2((100 * nombreMinDonne) / n);
  const kAttendu = arrondi2(kDepuisPourcent(pourcentAttendu0));
  const borneInfAttendue = arrondiVersLeBas(xBar - kAttendu * sigma);
  const borneSupAttendue = arrondiVersLeHaut(xBar + kAttendu * sigma);
  return { variante: "nombreVersIntervalle", contexte, xBar, sigma, n, nombreMinDonne, pourcentAttendu0, kAttendu, borneInfAttendue, borneSupAttendue };
}

export function construireIntervalleVersSigma(): ExerciceBienaymeTchebychevIntervalleVersSigma {
  const contexte = tirerContexte();
  const xBar = tirerXBar(contexte);
  const pourcentDonne = tirerPourcentDonne();
  const kAttendu = arrondi2(kDepuisPourcent(pourcentDonne));
  const sigmaCible = tirerSigma(contexte);
  const d = Math.round(kAttendu * sigmaCible);
  const borneInf = xBar - d;
  const borneSup = xBar + d;
  const sigmaAttendu = arrondiUnite((borneSup - xBar) / kAttendu);
  return { variante: "intervalleVersSigma", contexte, xBar, pourcentDonne, borneInf, borneSup, kAttendu, sigmaAttendu };
}

export function construireIntervalleVersXBar(): ExerciceBienaymeTchebychevIntervalleVersXBar {
  const contexte = tirerContexte();
  const sigma = tirerSigma(contexte);
  const pourcentDonne = tirerPourcentDonne();
  const kAttendu = arrondi2(kDepuisPourcent(pourcentDonne));
  const xBarCible = tirerXBar(contexte);
  const d = Math.round(kAttendu * sigma);
  const borneInf = xBarCible - d;
  const borneSup = xBarCible + d;
  const xBarAttendu = arrondiUnite(borneSup - kAttendu * sigma);
  return { variante: "intervalleVersXBar", contexte, sigma, pourcentDonne, borneInf, borneSup, kAttendu, xBarAttendu };
}

export function construireNombreVersSigma(): ExerciceBienaymeTchebychevNombreVersSigma {
  const contexte = tirerContexte();
  const xBar = tirerXBar(contexte);
  const n = tirerN();
  const nombreMinDonne = tirerNombreMinDonne(n);
  const pourcentAttendu0 = arrondi2((100 * nombreMinDonne) / n);
  const kAttendu = arrondi2(kDepuisPourcent(pourcentAttendu0));
  const sigmaCible = tirerSigma(contexte);
  const d = Math.round(kAttendu * sigmaCible);
  const borneInf = xBar - d;
  const borneSup = xBar + d;
  const sigmaAttendu = arrondiUnite((borneSup - xBar) / kAttendu);
  return { variante: "nombreVersSigma", contexte, xBar, n, nombreMinDonne, borneInf, borneSup, pourcentAttendu0, kAttendu, sigmaAttendu };
}

export function construireNombreVersXBar(): ExerciceBienaymeTchebychevNombreVersXBar {
  const contexte = tirerContexte();
  const sigma = tirerSigma(contexte);
  const n = tirerN();
  const nombreMinDonne = tirerNombreMinDonne(n);
  const pourcentAttendu0 = arrondi2((100 * nombreMinDonne) / n);
  const kAttendu = arrondi2(kDepuisPourcent(pourcentAttendu0));
  const xBarCible = tirerXBar(contexte);
  const d = Math.round(kAttendu * sigma);
  const borneInf = xBarCible - d;
  const borneSup = xBarCible + d;
  const xBarAttendu = arrondiUnite(borneSup - kAttendu * sigma);
  return { variante: "nombreVersXBar", contexte, sigma, n, nombreMinDonne, borneInf, borneSup, pourcentAttendu0, kAttendu, xBarAttendu };
}

export function construireAvecVarianteId(varianteId: VarianteBienaymeTchebychev): ExerciceBienaymeTchebychev {
  switch (varianteId) {
    case "intervalleVersPourcent":
      return construireIntervalleVersPourcent();
    case "pourcentVersIntervalle":
      return construirePourcentVersIntervalle();
    case "intervalleVersNombre":
      return construireIntervalleVersNombre();
    case "nombreVersIntervalle":
      return construireNombreVersIntervalle();
    case "intervalleVersSigma":
      return construireIntervalleVersSigma();
    case "intervalleVersXBar":
      return construireIntervalleVersXBar();
    case "nombreVersSigma":
      return construireNombreVersSigma();
    case "nombreVersXBar":
      return construireNombreVersXBar();
  }
}

export const genererExerciceBienaymeTchebychev: GenerateurExerciceBienaymeTchebychev = () => {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
};
