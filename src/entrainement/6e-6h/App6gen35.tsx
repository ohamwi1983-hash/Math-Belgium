import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAffixesRacines } from "./generateurs6e/affixesRacines";
import type { IdVarianteAffixesRacines } from "./generateurs6e/affixesRacines";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionAffixesRacines, soumettreReponseEcran } from "./moteur6e/sessionAffixesRacines";
import type { EtatSessionAffixesRacines } from "./moteur6e/typesAffixesRacines";
import { diagnostiquerEcran } from "./moteur6e/verificationAffixesRacines";
import { Katex } from "./components/Katex";
import { EtapeChampsAffixesRacines } from "./components6e/EtapeChampsAffixesRacines";
import { EtapeChoixAffixesRacines } from "./components6e/EtapeChoixAffixesRacines";
import { EtapeRacinesAffixesRacines } from "./components6e/EtapeRacinesAffixesRacines";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { OPTIONS_RELATION_B, OPTIONS_SYSTEME_C, blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatAffixesRacines";
import { calculerRecapitulatifAffixesRacines, calculerSegmentsProgressionAffixesRacines } from "./ui6e/recapitulatifAffixesRacines";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

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

interface TransitionEnAttente {
  etatSuivant: EtatSessionAffixesRacines;
  revele: boolean;
}

export function App6gen35() {
  const [etat, setEtat] = useState<EtatSessionAffixesRacines>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionAffixesRacines) {
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
    setEtat(demarrerSessionAffixesRacines(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteAffixesRacines)));
  }

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
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, niveauAideMaxEcran(exercice, phase)),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const ecranCommun = {
    consigneGenerale: consigneGenerale(exercice),
    blocDonnees: blocDonnees(exercice),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: formatAideNiveau1(exercice, phase),
    aideNiveau2: formatAideNiveau2(exercice, phase),
    validation,
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
        <ProgressionPuces segments={calculerSegmentsProgressionAffixesRacines(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifAffixesRacines(etat)} />
        {rendreEcran()}
      </main>
    </div>
  );
}
