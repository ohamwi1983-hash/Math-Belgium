import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { Exercice } from "./core/generateur.types";
import type { PolynomeLineaire } from "./core/simplification.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideDenomChamp1,
  activerAideDenomChamp2,
  activerAideDenomFactorisation,
  activerAideDenomReduction,
  activerAideDenomReductionP1,
  activerAideNumChamp1,
  activerAideNumChamp2,
  activerAideNumFactorisation,
  activerAideNumReduction,
  activerAideNumReductionP1,
  activerAideSimplification,
  demarrerSessionSimplification,
  soumettreChoixDenomCategorie,
  soumettreChoixNumCategorie,
  soumettreReponseCEDirecte,
  soumettreReponseDenomChamp1,
  soumettreReponseDenomChamp2,
  soumettreReponseDenomFactorisation,
  soumettreReponseDenomReduction,
  soumettreReponseDenomReductionP1,
  soumettreReponseNumChamp1,
  soumettreReponseNumChamp2,
  soumettreReponseNumFactorisation,
  soumettreReponseNumReduction,
  soumettreReponseNumReductionP1,
  soumettreReponseSimplification,
  phasesExercice,
} from "./moteur/sessionSimplification";
import type { EtatSessionSimplification, PhaseSimplification } from "./moteur/typesSimplification";
import { diagnostiquerChampPrincipal, diagnostiquerFactorisationCasGeneral } from "./moteur/verification";
import { diagnostiquerMiseEnEvidenceFraction, diagnostiquerMiseEnEvidenceP1, diagnostiquerSimplification } from "./moteur/verificationSimplification";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSimplification } from "./generateurs/simplification";
import { EtapeReconnaissance } from "./components/EtapeReconnaissance";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { EtapeChamp1 } from "./components/EtapeChamp1";
import { EtapeRacinesFlexibles } from "./components/EtapeRacinesFlexibles";
import { EtapeCEDirecte } from "./components/EtapeCEDirecte";
import { EtapeReductionCoefficients } from "./components/EtapeReductionCoefficients";
import { EtapeSimplification } from "./components/EtapeSimplification";
import { FractionHeader } from "./components/FractionHeader";
import { calculerRecapitulatifSimplification } from "./ui/recapitulatifSimplification";
import { formatEquationDenominateur, formatEquationNumerateur, formatFractionPourCE, formatFractionSimplifiee } from "./ui/formatSimplification";
import { estSolutionUnique, formatFormeFactoriseeDepuisRacines, formatTermesZerosAttendusLatex } from "./ui/formatEquation";
import { libelleCategorie } from "./ui/categorieLabels";
import { Katex } from "./components/Katex";
import type { TypeFraction } from "./core/simplification.types";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, entreeAjoutee, nombreSaisi, saisieEnLatex, segmentsDepuisHistorique, valeurRecap, type EcranClos } from "./ui/historiqueProgression";
import { EnTeteExercice } from "./components/EnTeteExercice";

/**
 * Questions/libellés de factorisation, adaptés au dénominateur ou au numérateur
 * (prompt-generateurs123vague2.md, générateur 3, point 1) — jamais le générique "ce polynôme"
 * d'origine, qui ne précisait pas quel côté de la fraction est concerné.
 */
const QUESTION_FACTORISATION_DENOMINATEUR = "Quelle est la méthode la plus rapide pour factoriser ce dénominateur ?";
const QUESTION_FACTORISATION_NUMERATEUR = "Quelle est la méthode la plus rapide pour factoriser ce numérateur ?";
const LABEL_FACTORISATION_DENOMINATEUR = "Factorise ce dénominateur";
const LABEL_FACTORISATION_NUMERATEUR = "Factorise ce numérateur";
const QUESTION_CE = "Quelle est la condition d'existence ?";

/**
 * Consigne générale — rappelle l'objectif complet de l'exercice, affichée identique sur tous les
 * écrans de travail (jamais sur les écrans de résultat/résumé), redondante avec les consignes
 * spécifiques à chaque étape mais utile pour ne jamais perdre de vue l'objectif final (prompt du
 * 28/09) — même principe que gen1 (AppMethodeRapide.tsx::CONSIGNE_GENERALE).
 */
const CONSIGNE_GENERALE = "Simplifier la fraction suivante :";

/** Réponse attendue au champ principal (champ1) d'un P2 — même convention que ResultatPanel.tsx
 * (exercice 1) : "Δ = ..." pour cas_general, la forme factorisée confirmée (avec "= 0") sinon. */
function formatChampPrincipalAttendu(poly: Exercice): string {
  return poly.categorie === "cas_general" ? `\\Delta = ${poly.solution.delta}` : `${poly.solution.formeFactorisee} = 0`;
}

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionSimplification {
  return demarrerSessionSimplification(REGLAGES_DEMO, genererExerciceSimplification);
}

/** Premier exercice : celui d'une feuille imprimée si l'URL porte un code (`?code=`, QR code de la
 * feuille d'exercices) — tiré avec les MÊMES fonctions et le MÊME catalogue que l'adaptateur
 * d'export ; sinon un tirage libre. Les exercices suivants sont toujours libres. */
function sessionInitiale(): EtatSessionSimplification {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionSimplification(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceSimplification, (id) => construireAvecVarianteId(id as TypeFraction)),
  );
}

/** Aide utilisée sur l'écran en cours (les reconnaissances et la CE directe n'en ont pas). */
function aideEcran(etat: EtatSessionSimplification): boolean {
  switch (etat.phase) {
    case "denomReduction":
      return etat.aideDenomReductionUtilisee;
    case "denomReductionP1":
      return etat.aideDenomReductionP1Utilisee;
    case "denomChamp1":
      return etat.aideDenomChamp1Utilisee;
    case "denomChamp2":
      return etat.aideDenomChamp2Utilisee;
    case "denomFactorisation":
      return etat.aideDenomFactorisationUtilisee;
    case "numReduction":
      return etat.aideNumReductionUtilisee;
    case "numReductionP1":
      return etat.aideNumReductionP1Utilisee;
    case "numChamp1":
      return etat.aideNumChamp1Utilisee;
    case "numChamp2":
      return etat.aideNumChamp2Utilisee;
    case "numFactorisation":
      return etat.aideNumFactorisationUtilisee;
    case "simplification":
      return etat.aideSimplificationUtilisee;
    default:
      return false;
  }
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). Séquence de 14 phases FIXES, chacune au plus une fois par exercice
 * (jamais de répétition comme "Tableau de signes à plusieurs facteurs") : un simple changement de
 * `phase` (ou de `terminee` pour la toute dernière) suffit donc à détecter la clôture d'un écran. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionSimplification;
  revele: boolean;
}

export function AppSimplification() {
  const [etat, setEtat] = useState<EtatSessionSimplification>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionSimplification`, jamais dans le moteur (voir
   * AppAnalyseFonction.tsx). Remis à vide à chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur d'exercices : clé de la zone d'étapes, pour que les champs repartent vides à chaque
   * nouvel exercice même quand il commence par le même écran que le précédent. */
  const [numeroExercice, setNumeroExercice] = useState(0);

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (voir le commentaire détaillé
   * de AppAnalyseFonction.tsx::terminerEtape, même garde reproduit ici à l'identique). */
  function terminerEtape(nouvelEtat: EtatSessionSimplification, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (!transitionDEcran) {
      setEtat(nouvelEtat);
      return;
    }

    const revele = (() => {
      switch (etat.phase) {
        case "denomReduction":
          return nouvelEtat.denomReductionRevele;
        case "denomReductionP1":
          return nouvelEtat.denomReductionP1Revele;
        case "denomReconnaissance":
          return nouvelEtat.denomCategorieRevelee;
        case "denomChamp1":
          return nouvelEtat.denomChamp1Revele;
        case "denomChamp2":
          return nouvelEtat.denomChamp2Revele;
        case "denomFactorisation":
          return nouvelEtat.denomFactorisationRevele;
        case "ceDirecte":
          return nouvelEtat.ceDirecteRevele;
        case "numReduction":
          return nouvelEtat.numReductionRevele;
        case "numReductionP1":
          return nouvelEtat.numReductionP1Revele;
        case "numReconnaissance":
          return nouvelEtat.numCategorieRevelee;
        case "numChamp1":
          return nouvelEtat.numChamp1Revele;
        case "numChamp2":
          return nouvelEtat.numChamp2Revele;
        case "numFactorisation":
          return nouvelEtat.numFactorisationRevele;
        case "simplification":
          return nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.simplificationRevele;
      }
    })();

    // Titre et réponse attendue : l'entrée de récapitulatif que cet écran vient d'ajouter (la
    // fraction simplifiée finale n'en ajoute pas) ; réponse attendue = celle de l'écran de validation.
    const nouvelle = entreeAjoutee(calculerRecapitulatifSimplification(etat), calculerRecapitulatifSimplification(nouvelEtat));
    const attendue = reponseAttendueEcran(etat.phase) ?? (nouvelle ? valeurRecap(nouvelle) : undefined);
    setHistorique((h) => [...h, ecranClos(nouvelle?.libelle ?? "Fraction simplifiée", votreReponse, revele, aideEcran(etat), attendue)]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setFicheOuverteIndex(null);
      setNumeroExercice((n) => n + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionSimplification(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as TypeFraction)));
  }

  const recapitulatif = calculerRecapitulatifSimplification(etat);
  const { tentativesUtilisees } = etat.etapeCourante;
  const { tentativesMax } = etat.reglages;
  const exercice = etat.exerciceCourant;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : reponseAttendueEcran(etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  /** Réponse attendue d'un écran (écran de validation ET fiche de la puce). */
  function reponseAttendueEcran(phase: PhaseSimplification): ReactNode {
          switch (phase) {
            case "denomReconnaissance":
              return <>Méthode attendue (dénominateur) : {libelleCategorie((exercice.denominateur as Exercice).categorie)}</>;
            case "denomChamp1":
              return (
                <>
                  Réponse attendue (dénominateur) : <Katex expression={formatChampPrincipalAttendu(exercice.denominateur as Exercice)} />
                </>
              );
            case "denomChamp2":
              return (
                <>
                  {estSolutionUnique(exercice.denominateur as Exercice) ? "CE attendue" : "CE attendues"} :{" "}
                  <span className="equation-box-termes">
                    {formatTermesZerosAttendusLatex(exercice.denominateur as Exercice).map((terme, i) => (
                      <Katex key={i} expression={terme} />
                    ))}
                  </span>
                </>
              );
            case "denomFactorisation":
              return (
                <>
                  Forme factorisée attendue (dénominateur) :{" "}
                  <Katex
                    expression={`${formatFormeFactoriseeDepuisRacines((exercice.denominateur as Exercice).enonce, (exercice.denominateur as Exercice).solution.racines)} = 0`}
                  />
                </>
              );
            case "ceDirecte":
              return <>CE attendue : {exercice.racineCommune}</>;
            case "numReconnaissance":
              return <>Méthode attendue (numérateur) : {libelleCategorie((exercice.numerateur as Exercice).categorie)}</>;
            case "numChamp1":
              return (
                <>
                  Réponse attendue (numérateur) : <Katex expression={formatChampPrincipalAttendu(exercice.numerateur as Exercice)} />
                </>
              );
            case "numChamp2":
              return (
                <>
                  {estSolutionUnique(exercice.numerateur as Exercice) ? "Racine attendue (numérateur)" : "Racines attendues (numérateur)"} :{" "}
                  <span className="equation-box-termes">
                    {formatTermesZerosAttendusLatex(exercice.numerateur as Exercice).map((terme, i) => (
                      <Katex key={i} expression={terme} />
                    ))}
                  </span>
                </>
              );
            case "numFactorisation":
              return (
                <>
                  Forme factorisée attendue (numérateur) :{" "}
                  <Katex
                    expression={`${formatFormeFactoriseeDepuisRacines((exercice.numerateur as Exercice).enonce, (exercice.numerateur as Exercice).solution.racines)} = 0`}
                  />
                </>
              );
            case "simplification":
              return (
                <>
                  Réponse attendue : <Katex expression={formatFractionSimplifiee(exercice)} />
                </>
              );
            default:
              // denomReduction/denomReductionP1/numReduction/numReductionP1 : jamais de réponse
              // révélée pour ces 4 étapes (voir ResultatPanelSimplification.tsx d'origine).
              return undefined;
          }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Simplifier une fraction rationnelle</h1>
        <p className="app-subtitle">Fractions rationnelles avec conditions d'existence</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>

      <main className="card">
        <ProgressionPuces
          segments={segmentsDepuisHistorique(historique, phasesExercice(exercice).length, !enAttente)}
          onSegmentClick={(index) => setFicheOuverteIndex(index)}
        />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={<FractionHeader exercice={exercice} />} />
          <Fragment key={numeroExercice}>
          {etat.phase === "denomReduction" ? (
            <>
              <EtapeReductionCoefficients
                exercice={exercice.denominateur as Exercice}
                nom="dénominateur"
                variante="miseEnEvidence"
                prefixeExpression="D(x)"
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                diagnostiquer={(v) => diagnostiquerMiseEnEvidenceFraction(exercice.denominateur as Exercice, v)}
                aideActivee={etat.aideDenomReductionUtilisee}
                onActiverAide={() => setEtat(activerAideDenomReduction(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseDenomReduction(etat, reponse), saisieEnLatex(reponse))}
                validation={validation}
              />
            </>
          ) : etat.phase === "denomReductionP1" ? (
            <>
              <EtapeReductionCoefficients
                exercice={exercice.denominateur as PolynomeLineaire}
                nom="dénominateur"
                variante="miseEnEvidence"
                prefixeExpression="D(x)"
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                diagnostiquer={(v) => diagnostiquerMiseEnEvidenceP1(exercice.denominateur as PolynomeLineaire, v)}
                aideActivee={etat.aideDenomReductionP1Utilisee}
                onActiverAide={() => setEtat(activerAideDenomReductionP1(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseDenomReductionP1(etat, reponse), saisieEnLatex(reponse))}
                validation={validation}
              />
            </>
          ) : etat.phase === "denomReconnaissance" ? (
            <>
              <EtapeReconnaissance
                exercice={exercice.denominateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationDenominateur(exercice.denominateur as Exercice)}
                question={QUESTION_FACTORISATION_DENOMINATEUR}
                onChoisir={(choix) => terminerEtape(soumettreChoixDenomCategorie(etat, choix), libelleCategorie(choix))}
                validation={validation}
              />
            </>
          ) : etat.phase === "denomChamp1" ? (
            <>
              <EtapeChamp1
                exercice={exercice.denominateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationDenominateur(exercice.denominateur as Exercice)}
                labelFactorisation={LABEL_FACTORISATION_DENOMINATEUR}
                diagnostiquer={(v) => diagnostiquerChampPrincipal(exercice.denominateur as Exercice, v)}
                aideActivee={etat.aideDenomChamp1Utilisee}
                onActiverAide={() => setEtat(activerAideDenomChamp1(etat))}
                onValider={(reponse) =>
                  terminerEtape(
                    soumettreReponseDenomChamp1(etat, reponse),
                    (exercice.denominateur as Exercice).categorie === "cas_general" ? <>Δ = {saisieEnLatex(reponse)}</> : saisieEnLatex(reponse),
                  )
                }
                validation={validation}
              />
            </>
          ) : etat.phase === "denomChamp2" ? (
            <>
              <EtapeRacinesFlexibles
                exercice={exercice.denominateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                labelChamp="Conditions d'existence (CE)"
                libellePasDe="Pas de CE"
                libelleAuMoins="Au moins une CE"
                placeholderPrefixe="CE"
                prefixeChamp="x \neq"
                expressionAffichee={formatFractionPourCE(exercice)}
                question={QUESTION_CE}
                texteAide="Une fois le dénominateur factorisé, chaque facteur égalé à 0 donne une condition d'existence (CE)."
                aideActivee={etat.aideDenomChamp2Utilisee}
                onActiverAide={() => setEtat(activerAideDenomChamp2(etat))}
                onValider={(racines) => terminerEtape(soumettreReponseDenomChamp2(etat, racines), (racines[0] === racines[1] ? [racines[0]] : racines).map((r) => `x ≠ ${nombreSaisi(r)}`).join(" ; "))}
                validation={validation}
              />
            </>
          ) : etat.phase === "denomFactorisation" ? (
            <>
              <EtapeChamp1
                exercice={exercice.denominateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationDenominateur(exercice.denominateur as Exercice)}
                labelFactorisation="Forme factorisée"
                etapeFactorisationForcee
                diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(exercice.denominateur as Exercice, v)}
                aideActivee={etat.aideDenomFactorisationUtilisee}
                onActiverAide={() => setEtat(activerAideDenomFactorisation(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseDenomFactorisation(etat, reponse), saisieEnLatex(reponse.includes("=") ? reponse : `${reponse}=0`))}
                validation={validation}
              />
            </>
          ) : etat.phase === "ceDirecte" ? (
            <EtapeCEDirecte
              exercice={exercice}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse) => terminerEtape(soumettreReponseCEDirecte(etat, reponse), `x ≠ ${reponse.replace("-", "−").replace(".", ",")}`)}
              validation={validation}
            />
          ) : etat.phase === "numReduction" ? (
            <>
              <EtapeReductionCoefficients
                exercice={exercice.numerateur as Exercice}
                nom="numérateur"
                variante="miseEnEvidence"
                prefixeExpression="N(x)"
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                diagnostiquer={(v) => diagnostiquerMiseEnEvidenceFraction(exercice.numerateur as Exercice, v)}
                aideActivee={etat.aideNumReductionUtilisee}
                onActiverAide={() => setEtat(activerAideNumReduction(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseNumReduction(etat, reponse), saisieEnLatex(reponse))}
                validation={validation}
              />
            </>
          ) : etat.phase === "numReconnaissance" ? (
            <>
              <EtapeReconnaissance
                exercice={exercice.numerateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationNumerateur(exercice.numerateur as Exercice)}
                question={QUESTION_FACTORISATION_NUMERATEUR}
                onChoisir={(choix) => terminerEtape(soumettreChoixNumCategorie(etat, choix), libelleCategorie(choix))}
                validation={validation}
              />
            </>
          ) : etat.phase === "numChamp1" ? (
            <>
              <EtapeChamp1
                exercice={exercice.numerateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationNumerateur(exercice.numerateur as Exercice)}
                labelFactorisation={LABEL_FACTORISATION_NUMERATEUR}
                diagnostiquer={(v) => diagnostiquerChampPrincipal(exercice.numerateur as Exercice, v)}
                aideActivee={etat.aideNumChamp1Utilisee}
                onActiverAide={() => setEtat(activerAideNumChamp1(etat))}
                onValider={(reponse) =>
                  terminerEtape(
                    soumettreReponseNumChamp1(etat, reponse),
                    (exercice.numerateur as Exercice).categorie === "cas_general" ? <>Δ = {saisieEnLatex(reponse)}</> : saisieEnLatex(reponse),
                  )
                }
                validation={validation}
              />
            </>
          ) : etat.phase === "numChamp2" ? (
            <>
              <EtapeRacinesFlexibles
                exercice={exercice.numerateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationNumerateur(exercice.numerateur as Exercice)}
                prefixeChamp="x ="
                aideActivee={etat.aideNumChamp2Utilisee}
                onActiverAide={() => setEtat(activerAideNumChamp2(etat))}
                onValider={(racines) => terminerEtape(soumettreReponseNumChamp2(etat, racines), (racines[0] === racines[1] ? [racines[0]] : racines).map((r) => `x = ${nombreSaisi(r)}`).join(" ; "))}
                validation={validation}
              />
            </>
          ) : etat.phase === "numFactorisation" ? (
            <>
              <EtapeChamp1
                exercice={exercice.numerateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationNumerateur(exercice.numerateur as Exercice)}
                labelFactorisation="Forme factorisée"
                etapeFactorisationForcee
                diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(exercice.numerateur as Exercice, v)}
                aideActivee={etat.aideNumFactorisationUtilisee}
                onActiverAide={() => setEtat(activerAideNumFactorisation(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseNumFactorisation(etat, reponse), saisieEnLatex(reponse.includes("=") ? reponse : `${reponse}=0`))}
                validation={validation}
              />
            </>
          ) : etat.phase === "numReductionP1" ? (
            <>
              <EtapeReductionCoefficients
                exercice={exercice.numerateur as PolynomeLineaire}
                nom="numérateur"
                variante="miseEnEvidence"
                prefixeExpression="N(x)"
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                diagnostiquer={(v) => diagnostiquerMiseEnEvidenceP1(exercice.numerateur as PolynomeLineaire, v)}
                aideActivee={etat.aideNumReductionP1Utilisee}
                onActiverAide={() => setEtat(activerAideNumReductionP1(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseNumReductionP1(etat, reponse), saisieEnLatex(reponse))}
                validation={validation}
              />
            </>
          ) : (
            <EtapeSimplification
              exercice={exercice}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(n, d) => diagnostiquerSimplification(exercice, n, d)}
              aideActivee={etat.aideSimplificationUtilisee}
              onActiverAide={() => setEtat(activerAideSimplification(etat))}
              onValider={(numerateur, denominateur) => terminerEtape(soumettreReponseSimplification(etat, numerateur, denominateur), saisieEnLatex(`(${numerateur})/(${denominateur})`))}
              validation={validation}
            />
          )}
          </Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
