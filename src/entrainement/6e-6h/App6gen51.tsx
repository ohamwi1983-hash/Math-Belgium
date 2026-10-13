import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiNormale } from "./generateurs6e/loiNormale";
import type { IdVarianteLoiNormale } from "./generateurs6e/loiNormale";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionLoiNormale, soumettreReponseEcran } from "./moteur6e/sessionLoiNormale";
import type { EtatSessionLoiNormale } from "./moteur6e/typesLoiNormale";
import { diagnostiquerEcran } from "./moteur6e/verificationLoiNormale";
import { EtapeChampsLoiNormale } from "./components6e/EtapeChampsLoiNormale";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, calculerReferenceLoiNormale, champsEcran, consigneEcran, consigneGenerale, niveauAideMaxEcran, formatReponseAttenduePhaseLatex, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatLoiNormale";
import { calculerRecapitulatifLoiNormale, calculerSegmentsProgressionLoiNormale } from "./ui6e/recapitulatifLoiNormale";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

/**
 * `6gen51` — Loi normale (premier générateur du nouveau chapitre "Variables aléatoires et lois de
 * probabilités"). Même patron que `App6gen37.tsx` : un dispatcher générique piloté par
 * `ui6e/formatLoiNormale.ts`/`moteur6e/verificationLoiNormale.ts`, PAS de JSX par famille/écran —
 * un SEUL composant écran (`EtapeChampsLoiNormale`, mélange texte/choix) suffit pour toutes les
 * familles (voir en-tête de ce composant pour la justification, différente de 6gen37 qui avait
 * besoin d'un second composant dédié).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLoiNormale {
  return demarrerSessionLoiNormale(REGLAGES_DEMO, genererExerciceLoiNormale, calculerReferenceLoiNormale);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLoiNormale;
  revele: boolean;
}

export function App6gen51() {
  const [etat, setEtat] = useState<EtatSessionLoiNormale>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  // Voir le commentaire sur `key` plus bas (rendu de `EtapeChampsLoiNormale`) : incrémenté à
  // chaque appel de `forcerVariante` UNIQUEMENT (le panneau dev repart toujours d'`indexExercice=0`
  // — `etat.indexExercice` seul ne suffit donc pas à distinguer 2 variantes forcées consécutives
  // partageant le même nom de phase initiale, ex. `A_superieur` puis `A_intervalle`, toutes deux
  // "aEcran1").
  const [nonceForcage, setNonceForcage] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionLoiNormale) {
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
    setNonceForcage((n) => n + 1);
    setEtat(demarrerSessionLoiNormale(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteLoiNormale), calculerReferenceLoiNormale));
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
  // `App6gen37.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen51?: unknown }).__debug6gen51 = { exercice, phase, reference: calculerReferenceLoiNormale(exercice, phase) };
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
        <h1 className="app-title">Loi normale</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionLoiNormale(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLoiNormale(etat)} />
        <EtapeChampsLoiNormale
          // `${indexExercice}-${nonceForcage}-${phase}`, PAS seulement `phase` (à la différence
          // de `App6gen37.tsx`/`App6gen26.tsx`) — 6gen51 est le premier générateur où le NOMBRE
          // DE CHAMPS d'un même nom de phase varie aussi selon le SOUS-TYPE au sein de la MÊME
          // famille (ex. famille A "aEcran1" : 2 champs pour inferieur/superieur, 4 pour
          // intervalle) : 2 exercices CONSÉCUTIFS de la famille A avec des sous-types différents
          // partagent le même nom de phase ("aEcran1") sans que React ne remonte le composant
          // (clé inchangée) — l'état interne `valeurs` (`useState`, initialisé une seule fois à
          // la taille de `champs` du PREMIER montage) resterait alors à l'ANCIENNE taille,
          // cassant silencieusement la saisie des champs additionnels (bug trouvé et corrigé en
          // vérification Playwright, voir `docs/historique-6e.md`). `indexExercice` change à
          // CHAQUE nouvel exercice de la progression NATURELLE (jamais lors d'une simple
          // tentative ratée sur le même écran, qui doit continuer à préserver la saisie déjà
          // tapée) — mais repart TOUJOURS de 0 pour une variante forcée depuis le panneau dev,
          // d'où `nonceForcage` en complément (voir sa déclaration ci-dessus).
          key={`${etat.indexExercice}-${nonceForcage}-${phase}`}
          {...aideCommun}
          estPremierEcran={estPremierEcran}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          etatActuel={null}
          consigneEcran={consigneEcran(exercice, phase)}
          champs={champsEcran(exercice, phase)}
          aideNiveau1={formatAideNiveau1(exercice, phase)}
          aideNiveau2={formatAideNiveau2(exercice, phase)}
          diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs, calculerReferenceLoiNormale(exercice, phase))}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
        />
      </main>
    </div>
  );
}
