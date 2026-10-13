import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiqueDeriveeLogarithme } from "./generateurs6e/graphiqueDeriveeLogarithme/index";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionGraphiqueDeriveeLogarithme, soumettreReponseDerivee, soumettreReponseSelection } from "./moteur6e/sessionGraphiqueDeriveeLogarithme";
import type { EtatSessionGraphiqueDeriveeLogarithme } from "./moteur6e/typesGraphiqueDeriveeLogarithme";
import { Katex } from "./components/Katex";
import { EtapeChampGraphiqueDeriveeLogarithme } from "./components6e/EtapeChampGraphiqueDeriveeLogarithme";
import { EtapeSelectionGraphiqueDeriveeLogarithme } from "./components6e/EtapeSelectionGraphiqueDeriveeLogarithme";
import { GrapheOptionDeriveeLogarithme } from "./components6e/GrapheOptionDeriveeLogarithme";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideDeriveeNiveau1,
  aideDeriveeNiveau2,
  aideSelectionNiveau1,
  aideSelectionNiveau2,
  calculerViewBoxGraphique,
  consigneEcranDerivee,
  formatDeriveeCorrecteLatex,
  formatFonctionLatex,
  placeholderDerivee,
} from "./ui6e/formatGraphiqueDeriveeLogarithme";
import { calculerRecapitulatifGraphiqueDeriveeLogarithme, calculerSegmentsProgressionGraphiqueDeriveeLogarithme } from "./ui6e/recapitulatifGraphiqueDeriveeLogarithme";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionGraphiqueDeriveeLogarithme {
  return demarrerSessionGraphiqueDeriveeLogarithme(REGLAGES_DEMO, genererExerciceGraphiqueDeriveeLogarithme);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionGraphiqueDeriveeLogarithme;
  revele: boolean;
}

export function App6gen20() {
  const [etat, setEtat] = useState<EtatSessionGraphiqueDeriveeLogarithme>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionGraphiqueDeriveeLogarithme) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereTransitionRevelee });
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
    setEtat(demarrerSessionGraphiqueDeriveeLogarithme(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const premierePhaseRef = useRef(etat.phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = etat.phase;
  }
  const estPremierEcran = etat.phase === premierePhaseRef.current;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  // Inclut `indexExercice` dans la clé — la phase seule peut rester identique entre 2 exercices
  // consécutifs, ce qui empêcherait React de remonter le composant et laisserait la saisie/
  // sélection de l'exercice précédent persister visuellement (leçon déjà retenue à plusieurs
  // reprises sur ce chantier — voir CLAUDE.md).
  const cle = `${etat.indexExercice}-${etat.phase}`;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          etat.phase === "derivee" ? (
            <Katex expression={formatDeriveeCorrecteLatex(exercice)} />
          ) : (
            <GrapheOptionDeriveeLogarithme exercice={exercice} index={exercice.indexCorrect} viewBox={calculerViewBoxGraphique(exercice)} largeur={150} hauteur={150} />
          ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Graphique de la dérivée (fonctions logarithmes)</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionGraphiqueDeriveeLogarithme(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifGraphiqueDeriveeLogarithme(etat)} />
        {etat.phase === "derivee" && (
          <EtapeChampGraphiqueDeriveeLogarithme
            key={cle}
            estPremierEcran={estPremierEcran}
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
            validation={validation}
          />
        )}
        {etat.phase === "selection" && (
          <EtapeSelectionGraphiqueDeriveeLogarithme
            key={cle}
            estPremierEcran={estPremierEcran}
            exercice={exercice}
            aideNiveau1={aideSelectionNiveau1(exercice)}
            aideNiveau2={aideSelectionNiveau2(exercice)}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(index) => terminerEtape(soumettreReponseSelection(etat, index))}
            validation={validation}
          />
        )}
      </main>
    </div>
  );
}
