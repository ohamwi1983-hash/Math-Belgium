import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_SCENARIOS, construireAvecScenarioId, genererExerciceGeometrieCercle } from "./generateurs5e/geometrieCercle";
import type { ScenarioGeometrieCercle } from "./core5e/geometrieCercle.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionGeometrieCercle,
  niveauAideMaxGeometrieCercle,
  soumettreReponse,
} from "./moteur5e/sessionGeometrieCercle";
import type { EtatSessionGeometrieCercle, PhaseGeometrieCercle } from "./moteur5e/typesGeometrieCercle";
import { diagnostiquerChamp } from "./moteur5e/verificationGeometrieCercle";
import { formatValeurPhaseLatex, phasesDuScenario } from "./ui5e/formatGeometrieCercle";
import { EtapeChampGeometrieCercle } from "./components5e/EtapeChampGeometrieCercle";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { Katex } from "./components/Katex";
import { calculerRecapitulatifGeometrieCercle } from "./ui5e/recapitulatifGeometrieCercle";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

/**
 * Écrans dont la cible est un angle/une aire non remarquable (acos/atan/sin sans table de valeurs
 * exactes) — voir CLAUDE.md, section "Calculatrice scientifique", pour le détail par scénario.
 *
 * Les 4 phases de `secteurBalaye` ("conversionRad"/"aireGrandSecteur"/"airePetitSecteur"/
 * "aireBalayee") sont une EXCEPTION SCÉNARIO-SPÉCIFIQUE DÉLIBÉRÉE à cette règle générale (C.2) : la
 * calculatrice y est disponible sur LES 4 écrans de la variante, y compris ceux dont le calcul ne
 * requiert à proprement parler qu'une multiplication simple une fois θ(rad) connu — décision
 * documentée, pas un oubli, voir docs/historique-5e-transversal.md pour la règle générale dont ceci
 * déroge. Les phases de `segmentCirculaire`/`lentille` ci-dessous restent, elles, sous la règle
 * générale (uniquement les écrans à calcul trigonométrique non remarquable).
 */
const PHASES_CALCULATRICE = new Set<PhaseGeometrieCercle>([
  "conversionRad",
  "aireGrandSecteur",
  "airePetitSecteur",
  "aireBalayee",
  "angleTheta",
  "aireTriangle",
  "angle1",
  "triangle1",
  "angle2",
  "triangle2",
]);

function nouvelleSession(): EtatSessionGeometrieCercle {
  return demarrerSessionGeometrieCercle(REGLAGES_DEMO, genererExerciceGeometrieCercle);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionGeometrieCercle;
  revele: boolean;
}

/** Même ternaire que `calculerRecapitulatifGeometrieCercle` (`scoresPartiels[phase] === 0 ⟺
 * révélée`) — la séquence de phases dépend du scénario de l'exercice courant (`phasesDuScenario`),
 * jamais un seul ordre générique (voir `moteur5e/typesGeometrieCercle.ts`). */
function calculerSegmentsProgression(etat: EtatSessionGeometrieCercle): EtatPuceProgression[] {
  return phasesDuScenario(etat.exerciceCourant.scenario).map((phase: PhaseGeometrieCercle) => {
    if (phase === etat.phase) return "courante";
    const score = etat.scoresPartiels[phase];
    if (score === undefined) return "a-venir";
    return score === 0 ? "revele" : "correcte";
  });
}

export function App5gen12() {
  const [etat, setEtat] = useState<EtatSessionGeometrieCercle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionGeometrieCercle) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setEtat(demarrerSessionGeometrieCercle(REGLAGES_DEMO, () => construireAvecScenarioId(id as ScenarioGeometrieCercle)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <Katex expression={formatValeurPhaseLatex(exercice, etat.phase)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Problèmes de géométrie du cercle</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_SCENARIOS} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifGeometrieCercle(etat)} />
          <EtapeChampGeometrieCercle
            key={etat.phase}
            exercice={exercice}
            phase={etat.phase}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMaxGeometrieCercle(etat.phase)}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponse(etat, texte))}
            diagnostiquer={(texte) => diagnostiquerChamp(exercice, etat.phase, texte)}
            validation={validation}
          />
          {PHASES_CALCULATRICE.has(etat.phase) && <CalculatriceScientifique />}
        </div>
      </main>
    </div>
  );
}
