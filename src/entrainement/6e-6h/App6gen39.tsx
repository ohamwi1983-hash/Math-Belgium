import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRacinesNiemes } from "./generateurs6e/racinesNiemes";
import type { IdVarianteRacinesNiemes } from "./generateurs6e/racinesNiemes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionRacinesNiemes, soumettreReponseEcran } from "./moteur6e/sessionRacinesNiemes";
import type { EtatSessionRacinesNiemes } from "./moteur6e/typesRacinesNiemes";
import { diagnostiquerEcran } from "./moteur6e/verificationRacinesNiemes";
import { Katex } from "./components/Katex";
import { EtapeChampsRacinesNiemes } from "./components6e/EtapeChampsRacinesNiemes";
import { EtapeChoixRelationRacinesNiemes } from "./components6e/EtapeChoixRelationRacinesNiemes";
import { EtapeListeRacinesNiemes } from "./components6e/EtapeListeRacinesNiemes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  blocDonnees,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  niveauAideMaxEcran,
  LIBELLE_PHASE,
  LIBELLE_RELATION_C,
  aideNiveau1 as formatAideNiveau1,
  aideNiveau2 as formatAideNiveau2,
} from "./ui6e/formatRacinesNiemes";
import { calculerRecapitulatifRacinesNiemes, calculerSegmentsProgressionRacinesNiemes } from "./ui6e/recapitulatifRacinesNiemes";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen39` — Racines n-ièmes d'un nombre complexe (chapitre 7, "Nombres complexes", après `6gen34`/
 * `6gen35`/`6gen37`/`6gen38`). Même patron dispatcher générique que `App6gen37.tsx`, avec 3 types
 * d'écran plutôt que 2 : écran de CHOIX (famille C écran 1, `EtapeChoixRelationRacinesNiemes`), écran
 * LISTE add-as-needed (famille A écran 3, famille C écrans 2/3 — nombre de racines variable selon
 * `n`, `EtapeListeRacinesNiemes`) et écran à champs GÉNÉRIQUE (tous les autres,
 * `EtapeChampsRacinesNiemes`).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionRacinesNiemes {
  return demarrerSessionRacinesNiemes(REGLAGES_DEMO, genererExerciceRacinesNiemes);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionRacinesNiemes;
  revele: boolean;
}

export function App6gen39() {
  const [etat, setEtat] = useState<EtatSessionRacinesNiemes>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionRacinesNiemes`, jamais dans le moteur : la saisie de l'élève
   * n'a aucune autre utilité une fois l'étape close. `aideUtiliseeFermees` est l'équivalent, un
   * booléen par écran déjà clos (même index que `historique`), capturé car le moteur ne garde
   * `niveauAide` que de façon TRANSITOIRE (remis à 0 à chaque nouvelle phase, jamais archivé par
   * écran) — voir `calculerSegmentsProgressionRacinesNiemes` pour la couleur de base. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [aideUtiliseeFermees, setAideUtiliseeFermees] = useState<boolean[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (même garde `transitionDEcran` qui déclenche déjà `setEnAttente`) — jamais à chaque
   * clic sur "Valider" (bug déjà rencontré sur la référence 4e, voir `AppAnalyseFonction.tsx`).
   * `etat.phase`/`etat.exerciceCourant`/`etat.niveauAide` (AVANT transition) décrivent toujours
   * l'écran qui vient de se clore ici, y compris sur la toute dernière phase d'un exercice
   * (`nombreExercices` est toujours 1 en démo, donc `etat.exerciceCourant` ne change jamais sous
   * nos pieds) — jamais besoin de relire `calculerRecapitulatifRacinesNiemes`, dont la dernière
   * entrée ne correspond PAS à la phase qui se clôt quand l'exercice entier se termine. */
  function terminerEtape(nouvelEtat: EtatSessionRacinesNiemes, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        const revele = nouvelEtat.derniereTransitionRevelee;
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE[etat.phase],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? (
              <span className="equation-box-termes">
                {formatReponseAttenduePhaseLatex(etat.exerciceCourant, etat.phase).map((frag, i) => (
                  <Katex key={i} expression={frag} />
                ))}
              </span>
            ) : undefined,
          },
        ]);
        setAideUtiliseeFermees((a) => [...a, etat.niveauAide > 0]);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereTransitionRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideUtiliseeFermees([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeFermees([]);
    setEtat(demarrerSessionRacinesNiemes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteRacinesNiemes)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen37.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen39?: unknown }).__debug6gen39 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, niveauAideMaxEcran(exercice, phase)),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

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

  const estEcranChoix = exercice.famille === "C" && phase === "cEcran1";
  const estEcranListe = (exercice.famille === "A" && phase === "aEcran3") || (exercice.famille === "C" && (phase === "cEcran2" || phase === "cEcran3"));

  const segmentsBase = calculerSegmentsProgressionRacinesNiemes(etat);
  const segments = segmentsBase.map((s, i) => (s === "correcte" && aideUtiliseeFermees[i] ? ("aide" as const) : s));

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Racines n-ièmes d'un nombre complexe</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifRacinesNiemes(etat)} />
        {estEcranChoix && (
          <EtapeChoixRelationRacinesNiemes
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            consigneEcran={consigneEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]), <Katex expression={LIBELLE_RELATION_C[id]} />)}
            validation={validation}
          />
        )}

        {estEcranListe && (
          <EtapeListeRacinesNiemes
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            consigneEcran={consigneEcran(exercice, phase)}
            nAttendu={exercice.n}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs.join(" ; "))}
            validation={validation}
          />
        )}

        {!estEcranChoix && !estEcranListe && (
          <EtapeChampsRacinesNiemes
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champsEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) =>
              terminerEtape(
                soumettreReponseEcran(etat, valeurs),
                champsEcran(exercice, phase)
                  .map((c, i) => `${c.label} ${valeurs[i]}`)
                  .join(" ; "),
              )
            }
            validation={validation}
          />
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
