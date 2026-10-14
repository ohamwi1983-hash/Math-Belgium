import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { genererExerciceConstructionParabole } from "./generateurs/constructionParabole";
import {
  NOMBRE_ITERATIONS_CONSTRUCTION_PARABOLE,
  activerAideSuivante,
  ciblesTraceConstructionParabole,
  demarrerSessionConstructionParabole,
  soumettreReponseConstruction,
  soumettreReponseTrace,
} from "./moteur/sessionConstructionParabole";
import type { EtatSessionConstructionParabole } from "./moteur/typesConstructionParabole";
import { EtapeConstructionParabole } from "./components/EtapeConstructionParabole";
import { EtapeTraceParabole } from "./components/EtapeTraceParabole";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Construis cette parabole au compas et à l'équerre.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionConstructionParabole {
  return demarrerSessionConstructionParabole(REGLAGES_DEMO, genererExerciceConstructionParabole);
}

function libellePhase(etat: EtatSessionConstructionParabole): string {
  if (etat.phase === "trace") return "Tracé final";
  return `Itération ${etat.iterationCourante + 1} / ${NOMBRE_ITERATIONS_CONSTRUCTION_PARABOLE}`;
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). Chaque itération de "construction" est son propre écran (même sans
 * changement de `phase`) : la transition se détecte aussi sur `iterationCourante`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionConstructionParabole;
  revele: boolean;
}

export function AppConstructionParabole() {
  const [etat, setEtat] = useState<EtatSessionConstructionParabole>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionConstructionParabole) {
    const transitionDEcran =
      nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.iterationCourante !== etat.iterationCourante;
    if (transitionDEcran) {
      const revele =
        etat.phase === "construction"
          ? nouvelEtat.iterationsCompletes[nouvelEtat.iterationsCompletes.length - 1]!.constructionRevele
          : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.traceRevele;
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

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec
          ? undefined
          : etat.phase === "construction" ? (
              <>
                Sur une itération ratée : le rayon choisi ne respectait pas la contrainte (strictement supérieur à la moitié de la distance entre le
                foyer et la directrice), ou la droite construite n'était pas exactement à cette même distance, du côté du foyer.
              </>
            ) : (
              <>Les 6 points doivent être sélectionnés dans l'ordre, du côté gauche vers le côté droit.</>
            ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Construction de la parabole au compas et à l'équerre</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{libellePhase(etat)}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
        <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
        {etat.phase === "construction" ? (
          <EtapeConstructionParabole
            key={etat.iterationCourante}
            exercice={exercice}
            numeroIteration={etat.iterationCourante + 1}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideConstruction}
            rDejaUtilises={etat.iterationsCompletes.map((iteration) => iteration.r)}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstruction(etat, reponse))}
            validation={validation}
          />
        ) : (
          <EtapeTraceParabole
            exercice={exercice}
            cibles={ciblesTraceConstructionParabole(etat)}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(selectionnes) => terminerEtape(soumettreReponseTrace(etat, selectionnes))}
            validation={validation}
          />
        )}
        </div>
      </main>
    </div>
  );
}
