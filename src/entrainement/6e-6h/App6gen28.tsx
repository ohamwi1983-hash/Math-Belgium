import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLongueurArc } from "./generateurs6e/longueurArc";
import type { IdVarianteLongueurArc } from "./generateurs6e/longueurArc";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionCalculLongueurArc, soumettreReponseEcran } from "./moteur6e/sessionLongueurArc";
import type { EtatSessionLongueurArc, PhaseLongueurArc, ResultatExerciceLongueurArc } from "./moteur6e/typesLongueurArc";
import { diagnostiquerEcran } from "./moteur6e/verificationLongueurArc";
import { EtapeChampsLongueurArc } from "./components6e/EtapeChampsLongueurArc";
import { ResultatPanelLongueurArc } from "./components6e/ResultatPanelLongueurArc";
import { ResumeSessionLongueurArc } from "./components6e/ResumeSessionLongueurArc";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatLongueurArc";

/**
 * `6gen28` — Longueur d'un arc de courbe (chapitre 4, "Intégrales et primitives"). Même patron que
 * `App6gen23.tsx`/`App6gen26.tsx` : un dispatcher générique piloté par `ui6e/formatLongueurArc.ts`/
 * `moteur6e/verificationLongueurArc.ts`, PAS de JSX par famille/écran. Contrairement à 6gen26, PAS
 * d'écran "add-as-needed" (racines de taille variable) : tous les écrans sont de la saisie libre à
 * arité FIXE (1 à 2 champs), donc un seul composant écran suffit
 * (`EtapeChampsLongueurArc`, jamais besoin d'un `EtapeRacinesLongueurArc` dédié).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLongueurArc {
  return demarrerSessionCalculLongueurArc(REGLAGES_DEMO, genererExerciceLongueurArc);
}

type AideParPhase = Partial<Record<PhaseLongueurArc, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceLongueurArc;
  aideParPhase: AideParPhase;
}


export function App6gen28() {
  const [etat, setEtat] = useState<EtatSessionLongueurArc>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionLongueurArc) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen23/6gen26 répliqué à l'identique
    // (voir `moteur6e/sessionLongueurArc.ts`, fonction `soumettreReponseEcran`).
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
    setEtat(demarrerSessionCalculLongueurArc(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteLongueurArc)));
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
    (window as unknown as { __debug6gen28?: unknown }).__debug6gen28 = { exercice, phase };
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
        <h1 className="app-title">Longueur d'un arc de courbe</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsLongueurArc
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

        {dernierBilan && <ResultatPanelLongueurArc resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionLongueurArc resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
