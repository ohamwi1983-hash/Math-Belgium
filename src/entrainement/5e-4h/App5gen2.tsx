import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { construireAvecProfondeur, genererExerciceDecompositionFonction } from "./generateurs5e/decompositionFonction";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const OPTIONS_PROFONDEUR = [
  { id: "2", label: "2 couches" },
  { id: "3", label: "3 couches" },
  { id: "4", label: "4 couches" },
];
import {
  activerAideSuivante,
  demarrerSessionDecompositionFonction,
  niveauAideMaxDecomposition,
  soumettreReponseDecomposition,
} from "./moteur5e/sessionDecompositionFonction";
import { diagnostiquerDecomposition } from "./moteur5e/verificationDecompositionFonction";
import type { EtatSessionDecompositionFonction, ResultatExerciceDecompositionFonction } from "./moteur5e/typesDecompositionFonction";
import { EtapeDecompositionFonction } from "./components5e/EtapeDecompositionFonction";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./components5e/LigneRecap";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDecompositionFonction {
  return demarrerSessionDecompositionFonction(REGLAGES_DEMO, genererExerciceDecompositionFonction);
}

interface Bilan {
  resultat: ResultatExerciceDecompositionFonction;
  /** Niveau d'aide effectivement utilisé pour résoudre cet exercice — capturé côté présentation
   * (`etat.niveauAide` juste avant la soumission qui clôture l'exercice) puisque
   * `ResultatExerciceDecompositionFonction` ne le porte pas lui-même (écran UNIQUE, un seul niveau
   * d'aide par exercice) ; consommé par `statutRecap`, même convention que 5gen1. */
  niveauAide: number;
}

export function App5gen2() {
  const [etat, setEtat] = useState<EtatSessionDecompositionFonction>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(niveauAide: number, nouvelEtat: EtatSessionDecompositionFonction) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], niveauAide });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const niveauAideMax = niveauAideMaxDecomposition(etat.exerciceCourant);

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Décomposer une fonction composée</h1>
      </header>
      <SelecteurVarianteDev
        options={OPTIONS_PROFONDEUR}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionDecompositionFonction(REGLAGES_DEMO, () => construireAvecProfondeur(Number(id) as 2 | 3 | 4)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              <EtapeDecompositionFonction
                exercice={etat.exerciceCourant}
                tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                tentativesMax={etat.reglages.tentativesMax}
                niveauAide={etat.niveauAide}
                niveauAideMax={niveauAideMax}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(lignes) => terminerEtape(etat.niveauAide, soumettreReponseDecomposition(etat, lignes))}
                diagnostiquer={(lignes) => diagnostiquerDecomposition(etat.exerciceCourant, lignes)}
              />
            </>
          )}
          {dernierBilan && (
            <div className="resultat-panel">
              <h2>Récapitulatif</h2>
              <LigneRecap label="Décomposition" statut={statutRecap(dernierBilan.resultat.revele, dernierBilan.niveauAide)}>
                <div className="equation-box">
                  <Katex expression={dernierBilan.resultat.exercice.fLatex} block />
                  <p>
                    {dernierBilan.resultat.exercice.couches.map((c, i) => (
                      <span key={i} style={{ display: "block" }}>
                        <Katex expression={`${["g", "h", "i", "j"][i] ?? `f_{${i}}`}(x) = ${c.propreLatex}`} />
                      </span>
                    ))}
                  </p>
                </div>
              </LigneRecap>
              <RecapTotalPoints ecrans={[{ revele: dernierBilan.resultat.revele, niveauAide: dernierBilan.niveauAide }]} />
              <button type="button" className="btn btn-primary" onClick={() => setDernierBilan(null)}>
                {etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              </button>
            </div>
          )}
          {etat.terminee && !dernierBilan && (
            <div className="card resume-session">
              <h2>Résumé de la session</h2>
              <p>Moyenne : {Math.round(etat.resultats.reduce((a, r) => a + r.score, 0) / etat.resultats.length)}/100</p>
              <button type="button" className="btn btn-primary" onClick={() => setEtat(nouvelleSession())}>
                Recommencer
              </button>
            </div>
          )}{" "}
        </div>
      </main>
    </div>
  );
}
