import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCercles } from "./generateurs6e/cercles";
import type { IdVarianteCercles } from "./generateurs6e/cercles";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionCercles, soumettreReponseEcran } from "./moteur6e/sessionCercles";
import type { EtatSessionCercles, PhaseCercles, ResultatExerciceCercles } from "./moteur6e/typesCercles";
import { diagnostiquerEcran } from "./moteur6e/verificationCercles";
import { EtapeChampsCercles } from "./components6e/EtapeChampsCercles";
import { EtapeListeCentresCercles } from "./components6e/EtapeListeCentresCercles";
import { ResultatPanelCercles } from "./components6e/ResultatPanelCercles";
import { ResumeSessionCercles } from "./components6e/ResumeSessionCercles";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatCercles";

/**
 * `6gen55` — Cercles. Générateur D'OUVERTURE du chapitre "Lieux géométriques" (voir
 * `docs/historique-6e.md`). Même patron que `App6gen43.tsx`/`App6gen46.tsx` : un dispatcher
 * générique piloté par `ui6e/formatCercles.ts`/`moteur6e/verificationCercles.ts`, PAS de JSX par
 * famille/écran — SAUF `bEcran3` (famille B, écran 3), qui bascule vers un composant DÉDIÉ
 * (`EtapeListeCentresCercles`, liste add-as-needed des 2 centres) plutôt que le composant générique
 * `champs: ChampDef[]` (incompatible avec une liste de taille variable).
 *
 * **Pas de `QuestionFinale`** — même choix que tous les générateurs 6e existants (aucun des 54
 * générateurs `App6gen*.tsx` précédents ne l'utilise, `grep -rl QuestionFinale src/App6gen*.tsx` →
 * 0 résultat avant ce fichier) : ce composant appartient au patron narratif du chantier 4e, jamais
 * adopté par le 6e (dispatcher générique par écrans courts, `consigneEcran` change à chaque phase
 * et joue déjà ce rôle).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionCercles {
  return demarrerSessionCercles(REGLAGES_DEMO, genererExerciceCercles);
}

type AideParPhase = Partial<Record<PhaseCercles, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceCercles;
  aideParPhase: AideParPhase;
}


export function App6gen55() {
  const [etat, setEtat] = useState<EtatSessionCercles>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionCercles) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen43/6gen46 répliqué à l'identique.
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
    setEtat(demarrerSessionCercles(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteCercles)));
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
    (window as unknown as { __debug6gen55?: unknown }).__debug6gen55 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, enCoursDeSession ? niveauAideMaxEcran(exercice, phase) : 0),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  const estEcranListeCentresB = exercice.famille === "B" && phase === "bEcran3";

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Cercles</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && estEcranListeCentresB && (
          <EtapeListeCentresCercles
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}
        {enCoursDeSession && !estEcranListeCentresB && (
          <EtapeChampsCercles
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

        {dernierBilan && <ResultatPanelCercles resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionCercles resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
