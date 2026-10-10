import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiBinomiale } from "./generateurs6e/loiBinomiale";
import type { IdVarianteLoiBinomiale } from "./generateurs6e/loiBinomiale";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionLoiBinomiale, soumettreReponseEcran } from "./moteur6e/sessionLoiBinomiale";
import type { EtatSessionLoiBinomiale, PhaseLoiBinomiale, ResultatExerciceLoiBinomiale } from "./moteur6e/typesLoiBinomiale";
import { diagnostiquerEcran } from "./moteur6e/verificationLoiBinomiale";
import { EtapeChampsLoiBinomiale } from "./components6e/EtapeChampsLoiBinomiale";
import { ResultatPanelLoiBinomiale } from "./components6e/ResultatPanelLoiBinomiale";
import { ResumeSessionLoiBinomiale } from "./components6e/ResumeSessionLoiBinomiale";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatLoiBinomiale";

/**
 * `6gen50` — Loi binomiale. Même patron que `App6gen48.tsx` : un dispatcher générique piloté par
 * `ui6e/formatLoiBinomiale.ts`/`moteur6e/verificationLoiBinomiale.ts`, PAS de JSX par famille/écran
 * — un SEUL composant écran (`EtapeChampsLoiBinomiale`) gère À LA FOIS les champs texte libre, la
 * checklist à 4 conditions (famille A) et le QCM d'interprétation (famille B), piloté entièrement
 * par `champs: ChampDef[]`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLoiBinomiale {
  return demarrerSessionLoiBinomiale(REGLAGES_DEMO, genererExerciceLoiBinomiale);
}

type AideParPhase = Partial<Record<PhaseLoiBinomiale, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceLoiBinomiale;
  aideParPhase: AideParPhase;
}


export function App6gen50() {
  const [etat, setEtat] = useState<EtatSessionLoiBinomiale>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionLoiBinomiale) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen43/6gen48 répliqué à l'identique.
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
    setEtat(demarrerSessionLoiBinomiale(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteLoiBinomiale)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen48.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen50?: unknown }).__debug6gen50 = { exercice, phase };
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
        <h1 className="app-title">Loi binomiale</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsLoiBinomiale
            // `${etat.generationId}-${phase}`, JAMAIS `phase` seul — voir `generationId`
            // (`moteur6e/typesLoiBinomiale.ts`/`sessionLoiBinomiale.ts`) : la famille B (écran de
            // calcul des termes) peut avoir un nombre de champs variable à phase de départ
            // identique entre 2 exercices consécutifs — mirroir du bug trouvé/corrigé sur 6gen48.
            key={`${etat.generationId}-${phase}`}
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

        {dernierBilan && <ResultatPanelLoiBinomiale resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionLoiBinomiale resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
