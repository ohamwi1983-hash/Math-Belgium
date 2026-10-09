import { useState } from "react";
import type { Categorie } from "./core/generateur.types";
import type { EtapeAnalyseFonction, ExerciceAnalyseFonction } from "./core/analyseFonction.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideAxeSommet,
  activerAideCoefficients,
  activerAideDomaineImage,
  activerAideTableauSignes,
  demarrerSessionAnalyseFonction,
  soumettreChoixRacinesCategorie,
  soumettreReponseAllure,
  soumettreReponseAxeSommet,
  soumettreReponseCoefficients,
  soumettreReponseImage,
  soumettreReponseRacinesChamp1,
  soumettreReponseRacinesChamp2,
  soumettreReponseTableauSigneVariation,
} from "./moteur/sessionAnalyseFonction";
import { diagnostiquerChampPrincipal } from "./moteur/verification";
import type { EtatSessionAnalyseFonction, PhaseAnalyseFonction, ResultatExerciceAnalyseFonction } from "./moteur/typesAnalyseFonction";
import {
  CATALOGUE_VARIANTES,
  construireAvecVarianteId,
  genererExerciceAnalyseFonction,
  type VarianteAnalyseFonctionId,
} from "./generateurs/analyseFonction";
import { adaptateurExportWordAnalyseFonction } from "./generateurs/analyseFonction/exportWord";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { BoutonExportWord } from "../components/BoutonExportWord";
import { EtapeCoefficients } from "./components/EtapeCoefficients";
import { EtapeAllure } from "./components/EtapeAllure";
import { EtapeAxeSommet } from "./components/EtapeAxeSommet";
import { EtapeDomaineImage } from "./components/EtapeDomaineImage";
import { EtapeReconnaissance } from "./components/EtapeReconnaissance";
import { EtapeChamp1 } from "./components/EtapeChamp1";
import { EtapeRacinesFlexibles } from "./components/EtapeRacinesFlexibles";
import { EtapeTableauSigneVariation } from "./components/EtapeTableauSigneVariation";
import { ResultatPanelAnalyseFonction } from "./components/ResultatPanelAnalyseFonction";
import { ResumeSessionAnalyseFonction } from "./components/ResumeSessionAnalyseFonction";
import { calculerRecapitulatifAnalyseFonction } from "./ui/recapitulatifAnalyseFonction";
import { calculerEtatActuelAnalyseFonctionRacines } from "./ui/etatActuelAnalyseFonction";
import { formatEnonceLatex } from "./ui/formatEquation";
import { OPTIONS_CATEGORIE_SANS_CAS_GENERAL } from "./ui/categorieLabels";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

/**
 * Les 6 étapes, toutes actives par défaut (section 9 de la spec) — câblé en dur ici, comme
 * REGLAGES_NIVEAU dans AppInequationRationnelle.tsx : aucun écran de réglage professeur pour
 * l'instant, à modifier ici directement si besoin de désactiver une étape (ex. pour du débogage).
 */
const ETAPES_ACTIVES_DEMO: Record<EtapeAnalyseFonction, boolean> = {
  coefficients: true,
  allure: true,
  axeSommet: true,
  domaineImage: true,
  racines: true,
  tableauSignes: true,
};

function nouvelleSession(): EtatSessionAnalyseFonction {
  return demarrerSessionAnalyseFonction(REGLAGES_DEMO, ETAPES_ACTIVES_DEMO, genererExerciceAnalyseFonction);
}

interface Bilan {
  resultat: ResultatExerciceAnalyseFonction;
  exercice: ExerciceAnalyseFonction;
}

const LIBELLE_PHASE: Record<PhaseAnalyseFonction, string> = {
  coefficients: "Coefficients",
  allure: "Allure",
  axeSommet: "Axe et sommet",
  domaineImage: "Domaine et image",
  racinesReconnaissance: "Racines — méthode",
  racinesChamp1: "Racines — factorisation",
  racinesChamp2: "Racines",
  tableauSignes: "Tableau de signes",
};

export function AppAnalyseFonction() {
  const [etat, setEtat] = useState<EtatSessionAnalyseFonction>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceAnalyseFonction, nouvelEtat: EtatSessionAnalyseFonction) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const recapitulatif = calculerRecapitulatifAnalyseFonction(etat);
  const etatActuelRacines = calculerEtatActuelAnalyseFonctionRacines(etat);

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(
      demarrerSessionAnalyseFonction(REGLAGES_DEMO, ETAPES_ACTIVES_DEMO, () => construireAvecVarianteId(varianteId as VarianteAnalyseFonctionId)),
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Analyse d'une fonction du second degré</h1>
        <p className="app-subtitle">Chapitre 1</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <BoutonExportWord adaptateur={adaptateurExportWordAnalyseFonction} />
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
            <ResultatPanelAnalyseFonction
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionAnalyseFonction resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "coefficients" ? (
            <EtapeCoefficients
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              aideActivee={etat.aideCoefficientsUtilisee}
              onActiverAide={() => setEtat(activerAideCoefficients(etat))}
              onValider={(reponse) => setEtat(soumettreReponseCoefficients(etat, reponse))}
            />
          ) : etat.phase === "allure" ? (
            <EtapeAllure
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse) => setEtat(soumettreReponseAllure(etat, reponse))}
            />
          ) : etat.phase === "axeSommet" ? (
            <EtapeAxeSommet
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideAxeSommetUtilisee}
              onActiverAide={() => setEtat(activerAideAxeSommet(etat))}
              onValider={(reponse) => setEtat(soumettreReponseAxeSommet(etat, reponse))}
            />
          ) : etat.phase === "domaineImage" ? (
            <EtapeDomaineImage
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideDomaineImageUtilisee}
              onActiverAide={() => setEtat(activerAideDomaineImage(etat))}
              onValider={(reponse) => setEtat(soumettreReponseImage(etat, reponse))}
            />
          ) : etat.phase === "racinesReconnaissance" ? (
            <EtapeReconnaissance
              exercice={etat.exerciceCourant.exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={formatEnonceLatex(etat.exerciceCourant.exercice.enonce)}
              question="Quelle est la méthode la plus rapide pour trouver les racines de f ?"
              options={OPTIONS_CATEGORIE_SANS_CAS_GENERAL}
              etatActuel={etatActuelRacines}
              onChoisir={(choix: Categorie) => setEtat(soumettreChoixRacinesCategorie(etat, choix))}
            />
          ) : etat.phase === "racinesChamp1" ? (
            <EtapeChamp1
              exercice={etat.exerciceCourant.exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={formatEnonceLatex(etat.exerciceCourant.exercice.enonce)}
              etatActuel={etatActuelRacines}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(etat.exerciceCourant.exercice, v)}
              onValider={(reponse) => setEtat(soumettreReponseRacinesChamp1(etat, reponse))}
            />
          ) : etat.phase === "racinesChamp2" ? (
            <EtapeRacinesFlexibles
              exercice={etat.exerciceCourant.exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={formatEnonceLatex(etat.exerciceCourant.exercice.enonce)}
              etatActuel={etatActuelRacines}
              onValider={(racines) => {
                const exerciceTermine = etat.exerciceCourant;
                terminerEtape(exerciceTermine, soumettreReponseRacinesChamp2(etat, racines));
              }}
            />
          ) : (
            <EtapeTableauSigneVariation
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideTableauSignesUtilisee}
              onActiverAide={() => setEtat(activerAideTableauSignes(etat))}
              onValider={(reponse) => {
                const exerciceTermine = etat.exerciceCourant;
                terminerEtape(exerciceTermine, soumettreReponseTableauSigneVariation(etat, reponse));
              }}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
