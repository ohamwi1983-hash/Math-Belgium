import { useState } from "react";
import type { ReactNode } from "react";
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
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { formatEnonceLatex } from "./ui/formatEquation";
import { formatFonctionColoreeLatex, formatFonctionOrdreLatex } from "./ui/formatAnalyseFonction";
import { OPTIONS_CATEGORIE_SANS_CAS_GENERAL, libelleCategorie } from "./ui/categorieLabels";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Étudie cette fonction du second degré.";

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
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionAnalyseFonction`, jamais dans le moteur : la saisie de l'élève
   * n'a aucune autre utilité une fois l'étape close (le moteur ne garde qu'un score agrégé), donc
   * pas de raison d'alourdir son état pour une fonctionnalité purement consultative côté UI.
   * Remis à vide à chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Appelé juste avant `terminerEtape`, avec l'état DÉJÀ mis à jour par `soumettreReponseXxx` —
   * réutilise `calculerRecapitulatifAnalyseFonction` (même mécanisme que le récapitulatif final)
   * pour la réponse ATTENDUE : l'entrée qui vient d'être ajoutée est toujours la dernière du
   * tableau, les étapes se closent dans l'ordre. `votreReponse` est formatée séparément par chaque
   * appelant, qui seul connaît la forme précise de sa réponse. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionAnalyseFonction) {
    const recap = calculerRecapitulatifAnalyseFonction(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? derniere.estLatex ? <Katex expression={derniere.valeur} /> : derniere.valeur : undefined,
      },
    ]);
  }

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
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  const recapitulatif = calculerRecapitulatifAnalyseFonction(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
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
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <div className="equation-box">
                <Katex expression={formatFonctionOrdreLatex(exercice.exercice.enonce, exercice.ordreTermes)} block />
              </div>
            }
          />
          {etat.phase === "coefficients" ? (
            <EtapeCoefficients
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              aideActivee={etat.aideCoefficientsUtilisee}
              onActiverAide={() => setEtat(activerAideCoefficients(etat))}
              onValider={(reponse) => {
                const nouvelEtat = soumettreReponseCoefficients(etat, reponse);
                ajouterHistorique(`a = ${reponse.a} ; b = ${reponse.b} ; c = ${reponse.c}`, nouvelEtat);
                terminerEtape(nouvelEtat);
              }}
              validation={validation}
            />
          ) : etat.phase === "allure" ? (
            <EtapeAllure
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse) => {
                const nouvelEtat = soumettreReponseAllure(etat, reponse);
                const texteAB = reponse.signeAB === "0" ? "a·b = 0" : reponse.signeAB === "+" ? "a·b > 0" : "a·b < 0";
                ajouterHistorique(`${reponse.signeA === "+" ? "a > 0" : "a < 0"} ; ${texteAB}`, nouvelEtat);
                terminerEtape(nouvelEtat);
              }}
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
              onValider={(reponse) => {
                const nouvelEtat = soumettreReponseAxeSommet(etat, reponse);
                ajouterHistorique(`x = ${reponse.axeTexte} ; S(${reponse.xS} ; ${reponse.yS})`, nouvelEtat);
                terminerEtape(nouvelEtat);
              }}
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
              onValider={(reponse) => {
                const nouvelEtat = soumettreReponseImage(etat, reponse);
                const borne = (b: typeof reponse.borneGauche) => (b === "-inf" ? "-∞" : b === "+inf" ? "+∞" : String(b));
                ajouterHistorique(
                  `domf = ℝ ; imf = ${reponse.crochetGauche}${borne(reponse.borneGauche)} ; ${borne(reponse.borneDroite)}${reponse.crochetDroit}`,
                  nouvelEtat,
                );
                terminerEtape(nouvelEtat);
              }}
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
              onChoisir={(choix: Categorie) => {
                const nouvelEtat = soumettreChoixRacinesCategorie(etat, choix);
                ajouterHistorique(libelleCategorie(choix), nouvelEtat);
                terminerEtape(nouvelEtat);
              }}
              validation={validation}
            />
          ) : etat.phase === "racinesChamp1" ? (
            <EtapeChamp1
              exercice={etat.exerciceCourant.exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={formatEnonceLatex(etat.exerciceCourant.exercice.enonce)}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(etat.exerciceCourant.exercice, v)}
              onValider={(reponse) => {
                const nouvelEtat = soumettreReponseRacinesChamp1(etat, reponse);
                ajouterHistorique(`${reponse} = 0`, nouvelEtat);
                terminerEtape(nouvelEtat);
              }}
              validation={validation}
            />
          ) : etat.phase === "racinesChamp2" ? (
            <EtapeRacinesFlexibles
              exercice={etat.exerciceCourant.exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAffichee={formatEnonceLatex(etat.exerciceCourant.exercice.enonce)}
              onValider={(racines) => {
                const nouvelEtat = soumettreReponseRacinesChamp2(etat, racines);
                ajouterHistorique(racines.join(" ; "), nouvelEtat);
                terminerEtape(nouvelEtat);
              }}
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

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
