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
import type { EtatSessionConvergenceSuite, PhaseConvergenceSuite, ResultatExerciceConvergenceSuite } from "./moteur5e/typesConvergenceSuites";
import { diagnostiquerClassifierQuelconque, diagnostiquerDiviserQuelconque } from "./moteur5e/verificationConvergenceSuites";
import { diagnostiquerNombre } from "./moteur5e/verificationSuiteArithmetique";
import type { ClassificationQuelconque } from "./core5e/convergenceSuites.types";
import { EtapeClassificationConvergence } from "./components5e/EtapeClassificationConvergence";
import { EtapeDiviserQuelconque } from "./components5e/EtapeDiviserQuelconque";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { ResultatPanelConvergenceSuites } from "./components5e/ResultatPanelConvergenceSuites";
import { ResumeSessionConvergenceSuites } from "./components5e/ResumeSessionConvergenceSuites";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionConvergenceSuite {
  return demarrerSessionConvergenceSuite(REGLAGES_DEMO, genererExerciceConvergenceSuite);
}

interface Bilan {
  resultat: ResultatExerciceConvergenceSuite;
  aideParPhase: Partial<Record<PhaseConvergenceSuite, { niveauAide: number; revele: boolean }>>;
}

export function App5gen16() {
  const [etat, setEtat] = useState<EtatSessionConvergenceSuite>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseConvergenceSuite, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionConvergenceSuite) {
    const miseAJour = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereEtapeRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Convergence et divergence des suites</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_VARIANTES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionConvergenceSuite(REGLAGES_DEMO, () => construireAvecVarianteId(id as VarianteConvergenceSuite)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
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
                />
              )}
              {phase === "classifierQuelconque" && <CalculatriceScientifique />}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelConvergenceSuites
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionConvergenceSuites resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
