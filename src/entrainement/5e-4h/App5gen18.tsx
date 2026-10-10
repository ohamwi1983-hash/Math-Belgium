import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceComparaisonSuites } from "./generateurs5e/comparaisonSuites";
import type { FamilleComparaisonSuites } from "./core5e/comparaisonSuites.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  NIVEAU_AIDE_MAX_COMPARAISON_SUITES,
  activerAideSuivante,
  demarrerSessionComparaisonSuites,
  soumettreReponseConclusion,
  soumettreReponseTableau,
} from "./moteur5e/sessionComparaisonSuites";
import type { EtatSessionComparaisonSuites, PhaseComparaisonSuites, ResultatExerciceComparaisonSuites } from "./moteur5e/typesComparaisonSuites";
import {
  diagnostiquerCelluleTableau,
  diagnostiquerConclusion,
  diagnostiquerNSeuil,
  diagnostiquerTableau,
  diagnostiquerTraduction,
} from "./moteur5e/verificationComparaisonSuites";
import { EtapeConclusionComparaisonSuites } from "./components5e/EtapeConclusionComparaisonSuites";
import { EtapeTableauComparaisonSuites } from "./components5e/EtapeTableauComparaisonSuites";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { ResultatPanelComparaisonSuites } from "./components5e/ResultatPanelComparaisonSuites";
import { ResumeSessionComparaisonSuites } from "./components5e/ResumeSessionComparaisonSuites";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionComparaisonSuites {
  return demarrerSessionComparaisonSuites(REGLAGES_DEMO, genererExerciceComparaisonSuites);
}

interface Bilan {
  resultat: ResultatExerciceComparaisonSuites;
  aideParPhase: Partial<Record<PhaseComparaisonSuites, { niveauAide: number; revele: boolean }>>;
}

export function App5gen18() {
  const [etat, setEtat] = useState<EtatSessionComparaisonSuites>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseComparaisonSuites, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionComparaisonSuites) {
    // `revele` doit être lu sur `nouvelEtat` (POST-soumission) — `etat.etapeCourante.revelee`
    // (PRÉ-soumission) est structurellement toujours `false` ici, voir `derniereEtapeRevelee` dans
    // `typesComparaisonSuites.ts`.
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
        <h1 className="app-title">Comparaison numérique de deux suites</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionComparaisonSuites(REGLAGES_DEMO, () => construireAvecFamilleId(id as FamilleComparaisonSuites)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {etat.phase === "tableau" && (
                <EtapeTableauComparaisonSuites
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX_COMPARAISON_SUITES}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseTableau(etat, textes))}
                  diagnostiquer={(textes) => diagnostiquerTableau(textes, exercice)}
                  diagnostiquerCellule={(index, texte) => diagnostiquerCelluleTableau(texte, index, exercice)}
                />
              )}
              {etat.phase === "tableau" && <CalculatriceScientifique />}

              {etat.phase === "conclusion" && (
                <EtapeConclusionComparaisonSuites
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX_COMPARAISON_SUITES}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseConclusion(etat, reponse))}
                  diagnostiquer={(reponse) => diagnostiquerConclusion(reponse, exercice)}
                  diagnostiquerNSeuil={(texte) => diagnostiquerNSeuil(texte, exercice)}
                  diagnostiquerTraduction={(texte) => diagnostiquerTraduction(texte, exercice)}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelComparaisonSuites
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionComparaisonSuites resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
