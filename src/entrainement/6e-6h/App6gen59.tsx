import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationConiqueCaracteristiques } from "./generateurs6e/equationConiqueCaracteristiques";
import type { IdVarianteEquationConiqueCaracteristiques } from "./generateurs6e/equationConiqueCaracteristiques";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionEquationConiqueCaracteristiques, soumettreReponseEcran } from "./moteur6e/sessionEquationConiqueCaracteristiques";
import type { EtatSessionEquationConiqueCaracteristiques, PhaseEquationConiqueCaracteristiques, ResultatExerciceEquationConiqueCaracteristiques } from "./moteur6e/typesEquationConiqueCaracteristiques";
import { diagnostiquerEcran } from "./moteur6e/verificationEquationConiqueCaracteristiques";
import { EtapeChampsEquationConiqueCaracteristiques } from "./components6e/EtapeChampsEquationConiqueCaracteristiques";
import { ResultatPanelEquationConiqueCaracteristiques } from "./components6e/ResultatPanelEquationConiqueCaracteristiques";
import { ResumeSessionEquationConiqueCaracteristiques } from "./components6e/ResumeSessionEquationConiqueCaracteristiques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatEquationConiqueCaracteristiques";

/**
 * `6gen59` — Équation d'une conique depuis ses caractéristiques. DEUXIÈME générateur du chapitre
 * "Les coniques" (fondation posée par `6gen58`, voir `docs/historique-6e.md`). Même patron que
 * `App6gen58.tsx` : un dispatcher générique piloté par
 * `ui6e/formatEquationConiqueCaracteristiques.ts`/`moteur6e/verificationEquationConiqueCaracteristiques.ts`,
 * PAS de JSX par famille/écran — un SEUL composant écran
 * (`EtapeChampsEquationConiqueCaracteristiques`) gère à la fois les champs texte libre et les écrans
 * de choix, piloté entièrement par `champs: ChampDef[]`.
 *
 * **Pas de `QuestionFinale`** — convention RÉELLE déjà établie pour ce chantier (0 générateur 6e ne
 * l'utilise, voir en-tête `App6gen58.tsx`) : le rôle de rappel persistant est déjà rempli par
 * `blocDonnees`, réaffiché identique sur chaque écran.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEquationConiqueCaracteristiques {
  return demarrerSessionEquationConiqueCaracteristiques(REGLAGES_DEMO, genererExerciceEquationConiqueCaracteristiques);
}

type AideParPhase = Partial<Record<PhaseEquationConiqueCaracteristiques, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceEquationConiqueCaracteristiques;
  aideParPhase: AideParPhase;
}


export function App6gen59() {
  const [etat, setEtat] = useState<EtatSessionEquationConiqueCaracteristiques>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionEquationConiqueCaracteristiques) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md.
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
    setEtat(demarrerSessionEquationConiqueCaracteristiques(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteEquationConiqueCaracteristiques)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen58.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen59?: unknown }).__debug6gen59 = { exercice, phase, champs: enCoursDeSession ? champsEcran(exercice, phase) : null };
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
        <h1 className="app-title">Équation d'une conique depuis ses caractéristiques</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsEquationConiqueCaracteristiques
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

        {dernierBilan && <ResultatPanelEquationConiqueCaracteristiques resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionEquationConiqueCaracteristiques resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
