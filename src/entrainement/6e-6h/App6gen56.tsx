import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLieuxGeometriquesParametres } from "./generateurs6e/lieuxGeometriquesParametres";
import type { IdVarianteLieuxGeometriquesParametres } from "./generateurs6e/lieuxGeometriquesParametres";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionLieuxGeometriquesParametres, soumettreReponseEcran } from "./moteur6e/sessionLieuxGeometriquesParametres";
import type { EtatSessionLieuxGeometriquesParametres, PhaseLieuxGeometriquesParametres, ResultatExerciceLieuxGeometriquesParametres } from "./moteur6e/typesLieuxGeometriquesParametres";
import { diagnostiquerEcran } from "./moteur6e/verificationLieuxGeometriquesParametres";
import { EtapeChampsLieuxGeometriquesParametres } from "./components6e/EtapeChampsLieuxGeometriquesParametres";
import { ResultatPanelLieuxGeometriquesParametres } from "./components6e/ResultatPanelLieuxGeometriquesParametres";
import { ResumeSessionLieuxGeometriquesParametres } from "./components6e/ResumeSessionLieuxGeometriquesParametres";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatLieuxGeometriquesParametres";

/**
 * `6gen56` — Lieux géométriques et élimination de paramètre (révisé). GÉNÉRATEUR D'OUVERTURE du
 * nouveau chapitre "Lieux géométriques" (6e FWB, 6h) — voir `docs/historique-6e.md`. Même patron
 * que `App6gen43.tsx`/`App6gen53.tsx` : un dispatcher générique piloté par `ui6e/
 * formatLieuxGeometriquesParametres.ts`/`moteur6e/verificationLieuxGeometriquesParametres.ts`, PAS
 * de JSX par famille/écran — un SEUL composant écran (`EtapeChampsLieuxGeometriquesParametres`) gère
 * À LA FOIS les champs texte libre ET les champs `choix` (nature du lieu, configuration, stratégie,
 * régime), piloté entièrement par `champs: ChampDef[]`.
 *
 * **Pas de `QuestionFinale`** — convention RÉELLE déjà établie pour ce chantier (voir en-tête
 * `App6gen53.tsx` : 0 générateur 6e ne l'utilise) : ce composant appartient au patron narratif "1
 * seul problème long" du chantier 4e, jamais adopté par le chantier 6e (dispatcher générique par
 * écrans courts, `consigneEcran` change à chaque phase — le rôle de rappel persistant est déjà
 * rempli par `blocDonnees`, réaffiché identique sur chaque écran).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLieuxGeometriquesParametres {
  return demarrerSessionLieuxGeometriquesParametres(REGLAGES_DEMO, genererExerciceLieuxGeometriquesParametres);
}

type AideParPhase = Partial<Record<PhaseLieuxGeometriquesParametres, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceLieuxGeometriquesParametres;
  aideParPhase: AideParPhase;
}


export function App6gen56() {
  const [etat, setEtat] = useState<EtatSessionLieuxGeometriquesParametres>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionLieuxGeometriquesParametres) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen23/6gen26/6gen43 répliqué à
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
    setEtat(demarrerSessionLieuxGeometriquesParametres(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteLieuxGeometriquesParametres)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). `champs` (en plus de `exercice`/`phase`) expose aussi les
  // `options: {valeur,label}[]` des champs `choix` de l'écran courant — permet au script Playwright
  // de retrouver le LABEL du bon bouton à cliquer depuis la `valeur` technique attendue, sans
  // dupliquer les tables d'options de `ui6e/formatLieuxGeometriquesParametres.ts` dans le script de
  // vérification. Jamais consommé par le code applicatif lui-même — mirroir `App6gen43.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen56?: unknown }).__debug6gen56 = { exercice, phase, champs: enCoursDeSession ? champsEcran(exercice, phase) : [] };
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
        <h1 className="app-title">Lieux géométriques et élimination de paramètre</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsLieuxGeometriquesParametres
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

        {dernierBilan && <ResultatPanelLieuxGeometriquesParametres resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionLieuxGeometriquesParametres resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
