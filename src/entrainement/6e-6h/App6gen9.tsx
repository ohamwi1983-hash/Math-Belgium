import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEquationExponentielle } from "./generateurs6e/equationsExponentielles";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionEquationExponentielle,
  soumettreReponseAEcran1,
  soumettreReponseAEcran2Liste,
  soumettreReponseAEcran2Valeur,
  soumettreReponseBEcran1,
  soumettreReponseBEcran2,
  soumettreReponseCEcran1,
  soumettreReponseCEcran2,
  soumettreReponseCEcran3,
  soumettreReponseDEcran,
} from "./moteur6e/sessionEquationsExponentielles";
import type { EtatSessionEquationExponentielle } from "./moteur6e/typesEquationsExponentielles";
import { EtapeChampEquExpo } from "./components6e/EtapeChampEquExpo";
import { EtapeListeEquExpo } from "./components6e/EtapeListeEquExpo";
import { EtapeReconnaitreImpossibleEquExpo } from "./components6e/EtapeReconnaitreImpossibleEquExpo";
import { EtapeValeurOuVideEquExpo } from "./components6e/EtapeValeurOuVideEquExpo";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { aideNiveau1, aideNiveau2, consigneEcran, formatEnonceLatex, formatReponseAttenduePhaseLatex } from "./ui6e/formatEquationsExponentielles";
import { calculerRecapitulatifEquationsExponentielles, calculerSegmentsProgressionEquationsExponentielles } from "./ui6e/recapitulatifEquationsExponentielles";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen9` — Résoudre une équation exponentielle. Validation INLINE même écran (rollout UX
 * approuvé) — `enAttente`/`terminerEtape`/`ValidationEcran`, mirroir exact `App6gen13.tsx`/
 * `App6gen12.tsx` : plus de `ResultatPanelEquationExponentielle`/`ResumeSessionEquationExponentielle`
 * séparés.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEquationExponentielle {
  return demarrerSessionEquationExponentielle(REGLAGES_DEMO, genererExerciceEquationExponentielle);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationExponentielle;
  revele: boolean;
}

export function App6gen9() {
  const [etat, setEtat] = useState<EtatSessionEquationExponentielle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionEquationExponentielle) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici — remis à zéro par `avancerPhase` DANS le même appel qui clôt l'écran, voir
    // `moteur6e/sessionEquationsExponentielles.ts` et `docs/historique-6e.md`).
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
    setEtat(demarrerSessionEquationExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const enonceLatex = formatEnonceLatex(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(phase, exercice);
  const aide2 = aideNiveau2(phase, exercice);
  const consigne = consigneEcran(phase, exercice);

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen58.tsx`/`App6gen43.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen9?: unknown }).__debug6gen9 = { exercice, phase };
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Résoudre une équation exponentielle</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionEquationsExponentielles(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifEquationsExponentielles(etat)} />
        <div className="card-body">
          {phase === "aEcran1" && (
            <EtapeChampEquExpo
              key={phase}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              etatActuel={null}
              placeholder={exercice.famille === "A" && exercice.sousType === "A2" ? "ex : 2^(3*x-1)-2^5=0" : "ex : 3, -2, 1/2..."}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseAEcran1(etat, texte))}
              validation={validation}
            />
          )}
          {phase === "aEcran2" && exercice.famille === "A" && exercice.sousType !== "A3" && (
            <EtapeChampEquExpo
              key={phase}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              etatActuel={null}
              placeholder="ex : 4/3, -1.5..."
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseAEcran2Valeur(etat, texte))}
              validation={validation}
            />
          )}
          {phase === "aEcran2" && exercice.famille === "A" && exercice.sousType === "A3" && (
            <EtapeListeEquExpo
              key={phase}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              etatActuel={null}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              placeholder="ex : -1"
              labelAjout="+ Ajouter une solution"
              labelAucune="∅ — Aucune solution"
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(textes) => terminerEtape(soumettreReponseAEcran2Liste(etat, textes))}
              validation={validation}
            />
          )}

          {phase === "bEcran1" && (
            <EtapeChampEquExpo
              key={phase}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              etatActuel={null}
              placeholder="ex : (3*x+1)/2"
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseBEcran1(etat, texte))}
              validation={validation}
            />
          )}
          {phase === "bEcran2" && (
            <EtapeValeurOuVideEquExpo
              key={phase}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              etatActuel={null}
              placeholder="ex : 1, -2/3..."
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseBEcran2(etat, reponse))}
              validation={validation}
            />
          )}

          {phase === "cEcran1" && (
            <EtapeChampEquExpo
              key={phase}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              etatActuel={null}
              placeholder="ex : 2*t^2-3*t-5=0"
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseCEcran1(etat, texte))}
              validation={validation}
            />
          )}
          {phase === "cEcran2" && (
            <EtapeListeEquExpo
              key={phase}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              etatActuel={null}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              placeholder="ex : -3, 5..."
              labelAjout="+ Ajouter une valeur de t"
              labelAucune="Aucune valeur de t"
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(textes) => terminerEtape(soumettreReponseCEcran2(etat, textes))}
              validation={validation}
            />
          )}
          {phase === "cEcran3" && (
            <EtapeListeEquExpo
              key={phase}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              etatActuel={null}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              placeholder="ex : 1, 2.5..."
              labelAjout="+ Ajouter une solution"
              labelAucune="∅ — Aucune solution"
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(textes) => terminerEtape(soumettreReponseCEcran3(etat, textes))}
              validation={validation}
            />
          )}
          {phase === "cEcran3" && <CalculatriceScientifique />}

          {phase === "dEcran" && (
            <EtapeReconnaitreImpossibleEquExpo
              key={phase}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              etatActuel={null}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(existeUneSolution) => terminerEtape(soumettreReponseDEcran(etat, existeUneSolution))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
