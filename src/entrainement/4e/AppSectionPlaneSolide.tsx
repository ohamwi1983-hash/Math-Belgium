import { useState } from "react";
import type { ExerciceSectionPlaneSolide } from "./core/sectionPlaneSolide.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionSectionPlaneSolide,
  soumettreConclusion,
  soumettreReponseAuxiliaireFace,
  soumettreReponseAuxiliaireLignes,
  soumettreReponseSegmentDirect,
} from "./moteur/sessionSectionPlaneSolide";
import type { EtatSessionSectionPlaneSolide, PhaseSectionPlaneSolide, ResultatExerciceSectionPlaneSolide } from "./moteur/typesSectionPlaneSolide";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSectionPlaneSolide } from "./generateurs/sectionPlaneSolide";
import type { NomSolide3D } from "./core/geometrieEspace.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeAuxiliaireFace } from "./components/EtapeAuxiliaireFace";
import { EtapeAuxiliaireLignes } from "./components/EtapeAuxiliaireLignes";
import { EtapeConclusionSectionPlaneSolide } from "./components/EtapeConclusionSectionPlaneSolide";
import { EtapeSegmentDirect } from "./components/EtapeSegmentDirect";
import { ResultatPanelSectionPlaneSolide } from "./components/ResultatPanelSectionPlaneSolide";
import { ResumeSessionSectionPlaneSolide } from "./components/ResumeSessionSectionPlaneSolide";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionSectionPlaneSolide {
  return demarrerSessionSectionPlaneSolide(REGLAGES_DEMO, genererExerciceSectionPlaneSolide);
}

interface Bilan {
  resultat: ResultatExerciceSectionPlaneSolide;
  exercice: ExerciceSectionPlaneSolide;
}

/** Libellé de la phase COURANTE (fixe, 4 valeurs) — jamais un indicateur "écran X/N" par exercice,
 * le nombre d'écrans n'étant pas connu à l'avance (voir `typesSectionPlaneSolide.ts`). Le nombre
 * d'exercices de la session, lui, reste connu et affiché normalement ; la progression AU SEIN d'un
 * exercice est portée par les 2 compteurs live de chaque écran (sommets découverts/segments tracés),
 * pas par ce libellé. */
const LIBELLE_PHASE: Record<PhaseSectionPlaneSolide, string> = {
  segmentDirect: "Tracer un segment",
  auxiliaireLignes: "Point auxiliaire — droites",
  auxiliaireFace: "Point auxiliaire — face",
  conclusion: "Conclusion",
};

export function AppSectionPlaneSolide() {
  const [etat, setEtat] = useState<EtatSessionSectionPlaneSolide>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceSectionPlaneSolide, nouvelEtat: EtatSessionSectionPlaneSolide) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionSectionPlaneSolide(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as NomSolide3D)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Section plane d'un solide</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie dans l'espace</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
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
      </header>

      <main className="card">
        <div className="card-body">
        {dernierBilan ? (
          <ResultatPanelSectionPlaneSolide
            resultat={dernierBilan.resultat}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionSectionPlaneSolide resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "segmentDirect" ? (
          <EtapeSegmentDirect
            exercice={etat.exerciceCourant}
            connus={etat.connus}
            segmentsTraces={etat.segmentsTraces}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(face) => setEtat(soumettreReponseSegmentDirect(etat, face))}
          />
        ) : etat.phase === "auxiliaireLignes" ? (
          <EtapeAuxiliaireLignes
            exercice={etat.exerciceCourant}
            connus={etat.connus}
            segmentsTraces={etat.segmentsTraces}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(ligne1, ligne2) => setEtat(soumettreReponseAuxiliaireLignes(etat, ligne1, ligne2))}
          />
        ) : etat.phase === "auxiliaireFace" && etat.ligneAuxiliaireChoisie ? (
          <EtapeAuxiliaireFace
            exercice={etat.exerciceCourant}
            connus={etat.connus}
            segmentsTraces={etat.segmentsTraces}
            ligneAuxiliaireChoisie={etat.ligneAuxiliaireChoisie}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(face) => setEtat(soumettreReponseAuxiliaireFace(etat, face))}
          />
        ) : (
          <EtapeConclusionSectionPlaneSolide
            exercice={etat.exerciceCourant}
            connus={etat.connus}
            segmentsTraces={etat.segmentsTraces}
            onContinuer={() => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreConclusion(etat));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
