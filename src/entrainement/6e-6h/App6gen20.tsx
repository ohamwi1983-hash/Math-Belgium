import { useState } from "react";
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
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

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
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, jamais dans le moteur : la saisie de l'élève n'a aucune autre utilité une fois l'écran
   * clos. Remis à vide à chaque nouvel exercice/variante forcée, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Seul l'écran "derivee" peut jamais être consulté : "selection" est le dernier écran de
   * l'exercice, `phase` n'avance jamais au-delà de lui (voir `typesGraphiqueDeriveeLogarithme.ts`),
   * donc `calculerRecapitulatifGraphiqueDeriveeLogarithme` ne le voit JAMAIS comme "clos" — y
   * pousser une entrée rejouerait toujours celle de "derivee" (bug déjà rencontré sur la référence
   * 4e, voir `AppAnalyseFonction.tsx`). */
  function ajouterHistorique(nouvelEtat: EtatSessionGraphiqueDeriveeLogarithme, votreReponse: string) {
    const recap = calculerRecapitulatifGraphiqueDeriveeLogarithme(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? <Katex expression={derniere.valeur} /> : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'écran "derivee" vient
   * RÉELLEMENT de se clore (jamais à chaque tentative ratée tant que `scoreDeriveePartiel` reste
   * `null` côté moteur — même garde que la transition d'écran elle-même) ; jamais pour la clôture de
   * "selection" (dernier écran, voir `ajouterHistorique`). */
  function terminerEtape(nouvelEtat: EtatSessionGraphiqueDeriveeLogarithme, votreReponse?: string) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined && etat.phase === "derivee") {
        ajouterHistorique(nouvelEtat, votreReponse);
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
    setEtat(demarrerSessionGraphiqueDeriveeLogarithme(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;
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
        <ProgressionPuces segments={calculerSegmentsProgressionGraphiqueDeriveeLogarithme(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifGraphiqueDeriveeLogarithme(etat)} />
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
            onValider={(texte) => terminerEtape(soumettreReponseDerivee(etat, texte), texte)}
            validation={validation}
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
