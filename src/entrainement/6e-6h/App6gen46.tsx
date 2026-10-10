import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementCombinatoirePur } from "./generateurs6e/denombrementCombinatoirePur";
import type { IdVarianteDenombrementCombinatoirePur } from "./generateurs6e/denombrementCombinatoirePur";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionDenombrementCombinatoirePur, soumettreReponseEcran } from "./moteur6e/sessionDenombrementCombinatoirePur";
import type { EtatSessionDenombrementCombinatoirePur, PhaseDenombrementCombinatoirePur, ResultatExerciceDenombrementCombinatoirePur } from "./moteur6e/typesDenombrementCombinatoirePur";
import { diagnostiquerEcran } from "./moteur6e/verificationDenombrementCombinatoirePur";
import { EtapeChampsDenombrementCombinatoirePur } from "./components6e/EtapeChampsDenombrementCombinatoirePur";
import { EtapeListeDecompositionsDenombrementCombinatoirePur } from "./components6e/EtapeListeDecompositionsDenombrementCombinatoirePur";
import { ResultatPanelDenombrementCombinatoirePur } from "./components6e/ResultatPanelDenombrementCombinatoirePur";
import { ResumeSessionDenombrementCombinatoirePur } from "./components6e/ResumeSessionDenombrementCombinatoirePur";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatDenombrementCombinatoirePur";

/**
 * `6gen46` — Dénombrement combinatoire pur : problèmes. 3ᵉ générateur du chapitre "Analyse
 * combinatoire" (après `6gen43`/`6gen44`, voir `docs/historique-6e.md`). Même patron que
 * `App6gen43.tsx`/`App6gen44.tsx` : un dispatcher générique piloté par `ui6e/
 * formatDenombrementCombinatoirePur.ts`/`moteur6e/verificationDenombrementCombinatoirePur.ts`, PAS
 * de JSX par famille/écran — SAUF `dEcran1` (famille D, écran 1), qui bascule vers un composant
 * DÉDIÉ (`EtapeListeDecompositionsDenombrementCombinatoirePur`, 2 listes add-as-needed
 * simultanées) plutôt que le composant générique `champs: ChampDef[]` (incompatible avec une liste
 * de taille variable, voir en-tête de ce composant).
 *
 * **Pas de `QuestionFinale`** (contrairement à la convention CLAUDE.md générale) : vérifié qu'AUCUN
 * des 45 générateurs 6e existants (`grep -rl QuestionFinale src/App6gen*.tsx` → 0 résultat) ne
 * l'utilise — ce composant appartient au patron narratif "1 seul problème long, 1 seule question
 * finale persistante" du chantier 4e, jamais adopté par le chantier 6e (dispatcher générique par
 * écrans courts, `consigneEcran` change à chaque phase). Suivre le patron RÉEL du chantier plutôt
 * que la checklist générale quand les deux divergent explicitement, cohérent avec la mission
 * ("mirror this exact file layout/naming pattern").
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDenombrementCombinatoirePur {
  return demarrerSessionDenombrementCombinatoirePur(REGLAGES_DEMO, genererExerciceDenombrementCombinatoirePur);
}

type AideParPhase = Partial<Record<PhaseDenombrementCombinatoirePur, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceDenombrementCombinatoirePur;
  aideParPhase: AideParPhase;
}


export function App6gen46() {
  const [etat, setEtat] = useState<EtatSessionDenombrementCombinatoirePur>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionDenombrementCombinatoirePur) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen43/6gen44 répliqué à l'identique.
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
    setEtat(demarrerSessionDenombrementCombinatoirePur(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteDenombrementCombinatoirePur)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen43.tsx`/`App6gen44.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen46?: unknown }).__debug6gen46 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, enCoursDeSession ? niveauAideMaxEcran(exercice, phase) : 0),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  const estEcranListeDecompositionsD = exercice.famille === "D" && phase === "dEcran1";

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Dénombrement combinatoire pur : problèmes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && estEcranListeDecompositionsD && exercice.famille === "D" && (
          <EtapeListeDecompositionsDenombrementCombinatoirePur
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            s1={exercice.s1}
            s2={exercice.s2}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}
        {enCoursDeSession && !estEcranListeDecompositionsD && (
          <EtapeChampsDenombrementCombinatoirePur
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

        {dernierBilan && <ResultatPanelDenombrementCombinatoirePur resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionDenombrementCombinatoirePur resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
