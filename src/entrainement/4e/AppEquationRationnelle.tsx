import { useState } from "react";
import type { ReactNode } from "react";
import type { Categorie, Exercice } from "./core/generateur.types";
import type { ExerciceCas4a, ExerciceCas4b, ExerciceEquationRationnelle } from "./core/equationRationnelle.types";
import type { ExerciceSimplification, PolynomeLineaire } from "./core/simplification.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideCe,
  activerAideChamp1,
  activerAideChamp2,
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
  formatFractionGaucheFactorisee,
  formatFractionReduiteOuConstante,
  formatRappelEquationRationnelle,
} from "./ui/formatEquationRationnelle";
import { formatEquationDenominateur, formatEquationNumerateur, formatFractionSimplifiee } from "./ui/formatSimplification";
import { libelleCategorie } from "./ui/categorieLabels";
import { estSolutionUnique, formatEnonceLatex, formatFormeFactoriseeDepuisRacines, formatTermesZerosAttendusLatex } from "./ui/formatEquation";

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

const LIBELLE_PHASE: Record<PhaseEquationRationnelle, string> = {
  ce: "Condition d'existence",
  simplifier: "Simplifier",
  simplifierReduction: "Réduction (fraction)",
  simplifierReconnaissance: "Méthode (fraction)",
  simplifierChamp1: "Factorisation (fraction)",
  simplifierChamp2: "Racines (fraction)",
  simplifierFactorisation: "Factorisation (fraction)",
  simplifierFraction: "Simplification",
  isolement: "Isolement",
  reconnaissance: "Méthode",
  champ1: "Factorisation",
  champ2: "Solutions",
  racinesEtrangeres: "Solutions étrangères",
};

/**
 * Écrans qui affichent déjà l'équation rationnelle complète comme contenu principal
 * (`expressionAffichee`) — le rappel supplémentaire de promptgenerateur4vague2.md, point 1, n'y
 * ajouterait qu'un doublon visuel. Tous les autres écrans (sauf "ce", le tout premier de la
 * séquence, où l'énoncé est déjà l'unique contenu affiché) en ont besoin : ils ne montrent sinon
 * que le fragment sur lequel porte l'étape (N(x)=..., D(x)=..., l'équation isolée seule...).
 */
const PHASES_SANS_RAPPEL_SUPPLEMENTAIRE = new Set<PhaseEquationRationnelle>(["ce", "simplifier", "isolement", "simplifierFraction"]);

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationRationnelle;
  revele: boolean;
}

/** Reproduit exactement ce que `ResultatPanelEquationRationnelle.tsx` affichait (bloc
 * "answer-reveal") pour UNE phase donnée, scopé à l'exercice/phase qui vient juste de se terminer
 * (`etat.exerciceCourant`/`etat.phase`, jamais l'état suivant). Cet ancien panneau n'avait PAS de
 * bloc "answer-reveal" pour "simplifierReduction" ni pour "reconnaissance" (seule la ligne colorée
 * du récapitulatif existait) — fidèlement reproduit ici par `null` (pas de contenu ajouté qui
 * n'existait pas avant). */
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
    case "simplifierReduction":
      return null;
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
      return null;
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
 * Ce générateur n'a JAMAIS tracké de booléen `xxxRevele` fiable par écran au niveau du moteur
 * (seules "simplifierReconnaissance"/"reconnaissance" en ont un, `simplifierCategorieRevelee`/
 * `categorieRevelee` — QCM sans aide) : pour toutes les autres phases, l'ancien
 * `ResultatPanelEquationRationnelle.tsx` dérivait `revele` post-hoc comme `scoreXxx === 0`
 * (approximatif : une pénalité d'aide peut aussi ramener à 0 une réponse correcte mais aidée — même
 * défaut qu'avant, reproduit ici à l'identique, PAS corrigé dans cette passe). "racinesEtrangeres"
 * clôture TOUJOURS l'exercice : son score n'existe que sur le dernier `resultats[...]` de
 * `nouvelEtat`, jamais sur un champ `xxxExercice` top-level. */
function releveRevelePhase(etat: EtatSessionEquationRationnelle, nouvelEtat: EtatSessionEquationRationnelle): boolean {
  switch (etat.phase) {
    case "ce":
      return nouvelEtat.scoreCEExercice === 0;
    case "simplifier":
      return nouvelEtat.scoreSimplifierExercice === 0;
    case "simplifierReduction":
      return nouvelEtat.scoreSimplifierReductionExercice === 0;
    case "simplifierReconnaissance":
      return nouvelEtat.simplifierCategorieRevelee;
    case "simplifierChamp1":
      return nouvelEtat.scoreSimplifierChamp1Exercice === 0;
    case "simplifierChamp2":
      return nouvelEtat.scoreSimplifierChamp2Exercice === 0;
    case "simplifierFactorisation":
      return nouvelEtat.scoreSimplifierFactorisationExercice === 0;
    case "simplifierFraction":
      return nouvelEtat.scoreSimplifierFractionExercice === 0;
    case "isolement":
      return nouvelEtat.scoreIsolementExercice === 0;
    case "reconnaissance":
      return nouvelEtat.categorieRevelee;
    case "champ1":
      return nouvelEtat.scoreChampPrincipalExercice === 0;
    case "champ2":
      return nouvelEtat.scoreRacinesExercice === 0;
    case "racinesEtrangeres":
      return nouvelEtat.resultats[nouvelEtat.resultats.length - 1].scoreRacinesEtrangeres === 0;
  }
}

export function AppEquationRationnelle() {
  const [etat, setEtat] = useState<EtatSessionEquationRationnelle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionEquationRationnelle) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: releveRevelePhase(etat, nouvelEtat) });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
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
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>

        <div className="card-body">
          {!PHASES_SANS_RAPPEL_SUPPLEMENTAIRE.has(etat.phase) && (
            <div className="equation-box">
              <Katex expression={formatRappelEquationRationnelle(etat.exerciceCourant, etat.phase)} block />
            </div>
          )}
          {etat.phase === "ce" && etat.exerciceCourant.ce.length === 1 ? (
            <EtapeCEDirecte
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={formatEquationRationnelleLatex(etat.exerciceCourant)}
              question={QUESTION_CE}
              onValider={(reponse) => terminerEtape(soumettreReponseCE(etat, [Number(reponse)]))}
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
              question={QUESTION_CE}
              texteAide="Une fois le dénominateur factorisé, chaque facteur égalé à 0 donne une condition d'existence (CE)."
              aideActivee={etat.aideCeUtilisee}
              onActiverAide={() => setEtat(activerAideCe(etat))}
              onValider={(valeurs) => terminerEtape(soumettreReponseCE(etat, valeurs))}
              validation={validation}
            />
          ) : etat.phase === "simplifier" ? (
            <EtapeSimplifierFractions
              fractions={etat.exerciceCourant.fractionsSimplifiables}
              expressionAffichee={formatEquationRationnelleLatex(etat.exerciceCourant)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(reponses) => diagnostiquerSimplifierToutes(etat.exerciceCourant.fractionsSimplifiables, reponses)}
              onValider={(reponses) => terminerEtape(soumettreReponseSimplifier(etat, reponses))}
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
              onValider={(reponse) => terminerEtape(soumettreReponseSimplifierReduction(etat, reponse))}
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
              onChoisir={(choix: Categorie) => terminerEtape(soumettreChoixSimplifierCategorie(etat, choix))}
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
              onValider={(reponse) => terminerEtape(soumettreReponseSimplifierChamp1(etat, reponse))}
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
              onValider={(racines) => terminerEtape(soumettreReponseSimplifierChamp2(etat, racines))}
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
              onValider={(reponse) => terminerEtape(soumettreReponseSimplifierFactorisation(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "simplifierFraction" ? (
            <EtapeSimplification
              expressionAffichee={formatEquationRationnelleLatex(etat.exerciceCourant)}
              etatActuel={formatFractionGaucheFactorisee(etat.exerciceCourant as ExerciceCas4a | ExerciceCas4b)}
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
              onValider={(numerateur, denominateur) => terminerEtape(soumettreReponseSimplifierFraction(etat, numerateur, denominateur))}
              validation={validation}
            />
          ) : etat.phase === "isolement" ? (
            <EtapeIsolement
              exercice={etat.exerciceCourant.equationIsolee}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={formatEquationRationnelleLatexApresSimplification(etat.exerciceCourant)}
              diagnostiquer={(v) => diagnostiquerIsolement(etat.exerciceCourant.equationIsolee, v)}
              texteAide="Multiplie chaque terme par le dénominateur commun pour éliminer les fractions, puis regroupe."
              aideActivee={etat.aideIsolementUtilisee}
              onActiverAide={() => setEtat(activerAideIsolement(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIsolement(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "reconnaissance" ? (
            <EtapeReconnaissance
              exercice={etat.exerciceCourant.equationIsolee}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              question={QUESTION_FACTORISATION}
              onChoisir={(choix: Categorie) => terminerEtape(soumettreChoixCategorie(etat, choix))}
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
              onValider={(reponse) => terminerEtape(soumettreReponseChamp1(etat, reponse))}
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
              onValider={(racines) => terminerEtape(soumettreReponseChamp2(etat, racines))}
              validation={validation}
            />
          ) : (
            <EtapeRacinesEtrangeres
              exercice={etat.exerciceCourant}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponses) => terminerEtape(soumettreReponseRacinesEtrangeres(etat, reponses))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
