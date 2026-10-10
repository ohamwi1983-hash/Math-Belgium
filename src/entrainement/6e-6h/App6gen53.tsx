import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiPoisson } from "./generateurs6e/loiPoisson";
import type { IdVarianteLoiPoisson } from "./generateurs6e/loiPoisson";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionLoiPoisson, soumettreReponseEcran } from "./moteur6e/sessionLoiPoisson";
import type { EtatSessionLoiPoisson, PhaseLoiPoisson, ResultatExerciceLoiPoisson } from "./moteur6e/typesLoiPoisson";
import { diagnostiquerEcran } from "./moteur6e/verificationLoiPoisson";
import { EtapeChampsLoiPoisson } from "./components6e/EtapeChampsLoiPoisson";
import { ResultatPanelLoiPoisson } from "./components6e/ResultatPanelLoiPoisson";
import { ResumeSessionLoiPoisson } from "./components6e/ResumeSessionLoiPoisson";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatLoiPoisson";

/**
 * `6gen53` — Loi de Poisson. Même patron que `App6gen50.tsx` : un dispatcher générique piloté par
 * `ui6e/formatLoiPoisson.ts`/`moteur6e/verificationLoiPoisson.ts`, PAS de JSX par famille/écran — un
 * SEUL composant écran (`EtapeChampsLoiPoisson`) gère À LA FOIS les champs texte libre et la
 * checklist à 3 conditions (famille A), piloté entièrement par `champs: ChampDef[]`.
 *
 * **Pas de `QuestionFinale`** — convention RÉELLE déjà établie pour ce chantier (voir en-tête
 * `App6gen49.tsx` : 0 générateur 6e ne l'utilise) : ce composant appartient au patron narratif "1
 * seul problème long" du chantier 4e, jamais adopté par le chantier 6e (dispatcher générique par
 * écrans courts, `consigneEcran` change à chaque phase — le rôle de rappel persistant est déjà
 * rempli par `blocDonnees`, réaffiché identique sur chaque écran).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLoiPoisson {
  return demarrerSessionLoiPoisson(REGLAGES_DEMO, genererExerciceLoiPoisson);
}

type AideParPhase = Partial<Record<PhaseLoiPoisson, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceLoiPoisson;
  aideParPhase: AideParPhase;
}


export function App6gen53() {
  const [etat, setEtat] = useState<EtatSessionLoiPoisson>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionLoiPoisson) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen43/6gen48/6gen50 répliqué à
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
    setEtat(demarrerSessionLoiPoisson(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteLoiPoisson)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen50.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen53?: unknown }).__debug6gen53 = { exercice, phase };
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
        <h1 className="app-title">Loi de Poisson</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsLoiPoisson
            // `${etat.generationId}-${phase}`, JAMAIS `phase` seul — voir `generationId`
            // (`moteur6e/typesLoiPoisson.ts`/`sessionLoiPoisson.ts`) : la famille B (écran
            // d'identification) peut avoir un nombre de champs variable à phase de départ identique
            // entre 2 exercices consécutifs — mirroir du bug trouvé/corrigé sur 6gen48.
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

        {dernierBilan && <ResultatPanelLoiPoisson resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionLoiPoisson resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
