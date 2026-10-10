import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiqueDeriveeLogarithme } from "./generateurs6e/graphiqueDeriveeLogarithme/index";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionGraphiqueDeriveeLogarithme, soumettreReponseDerivee, soumettreReponseSelection } from "./moteur6e/sessionGraphiqueDeriveeLogarithme";
import type { EtatSessionGraphiqueDeriveeLogarithme, PhaseGraphiqueDeriveeLogarithme, ResultatExerciceGraphiqueDeriveeLogarithme } from "./moteur6e/typesGraphiqueDeriveeLogarithme";
import { EtapeChampGraphiqueDeriveeLogarithme } from "./components6e/EtapeChampGraphiqueDeriveeLogarithme";
import { EtapeSelectionGraphiqueDeriveeLogarithme } from "./components6e/EtapeSelectionGraphiqueDeriveeLogarithme";
import { ResultatPanelGraphiqueDeriveeLogarithme } from "./components6e/ResultatPanelGraphiqueDeriveeLogarithme";
import { ResumeSessionGraphiqueDeriveeLogarithme } from "./components6e/ResumeSessionGraphiqueDeriveeLogarithme";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideDeriveeNiveau1,
  aideDeriveeNiveau2,
  aideSelectionNiveau1,
  aideSelectionNiveau2,
  consigneEcranDerivee,
  formatFonctionLatex,
  placeholderDerivee,
} from "./ui6e/formatGraphiqueDeriveeLogarithme";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionGraphiqueDeriveeLogarithme {
  return demarrerSessionGraphiqueDeriveeLogarithme(REGLAGES_DEMO, genererExerciceGraphiqueDeriveeLogarithme);
}

type AideParPhase = Partial<Record<PhaseGraphiqueDeriveeLogarithme, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceGraphiqueDeriveeLogarithme;
  aideParPhase: AideParPhase;
}


export function App6gen20() {
  const [etat, setEtat] = useState<EtatSessionGraphiqueDeriveeLogarithme>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionGraphiqueDeriveeLogarithme) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici — remis à zéro par `avancerPhase` DANS le même appel qui clôt l'écran, voir
    // `moteur6e/sessionGraphiqueDeriveeLogarithme.ts` et `docs/historique-6e.md`).
    const miseAJour: AideParPhase = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereTransitionRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionGraphiqueDeriveeLogarithme(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  // Inclut `indexExercice` dans la clé — la phase seule peut rester identique entre 2 exercices
  // consécutifs, ce qui empêcherait React de remonter le composant et laisserait la saisie/
  // sélection de l'exercice précédent persister visuellement (leçon déjà retenue à plusieurs
  // reprises sur ce chantier — voir CLAUDE.md).
  const cle = `${etat.indexExercice}-${etat.phase}`;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Graphique de la dérivée (fonctions logarithmes)</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <>
            {etat.phase === "derivee" && (
              <EtapeChampGraphiqueDeriveeLogarithme
                key={cle}
                consigneEcran={consigneEcranDerivee()}
                fonctionLatex={formatFonctionLatex(exercice)}
                placeholder={placeholderDerivee(exercice)}
                aideNiveau1={aideDeriveeNiveau1(exercice)}
                aideNiveau2={aideDeriveeNiveau2(exercice)}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={etat.niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseDerivee(etat, texte))}
              />
            )}
            {etat.phase === "selection" && (
              <EtapeSelectionGraphiqueDeriveeLogarithme
                key={cle}
                exercice={exercice}
                aideNiveau1={aideSelectionNiveau1(exercice)}
                aideNiveau2={aideSelectionNiveau2(exercice)}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={etat.niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(index) => terminerEtape(soumettreReponseSelection(etat, index))}
              />
            )}
          </>
        )}
        {dernierBilan && (
          <ResultatPanelGraphiqueDeriveeLogarithme resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />
        )}
        {etat.terminee && !dernierBilan && <ResumeSessionGraphiqueDeriveeLogarithme resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
