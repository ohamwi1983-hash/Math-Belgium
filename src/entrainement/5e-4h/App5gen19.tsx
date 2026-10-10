import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { construireAvecRegime, genererExerciceSuiteRecurrenteAffine } from "./generateurs5e/suiteRecurrenteAffine";
import type { RegimeSuiteRecurrenteAffine } from "./core5e/suiteRecurrenteAffine.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const OPTIONS_REGIME = [
  { id: "convergent", label: "Convergente (|a| < 1)" },
  { id: "divergent", label: "Divergente (|a| ≥ 1)" },
];
import {
  niveauAideMaxSuiteRecurrenteAffine,
  activerAideSuivante,
  demarrerSessionSuiteRecurrenteAffine,
  soumettreReponsePoserRecurrence,
  soumettreReponseRegimePermanent,
  soumettreReponseTermesSuccessifs,
} from "./moteur5e/sessionSuiteRecurrenteAffine";
import type {
  EtatSessionSuiteRecurrenteAffine,
  PhaseSuiteRecurrenteAffine,
  ResultatExerciceSuiteRecurrenteAffine,
} from "./moteur5e/typesSuiteRecurrenteAffine";
import {
  diagnostiquerPoserRecurrence,
  diagnostiquerRegimePermanent,
  diagnostiquerTermesSuccessifs,
} from "./moteur5e/verificationSuiteRecurrenteAffine";
import { EtapePoserRecurrence } from "./components5e/EtapePoserRecurrence";
import { EtapeRegimePermanent } from "./components5e/EtapeRegimePermanent";
import { EtapeTermesSuccessifs } from "./components5e/EtapeTermesSuccessifs";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { ResultatPanelSuiteRecurrenteAffine } from "./components5e/ResultatPanelSuiteRecurrenteAffine";
import { ResumeSessionSuiteRecurrenteAffine } from "./components5e/ResumeSessionSuiteRecurrenteAffine";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionSuiteRecurrenteAffine {
  return demarrerSessionSuiteRecurrenteAffine(REGLAGES_DEMO, genererExerciceSuiteRecurrenteAffine);
}

interface Bilan {
  resultat: ResultatExerciceSuiteRecurrenteAffine;
  aideParPhase: Partial<Record<PhaseSuiteRecurrenteAffine, { niveauAide: number; revele: boolean }>>;
}

export function App5gen19() {
  const [etat, setEtat] = useState<EtatSessionSuiteRecurrenteAffine>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseSuiteRecurrenteAffine, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionSuiteRecurrenteAffine) {
    // A.1 : `revele` doit être lu sur `nouvelEtat` (POST-soumission) — `etat.etapeCourante.revelee`
    // (PRÉ-soumission) est structurellement toujours `false` ici, voir `derniereEtapeRevelee` dans
    // `typesSuiteRecurrenteAffine.ts`.
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Suite récurrente affine et régime permanent</h1>
      </header>
      <SelecteurVarianteDev
        options={OPTIONS_REGIME}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionSuiteRecurrenteAffine(REGLAGES_DEMO, () => construireAvecRegime(id as RegimeSuiteRecurrenteAffine)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {etat.phase === "poserRecurrence" && (
                <EtapePoserRecurrence
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteRecurrenteAffine(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponsePoserRecurrence(etat, texte))}
                  diagnostiquer={(texte) => diagnostiquerPoserRecurrence(texte, exercice)}
                />
              )}

              {etat.phase === "regimePermanent" && (
                <EtapeRegimePermanent
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteRecurrenteAffine(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseRegimePermanent(etat, reponse))}
                  diagnostiquer={(reponse) => diagnostiquerRegimePermanent(reponse, exercice)}
                />
              )}
              {etat.phase === "regimePermanent" && <CalculatriceScientifique />}

              {etat.phase === "termesSuccessifs" && (
                <EtapeTermesSuccessifs
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteRecurrenteAffine(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseTermesSuccessifs(etat, textes))}
                  diagnostiquer={(textes) => diagnostiquerTermesSuccessifs(textes, exercice)}
                />
              )}
              {etat.phase === "termesSuccessifs" && <CalculatriceScientifique />}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelSuiteRecurrenteAffine
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionSuiteRecurrenteAffine resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
