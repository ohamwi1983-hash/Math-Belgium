import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, construireQuellePrimitive } from "./generateurs6e/quellePrimitive";
import type { IdVarianteQuellePrimitive } from "./generateurs6e/quellePrimitive";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionQuellePrimitive, soumettreReponseEcran } from "./moteur6e/sessionQuellePrimitive";
import type { EtatSessionQuellePrimitive } from "./moteur6e/typesQuellePrimitive";
import { diagnostiquerEcranQuellePrimitive } from "./moteur6e/verificationQuellePrimitive";
import { EtapeChampsCalculPrimitives } from "./components6e/EtapeChampsCalculPrimitives";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonneesQuellePrimitive, champsQuellePrimitive, consigneEcranQuellePrimitive, consigneGeneraleQuellePrimitive, formatReponseAttenduePhaseLatexQuellePrimitive, aideNiveau1QuellePrimitive, aideNiveau2QuellePrimitive } from "./ui6e/formatQuellePrimitive";
import { calculerRecapitulatifQuellePrimitive, calculerSegmentsProgressionQuellePrimitive } from "./ui6e/recapitulatifQuellePrimitive";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen24` — Quelle primitive ? (condition initiale) (chapitre 4, "Intégrales et primitives",
 * PROLONGE `6gen23`). Réutilise `EtapeChampsCalculPrimitives` (6gen23) TEL QUEL — composant DÉJÀ
 * générique (voir son en-tête : "GÉNÉRALISATION délibérée", paramétré uniquement par `ChampDef[]`/
 * `AideAvecLatex`, aucun couplage à un type d'exercice précis) : la même mécanique "consigne
 * générale → bloc données → bloc état actuel → bloc de travail" convient aussi bien aux écrans
 * empruntés qu'à notre écran final (2 champs, C puis F(x)) — écrire un second composant identique
 * n'aurait fait que dupliquer du code déjà testé. `SelecteurVarianteDev`/`LigneRecap`/`BoutonAide`
 * (via `EtapeChampsCalculPrimitives`) sont de la même façon des briques `components6e/` déjà
 * génériques, réutilisées sans modification (composants ↔ composants, réutilisation libre —
 * CLAUDE.md).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionQuellePrimitive {
  return demarrerSessionQuellePrimitive(REGLAGES_DEMO, construireQuellePrimitive);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionQuellePrimitive;
  revele: boolean;
}

export function App6gen24() {
  const [etat, setEtat] = useState<EtatSessionQuellePrimitive>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionQuellePrimitive) {
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
    setEtat(demarrerSessionQuellePrimitive(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteQuellePrimitive)));
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

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1, même garde que
  // `SelecteurVarianteDev`) : expose l'exercice tiré tel quel sur `window` — permet à la
  // vérification Playwright (build de production) de reconstruire la réponse EXACTE attendue à
  // chaque écran depuis les vrais paramètres tirés, plutôt que de re-parser le LaTeX affiché
  // (fragile). Jamais consommé par le code applicatif lui-même.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen24?: unknown }).__debug6gen24 = { exercice, phase };
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatexQuellePrimitive(exercice, phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const aideCommun = {
    estPremierEcran,
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
        <h1 className="app-title">Quelle primitive ? (condition initiale)</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionQuellePrimitive(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifQuellePrimitive(etat)} />
        <EtapeChampsCalculPrimitives
          key={phase}
          {...aideCommun}
          consigneGenerale={consigneGeneraleQuellePrimitive()}
          blocDonnees={blocDonneesQuellePrimitive(exercice)}
          etatActuel={null}
          consigneEcran={consigneEcranQuellePrimitive(exercice, phase)}
          champs={champsQuellePrimitive(exercice, phase)}
          aideNiveau1={aideNiveau1QuellePrimitive(exercice, phase)}
          aideNiveau2={aideNiveau2QuellePrimitive(exercice, phase)}
          diagnostiquer={(valeurs) => diagnostiquerEcranQuellePrimitive(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
        />
      </main>
    </div>
  );
}
