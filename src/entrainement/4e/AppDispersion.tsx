import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionDispersion,
  soumettreReponseTableau,
  soumettreReponseVarianceEcartType,
} from "./moteur/sessionDispersion";
import type { EtatSessionDispersion, PhaseDispersion } from "./moteur/typesDispersion";
import { genererExerciceDispersion } from "./generateurs/dispersion";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeTableauDispersion } from "./components/EtapeTableauDispersion";
import { EtapeVarianceEcartTypeDispersion } from "./components/EtapeVarianceEcartTypeDispersion";
import { SegmentsInline } from "./components/SegmentsInline";
import {
  formatEcartTypeAttendueTexte,
  formatEnonceSegments,
  formatTableauAttenduTexte,
  formatVarianceAttendueTexte,
} from "./ui/formatDispersion";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifDispersion } from "./ui/recapitulatifDispersion";
import { EnTeteExercice } from "./components/EnTeteExercice";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionDispersion {
  return demarrerSessionDispersion(REGLAGES_DEMO, genererExerciceDispersion);
}

const LIBELLE_PHASE: Record<PhaseDispersion, string> = {
  tableau: "Tableau et sommes intermédiaires",
  varianceEcartType: "Variance et écart-type",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDispersion;
  revele: boolean;
}

export function AppDispersion() {
  const [etat, setEtat] = useState<EtatSessionDispersion>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionDispersion) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = etat.phase === "tableau" ? nouvelEtat.tableauRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.varianceEcartTypeRevele;
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

  const exercice = etat.exerciceCourant;
  const recapitulatif = calculerRecapitulatifDispersion(etat);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          etat.phase === "tableau" ? (
            <SegmentsInline segments={formatTableauAttenduTexte(exercice)} />
          ) : (
            <>
              Variance attendue : {formatVarianceAttendueTexte(exercice)}, écart-type attendu : {formatEcartTypeAttendueTexte(exercice)}
            </>
          ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Paramètres de dispersion</h1>
        <p className="app-subtitle">Chapitre 5</p>
      </header>

      <main className="card">
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>

        <div className="card-body">
          <EnTeteExercice consigneGenerale={<SegmentsInline segments={formatEnonceSegments(exercice)} />} blocDonnees={null} />
          <RecapitulatifPanel entrees={recapitulatif} />
          {etat.phase === "varianceEcartType" && <CalculatriceScientifique />}
          {etat.phase === "tableau" ? (
            <EtapeTableauDispersion
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideTableau}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseTableau(etat, reponse))}
              validation={validation}
            />
          ) : (
            <EtapeVarianceEcartTypeDispersion
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideVarianceEcartType}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseVarianceEcartType(etat, reponse))}
              validation={validation}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
