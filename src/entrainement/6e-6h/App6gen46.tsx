import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementCombinatoirePur } from "./generateurs6e/denombrementCombinatoirePur";
import type { IdVarianteDenombrementCombinatoirePur } from "./generateurs6e/denombrementCombinatoirePur";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionDenombrementCombinatoirePur, soumettreReponseEcran } from "./moteur6e/sessionDenombrementCombinatoirePur";
import type { EtatSessionDenombrementCombinatoirePur } from "./moteur6e/typesDenombrementCombinatoirePur";
import { diagnostiquerEcran } from "./moteur6e/verificationDenombrementCombinatoirePur";
import { EtapeChampsDenombrementCombinatoirePur } from "./components6e/EtapeChampsDenombrementCombinatoirePur";
import { EtapeListeDecompositionsDenombrementCombinatoirePur } from "./components6e/EtapeListeDecompositionsDenombrementCombinatoirePur";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, niveauAideMaxEcran, formatReponseAttenduePhaseLatex, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatDenombrementCombinatoirePur";
import { calculerRecapitulatifDenombrementCombinatoirePur, calculerSegmentsProgressionDenombrementCombinatoirePur } from "./ui6e/recapitulatifDenombrementCombinatoirePur";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

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

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDenombrementCombinatoirePur;
  revele: boolean;
}

export function App6gen46() {
  const [etat, setEtat] = useState<EtatSessionDenombrementCombinatoirePur>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionDenombrementCombinatoirePur) {
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
    setEtat(demarrerSessionDenombrementCombinatoirePur(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteDenombrementCombinatoirePur)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen43.tsx`/`App6gen44.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen46?: unknown }).__debug6gen46 = { exercice, phase };
  }

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

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, niveauAideMaxEcran(exercice, phase)),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    validation,
  };

  const estEcranListeDecompositionsD = exercice.famille === "D" && phase === "dEcran1";

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Dénombrement combinatoire pur : problèmes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionDenombrementCombinatoirePur(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifDenombrementCombinatoirePur(etat)} />
        {estEcranListeDecompositionsD && exercice.famille === "D" && (
          <EtapeListeDecompositionsDenombrementCombinatoirePur
            key={phase}
            {...aideCommun}
            estPremierEcran={estPremierEcran}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={null}
            consigneEcran={consigneEcran(exercice, phase)}
            s1={exercice.s1}
            s2={exercice.s2}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}
        {!estEcranListeDecompositionsD && (
          <EtapeChampsDenombrementCombinatoirePur
            key={phase}
            {...aideCommun}
            estPremierEcran={estPremierEcran}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={null}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champsEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}
      </main>
    </div>
  );
}
