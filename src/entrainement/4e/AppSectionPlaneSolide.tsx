import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionSectionPlaneSolide,
  soumettreConclusion,
  soumettreReponseAuxiliaireFace,
  soumettreReponseAuxiliaireLignes,
  soumettreReponseSegmentDirect,
} from "./moteur/sessionSectionPlaneSolide";
import type { EtatSessionSectionPlaneSolide, PhaseSectionPlaneSolide } from "./moteur/typesSectionPlaneSolide";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSectionPlaneSolide } from "./generateurs/sectionPlaneSolide";
import type { NomSolide3D } from "./core/geometrieEspace.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeAuxiliaireFace } from "./components/EtapeAuxiliaireFace";
import { EtapeAuxiliaireLignes } from "./components/EtapeAuxiliaireLignes";
import { EtapeConclusionSectionPlaneSolide } from "./components/EtapeConclusionSectionPlaneSolide";
import { EtapeSegmentDirect } from "./components/EtapeSegmentDirect";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Détermine la section plane de ce solide.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionSectionPlaneSolide {
  return demarrerSessionSectionPlaneSolide(REGLAGES_DEMO, genererExerciceSectionPlaneSolide);
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

/** État tenu en attente dès qu'un écran NOTÉ se termine (bonne réponse, ou tentatives épuisées) —
 * l'état de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). Ne couvre QUE segmentDirect/auxiliaireLignes/auxiliaireFace : le
 * nombre d'écrans par exercice est variable (jamais une séquence de phases fixe, voir
 * `typesSectionPlaneSolide.ts`), donc la clôture d'un écran noté est détectée via la croissance de
 * `scoresAccumules` (un push par action notée), jamais via un simple changement de `phase` (qui peut
 * rester identique d'un écran noté au suivant, ex. deux "segmentDirect" consécutifs). L'écran
 * "conclusion" reste un cas à part, sans note ni réponse à valider — voir `EtapeConclusionSectionPlaneSolide`
 * plus bas, qui continue à transitionner directement, sans ce mécanisme. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionSectionPlaneSolide;
  revele: boolean;
}

export function AppSectionPlaneSolide() {
  const [etat, setEtat] = useState<EtatSessionSectionPlaneSolide>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionSectionPlaneSolide) {
    const transitionDEcran = nouvelEtat.scoresAccumules.length > etat.scoresAccumules.length;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.revelesAccumules[nouvelEtat.revelesAccumules.length - 1]! });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  /** Écran de conclusion — AUCUNE pause/validation (exception documentée, voir header) : simple
   * écran "Continuer" narratif, sans réponse ni bouton Valider, transitionne toujours directement. */
  function continuerConclusion() {
    const nouvelEtat = soumettreConclusion(etat);
    setEtat(nouvelEtat.terminee ? nouvelleSession() : nouvelEtat);
  }

  function forcerVariante(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionSectionPlaneSolide(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as NomSolide3D)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        // Jamais de "réponse attendue" révélée ici (spec) — la vérité terrain n'est jamais montrée
        // sous forme numérique, seulement via le croquis final de l'écran de conclusion.
        reponseAttendue: undefined,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Section plane d'un solide</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie dans l'espace</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
        <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
        {etat.phase === "segmentDirect" ? (
          <EtapeSegmentDirect
            exercice={etat.exerciceCourant}
            connus={etat.connus}
            segmentsTraces={etat.segmentsTraces}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(face) => terminerEtape(soumettreReponseSegmentDirect(etat, face))}
            validation={validation}
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
            onValider={(ligne1, ligne2) => terminerEtape(soumettreReponseAuxiliaireLignes(etat, ligne1, ligne2))}
            validation={validation}
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
            onValider={(face) => terminerEtape(soumettreReponseAuxiliaireFace(etat, face))}
            validation={validation}
          />
        ) : (
          <EtapeConclusionSectionPlaneSolide
            exercice={etat.exerciceCourant}
            connus={etat.connus}
            segmentsTraces={etat.segmentsTraces}
            onContinuer={continuerConclusion}
          />
        )}
        </div>
      </main>
    </div>
  );
}
