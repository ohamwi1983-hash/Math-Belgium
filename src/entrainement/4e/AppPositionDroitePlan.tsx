import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionPositionDroitePlan,
  soumettreReponseClassification,
  soumettreReponseJustification,
  tentativesMaxEcran,
} from "./moteur/sessionPositionDroitePlan";
import type { EtatSessionPositionDroitePlan, PhasePositionDroitePlan } from "./moteur/typesPositionDroitePlan";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePositionDroitePlan } from "./generateurs/positionDroitePlan";
import type { ConclusionPositionDroitePlan, ExercicePositionDroitePlan, ReponseJustificationPositionDroitePlan } from "./core/positionDroitePlan.types";
import type { Point3D } from "./core/geometrieEspace.types";
import { positionPointNomme } from "./moteur/verificationPositionDroitePlan";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeClassificationPositionDroitePlan } from "./components/EtapeClassificationPositionDroitePlan";
import { EtapeJustificationPositionDroitePlan } from "./components/EtapeJustificationPositionDroitePlan";
import {
  LIBELLE_CLASSIFICATION,
  libelleCandidatSecante,
  libelleDroite,
  libellePlan,
  phrasePosition,
  textePointsNommes,
  texteReponseJustificationAttendue,
} from "./ui/formatPositionDroitePlan";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import type { EntreeRecapitulatif } from "./ui/recapitulatif";
import { Solide3DSketch } from "./components/Solide3DSketch";
import type { PointExtraSolide3D } from "./components/Solide3DSketch";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";

/** `tentativesMax` n'est qu'un plafond : le nombre réel de tentatives est fixé PAR ÉCRAN par
 * `tentativesMaxEcran` (1 pour la classification — décision H2a, audit chapitre 8). */
const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionPositionDroitePlan {
  return demarrerSessionPositionDroitePlan(REGLAGES_DEMO, genererExercicePositionDroitePlan);
}

/** Panneau dev visible seulement en développement ou avec `?dev=1` (même garde que gen65,
 * `AppQuizGeometrieAnalytique.tsx`) — jamais sur l'écran normal donné aux élèves. */
function modeDevActif(): boolean {
  if (import.meta.env.DEV) return true;
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "1";
}

/** Ordre d'affichage des puces — toujours linéaire ici, 2 phases fixes. "justification" (dernière
 * phase) n'est jamais consultée comme passée : un nouvel exercice redémarre juste après. */
const ORDRE_PHASES: PhasePositionDroitePlan[] = ["classification", "justification"];

const TITRES_ECRANS: Record<PhasePositionDroitePlan, string> = {
  classification: "Position de la droite",
  justification: "Justification",
};

function calculerSegmentsProgression(etat: EtatSessionPositionDroitePlan): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((_phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    if (etat.classificationRevele) return "revele";
    return etat.niveauAideClassification > 0 ? "aide" : "correcte";
  });
}

/** Rappel de la classification confirmée, en tête de l'écran 2 (remplace l'ancien encadré brut
 * « État actuel »). */
function calculerRecapitulatif(etat: EtatSessionPositionDroitePlan): EntreeRecapitulatif[] {
  if (etat.phase !== "justification") return [];
  return [{ libelle: "Position", valeur: `${phrasePosition(etat.exerciceCourant)}.`, estLatex: false, revele: etat.classificationRevele }];
}

/** Réponse attendue de l'écran `phase` — VALEUR seule (`ValidationEcran` et `FicheReponseEcran`
 * ajoutent eux-mêmes « Réponse attendue »). */
function construireReponseAttendue(exercice: ExercicePositionDroitePlan, phase: PhasePositionDroitePlan): ReactNode {
  if (phase === "classification") return <>{phrasePosition(exercice)}.</>;
  return <>{texteReponseJustificationAttendue(exercice)}.</>;
}

function texteReponseJustification(exercice: ExercicePositionDroitePlan, reponse: ReponseJustificationPositionDroitePlan): string {
  if (reponse.type === "incluse") return reponse.points.join(", ");
  if (reponse.type === "parallele") return exercice.candidatsParallele[reponse.indexCandidat]?.label ?? "";
  const candidat = exercice.candidatsSecante[reponse.indexCandidat];
  return candidat ? libelleCandidatSecante(candidat) : "";
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
  /** Consultation en lecture seule des écrans clos (puces cliquables) — une entrée par écran clos,
   * même index que sa puce. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucun choix de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice ». */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionPositionDroitePlan, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "classification" ? nouvelEtat.classificationRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.justificationRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      setHistorique((h) => [
        ...h,
        { titre: TITRES_ECRANS[etat.phase], votreReponse, correcte: !revele, reponseAttendue: construireReponseAttendue(etat.exerciceCourant, etat.phase) },
      ]);
      return;
    }
    setEtat(nouvelEtat);
  }

  function reinitialiserHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) reinitialiserHistorique();
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    reinitialiserHistorique();
    setEtat(demarrerSessionPositionDroitePlan(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as ConclusionPositionDroitePlan)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: construireReponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const pointsNommes: PointExtraSolide3D[] = exercice.pointsNommes.map((p) => ({
    position: p.position,
    label: p.nom,
    couleur: "var(--solide3d-trait)",
    labelExterieur: true,
  }));
  const droitePoints: [Point3D, Point3D] = [
    positionPointNomme(exercice, exercice.droite[0])!,
    positionPointNomme(exercice, exercice.droite[1])!,
  ];
  const definitions = textePointsNommes(exercice);

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Position d'une droite par rapport à un plan</h1>
        <p className="app-subtitle">Chapitre 8 — Géométrie dans l'espace</p>
        {modeDevActif() && <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />}
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={
              <>
                Étudie la position de la droite {libelleDroite(exercice)} par rapport au plan {libellePlan(exercice)}.
                {definitions && <> {definitions}</>}
              </>
            }
            blocDonnees={<Solide3DSketch solide={exercice.solide} plan={exercice.plan} droitePoints={droitePoints} pointsExtra={pointsNommes} />}
          />
          <RecapitulatifPanel entrees={calculerRecapitulatif(etat)} />
          {phase === "classification" ? (
            <EtapeClassificationPositionDroitePlan
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxEcran(etat)}
              niveauAide={etat.niveauAideClassification}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseClassification(etat, reponse), LIBELLE_CLASSIFICATION[reponse])}
              validation={validation}
            />
          ) : (
            <EtapeJustificationPositionDroitePlan
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxEcran(etat)}
              niveauAide={etat.niveauAideJustification}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseJustification(etat, reponse), texteReponseJustification(exercice, reponse))}
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
