import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFormeTrigonometrique } from "./generateurs6e/formeTrigonometrique";
import type { IdVarianteFormeTrigonometrique } from "./generateurs6e/formeTrigonometrique";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionFormeTrigonometrique, soumettreReponseEcran } from "./moteur6e/sessionFormeTrigonometrique";
import type { EtatSessionFormeTrigonometrique, PhaseFormeTrigonometrique, ResultatExerciceFormeTrigonometrique } from "./moteur6e/typesFormeTrigonometrique";
import { diagnostiquerEcran } from "./moteur6e/verificationFormeTrigonometrique";
import { EtapeChampsFormeTrigonometrique } from "./components6e/EtapeChampsFormeTrigonometrique";
import { EtapeChoixCongruenceFormeTrigonometrique } from "./components6e/EtapeChoixCongruenceFormeTrigonometrique";
import { ResultatPanelFormeTrigonometrique } from "./components6e/ResultatPanelFormeTrigonometrique";
import { ResumeSessionFormeTrigonometrique } from "./components6e/ResumeSessionFormeTrigonometrique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatFormeTrigonometrique";

/**
 * `6gen37` — Forme trigonométrique, module, argument et opérations (chapitre 7, "Nombres
 * complexes", DEUXIÈME générateur de ce chapitre après `6gen34`). Même patron que `App6gen34.tsx` :
 * un dispatcher générique piloté par `ui6e/formatFormeTrigonometrique.ts`/
 * `moteur6e/verificationFormeTrigonometrique.ts`, PAS de JSX par famille/écran — SAUF `dEcran2`
 * (famille D, écran 2), seul écran de CHOIX (jamais de saisie libre) de ce générateur, rendu par
 * `EtapeChoixCongruenceFormeTrigonometrique` plutôt que le composant générique à champs texte.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionFormeTrigonometrique {
  return demarrerSessionFormeTrigonometrique(REGLAGES_DEMO, genererExerciceFormeTrigonometrique);
}

type AideParPhase = Partial<Record<PhaseFormeTrigonometrique, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceFormeTrigonometrique;
  aideParPhase: AideParPhase;
}


export function App6gen37() {
  const [etat, setEtat] = useState<EtatSessionFormeTrigonometrique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionFormeTrigonometrique) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen23/6gen28/6gen34 répliqué à
    // l'identique.
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
    setEtat(demarrerSessionFormeTrigonometrique(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteFormeTrigonometrique)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen34.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen37?: unknown }).__debug6gen37 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, enCoursDeSession ? niveauAideMaxEcran(exercice, phase) : 0),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  const estEcranChoixCongruence = exercice.famille === "D" && phase === "dEcran2";

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Forme trigonométrique, module, argument et opérations</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && estEcranChoixCongruence && (
          <EtapeChoixCongruenceFormeTrigonometrique
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(condition) => terminerEtape(soumettreReponseEcran(etat, [condition]))}
          />
        )}

        {enCoursDeSession && !estEcranChoixCongruence && (
          <EtapeChampsFormeTrigonometrique
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

        {dernierBilan && <ResultatPanelFormeTrigonometrique resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionFormeTrigonometrique resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
