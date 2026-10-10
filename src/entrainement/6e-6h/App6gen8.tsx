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
import type {
  EtatSessionGraphiqueDeriveeExponentielle,
  PhaseGraphiqueDeriveeExponentielle,
  ResultatExerciceGraphiqueDeriveeExponentielle,
} from "./moteur6e/typesGraphiquesDeriveeExponentielles";
import { EtapeDeriveeGraphExpo } from "./components6e/EtapeDeriveeGraphExpo";
import { EtapeSelectionGraphiqueDeriveeExpo } from "./components6e/EtapeSelectionGraphiqueDeriveeExpo";
import { ResultatPanelGraphiqueDeriveeExponentielle } from "./components6e/ResultatPanelGraphiqueDeriveeExponentielle";
import { ResumeSessionGraphiqueDeriveeExponentielle } from "./components6e/ResumeSessionGraphiqueDeriveeExponentielle";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideDeriveeNiveau1,
  aideDeriveeNiveau2,
  aideSelectionNiveau1,
  aideSelectionNiveau2,
  consigneEcranDerivee,
  etatActuel,
  formatFonctionLatex,
  placeholderDerivee,
  rappelDomaineDerivee,
} from "./ui6e/formatGraphiquesDeriveeExponentielles";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionGraphiqueDeriveeExponentielle {
  return demarrerSessionGraphiqueDeriveeExponentielle(REGLAGES_DEMO, genererExerciceGraphiqueDeriveeExponentielle);
}

type AideParPhase = Partial<Record<PhaseGraphiqueDeriveeExponentielle, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceGraphiqueDeriveeExponentielle;
  aideParPhase: AideParPhase;
}

export function App6gen8() {
  const [etat, setEtat] = useState<EtatSessionGraphiqueDeriveeExponentielle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionGraphiqueDeriveeExponentielle) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici — remis à zéro par `avancerPhase` DANS le même appel qui clôt l'écran, voir
    // `moteur6e/sessionGraphiquesDeriveeExponentielles.ts` et `docs/historique-6e.md`).
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
    setEtat(
      demarrerSessionGraphiqueDeriveeExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Graphique de la dérivée (fonctions exponentielles)</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
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
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelGraphiqueDeriveeExponentielle
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionGraphiqueDeriveeExponentielle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
