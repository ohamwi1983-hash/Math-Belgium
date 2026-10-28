import { useState } from "react";
import type { ReactNode } from "react";
import type { Categorie, Exercice } from "./core/generateur.types";
import type { ExerciceEquationRationnelle } from "./core/equationRationnelle.types";
import type { ExerciceSimplification, PolynomeLineaire } from "./core/simplification.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideCe,
  activerAideChamp1,
  activerAideChamp2,
  activerAideRacinesEtrangeres,
  activerAideIsolement,
  activerAideSimplifierChamp1,
  activerAideSimplifierChamp2,
  activerAideSimplifierFactorisation,
  activerAideSimplifierFraction,
  activerAideSimplifierReduction,
  demarrerSessionEquationRationnelle,
  soumettreChoixCategorie,
  soumettreChoixSimplifierCategorie,
  soumettreReponseCE,
  soumettreReponseChamp1,
  soumettreReponseChamp2,
  soumettreReponseIsolement,
  soumettreReponseRacinesEtrangeres,
  soumettreReponseSimplifier,
  soumettreReponseSimplifierChamp1,
  soumettreReponseSimplifierChamp2,
  soumettreReponseSimplifierFactorisation,
  soumettreReponseSimplifierFraction,
  soumettreReponseSimplifierReduction,
} from "./moteur/sessionEquationRationnelle";
import type { EtatSessionEquationRationnelle, PhaseEquationRationnelle } from "./moteur/typesEquationRationnelle";
import { diagnostiquerChampPrincipal, diagnostiquerFactorisationCasGeneral, diagnostiquerIsolement } from "./moteur/verification";
import { diagnostiquerFractionSimplifiee, diagnostiquerSimplifierToutes, racinesDistinctes } from "./moteur/verificationEquationRationnelle";
import { diagnostiquerMiseEnEvidenceFraction } from "./moteur/verificationSimplification";
import {
  CATALOGUE_VARIANTES,
  construireAvecVarianteId,
  genererExerciceEquationRationnelle,
  type VarianteEquationRationnelleId,
} from "./generateurs/equationRationnelle";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { EtapeCEDirecte } from "./components/EtapeCEDirecte";
import { EtapeRacinesFlexibles } from "./components/EtapeRacinesFlexibles";
import { EtapeSimplifierFractions } from "./components/EtapeSimplifierFractions";
import { EtapeSimplification } from "./components/EtapeSimplification";
import { EtapeReductionCoefficients } from "./components/EtapeReductionCoefficients";
import { EtapeIsolement } from "./components/EtapeIsolement";
import { EtapeReconnaissance } from "./components/EtapeReconnaissance";
import { EtapeChamp1 } from "./components/EtapeChamp1";
import { EtapeRacinesEtrangeres } from "./components/EtapeRacinesEtrangeres";
import { calculerRecapitulatifEquationRationnelle } from "./ui/recapitulatifEquationRationnelle";
import {
  formatEquationRationnelleLatex,
  formatEquationRationnelleLatexApresSimplification,
  formatFractionReduiteOuConstante,
  formatRappelEquationRationnelle,
} from "./ui/formatEquationRationnelle";
import { formatEquationDenominateur, formatEquationNumerateur, formatFractionSimplifiee } from "./ui/formatSimplification";
import { libelleCategorie } from "./ui/categorieLabels";
import {
  estSolutionUnique,
  formatEnonceLatex,
  formatFormeFactoriseeDepuisRacines,
  formatMembreGauche,
  formatTermesZerosAttendusLatex,
} from "./ui/formatEquation";
import { enonceSimplifie, facteurCommun } from "./moteur/simplificationEquation";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Résous cette équation rationnelle.";

const QUESTION_FACTORISATION = "Quelle est la méthode la plus rapide pour résoudre cette équation ?";
const QUESTION_FACTORISATION_FRACTION = "Quelle est la méthode la plus rapide pour factoriser ce polynôme ?";
const LABEL_FACTORISATION_FRACTION = "Factorise le polynôme";
const QUESTION_CE = "Quelle est la condition d'existence ?";

function estPolynomeLineaire(poly: Exercice | PolynomeLineaire): poly is PolynomeLineaire {
  return "k" in poly;
}

/** Le P2 embarqué dans fractionGauche (numérateur pour "P2/P1" — cas 4a, dénominateur pour "P1/P2" — cas 4b). */
function p2DeFractionGauche(exercice: ExerciceEquationRationnelle): Exercice {
  const fractionGauche = exercice.fractionGauche;
  if (!fractionGauche) throw new Error("p2DeFractionGauche : cet exercice n'a pas de fractionGauche");
  return estPolynomeLineaire(fractionGauche.numerateur) ? (fractionGauche.denominateur as Exercice) : (fractionGauche.numerateur as Exercice);
}

/** "N(x) = ..." pour le cas 4a (P2 numérateur), "D(x) = ..." pour le cas 4b (P2 dénominateur). */
function expressionP2(exercice: ExerciceEquationRationnelle): string {
  const p2 = p2DeFractionGauche(exercice);
  return exercice.fractionGauche?.type === "P2/P1" ? formatEquationNumerateur(p2) : formatEquationDenominateur(p2);
}

/** "k(...)" — mise en évidence confirmée pour le P2 de `fractionGauche` (cas 4a/4b), jamais divisée
 * par k (voir moteur/verificationSimplification.ts) — même formule que
 * `ui/recapitulatifEquationRationnelle.ts::formatMiseEnEvidence`, dupliquée ici car cette fonction
 * n'est pas exportée. */
function formatMiseEnEvidenceLatex(poly: Exercice): string {
  return `${facteurCommun(poly.enonce)}(${formatMembreGauche(enonceSimplifie(poly.enonce))})`;
}

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationRationnelle {
  return demarrerSessionEquationRationnelle(REGLAGES_DEMO, genererExerciceEquationRationnelle);
}

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence des phases du
 * générateur (type `PhaseEquationRationnelle` dans `moteur/typesEquationRationnelle.ts`, et les
 * branches de `releveRevelePhase`/`terminerEtape` ci-dessous). */
const ORDRE_PHASES: PhaseEquationRationnelle[] = [
  "ce",
  "simplifier",
  "simplifierReduction",
  "simplifierReconnaissance",
  "simplifierChamp1",
  "simplifierChamp2",
  "simplifierFactorisation",
  "simplifierFraction",
  "isolement",
  "reconnaissance",
  "champ1",
  "champ2",
  "racinesEtrangeres",
];

/** Même heuristique que `calculerRecapitulatifEquationRationnelle`
 * (`ui/recapitulatifEquationRationnelle.ts`) et que `releveRevelePhase` ci-dessus pour lire
 * `scoreXxxExercice`/`xxxRevele` — jamais une valeur recalculée séparément. `racinesEtrangeres`
 * (dernière phase) n'a pas de champ `scoreXxxExercice` persisté au niveau de la session (son score
 * n'existe que sur le dernier `resultats[...]`, voir `releveRevelePhase`) : tant qu'elle n'est pas
 * la phase courante elle est forcément "a-venir". */
function calculerSegmentsProgression(etat: EtatSessionEquationRationnelle): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score =
      phase === "ce"
        ? etat.scoreCEExercice
        : phase === "simplifier"
          ? etat.scoreSimplifierExercice
          : phase === "simplifierReduction"
            ? etat.scoreSimplifierReductionExercice
            : phase === "simplifierReconnaissance"
              ? etat.scoreSimplifierReconnaissanceExercice
              : phase === "simplifierChamp1"
                ? etat.scoreSimplifierChamp1Exercice
                : phase === "simplifierChamp2"
                  ? etat.scoreSimplifierChamp2Exercice
                  : phase === "simplifierFactorisation"
                    ? etat.scoreSimplifierFactorisationExercice
                    : phase === "simplifierFraction"
                      ? etat.scoreSimplifierFractionExercice
                      : phase === "isolement"
                        ? etat.scoreIsolementExercice
                        : phase === "reconnaissance"
                          ? etat.scoreReconnaissanceExercice
                          : phase === "champ1"
                            ? etat.scoreChampPrincipalExercice
                            : phase === "champ2"
                              ? etat.scoreRacinesExercice
                              : null;
    if (score === null) return "a-venir";
    const revele =
      phase === "ce"
        ? etat.ceRevele
        : phase === "simplifier"
          ? etat.simplifierRevele
          : phase === "simplifierReduction"
            ? etat.simplifierReductionRevele
            : phase === "simplifierReconnaissance"
              ? etat.simplifierCategorieRevelee
              : phase === "simplifierChamp1"
                ? etat.simplifierChamp1Revele
                : phase === "simplifierChamp2"
                  ? etat.simplifierChamp2Revele
                  : phase === "simplifierFactorisation"
                    ? etat.simplifierFactorisationRevele
                    : phase === "simplifierFraction"
                      ? etat.simplifierFractionRevele
                      : phase === "isolement"
                        ? etat.isolementRevele
                        : phase === "reconnaissance"
                          ? etat.categorieRevelee
                          : phase === "champ1"
                            ? etat.champPrincipalRevele
                            : etat.racinesRevele; // champ2
    if (revele) return "revele";
    return aideUtiliseePhase(etat, phase) ? "aide" : "correcte";
  });
}

/** Lit le flag `aideXxxUtilisee` correspondant à `phase`, jamais recalculé — "simplifier"/
 * "simplifierReconnaissance"/"reconnaissance"/"racinesEtrangeres" n'ont aucun mécanisme d'aide
 * (QCM sans aide, ou pas de bouton Aide dédié), toujours `false`. Ces flags sont remis à `false`
 * seulement à l'exercice suivant (jamais entre deux phases du même exercice, voir
 * `typesEquationRationnelle.ts`), donc toujours lisibles tels quels depuis une phase ultérieure. */
function aideUtiliseePhase(etat: EtatSessionEquationRationnelle, phase: PhaseEquationRationnelle): boolean {
  switch (phase) {
    case "ce":
      return etat.aideCeUtilisee;
    case "simplifierReduction":
      return etat.aideSimplifierReductionUtilisee;
    case "simplifierChamp1":
      return etat.aideSimplifierChamp1Utilisee;
    case "simplifierChamp2":
      return etat.aideSimplifierChamp2Utilisee;
    case "simplifierFactorisation":
      return etat.aideSimplifierFactorisationUtilisee;
    case "simplifierFraction":
      return etat.aideSimplifierFractionUtilisee;
    case "isolement":
      return etat.aideIsolementUtilisee;
    case "champ1":
      return etat.aideChamp1Utilisee;
    case "champ2":
      return etat.aideChamp2Utilisee;
    default:
      return false;
  }
}

/** Titre court d'une phase (fiche de consultation en lecture seule) — même libellé que
 * `calculerRecapitulatifEquationRationnelle` (`ui/recapitulatifEquationRationnelle.ts`) pour la
 * même phase, jamais un second vocabulaire. */
function titrePhase(etat: EtatSessionEquationRationnelle): string {
  const exercice = etat.exerciceCourant;
  switch (etat.phase) {
    case "ce":
      return exercice.ce.length === 1 ? "Condition d'existence (CE)" : "Conditions d'existence (CE)";
    case "simplifier":
      return exercice.fractionsSimplifiables.length === 1 ? "Fraction simplifiée" : "Fractions simplifiées";
    case "simplifierReduction":
      return "Mise en évidence (fraction)";
    case "simplifierReconnaissance":
      return "Méthode (fraction)";
    case "simplifierChamp1": {
      const p2 = p2DeFractionGauche(exercice);
      return p2.categorie === "cas_general" ? "Δ (fraction)" : "Forme factorisée (fraction)";
    }
    case "simplifierChamp2": {
      const p2 = p2DeFractionGauche(exercice);
      return estSolutionUnique(p2) ? "Racine (fraction)" : "Racines (fraction)";
    }
    case "simplifierFactorisation":
      return "Forme factorisée (fraction)";
    case "simplifierFraction":
      return "Fraction simplifiée";
    case "isolement":
      return "Équation isolée";
    case "reconnaissance":
      return "Méthode";
    case "champ1":
      return exercice.equationIsolee.categorie === "cas_general" ? "Δ" : "Forme factorisée";
    case "champ2":
      return estSolutionUnique(exercice.equationIsolee) ? "Solution" : "Solutions";
    case "racinesEtrangeres":
      return "Racines étrangères";
  }
}

/** Formate un couple `[number, number]` saisi (CE ou racines flexibles) — dédoublonne (racine
 * double saisie deux fois par convention, voir `EtapeRacinesFlexibles.tsx`) et ignore `NaN` (bouton
 * "Pas de..."), jamais recalculé différemment d'un appelant à l'autre. */
function formatCoupleSaisi(valeurs: [number, number], prefixe: string, libellePasDe: string): string {
  const uniques = Array.from(new Set(valeurs.filter((v) => !Number.isNaN(v))));
  return uniques.length === 0 ? libellePasDe : uniques.map((v) => `${prefixe} ${v}`).join(" et ");
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationRationnelle;
  revele: boolean;
}

/** Calcule le bloc "Réponse attendue" pour UNE phase donnée, scopé à l'exercice/phase qui vient
 * juste de se terminer (`etat.exerciceCourant`/`etat.phase`, jamais l'état suivant) — affiché à la
 * fois dans le reveal immédiat (`validation.reponseAttendue`) et dans la fiche de consultation d'un
 * écran déjà clos (`historique`/`FicheReponseEcran`).
 *
 * Avait initialement reproduit tel quel un ancien panneau (`ResultatPanelEquationRationnelle.tsx`)
 * qui n'avait PAS de bloc "answer-reveal" pour "simplifierReduction" ni pour "reconnaissance" —
 * `null` pour ces deux phases, qui faisait disparaître silencieusement "Réponse attendue" dès
 * qu'elles étaient ratées (même bug que gen6/`AppInequationRationnelle.tsx`, trouvé par le même
 * audit). Corrigé en reprenant exactement la logique/formatage déjà calculée pour le récapitulatif
 * live par `ui/recapitulatifEquationRationnelle.ts::calculerRecapitulatifEquationRationnelle`
 * ("Mise en évidence (fraction)"/"Méthode"), qui n'était jamais consultée ici. */
function reponseAttenduePhase(etat: EtatSessionEquationRationnelle): ReactNode {
  const exercice = etat.exerciceCourant;
  switch (etat.phase) {
    case "ce":
      return (
        <>
          {exercice.ce.length === 1 ? "Condition d'existence attendue" : "Conditions d'existence attendues"} :{" "}
          {exercice.ce.map((v) => `x ≠ ${v}`).join(" et ")}
        </>
      );
    case "simplifier":
      return (
        <>
          {exercice.fractionsSimplifiables.length === 1 ? "Fraction simplifiée attendue" : "Fractions simplifiées attendues"} :{" "}
          {exercice.fractionsSimplifiables.map(formatFractionReduiteOuConstante).map((expr, index) => (
            <Katex key={index} expression={expr} />
          ))}
        </>
      );
    case "simplifierReduction": {
      const p2 = p2DeFractionGauche(exercice);
      return (
        <>
          Mise en évidence attendue (fraction) : <Katex expression={formatMiseEnEvidenceLatex(p2)} />
        </>
      );
    }
    case "simplifierReconnaissance": {
      const p2 = p2DeFractionGauche(exercice);
      return <>Méthode attendue (fraction) : {libelleCategorie(p2.categorie)}</>;
    }
    case "simplifierChamp1": {
      const p2 = p2DeFractionGauche(exercice);
      return (
        <>
          Réponse attendue (fraction) :{" "}
          {p2.categorie === "cas_general" ? `Δ = ${p2.solution.delta}` : `${p2.solution.formeFactorisee} = 0`}
        </>
      );
    }
    case "simplifierChamp2": {
      const p2 = p2DeFractionGauche(exercice);
      return (
        <>
          {estSolutionUnique(p2) ? "Racine attendue (fraction)" : "Racines attendues (fraction)"} :{" "}
          <span className="equation-box-termes">
            {formatTermesZerosAttendusLatex(p2).map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </span>
        </>
      );
    }
    case "simplifierFactorisation": {
      const p2 = p2DeFractionGauche(exercice);
      return (
        <>
          Forme factorisée attendue (fraction) :{" "}
          <Katex expression={`${formatFormeFactoriseeDepuisRacines(p2.enonce, p2.solution.racines)} = 0`} />
        </>
      );
    }
    case "simplifierFraction":
      if (!exercice.fractionGauche) return null;
      return (
        <>
          Fraction simplifiée attendue : <Katex expression={formatFractionSimplifiee(exercice.fractionGauche)} />
        </>
      );
    case "isolement":
      return (
        <>
          Équation isolée attendue : <Katex expression={formatEnonceLatex(exercice.equationIsolee.enonce)} />
        </>
      );
    case "reconnaissance":
      return <>Méthode attendue : {libelleCategorie(exercice.equationIsolee.categorie)}</>;
    case "champ1":
      return (
        <>
          Réponse attendue :{" "}
          {exercice.equationIsolee.categorie === "cas_general"
            ? `Δ = ${exercice.equationIsolee.solution.delta}`
            : `${exercice.equationIsolee.solution.formeFactorisee} = 0`}
        </>
      );
    case "champ2":
      return (
        <>
          {estSolutionUnique(exercice.equationIsolee) ? "Solution attendue" : "Solutions attendues"} :{" "}
          <span className="equation-box-termes">
            {formatTermesZerosAttendusLatex(exercice.equationIsolee).map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </span>
        </>
      );
    case "racinesEtrangeres":
      return (
        <>
          {racinesDistinctes(exercice.equationIsolee.solution.racines)
            .map((r) => `x = ${r} : ${exercice.ce.includes(r) ? "à rejeter" : "valide"}`)
            .join(" ; ")}
        </>
      );
  }
}

/**
 * Signal `revele` de la phase qui vient JUSTE de se terminer (`etat.phase`, avant la transition).
 * Lit `xxxRevele`, peuplé depuis `etapeCourante.revelee` à la clôture de chaque phase (jamais une
 * valeur recalculée) — jusqu'au 2025-10, dérivé post-hoc comme `scoreXxx === 0`
 * (`ResultatPanelEquationRationnelle.tsx` à l'origine). Contrairement à d'autres générateurs
 * corrigés dans le même balayage générique (point A), cette heuristique était ici mathématiquement
 * sûre (pénalité d'aide ×0,5 sur le score de tentatives, jamais soustractive — un succès ne peut
 * jamais tomber exactement à 0, voir `etapeTentatives.ts`) : champ explicite ajouté pour la clarté
 * du code, pas pour corriger un bug visible. "racinesEtrangeres" clôture TOUJOURS l'exercice : son
 * signal n'existe que sur le dernier `resultats[...]` de `nouvelEtat`, jamais sur un champ
 * `xxxRevele` top-level. */
function releveRevelePhase(etat: EtatSessionEquationRationnelle, nouvelEtat: EtatSessionEquationRationnelle): boolean {
  switch (etat.phase) {
    case "ce":
      return nouvelEtat.ceRevele;
    case "simplifier":
      return nouvelEtat.simplifierRevele;
    case "simplifierReduction":
      return nouvelEtat.simplifierReductionRevele;
    case "simplifierReconnaissance":
      return nouvelEtat.simplifierCategorieRevelee;
    case "simplifierChamp1":
      return nouvelEtat.simplifierChamp1Revele;
    case "simplifierChamp2":
      return nouvelEtat.simplifierChamp2Revele;
    case "simplifierFactorisation":
      return nouvelEtat.simplifierFactorisationRevele;
    case "simplifierFraction":
      return nouvelEtat.simplifierFractionRevele;
    case "isolement":
      return nouvelEtat.isolementRevele;
    case "reconnaissance":
      return nouvelEtat.categorieRevelee;
    case "champ1":
      return nouvelEtat.champPrincipalRevele;
    case "champ2":
      return nouvelEtat.racinesRevele;
    case "racinesEtrangeres":
      return nouvelEtat.resultats[nouvelEtat.resultats.length - 1].racinesEtrangeresRevele;
  }
}

export function AppEquationRationnelle() {
  const [etat, setEtat] = useState<EtatSessionEquationRationnelle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionEquationRationnelle`, jamais dans le moteur. Remis à vide à
   * chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Appelé juste avant `terminerEtape`, avec l'état AVANT la transition (`etat`, jamais
   * `nouvelEtat`) — réutilise directement `releveRevelePhase`/`reponseAttenduePhase`, déjà écrites
   * pour calculer `validation` sur ce même générateur à ce même point exact (`etat.phase`/
   * `etat.exerciceCourant` juste avant transition). `reponseAttenduePhase` renvoie `null` pour
   * "simplifierReduction"/"reconnaissance" (l'ancien panneau n'avait pas de bloc réponse pour ces
   * deux phases) — reproduit à l'identique. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionEquationRationnelle) {
    const revele = releveRevelePhase(etat, nouvelEtat);
    const reponseAttendue = revele ? reponseAttenduePhase(etat) : null;
    setHistorique((h) => [
      ...h,
      {
        titre: titrePhase(etat),
        votreReponse,
        correcte: !revele,
        reponseAttendue: reponseAttendue ?? undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * réellement (`transitionDEcran`) — jamais à chaque clic sur "Valider" (même garde-fou que
   * `AppAnalyseFonction.tsx`, bug déjà rencontré et corrigé là-bas). */
  function terminerEtape(nouvelEtat: EtatSessionEquationRationnelle, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: releveRevelePhase(etat, nouvelEtat) });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
    setEtat(demarrerSessionEquationRationnelle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteEquationRationnelleId)));
  }

  const recapitulatif = calculerRecapitulatifEquationRationnelle(etat);
  const { tentativesUtilisees } = etat.etapeCourante;
  const { tentativesMax } = etat.reglages;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(etat),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">L'inconnue au dénominateur</h1>
        <p className="app-subtitle">Équations rationnelles</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <div className="equation-box">
                <Katex expression={formatRappelEquationRationnelle(etat.exerciceCourant, etat.phase)} block />
              </div>
            }
          />
          {etat.phase === "ce" && etat.exerciceCourant.ce.length === 1 ? (
            <EtapeCEDirecte
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={formatEquationRationnelleLatex(etat.exerciceCourant)}
              masquerBlocDonnees
              question={QUESTION_CE}
              onValider={(reponse) => terminerEtape(soumettreReponseCE(etat, [Number(reponse)]), `x ≠ ${reponse}`)}
              validation={validation}
            />
          ) : etat.phase === "ce" ? (
            <EtapeRacinesFlexibles
              exercice={etat.exerciceCourant.equationIsolee}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              labelChamp="Conditions d'existence (CE)"
              libellePasDe="Pas de CE"
              libelleAuMoins="Au moins une CE"
              placeholderPrefixe="CE"
              prefixeChamp="x \neq"
              expressionAffichee={formatEquationRationnelleLatex(etat.exerciceCourant)}
              masquerBlocDonnees
              question={QUESTION_CE}
              texteAide="Une fois le dénominateur factorisé, chaque facteur égalé à 0 donne une condition d'existence (CE)."
              aideActivee={etat.aideCeUtilisee}
              onActiverAide={() => setEtat(activerAideCe(etat))}
              onValider={(valeurs) => terminerEtape(soumettreReponseCE(etat, valeurs), formatCoupleSaisi(valeurs, "x ≠", "Pas de CE"))}
              validation={validation}
            />
          ) : etat.phase === "simplifier" ? (
            <EtapeSimplifierFractions
              fractions={etat.exerciceCourant.fractionsSimplifiables}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(reponses) => diagnostiquerSimplifierToutes(etat.exerciceCourant.fractionsSimplifiables, reponses)}
              onValider={(reponses) =>
                terminerEtape(soumettreReponseSimplifier(etat, reponses), reponses.map((r) => `${r.numerateur}/${r.denominateur}`).join(" ; "))
              }
              validation={validation}
            />
          ) : etat.phase === "simplifierReduction" ? (
            <EtapeReductionCoefficients
              exercice={p2DeFractionGauche(etat.exerciceCourant)}
              nom={etat.exerciceCourant.fractionGauche?.type === "P2/P1" ? "numérateur" : "dénominateur"}
              variante="miseEnEvidence"
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              diagnostiquer={(v) => diagnostiquerMiseEnEvidenceFraction(p2DeFractionGauche(etat.exerciceCourant), v)}
              aideActivee={etat.aideSimplifierReductionUtilisee}
              onActiverAide={() => setEtat(activerAideSimplifierReduction(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSimplifierReduction(etat, reponse), reponse)}
              validation={validation}
            />
          ) : etat.phase === "simplifierReconnaissance" ? (
            <EtapeReconnaissance
              exercice={p2DeFractionGauche(etat.exerciceCourant)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={expressionP2(etat.exerciceCourant)}
              question={QUESTION_FACTORISATION_FRACTION}
              onChoisir={(choix: Categorie) => terminerEtape(soumettreChoixSimplifierCategorie(etat, choix), libelleCategorie(choix))}
              validation={validation}
            />
          ) : etat.phase === "simplifierChamp1" ? (
            <EtapeChamp1
              exercice={p2DeFractionGauche(etat.exerciceCourant)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={expressionP2(etat.exerciceCourant)}
              labelFactorisation={LABEL_FACTORISATION_FRACTION}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(p2DeFractionGauche(etat.exerciceCourant), v)}
              aideActivee={etat.aideSimplifierChamp1Utilisee}
              onActiverAide={() => setEtat(activerAideSimplifierChamp1(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSimplifierChamp1(etat, reponse), reponse)}
              validation={validation}
            />
          ) : etat.phase === "simplifierChamp2" ? (
            <EtapeRacinesFlexibles
              exercice={p2DeFractionGauche(etat.exerciceCourant)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={expressionP2(etat.exerciceCourant)}
              prefixeChamp="x ="
              aideActivee={etat.aideSimplifierChamp2Utilisee}
              onActiverAide={() => setEtat(activerAideSimplifierChamp2(etat))}
              onValider={(racines) =>
                terminerEtape(soumettreReponseSimplifierChamp2(etat, racines), formatCoupleSaisi(racines, "x =", "Pas de racine"))
              }
              validation={validation}
            />
          ) : etat.phase === "simplifierFactorisation" ? (
            <EtapeChamp1
              exercice={p2DeFractionGauche(etat.exerciceCourant)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={expressionP2(etat.exerciceCourant)}
              labelFactorisation="Forme factorisée"
              etapeFactorisationForcee
              diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(p2DeFractionGauche(etat.exerciceCourant), v)}
              aideActivee={etat.aideSimplifierFactorisationUtilisee}
              onActiverAide={() => setEtat(activerAideSimplifierFactorisation(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSimplifierFactorisation(etat, reponse), reponse)}
              validation={validation}
            />
          ) : etat.phase === "simplifierFraction" ? (
            <EtapeSimplification
              expressionAffichee={formatEquationRationnelleLatex(etat.exerciceCourant)}
              masquerBlocDonnees
              question="Simplifie la fraction ci-dessus."
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(n, d) =>
                diagnostiquerFractionSimplifiee(
                  (etat.exerciceCourant.fractionGauche as ExerciceSimplification).numerateur as PolynomeLineaire,
                  (etat.exerciceCourant.fractionGauche as ExerciceSimplification).denominateur as PolynomeLineaire,
                  n,
                  d,
                )
              }
              aideActivee={etat.aideSimplifierFractionUtilisee}
              onActiverAide={() => setEtat(activerAideSimplifierFraction(etat))}
              onValider={(numerateur, denominateur) =>
                terminerEtape(soumettreReponseSimplifierFraction(etat, numerateur, denominateur), `${numerateur}/${denominateur}`)
              }
              validation={validation}
            />
          ) : etat.phase === "isolement" ? (
            <EtapeIsolement
              exercice={etat.exerciceCourant.equationIsolee}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={formatEquationRationnelleLatexApresSimplification(etat.exerciceCourant)}
              masquerBlocDonnees
              diagnostiquer={(v) => diagnostiquerIsolement(etat.exerciceCourant.equationIsolee, v)}
              texteAide="Multiplie chaque terme par le dénominateur commun pour éliminer les fractions, puis regroupe."
              aideActivee={etat.aideIsolementUtilisee}
              onActiverAide={() => setEtat(activerAideIsolement(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIsolement(etat, reponse), reponse)}
              validation={validation}
            />
          ) : etat.phase === "reconnaissance" ? (
            <EtapeReconnaissance
              exercice={etat.exerciceCourant.equationIsolee}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              question={QUESTION_FACTORISATION}
              onChoisir={(choix: Categorie) => terminerEtape(soumettreChoixCategorie(etat, choix), libelleCategorie(choix))}
              validation={validation}
            />
          ) : etat.phase === "champ1" ? (
            <EtapeChamp1
              exercice={etat.exerciceCourant.equationIsolee}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(etat.exerciceCourant.equationIsolee, v)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideChamp1Utilisee}
              onActiverAide={() => setEtat(activerAideChamp1(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseChamp1(etat, reponse), reponse)}
              validation={validation}
            />
          ) : etat.phase === "champ2" ? (
            <EtapeRacinesFlexibles
              exercice={etat.exerciceCourant.equationIsolee}
              labelChamp="Solutions"
              libellePasDe="Pas de solution"
              libelleAuMoins="Au moins une solution"
              placeholderPrefixe="solution"
              prefixeChamp="x ="
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              texteAide="Une fois l'équation factorisée, chaque facteur égalé à 0 donne une solution."
              aideActivee={etat.aideChamp2Utilisee}
              onActiverAide={() => setEtat(activerAideChamp2(etat))}
              onValider={(racines) => terminerEtape(soumettreReponseChamp2(etat, racines), formatCoupleSaisi(racines, "x =", "Pas de solution"))}
              validation={validation}
            />
          ) : (
            <EtapeRacinesEtrangeres
              exercice={etat.exerciceCourant}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideRacinesEtrangeresUtilisee}
              onActiverAide={() => setEtat(activerAideRacinesEtrangeres(etat))}
              onValider={(reponses) => terminerEtape(soumettreReponseRacinesEtrangeres(etat, reponses))}
              validation={validation}
            />
          )}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
