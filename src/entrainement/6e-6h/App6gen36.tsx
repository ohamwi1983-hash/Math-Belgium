import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationsComplexes } from "./generateurs6e/equationsComplexes";
import type { IdVarianteEquationsComplexes } from "./generateurs6e/equationsComplexes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionEquationsComplexes, soumettreReponseEcran } from "./moteur6e/sessionEquationsComplexes";
import type { EtatSessionEquationsComplexes, PhaseEquationsComplexes, ResultatExerciceEquationsComplexes } from "./moteur6e/typesEquationsComplexes";
import { diagnostiquerEcran } from "./moteur6e/verificationEquationsComplexes";
import { EtapeChampsEquationsComplexes } from "./components6e/EtapeChampsEquationsComplexes";
import { EtapeChoixEquationsComplexes } from "./components6e/EtapeChoixEquationsComplexes";
import { EtapeListeEquationsComplexes } from "./components6e/EtapeListeEquationsComplexes";
import { ResultatPanelEquationsComplexes } from "./components6e/ResultatPanelEquationsComplexes";
import { ResumeSessionEquationsComplexes } from "./components6e/ResumeSessionEquationsComplexes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { OPTIONS_EQUATION_B, OPTIONS_EQUATION_E, OPTIONS_SYSTEME_A, blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, nombreCibleEnsemble, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatEquationsComplexes";

/**
 * `6gen36` — Équations dans ℂ (chapitre 7, "Nombres complexes", TROISIÈME générateur de ce
 * chapitre, après `6gen34`/`6gen35`). Même patron dispatcher générique que `App6gen35.tsx`, avec 3
 * composants "Etape" possibles selon la NATURE de l'écran (pas seulement la famille) :
 * `EtapeChampsEquationsComplexes` (saisie libre à arité fixe), `EtapeChoixEquationsComplexes`
 * (QCM : aAvecEcran1, bEcran1, eEcran1), `EtapeListeEquationsComplexes` (add-as-needed, nombre de
 * valeurs VARIABLE selon l'écran — voir `nombreCibleEnsemble`).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEquationsComplexes {
  return demarrerSessionEquationsComplexes(REGLAGES_DEMO, genererExerciceEquationsComplexes);
}

type AideParPhase = Partial<Record<PhaseEquationsComplexes, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceEquationsComplexes;
  aideParPhase: AideParPhase;
}


export function App6gen36() {
  const [etat, setEtat] = useState<EtatSessionEquationsComplexes>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionEquationsComplexes) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen34/6gen35 répliqué à l'identique.
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
    setEtat(demarrerSessionEquationsComplexes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteEquationsComplexes)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen35.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen36?: unknown }).__debug6gen36 = { exercice, phase };
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
    if (phase === "aAvecEcran1" && exercice.famille === "A" && exercice.sousType === "avecBarre") {
      return <EtapeChoixEquationsComplexes key={phase} {...aideCommun} {...ecranCommun} options={OPTIONS_SYSTEME_A(exercice)} onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]))} />;
    }
    if (phase === "bEcran1" && exercice.famille === "B") {
      return <EtapeChoixEquationsComplexes key={phase} {...aideCommun} {...ecranCommun} options={OPTIONS_EQUATION_B(exercice)} onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]))} />;
    }
    if (phase === "eEcran1" && exercice.famille === "E") {
      return <EtapeChoixEquationsComplexes key={phase} {...aideCommun} {...ecranCommun} options={OPTIONS_EQUATION_E(exercice)} onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]))} />;
    }
    const nombreCible = nombreCibleEnsemble(exercice, phase);
    if (nombreCible > 0) {
      return <EtapeListeEquationsComplexes key={phase} {...aideCommun} {...ecranCommun} nombreCible={nombreCible} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />;
    }
    return <EtapeChampsEquationsComplexes key={phase} {...aideCommun} {...ecranCommun} champs={champsEcran(exercice, phase)} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Équations dans ℂ</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && rendreEcran()}

        {dernierBilan && <ResultatPanelEquationsComplexes resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionEquationsComplexes resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
