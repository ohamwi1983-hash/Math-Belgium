import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConvergenceSuite } from "./generateurs5e/convergenceSuites";
import type { VarianteConvergenceSuite } from "./core5e/convergenceSuites.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  niveauAideMaxConvergenceSuite,
  activerAideSuivante,
  demarrerSessionConvergenceSuite,
  soumettreReponseClassificationArithmetique,
  soumettreReponseClassificationGeometrique,
  soumettreReponseClassifierQuelconque,
  soumettreReponseDiviserQuelconque,
} from "./moteur5e/sessionConvergenceSuites";
import { ordreComplet } from "./moteur5e/typesConvergenceSuites";
import type { EtatSessionConvergenceSuite, PhaseConvergenceSuite } from "./moteur5e/typesConvergenceSuites";
import { diagnostiquerClassifierQuelconque, diagnostiquerDiviserQuelconque } from "./moteur5e/verificationConvergenceSuites";
import { diagnostiquerNombre } from "./moteur5e/verificationSuiteArithmetique";
import type { ClassificationQuelconque, ExerciceConvergenceSuite } from "./core5e/convergenceSuites.types";
import { formatExpressionDiviseeLatex, libelleClassificationAttendue, optionsClassification, texteAideNiveau2 } from "./ui5e/formatConvergenceSuites";
import { EtapeClassificationConvergence } from "./components5e/EtapeClassificationConvergence";
import { EtapeDiviserQuelconque } from "./components5e/EtapeDiviserQuelconque";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { calculerRecapitulatifConvergenceSuite } from "./ui5e/recapitulatifConvergenceSuites";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionConvergenceSuite {
  return demarrerSessionConvergenceSuite(REGLAGES_DEMO, genererExerciceConvergenceSuite);
}

/** Puces de progression — pas de `ORDRE_PHASES` statique : la séquence réelle dépend de
 * `exercice.variante` (1 écran pour "arithmetique"/"geometrique", 2 pour "quelconque"), toujours
 * recalculée via `ordreComplet(exercice)` (même principe que 5gen14/5gen15). Même heuristique
 * `score === 0 ⟺ révélée` que `calculerRecapitulatifConvergenceSuite`. */
function calculerSegmentsProgression(
  etat: EtatSessionConvergenceSuite,
  aideUtiliseeParPhase: Partial<Record<PhaseConvergenceSuite, boolean>>,
): EtatPuceProgression[] {
  return ordreComplet(etat.exerciceCourant).map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = etat.scoresPartiels[phase];
    if (score === undefined) return "a-venir";
    if (score === 0) return "revele";
    return aideUtiliseeParPhase[phase] ? "aide" : "correcte";
  });
}

/** Libellé lisible de la réponse choisie (`votreReponse`) — recherché dans le même catalogue
 * d'options que celui affiché à l'élève (`optionsClassification`), jamais retapé. */
function labelClassificationChoisie(exercice: ExerciceConvergenceSuite, phase: PhaseConvergenceSuite, classification: string, valeur?: string): string {
  const option = optionsClassification(exercice, phase).find((o) => o.id === classification);
  const label = option?.label ?? classification;
  return option?.requiertValeur && valeur !== undefined ? `${label} (${valeur})` : label;
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionConvergenceSuite;
  revele: boolean;
}

function reponseAttenduePourPhase(exercice: ExerciceConvergenceSuite, phase: PhaseConvergenceSuite) {
  if (phase === "diviserQuelconque" && exercice.variante === "quelconque") return <Katex expression={formatExpressionDiviseeLatex(exercice)} />;
  if (phase === "classifierQuelconque") {
    return (
      <>
        {libelleClassificationAttendue(exercice, "classifierQuelconque")}
        {exercice.variante === "quelconque" && exercice.classification === "limiteValeur" && (
          <>
            {" — "}
            <Katex expression={texteAideNiveau2(exercice, "classifierQuelconque")} />
          </>
        )}
      </>
    );
  }
  return libelleClassificationAttendue(exercice, phase);
}

export function App5gen16() {
  const [etat, setEtat] = useState<EtatSessionConvergenceSuite>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionConvergenceSuite`, jamais dans le moteur. Remis à vide à chaque
   * nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Capture locale de `etat.niveauAide > 0` pour chaque phase CLOSE — le moteur remet
   * `niveauAide` à 0 à chaque transition de phase (même mécanique que les autres générateurs de
   * ce chantier). */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseConvergenceSuite, boolean>>>({});

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (même garde
   * qu'`AppAnalyseFonction.tsx`). Réutilise `calculerRecapitulatifConvergenceSuite` pour la réponse
   * ATTENDUE. */
  function terminerEtape(nouvelEtat: EtatSessionConvergenceSuite, votreReponse?: string) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereEtapeRevelee;
      setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: etat.niveauAide > 0 }));
      if (votreReponse !== undefined) {
        const recap = calculerRecapitulatifConvergenceSuite(nouvelEtat);
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
    setEtat(demarrerSessionConvergenceSuite(REGLAGES_DEMO, () => construireAvecVarianteId(id as VarianteConvergenceSuite)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePourPhase(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Convergence et divergence des suites</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifConvergenceSuite(etat)} />
          <>
              {phase === "classificationArithmetique" && (
                <EtapeClassificationConvergence
                  key={cleEcran}
                  exercice={exercice}
                  phase="classificationArithmetique"
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxConvergenceSuite(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) =>
                    terminerEtape(
                      soumettreReponseClassificationArithmetique(etat, reponse.classification as never),
                      labelClassificationChoisie(exercice, "classificationArithmetique", reponse.classification),
                    )
                  }
                  validation={validation}
                />
              )}

              {phase === "classificationGeometrique" && (
                <EtapeClassificationConvergence
                  key={cleEcran}
                  exercice={exercice}
                  phase="classificationGeometrique"
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxConvergenceSuite(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) =>
                    terminerEtape(
                      soumettreReponseClassificationGeometrique(etat, reponse.classification as never),
                      labelClassificationChoisie(exercice, "classificationGeometrique", reponse.classification),
                    )
                  }
                  validation={validation}
                />
              )}

              {phase === "diviserQuelconque" && (
                <EtapeDiviserQuelconque
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxConvergenceSuite(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseDiviserQuelconque(etat, texte), texte)}
                  diagnostiquer={(texte) => (exercice.variante === "quelconque" ? diagnostiquerDiviserQuelconque(texte, exercice) : "parse_error")}
                  validation={validation}
                />
              )}

              {phase === "classifierQuelconque" && (
                <EtapeClassificationConvergence
                  key={cleEcran}
                  exercice={exercice}
                  phase="classifierQuelconque"
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxConvergenceSuite(exercice, etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) =>
                    terminerEtape(
                      soumettreReponseClassifierQuelconque(etat, { classification: reponse.classification as never, valeur: reponse.valeur }),
                      labelClassificationChoisie(exercice, "classifierQuelconque", reponse.classification, reponse.valeur),
                    )
                  }
                  diagnostiquer={(reponse) =>
                    exercice.variante === "quelconque"
                      ? diagnostiquerClassifierQuelconque(
                          { classification: reponse.classification as ClassificationQuelconque, valeur: reponse.valeur },
                          exercice,
                        )
                      : "parse_error"
                  }
                  diagnostiquerValeur={(valeur) =>
                    exercice.variante === "quelconque" && exercice.classification === "limiteValeur"
                      ? diagnostiquerNombre(valeur, exercice.limiteValeur as number)
                      : "parse_error"
                  }
                  validation={validation}
                />
              )}
              {phase === "classifierQuelconque" && <CalculatriceScientifique />}
            </>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
