import { useState } from "react";
import type { Categorie } from "./core/generateur.types";
import type { EtapeAnalyseFonction } from "./core/analyseFonction.types";
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
import type { EtatSessionAnalyseFonction, PhaseAnalyseFonction } from "./moteur/typesAnalyseFonction";
import {
  CATALOGUE_VARIANTES,
  construireAvecVarianteId,
  genererExerciceAnalyseFonction,
  type VarianteAnalyseFonctionId,
} from "./generateurs/analyseFonction";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeCoefficients } from "./components/EtapeCoefficients";
import { EtapeAllure } from "./components/EtapeAllure";
import { EtapeAxeSommet } from "./components/EtapeAxeSommet";
import { EtapeDomaineImage } from "./components/EtapeDomaineImage";
import { EtapeReconnaissance } from "./components/EtapeReconnaissance";
import { EtapeChamp1 } from "./components/EtapeChamp1";
import { EtapeRacinesFlexibles } from "./components/EtapeRacinesFlexibles";
import { EtapeTableauSigneVariation } from "./components/EtapeTableauSigneVariation";
import { calculerRecapitulatifAnalyseFonction } from "./ui/recapitulatifAnalyseFonction";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { calculerEtatActuelAnalyseFonctionRacines } from "./ui/etatActuelAnalyseFonction";
import { formatEnonceLatex } from "./ui/formatEquation";
import { formatFonctionColoreeLatex } from "./ui/formatAnalyseFonction";
import { OPTIONS_CATEGORIE_SANS_CAS_GENERAL } from "./ui/categorieLabels";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
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

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionAnalyseFonction;
  revele: boolean;
}

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence des phases du
 * générateur (voir `ETAPES_ACTIVES_DEMO`/les branches de `terminerEtape` ci-dessous). */
const ORDRE_PHASES: PhaseAnalyseFonction[] = [
  "coefficients",
  "allure",
  "axeSommet",
  "domaineImage",
  "racinesReconnaissance",
  "racinesChamp1",
  "racinesChamp2",
  "tableauSignes",
];

/** Même ternaire que `terminerEtape` (ci-dessous) pour lire `scoreXxxExercice`/`xxxRevele` — jamais
 * une valeur recalculée séparément. `tableauSignes` (dernière phase) n'a pas de branche "close"
 * propre ici : tant que l'exercice n'est pas terminé elle est forcément "courante" (dernière phase
 * active), et une fois terminé un nouvel exercice démarre (l'état entier est remis à zéro). */
function calculerSegmentsProgression(etat: EtatSessionAnalyseFonction): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score =
      phase === "coefficients"
        ? etat.scoreCoefficientsExercice
        : phase === "allure"
          ? etat.scoreAllureExercice
          : phase === "axeSommet"
            ? etat.scoreAxeSommetExercice
            : phase === "domaineImage"
              ? etat.scoreDomaineImageExercice
              : phase === "racinesReconnaissance"
                ? etat.scoreRacinesReconnaissanceExercice
                : phase === "racinesChamp1"
                  ? etat.scoreRacinesChamp1Exercice
                  : phase === "racinesChamp2"
                    ? etat.scoreRacinesChamp2Exercice
                    : null;
    if (score === null) return "a-venir";
    const revele =
      phase === "coefficients"
        ? etat.coefficientsRevele
        : phase === "allure"
          ? etat.allureRevele
          : phase === "axeSommet"
            ? etat.axeSommetRevele
            : phase === "domaineImage"
              ? etat.domaineImageRevele
              : phase === "racinesReconnaissance"
                ? etat.racinesReconnaissanceRevele
                : phase === "racinesChamp1"
                  ? etat.racinesChamp1Revele
                  : etat.racinesChamp2Revele;
    return revele ? "revele" : "correcte";
  });
}

export function AppAnalyseFonction() {
  const [etat, setEtat] = useState<EtatSessionAnalyseFonction>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionAnalyseFonction) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "coefficients"
          ? nouvelEtat.coefficientsRevele
          : etat.phase === "allure"
            ? nouvelEtat.allureRevele
            : etat.phase === "axeSommet"
              ? nouvelEtat.axeSommetRevele
              : etat.phase === "domaineImage"
                ? nouvelEtat.domaineImageRevele
                : etat.phase === "racinesReconnaissance"
                  ? nouvelEtat.racinesReconnaissanceRevele
                  : etat.phase === "racinesChamp1"
                    ? nouvelEtat.racinesChamp1Revele
                    : etat.phase === "racinesChamp2"
                      ? nouvelEtat.racinesChamp2Revele
                      : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.tableauSignesRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const recapitulatif = calculerRecapitulatifAnalyseFonction(etat);
  const etatActuelRacines = calculerEtatActuelAnalyseFonctionRacines(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(
      demarrerSessionAnalyseFonction(REGLAGES_DEMO, ETAPES_ACTIVES_DEMO, () => construireAvecVarianteId(varianteId as VarianteAnalyseFonctionId)),
    );
  }

  const exercice = etat.exerciceCourant;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          !etat.reglages.affichageReponseApresEchec || etat.phase !== "coefficients" ? undefined : (
            <Katex expression={formatFonctionColoreeLatex(exercice.exercice.enonce)} />
          ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Analyse d'une fonction du second degré</h1>
        <p className="app-subtitle">Chapitre 1</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>

      <main className="card">
        <div className="card-body">
          {etat.phase === "coefficients" ? (
            <EtapeCoefficients
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              aideActivee={etat.aideCoefficientsUtilisee}
              onActiverAide={() => setEtat(activerAideCoefficients(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCoefficients(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "allure" ? (
            <EtapeAllure
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse) => terminerEtape(soumettreReponseAllure(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "axeSommet" ? (
            <EtapeAxeSommet
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideAxeSommetUtilisee}
              onActiverAide={() => setEtat(activerAideAxeSommet(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseAxeSommet(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "domaineImage" ? (
            <EtapeDomaineImage
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideDomaineImageUtilisee}
              onActiverAide={() => setEtat(activerAideDomaineImage(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseImage(etat, reponse))}
              validation={validation}
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
              onChoisir={(choix: Categorie) => terminerEtape(soumettreChoixRacinesCategorie(etat, choix))}
              validation={validation}
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
              onValider={(reponse) => terminerEtape(soumettreReponseRacinesChamp1(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "racinesChamp2" ? (
            <EtapeRacinesFlexibles
              exercice={etat.exerciceCourant.exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={formatEnonceLatex(etat.exerciceCourant.exercice.enonce)}
              etatActuel={etatActuelRacines}
              onValider={(racines) => terminerEtape(soumettreReponseRacinesChamp2(etat, racines))}
              validation={validation}
            />
          ) : (
            <EtapeTableauSigneVariation
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideTableauSignesUtilisee}
              onActiverAide={() => setEtat(activerAideTableauSignes(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseTableauSigneVariation(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
