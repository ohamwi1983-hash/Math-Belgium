import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntersectionsConiques } from "./generateurs6e/intersectionsConiques";
import type { IdVarianteIntersectionsConiques } from "./generateurs6e/intersectionsConiques";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionIntersectionsConiques, soumettreReponseEcran } from "./moteur6e/sessionIntersectionsConiques";
import type { EtatSessionIntersectionsConiques, PhaseIntersectionsConiques } from "./moteur6e/typesIntersectionsConiques";
import { phasesPourExercice } from "./moteur6e/typesIntersectionsConiques";
import { diagnostiquerEcran } from "./moteur6e/verificationIntersectionsConiques";
import { EtapeChampsIntersectionsConiques } from "./components6e/EtapeChampsIntersectionsConiques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatIntersectionsConiques";
import type { ChampDef } from "./ui6e/formatIntersectionsConiques";
import { calculerRecapitulatifIntersectionsConiques, calculerSegmentsProgressionIntersectionsConiques } from "./ui6e/recapitulatifIntersectionsConiques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen61` — Intersections : droite-conique et conique-conique. TROISIÈME générateur du chapitre
 * "Les coniques" (fondation posée par `6gen58`/`6gen59`, voir `docs/historique-6e.md`). Même patron
 * "dispatcher générique" que `App6gen58.tsx`/`App6gen59.tsx` : un SEUL composant écran
 * (`EtapeChampsIntersectionsConiques`) gère à la fois les champs texte libre, les écrans de choix,
 * ET l'écran add-as-needed (famille A, écran 4), piloté entièrement par `champs: ChampDef[]`.
 *
 * Validation INLINE même écran (rollout UX approuvé) — `enAttente`/`terminerEtape`/`ValidationEcran`,
 * mirroir exact `App6gen13.tsx`/`App6gen12.tsx` : plus de `ResultatPanelIntersectionsConiques`/
 * `ResumeSessionIntersectionsConiques` séparés.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionIntersectionsConiques {
  return demarrerSessionIntersectionsConiques(REGLAGES_DEMO, genererExerciceIntersectionsConiques);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionIntersectionsConiques;
  revele: boolean;
}

/** `champs[i].label` déjà terminé par "=" — un simple "label valeur" suffit à produire une phrase
 * courte et lisible ; pour un champ "choix", `valeurs[i]` est la valeur TECHNIQUE de l'option,
 * jamais son libellé affiché — on recherche le libellé correspondant dans `champ.options`. */
function formatVotreReponse(champs: ChampDef[], valeurs: string[]): string {
  return champs
    .map((champ, i) => {
      const valeur = champ.type === "choix" ? champ.options?.find((o) => o.valeur === valeurs[i])?.label ?? valeurs[i] : valeurs[i];
      return `${champ.label} ${valeur}`;
    })
    .join(" ; ");
}

export function App6gen61() {
  const [etat, setEtat] = useState<EtatSessionIntersectionsConiques>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionIntersectionsConiques`, jamais dans le moteur (même principe que
   * `App6gen58.tsx`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Un écran "aide" s'il a été clos avec `niveauAide>0` — capturé ICI au moment précis de la
   * clôture (voir le commentaire équivalent dans `App6gen58.tsx`). */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseIntersectionsConiques, boolean>>>({});

  function ajouterHistorique(votreReponse: string, nouvelEtat: EtatSessionIntersectionsConiques) {
    const recap = calculerRecapitulatifIntersectionsConiques(nouvelEtat);
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

  function terminerEtape(nouvelEtat: EtatSessionIntersectionsConiques, votreReponse?: string) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md.
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // `nouvelEtat.phase !== etat.phase` (jamais seulement `nouvelEtat.terminee`) — voir le
      // commentaire équivalent dans `App6gen58.tsx` (clôture du DERNIER écran d'un exercice :
      // `scoresPartiels`/`phase` de `nouvelEtat` restent ceux d'AVANT cette soumission, sans
      // incidence pratique puisque cette puce reste "courante" jusqu'au reset, jamais cliquable).
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
    setEtat(demarrerSessionIntersectionsConiques(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteIntersectionsConiques)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen58.tsx`/`App6gen59.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen61?: unknown }).__debug6gen61 = { exercice, phase, champs: champsEcran(exercice, phase) };
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

  const sequencePhases = phasesPourExercice(exercice);
  const segments = calculerSegmentsProgressionIntersectionsConiques(etat).map((segment, i) =>
    segment === "correcte" && aideUtiliseeParPhase[sequencePhases[i]] ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Intersections droite-conique et conique-conique</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifIntersectionsConiques(etat)} />
        <EtapeChampsIntersectionsConiques
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
