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
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

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

/** Même source que `calculerRecapitulatifGeometrieCercle` (`revelesPartiels[phase]`) — la
 * séquence de phases dépend du scénario de l'exercice courant (`phasesDuScenario`), jamais un
 * seul ordre générique (voir `moteur5e/typesGeometrieCercle.ts`). */
function calculerSegmentsProgression(
  etat: EtatSessionGeometrieCercle,
  aideUtiliseeParPhase: Partial<Record<PhaseGeometrieCercle, boolean>>,
): EtatPuceProgression[] {
  return phasesDuScenario(etat.exerciceCourant.scenario).map((phase: PhaseGeometrieCercle) => {
    if (phase === etat.phase) return "courante";
    const score = etat.scoresPartiels[phase];
    if (score === undefined) return "a-venir";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideUtiliseeParPhase[phase] ? "aide" : "correcte";
  });
}

export function App5gen12() {
  const [etat, setEtat] = useState<EtatSessionGeometrieCercle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionGeometrieCercle`, jamais dans le moteur. Remis à vide à chaque
   * nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Capture locale de `etat.niveauAide > 0` pour chaque phase CLOSE — le moteur remet
   * `niveauAide` à 0 à chaque transition de phase (même mécanique que 5gen10/5gen11). */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseGeometrieCercle, boolean>>>({});

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (même garde
   * qu'`AppAnalyseFonction.tsx`). Réutilise `calculerRecapitulatifGeometrieCercle` pour la réponse
   * ATTENDUE. */
  function terminerEtape(nouvelEtat: EtatSessionGeometrieCercle, votreReponse?: string) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereEtapeRevelee;
      setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: etat.niveauAide > 0 }));
      if (votreReponse !== undefined) {
        const recap = calculerRecapitulatifGeometrieCercle(nouvelEtat);
        const derniere = recap[recap.length - 1];
        if (derniere) {
          setHistorique((h) => [
            ...h,
            {
              titre: derniere.libelle,
              votreReponse,
              correcte: !derniere.revele,
              reponseAttendue: derniere.revele ? (derniere.estLatex ? <Katex expression={derniere.valeur} /> : derniere.valeur) : undefined,
            },
          ]);
        }
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideUtiliseeParPhase({});
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParPhase({});
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
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
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
            onValider={(texte) => terminerEtape(soumettreReponse(etat, texte), texte)}
            diagnostiquer={(texte) => diagnostiquerChamp(exercice, etat.phase, texte)}
            validation={validation}
          />
          {PHASES_CALCULATRICE.has(etat.phase) && <CalculatriceScientifique />}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
