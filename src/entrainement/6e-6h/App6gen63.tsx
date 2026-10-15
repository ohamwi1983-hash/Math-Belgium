import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesOptiquesConiques } from "./generateurs6e/proprietesOptiquesConiques";
import type { IdVarianteProprietesOptiquesConiques } from "./generateurs6e/proprietesOptiquesConiques";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProprietesOptiquesConiques, soumettreReponseEcran } from "./moteur6e/sessionProprietesOptiquesConiques";
import type { EtatSessionProprietesOptiquesConiques, PhaseProprietesOptiquesConiques } from "./moteur6e/typesProprietesOptiquesConiques";
import { TOUTES_LES_PHASES } from "./moteur6e/typesProprietesOptiquesConiques";
import { diagnostiquerEcran } from "./moteur6e/verificationProprietesOptiquesConiques";
import { EtapeChampsProprietesOptiquesConiques } from "./components6e/EtapeChampsProprietesOptiquesConiques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatProprietesOptiquesConiques";
import type { ChampDef } from "./ui6e/formatProprietesOptiquesConiques";
import { calculerRecapitulatifProprietesOptiquesConiques, calculerSegmentsProgressionProprietesOptiquesConiques } from "./ui6e/recapitulatifProprietesOptiquesConiques";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen63` — Propriétés optiques des coniques. Chapitre "Les coniques", 6e FWB (6h) — générateur DE
 * CLÔTURE du chapitre (voir `docs/historique-6e.md`). Même patron que `App6gen62.tsx` : un
 * dispatcher générique piloté par `ui6e/formatProprietesOptiquesConiques.ts`/`moteur6e/
 * verificationProprietesOptiquesConiques.ts`, PAS de JSX par écran — un SEUL composant écran
 * (`EtapeChampsProprietesOptiquesConiques`) gère tous les champs texte/choix, piloté entièrement par
 * `champs: ChampDef[]`.
 *
 * Validation INLINE même écran (rollout UX approuvé) — `enAttente`/`terminerEtape`/`ValidationEcran`,
 * mirroir exact `App6gen13.tsx`/`App6gen12.tsx` : plus de `ResultatPanelProprietesOptiquesConiques`/
 * `ResumeSessionProprietesOptiquesConiques` séparés.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionProprietesOptiquesConiques {
  return demarrerSessionProprietesOptiquesConiques(REGLAGES_DEMO, genererExerciceProprietesOptiquesConiques);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionProprietesOptiquesConiques;
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

export function App6gen63() {
  const [etat, setEtat] = useState<EtatSessionProprietesOptiquesConiques>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionProprietesOptiquesConiques`, jamais dans le moteur (même principe que
   * `App6gen58.tsx`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Un écran "aide" s'il a été clos avec `niveauAide>0` — capturé ICI au moment précis de la
   * clôture (voir le commentaire équivalent dans `App6gen58.tsx`). Une seule famille, TOUJOURS les
   * 4 écrans `TOUTES_LES_PHASES` (voir `typesProprietesOptiquesConiques.ts`), jamais besoin d'une
   * séquence recalculée par exercice. */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseProprietesOptiquesConiques, boolean>>>({});

  function ajouterHistorique(votreReponse: string, nouvelEtat: EtatSessionProprietesOptiquesConiques) {
    const recap = calculerRecapitulatifProprietesOptiquesConiques(nouvelEtat);
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

  function terminerEtape(nouvelEtat: EtatSessionProprietesOptiquesConiques, votreReponse?: string) {
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
    setEtat(demarrerSessionProprietesOptiquesConiques(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteProprietesOptiquesConiques)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen62.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen63?: unknown }).__debug6gen63 = { exercice, phase, champs: champsEcran(exercice, phase) };
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

  const segments = calculerSegmentsProgressionProprietesOptiquesConiques(etat).map((segment, i) =>
    segment === "correcte" && aideUtiliseeParPhase[TOUTES_LES_PHASES[i]] ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Propriétés optiques des coniques</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifProprietesOptiquesConiques(etat)} />
        <EtapeChampsProprietesOptiquesConiques
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
