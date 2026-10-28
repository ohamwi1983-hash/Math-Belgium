import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLieuxGeometriques } from "./generateurs/lieuxGeometriques";
import type { VarianteLieuxGeometriquesId } from "./generateurs/lieuxGeometriques";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionLieuxGeometriques,
  soumettreReponseEquations,
  soumettreReponseIdentification,
  soumettreReponseResolution,
} from "./moteur/sessionLieuxGeometriques";
import type { EtatSessionLieuxGeometriques, PhaseLieuxGeometriques } from "./moteur/typesLieuxGeometriques";
import { EtapeEquationsLieuxGeometriques } from "./components/EtapeEquationsLieuxGeometriques";
import { EtapeIdentificationLieuxGeometriques } from "./components/EtapeIdentificationLieuxGeometriques";
import { EtapeResolutionLieuxGeometriques } from "./components/EtapeResolutionLieuxGeometriques";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EnTeteExercice } from "./components/EnTeteExercice";
import {
  formatEquationLieuLatex,
  segmentsDescriptionLieu,
  segmentsEnonce,
  texteNombrePointsAttendu,
  texteReponseResolutionAttendue,
} from "./ui/formatLieuxGeometriques";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const CONSIGNE_GENERALE = "Détermine l'intersection de ces lieux géométriques.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionLieuxGeometriques {
  return demarrerSessionLieuxGeometriques(REGLAGES_DEMO, genererExerciceLieuxGeometriques);
}

/** 3 phases fixes (voir `PhaseLieuxGeometriques`). "resolution" (dernière phase) n'a jamais besoin
 * de sa propre branche "close" : un nouvel exercice redémarre toujours juste après, donc elle reste
 * "a-venir" jusqu'à devenir "courante" — jamais consultée comme passée (même principe que la
 * dernière phase d'`AppFormeCanoniqueTransformations`/`AppOptimisation`). Puces purement visuelles
 * (pas de `onSegmentClick`). */
const ORDRE_PHASES: PhaseLieuxGeometriques[] = ["identification", "equations", "resolution"];

function calculerSegmentsProgression(etat: EtatSessionLieuxGeometriques): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = phase === "identification" ? etat.identificationRevele : etat.equationsRevele;
    if (revele) return "revele";
    const niveauAide = phase === "identification" ? etat.niveauAideIdentification : etat.niveauAideEquations;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLieuxGeometriques;
  revele: boolean;
}

export function AppLieuxGeometriques() {
  const [etat, setEtat] = useState<EtatSessionLieuxGeometriques>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionLieuxGeometriques) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "identification"
          ? nouvelEtat.identificationRevele
          : etat.phase === "equations"
            ? nouvelEtat.equationsRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.resolutionRevele;
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
    setEtat(demarrerSessionLieuxGeometriques(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteLieuxGeometriquesId)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          phase === "identification" ? (
            <>
              Premier lieu : <RenduFragments fragments={segmentsDescriptionLieu(exercice.lieu1)} />. Second lieu :{" "}
              <RenduFragments fragments={segmentsDescriptionLieu(exercice.lieu2)} />.
            </>
          ) : phase === "equations" ? (
            <>
              Équations attendues : <Katex expression={formatEquationLieuLatex(exercice.lieu1)} /> et{" "}
              <Katex expression={formatEquationLieuLatex(exercice.lieu2)} />
            </>
          ) : (
            <>
              {texteNombrePointsAttendu(exercice.nombrePoints)}{" "}
              {exercice.nombrePoints > 0 && (
                <>
                  Réponse attendue : <Katex expression={texteReponseResolutionAttendue(exercice)} />
                </>
              )}
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
        <h1 className="app-title">Lieux géométriques : intersection</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>

      <main className="card">
        <div className="card-body">
        <EnTeteExercice
          consigneGenerale={CONSIGNE_GENERALE}
          blocDonnees={
            <div className="equation-box">
              <p>
                <RenduFragments fragments={segmentsEnonce(exercice)} />
              </p>
            </div>
          }
        />
        {phase === "identification" ? (
          <EtapeIdentificationLieuxGeometriques
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideIdentification}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseIdentification(etat, reponse))}
            validation={validation}
          />
        ) : phase === "equations" ? (
          <EtapeEquationsLieuxGeometriques
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideEquations}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseEquations(etat, reponse))}
            validation={validation}
          />
        ) : (
          <EtapeResolutionLieuxGeometriques
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideResolution}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseResolution(etat, reponse))}
            validation={validation}
          />
        )}
        </div>
      </main>
    </div>
  );
}
