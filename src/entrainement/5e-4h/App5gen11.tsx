import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { construireAvecFonction, genererExerciceExtremumsSinusoide } from "./generateurs5e/extremumsSinusoide";
import type { FonctionExtremum } from "./core5e/extremumsSinusoide.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const OPTIONS_FONCTION = [
  { id: "sin", label: "sin" },
  { id: "cos", label: "cos" },
];
import {
  activerAideSuivante,
  demarrerSessionExtremumsSinusoide,
  niveauAideMaxExtremums,
  soumettreReponseIsolerX,
  soumettreReponsePoserEquation,
  soumettreReponseSolutions,
} from "./moteur5e/sessionExtremumsSinusoide";
import {
  diagnostiquerIsolerXExtremum,
  diagnostiquerPoserEquationExtremum,
  diagnostiquerSolutionsExtremum,
} from "./moteur5e/verificationExtremumsSinusoide";
import type { EtatSessionExtremumsSinusoide, ResultatExerciceExtremumsSinusoide } from "./moteur5e/typesExtremumsSinusoide";
import { EtapeParametreExtremum } from "./components5e/EtapeParametreExtremum";
import { EtapeSolutionsExtremum } from "./components5e/EtapeSolutionsExtremum";
import { ResultatPanelExtremumsSinusoide } from "./components5e/ResultatPanelExtremumsSinusoide";
import { ResumeSessionExtremumsSinusoide } from "./components5e/ResumeSessionExtremumsSinusoide";
import type { PhaseExtremumsSinusoide } from "./moteur5e/typesExtremumsSinusoide";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionExtremumsSinusoide {
  return demarrerSessionExtremumsSinusoide(REGLAGES_DEMO, genererExerciceExtremumsSinusoide);
}

type AideParPhase = Partial<Record<PhaseExtremumsSinusoide, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceExtremumsSinusoide;
  aideParPhase: AideParPhase;
}

export function App5gen11() {
  const [etat, setEtat] = useState<EtatSessionExtremumsSinusoide>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionExtremumsSinusoide) {
    // A.1 : `revele` doit être lu sur `nouvelEtat` (POST-soumission) — `etat.etapeCourante.revelee`
    // (PRÉ-soumission) est structurellement toujours `false` ici, voir `derniereEtapeRevelee` dans
    // `typesExtremumsSinusoide.ts`.
    const miseAJour: AideParPhase = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereEtapeRevelee } };
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Extremums d'une fonction sinusoïdale</h1>
      </header>
      <SelecteurVarianteDev
        options={OPTIONS_FONCTION}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionExtremumsSinusoide(REGLAGES_DEMO, () => construireAvecFonction(id as FonctionExtremum)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {(etat.phase === "poserEquation" || etat.phase === "isolerX") && (
                <EtapeParametreExtremum
                  key={etat.phase}
                  exercice={exercice}
                  phase={etat.phase}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxExtremums(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) =>
                    terminerEtape(etat.phase === "poserEquation" ? soumettreReponsePoserEquation(etat, texte) : soumettreReponseIsolerX(etat, texte))
                  }
                  diagnostiquer={(texte) =>
                    etat.phase === "poserEquation"
                      ? diagnostiquerPoserEquationExtremum(exercice, texte)
                      : diagnostiquerIsolerXExtremum(exercice, texte)
                  }
                />
              )}
              {etat.phase === "solutions" && (
                <EtapeSolutionsExtremum
                  key={etat.phase}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxExtremums(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseSolutions(etat, textes))}
                  diagnostiquer={(textes) => diagnostiquerSolutionsExtremum(exercice, textes)}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelExtremumsSinusoide
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionExtremumsSinusoide resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
