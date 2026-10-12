import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCalculPrimitives } from "./generateurs6e/calculPrimitives";
import type { IdVarianteCalculPrimitives } from "./generateurs6e/calculPrimitives";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionCalculPrimitives, soumettreReponseEcran } from "./moteur6e/sessionCalculPrimitives";
import type { EtatSessionCalculPrimitives } from "./moteur6e/typesCalculPrimitives";
import { diagnostiquerEcran } from "./moteur6e/verificationCalculPrimitives";
import { EtapeChampsCalculPrimitives } from "./components6e/EtapeChampsCalculPrimitives";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatCalculPrimitives";
import { calculerRecapitulatifCalculPrimitives, calculerSegmentsProgressionCalculPrimitives } from "./ui6e/recapitulatifCalculPrimitives";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen23` — Calcul de primitives (chapitre 4, "Intégrales et primitives"). Contrairement aux
 * générateurs précédents du chantier, ce fichier ne contient PAS de bloc JSX par famille/écran : un
 * seul rendu `<EtapeChampsCalculPrimitives>`, entièrement piloté par les fonctions de dispatch de
 * `ui6e/formatCalculPrimitives.ts` (`champsEcran`, `consigneEcran`, etc.) et `verificationCalculPrimitives.ts`
 * (`diagnostiquerEcran`) — voir l'en-tête de ces deux fichiers pour la justification (déviation
 * délibérée du patron `6gen18`, ~24 écrans à travers 7 familles rendraient un JSX par écran
 * ingérable). Aucune calculatrice scientifique : tous les champs de ce générateur attendent une
 * EXPRESSION symbolique (jamais une valeur décimale calculée à la main), contrairement à 6gen16/18.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionCalculPrimitives {
  return demarrerSessionCalculPrimitives(REGLAGES_DEMO, genererExerciceCalculPrimitives);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionCalculPrimitives;
  revele: boolean;
}

export function App6gen23() {
  const [etat, setEtat] = useState<EtatSessionCalculPrimitives>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionCalculPrimitives) {
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
    setEtat(demarrerSessionCalculPrimitives(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteCalculPrimitives)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1, même garde que
  // `SelecteurVarianteDev`) : expose l'exercice tiré tel quel sur `window` — permet à la
  // vérification Playwright (build de production) de reconstruire la réponse EXACTE attendue à
  // chaque écran depuis les vrais paramètres tirés, plutôt que de re-parser le LaTeX affiché
  // (fragile). Jamais consommé par le code applicatif lui-même, uniquement par un script de test
  // externe — voir `docs/historique-6e.md` pour la vérification Playwright de 6gen23.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen23?: unknown }).__debug6gen23 = { exercice, phase };
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
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    validation,
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Calcul de primitives</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionCalculPrimitives(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifCalculPrimitives(etat)} />
        <EtapeChampsCalculPrimitives
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
        />
      </main>
    </div>
  );
}
