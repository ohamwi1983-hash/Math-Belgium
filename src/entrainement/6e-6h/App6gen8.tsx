import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import {
  CATALOGUE_FAMILLES,
  construireAvecFamilleId,
  genererExerciceGraphiqueDeriveeExponentielle,
} from "./generateurs6e/graphiquesDeriveeExponentielles/index";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionGraphiqueDeriveeExponentielle,
  soumettreReponseDerivee,
  soumettreReponseSelection,
} from "./moteur6e/sessionGraphiquesDeriveeExponentielles";
import type { EtatSessionGraphiqueDeriveeExponentielle } from "./moteur6e/typesGraphiquesDeriveeExponentielles";
import { Katex } from "./components/Katex";
import { EtapeDeriveeGraphExpo } from "./components6e/EtapeDeriveeGraphExpo";
import { EtapeSelectionGraphiqueDeriveeExpo } from "./components6e/EtapeSelectionGraphiqueDeriveeExpo";
import { GrapheOptionDeriveeExpo } from "./components6e/GrapheOptionDeriveeExpo";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideDeriveeNiveau1,
  aideDeriveeNiveau2,
  aideSelectionNiveau1,
  aideSelectionNiveau2,
  calculerViewBoxGraphique,
  consigneEcranDerivee,
  etatActuel,
  formatDeriveeCorrecteLatex,
  formatFonctionLatex,
  placeholderDerivee,
  rappelDomaineDerivee,
} from "./ui6e/formatGraphiquesDeriveeExponentielles";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionGraphiqueDeriveeExponentielle {
  return demarrerSessionGraphiqueDeriveeExponentielle(REGLAGES_DEMO, genererExerciceGraphiqueDeriveeExponentielle);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionGraphiqueDeriveeExponentielle;
  revele: boolean;
}

export function App6gen8() {
  const [etat, setEtat] = useState<EtatSessionGraphiqueDeriveeExponentielle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionGraphiqueDeriveeExponentielle) {
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
    setEtat(
      demarrerSessionGraphiqueDeriveeExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  // Inclut `indexExercice` dans la clé — la phase seule peut rester identique entre 2 exercices
  // consécutifs (ex. familles A puis C, toutes deux à un seul écran "selection"), ce qui
  // empêcherait React de remonter le composant et laisserait la saisie/sélection de l'exercice
  // précédent persister visuellement (leçon déjà retenue à plusieurs reprises sur ce projet — voir
  // CLAUDE.md, "5gen6/5gen7").
  const cle = `${etat.indexExercice}-${etat.phase}`;

  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen8?: unknown }).__debug6gen8 = { exercice, phase: etat.phase };
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          etat.phase === "derivee" ? (
            formatDeriveeCorrecteLatex(exercice) && <Katex expression={formatDeriveeCorrecteLatex(exercice) as string} />
          ) : (
            <GrapheOptionDeriveeExpo exercice={exercice} index={exercice.indexCorrect} viewBox={calculerViewBoxGraphique(exercice)} largeur={150} hauteur={150} />
          ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Graphique de la dérivée (fonctions exponentielles)</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          {etat.phase === "derivee" && (
            <EtapeDeriveeGraphExpo
              key={cle}
              consigneEcran={consigneEcranDerivee()}
              fonctionLatex={formatFonctionLatex(exercice)}
              etatActuel={etatActuel(exercice, etat.phase)}
              rappelDomaine={rappelDomaineDerivee(exercice)}
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
            <EtapeSelectionGraphiqueDeriveeExpo
              key={cle}
              exercice={exercice}
              etatActuel={etatActuel(exercice, etat.phase)}
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
        </div>
      </main>
    </div>
  );
}
