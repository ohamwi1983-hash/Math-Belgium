import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIndependanceBayes } from "./generateurs6e/independanceBayes";
import type { IdVarianteIndependanceBayes } from "./generateurs6e/independanceBayes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionIndependanceBayes, soumettreReponseEcran } from "./moteur6e/sessionIndependanceBayes";
import type { EtatSessionIndependanceBayes, PhaseIndependanceBayes, ResultatExerciceIndependanceBayes } from "./moteur6e/typesIndependanceBayes";
import { diagnostiquerEcran } from "./moteur6e/verificationIndependanceBayes";
import { EtapeChampsIndependanceBayes } from "./components6e/EtapeChampsIndependanceBayes";
import { ResultatPanelIndependanceBayes } from "./components6e/ResultatPanelIndependanceBayes";
import { ResumeSessionIndependanceBayes } from "./components6e/ResumeSessionIndependanceBayes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2, blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, tableauDonnees, tableauEtatActuel } from "./ui6e/formatIndependanceBayes";

/**
 * `6gen32` — Indépendance, conditionnement et Bayes (chapitre 8, "Probabilités", 3e générateur du
 * chapitre après `6gen30`). Même patron que `App6gen30.tsx` : aucun bloc JSX par famille/écran, un
 * seul dispatch piloté par `ui6e/formatIndependanceBayes.ts` et `moteur6e/
 * verificationIndependanceBayes.ts` (`diagnostiquerEcran`). AUCUN écran à choix dans ce générateur
 * (voir en-tête de `ui6e/formatIndependanceBayes.ts`) — un seul composant écran suffit
 * (`EtapeChampsIndependanceBayes`), jamais de dispatch choix/champs comme `App6gen30.tsx`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionIndependanceBayes {
  return demarrerSessionIndependanceBayes(REGLAGES_DEMO, genererExerciceIndependanceBayes);
}

type AideParPhase = Partial<Record<PhaseIndependanceBayes, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceIndependanceBayes;
  aideParPhase: AideParPhase;
}


export function App6gen32() {
  const [etat, setEtat] = useState<EtatSessionIndependanceBayes>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionIndependanceBayes) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron `6gen18`/`6gen21`/`6gen23`/`6gen30`
    // répliqué à l'identique (voir `moteur6e/sessionIndependanceBayes.ts`, `soumettreReponseEcran`).
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
    setEtat(demarrerSessionIndependanceBayes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteIndependanceBayes)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1, même garde que
  // `SelecteurVarianteDev`) : expose l'exercice tiré tel quel sur `window` — permet à la
  // vérification Playwright (build de production) de reconstruire la réponse EXACTE attendue à
  // chaque écran depuis les vrais paramètres tirés, plutôt que de re-parser le rendu affiché.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen32?: unknown }).__debug6gen32 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  const propsCommun = {
    consigneGenerale: consigneGenerale(exercice),
    blocDonnees: blocDonnees(exercice),
    tableauDonnees: tableauDonnees(exercice),
    etatActuel: etatActuel(exercice, phase),
    tableauEtatActuel: tableauEtatActuel(exercice, phase),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: formatAideNiveau1(exercice, phase),
    aideNiveau2: formatAideNiveau2(exercice, phase),
    ...aideCommun,
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Indépendance, conditionnement et Bayes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && <EtapeChampsIndependanceBayes key={phase} {...propsCommun} champs={champsEcran(exercice, phase)} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />}

        {dernierBilan && <ResultatPanelIndependanceBayes resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionIndependanceBayes resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
