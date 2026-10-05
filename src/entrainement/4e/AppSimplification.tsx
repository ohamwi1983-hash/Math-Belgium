import { useState } from "react";
import type { Categorie, Exercice } from "./core/generateur.types";
import type { ExerciceSimplification, PolynomeLineaire, TypeFraction } from "./core/simplification.types";
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
} from "./moteur/sessionSimplification";
import type { EtatSessionSimplification, PhaseSimplification, ResultatExerciceSimplification } from "./moteur/typesSimplification";
import { diagnostiquerChampPrincipal, diagnostiquerFactorisationCasGeneral } from "./moteur/verification";
import { diagnostiquerMiseEnEvidenceFraction, diagnostiquerMiseEnEvidenceP1, diagnostiquerSimplification } from "./moteur/verificationSimplification";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSimplification } from "./generateurs/simplification";
import { EtapeReconnaissance } from "./components/EtapeReconnaissance";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeChamp1 } from "./components/EtapeChamp1";
import { EtapeRacinesFlexibles } from "./components/EtapeRacinesFlexibles";
import { EtapeCEDirecte } from "./components/EtapeCEDirecte";
import { EtapeReductionCoefficients } from "./components/EtapeReductionCoefficients";
import { EtapeSimplification } from "./components/EtapeSimplification";
import { FractionHeader } from "./components/FractionHeader";
import { EtatActuelPanel } from "./components/EtatActuelPanel";
import { ResultatPanelSimplification } from "./components/ResultatPanelSimplification";
import { ResumeSessionSimplification } from "./components/ResumeSessionSimplification";
import { calculerRecapitulatifSimplification } from "./ui/recapitulatifSimplification";
import { calculerEtatActuelSimplification } from "./ui/etatActuelSimplification";
import { formatEquationDenominateur, formatEquationNumerateur, formatFractionPourCE } from "./ui/formatSimplification";

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

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionSimplification {
  return demarrerSessionSimplification(REGLAGES_DEMO, genererExerciceSimplification);
}

interface Bilan {
  resultat: ResultatExerciceSimplification;
  exercice: ExerciceSimplification;
}

const LIBELLE_PHASE: Record<PhaseSimplification, string> = {
  denomReduction: "Réduction (dénominateur)",
  denomReductionP1: "Réduction (dénominateur)",
  denomReconnaissance: "Méthode (dénominateur)",
  denomChamp1: "Factorisation (dénominateur)",
  denomChamp2: "Conditions d'existence",
  denomFactorisation: "Factorisation (dénominateur)",
  ceDirecte: "Condition d'existence",
  numReduction: "Réduction (numérateur)",
  numReductionP1: "Réduction (numérateur)",
  numReconnaissance: "Méthode (numérateur)",
  numChamp1: "Factorisation (numérateur)",
  numChamp2: "Racines (numérateur)",
  numFactorisation: "Factorisation (numérateur)",
  simplification: "Simplification",
};

export function AppSimplification() {
  const [etat, setEtat] = useState<EtatSessionSimplification>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function validerDenomReduction(reponse: string) {
    setEtat(soumettreReponseDenomReduction(etat, reponse));
  }

  function activerAideEtapeDenomReduction() {
    setEtat(activerAideDenomReduction(etat));
  }

  function validerDenomReductionP1(reponse: string) {
    setEtat(soumettreReponseDenomReductionP1(etat, reponse));
  }

  function activerAideEtapeDenomReductionP1() {
    setEtat(activerAideDenomReductionP1(etat));
  }

  function validerNumReduction(reponse: string) {
    setEtat(soumettreReponseNumReduction(etat, reponse));
  }

  function activerAideEtapeNumReduction() {
    setEtat(activerAideNumReduction(etat));
  }

  function validerNumReductionP1(reponse: string) {
    setEtat(soumettreReponseNumReductionP1(etat, reponse));
  }

  function activerAideEtapeNumReductionP1() {
    setEtat(activerAideNumReductionP1(etat));
  }

  function choisirDenomCategorie(choix: Categorie) {
    setEtat(soumettreChoixDenomCategorie(etat, choix));
  }

  function validerDenomChamp1(reponse: string) {
    setEtat(soumettreReponseDenomChamp1(etat, reponse));
  }

  function validerDenomChamp2(racines: [number, number]) {
    setEtat(soumettreReponseDenomChamp2(etat, racines));
  }

  function validerDenomFactorisation(reponse: string) {
    setEtat(soumettreReponseDenomFactorisation(etat, reponse));
  }

  function validerCEDirecte(reponse: string) {
    setEtat(soumettreReponseCEDirecte(etat, reponse));
  }

  function choisirNumCategorie(choix: Categorie) {
    setEtat(soumettreChoixNumCategorie(etat, choix));
  }

  function validerNumChamp1(reponse: string) {
    setEtat(soumettreReponseNumChamp1(etat, reponse));
  }

  function validerNumChamp2(racines: [number, number]) {
    setEtat(soumettreReponseNumChamp2(etat, racines));
  }

  function validerNumFactorisation(reponse: string) {
    setEtat(soumettreReponseNumFactorisation(etat, reponse));
  }

  function validerSimplification(numerateur: string, denominateur: string) {
    const exerciceTermine = etat.exerciceCourant;
    const nouvelEtat = soumettreReponseSimplification(etat, numerateur, denominateur);
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  function activerAideEtapeDenomChamp1() {
    setEtat(activerAideDenomChamp1(etat));
  }

  function activerAideEtapeDenomChamp2() {
    setEtat(activerAideDenomChamp2(etat));
  }

  function activerAideEtapeDenomFactorisation() {
    setEtat(activerAideDenomFactorisation(etat));
  }

  function activerAideEtapeNumChamp1() {
    setEtat(activerAideNumChamp1(etat));
  }

  function activerAideEtapeNumChamp2() {
    setEtat(activerAideNumChamp2(etat));
  }

  function activerAideEtapeNumFactorisation() {
    setEtat(activerAideNumFactorisation(etat));
  }

  function activerAideEtapeSimplification() {
    setEtat(activerAideSimplification(etat));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const recapitulatif = calculerRecapitulatifSimplification(etat);
  const etatActuel = calculerEtatActuelSimplification(etat);
  const { tentativesUtilisees } = etat.etapeCourante;
  const { tentativesMax } = etat.reglages;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionSimplification(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as TypeFraction)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Simplifier une fraction rationnelle</h1>
        <p className="app-subtitle">Fractions rationnelles avec conditions d'existence</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-step">
                Exercice {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
              </span>
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="card-body">
          {enCoursDeSession && <p className="prompt-text">{CONSIGNE_GENERALE}</p>}
          {dernierBilan ? (
            <ResultatPanelSimplification
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionSimplification resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "denomReduction" ? (
            <>
              <FractionHeader exercice={etat.exerciceCourant} />
              <EtatActuelPanel latex={etatActuel} />
              <EtapeReductionCoefficients
                exercice={etat.exerciceCourant.denominateur as Exercice}
                nom="dénominateur"
                variante="miseEnEvidence"
                prefixeExpression="D(x)"
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                diagnostiquer={(v) => diagnostiquerMiseEnEvidenceFraction(etat.exerciceCourant.denominateur as Exercice, v)}
                aideActivee={etat.aideDenomReductionUtilisee}
                onActiverAide={activerAideEtapeDenomReduction}
                onValider={validerDenomReduction}
              />
            </>
          ) : etat.phase === "denomReductionP1" ? (
            <>
              <FractionHeader exercice={etat.exerciceCourant} />
              <EtatActuelPanel latex={etatActuel} />
              <EtapeReductionCoefficients
                exercice={etat.exerciceCourant.denominateur as PolynomeLineaire}
                nom="dénominateur"
                variante="miseEnEvidence"
                prefixeExpression="D(x)"
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                diagnostiquer={(v) => diagnostiquerMiseEnEvidenceP1(etat.exerciceCourant.denominateur as PolynomeLineaire, v)}
                aideActivee={etat.aideDenomReductionP1Utilisee}
                onActiverAide={activerAideEtapeDenomReductionP1}
                onValider={validerDenomReductionP1}
              />
            </>
          ) : etat.phase === "denomReconnaissance" ? (
            <>
              <FractionHeader exercice={etat.exerciceCourant} />
              <EtatActuelPanel latex={etatActuel} />
              <EtapeReconnaissance
                exercice={etat.exerciceCourant.denominateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationDenominateur(etat.exerciceCourant.denominateur as Exercice)}
                question={QUESTION_FACTORISATION_DENOMINATEUR}
                onChoisir={choisirDenomCategorie}
              />
            </>
          ) : etat.phase === "denomChamp1" ? (
            <>
              <FractionHeader exercice={etat.exerciceCourant} />
              <EtatActuelPanel latex={etatActuel} />
              <EtapeChamp1
                exercice={etat.exerciceCourant.denominateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationDenominateur(etat.exerciceCourant.denominateur as Exercice)}
                labelFactorisation={LABEL_FACTORISATION_DENOMINATEUR}
                diagnostiquer={(v) => diagnostiquerChampPrincipal(etat.exerciceCourant.denominateur as Exercice, v)}
                aideActivee={etat.aideDenomChamp1Utilisee}
                onActiverAide={activerAideEtapeDenomChamp1}
                onValider={validerDenomChamp1}
              />
            </>
          ) : etat.phase === "denomChamp2" ? (
            <>
              <FractionHeader exercice={etat.exerciceCourant} />
              <EtatActuelPanel latex={etatActuel} />
              <EtapeRacinesFlexibles
                exercice={etat.exerciceCourant.denominateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                labelChamp="Conditions d'existence (CE)"
                libellePasDe="Pas de CE"
                libelleAuMoins="Au moins une CE"
                placeholderPrefixe="CE"
                prefixeChamp="x \neq"
                expressionAffichee={formatFractionPourCE(etat.exerciceCourant)}
                question={QUESTION_CE}
                texteAide="Une fois le dénominateur factorisé, chaque facteur égalé à 0 donne une condition d'existence (CE)."
                aideActivee={etat.aideDenomChamp2Utilisee}
                onActiverAide={activerAideEtapeDenomChamp2}
                onValider={validerDenomChamp2}
              />
            </>
          ) : etat.phase === "denomFactorisation" ? (
            <>
              <FractionHeader exercice={etat.exerciceCourant} />
              <EtatActuelPanel latex={etatActuel} />
              <EtapeChamp1
                exercice={etat.exerciceCourant.denominateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationDenominateur(etat.exerciceCourant.denominateur as Exercice)}
                labelFactorisation="Forme factorisée"
                etapeFactorisationForcee
                diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(etat.exerciceCourant.denominateur as Exercice, v)}
                aideActivee={etat.aideDenomFactorisationUtilisee}
                onActiverAide={activerAideEtapeDenomFactorisation}
                onValider={validerDenomFactorisation}
              />
            </>
          ) : etat.phase === "ceDirecte" ? (
            <EtapeCEDirecte
              exercice={etat.exerciceCourant}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              onValider={validerCEDirecte}
            />
          ) : etat.phase === "numReduction" ? (
            <>
              <FractionHeader exercice={etat.exerciceCourant} />
              <EtatActuelPanel latex={etatActuel} />
              <EtapeReductionCoefficients
                exercice={etat.exerciceCourant.numerateur as Exercice}
                nom="numérateur"
                variante="miseEnEvidence"
                prefixeExpression="N(x)"
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                diagnostiquer={(v) => diagnostiquerMiseEnEvidenceFraction(etat.exerciceCourant.numerateur as Exercice, v)}
                aideActivee={etat.aideNumReductionUtilisee}
                onActiverAide={activerAideEtapeNumReduction}
                onValider={validerNumReduction}
              />
            </>
          ) : etat.phase === "numReconnaissance" ? (
            <>
              <FractionHeader exercice={etat.exerciceCourant} />
              <EtatActuelPanel latex={etatActuel} />
              <EtapeReconnaissance
                exercice={etat.exerciceCourant.numerateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationNumerateur(etat.exerciceCourant.numerateur as Exercice)}
                question={QUESTION_FACTORISATION_NUMERATEUR}
                onChoisir={choisirNumCategorie}
              />
            </>
          ) : etat.phase === "numChamp1" ? (
            <>
              <FractionHeader exercice={etat.exerciceCourant} />
              <EtatActuelPanel latex={etatActuel} />
              <EtapeChamp1
                exercice={etat.exerciceCourant.numerateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationNumerateur(etat.exerciceCourant.numerateur as Exercice)}
                labelFactorisation={LABEL_FACTORISATION_NUMERATEUR}
                diagnostiquer={(v) => diagnostiquerChampPrincipal(etat.exerciceCourant.numerateur as Exercice, v)}
                aideActivee={etat.aideNumChamp1Utilisee}
                onActiverAide={activerAideEtapeNumChamp1}
                onValider={validerNumChamp1}
              />
            </>
          ) : etat.phase === "numChamp2" ? (
            <>
              <FractionHeader exercice={etat.exerciceCourant} />
              <EtatActuelPanel latex={etatActuel} />
              <EtapeRacinesFlexibles
                exercice={etat.exerciceCourant.numerateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationNumerateur(etat.exerciceCourant.numerateur as Exercice)}
                prefixeChamp="x ="
                aideActivee={etat.aideNumChamp2Utilisee}
                onActiverAide={activerAideEtapeNumChamp2}
                onValider={validerNumChamp2}
              />
            </>
          ) : etat.phase === "numFactorisation" ? (
            <>
              <FractionHeader exercice={etat.exerciceCourant} />
              <EtatActuelPanel latex={etatActuel} />
              <EtapeChamp1
                exercice={etat.exerciceCourant.numerateur as Exercice}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                expressionAffichee={formatEquationNumerateur(etat.exerciceCourant.numerateur as Exercice)}
                labelFactorisation="Forme factorisée"
                etapeFactorisationForcee
                diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(etat.exerciceCourant.numerateur as Exercice, v)}
                aideActivee={etat.aideNumFactorisationUtilisee}
                onActiverAide={activerAideEtapeNumFactorisation}
                onValider={validerNumFactorisation}
              />
            </>
          ) : etat.phase === "numReductionP1" ? (
            <>
              <FractionHeader exercice={etat.exerciceCourant} />
              <EtatActuelPanel latex={etatActuel} />
              <EtapeReductionCoefficients
                exercice={etat.exerciceCourant.numerateur as PolynomeLineaire}
                nom="numérateur"
                variante="miseEnEvidence"
                prefixeExpression="N(x)"
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                recapitulatif={recapitulatif}
                diagnostiquer={(v) => diagnostiquerMiseEnEvidenceP1(etat.exerciceCourant.numerateur as PolynomeLineaire, v)}
                aideActivee={etat.aideNumReductionP1Utilisee}
                onActiverAide={activerAideEtapeNumReductionP1}
                onValider={validerNumReductionP1}
              />
            </>
          ) : (
            <EtapeSimplification
              exercice={etat.exerciceCourant}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel}
              diagnostiquer={(n, d) => diagnostiquerSimplification(etat.exerciceCourant, n, d)}
              aideActivee={etat.aideSimplificationUtilisee}
              onActiverAide={activerAideEtapeSimplification}
              onValider={validerSimplification}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
