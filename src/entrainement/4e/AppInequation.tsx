import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideIntervalle,
  activerAideSimplification,
  demarrerSessionInequation,
  soumettreReponseIntervalle,
  soumettreReponseRacines,
  soumettreReponseSigneA,
  soumettreReponseSimplification,
} from "./moteur/sessionInequation";
import type { EtatSessionInequation, PhaseInequation } from "./moteur/sessionInequation";
import { diagnostiquerSimplification } from "./moteur/verificationInequation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInequation, type VarianteInequationId } from "./generateurs/inequations";
import { EtapeRacines } from "./components/EtapeRacines";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeSigneA } from "./components/EtapeSigneA";
import { EtapeInequation } from "./components/EtapeInequation";
import { EtapeSimplificationInequation } from "./components/EtapeSimplificationInequation";
import { formatSolutionEnsemble } from "./ui/formatSolutionEnsemble";
import { formatInequationLatex } from "./ui/formatInequation";
import { Katex } from "./components/Katex";
import { calculerRecapitulatifInequation } from "./ui/recapitulatifInequation";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Détermine le signe de ce trinôme du second degré.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionInequation {
  return demarrerSessionInequation(REGLAGES_DEMO, genererExerciceInequation);
}

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence des phases du
 * générateur (type `PhaseInequation` ci-dessus, et les branches de `terminerEtape` ci-dessous). */
const ORDRE_PHASES: PhaseInequation[] = ["simplification", "racines", "signe_a", "intervalle"];

/** Même heuristique que `calculerRecapitulatifInequation` (`ui/recapitulatifInequation.ts`) et que
 * `terminerEtape` ci-dessous pour lire `scoreXxxExercice`/`xxxRevele` — jamais une valeur recalculée
 * séparément. `intervalle` (dernière phase) n'a pas de champ `scoreXxxExercice` propre : elle clôt
 * toujours immédiatement l'exercice, donc tant qu'elle n'est pas la phase courante elle est
 * forcément "a-venir". */
function calculerSegmentsProgression(etat: EtatSessionInequation): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score =
      phase === "simplification"
        ? etat.scoreSimplificationExercice
        : phase === "racines"
          ? etat.scoreRacinesExercice
          : phase === "signe_a"
            ? etat.scoreSigneAExercice
            : null;
    if (score === null) return "a-venir";
    const revele =
      phase === "simplification"
        ? etat.scoreSimplificationExercice === 0
        : phase === "racines"
          ? etat.racinesRevele
          : etat.signeARevele;
    return revele ? "revele" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionInequation;
  revele: boolean;
}

export function AppInequation() {
  const [etat, setEtat] = useState<EtatSessionInequation>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionInequation) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // "simplification" n'expose aucun champ `xxxRevele` dédié côté moteur (jamais de ligne de
      // réponse révélée pour cette étape dans l'ancien ResultatPanel) — équivalent exact :
      // score 0 ⟺ tentatives épuisées (voir etapeTentatives.ts, soumettreEtapeTentatives).
      const revele =
        etat.phase === "simplification"
          ? nouvelEtat.scoreSimplificationExercice === 0
          : etat.phase === "racines"
            ? nouvelEtat.racinesRevele
            : etat.phase === "signe_a"
              ? nouvelEtat.signeARevele
              : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.intervalleRevele;
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

  function forcerVariante(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionInequation(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteInequationId)));
  }

  const exercice = etat.exerciceCourant;
  const recapitulatif = calculerRecapitulatifInequation(etat);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec
          ? undefined
          : etat.phase === "simplification"
            ? undefined
            : etat.phase === "racines"
              ? <>Zéros attendus : {exercice.racines === undefined ? "∅" : exercice.racines.join(" ; ")}</>
              : etat.phase === "signe_a"
                ? <>Signe de a attendu : {exercice.enonce.a > 0 ? "a > 0" : "a < 0"}</>
                : <>Réponse attendue : S = {formatSolutionEnsemble(exercice.solution)}</>,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Tableau de signes d'un trinôme du second degré</h1>
        <p className="app-subtitle">Inéquations du second degré</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />

        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <div className="equation-box">
                <Katex expression={formatInequationLatex(exercice.enonce, exercice.symbole)} block />
              </div>
            }
          />
          {etat.phase === "simplification" ? (
            <EtapeSimplificationInequation
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              diagnostiquer={(v) => diagnostiquerSimplification(exercice, v)}
              aideActivee={etat.aideSimplificationUtilisee}
              onActiverAide={() => setEtat(activerAideSimplification(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSimplification(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "racines" ? (
            <EtapeRacines
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseRacines(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "signe_a" ? (
            <EtapeSigneA
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse) => terminerEtape(soumettreReponseSigneA(etat, reponse))}
              validation={validation}
            />
          ) : (
            <EtapeInequation
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideUtilisee}
              onActiverAide={() => setEtat(activerAideIntervalle(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIntervalle(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
