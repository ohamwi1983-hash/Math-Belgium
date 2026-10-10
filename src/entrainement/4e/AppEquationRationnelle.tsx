import { useState } from "react";
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
import type {
  EtatSessionEquationRationnelle,
  PhaseEquationRationnelle,
  ResultatExerciceEquationRationnelle,
} from "./moteur/typesEquationRationnelle";
import { diagnostiquerChampPrincipal, diagnostiquerFactorisationCasGeneral, diagnostiquerIsolement } from "./moteur/verification";
import { diagnostiquerFractionSimplifiee, diagnostiquerSimplifierToutes } from "./moteur/verificationEquationRationnelle";
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
import { ResultatPanelEquationRationnelle } from "./components/ResultatPanelEquationRationnelle";
import { ResumeSessionEquationRationnelle } from "./components/ResumeSessionEquationRationnelle";
import { calculerRecapitulatifEquationRationnelle } from "./ui/recapitulatifEquationRationnelle";
import {
  formatEquationRationnelleLatex,
  formatEquationRationnelleLatexApresSimplification,
  formatFractionGaucheFactorisee,
  formatRappelEquationRationnelle,
} from "./ui/formatEquationRationnelle";
import { formatEquationDenominateur, formatEquationNumerateur } from "./ui/formatSimplification";

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

interface Bilan {
  resultat: ResultatExerciceEquationRationnelle;
  exercice: ExerciceEquationRationnelle;
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

export function AppEquationRationnelle() {
  const [etat, setEtat] = useState<EtatSessionEquationRationnelle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function validerCE(valeurs: number[]) {
    setEtat(soumettreReponseCE(etat, valeurs));
  }

  function validerSimplifier(reponses: Array<{ numerateur: string; denominateur: string }>) {
    setEtat(soumettreReponseSimplifier(etat, reponses));
  }

  function validerSimplifierReduction(reponse: string) {
    setEtat(soumettreReponseSimplifierReduction(etat, reponse));
  }

  function activerAideEtapeSimplifierReduction() {
    setEtat(activerAideSimplifierReduction(etat));
  }

  function choisirSimplifierCategorie(choix: Categorie) {
    setEtat(soumettreChoixSimplifierCategorie(etat, choix));
  }

  function validerSimplifierChamp1(reponse: string) {
    setEtat(soumettreReponseSimplifierChamp1(etat, reponse));
  }

  function validerSimplifierChamp2(racines: [number, number]) {
    setEtat(soumettreReponseSimplifierChamp2(etat, racines));
  }

  function validerSimplifierFactorisation(reponse: string) {
    setEtat(soumettreReponseSimplifierFactorisation(etat, reponse));
  }

  function validerSimplifierFraction(numerateur: string, denominateur: string) {
    setEtat(soumettreReponseSimplifierFraction(etat, numerateur, denominateur));
  }

  function validerIsolement(reponse: string) {
    setEtat(soumettreReponseIsolement(etat, reponse));
  }

  function choisirCategorie(choix: Categorie) {
    setEtat(soumettreChoixCategorie(etat, choix));
  }

  function validerChamp1(reponse: string) {
    setEtat(soumettreReponseChamp1(etat, reponse));
  }

  function validerChamp2(racines: [number, number]) {
    setEtat(soumettreReponseChamp2(etat, racines));
  }

  function validerRacinesEtrangeres(reponses: boolean[]) {
    const exerciceTermine = etat.exerciceCourant;
    const nouvelEtat = soumettreReponseRacinesEtrangeres(etat, reponses);
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  function activerAideEtapeCe() {
    setEtat(activerAideCe(etat));
  }

  function activerAideEtapeSimplifierChamp1() {
    setEtat(activerAideSimplifierChamp1(etat));
  }

  function activerAideEtapeSimplifierChamp2() {
    setEtat(activerAideSimplifierChamp2(etat));
  }

  function activerAideEtapeSimplifierFactorisation() {
    setEtat(activerAideSimplifierFactorisation(etat));
  }

  function activerAideEtapeSimplifierFraction() {
    setEtat(activerAideSimplifierFraction(etat));
  }

  function activerAideEtapeIsolement() {
    setEtat(activerAideIsolement(etat));
  }

  function activerAideEtapeChamp1() {
    setEtat(activerAideChamp1(etat));
  }

  function activerAideEtapeChamp2() {
    setEtat(activerAideChamp2(etat));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const recapitulatif = calculerRecapitulatifEquationRationnelle(etat);
  const { tentativesUtilisees } = etat.etapeCourante;
  const { tentativesMax } = etat.reglages;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionEquationRationnelle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteEquationRationnelleId)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">L'inconnue au dénominateur</h1>
        <p className="app-subtitle">Équations rationnelles</p>
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
          {dernierBilan ? (
            <ResultatPanelEquationRationnelle
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionEquationRationnelle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : (
            <>
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
                  onValider={(reponse) => validerCE([Number(reponse)])}
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
                  onActiverAide={activerAideEtapeCe}
                  onValider={validerCE}
                />
              ) : etat.phase === "simplifier" ? (
                <EtapeSimplifierFractions
                  fractions={etat.exerciceCourant.fractionsSimplifiables}
                  expressionAffichee={formatEquationRationnelleLatex(etat.exerciceCourant)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  recapitulatif={recapitulatif}
                  diagnostiquer={(reponses) => diagnostiquerSimplifierToutes(etat.exerciceCourant.fractionsSimplifiables, reponses)}
                  onValider={validerSimplifier}
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
                  onActiverAide={activerAideEtapeSimplifierReduction}
                  onValider={validerSimplifierReduction}
                />
              ) : etat.phase === "simplifierReconnaissance" ? (
                <EtapeReconnaissance
                  exercice={p2DeFractionGauche(etat.exerciceCourant)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  recapitulatif={recapitulatif}
                  expressionAffichee={expressionP2(etat.exerciceCourant)}
                  question={QUESTION_FACTORISATION_FRACTION}
                  onChoisir={choisirSimplifierCategorie}
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
                  onActiverAide={activerAideEtapeSimplifierChamp1}
                  onValider={validerSimplifierChamp1}
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
                  onActiverAide={activerAideEtapeSimplifierChamp2}
                  onValider={validerSimplifierChamp2}
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
                  onActiverAide={activerAideEtapeSimplifierFactorisation}
                  onValider={validerSimplifierFactorisation}
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
                  onActiverAide={activerAideEtapeSimplifierFraction}
                  onValider={validerSimplifierFraction}
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
                  onActiverAide={activerAideEtapeIsolement}
                  onValider={validerIsolement}
                />
              ) : etat.phase === "reconnaissance" ? (
                <EtapeReconnaissance
                  exercice={etat.exerciceCourant.equationIsolee}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  recapitulatif={recapitulatif}
                  question={QUESTION_FACTORISATION}
                  onChoisir={choisirCategorie}
                />
              ) : etat.phase === "champ1" ? (
                <EtapeChamp1
                  exercice={etat.exerciceCourant.equationIsolee}
                  diagnostiquer={(v) => diagnostiquerChampPrincipal(etat.exerciceCourant.equationIsolee, v)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  recapitulatif={recapitulatif}
                  aideActivee={etat.aideChamp1Utilisee}
                  onActiverAide={activerAideEtapeChamp1}
                  onValider={validerChamp1}
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
                  onActiverAide={activerAideEtapeChamp2}
                  onValider={validerChamp2}
                />
              ) : (
                <EtapeRacinesEtrangeres
                  exercice={etat.exerciceCourant}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  recapitulatif={recapitulatif}
                  onValider={validerRacinesEtrangeres}
                />
              )}
            </>
          )}{" "}
        </div>
      </main>
    </div>
  );
}
