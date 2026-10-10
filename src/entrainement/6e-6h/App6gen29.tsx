import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntegralesProblemes } from "./generateurs6e/integralesProblemes";
import type { IdVarianteIntegralesProblemes } from "./generateurs6e/integralesProblemes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionIntegralesProblemes, soumettreReponseEcran } from "./moteur6e/sessionIntegralesProblemes";
import type { EtatSessionIntegralesProblemes, PhaseIntegralesProblemes, ResultatExerciceIntegralesProblemes } from "./moteur6e/typesIntegralesProblemes";
import { diagnostiquerEcran } from "./moteur6e/verificationIntegralesProblemes";
import { EtapeChampsCalculAires } from "./components6e/EtapeChampsCalculAires";
import { ResultatPanelIntegralesProblemes } from "./components6e/ResultatPanelIntegralesProblemes";
import { ResumeSessionIntegralesProblemes } from "./components6e/ResumeSessionIntegralesProblemes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatIntegralesProblemes";

/**
 * `6gen29` — Intégrales et primitives : problèmes (chapitre 4, générateur DE CLÔTURE). Même patron
 * que `App6gen27.tsx` (6gen27) : un dispatcher générique piloté par
 * `ui6e/formatIntegralesProblemes.ts`/`moteur6e/verificationIntegralesProblemes.ts`, PAS de JSX par
 * famille/écran. Toutes les 7 familles n'ont que des champs de taille FIXE (1 à 2 par écran,
 * `texte` ou `choix`) — `EtapeChampsCalculAires` (6gen26, RÉUTILISÉ TEL QUEL, TypeScript à typage
 * structurel) couvre donc TOUS les écrans, jamais besoin d'un composant add-as-needed dédié.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionIntegralesProblemes {
  return demarrerSessionIntegralesProblemes(REGLAGES_DEMO, genererExerciceIntegralesProblemes);
}

type AideParPhase = Partial<Record<PhaseIntegralesProblemes, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceIntegralesProblemes;
  aideParPhase: AideParPhase;
}


export function App6gen29() {
  const [etat, setEtat] = useState<EtatSessionIntegralesProblemes>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionIntegralesProblemes) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`) — piège "revele
    // stale" documenté CLAUDE.md, patron 6gen27 répliqué à l'identique.
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
    setEtat(demarrerSessionIntegralesProblemes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteIntegralesProblemes)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés — mirroir
  // `App6gen27.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen29?: unknown }).__debug6gen29 = { exercice, phase };
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
        <h1 className="app-title">Intégrales et primitives : problèmes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
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

        {dernierBilan && <ResultatPanelIntegralesProblemes resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionIntegralesProblemes resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
