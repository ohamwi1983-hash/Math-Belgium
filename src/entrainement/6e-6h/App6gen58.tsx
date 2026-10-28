import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIdentificationConiques } from "./generateurs6e/identificationConiques";
import type { IdVarianteIdentificationConiques } from "./generateurs6e/identificationConiques";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionIdentificationConiques, soumettreReponseEcran } from "./moteur6e/sessionIdentificationConiques";
import type { EtatSessionIdentificationConiques, PhaseIdentificationConiques } from "./moteur6e/typesIdentificationConiques";
import { phasesPourExercice } from "./moteur6e/typesIdentificationConiques";
import { diagnostiquerEcran } from "./moteur6e/verificationIdentificationConiques";
import { EtapeChampsIdentificationConiques } from "./components6e/EtapeChampsIdentificationConiques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatIdentificationConiques";
import type { ChampDef } from "./ui6e/formatIdentificationConiques";
import { calculerRecapitulatifIdentificationConiques, calculerSegmentsProgressionIdentificationConiques } from "./ui6e/recapitulatifIdentificationConiques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen58` — Identification d'une conique et de ses éléments caractéristiques. GÉNÉRATEUR
 * D'OUVERTURE du chapitre "Les coniques" (voir `docs/historique-6e.md`). Même patron que
 * `App6gen43.tsx`/`App6gen50.tsx` : un dispatcher générique piloté par
 * `ui6e/formatIdentificationConiques.ts`/`moteur6e/verificationIdentificationConiques.ts`, PAS de
 * JSX par famille/écran — un SEUL composant écran (`EtapeChampsIdentificationConiques`) gère à la
 * fois les champs texte libre (y compris les réponses algébriques gardées structurellement) et les
 * écrans de choix, piloté entièrement par `champs: ChampDef[]`.
 *
 * Validation INLINE même écran (rollout UX approuvé) — `enAttente`/`terminerEtape`/`ValidationEcran`,
 * mirroir exact `App6gen13.tsx`/`App6gen12.tsx` : plus de `ResultatPanelIdentificationConiques`/
 * `ResumeSessionIdentificationConiques` séparés.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionIdentificationConiques {
  return demarrerSessionIdentificationConiques(REGLAGES_DEMO, genererExerciceIdentificationConiques);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionIdentificationConiques;
  revele: boolean;
}

/** `champs[i].label` déjà terminé par "=" (ex. "a =", "Catégorie probable =") — un simple "label
 * valeur" suffit donc à produire une phrase courte et lisible. Pour un champ "choix", `valeurs[i]`
 * est la valeur TECHNIQUE de l'option (ex. "ellipseCercleVidePoint"), jamais son libellé affiché —
 * on recherche le libellé correspondant dans `champ.options`. */
function formatVotreReponse(champs: ChampDef[], valeurs: string[]): string {
  return champs
    .map((champ, i) => {
      const valeur = champ.type === "choix" ? champ.options?.find((o) => o.valeur === valeurs[i])?.label ?? valeurs[i] : valeurs[i];
      return `${champ.label} ${valeur}`;
    })
    .join(" ; ");
}

export function App6gen58() {
  const [etat, setEtat] = useState<EtatSessionIdentificationConiques>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionIdentificationConiques`, jamais dans le moteur : la saisie de
   * l'élève n'a aucune autre utilité une fois l'écran clos. Remis à vide à chaque nouvel exercice,
   * comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Un écran "aide" s'il a été clos avec `niveauAide>0` — ce générateur ne garde `niveauAide` que
   * pour l'écran COURANT (`EtatSessionIdentificationConiques.scoresPartiels` ne retient que le score (anciennement pénalisé), qui ne permet pas de distinguer "pénalité d'aide" de "pénalité de tentatives" une
   * fois l'écran clos) : capturé ICI au moment précis de la clôture, jamais recalculé depuis le
   * score. */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseIdentificationConiques, boolean>>>({});

  /** Réutilise `calculerRecapitulatifIdentificationConiques` (même mécanisme que le récapitulatif
   * affiché) pour la réponse ATTENDUE : l'entrée qui vient d'être ajoutée est toujours la dernière du
   * tableau, les écrans se closent dans l'ordre. */
  function ajouterHistorique(votreReponse: string, nouvelEtat: EtatSessionIdentificationConiques) {
    const recap = calculerRecapitulatifIdentificationConiques(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? <Katex expression={derniere.valeur} /> : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique (et `aideUtiliseeParPhase` MIS À
   * JOUR) quand l'écran se clôt RÉELLEMENT — jamais à chaque clic sur "Valider" (piège "revele
   * stale"/historique désynchronisé documenté dans la référence 4e, `AppAnalyseFonction.tsx`). */
  function terminerEtape(nouvelEtat: EtatSessionIdentificationConiques, votreReponse?: string) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // `nouvelEtat.phase !== etat.phase` (jamais seulement `nouvelEtat.terminee`) — quand l'écran
      // qui vient de clore est le DERNIER de l'exercice, `cloturerExerciceOuSuivant` renvoie
      // `{...etat, ..., terminee:true}` SANS mettre à jour `phase`/`scoresPartiels` avec le score de
      // cet écran (ils restent ceux d'AVANT cette soumission) : `calculerRecapitulatifXxx(nouvelEtat)`
      // y verrait alors l'écran précédent, pas celui qui vient de clore — même risque de
      // désynchronisation que le bug documenté dans la référence 4e, ici déclenché par la clôture
      // d'exercice plutôt que par une tentative ratée. Sans incidence pratique de toute façon : cet
      // écran est le dernier, sa puce reste "courante" jusqu'au reset du nouvel exercice (jamais
      // cliquable), voir `AppAnalyseFonction.tsx` (`tableauSignes`, jamais de `votreReponse` passé).
      if (votreReponse !== undefined && nouvelEtat.phase !== etat.phase) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      if (etat.niveauAide > 0) {
        setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: true }));
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
      setAideUtiliseeParPhase({});
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParPhase({});
    setEtat(demarrerSessionIdentificationConiques(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteIdentificationConiques)));
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
    // `champs` inclus (en plus de `exercice`/`phase`) — permet à un script Playwright de
    // reconstruire les boutons de choix par leur VALEUR technique (`option.valeur`), jamais par le
    // texte du bouton (fragile, dépend du libellé français affiché).
    (window as unknown as { __debug6gen58?: unknown }).__debug6gen58 = { exercice, phase, champs: champsEcran(exercice, phase) };
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

  // "aide" (puce jaune) remplace "correcte" pour tout écran clos avec `aideUtiliseeParPhase[phase]`
  // — jamais recalculé depuis le score (voir le commentaire de `aideUtiliseeParPhase` ci-dessus).
  const sequencePhases = phasesPourExercice(exercice);
  const segments = calculerSegmentsProgressionIdentificationConiques(etat).map((segment, i) =>
    segment === "correcte" && aideUtiliseeParPhase[sequencePhases[i]] ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Identification d'une conique et de ses éléments caractéristiques</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifIdentificationConiques(etat)} />
        <EtapeChampsIdentificationConiques
          key={phase}
          {...aideCommun}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          consigneEcran={consigneEcran(exercice, phase)}
          champs={champsEcran(exercice, phase)}
          aideNiveau1={formatAideNiveau1(exercice, phase)}
          aideNiveau2={formatAideNiveau2(exercice, phase)}
          diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), formatVotreReponse(champsEcran(exercice, phase), valeurs))}
        />
      </main>
      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
