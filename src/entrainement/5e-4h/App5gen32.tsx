import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOptimisation } from "./generateurs5e/optimisationGeometrique/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionOptimisation,
  niveauAideMaxOptimisation,
  soumettreReponseEcran,
} from "./moteur5e/sessionOptimisationGeometrique";
import type { EtatSessionOptimisation } from "./moteur5e/typesOptimisationGeometrique";
import { EtapeGeneriqueOptimisation } from "./components5e/EtapeGeneriqueOptimisation";
import { ResultatPanelOptimisation } from "./components5e/ResultatPanelOptimisation";
import { ResumeSessionOptimisation } from "./components5e/ResumeSessionOptimisation";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionOptimisation {
  return demarrerSessionOptimisation(REGLAGES_DEMO, genererExerciceOptimisation);
}

interface Bilan {
  resultat: EtatSessionOptimisation["resultats"][number];
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
}

export function App5gen32() {
  const [etat, setEtat] = useState<EtatSessionOptimisation>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<string, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionOptimisation) {
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
  const niveauAideMax = niveauAideMaxOptimisation();

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Optimisation géométrique</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_VARIANTES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setAideParPhase({});
          setEtat(demarrerSessionOptimisation(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <EtapeGeneriqueOptimisation
              key={cleEcran}
              exercice={exercice}
              phase={etat.phase}
              dernieresReponsesParEcran={etat.dernieresReponsesParEcran}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponses) => terminerEtape(soumettreReponseEcran(etat, reponses))}
            />
          )}
          {dernierBilan && (
            <ResultatPanelOptimisation
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionOptimisation resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
