import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConstructionDroite } from "./generateurs/constructionDroite";
import type { VarianteConstructionDroite } from "./core/constructionDroite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionConstructionDroite, soumettreReponsePoints, soumettreReponseTrace } from "./moteur/sessionConstructionDroite";
import type { EtatSessionConstructionDroite, PhaseConstructionDroite } from "./moteur/typesConstructionDroite";
import { EtapePointsConstructionDroite } from "./components/EtapePointsConstructionDroite";
import { EtapeTraceConstructionDroite } from "./components/EtapeTraceConstructionDroite";
import { Katex } from "./components/Katex";
import { formatEnonceLatex, formatEtatActuelPointsLatex } from "./ui/formatConstructionDroite";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifConstructionDroite } from "./ui/recapitulatifConstructionDroite";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionConstructionDroite {
  return demarrerSessionConstructionDroite(REGLAGES_DEMO, genererExerciceConstructionDroite);
}

const ORDRE_PHASES: PhaseConstructionDroite[] = ["points", "trace"];

function calculerSegmentsProgression(etat: EtatSessionConstructionDroite): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((_phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    if (etat.pointsRevele) return "revele";
    return etat.niveauAidePoints > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionConstructionDroite;
  revele: boolean;
}

export function AppConstructionDroite() {
  const [etat, setEtat] = useState<EtatSessionConstructionDroite>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionConstructionDroite) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = etat.phase === "points" ? nouvelEtat.pointsRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.traceRevele;
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
  const recapitulatif = calculerRecapitulatifConstructionDroite(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionConstructionDroite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteConstructionDroite)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          etat.phase === "points" ? (
            <Katex expression={formatEtatActuelPointsLatex(exercice.point, { x: exercice.point.x + exercice.vecteur.x, y: exercice.point.y + exercice.vecteur.y })} />
          ) : (
            <Katex expression={formatEnonceLatex(exercice)} />
          ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Construction graphique — tracer une droite</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {etat.phase === "points" ? (
          <EtapePointsConstructionDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAidePoints}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponsePoints(etat, reponse))}
            validation={validation}
          />
        ) : etat.cible1 !== null && etat.cible2 !== null ? (
          <EtapeTraceConstructionDroite
            exercice={exercice}
            cible1={etat.cible1}
            cible2={etat.cible2}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideTrace}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseTrace(etat, reponse))}
            validation={validation}
          />
        ) : null}
        </div>
      </main>
    </div>
  );
}
