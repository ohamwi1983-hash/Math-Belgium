import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCercles } from "./generateurs6e/cercles";
import type { IdVarianteCercles } from "./generateurs6e/cercles";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionCercles, soumettreReponseEcran } from "./moteur6e/sessionCercles";
import type { EtatSessionCercles } from "./moteur6e/typesCercles";
import { diagnostiquerEcran } from "./moteur6e/verificationCercles";
import { SEPARATEUR_CENTRES_B } from "./moteur6e/verificationCercles";
import { EtapeChampsCercles } from "./components6e/EtapeChampsCercles";
import { EtapeListeCentresCercles } from "./components6e/EtapeListeCentresCercles";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, labelListeCentresB, labelRayonB, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatCercles";
import type { ChampDef } from "./ui6e/formatCercles";
import { calculerRecapitulatifCercles, calculerSegmentsProgressionCercles } from "./ui6e/recapitulatifCercles";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen55` — Cercles. Générateur D'OUVERTURE du chapitre "Lieux géométriques" (voir
 * `docs/historique-6e.md`). Même patron que `App6gen43.tsx`/`App6gen46.tsx` : un dispatcher
 * générique piloté par `ui6e/formatCercles.ts`/`moteur6e/verificationCercles.ts`, PAS de JSX par
 * famille/écran — SAUF `bEcran3` (famille B, écran 3), qui bascule vers un composant DÉDIÉ
 * (`EtapeListeCentresCercles`, liste add-as-needed des 2 centres) plutôt que le composant générique
 * `champs: ChampDef[]` (incompatible avec une liste de taille variable).
 *
 * Validation INLINE même écran (rollout UX approuvé) — `enAttente`/`terminerEtape`/`ValidationEcran`,
 * mirroir exact `App6gen13.tsx`/`App6gen12.tsx` : plus de `ResultatPanelCercles`/
 * `ResumeSessionCercles` séparés, la réponse attendue de l'écran qui vient de se clore
 * (`formatReponseAttenduePhaseLatex(exercice, etat.phase)`) s'affiche À LA PLACE du bouton "Valider",
 * jamais sur un écran distinct.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionCercles {
  return demarrerSessionCercles(REGLAGES_DEMO, genererExerciceCercles);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionCercles;
  revele: boolean;
}

/** Formate la réponse de l'élève pour un écran `EtapeChampsCercles` (`champs`/`valeurs` apparié par
 * index, aucune variante `choix` dans ce générateur) en une ligne lisible "label = valeur" (ou
 * "label : valeur" si le label ne se termine pas déjà par `=`/`:`). */
function formatVotreReponseChamps(champs: ChampDef[], valeurs: string[]): string {
  return champs
    .map((champ, i) => {
      const valeur = valeurs[i] ?? "";
      const label = champ.label.trim();
      return /[=:]$/.test(label) ? `${label} ${valeur}` : `${label} : ${valeur}`;
    })
    .join(" ; ");
}

/** Formate la réponse de l'élève pour l'écran dédié `EtapeListeCentresCercles` (famille B,
 * `bEcran3`) — `valeurs` encode la liste des centres PUIS `SEPARATEUR_CENTRES_B` PUIS le rayon
 * (convention imposée par le moteur, voir `EtapeListeCentresCercles.tsx`). */
function formatVotreReponseListeCentres(valeurs: string[]): string {
  const idx = valeurs.indexOf(SEPARATEUR_CENTRES_B);
  const centres = idx === -1 ? valeurs : valeurs.slice(0, idx);
  const rayon = idx === -1 ? "" : valeurs[idx + 1] ?? "";
  return `${labelListeCentresB()} ${centres.join(", ")} ; ${labelRayonB()} ${rayon}`;
}

export function App6gen55() {
  const [etat, setEtat] = useState<EtatSessionCercles>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionCercles`, jamais dans le moteur : la saisie de l'élève n'a
   * aucune autre utilité une fois l'écran clos. Remis à vide à chaque nouvel exercice, comme
   * `enAttente` — mirroir `AppAnalyseFonction.tsx` (4e). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Réutilise `calculerRecapitulatifCercles` (même mécanisme que `RecapitulatifPanel`) pour la
   * réponse ATTENDUE : l'entrée qui vient d'être ajoutée est toujours la DERNIÈRE du tableau, les
   * écrans se closent dans l'ordre. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionCercles) {
    const recap = calculerRecapitulatifCercles(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? (
          <span className="equation-box-termes">
            {(derniere.valeurs ?? [derniere.valeur]).map((v, i) => (
              <Katex key={i} expression={v} />
            ))}
          </span>
        ) : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'écran se clôt RÉELLEMENT
   * (`transitionDEcran`) — jamais à chaque clic sur "Valider" : tant qu'il reste des tentatives, une
   * réponse fausse renvoie un état où `etapeCourante.terminee` reste `false` SANS clore l'écran, et
   * `onValider`/`soumettreReponseEcran` sont quand même rappelés à CHAQUE tentative. Même garde que
   * `AppAnalyseFonction.tsx` (4e) — piège déjà documenté CLAUDE.md. */
  function terminerEtape(nouvelEtat: EtatSessionCercles, votreReponse?: ReactNode) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen43/6gen46 répliqué à l'identique.
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
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
      setFicheOuverteIndex(null);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionCercles(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteCercles)));
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
    (window as unknown as { __debug6gen55?: unknown }).__debug6gen55 = { exercice, phase };
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

  const estEcranListeCentresB = exercice.famille === "B" && phase === "bEcran3";

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Cercles</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionCercles(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifCercles(etat)} />
        {estEcranListeCentresB && (
          <EtapeListeCentresCercles
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            consigneEcran={consigneEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), formatVotreReponseListeCentres(valeurs))}
          />
        )}
        {!estEcranListeCentresB && (
          <EtapeChampsCercles
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champsEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), formatVotreReponseChamps(champsEcran(exercice, phase), valeurs))}
          />
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
