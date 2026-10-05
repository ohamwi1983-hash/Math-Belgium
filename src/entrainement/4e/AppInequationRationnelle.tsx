import { useState } from "react";
import type { Categorie, Exercice } from "./core/generateur.types";
import type {
  ExerciceInequationRationnelle,
  ExerciceInequationRationnelleFacteurCommun,
  GrilleQuotient,
  GrilleQuotientCubique,
  GrilleQuotientNiveau3,
  GrilleQuotientNiveau4,
  GrilleQuotientSansFacteurCommun,
  ReglagesInequationRationnelle,
} from "./core/inequationRationnelle.types";
import type { PolynomeLineaire } from "./core/simplification.types";
import type { SolutionEnsembleProduit } from "./core/signesProduit.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideCe,
  activerAideChamp1,
  activerAideChamp2,
  activerAideCombiner,
  activerAideDenomChamp1,
  activerAideDenomFactorisation,
  activerAideDenomReduction,
  activerAideFactorisation,
  activerAideIntervalleQuotient,
  activerAideIsoler,
  activerAideMiseEnEvidence,
  activerAideReduction,
  activerAideSimplifierDenomChamp1,
  activerAideSimplifierDenomChamp2,
  activerAideSimplifierDenomFactorisation,
  activerAideSimplifierDenomReduction,
  activerAideSimplifierFraction,
  activerAideSimplifierNumChamp1,
  activerAideSimplifierNumChamp2,
  activerAideSimplifierNumFactorisation,
  activerAideSimplifierNumReduction,
  demarrerSessionInequationRationnelle,
  soumettreChoixSimplifierDenomCategorie,
  soumettreChoixSimplifierNumCategorie,
  soumettreReponseCE,
  soumettreReponseCEListe,
  soumettreReponseChamp1,
  soumettreReponseChamp2,
  soumettreReponseCombiner,
  soumettreReponseDenomChamp1,
  soumettreReponseDenomFactorisation,
  soumettreReponseDenomReconnaissance,
  soumettreReponseDenomReduction,
  soumettreReponseFactorisation,
  soumettreReponseGrille,
  soumettreReponseGrilleCubique,
  soumettreReponseGrilleNiveau3,
  soumettreReponseGrilleNiveau4,
  soumettreReponseIntervalle,
  soumettreReponseIsoler,
  soumettreReponseMiseEnEvidence,
  soumettreReponseRacineNumerateur,
  soumettreReponseReconnaissance,
  soumettreReponseReduction,
  soumettreReponseSimplifierDenomChamp1,
  soumettreReponseSimplifierDenomChamp2,
  soumettreReponseSimplifierDenomFactorisation,
  soumettreReponseSimplifierDenomReduction,
  soumettreReponseSimplifierFraction,
  soumettreReponseSimplifierNumChamp1,
  soumettreReponseSimplifierNumChamp2,
  soumettreReponseSimplifierNumFactorisation,
  soumettreReponseSimplifierNumReduction,
} from "./moteur/sessionInequationRationnelle";
import type {
  EtatSessionInequationRationnelle,
  PhaseInequationRationnelle,
  ResultatExerciceInequationRationnelle,
} from "./moteur/sessionInequationRationnelle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurInequationRationnelle } from "./generateurs/inequationRationnelle";
import type { NiveauInequationRationnelle } from "./core/inequationRationnelle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { diagnostiquerChampPrincipal, diagnostiquerFactorisationCasGeneral } from "./moteur/verification";
import {
  diagnostiquerMiseEnEvidenceFraction,
  diagnostiquerReductionCoefficients,
  diagnostiquerSimplification,
} from "./moteur/verificationSimplification";
import { diagnostiquerMiseEnEvidenceCubique } from "./moteur/expressionAlgebrique";
import {
  diagnostiquerCombiner,
  diagnostiquerCombinerQuadratique,
  diagnostiquerIsolementDenominateurCarre,
  diagnostiquerIsolementRationnelle,
  diagnostiquerIsolementRationnelleNiveau3,
  diagnostiquerIsolementRationnelleNiveau4,
  diagnostiquerIsolementSansFacteurCommun,
} from "./moteur/verificationInequationRationnelle";
import { EtapeCEDirecte } from "./components/EtapeCEDirecte";
import { EtapeIsolement } from "./components/EtapeIsolement";
import { EtapeRacinesFlexibles } from "./components/EtapeRacinesFlexibles";
import { EtapeReconnaissance } from "./components/EtapeReconnaissance";
import { EtapeChamp1 } from "./components/EtapeChamp1";
import { EtapeReductionCoefficients } from "./components/EtapeReductionCoefficients";
import { EtapeSimplification } from "./components/EtapeSimplification";
import { EtapeGrilleQuotient } from "./components/EtapeGrilleQuotient";
import { EtapeGrilleQuotientNiveau3 } from "./components/EtapeGrilleQuotientNiveau3";
import { EtapeGrilleQuotientNiveau4 } from "./components/EtapeGrilleQuotientNiveau4";
import { EtapeGrilleQuotientDenominateurCarre } from "./components/EtapeGrilleQuotientDenominateurCarre";
import { EtapeGrilleQuotientFacteurCommun } from "./components/EtapeGrilleQuotientFacteurCommun";
import { EtapeGrilleQuotientSansFacteurCommun } from "./components/EtapeGrilleQuotientSansFacteurCommun";
import { EtapeGrilleQuotientCubique } from "./components/EtapeGrilleQuotientCubique";
import { EtapeIntervalleQuotient } from "./components/EtapeIntervalleQuotient";
import { ResultatPanelInequationRationnelle } from "./components/ResultatPanelInequationRationnelle";
import { ResumeSessionInequationRationnelle } from "./components/ResumeSessionInequationRationnelle";
import { calculerRecapitulatifInequationRationnelle } from "./ui/recapitulatifInequationRationnelle";
import {
  calculerEtatActuelInequationRationnelle,
  calculerEtatActuelNumerateurCombine,
  numerateurCombineEstFactorise,
} from "./ui/etatActuelInequationRationnelle";
import {
  formatEnonceCombineDenominateurCarreLatex,
  formatEnonceCombineNiveau3Latex,
  formatEnonceCombineNiveau4Latex,
  formatEnonceCombineSansFacteurCommunLatex,
  formatEnonceCubiqueLatex,
  formatEnonceFacteurCommunLatex,
  formatEnonceInequationRationnelleLatex,
  formatEnonceOriginalComplet,
  formatEnonceOriginalDenominateurCarreLatex,
  formatEnonceOriginalNiveau2Latex,
  formatEnonceOriginalNiveau3Latex,
  formatEnonceOriginalNiveau4Latex,
  formatEnonceOriginalSansFacteurCommunLatex,
  formatExpressionIsoleeDenominateurCarreLatex,
  formatExpressionIsoleeLatex,
  formatExpressionIsoleeNiveau3Latex,
  formatExpressionIsoleeNiveau4Latex,
  formatExpressionIsoleeSansFacteurCommunLatex,
} from "./ui/formatInequationRationnelle";
import { formatEquationDenominateur, formatEquationNumerateur } from "./ui/formatSimplification";
import { formatLineaireDeveloppe } from "./ui/formatSignesProduit";
import { formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "./ui/formatEquation";

/** `fraction.denominateur`/`.numerateur` sont toujours des P2 pour le type "P2/P2" (seul type utilisé par facteurCommun). */
function estPolynomeLineaire(poly: Exercice | PolynomeLineaire): poly is PolynomeLineaire {
  return "k" in poly;
}
function denominateurFacteurCommun(exercice: ExerciceInequationRationnelleFacteurCommun): Exercice {
  const d = exercice.fraction.denominateur;
  if (estPolynomeLineaire(d)) throw new Error("denominateurFacteurCommun : attendu un P2");
  return d;
}
function numerateurFacteurCommun(exercice: ExerciceInequationRationnelleFacteurCommun): Exercice {
  const n = exercice.fraction.numerateur;
  if (estPolynomeLineaire(n)) throw new Error("numerateurFacteurCommun : attendu un P2");
  return n;
}

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

const REGLAGES_NIVEAU: ReglagesInequationRationnelle = {
  niveauxActifs: ["niveau1", "niveau2", "niveau3", "niveau4", "denominateurCarre", "facteurCommun", "sansFacteurCommun", "cubique"],
  repartition: "equilibre",
};

function nouvelleSession(): EtatSessionInequationRationnelle {
  return demarrerSessionInequationRationnelle(REGLAGES_DEMO, creerGenerateurInequationRationnelle(REGLAGES_NIVEAU));
}

interface Bilan {
  resultat: ResultatExerciceInequationRationnelle;
  exercice: ExerciceInequationRationnelle;
}

const LIBELLE_PHASE: Record<PhaseInequationRationnelle, string> = {
  isoler: "Isoler",
  combiner: "Combiner",
  ce: "Condition d'existence",
  racineNumerateur: "Racine du numérateur",
  denomReduction: "Réduction (dénominateur)",
  denomReconnaissance: "Méthode (dénominateur)",
  denomChamp1: "Factorisation (dénominateur)",
  denomFactorisation: "Forme factorisée (dénominateur)",
  miseEnEvidence: "Mise en évidence",
  reduction: "Réduction (numérateur combiné)",
  reconnaissance: "Méthode (numérateur combiné)",
  champ1: "Factorisation (numérateur combiné)",
  champ2: "Racines (numérateur combiné)",
  factorisation: "Forme factorisée (numérateur combiné)",
  simplifierDenomReduction: "Réduction (dénominateur)",
  simplifierDenomReconnaissance: "Méthode (dénominateur)",
  simplifierDenomChamp1: "Factorisation (dénominateur)",
  simplifierDenomChamp2: "Racines (dénominateur)",
  simplifierDenomFactorisation: "Forme factorisée (dénominateur)",
  simplifierNumReduction: "Réduction (numérateur)",
  simplifierNumReconnaissance: "Méthode (numérateur)",
  simplifierNumChamp1: "Factorisation (numérateur)",
  simplifierNumChamp2: "Racines (numérateur)",
  simplifierNumFactorisation: "Forme factorisée (numérateur)",
  simplifierFraction: "Simplification",
  grille: "Tableau de signes",
  intervalle: "Ensemble-solution",
};

export function AppInequationRationnelle() {
  const [etat, setEtat] = useState<EtatSessionInequationRationnelle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function validerIsoler(reponse: string) {
    setEtat(soumettreReponseIsoler(etat, reponse));
  }

  function validerCombiner(reponse: string) {
    setEtat(soumettreReponseCombiner(etat, reponse));
  }

  function validerCE(reponse: string) {
    setEtat(soumettreReponseCE(etat, reponse));
  }

  function validerCEListe(reponses: [number, number]) {
    setEtat(soumettreReponseCEListe(etat, reponses));
  }

  function validerRacineNumerateur(reponse: string) {
    setEtat(soumettreReponseRacineNumerateur(etat, reponse));
  }

  function validerDenomReduction(reponse: string) {
    setEtat(soumettreReponseDenomReduction(etat, reponse));
  }

  function validerDenomReconnaissance(choix: Categorie) {
    setEtat(soumettreReponseDenomReconnaissance(etat, choix));
  }

  function validerDenomChamp1(reponse: string) {
    setEtat(soumettreReponseDenomChamp1(etat, reponse));
  }

  function validerDenomFactorisation(reponse: string) {
    setEtat(soumettreReponseDenomFactorisation(etat, reponse));
  }

  function validerMiseEnEvidence(reponse: string) {
    setEtat(soumettreReponseMiseEnEvidence(etat, reponse));
  }

  function validerReduction(reponse: string) {
    setEtat(soumettreReponseReduction(etat, reponse));
  }

  function validerReconnaissance(choix: Categorie) {
    setEtat(soumettreReponseReconnaissance(etat, choix));
  }

  function validerChamp1(reponse: string) {
    setEtat(soumettreReponseChamp1(etat, reponse));
  }

  function validerChamp2(racines: [number, number]) {
    setEtat(soumettreReponseChamp2(etat, racines));
  }

  function validerFactorisation(reponse: string) {
    setEtat(soumettreReponseFactorisation(etat, reponse));
  }

  function validerGrille(reponse: GrilleQuotient) {
    setEtat(soumettreReponseGrille(etat, reponse));
  }

  function validerGrilleNiveau3(reponse: GrilleQuotientNiveau3) {
    setEtat(soumettreReponseGrilleNiveau3(etat, reponse));
  }

  function validerGrilleNiveau4(reponse: GrilleQuotientNiveau4) {
    setEtat(soumettreReponseGrilleNiveau4(etat, reponse));
  }

  function validerGrilleDenominateurCarre(reponse: GrilleQuotientNiveau3) {
    setEtat(soumettreReponseGrilleNiveau3(etat, reponse));
  }

  function validerGrilleSansFacteurCommun(reponse: GrilleQuotientSansFacteurCommun) {
    setEtat(soumettreReponseGrilleNiveau4(etat, reponse));
  }

  function validerGrilleCubique(reponse: GrilleQuotientCubique) {
    setEtat(soumettreReponseGrilleCubique(etat, reponse));
  }

  function validerSimplifierDenomReduction(reponse: string) {
    setEtat(soumettreReponseSimplifierDenomReduction(etat, reponse));
  }

  function validerSimplifierDenomCategorie(choix: Categorie) {
    setEtat(soumettreChoixSimplifierDenomCategorie(etat, choix));
  }

  function validerSimplifierDenomChamp1(reponse: string) {
    setEtat(soumettreReponseSimplifierDenomChamp1(etat, reponse));
  }

  function validerSimplifierDenomChamp2(racines: [number, number]) {
    setEtat(soumettreReponseSimplifierDenomChamp2(etat, racines));
  }

  function validerSimplifierDenomFactorisation(reponse: string) {
    setEtat(soumettreReponseSimplifierDenomFactorisation(etat, reponse));
  }

  function validerSimplifierNumReduction(reponse: string) {
    setEtat(soumettreReponseSimplifierNumReduction(etat, reponse));
  }

  function validerSimplifierNumCategorie(choix: Categorie) {
    setEtat(soumettreChoixSimplifierNumCategorie(etat, choix));
  }

  function validerSimplifierNumChamp1(reponse: string) {
    setEtat(soumettreReponseSimplifierNumChamp1(etat, reponse));
  }

  function validerSimplifierNumChamp2(racines: [number, number]) {
    setEtat(soumettreReponseSimplifierNumChamp2(etat, racines));
  }

  function validerSimplifierNumFactorisation(reponse: string) {
    setEtat(soumettreReponseSimplifierNumFactorisation(etat, reponse));
  }

  function validerSimplifierFraction(numerateur: string, denominateur: string) {
    setEtat(soumettreReponseSimplifierFraction(etat, numerateur, denominateur));
  }

  function activerAide() {
    setEtat(activerAideIntervalleQuotient(etat));
  }

  function activerAideEtapeIsoler() {
    setEtat(activerAideIsoler(etat));
  }

  function activerAideEtapeCombiner() {
    setEtat(activerAideCombiner(etat));
  }

  function activerAideEtapeMiseEnEvidence() {
    setEtat(activerAideMiseEnEvidence(etat));
  }

  function activerAideEtapeCe() {
    setEtat(activerAideCe(etat));
  }

  function activerAideEtapeDenomReduction() {
    setEtat(activerAideDenomReduction(etat));
  }

  function activerAideEtapeDenomChamp1() {
    setEtat(activerAideDenomChamp1(etat));
  }

  function activerAideEtapeDenomFactorisation() {
    setEtat(activerAideDenomFactorisation(etat));
  }

  function activerAideEtapeReduction() {
    setEtat(activerAideReduction(etat));
  }

  function activerAideEtapeChamp1() {
    setEtat(activerAideChamp1(etat));
  }

  function activerAideEtapeChamp2() {
    setEtat(activerAideChamp2(etat));
  }

  function activerAideEtapeFactorisation() {
    setEtat(activerAideFactorisation(etat));
  }

  function activerAideEtapeSimplifierDenomReduction() {
    setEtat(activerAideSimplifierDenomReduction(etat));
  }

  function activerAideEtapeSimplifierDenomChamp1() {
    setEtat(activerAideSimplifierDenomChamp1(etat));
  }

  function activerAideEtapeSimplifierDenomChamp2() {
    setEtat(activerAideSimplifierDenomChamp2(etat));
  }

  function activerAideEtapeSimplifierDenomFactorisation() {
    setEtat(activerAideSimplifierDenomFactorisation(etat));
  }

  function activerAideEtapeSimplifierNumReduction() {
    setEtat(activerAideSimplifierNumReduction(etat));
  }

  function activerAideEtapeSimplifierNumChamp1() {
    setEtat(activerAideSimplifierNumChamp1(etat));
  }

  function activerAideEtapeSimplifierNumChamp2() {
    setEtat(activerAideSimplifierNumChamp2(etat));
  }

  function activerAideEtapeSimplifierNumFactorisation() {
    setEtat(activerAideSimplifierNumFactorisation(etat));
  }

  function activerAideEtapeSimplifierFraction() {
    setEtat(activerAideSimplifierFraction(etat));
  }

  function validerIntervalle(reponse: SolutionEnsembleProduit) {
    const exerciceTermine = etat.exerciceCourant;
    const nouvelEtat = soumettreReponseIntervalle(etat, reponse);
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionInequationRationnelle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as NiveauInequationRationnelle)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const recapitulatif = calculerRecapitulatifInequationRationnelle(etat);
  const etatActuel = calculerEtatActuelInequationRationnelle(etat);
  const etatActuelNumerateurCombine = calculerEtatActuelNumerateurCombine(etat);
  /**
   * Bloc "Énoncé" fixe (promptcorrectionsgenerateurs764transversal.md, générateur 6, point 2.1) —
   * l'inéquation de départ complète, identique quel que soit l'écran/la phase courante, passée à
   * `enonceFixe` sur chaque composant d'étape concerné. Chaque composant omet automatiquement son
   * propre `expressionAffichee` s'il duplique cette même chaîne (ex. l'écran "isoler", où
   * l'expression affichée EST l'énoncé de départ) — voir EtapeIsolement.tsx.
   */
  const enonceFixe = formatEnonceOriginalComplet(etat.exerciceCourant);
  const exerciceNiveau2 = etat.exerciceCourant.niveau === "niveau2" ? etat.exerciceCourant : undefined;
  const exerciceNiveau3 = etat.exerciceCourant.niveau === "niveau3" ? etat.exerciceCourant : undefined;
  const exerciceNiveau4 = etat.exerciceCourant.niveau === "niveau4" ? etat.exerciceCourant : undefined;
  const exerciceDenominateurCarre = etat.exerciceCourant.niveau === "denominateurCarre" ? etat.exerciceCourant : undefined;
  const exerciceFacteurCommun = etat.exerciceCourant.niveau === "facteurCommun" ? etat.exerciceCourant : undefined;
  const exerciceSansFacteurCommun = etat.exerciceCourant.niveau === "sansFacteurCommun" ? etat.exerciceCourant : undefined;
  const exerciceCubique = etat.exerciceCourant.niveau === "cubique" ? etat.exerciceCourant : undefined;
  const exerciceNumerateurLineaire =
    etat.exerciceCourant.niveau !== "niveau3" &&
    etat.exerciceCourant.niveau !== "niveau4" &&
    etat.exerciceCourant.niveau !== "denominateurCarre" &&
    etat.exerciceCourant.niveau !== "facteurCommun" &&
    etat.exerciceCourant.niveau !== "sansFacteurCommun" &&
    etat.exerciceCourant.niveau !== "cubique"
      ? etat.exerciceCourant
      : undefined;
  const exerciceNumerateurQuadratique =
    etat.exerciceCourant.niveau === "niveau3" ||
    etat.exerciceCourant.niveau === "niveau4" ||
    etat.exerciceCourant.niveau === "denominateurCarre" ||
    etat.exerciceCourant.niveau === "sansFacteurCommun" ||
    etat.exerciceCourant.niveau === "cubique"
      ? etat.exerciceCourant
      : undefined;

  /**
   * Bloc de travail "N(x) = ..." (numérateur combiné isolé), positionné APRÈS le bloc "État
   * actuel" (`etatActuelNumerateurCombine` ci-dessus — promptcorrectionsgenerateurs76complement.md,
   * point 2.3.1 : jamais l'inverse). Affiche N(x) sous sa forme factorisée dès que sa propre
   * factorisation est confirmée, jamais régressé vers la forme développée ensuite (point 2.3.3) —
   * même primitive `numerateurCombineEstFactorise` que le bloc "État actuel", jamais recalculée
   * différemment entre les deux. Pour `cubique`, `exercice.numerateur` ne représente que le facteur
   * quadratique RESTANT après mise en évidence de x (pas N(x) tout entier, voir
   * core/inequationRationnelle.types.ts) : le préfixe "N(x) =" y serait trompeur, remplacé par un
   * libellé textuel baké directement dans le LaTeX (même convention que formatLigneNumerateurLabel)
   * — ce bloc n'a plus de label externe séparé depuis la restructuration en 3 blocs (`expressionAffichee`
   * n'affiche qu'une simple équation-box, sans en-tête).
   */
  function blocNumerateurQuadratique(exercice: NonNullable<typeof exerciceNumerateurQuadratique>): string {
    const factorise = numerateurCombineEstFactorise(exercice, etat);
    const quadratique = factorise
      ? formatFormeFactoriseeDepuisRacines(exercice.numerateur.enonce, exercice.numerateur.solution.racines)
      : formatMembreGauche(exercice.numerateur.enonce);
    return exercice.niveau === "cubique" ? `\\text{Facteur quadratique restant : } ${quadratique}` : `N(x) = ${quadratique}`;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Inéquations rationnelles</h1>
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
            <ResultatPanelInequationRationnelle
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionInequationRationnelle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "isoler" && exerciceNiveau2 ? (
            <EtapeIsolement
              key="isoler"
              expressionAffichee={formatEnonceOriginalNiveau2Latex(exerciceNiveau2)}
              question="Réécris cette inéquation avec 0 au membre de droite."
              label="Inéquation isolée"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerIsolementRationnelle(v, exerciceNiveau2)}
              aideActivee={etat.aideIsolerUtilisee}
              onActiverAide={activerAideEtapeIsoler}
              onValider={validerIsoler}
            />
          ) : etat.phase === "isoler" && exerciceNiveau3 ? (
            <EtapeIsolement
              key="isoler"
              expressionAffichee={formatEnonceOriginalNiveau3Latex(exerciceNiveau3)}
              question="Réécris cette inéquation avec 0 au membre de droite."
              label="Inéquation isolée"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerIsolementRationnelleNiveau3(v, exerciceNiveau3)}
              aideActivee={etat.aideIsolerUtilisee}
              onActiverAide={activerAideEtapeIsoler}
              onValider={validerIsoler}
            />
          ) : etat.phase === "isoler" && exerciceNiveau4 ? (
            <EtapeIsolement
              key="isoler"
              expressionAffichee={formatEnonceOriginalNiveau4Latex(exerciceNiveau4)}
              question="Réécris cette inéquation avec 0 au membre de droite."
              label="Inéquation isolée"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerIsolementRationnelleNiveau4(v, exerciceNiveau4)}
              aideActivee={etat.aideIsolerUtilisee}
              onActiverAide={activerAideEtapeIsoler}
              onValider={validerIsoler}
            />
          ) : etat.phase === "isoler" && exerciceDenominateurCarre ? (
            <EtapeIsolement
              key="isoler"
              expressionAffichee={formatEnonceOriginalDenominateurCarreLatex(exerciceDenominateurCarre)}
              question="Réécris cette inéquation avec 0 au membre de droite."
              label="Inéquation isolée"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerIsolementDenominateurCarre(v, exerciceDenominateurCarre)}
              aideActivee={etat.aideIsolerUtilisee}
              onActiverAide={activerAideEtapeIsoler}
              onValider={validerIsoler}
            />
          ) : etat.phase === "isoler" && exerciceSansFacteurCommun ? (
            <EtapeIsolement
              key="isoler"
              expressionAffichee={formatEnonceOriginalSansFacteurCommunLatex(exerciceSansFacteurCommun)}
              question="Réécris cette inéquation avec 0 au membre de droite."
              label="Inéquation isolée"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerIsolementSansFacteurCommun(v, exerciceSansFacteurCommun)}
              aideActivee={etat.aideIsolerUtilisee}
              onActiverAide={activerAideEtapeIsoler}
              onValider={validerIsoler}
            />
          ) : etat.phase === "combiner" && exerciceNiveau2 ? (
            <EtapeIsolement
              key="combiner"
              expressionAffichee={formatExpressionIsoleeLatex(exerciceNiveau2)}
              question="Combine cette expression en une seule fraction. Quel est le numérateur obtenu ?"
              label={`Numérateur (dénominateur inchangé : ${formatLineaireDeveloppe(exerciceNiveau2.denominateur.k, exerciceNiveau2.denominateur.p)})`}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerCombiner(v, exerciceNiveau2.numerateur)}
              aideActivee={etat.aideCombinerUtilisee}
              onActiverAide={activerAideEtapeCombiner}
              onValider={validerCombiner}
            />
          ) : etat.phase === "combiner" && exerciceNiveau3 ? (
            <EtapeIsolement
              key="combiner"
              expressionAffichee={formatExpressionIsoleeNiveau3Latex(exerciceNiveau3)}
              question="Combine cette expression en une seule fraction. Quel est le numérateur obtenu (développé) ?"
              label={`Numérateur (dénominateur inchangé : ${formatLineaireDeveloppe(exerciceNiveau3.denominateur.k, exerciceNiveau3.denominateur.p)})`}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerCombinerQuadratique(v, exerciceNiveau3.numerateur)}
              aideActivee={etat.aideCombinerUtilisee}
              onActiverAide={activerAideEtapeCombiner}
              onValider={validerCombiner}
            />
          ) : etat.phase === "combiner" && exerciceNiveau4 ? (
            <EtapeIsolement
              key="combiner"
              expressionAffichee={formatExpressionIsoleeNiveau4Latex(exerciceNiveau4)}
              question="Combine cette expression en une seule fraction. Quel est le numérateur obtenu (développé) ?"
              label={`Numérateur (dénominateur inchangé : (${formatLineaireDeveloppe(exerciceNiveau4.denominateurGauche.k, exerciceNiveau4.denominateurGauche.p)})(${formatLineaireDeveloppe(exerciceNiveau4.denominateurDroit.k, exerciceNiveau4.denominateurDroit.p)}))`}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerCombinerQuadratique(v, exerciceNiveau4.numerateur)}
              aideActivee={etat.aideCombinerUtilisee}
              onActiverAide={activerAideEtapeCombiner}
              onValider={validerCombiner}
            />
          ) : etat.phase === "combiner" && exerciceDenominateurCarre ? (
            <EtapeIsolement
              key="combiner"
              expressionAffichee={formatExpressionIsoleeDenominateurCarreLatex(exerciceDenominateurCarre)}
              question="Combine cette expression en une seule fraction. Quel est le numérateur obtenu (développé) ?"
              label={`Numérateur (dénominateur inchangé : (${formatLineaireDeveloppe(exerciceDenominateurCarre.denominateur.k, exerciceDenominateurCarre.denominateur.p)})²)`}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerCombinerQuadratique(v, exerciceDenominateurCarre.numerateur)}
              aideActivee={etat.aideCombinerUtilisee}
              onActiverAide={activerAideEtapeCombiner}
              onValider={validerCombiner}
            />
          ) : etat.phase === "combiner" && exerciceSansFacteurCommun ? (
            <EtapeIsolement
              key="combiner"
              expressionAffichee={formatExpressionIsoleeSansFacteurCommunLatex(exerciceSansFacteurCommun)}
              question="Combine cette expression en une seule fraction. Quel est le numérateur obtenu (développé) ?"
              label={`Numérateur (dénominateur inchangé : ${formatMembreGauche(exerciceSansFacteurCommun.denominateur.enonce)})`}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerCombinerQuadratique(v, exerciceSansFacteurCommun.numerateur)}
              aideActivee={etat.aideCombinerUtilisee}
              onActiverAide={activerAideEtapeCombiner}
              onValider={validerCombiner}
            />
          ) : etat.phase === "denomReduction" && exerciceSansFacteurCommun ? (
            <EtapeReductionCoefficients
              key="denomReduction"
              exercice={exerciceSansFacteurCommun.denominateur}
              nom="dénominateur"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerReductionCoefficients(exerciceSansFacteurCommun.denominateur, v)}
              aideActivee={etat.aideDenomReductionUtilisee}
              onActiverAide={activerAideEtapeDenomReduction}
              onValider={validerDenomReduction}
            />
          ) : etat.phase === "denomReconnaissance" && exerciceSansFacteurCommun ? (
            <EtapeReconnaissance
              key="denomReconnaissance"
              exercice={exerciceSansFacteurCommun.denominateur}
              expressionAffichee={formatEquationDenominateur(exerciceSansFacteurCommun.denominateur)}
              question="Quelle est la méthode la plus rapide pour factoriser ce dénominateur ?"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onChoisir={validerDenomReconnaissance}
            />
          ) : etat.phase === "denomChamp1" && exerciceSansFacteurCommun ? (
            <EtapeChamp1
              key="denomChamp1"
              exercice={exerciceSansFacteurCommun.denominateur}
              expressionAffichee={formatEquationDenominateur(exerciceSansFacteurCommun.denominateur)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(exerciceSansFacteurCommun.denominateur, v)}
              aideActivee={etat.aideDenomChamp1Utilisee}
              onActiverAide={activerAideEtapeDenomChamp1}
              onValider={validerDenomChamp1}
            />
          ) : etat.phase === "denomFactorisation" && exerciceSansFacteurCommun ? (
            <EtapeChamp1
              key="denomFactorisation"
              exercice={exerciceSansFacteurCommun.denominateur}
              expressionAffichee={formatEquationDenominateur(exerciceSansFacteurCommun.denominateur)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              labelFactorisation="Forme factorisée"
              etapeFactorisationForcee
              diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(exerciceSansFacteurCommun.denominateur, v)}
              aideActivee={etat.aideDenomFactorisationUtilisee}
              onActiverAide={activerAideEtapeDenomFactorisation}
              onValider={validerDenomFactorisation}
            />
          ) : etat.phase === "ce" && exerciceSansFacteurCommun ? (
            <EtapeRacinesFlexibles
              key="ce"
              exercice={exerciceSansFacteurCommun.denominateur}
              expressionAffichee={formatEnonceCombineSansFacteurCommunLatex(exerciceSansFacteurCommun)}
              labelChamp="Conditions d'existence (CE)"
              libellePasDe="Pas de CE"
              libelleAuMoins="Au moins une CE"
              placeholderPrefixe="CE"
              prefixeChamp="x \neq"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              texteAide="Une fois le dénominateur factorisé, chaque facteur égalé à 0 donne une condition d'existence (CE)."
              aideActivee={etat.aideCeUtilisee}
              onActiverAide={activerAideEtapeCe}
              onValider={validerCEListe}
            />
          ) : etat.phase === "ce" && exerciceCubique ? (
            <EtapeCEDirecte
              key="ce"
              expressionAffichee={formatEnonceCubiqueLatex(exerciceCubique)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={validerCE}
            />
          ) : etat.phase === "miseEnEvidence" && exerciceCubique ? (
            <EtapeIsolement
              key="miseEnEvidence"
              expressionAffichee={formatEnonceCubiqueLatex(exerciceCubique)}
              question="Mets x en évidence dans ce numérateur."
              label="Factorisation"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerMiseEnEvidenceCubique(v, exerciceCubique.numerateur.enonce)}
              texteAide="Sors le facteur x du numérateur."
              aideActivee={etat.aideMiseEnEvidenceUtilisee}
              onActiverAide={activerAideEtapeMiseEnEvidence}
              onValider={validerMiseEnEvidence}
            />
          ) : etat.phase === "ce" && exerciceNiveau3 ? (
            <EtapeCEDirecte
              key="ce"
              expressionAffichee={formatEnonceCombineNiveau3Latex(exerciceNiveau3)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={validerCE}
            />
          ) : etat.phase === "ce" && exerciceDenominateurCarre ? (
            <EtapeCEDirecte
              key="ce"
              expressionAffichee={formatEnonceCombineDenominateurCarreLatex(exerciceDenominateurCarre)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={validerCE}
            />
          ) : etat.phase === "ce" && exerciceNiveau4 ? (
            <EtapeRacinesFlexibles
              key="ce"
              exercice={exerciceNiveau4.numerateur}
              expressionAffichee={formatEnonceCombineNiveau4Latex(exerciceNiveau4)}
              labelChamp="Conditions d'existence (CE)"
              libellePasDe="Pas de CE"
              libelleAuMoins="Au moins une CE"
              placeholderPrefixe="CE"
              prefixeChamp="x \neq"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              texteAide="Une fois le dénominateur factorisé, chaque facteur égalé à 0 donne une condition d'existence (CE)."
              aideActivee={etat.aideCeUtilisee}
              onActiverAide={activerAideEtapeCe}
              onValider={validerCEListe}
            />
          ) : etat.phase === "ce" && exerciceFacteurCommun ? (
            <EtapeRacinesFlexibles
              key="ce"
              exercice={denominateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEnonceFacteurCommunLatex(exerciceFacteurCommun)}
              labelChamp="Conditions d'existence (CE)"
              libellePasDe="Pas de CE"
              libelleAuMoins="Au moins une CE"
              placeholderPrefixe="CE"
              prefixeChamp="x \neq"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              texteAide="Une fois le dénominateur factorisé, chaque facteur égalé à 0 donne une condition d'existence (CE)."
              aideActivee={etat.aideCeUtilisee}
              onActiverAide={activerAideEtapeCe}
              onValider={validerCEListe}
            />
          ) : etat.phase === "simplifierDenomReduction" && exerciceFacteurCommun ? (
            <EtapeReductionCoefficients
              key="simplifierDenomReduction"
              exercice={denominateurFacteurCommun(exerciceFacteurCommun)}
              nom="dénominateur"
              variante="miseEnEvidence"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={[formatEquationDenominateur(denominateurFacteurCommun(exerciceFacteurCommun))]}
              etatActuel={etatActuel}
              diagnostiquer={(v) => diagnostiquerMiseEnEvidenceFraction(denominateurFacteurCommun(exerciceFacteurCommun), v)}
              aideActivee={etat.aideSimplifierDenomReductionUtilisee}
              onActiverAide={activerAideEtapeSimplifierDenomReduction}
              onValider={validerSimplifierDenomReduction}
            />
          ) : etat.phase === "simplifierDenomReconnaissance" && exerciceFacteurCommun ? (
            <EtapeReconnaissance
              key="simplifierDenomReconnaissance"
              exercice={denominateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationDenominateur(denominateurFacteurCommun(exerciceFacteurCommun))}
              question="Quelle est la méthode la plus rapide pour factoriser ce dénominateur ?"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel}
              onChoisir={validerSimplifierDenomCategorie}
            />
          ) : etat.phase === "simplifierDenomChamp1" && exerciceFacteurCommun ? (
            <EtapeChamp1
              key="simplifierDenomChamp1"
              exercice={denominateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationDenominateur(denominateurFacteurCommun(exerciceFacteurCommun))}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(denominateurFacteurCommun(exerciceFacteurCommun), v)}
              aideActivee={etat.aideSimplifierDenomChamp1Utilisee}
              onActiverAide={activerAideEtapeSimplifierDenomChamp1}
              onValider={validerSimplifierDenomChamp1}
            />
          ) : etat.phase === "simplifierDenomChamp2" && exerciceFacteurCommun ? (
            <EtapeRacinesFlexibles
              key="simplifierDenomChamp2"
              exercice={denominateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationDenominateur(denominateurFacteurCommun(exerciceFacteurCommun))}
              prefixeChamp="x ="
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel}
              aideActivee={etat.aideSimplifierDenomChamp2Utilisee}
              onActiverAide={activerAideEtapeSimplifierDenomChamp2}
              onValider={validerSimplifierDenomChamp2}
            />
          ) : etat.phase === "simplifierDenomFactorisation" && exerciceFacteurCommun ? (
            <EtapeChamp1
              key="simplifierDenomFactorisation"
              exercice={denominateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationDenominateur(denominateurFacteurCommun(exerciceFacteurCommun))}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel}
              labelFactorisation="Forme factorisée"
              etapeFactorisationForcee
              diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(denominateurFacteurCommun(exerciceFacteurCommun), v)}
              aideActivee={etat.aideSimplifierDenomFactorisationUtilisee}
              onActiverAide={activerAideEtapeSimplifierDenomFactorisation}
              onValider={validerSimplifierDenomFactorisation}
            />
          ) : etat.phase === "simplifierNumReduction" && exerciceFacteurCommun ? (
            <EtapeReductionCoefficients
              key="simplifierNumReduction"
              exercice={numerateurFacteurCommun(exerciceFacteurCommun)}
              nom="numérateur"
              variante="miseEnEvidence"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={[formatEquationNumerateur(numerateurFacteurCommun(exerciceFacteurCommun))]}
              etatActuel={etatActuel}
              diagnostiquer={(v) => diagnostiquerMiseEnEvidenceFraction(numerateurFacteurCommun(exerciceFacteurCommun), v)}
              aideActivee={etat.aideSimplifierNumReductionUtilisee}
              onActiverAide={activerAideEtapeSimplifierNumReduction}
              onValider={validerSimplifierNumReduction}
            />
          ) : etat.phase === "simplifierNumReconnaissance" && exerciceFacteurCommun ? (
            <EtapeReconnaissance
              key="simplifierNumReconnaissance"
              exercice={numerateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationNumerateur(numerateurFacteurCommun(exerciceFacteurCommun))}
              question="Quelle est la méthode la plus rapide pour factoriser ce numérateur ?"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel}
              onChoisir={validerSimplifierNumCategorie}
            />
          ) : etat.phase === "simplifierNumChamp1" && exerciceFacteurCommun ? (
            <EtapeChamp1
              key="simplifierNumChamp1"
              exercice={numerateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationNumerateur(numerateurFacteurCommun(exerciceFacteurCommun))}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(numerateurFacteurCommun(exerciceFacteurCommun), v)}
              aideActivee={etat.aideSimplifierNumChamp1Utilisee}
              onActiverAide={activerAideEtapeSimplifierNumChamp1}
              onValider={validerSimplifierNumChamp1}
            />
          ) : etat.phase === "simplifierNumChamp2" && exerciceFacteurCommun ? (
            <EtapeRacinesFlexibles
              key="simplifierNumChamp2"
              exercice={numerateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationNumerateur(numerateurFacteurCommun(exerciceFacteurCommun))}
              prefixeChamp="x ="
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel}
              aideActivee={etat.aideSimplifierNumChamp2Utilisee}
              onActiverAide={activerAideEtapeSimplifierNumChamp2}
              onValider={validerSimplifierNumChamp2}
            />
          ) : etat.phase === "simplifierNumFactorisation" && exerciceFacteurCommun ? (
            <EtapeChamp1
              key="simplifierNumFactorisation"
              exercice={numerateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationNumerateur(numerateurFacteurCommun(exerciceFacteurCommun))}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel}
              labelFactorisation="Forme factorisée"
              etapeFactorisationForcee
              diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(numerateurFacteurCommun(exerciceFacteurCommun), v)}
              aideActivee={etat.aideSimplifierNumFactorisationUtilisee}
              onActiverAide={activerAideEtapeSimplifierNumFactorisation}
              onValider={validerSimplifierNumFactorisation}
            />
          ) : etat.phase === "simplifierFraction" && exerciceFacteurCommun ? (
            <EtapeSimplification
              key="simplifierFraction"
              expressionAffichee={formatEnonceFacteurCommunLatex(exerciceFacteurCommun)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel}
              diagnostiquer={(n, d) => diagnostiquerSimplification(exerciceFacteurCommun.fraction, n, d)}
              aideActivee={etat.aideSimplifierFractionUtilisee}
              onActiverAide={activerAideEtapeSimplifierFraction}
              onValider={validerSimplifierFraction}
            />
          ) : etat.phase === "ce" && exerciceNumerateurLineaire ? (
            <EtapeCEDirecte
              key="ce"
              expressionAffichee={formatEnonceInequationRationnelleLatex(exerciceNumerateurLineaire)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={validerCE}
            />
          ) : etat.phase === "racineNumerateur" && exerciceNumerateurLineaire ? (
            <EtapeCEDirecte
              key="racineNumerateur"
              expressionAffichee={formatEnonceInequationRationnelleLatex(exerciceNumerateurLineaire)}
              question="Quelle est la racine du numérateur ?"
              label="Racine du numérateur"
              libellePasDe="Pas de racine"
              libelleAuMoins="Au moins une racine"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={validerRacineNumerateur}
            />
          ) : etat.phase === "reduction" && exerciceNumerateurQuadratique ? (
            <EtapeReductionCoefficients
              key="reduction"
              exercice={exerciceNumerateurQuadratique.numerateur}
              nom="numérateur"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={[blocNumerateurQuadratique(exerciceNumerateurQuadratique)]}
              etatActuel={etatActuelNumerateurCombine}
              diagnostiquer={(v) => diagnostiquerReductionCoefficients(exerciceNumerateurQuadratique.numerateur, v)}
              aideActivee={etat.aideReductionUtilisee}
              onActiverAide={activerAideEtapeReduction}
              onValider={validerReduction}
            />
          ) : etat.phase === "reconnaissance" && exerciceNumerateurQuadratique ? (
            <EtapeReconnaissance
              key="reconnaissance"
              exercice={exerciceNumerateurQuadratique.numerateur}
              expressionAffichee={blocNumerateurQuadratique(exerciceNumerateurQuadratique)}
              question="Quelle est la méthode la plus rapide pour factoriser ce numérateur ?"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuelNumerateurCombine}
              onChoisir={validerReconnaissance}
            />
          ) : etat.phase === "champ1" && exerciceNumerateurQuadratique ? (
            <EtapeChamp1
              key="champ1"
              exercice={exerciceNumerateurQuadratique.numerateur}
              expressionAffichee={blocNumerateurQuadratique(exerciceNumerateurQuadratique)}
              labelFactorisation="Factorise le numérateur"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuelNumerateurCombine}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(exerciceNumerateurQuadratique.numerateur, v)}
              aideActivee={etat.aideChamp1Utilisee}
              onActiverAide={activerAideEtapeChamp1}
              onValider={validerChamp1}
            />
          ) : etat.phase === "champ2" && exerciceNumerateurQuadratique ? (
            <EtapeRacinesFlexibles
              key="champ2"
              exercice={exerciceNumerateurQuadratique.numerateur}
              expressionAffichee={blocNumerateurQuadratique(exerciceNumerateurQuadratique)}
              prefixeChamp="x ="
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuelNumerateurCombine}
              aideActivee={etat.aideChamp2Utilisee}
              onActiverAide={activerAideEtapeChamp2}
              onValider={validerChamp2}
            />
          ) : etat.phase === "factorisation" && exerciceNumerateurQuadratique ? (
            <EtapeChamp1
              key="factorisation"
              exercice={exerciceNumerateurQuadratique.numerateur}
              expressionAffichee={blocNumerateurQuadratique(exerciceNumerateurQuadratique)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuelNumerateurCombine}
              labelFactorisation="Forme factorisée"
              etapeFactorisationForcee
              diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(exerciceNumerateurQuadratique.numerateur, v)}
              aideActivee={etat.aideFactorisationUtilisee}
              onActiverAide={activerAideEtapeFactorisation}
              onValider={validerFactorisation}
            />
          ) : etat.phase === "grille" && exerciceNiveau3 ? (
            <EtapeGrilleQuotientNiveau3
              exercice={exerciceNiveau3}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={validerGrilleNiveau3}
            />
          ) : etat.phase === "grille" && exerciceNiveau4 ? (
            <EtapeGrilleQuotientNiveau4
              exercice={exerciceNiveau4}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={validerGrilleNiveau4}
            />
          ) : etat.phase === "grille" && exerciceDenominateurCarre ? (
            <EtapeGrilleQuotientDenominateurCarre
              exercice={exerciceDenominateurCarre}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={validerGrilleDenominateurCarre}
            />
          ) : etat.phase === "grille" && exerciceFacteurCommun ? (
            <EtapeGrilleQuotientFacteurCommun
              exercice={exerciceFacteurCommun}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              etatActuel={etatActuel}
              onValider={validerGrille}
            />
          ) : etat.phase === "grille" && exerciceSansFacteurCommun ? (
            <EtapeGrilleQuotientSansFacteurCommun
              exercice={exerciceSansFacteurCommun}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={validerGrilleSansFacteurCommun}
            />
          ) : etat.phase === "grille" && exerciceCubique ? (
            <EtapeGrilleQuotientCubique
              exercice={exerciceCubique}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={validerGrilleCubique}
            />
          ) : etat.phase === "grille" && exerciceNumerateurLineaire ? (
            <EtapeGrilleQuotient
              exercice={exerciceNumerateurLineaire}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={validerGrille}
            />
          ) : (
            <EtapeIntervalleQuotient
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideUtilisee}
              onActiverAide={activerAide}
              onValider={validerIntervalle}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
