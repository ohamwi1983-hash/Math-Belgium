import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionSectionPlaneSolide,
  soumettreConclusion,
  soumettreReponseAuxiliaireFace,
  soumettreReponseAuxiliaireLignes,
  soumettreReponseSegmentDirect,
  tentativesMaxPhase,
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
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { HistoriqueEcransSectionPlaneSolide } from "./components/HistoriqueEcransSectionPlaneSolide";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import {
  calculerRecapitulatifSectionPlaneSolide,
  faceDuSegmentTrace,
  libelleFace,
  libelleLigne,
  texteReponseFace,
  texteReponseLignes,
  texteReponseSegmentDirect,
} from "./ui/formatSectionPlaneSolide";

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

/** Panneau dev visible seulement en développement ou avec `?dev=1` (même garde que
 * `AppQuizGeometrieAnalytique.tsx`) — jamais sur l'écran normal donné aux élèves. */
function modeDevActif(): boolean {
  if (import.meta.env.DEV) return true;
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "1";
}

/** Libellé de la phase COURANTE (fixe, 4 valeurs) — jamais un indicateur "écran X/N" par exercice,
 * le nombre d'écrans révélerait la forme de la section (voir `HistoriqueEcransSectionPlaneSolide`). */
const LIBELLE_PHASE: Record<PhaseSectionPlaneSolide, string> = {
  segmentDirect: "Tracer un segment",
  auxiliaireLignes: "Point auxiliaire — droites",
  auxiliaireFace: "Point auxiliaire — face",
  conclusion: "Conclusion",
};

/** État tenu en attente dès qu'un écran NOTÉ se termine (bonne réponse, ou tentatives épuisées) —
 * l'état de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). Le nombre d'écrans par exercice est variable, donc la clôture d'un
 * écran noté est détectée via la croissance de `scoresAccumules` (un push par action notée), jamais
 * via un simple changement de `phase` (qui peut rester identique d'un écran noté au suivant, ex.
 * deux "segmentDirect" consécutifs). `reponseAttendue` est la réponse CONFIRMÉE (celle de l'élève
 * si correcte, sinon la réponse révélée) déjà rédigée. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionSectionPlaneSolide;
  revele: boolean;
  reponseAttendue: string;
}

/** Réponse confirmée de l'écran qui vient de se clore — toujours lue dans l'état SUIVANT calculé par
 * le moteur (segment réellement tracé, paire réellement retenue, construction réellement faite),
 * jamais recalculée différemment. */
function reponseConfirmee(etat: EtatSessionSectionPlaneSolide, suivant: EtatSessionSectionPlaneSolide): string {
  const { exerciceCourant: exercice, connus } = etat;
  if (etat.phase === "segmentDirect") {
    const nouveau = suivant.segmentsTraces.find((cle) => !etat.segmentsTraces.includes(cle) && cle !== suivant.segmentAutomatique);
    const face = nouveau ? faceDuSegmentTrace(exercice, nouveau) : null;
    return face !== null ? texteReponseSegmentDirect(exercice, connus, face) : "";
  }
  if (etat.phase === "auxiliaireLignes") {
    return suivant.ligneAuxiliaireChoisie ? texteReponseLignes(exercice, connus, suivant.ligneAuxiliaireChoisie) : "";
  }
  return suivant.derniereConstruction ? texteReponseFace(exercice, connus, suivant.derniereConstruction) : "";
}

const TITRE_ECRAN: Record<PhaseSectionPlaneSolide, string> = {
  segmentDirect: "Tracer un segment",
  auxiliaireLignes: "Point auxiliaire — droites",
  auxiliaireFace: "Point auxiliaire — face",
  conclusion: "Conclusion",
};

/** Une entrée par écran noté déjà clos de l'exercice en cours — `aide` : au moins un niveau d'aide
 * utilisé sur cet écran (puce jaune). */
interface EntreeHistoriqueSection extends EntreeHistoriqueEtape {
  aide: boolean;
}

function puceDepuisHistorique(entree: EntreeHistoriqueSection): EtatPuceProgression {
  if (!entree.correcte) return "revele";
  return entree.aide ? "aide" : "correcte";
}

export function AppSectionPlaneSolide() {
  const [etat, setEtat] = useState<EtatSessionSectionPlaneSolide>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Numéro d'exercice — change à CHAQUE nouvel exercice (y compris via le panneau dev), pour que la
   * `key` des écrans remette leur état local à zéro (audit chapitre 8, points 4 et 19). */
  const [numeroExercice, setNumeroExercice] = useState(0);
  const [historique, setHistorique] = useState<EntreeHistoriqueSection[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function demarrerNouvelExercice(session: EtatSessionSectionPlaneSolide) {
    setEtat(session);
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
  }

  /** `saisie` : la réponse de l'élève déjà formatée, conservée pour la fiche de consultation. */
  function terminerEtape(nouvelEtat: EtatSessionSectionPlaneSolide, saisie: string) {
    const transitionDEcran = nouvelEtat.scoresAccumules.length > etat.scoresAccumules.length;
    if (transitionDEcran) {
      const revele = nouvelEtat.revelesAccumules[nouvelEtat.revelesAccumules.length - 1]!;
      const reponseAttendue = reponseConfirmee(etat, nouvelEtat);
      setEnAttente({ etatSuivant: nouvelEtat, revele, reponseAttendue });
      setHistorique((h) => [...h, { titre: TITRE_ECRAN[etat.phase], votreReponse: saisie, correcte: !revele, reponseAttendue, aide: etat.niveauAide > 0 }]);
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      demarrerNouvelExercice(nouvelleSession());
      return;
    }
    setEtat(enAttente.etatSuivant);
    setEnAttente(null);
  }

  /** Écran de conclusion — AUCUNE pause/validation : simple écran narratif, sans réponse ni bouton
   * Valider, qui lance directement un nouvel exercice. */
  function continuerConclusion() {
    const nouvelEtat = soumettreConclusion(etat);
    if (nouvelEtat.terminee) demarrerNouvelExercice(nouvelleSession());
    else setEtat(nouvelEtat);
  }

  function forcerVariante(varianteId: string) {
    demarrerNouvelExercice(demarrerSessionSectionPlaneSolide(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as NomSolide3D)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <p>{enAttente.reponseAttendue}</p>,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const segmentsPuces: EtatPuceProgression[] = [
    ...historique.map(puceDepuisHistorique),
    ...(enAttente || etat.phase === "conclusion" ? [] : (["courante"] as EtatPuceProgression[])),
  ];

  const cleEcran = `${numeroExercice}-${etat.scoresAccumules.length}-${etat.phase}`;
  const tentativesMax = tentativesMaxPhase(etat);
  const exercice = etat.exerciceCourant;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Section plane d'un solide</h1>
        <p className="app-subtitle">Chapitre 8 — Géométrie dans l'espace</p>
        {modeDevActif() && <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />}
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>
        <HistoriqueEcransSectionPlaneSolide segments={segmentsPuces} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <RecapitulatifPanel entrees={calculerRecapitulatifSectionPlaneSolide(exercice, etat.connus, etat.segmentsTraces)} />
          {etat.phase === "segmentDirect" ? (
            <EtapeSegmentDirect
              key={cleEcran}
              exercice={exercice}
              connus={etat.connus}
              segmentsTraces={etat.segmentsTraces}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(face) => terminerEtape(soumettreReponseSegmentDirect(etat, face), `Face ${libelleFace(exercice, face)}`)}
              validation={validation}
            />
          ) : etat.phase === "auxiliaireLignes" ? (
            <EtapeAuxiliaireLignes
              key={cleEcran}
              exercice={exercice}
              connus={etat.connus}
              segmentsTraces={etat.segmentsTraces}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(ligne1, ligne2) =>
                terminerEtape(
                  soumettreReponseAuxiliaireLignes(etat, ligne1, ligne2),
                  `${libelleLigne(exercice, etat.connus, ligne1)} et ${libelleLigne(exercice, etat.connus, ligne2)}`,
                )
              }
              validation={validation}
              paireConfirmee={enAttente?.etatSuivant.ligneAuxiliaireChoisie ?? null}
            />
          ) : etat.phase === "auxiliaireFace" && etat.ligneAuxiliaireChoisie ? (
            <EtapeAuxiliaireFace
              key={cleEcran}
              exercice={exercice}
              connus={etat.connus}
              segmentsTraces={etat.segmentsTraces}
              ligneAuxiliaireChoisie={etat.ligneAuxiliaireChoisie}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(face) => terminerEtape(soumettreReponseAuxiliaireFace(etat, face), `Face ${libelleFace(exercice, face)}`)}
              validation={validation}
              construction={enAttente?.etatSuivant.derniereConstruction ?? null}
            />
          ) : (
            <EtapeConclusionSectionPlaneSolide
              key={cleEcran}
              exercice={exercice}
              connus={etat.connus}
              segmentsTraces={etat.segmentsTraces}
              segmentAutomatique={etat.segmentAutomatique}
              onContinuer={continuerConclusion}
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
