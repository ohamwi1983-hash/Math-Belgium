import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { activerAideSuivante, demarrerSessionPositionDroitePlan, soumettreReponseClassification, soumettreReponseJustification } from "./moteur/sessionPositionDroitePlan";
import type { EtatSessionPositionDroitePlan, PhasePositionDroitePlan } from "./moteur/typesPositionDroitePlan";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePositionDroitePlan } from "./generateurs/positionDroitePlan";
import type { ConclusionPositionDroitePlan } from "./core/positionDroitePlan.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeClassificationPositionDroitePlan } from "./components/EtapeClassificationPositionDroitePlan";
import { EtapeJustificationPositionDroitePlan } from "./components/EtapeJustificationPositionDroitePlan";
import { LIBELLE_CLASSIFICATION, libelleDroite, libellePlan, texteReponseJustificationAttendue } from "./ui/formatPositionDroitePlan";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Solide3DSketch } from "./components/Solide3DSketch";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionPositionDroitePlan {
  return demarrerSessionPositionDroitePlan(REGLAGES_DEMO, genererExercicePositionDroitePlan);
}

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence (toujours
 * linéaire ici, 2 phases fixes). "justification" (dernière phase) n'a jamais besoin de sa propre
 * branche "close" — même principe que gen9/gen55. Puces purement visuelles. */
const ORDRE_PHASES: PhasePositionDroitePlan[] = ["classification", "justification"];

function calculerSegmentsProgression(etat: EtatSessionPositionDroitePlan): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((_phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    if (etat.classificationRevele) return "revele";
    return etat.niveauAideClassification > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionPositionDroitePlan;
  revele: boolean;
}

export function AppPositionDroitePlan() {
  const [etat, setEtat] = useState<EtatSessionPositionDroitePlan>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionPositionDroitePlan) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "classification" ? nouvelEtat.classificationRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.justificationRevele;
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

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionPositionDroitePlan(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as ConclusionPositionDroitePlan)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          phase === "classification" ? (
            <>
              Classification attendue : la droite {libelleDroite(exercice)} est {LIBELLE_CLASSIFICATION[exercice.classification].toLowerCase()} (plan{" "}
              {libellePlan(exercice)}).
            </>
          ) : (
            <>Justification attendue : {texteReponseJustificationAttendue(exercice)}.</>
          ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Position d'une droite par rapport à un plan</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie dans l'espace</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>

      <main className="card">
        <div className="card-body">
        <EnTeteExercice
          consigneGenerale={
            <>
              Étudie la position de la droite {libelleDroite(exercice)} par rapport au plan {libellePlan(exercice)}.
            </>
          }
          blocDonnees={<Solide3DSketch solide={exercice.solide} plan={exercice.plan} droite={exercice.droite} />}
        />
        {phase === "classification" ? (
          <EtapeClassificationPositionDroitePlan
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideClassification}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseClassification(etat, reponse))}
            validation={validation}
          />
        ) : (
          <EtapeJustificationPositionDroitePlan
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideJustification}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseJustification(etat, reponse))}
            validation={validation}
          />
        )}
        </div>
      </main>
    </div>
  );
}
