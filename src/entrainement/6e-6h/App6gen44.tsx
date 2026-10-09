import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementCombine } from "./generateurs6e/denombrementCombine";
import type { IdVarianteDenombrementCombine } from "./generateurs6e/denombrementCombine";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionDenombrementCombine, soumettreReponseEcran } from "./moteur6e/sessionDenombrementCombine";
import type { EtatSessionDenombrementCombine, PhaseDenombrementCombine, ResultatExerciceDenombrementCombine } from "./moteur6e/typesDenombrementCombine";
import { diagnostiquerEcran } from "./moteur6e/verificationDenombrementCombine";
import { EtapeChampsDenombrementCombine } from "./components6e/EtapeChampsDenombrementCombine";
import { ResultatPanelDenombrementCombine } from "./components6e/ResultatPanelDenombrementCombine";
import { ResumeSessionDenombrementCombine } from "./components6e/ResumeSessionDenombrementCombine";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatDenombrementCombine";

/**
 * `6gen44` — Dénombrement combiné et sélections contraintes. 2ᵉ générateur du chapitre "Analyse
 * combinatoire" (après `6gen43`, voir `docs/historique-6e.md`). Même patron que `App6gen43.tsx` : un
 * dispatcher générique piloté par `ui6e/formatDenombrementCombine.ts`/
 * `moteur6e/verificationDenombrementCombine.ts`, PAS de JSX par famille/écran — un SEUL composant
 * écran (`EtapeChampsDenombrementCombine`) gère À LA FOIS les champs texte libre ET les écrans de
 * choix (famille B écran 1, famille C écran 1 sous-type "comparaison" — 2 champs choix simultanés,
 * famille D écran 1), piloté entièrement par `champs: ChampDef[]`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDenombrementCombine {
  return demarrerSessionDenombrementCombine(REGLAGES_DEMO, genererExerciceDenombrementCombine);
}

type AideParPhase = Partial<Record<PhaseDenombrementCombine, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceDenombrementCombine;
  aideParPhase: AideParPhase;
}


export function App6gen44() {
  const [etat, setEtat] = useState<EtatSessionDenombrementCombine>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionDenombrementCombine) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen43 répliqué à l'identique.
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
    setEtat(demarrerSessionDenombrementCombine(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteDenombrementCombine)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen43.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen44?: unknown }).__debug6gen44 = { exercice, phase };
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
        <h1 className="app-title">Dénombrement combiné et sélections contraintes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsDenombrementCombine
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

        {dernierBilan && <ResultatPanelDenombrementCombine resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionDenombrementCombine resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
