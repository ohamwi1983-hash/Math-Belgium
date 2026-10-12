import { useState } from "react";
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
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatRacinesNiemes";
import { calculerRecapitulatifRacinesNiemes, calculerSegmentsProgressionRacinesNiemes } from "./ui6e/recapitulatifRacinesNiemes";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

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

  function terminerEtape(nouvelEtat: EtatSessionRacinesNiemes) {
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Racines n-ièmes d'un nombre complexe</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionRacinesNiemes(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifRacinesNiemes(etat)} />
        {estEcranChoix && (
          <EtapeChoixRelationRacinesNiemes
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={null}
            consigneEcran={consigneEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]))}
            validation={validation}
          />
        )}

        {estEcranListe && (
          <EtapeListeRacinesNiemes
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={null}
            consigneEcran={consigneEcran(exercice, phase)}
            nAttendu={exercice.n}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
            validation={validation}
          />
        )}

        {!estEcranChoix && !estEcranListe && (
          <EtapeChampsRacinesNiemes
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={null}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champsEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
            validation={validation}
          />
        )}
      </main>
    </div>
  );
}
