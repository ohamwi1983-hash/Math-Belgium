import type { ExerciceEsperanceC, IssueJeuC, StatutJeuC } from "../../core6e/variablesDiscretesEsperance.types";
import { genererPoids, pgcd, tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Jeu équitable, espérance nulle") de `6gen49`. 2
 * sous-types équiprobables — "vérifier" (2 écrans) : gain net = gain brut, calculer E et
 * qualifier le jeu ; "imposer" (3 écrans) : gain net = gain brut − m (mise inconnue), trouver `m`
 * pour E=0.
 *
 * `esperanceBrute` = Σpᵢ·gainBrutᵢ, calculée UNE SEULE FOIS et réutilisée pour les 2 sous-types :
 * pour "vérifier", E = `esperanceBrute` (aucun `m`) ; pour "imposer", le gain net devient
 * `gainBrutᵢ−m`, donc E(m) = Σpᵢ·(gainBrutᵢ−m) = `esperanceBrute` − m·Σpᵢ = `esperanceBrute` − m
 * (Σpᵢ=1 par construction) — LINÉAIRE, résolue exactement par `m=esperanceBrute` (`mSolution`).
 * `statutJeu` (favorable/défavorable/équitable) reste calculé pour LES DEUX sous-types (jamais
 * consommé par "imposer" côté écran, mais utile pour l'aide/le récap si besoin futur) — seuil
 * `TOLERANCE_ESPERANCE` recopié de `moteur6e/verificationVariablesDiscretesEsperance.ts` NE SERAIT
 * PAS correct ici (Couche A n'importe jamais `moteur6e/`) : seuil dédié, volontairement TRÈS fin
 * (`1e-9`) car `statutJeu` n'est jamais comparé directement à une saisie élève (aucun champ ne le
 * demande, voir mission) — sert seulement d'INDICATION pour une aide textuelle future, la
 * précision n'a donc aucune conséquence sur la notation.
 */

const SEUIL_STATUT_JEU = 1e-9;

function statutDepuisEsperance(e: number): StatutJeuC {
  if (e > SEUIL_STATUT_JEU) return "favorable";
  if (e < -SEUIL_STATUT_JEU) return "defavorable";
  return "equitable";
}

interface GabaritIssueC {
  label: string;
  gainBrut: number;
}

interface GabaritContexteC {
  phraseContexte: string[];
  issues: GabaritIssueC[];
}

function gabaritsContexteC(): GabaritContexteC[] {
  const gainPile = tirerEntier(4, 10);
  const gainRoue = tirerEntier(6, 14);
  const gainCarte = tirerEntier(5, 12);
  return [
    {
      phraseContexte: ["\\text{Un jeu : on lance une pièce truquée à 3 issues.}", "\\text{Chaque issue rapporte (ou coûte) un gain fixe.}"],
      issues: [
        { label: "Pile", gainBrut: gainPile },
        { label: "Face", gainBrut: -tirerEntier(2, 6) },
        { label: "Tranche", gainBrut: 0 },
      ],
    },
    {
      phraseContexte: ["\\text{Un jeu de roue de la fortune à 3 secteurs.}", "\\text{Chaque secteur rapporte (ou coûte) un gain fixe.}"],
      issues: [
        { label: "Secteur A", gainBrut: gainRoue },
        { label: "Secteur B", gainBrut: -tirerEntier(3, 8) },
        { label: "Secteur C", gainBrut: -tirerEntier(1, 4) },
      ],
    },
    {
      phraseContexte: ["\\text{Un jeu de cartes à 4 issues possibles.}", "\\text{Chaque issue rapporte (ou coûte) un gain fixe.}"],
      issues: [
        { label: "As tiré", gainBrut: gainCarte },
        { label: "Figure tirée", gainBrut: tirerEntier(1, 4) },
        { label: "Carte numérotée", gainBrut: -tirerEntier(1, 3) },
        { label: "Joker tiré", gainBrut: -tirerEntier(4, 9) },
      ],
    },
  ];
}

const DENOMINATEUR_POIDS_C = 20;

function construireIssues(): { phraseContexte: string[]; issues: IssueJeuC[] } {
  const gabarit = tirerParmi(gabaritsContexteC());
  const m = gabarit.issues.length;
  const poids = genererPoids(m, DENOMINATEUR_POIDS_C);
  const issues: IssueJeuC[] = gabarit.issues.map((g, i) => {
    const d = pgcd(poids[i], DENOMINATEUR_POIDS_C);
    return { label: g.label, gainBrut: g.gainBrut, probabiliteNumerateur: poids[i] / d, probabiliteDenominateur: DENOMINATEUR_POIDS_C / d, probabilite: poids[i] / DENOMINATEUR_POIDS_C };
  });
  return { phraseContexte: gabarit.phraseContexte, issues };
}

function construireAvecSousType(sousType: "verifier" | "imposer"): ExerciceEsperanceC {
  const { phraseContexte, issues } = construireIssues();
  const esperanceBrute = issues.reduce((acc, issue) => acc + issue.gainBrut * issue.probabilite, 0);
  const statutJeu = statutDepuisEsperance(esperanceBrute);
  return { famille: "C", sousType, phraseContexte, issues, esperanceBrute, statutJeu, mSolution: esperanceBrute };
}

export function construireVerifier(): ExerciceEsperanceC {
  return construireAvecSousType("verifier");
}
export function construireImposer(): ExerciceEsperanceC {
  return construireAvecSousType("imposer");
}

export function construireFamilleC(): ExerciceEsperanceC {
  return tirerEntier(0, 1) === 0 ? construireVerifier() : construireImposer();
}
