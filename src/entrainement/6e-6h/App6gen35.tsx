import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAffixesRacines } from "./generateurs6e/affixesRacines";
import type { IdVarianteAffixesRacines } from "./generateurs6e/affixesRacines";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionAffixesRacines, soumettreReponseEcran } from "./moteur6e/sessionAffixesRacines";
import type { EtatSessionAffixesRacines, PhaseAffixesRacines, ResultatExerciceAffixesRacines } from "./moteur6e/typesAffixesRacines";
import { diagnostiquerEcran } from "./moteur6e/verificationAffixesRacines";
import { EtapeChampsAffixesRacines } from "./components6e/EtapeChampsAffixesRacines";
import { EtapeChoixAffixesRacines } from "./components6e/EtapeChoixAffixesRacines";
import { EtapeRacinesAffixesRacines } from "./components6e/EtapeRacinesAffixesRacines";
import { ResultatPanelAffixesRacines } from "./components6e/ResultatPanelAffixesRacines";
import { ResumeSessionAffixesRacines } from "./components6e/ResumeSessionAffixesRacines";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { OPTIONS_RELATION_B, OPTIONS_SYSTEME_C, blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatAffixesRacines";

/**
 * `6gen35` — Nombres complexes : affixes et racines carrées (chapitre 7, "Nombres complexes",
 * SECOND générateur de ce chapitre, après `6gen34`). Même patron dispatcher générique que
 * `App6gen34.tsx`, avec 3 composants "Etape" possibles selon la NATURE de l'écran (pas seulement la
 * famille) : `EtapeChampsAffixesRacines` (saisie libre à arité fixe : aEcran1, bEcran2, cEcran2),
 * `EtapeChoixAffixesRacines` (QCM : bEcran1, cEcran1), `EtapeRacinesAffixesRacines` (add-as-needed,
 * 2 racines : cEcran3 uniquement).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionAffixesRacines {
  return demarrerSessionAffixesRacines(REGLAGES_DEMO, genererExerciceAffixesRacines);
}

type AideParPhase = Partial<Record<PhaseAffixesRacines, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceAffixesRacines;
  aideParPhase: AideParPhase;
}


export function App6gen35() {
  const [etat, setEtat] = useState<EtatSessionAffixesRacines>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionAffixesRacines) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen34 répliqué à l'identique.
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
    setEtat(demarrerSessionAffixesRacines(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteAffixesRacines)));
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
    (window as unknown as { __debug6gen35?: unknown }).__debug6gen35 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, enCoursDeSession ? niveauAideMaxEcran(exercice, phase) : 0),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  const ecranCommun = {
    consigneGenerale: consigneGenerale(exercice),
    blocDonnees: blocDonnees(exercice),
    etatActuel: etatActuel(exercice, phase),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: formatAideNiveau1(exercice, phase),
    aideNiveau2: formatAideNiveau2(exercice, phase),
  };

  function rendreEcran() {
    if (phase === "bEcran1") {
      return <EtapeChoixAffixesRacines key={phase} {...aideCommun} {...ecranCommun} options={OPTIONS_RELATION_B} onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]))} />;
    }
    if (phase === "cEcran1" && exercice.famille === "C") {
      return <EtapeChoixAffixesRacines key={phase} {...aideCommun} {...ecranCommun} options={OPTIONS_SYSTEME_C(exercice.a, exercice.b)} onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]))} />;
    }
    if (phase === "cEcran3") {
      return <EtapeRacinesAffixesRacines key={phase} {...aideCommun} {...ecranCommun} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />;
    }
    return <EtapeChampsAffixesRacines key={phase} {...aideCommun} {...ecranCommun} champs={champsEcran(exercice, phase)} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Nombres complexes : affixes et racines carrées</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && rendreEcran()}

        {dernierBilan && <ResultatPanelAffixesRacines resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionAffixesRacines resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
