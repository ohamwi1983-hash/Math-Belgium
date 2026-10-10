import { useState } from "react";
import type { Categorie, Enonce, Exercice } from "./core/generateur.types";
import type { SigneA } from "./core/inequation.types";
import type { ExerciceSignesProduit, FacteurQuadratiqueIrreductible, Grille, SolutionEnsembleProduit } from "./core/signesProduit.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideFactorisationChamp1,
  activerAideFactorisationChamp2,
  activerAideFactorisationFactorisation,
  activerAideGrilleSolution,
  activerAideGrilleTableau,
  activerAideReductionFacteur,
  demarrerSessionSignesProduit,
  soumettreChoixMethodeFacteur,
  soumettreReponseFactorisationChamp1,
  soumettreReponseFactorisationChamp2,
  soumettreReponseFactorisationFactorisation,
  soumettreReponseGrille,
  soumettreReponseIntervalle,
  soumettreReponseRacineLineaire,
  soumettreReponseReductionFacteur,
  soumettreReponseSigneIrreductible,
} from "./moteur/sessionSignesProduit";
import { diagnostiquerChampPrincipal, diagnostiquerFactorisationCasGeneral } from "./moteur/verification";
import { diagnostiquerReductionCoefficients } from "./moteur/verificationSimplification";
import type { EtatSessionSignesProduit, PhaseSignesProduit, ResultatExerciceSignesProduit } from "./moteur/typesSignesProduit";
import {
  CATALOGUE_VARIANTES,
  construireAvecVarianteId,
  genererExerciceSignesProduit,
  type VarianteSignesProduitId,
} from "./generateurs/signesProduit";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReconnaissance } from "./components/EtapeReconnaissance";
import { EtapeReductionCoefficients } from "./components/EtapeReductionCoefficients";
import { EtapeChamp1 } from "./components/EtapeChamp1";
import { EtapeRacinesFlexibles } from "./components/EtapeRacinesFlexibles";
import { EtapeRacineLineaire } from "./components/EtapeRacineLineaire";
import { EtapeSigneIrreductible } from "./components/EtapeSigneIrreductible";
import { EtapeGrilleSignes } from "./components/EtapeGrilleSignes";
import { EtapeIntervalleProduit } from "./components/EtapeIntervalleProduit";
import { ResultatPanelSignesProduit } from "./components/ResultatPanelSignesProduit";
import { ResumeSessionSignesProduit } from "./components/ResumeSessionSignesProduit";
import { calculerRecapitulatifSignesProduit } from "./ui/recapitulatifSignesProduit";
import { calculerEtatActuelSignesProduit } from "./ui/etatActuelSignesProduit";
import { formatTermesEnonceSignesProduitLatex } from "./ui/formatSignesProduit";
import { OPTIONS_CATEGORIE_AVEC_IRREDUCTIBLE } from "./ui/categorieLabels";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionSignesProduit {
  return demarrerSessionSignesProduit(REGLAGES_DEMO, genererExerciceSignesProduit);
}

/** Le facteur quadratique factorisable de l'exercice courant, s'il existe — même principe que p2DeFractionGauche (AppEquationRationnelle.tsx). */
function facteurFactorisable(exercice: ExerciceSignesProduit): Exercice | undefined {
  const facteur = exercice.facteurs.find((f) => f.type === "quadratique_factorisable");
  return facteur?.type === "quadratique_factorisable" ? facteur.exercice : undefined;
}

/** Les facteurs quadratiques irréductibles de l'exercice courant, dans l'ordre de exercice.facteurs. */
function facteursIrreductibles(exercice: ExerciceSignesProduit): FacteurQuadratiqueIrreductible[] {
  return exercice.facteurs.filter((f): f is FacteurQuadratiqueIrreductible => f.type === "quadratique_irreductible");
}

/**
 * Un `Exercice` factice pour l'écran "methodeFacteur" d'un facteur réellement irréductible — ce
 * composant partagé exige un `exercice: Exercice` (utilisé par sa branche d'affichage PAR DÉFAUT),
 * jamais réellement rendu ici puisque `expressionAffichee` est toujours fourni sur cet écran (voir
 * plus bas) : seule sa forme suffit à satisfaire TypeScript, son contenu n'a aucune conséquence
 * fonctionnelle.
 */
function exerciceFactice(enonce: Enonce): Exercice {
  return {
    categorie: "irreductible",
    enonce,
    solution: { racines: [NaN, NaN], racinesExactes: true },
    formeAffichage: "canonique",
  };
}

interface Bilan {
  resultat: ResultatExerciceSignesProduit;
  exercice: ExerciceSignesProduit;
}

const LIBELLE_PHASE_FIXE: Partial<Record<PhaseSignesProduit, string>> = {
  reductionFacteur: "Réduction (facteur à factoriser)",
  factorisationChamp1: "Factorisation",
  factorisationChamp2: "Racines (facteur à factoriser)",
  factorisationFactorisation: "Factorisation (facteur à factoriser)",
  signeIrreductible: "Signe d'un facteur irréductible",
  grille: "Tableau de signes",
  intervalle: "Ensemble-solution",
};

/**
 * Libellé de la phase courante pour l'indicateur de progression — les phases "racineLineaire" et
 * "methodeFacteur" se répètent désormais une fois par facteur (promptgenerateur5signesProduit.md,
 * points 9-10), numérotées par la position (1-based) du facteur dans `exercice.facteurs` dès qu'il
 * y a plus d'un facteur du type concerné.
 */
function libellePhase(etat: EtatSessionSignesProduit): string {
  const fixe = LIBELLE_PHASE_FIXE[etat.phase];
  if (fixe !== undefined) return fixe;

  const nbLineaires = etat.exerciceCourant.facteurs.filter((f) => f.type === "lineaire").length;
  const nbQuadratiques = etat.exerciceCourant.facteurs.filter((f) => f.type !== "lineaire").length;

  if (etat.phase === "racineLineaire") {
    return `Racine (facteur linéaire${nbLineaires > 1 ? ` ${etat.scoresRacineLineaireExercice.length + 1}` : ""})`;
  }
  return `Méthode${nbQuadratiques > 1 ? ` (facteur ${etat.scoresMethodeExercice.length + 1})` : ""}`;
}

export function AppSignesProduit() {
  const [etat, setEtat] = useState<EtatSessionSignesProduit>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function validerRacineLineaire(racine: number) {
    setEtat(soumettreReponseRacineLineaire(etat, racine));
  }

  function validerReductionFacteur(reponse: string) {
    setEtat(soumettreReponseReductionFacteur(etat, reponse));
  }

  function activerAideEtapeReductionFacteur() {
    setEtat(activerAideReductionFacteur(etat));
  }

  function validerMethodeFacteur(choix: Categorie) {
    setEtat(soumettreChoixMethodeFacteur(etat, choix));
  }

  function validerFactorisationChamp1(reponse: string) {
    setEtat(soumettreReponseFactorisationChamp1(etat, reponse));
  }

  function validerFactorisationChamp2(racines: [number, number]) {
    setEtat(soumettreReponseFactorisationChamp2(etat, racines));
  }

  function validerFactorisationFactorisation(reponse: string) {
    setEtat(soumettreReponseFactorisationFactorisation(etat, reponse));
  }

  function validerSigneIrreductible(reponse: SigneA) {
    setEtat(soumettreReponseSigneIrreductible(etat, reponse));
  }

  function validerGrille(reponse: Grille) {
    setEtat(soumettreReponseGrille(etat, reponse));
  }

  function activerAide() {
    setEtat(activerAideGrilleSolution(etat));
  }

  function activerAideEtapeFactorisationChamp1() {
    setEtat(activerAideFactorisationChamp1(etat));
  }

  function activerAideEtapeFactorisationChamp2() {
    setEtat(activerAideFactorisationChamp2(etat));
  }

  function activerAideEtapeFactorisationFactorisation() {
    setEtat(activerAideFactorisationFactorisation(etat));
  }

  function activerAideEtapeGrilleTableau() {
    setEtat(activerAideGrilleTableau(etat));
  }

  function validerIntervalle(reponse: SolutionEnsembleProduit) {
    const exerciceTermine = etat.exerciceCourant;
    const nouvelEtat = soumettreReponseIntervalle(etat, reponse);
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const recapitulatif = calculerRecapitulatifSignesProduit(etat);
  const etatActuel = calculerEtatActuelSignesProduit(etat);
  const expressionEnonceTermes = formatTermesEnonceSignesProduitLatex(etat.exerciceCourant);
  const factorisable = facteurFactorisable(etat.exerciceCourant);
  const irreductibleCourant = facteursIrreductibles(etat.exerciceCourant)[etat.scoresSigneIrreductibleExercice.length];
  const facteurCourant = etat.exerciceCourant.facteurs[etat.indexFacteurExercice];

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionSignesProduit(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteSignesProduitId)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Tableau de signes à plusieurs facteurs</h1>
        <p className="app-subtitle">Produit de facteurs du 1er et du 2nd degré</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-phase">{libellePhase(etat)}</span>
            </div>
          </div>
        )}

        <div className="card-body">
          {dernierBilan ? (
            <ResultatPanelSignesProduit
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionSignesProduit resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "racineLineaire" && facteurCourant?.type === "lineaire" ? (
            <EtapeRacineLineaire
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={expressionEnonceTermes}
              etatActuel={etatActuel as string}
              onValider={validerRacineLineaire}
            />
          ) : etat.phase === "reductionFacteur" && facteurCourant?.type === "quadratique_factorisable" ? (
            <EtapeReductionCoefficients
              exercice={facteurCourant.exercice}
              nom="facteur"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={expressionEnonceTermes}
              etatActuel={etatActuel}
              diagnostiquer={(v) => diagnostiquerReductionCoefficients(facteurCourant.exercice, v)}
              aideActivee={etat.aideReductionFacteurUtilisee}
              onActiverAide={activerAideEtapeReductionFacteur}
              onValider={validerReductionFacteur}
            />
          ) : etat.phase === "methodeFacteur" && facteurCourant && facteurCourant.type !== "lineaire" ? (
            <EtapeReconnaissance
              exercice={facteurCourant.type === "quadratique_factorisable" ? facteurCourant.exercice : exerciceFactice(facteurCourant.enonce)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={expressionEnonceTermes}
              etatActuel={etatActuel}
              options={OPTIONS_CATEGORIE_AVEC_IRREDUCTIBLE}
              question="Quelle est la méthode la plus rapide pour factoriser ce facteur ?"
              onChoisir={validerMethodeFacteur}
            />
          ) : etat.phase === "factorisationChamp1" && factorisable ? (
            <EtapeChamp1
              exercice={factorisable}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={expressionEnonceTermes}
              etatActuel={etatActuel}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(factorisable, v)}
              aideActivee={etat.aideFactorisationChamp1Utilisee}
              onActiverAide={activerAideEtapeFactorisationChamp1}
              onValider={validerFactorisationChamp1}
            />
          ) : etat.phase === "factorisationChamp2" && factorisable ? (
            <EtapeRacinesFlexibles
              exercice={factorisable}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              labelChamp="Racines"
              libellePasDe="Pas de racine"
              libelleAuMoins="Au moins une racine"
              placeholderPrefixe="racine"
              prefixeChamp="x ="
              expressionAfficheeTermes={expressionEnonceTermes}
              etatActuel={etatActuel}
              aideActivee={etat.aideFactorisationChamp2Utilisee}
              onActiverAide={activerAideEtapeFactorisationChamp2}
              onValider={validerFactorisationChamp2}
            />
          ) : etat.phase === "factorisationFactorisation" && factorisable ? (
            <EtapeChamp1
              exercice={factorisable}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={expressionEnonceTermes}
              etatActuel={etatActuel}
              labelFactorisation="Forme factorisée"
              etapeFactorisationForcee
              diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(factorisable, v)}
              aideActivee={etat.aideFactorisationFactorisationUtilisee}
              onActiverAide={activerAideEtapeFactorisationFactorisation}
              onValider={validerFactorisationFactorisation}
            />
          ) : etat.phase === "signeIrreductible" && irreductibleCourant ? (
            <EtapeSigneIrreductible
              facteur={irreductibleCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={expressionEnonceTermes}
              etatActuel={etatActuel}
              onValider={validerSigneIrreductible}
            />
          ) : etat.phase === "grille" ? (
            <EtapeGrilleSignes
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideGrilleTableauUtilisee}
              onActiverAide={activerAideEtapeGrilleTableau}
              onValider={validerGrille}
            />
          ) : (
            <EtapeIntervalleProduit
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
