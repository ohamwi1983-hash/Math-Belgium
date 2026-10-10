import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceVolumesRevolution } from "./generateurs6e/volumesRevolution";
import type { IdVarianteVolumesRevolution } from "./generateurs6e/volumesRevolution";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionVolumesRevolution, soumettreReponseEcran } from "./moteur6e/sessionVolumesRevolution";
import type { EtatSessionVolumesRevolution, PhaseVolumesRevolution, ResultatExerciceVolumesRevolution } from "./moteur6e/typesVolumesRevolution";
import { diagnostiquerEcran } from "./moteur6e/verificationVolumesRevolution";
import { EtapeChampsCalculAires } from "./components6e/EtapeChampsCalculAires";
import { EtapeRacinesCalculAires } from "./components6e/EtapeRacinesCalculAires";
import { ResultatPanelVolumesRevolution } from "./components6e/ResultatPanelVolumesRevolution";
import { ResumeSessionVolumesRevolution } from "./components6e/ResumeSessionVolumesRevolution";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatVolumesRevolution";

/**
 * `6gen27` — Volumes de révolution (chapitre 4, "Intégrales et primitives"). Même patron que
 * `App6gen26.tsx` (6gen26) : un dispatcher générique piloté par `ui6e/formatVolumesRevolution.ts`/
 * `moteur6e/verificationVolumesRevolution.ts`, PAS de JSX par famille/écran — SAUF pour les 2
 * écrans "racines/intersections" (bEcran1/cEcran1), rendus par le composant add-as-needed
 * DÉJÀ EXISTANT `EtapeRacinesCalculAires` (6gen26, RÉUTILISÉ TEL QUEL — compatible structurellement
 * avec `ChampDef`/`AideAvecLatex` de CE générateur, TypeScript étant à typage structurel, jamais
 * réimplémenté ici) plutôt que le composant générique à champs fixes (`EtapeChampsCalculAires`,
 * également réutilisé tel quel), un ensemble de racines/intersections étant de taille variable par
 * nature (convention CLAUDE.md "add-as-needed") même si CE générateur en a toujours exactement 2.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionVolumesRevolution {
  return demarrerSessionVolumesRevolution(REGLAGES_DEMO, genererExerciceVolumesRevolution);
}

type AideParPhase = Partial<Record<PhaseVolumesRevolution, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceVolumesRevolution;
  aideParPhase: AideParPhase;
}


const ECRANS_RACINES: PhaseVolumesRevolution[] = ["bEcran1", "cEcran1"];

export function App6gen27() {
  const [etat, setEtat] = useState<EtatSessionVolumesRevolution>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionVolumesRevolution) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen26 répliqué à l'identique (voir
    // `moteur6e/sessionVolumesRevolution.ts`, fonction `soumettreReponseEcran`).
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
    setAideParPhase({});
    setEtat(demarrerSessionVolumesRevolution(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteVolumesRevolution)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen26.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen27?: unknown }).__debug6gen27 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, enCoursDeSession ? niveauAideMaxEcran(exercice, phase) : 0),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Volumes de révolution</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && ECRANS_RACINES.includes(phase) && (
          <EtapeRacinesCalculAires
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            placeholder="ex : 2"
            labelAjout="+ Ajouter une valeur"
            nombreInitial={2}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {enCoursDeSession && !ECRANS_RACINES.includes(phase) && (
          <EtapeChampsCalculAires
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champsEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {dernierBilan && <ResultatPanelVolumesRevolution resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionVolumesRevolution resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
