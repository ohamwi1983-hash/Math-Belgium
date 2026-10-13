import { useRef, useState } from "react";
import type { OrientationParabole } from "./core/equationParabole.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationParabole } from "./generateurs/equationParabole";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionEquationParabole, soumettreReponseEquation, soumettreReponseSommetFoyer } from "./moteur/sessionEquationParabole";
import type { EtatSessionEquationParabole, PhaseEquationParabole } from "./moteur/typesEquationParabole";
import { EtapeEquationEquationParabole } from "./components/EtapeEquationEquationParabole";
import { EtapeSommetFoyerEquationParabole } from "./components/EtapeSommetFoyerEquationParabole";
import { Katex } from "./components/Katex";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifEquationParabole } from "./ui/recapitulatifEquationParabole";
import { formatEquationAttendueLatex, formatFoyerLatex, formatSommetLatex } from "./ui/formatEquationParabole";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationParabole {
  return demarrerSessionEquationParabole(REGLAGES_DEMO, genererExerciceEquationParabole);
}

const LIBELLE_PHASE: Record<PhaseEquationParabole, string> = {
  sommetFoyer: "Sommet et foyer",
  equation: "Équation de la parabole",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationParabole;
  revele: boolean;
}

export function AppEquationParabole() {
  const [etat, setEtat] = useState<EtatSessionEquationParabole>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionEquationParabole) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "sommetFoyer" ? nouvelEtat.sommetFoyerRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.equationRevele;
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
    setEtat(demarrerSessionEquationParabole(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as OrientationParabole)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const recapitulatif = calculerRecapitulatifEquationParabole(etat);

  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          etat.phase === "sommetFoyer" ? (
            <span className="equation-box-termes">
              Sommet attendu : <Katex expression={formatSommetLatex(exercice.sommet)} /> — Foyer attendu :{" "}
              <Katex expression={formatFoyerLatex(exercice.foyer)} />
            </span>
          ) : (
            <span className="equation-box-termes">
              <Katex expression={formatEquationAttendueLatex(exercice)} />
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
        <h1 className="app-title">Équation d'une parabole depuis un graphe</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={recapitulatif} />
          {phase === "sommetFoyer" ? (
            <EtapeSommetFoyerEquationParabole
              key={phase}
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSommetFoyer}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSommetFoyer(etat, reponse))}
              validation={validation}
            />
          ) : (
            <EtapeEquationEquationParabole
              key={phase}
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideEquation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseEquation(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
