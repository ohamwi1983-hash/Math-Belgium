import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLongueurArc } from "./generateurs6e/longueurArc";
import type { IdVarianteLongueurArc } from "./generateurs6e/longueurArc";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionCalculLongueurArc, soumettreReponseEcran } from "./moteur6e/sessionLongueurArc";
import type { EtatSessionLongueurArc, PhaseLongueurArc } from "./moteur6e/typesLongueurArc";
import { diagnostiquerEcran } from "./moteur6e/verificationLongueurArc";
import { EtapeChampsLongueurArc } from "./components6e/EtapeChampsLongueurArc";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { LIBELLE_PHASE, blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatLongueurArc";
import { calculerRecapitulatifLongueurArc, calculerSegmentsProgressionLongueurArc } from "./ui6e/recapitulatifLongueurArc";
import { figureLongueurArcSvg } from "./ui6e/figureLongueurArc";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen28` — Longueur d'un arc de courbe (chapitre 4, "Intégrales et primitives"). Même patron que
 * `App6gen23.tsx`/`App6gen26.tsx` : un dispatcher générique piloté par `ui6e/formatLongueurArc.ts`/
 * `moteur6e/verificationLongueurArc.ts`, PAS de JSX par famille/écran. Contrairement à 6gen26, PAS
 * d'écran "add-as-needed" (racines de taille variable) : tous les écrans sont de la saisie libre à
 * arité FIXE (1 à 2 champs), donc un seul composant écran suffit
 * (`EtapeChampsLongueurArc`, jamais besoin d'un `EtapeRacinesLongueurArc` dédié).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionLongueurArc {
  return demarrerSessionCalculLongueurArc(REGLAGES_DEMO, genererExerciceLongueurArc);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions de génération que l'adaptateur
 * d'export (`generateurs6e/longueurArc/exportEvaluation.ts`) ; la suite de la session reste un tirage
 * normal. */
function sessionInitiale(): EtatSessionLongueurArc {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionCalculLongueurArc(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceLongueurArc, (id) => construireAvecVarianteId(id as IdVarianteLongueurArc)));
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLongueurArc;
  revele: boolean;
}

export function App6gen28() {
  const [etat, setEtat] = useState<EtatSessionLongueurArc>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, jamais dans le moteur. Remis à vide à chaque nouvel exercice/variante forcée, comme
   * `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Numéro de l'exercice affiché : entre dans la `key` de l'écran, pour que les champs soient
   * vidés après « Générer » même quand le nouvel exercice commence sur la même phase. */
  const [numeroExercice, setNumeroExercice] = useState(0);

  /** `phaseFermee` est TOUJOURS l'ancien `etat.phase` — réutilise `calculerRecapitulatifLongueurArc`
   * pour la réponse ATTENDUE. Garde sur le libellé : le dernier écran de l'exercice n'avance jamais
   * `etat.phase` au-delà de lui-même, donc SANS cette garde on repousserait l'entrée de l'écran
   * PRÉCÉDENT une seconde fois (bug déjà rencontré sur la référence 4e, `AppAnalyseFonction.tsx`). */
  function ajouterHistorique(phaseFermee: PhaseLongueurArc, votreReponse: ReactNode, nouvelEtat: EtatSessionLongueurArc) {
    const recap = calculerRecapitulatifLongueurArc(nouvelEtat);
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

  function terminerEtape(nouvelEtat: EtatSessionLongueurArc, votreReponse?: ReactNode) {
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
      setNumeroExercice((n) => n + 1);
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
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionCalculLongueurArc(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteLongueurArc)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen26.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen28?: unknown }).__debug6gen28 = { exercice, phase };
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
        <h1 className="app-title">Longueur d'un arc de courbe</h1>
        <p className="app-subtitle">Chapitre 4 — Intégrales et primitives</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionLongueurArc(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLongueurArc(etat)} />
        <EtapeChampsLongueurArc
          key={`${numeroExercice}-${phase}`}
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

        {enAttente?.etatSuivant.terminee && (
          <figure style={{ margin: "1rem 0 0", textAlign: "center" }} aria-label="Figure de l'exercice">
            <div dangerouslySetInnerHTML={{ __html: figureLongueurArcSvg(exercice) }} />
          </figure>
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
