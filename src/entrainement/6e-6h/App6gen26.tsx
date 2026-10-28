import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCalculAires } from "./generateurs6e/calculAires";
import type { IdVarianteCalculAires } from "./generateurs6e/calculAires";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionCalculAires, soumettreReponseEcran } from "./moteur6e/sessionCalculAires";
import type { EtatSessionCalculAires, PhaseCalculAires } from "./moteur6e/typesCalculAires";
import { diagnostiquerEcran } from "./moteur6e/verificationCalculAires";
import { EtapeChampsCalculAires } from "./components6e/EtapeChampsCalculAires";
import { EtapeRacinesCalculAires } from "./components6e/EtapeRacinesCalculAires";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { LIBELLE_PHASE, blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatCalculAires";
import { calculerRecapitulatifCalculAires, calculerSegmentsProgressionCalculAires } from "./ui6e/recapitulatifCalculAires";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen26` — Calcul d'aires par intégrale (chapitre 4, "Intégrales et primitives"). Même patron que
 * `App6gen23.tsx` (6gen23) : un dispatcher générique piloté par `ui6e/formatCalculAires.ts`/
 * `moteur6e/verificationCalculAires.ts`, PAS de JSX par famille/écran — SAUF pour les 3 écrans
 * "racines" (bEcran1/cEcran1/dEcran1), rendus par un composant add-as-needed DÉDIÉ
 * (`EtapeRacinesCalculAires`) plutôt que le composant générique à champs fixes
 * (`EtapeChampsCalculAires`), un ensemble de racines étant de taille variable par nature (convention
 * CLAUDE.md "add-as-needed").
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionCalculAires {
  return demarrerSessionCalculAires(REGLAGES_DEMO, genererExerciceCalculAires);
}

const ECRANS_RACINES: PhaseCalculAires[] = ["bEcran1", "cEcran1", "dEcran1"];

const NOMBRE_INITIAL_RACINES: Partial<Record<PhaseCalculAires, number>> = { bEcran1: 2, cEcran1: 3, dEcran1: 2 };

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionCalculAires;
  revele: boolean;
}

export function App6gen26() {
  const [etat, setEtat] = useState<EtatSessionCalculAires>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, jamais dans le moteur. Remis à vide à chaque nouvel exercice/variante forcée, comme
   * `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** `phaseFermee` est TOUJOURS l'ancien `etat.phase` — réutilise `calculerRecapitulatifCalculAires`
   * pour la réponse ATTENDUE. Garde sur le libellé : le dernier écran de l'exercice n'avance jamais
   * `etat.phase` au-delà de lui-même, donc SANS cette garde on repousserait l'entrée de l'écran
   * PRÉCÉDENT une seconde fois (bug déjà rencontré sur la référence 4e, `AppAnalyseFonction.tsx`). */
  function ajouterHistorique(phaseFermee: PhaseCalculAires, votreReponse: ReactNode, nouvelEtat: EtatSessionCalculAires) {
    const recap = calculerRecapitulatifCalculAires(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere || derniere.libelle !== LIBELLE_PHASE[phaseFermee]) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? (
          <span className="equation-box-termes">{(derniere.valeurs ?? [derniere.valeur]).map((f, i) => <Katex key={i} expression={f} />)}</span>
        ) : undefined,
      },
    ]);
  }

  function terminerEtape(nouvelEtat: EtatSessionCalculAires, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(etat.phase, votreReponse, nouvelEtat);
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
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
    setFicheOuverteIndex(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionCalculAires(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteCalculAires)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen23.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen26?: unknown }).__debug6gen26 = { exercice, phase };
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
        <h1 className="app-title">Calcul d'aires par intégrale</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionCalculAires(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifCalculAires(etat)} />
        {ECRANS_RACINES.includes(phase) && (
          <EtapeRacinesCalculAires
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            consigneEcran={consigneEcran(exercice, phase)}
            placeholder="ex : 2"
            labelAjout="+ Ajouter une racine"
            nombreInitial={NOMBRE_INITIAL_RACINES[phase] ?? 2}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs.join(" ; "))}
          />
        )}

        {!ECRANS_RACINES.includes(phase) && (
          <EtapeChampsCalculAires
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champsEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs.join(" ; "))}
          />
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
