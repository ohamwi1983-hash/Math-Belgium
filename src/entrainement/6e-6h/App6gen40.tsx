import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTransformationsPlan } from "./generateurs6e/transformationsPlan";
import type { IdVarianteTransformationsPlan } from "./generateurs6e/transformationsPlan";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionTransformationsPlan, soumettreReponseEcran } from "./moteur6e/sessionTransformationsPlan";
import type { EtatSessionTransformationsPlan } from "./moteur6e/typesTransformationsPlan";
import { tentativesMaxPhase } from "./moteur6e/typesTransformationsPlan";
import type { ExerciceTransformationsPlan } from "./core6e/transformationsPlan.types";
import { diagnostiquerEcran } from "./moteur6e/verificationTransformationsPlan";
import { Katex } from "./components/Katex";
import { EtapeChampsTransformationsPlan } from "./components6e/EtapeChampsTransformationsPlan";
import { EtapeChoixFormuleTransformationsPlan } from "./components6e/EtapeChoixFormuleTransformationsPlan";
import { EtapeImagesTransformationsPlan } from "./components6e/EtapeImagesTransformationsPlan";
import { PlanArgandMini } from "./components6e/PlanArgandMini";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  blocDonnees,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  niveauAideMaxEcran,
  optionsFormuleA,
  optionsNatureD,
  nomPoint,
  PLACEHOLDER_IMAGE,
  LIBELLE_PHASE,
  aideNiveau1 as formatAideNiveau1,
  aideNiveau2 as formatAideNiveau2,
} from "./ui6e/formatTransformationsPlan";
import { calculerRecapitulatifTransformationsPlan, calculerSegmentsProgressionTransformationsPlan } from "./ui6e/recapitulatifTransformationsPlan";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen40` — Transformations du plan via les nombres complexes (chapitre 7, "Nombres complexes",
 * suite du chapitre après `6gen34`/`6gen35`/`6gen37`/`6gen38`). Même patron que `App6gen37.tsx` : un
 * dispatcher générique piloté par `ui6e/formatTransformationsPlan.ts`/
 * `moteur6e/verificationTransformationsPlan.ts`, PAS de JSX par famille/écran — SAUF les écrans de
 * CHOIX (`aEcran1` formules, `dEcran1` natures — une seule tentative) et `cEcran3` (add-as-needed
 * "images des autres points"), rendus par leur composant dédié.
 *
 * Audit 6e ch. 5 (lot D) : compteur de génération dans la `key` des écrans (un nouvel exercice qui
 * recommence sur la même phase remonte bien le composant, champs vidés) ; tentatives par phase
 * (`tentativesMaxPhase`) ; petit plan complexe d'énoncé pour les familles C et D (décision K).
 */

/** Figure d'énoncé (décision K) : famille C — A et son image B par la rotation, plus les autres
 * points donnés (leurs images restent à trouver) ; famille D — deux points (O et le point U
 * d'affixe 1) et leurs images, qui matérialisent l'action de z′ = az + b sans désigner le centre. */
function figureEnonce(exercice: ExerciceTransformationsPlan) {
  if (exercice.famille === "C") {
    return (
      <PlanArgandMini
        points={[
          { x: exercice.zA.a, y: exercice.zA.b, label: "A" },
          { x: exercice.zB.a, y: exercice.zB.b, label: "B", role: "image" },
          ...exercice.autresPoints.map((p, i) => ({ x: p.a, y: p.b, label: nomPoint(i) })),
        ]}
        fleches={[{ de: [exercice.zA.a, exercice.zA.b], vers: [exercice.zB.a, exercice.zB.b] }]}
        legende="B est l'image de A par la rotation de centre O cherchée."
      />
    );
  }
  if (exercice.famille === "D") {
    const imageU = { a: exercice.a.a + exercice.b.a, b: exercice.a.b + exercice.b.b };
    return (
      <PlanArgandMini
        points={[
          { x: exercice.b.a, y: exercice.b.b, label: "O′", role: "image" },
          { x: 1, y: 0, label: "U" },
          { x: imageU.a, y: imageU.b, label: "U′", role: "image" },
        ]}
        fleches={[
          { de: [0, 0], vers: [exercice.b.a, exercice.b.b] },
          { de: [1, 0], vers: [imageU.a, imageU.b] },
        ]}
        legende="U a pour affixe 1 ; O′ et U′ sont les images de O et de U."
      />
    );
  }
  return undefined;
}

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionTransformationsPlan {
  return demarrerSessionTransformationsPlan(REGLAGES_DEMO, genererExerciceTransformationsPlan);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions de génération que l'adaptateur
 * d'export (`generateurs6e/transformationsPlan/exportEvaluation.ts`) ; la suite de la session reste un tirage normal. */
function sessionInitiale(): EtatSessionTransformationsPlan {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionTransformationsPlan(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceTransformationsPlan, (id) => construireAvecVarianteId(id as IdVarianteTransformationsPlan)));
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionTransformationsPlan;
  revele: boolean;
}

export function App6gen40() {
  const [etat, setEtat] = useState<EtatSessionTransformationsPlan>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionTransformationsPlan` (voir `App6gen39.tsx`, même mécanisme). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [aideUtiliseeFermees, setAideUtiliseeFermees] = useState<boolean[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur de génération (audit 6e ch. 5, point commun 9) : incrémenté à chaque nouvel exercice
   * (« Nouvel exercice » ou « Générer »), il entre dans la `key` des écrans. */
  const [generation, setGeneration] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionTransformationsPlan, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        const revele = nouvelEtat.derniereTransitionRevelee;
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE[etat.phase],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? (
              <span className="equation-box-termes">
                {formatReponseAttenduePhaseLatex(etat.exerciceCourant, etat.phase).map((frag, i) => (
                  <Katex key={i} expression={frag} />
                ))}
              </span>
            ) : undefined,
          },
        ]);
        setAideUtiliseeFermees((a) => [...a, etat.niveauAide > 0]);
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
      setAideUtiliseeFermees([]);
      setGeneration((g) => g + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeFermees([]);
    setGeneration((g) => g + 1);
    setEtat(demarrerSessionTransformationsPlan(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteTransformationsPlan)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen37.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen40?: unknown }).__debug6gen40 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: tentativesMaxPhase(phase, etat.reglages.tentativesMax),
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, niveauAideMaxEcran(exercice, phase)),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

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

  const estEcranChoixFormule = exercice.famille === "A" && phase === "aEcran1";
  const estEcranChoixNature = exercice.famille === "D" && phase === "dEcran1";
  const estEcranImages = exercice.famille === "C" && phase === "cEcran3";
  const cleEcran = `${generation}-${phase}`;
  const figure = figureEnonce(exercice);

  const segmentsBase = calculerSegmentsProgressionTransformationsPlan(etat);
  const segments = segmentsBase.map((s, i) => (s === "correcte" && aideUtiliseeFermees[i] ? ("aide" as const) : s));

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Transformations du plan via les nombres complexes</h1>
        <p className="app-subtitle">Chapitre 5 — Nombres complexes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifTransformationsPlan(etat)} />
        {estEcranChoixFormule && exercice.famille === "A" && (
          <EtapeChoixFormuleTransformationsPlan
            key={cleEcran}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            consigneEcran={consigneEcran(exercice, phase)}
            options={optionsFormuleA(exercice.parametres.sousType, exercice.ordreOptions)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(id) =>
              terminerEtape(
                soumettreReponseEcran(etat, [id]),
                <Katex expression={optionsFormuleA(exercice.parametres.sousType, exercice.ordreOptions).find((o) => o.id === id)?.latex ?? id} />,
              )
            }
            validation={validation}
          />
        )}

        {estEcranChoixNature && exercice.famille === "D" && (
          <EtapeChoixFormuleTransformationsPlan
            key={cleEcran}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            figure={figure}
            consigneEcran={consigneEcran(exercice, phase)}
            options={optionsNatureD(exercice)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]), optionsNatureD(exercice).find((o) => o.id === id)?.label ?? id)}
            validation={validation}
          />
        )}

        {estEcranImages && exercice.famille === "C" && (
          <EtapeImagesTransformationsPlan
            key={cleEcran}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            consigneEcran={consigneEcran(exercice, phase)}
            figure={figure}
            nombreMaxPoints={exercice.autresPoints.length}
            placeholder={PLACEHOLDER_IMAGE}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs.join(" ; "))}
            validation={validation}
          />
        )}

        {!estEcranChoixFormule && !estEcranChoixNature && !estEcranImages && (
          <EtapeChampsTransformationsPlan
            key={cleEcran}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            consigneEcran={consigneEcran(exercice, phase)}
            figure={figure}
            champs={champsEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) =>
              terminerEtape(
                soumettreReponseEcran(etat, valeurs),
                champsEcran(exercice, phase)
                  .map((c, i) => `${c.label} ${c.options?.find((o) => o.valeur === valeurs[i])?.label ?? valeurs[i]}`)
                  .join(" ; "),
              )
            }
            validation={validation}
          />
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
