import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBinomialeSequenceOrdonnee } from "./generateurs6e/binomialeSequenceOrdonnee";
import type { IdVarianteBinomialeSequenceOrdonnee } from "./generateurs6e/binomialeSequenceOrdonnee";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionBinomialeSequenceOrdonnee, soumettreReponseEcran } from "./moteur6e/sessionBinomialeSequenceOrdonnee";
import type { EtatSessionBinomialeSequenceOrdonnee } from "./moteur6e/typesBinomialeSequenceOrdonnee";
import { diagnostiquerEcran } from "./moteur6e/verificationBinomialeSequenceOrdonnee";
import { EtapeChampsBinomialeSequenceOrdonnee } from "./components6e/EtapeChampsBinomialeSequenceOrdonnee";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, formatReponseAttenduePhaseLatex, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatBinomialeSequenceOrdonnee";

/**
 * `6gen48` — Probabilité binomiale et séquence exacte sans remise. Même patron que
 * `App6gen43.tsx`/`App6gen44.tsx` : un dispatcher générique piloté par
 * `ui6e/formatBinomialeSequenceOrdonnee.ts`/`moteur6e/verificationBinomialeSequenceOrdonnee.ts`,
 * PAS de JSX par famille/écran — un SEUL composant écran (`EtapeChampsBinomialeSequenceOrdonnee`)
 * gère À LA FOIS les champs texte libre ET l'écran de choix (famille A écran 1, "stratégie"),
 * piloté entièrement par `champs: ChampDef[]`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionBinomialeSequenceOrdonnee {
  return demarrerSessionBinomialeSequenceOrdonnee(REGLAGES_DEMO, genererExerciceBinomialeSequenceOrdonnee);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionBinomialeSequenceOrdonnee;
  revele: boolean;
}

export function App6gen48() {
  const [etat, setEtat] = useState<EtatSessionBinomialeSequenceOrdonnee>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionBinomialeSequenceOrdonnee) {
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
    setEtat(demarrerSessionBinomialeSequenceOrdonnee(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteBinomialeSequenceOrdonnee)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen43.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen48?: unknown }).__debug6gen48 = { exercice, phase };
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Probabilité binomiale et séquence exacte</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <EtapeChampsBinomialeSequenceOrdonnee
          // `${etat.generationId}-${phase}`, JAMAIS `phase` seul — voir `generationId`
          // (`moteur6e/typesBinomialeSequenceOrdonnee.ts`/`sessionBinomialeSequenceOrdonnee.ts`) :
          // bug trouvé en vérification Playwright, 2 exercices consécutifs de famille B avec un
          // `k` différent peuvent partager la MÊME phase de départ ("bEcran1"), auquel cas `phase`
          // seul comme clé ne force pas de remontage et l'état interne `valeurs` (mauvaise
          // longueur) reste collé à l'ancien exercice.
          key={`${etat.generationId}-${phase}`}
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
      </main>
    </div>
  );
}
