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
import type { EtatSessionConvergenceSuite, PhaseConvergenceSuite } from "./moteur5e/typesConvergenceSuites";
import { diagnostiquerClassifierQuelconque, diagnostiquerDiviserQuelconque } from "./moteur5e/verificationConvergenceSuites";
import { diagnostiquerNombre } from "./moteur5e/verificationSuiteArithmetique";
import type { ClassificationQuelconque, ExerciceConvergenceSuite } from "./core5e/convergenceSuites.types";
import { formatExpressionDiviseeLatex, libelleClassificationAttendue, texteAideNiveau2 } from "./ui5e/formatConvergenceSuites";
import { EtapeClassificationConvergence } from "./components5e/EtapeClassificationConvergence";
import { EtapeDiviserQuelconque } from "./components5e/EtapeDiviserQuelconque";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionConvergenceSuite {
  return demarrerSessionConvergenceSuite(REGLAGES_DEMO, genererExerciceConvergenceSuite);
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

  function terminerEtape(nouvelEtat: EtatSessionConvergenceSuite) {
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
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
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
                  onValider={(reponse) => terminerEtape(soumettreReponseClassificationArithmetique(etat, reponse.classification as never))}
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
                  onValider={(reponse) => terminerEtape(soumettreReponseClassificationGeometrique(etat, reponse.classification as never))}
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
                  onValider={(texte) => terminerEtape(soumettreReponseDiviserQuelconque(etat, texte))}
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
    </div>
  );
}
