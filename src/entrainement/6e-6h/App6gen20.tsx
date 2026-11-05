import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiqueDeriveeLogarithme } from "./generateurs6e/graphiqueDeriveeLogarithme/index";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionGraphiqueDeriveeLogarithme, soumettreReponseDerivee, soumettreReponseSelection } from "./moteur6e/sessionGraphiqueDeriveeLogarithme";
import { tentativesMaxPhase } from "./moteur6e/typesGraphiqueDeriveeLogarithme";
import type { EtatSessionGraphiqueDeriveeLogarithme } from "./moteur6e/typesGraphiqueDeriveeLogarithme";
import { diagnostiquerEcranDerivee } from "./moteur6e/verificationGraphiqueDeriveeLogarithme";
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
import { calculerRecapitulatifGraphiqueDeriveeLogarithme, calculerSegmentsProgressionGraphiqueDeriveeLogarithme, lettreGraphiqueCorrect } from "./ui6e/recapitulatifGraphiqueDeriveeLogarithme";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };
const LETTRES = "ABCD";

function nouvelleSession(): EtatSessionGraphiqueDeriveeLogarithme {
  return demarrerSessionGraphiqueDeriveeLogarithme(REGLAGES_DEMO, genererExerciceGraphiqueDeriveeLogarithme);
}

/** Première session : l'exercice imprimé sur une feuille (`?code=XXXXXX`) s'il y en a un — MÊMES
 * fonctions de génération que l'adaptateur d'export (`generateurs6e/graphiqueDeriveeLogarithme/exportEvaluation.ts`). */
function sessionInitiale(): EtatSessionGraphiqueDeriveeLogarithme {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionGraphiqueDeriveeLogarithme(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_FAMILLES, genererExerciceGraphiqueDeriveeLogarithme, (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionGraphiqueDeriveeLogarithme;
  revele: boolean;
}

export function App6gen20() {
  const [etat, setEtat] = useState<EtatSessionGraphiqueDeriveeLogarithme>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables) — tenu ICI, jamais dans
   * le moteur. Remis à vide à chaque nouvel exercice/variante forcée, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice — fait partie de la `key` des écrans (`indexExercice`
   * reste à 0 avec `nombreExercices: 1`, la phase seule ne suffit donc pas). */
  const [numeroExercice, setNumeroExercice] = useState(0);

  const exercice = etat.exerciceCourant;
  const viewBox = calculerViewBoxGraphique(exercice);

  /** Graphique correct (lettre + tracé) — révélation et fiche de consultation. */
  const reponseSelection = (
    <div className="graphe-qcm-carte">
      <p className="graphe-qcm-label">Graphique {lettreGraphiqueCorrect(etat)}</p>
      <GrapheOptionDeriveeLogarithme exercice={exercice} index={exercice.indexCorrect} viewBox={viewBox} largeur={240} hauteur={190} />
    </div>
  );

  /** Seul l'écran "selection" (1er écran) peut être consulté : "derivee" est le dernier écran, la
   * phase n'avance jamais au-delà de lui. */
  function terminerEtape(nouvelEtat: EtatSessionGraphiqueDeriveeLogarithme, indexChoisi?: number) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (indexChoisi !== undefined && etat.phase === "selection") {
        const revele = nouvelEtat.derniereTransitionRevelee;
        setHistorique((h) => [
          ...h,
          { titre: "Graphique de f'", votreReponse: `Graphique ${LETTRES[indexChoisi] ?? indexChoisi + 1}`, correcte: !revele, reponseAttendue: revele ? reponseSelection : undefined },
        ]);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereTransitionRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setNumeroExercice((n) => n + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
    setFicheOuverteIndex(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionGraphiqueDeriveeLogarithme(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = tentativesMaxPhase(etat.phase, etat.reglages.tentativesMax);
  const cle = `${numeroExercice}-${etat.phase}`;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: etat.phase === "derivee" ? <Katex expression={formatDeriveeCorrecteLatex(exercice)} block /> : reponseSelection,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Graphique de la dérivée (fonctions logarithmes)</h1>
        <p className="app-subtitle">Chapitre 3 — Fonctions logarithmes</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionGraphiqueDeriveeLogarithme(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifGraphiqueDeriveeLogarithme(etat)} />
        {etat.phase === "selection" && (
          <EtapeSelectionGraphiqueDeriveeLogarithme
            key={cle}
            exercice={exercice}
            aideNiveau1={aideSelectionNiveau1()}
            aideNiveau2={aideSelectionNiveau2(exercice)}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(index) => terminerEtape(soumettreReponseSelection(etat, index), index)}
            validation={validation}
          />
        )}
        {etat.phase === "derivee" && (
          <EtapeChampGraphiqueDeriveeLogarithme
            key={cle}
            consigneEcran={consigneEcranDerivee()}
            fonctionLatex={formatFonctionLatex(exercice)}
            placeholder={placeholderDerivee()}
            aideNiveau1={aideDeriveeNiveau1(exercice)}
            aideNiveau2={aideDeriveeNiveau2(exercice)}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseDerivee(etat, texte))}
            diagnostiquer={(texte) => diagnostiquerEcranDerivee(exercice, texte)}
            validation={validation}
          />
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
