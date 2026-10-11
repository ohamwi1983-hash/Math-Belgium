import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAide,
  demarrerSessionCercleTrigonometrique,
  soumettreReponseAnglePremierQuadrant,
  soumettreReponseQuadrant,
  soumettreReponseReduction,
  soumettreReponseSignes,
} from "./moteur/sessionCercleTrigonometrique";
import type { EtatSessionCercleTrigonometrique, PhaseCercleTrigonometrique } from "./moteur/typesCercleTrigonometrique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCercleTrigonometrique } from "./generateurs/cercleTrigonometrique";
import type { VarianteCercleTrigId } from "./core/cercleTrigonometrique.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReductionCercleTrig } from "./components/EtapeReductionCercleTrig";
import { EtapeQuadrantCercleTrig } from "./components/EtapeQuadrantCercleTrig";
import { EtapeAnglePremierQuadrantCercleTrig } from "./components/EtapeAnglePremierQuadrantCercleTrig";
import { EtapeSignesCercleTrig } from "./components/EtapeSignesCercleTrig";
import { libelleQuadrant } from "./ui/formatCercleTrigonometrique";
import { calculerRecapitulatifCercleTrigonometrique } from "./ui/recapitulatifCercleTrigonometrique";
import { necessiteReduction } from "./moteur/verificationCercleTrigonometrique";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionCercleTrigonometrique {
  return demarrerSessionCercleTrigonometrique(REGLAGES_DEMO, genererExerciceCercleTrigonometrique);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionCercleTrigonometrique;
  revele: boolean;
}

/** Les 3 phases toujours présentes, dans l'ordre réel — "reduction" s'intercale en tête, seulement
 * si nécessaire (voir `calculerSegmentsProgression` ci-dessous et le commentaire de tête de
 * sessionCercleTrigonometrique.ts : "[reduction] → quadrant → anglePremierQuadrant → signes"). */
const PHASES_FIXES: PhaseCercleTrigonometrique[] = ["quadrant", "anglePremierQuadrant", "signes"];

/**
 * Segments de la barre de puces — "reduction" n'est incluse que si elle a réellement lieu : soit
 * déjà close (`scoreReductionExercice !== null`), soit encore à venir sur un angle hors [0°,360°[
 * (`necessiteReduction`) — valable après coup aussi, car l'angle de `exerciceCourant` ne change
 * jamais une fois l'exercice généré (contrairement aux coefficients réduits ailleurs sur ce
 * chantier). Les trois `xxxRevele` lus ci-dessous sont de vrais booléens trackés par le moteur
 * (pas l'heuristique score===0 des autres générateurs) — mêmes champs que
 * `calculerRecapitulatifCercleTrigonometrique` (ui/recapitulatifCercleTrigonometrique.ts). "signes"
 * (dernière phase) n'a pas de branche "close" propre : une fois notée, un nouvel exercice démarre.
 */
function calculerSegmentsProgression(etat: EtatSessionCercleTrigonometrique): EtatPuceProgression[] {
  const reductionApplicable = etat.scoreReductionExercice !== null || necessiteReduction(etat.exerciceCourant);
  const phases: PhaseCercleTrigonometrique[] = reductionApplicable ? ["reduction", ...PHASES_FIXES] : PHASES_FIXES;
  const indexCourant = phases.indexOf(etat.phase);

  return phases.map((phase, k) => {
    if (k > indexCourant) return "a-venir";
    if (k === indexCourant) return "courante";
    switch (phase) {
      case "reduction":
        return etat.reductionRevele ? "revele" : "correcte";
      case "quadrant":
        return etat.quadrantRevele ? "revele" : "correcte";
      default:
        return etat.anglePremierQuadrantRevele ? "revele" : "correcte";
    }
  });
}

export function AppCercleTrigonometrique() {
  const [etat, setEtat] = useState<EtatSessionCercleTrigonometrique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionCercleTrigonometrique) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "reduction"
          ? nouvelEtat.reductionRevele
          : etat.phase === "quadrant"
            ? nouvelEtat.quadrantRevele
            : etat.phase === "anglePremierQuadrant"
              ? nouvelEtat.anglePremierQuadrantRevele
              : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.signesRevele;
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

  const recapitulatif = calculerRecapitulatifCercleTrigonometrique(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionCercleTrigonometrique(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteCercleTrigId)));
  }

  const exercice = etat.exerciceCourant;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec
          ? undefined
          : etat.phase === "reduction" ? (
              <>Angle réduit attendu : {exercice.angleReduit}°</>
            ) : etat.phase === "quadrant" ? (
              <>Quadrant attendu : {libelleQuadrant(exercice.quadrant)}</>
            ) : etat.phase === "anglePremierQuadrant" ? (
              <>Angle du premier quadrant attendu : {exercice.anglePremierQuadrant}°</>
            ) : (
              <>
                Signes attendus : sin(θ) {exercice.signeSin} ; cos(θ) {exercice.signeCos} ; tan(θ){" "}
                {exercice.signeTan === "indefini" ? "∄" : exercice.signeTan}
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
        <h1 className="app-title">Placement et lecture sur le cercle trigonométrique</h1>
        <p className="app-subtitle">Chapitre 3</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>

      <main className="card">
        <div className="card-body">
          {etat.phase === "reduction" ? (
            <EtapeReductionCercleTrig
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideReductionUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(valeur) => terminerEtape(soumettreReponseReduction(etat, valeur))}
              validation={validation}
            />
          ) : etat.phase === "quadrant" ? (
            <EtapeQuadrantCercleTrig
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(quadrant) => terminerEtape(soumettreReponseQuadrant(etat, quadrant))}
              validation={validation}
            />
          ) : etat.phase === "anglePremierQuadrant" ? (
            <EtapeAnglePremierQuadrantCercleTrig
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideAnglePremierQuadrantUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(valeur) => terminerEtape(soumettreReponseAnglePremierQuadrant(etat, valeur))}
              validation={validation}
            />
          ) : (
            <EtapeSignesCercleTrig
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideSignesUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSignes(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
