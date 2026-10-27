import { useState } from "react";
import type { OrientationParabole } from "./core/equationParabole.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationParaboleDeveloppee } from "./generateurs/equationParaboleDeveloppee";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionEquationParaboleDeveloppee,
  soumettreReponseCaracteristiques,
  soumettreReponseCompletion,
  soumettreReponseRegroupement,
} from "./moteur/sessionEquationParaboleDeveloppee";
import type { EtatSessionEquationParaboleDeveloppee, PhaseEquationParaboleDeveloppee } from "./moteur/typesEquationParaboleDeveloppee";
import { EtapeCaracteristiquesEquationParaboleDeveloppee } from "./components/EtapeCaracteristiquesEquationParaboleDeveloppee";
import { EtapeCompletionEquationParaboleDeveloppee } from "./components/EtapeCompletionEquationParaboleDeveloppee";
import { EtapeRegroupementEquationParaboleDeveloppee } from "./components/EtapeRegroupementEquationParaboleDeveloppee";
import { Katex } from "./components/Katex";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifEquationParaboleDeveloppee } from "./ui/recapitulatifEquationParaboleDeveloppee";
import { formatCompletionLatex, formatDirectriceLatex, formatFoyerLatex, formatRegroupementLatex, formatSommetLatex } from "./ui/formatEquationParaboleDeveloppee";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationParaboleDeveloppee {
  return demarrerSessionEquationParaboleDeveloppee(REGLAGES_DEMO, genererExerciceEquationParaboleDeveloppee);
}

/** 3 phases fixes, toujours le même ordre — "caracteristiques" (dernière phase) n'a jamais besoin
 * de sa propre branche "close" : jamais consultée comme phase passée. Puces purement visuelles
 * (pas de `onSegmentClick`). */
const ORDRE_PHASES: PhaseEquationParaboleDeveloppee[] = ["regroupement", "completion", "caracteristiques"];

function calculerSegmentsProgression(etat: EtatSessionEquationParaboleDeveloppee): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = phase === "regroupement" ? etat.regroupementRevele : etat.completionRevele;
    if (revele) return "revele";
    const niveauAide = phase === "regroupement" ? etat.niveauAideRegroupement : etat.niveauAideCompletion;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationParaboleDeveloppee;
  revele: boolean;
}

export function AppEquationParaboleDeveloppee() {
  const [etat, setEtat] = useState<EtatSessionEquationParaboleDeveloppee>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionEquationParaboleDeveloppee) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "regroupement"
          ? nouvelEtat.regroupementRevele
          : etat.phase === "completion"
            ? nouvelEtat.completionRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.caracteristiquesRevele;
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
    setEtat(demarrerSessionEquationParaboleDeveloppee(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as OrientationParabole)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const recapitulatif = calculerRecapitulatifEquationParaboleDeveloppee(etat);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {phase === "regroupement" && (
              <>
                Regroupement attendu : <Katex expression={formatRegroupementLatex(exercice)} />
              </>
            )}
            {phase === "completion" && (
              <>
                Complétion attendue : <Katex expression={formatCompletionLatex(exercice)} />
              </>
            )}
            {phase === "caracteristiques" && (
              <>
                Sommet attendu : <Katex expression={formatSommetLatex(exercice.sommet)} /> — Foyer attendu :{" "}
                <Katex expression={formatFoyerLatex(exercice.foyer)} /> — p attendu : <Katex expression={`p = ${exercice.p}`} /> — Directrice attendue :{" "}
                <Katex expression={formatDirectriceLatex(exercice)} />
              </>
            )}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Sommet, foyer, p et directrice d'une parabole depuis l'équation développée</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>

      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={recapitulatif} />
          {phase === "regroupement" ? (
            <EtapeRegroupementEquationParaboleDeveloppee
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideRegroupement}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseRegroupement(etat, reponse))}
              validation={validation}
            />
          ) : phase === "completion" ? (
            <EtapeCompletionEquationParaboleDeveloppee
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCompletion}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCompletion(etat, reponse))}
              validation={validation}
            />
          ) : (
            <EtapeCaracteristiquesEquationParaboleDeveloppee
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCaracteristiques}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCaracteristiques(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
