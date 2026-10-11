import { useState } from "react";
import type { ExerciceColinearite } from "./core/colinearite.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionColinearite,
  soumettreReponseConstructionAvecX,
  soumettreReponseConstructionVecteurs,
  soumettreReponseReduction,
  soumettreReponseReductionAvecX,
  soumettreReponseResolution,
  soumettreReponseResolutionAvecX,
  soumettreReponseTest,
} from "./moteur/sessionColinearite";
import type { EtatSessionColinearite, PhaseColinearite } from "./moteur/typesColinearite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceColinearite } from "./generateurs/colinearite";
import type { VarianteColinearite } from "./core/colinearite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeTestColinearite } from "./components/EtapeTestColinearite";
import { EtapeConstructionVecteursColinearite } from "./components/EtapeConstructionVecteursColinearite";
import { EtapeConstructionAvecXColinearite } from "./components/EtapeConstructionAvecXColinearite";
import { EtapeReductionColinearite } from "./components/EtapeReductionColinearite";
import { EtapeReductionAvecXColinearite } from "./components/EtapeReductionAvecXColinearite";
import { EtapeResolutionColinearite } from "./components/EtapeResolutionColinearite";
import { EtapeResolutionAvecXColinearite } from "./components/EtapeResolutionAvecXColinearite";
import { conclusionAttendue, critereReel } from "./moteur/verificationColinearite";
import { formatComposantesLinMatriceLatex, formatComposantesMatriceLatex, formatEquationReduiteLatex, LIBELLES_OUI_NON } from "./ui/formatColinearite";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionColinearite {
  return demarrerSessionColinearite(REGLAGES_DEMO, genererExerciceColinearite);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionColinearite;
  revele: boolean;
}

/** Révélation de la construction (V3/V4-écran1) — les vraies composantes de AB/AC, jamais la
 * saisie de l'élève. */
function revelationConstruction(exercice: ExerciceColinearite) {
  if (exercice.variante === "points") {
    return (
      <Katex
        expression={`\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesMatriceLatex(exercice.vecteurAC)} \\end{gathered}`}
      />
    );
  }
  if (exercice.variante === "pointsParametre") {
    return (
      <Katex
        expression={`\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAC)} \\end{gathered}`}
      />
    );
  }
  return null;
}

/** Révélation de la résolution (V2/V4 dernier écran) — les 3 cas (unique/identité/contradiction). */
function revelationResolution(exercice: ExerciceColinearite) {
  if (exercice.variante !== "parametre" && exercice.variante !== "pointsParametre") return null;
  if (exercice.typeSolution === "unique") return <Katex expression={`x = ${exercice.solutionX}`} />;
  if (exercice.typeSolution === "identite") return <span>Tout x convient (une infinité de solutions).</span>;
  return <span>Aucun x ne convient (aucune solution).</span>;
}

/** Révélation de l'écran "Test de colinéarité" (V1/V3, phase "test" uniquement). */
function revelationTest(exercice: ExerciceColinearite) {
  if (exercice.variante !== "vecteurs" && exercice.variante !== "points") return null;
  return (
    <>
      Critère attendu : {critereReel(exercice)} — Conclusion attendue :{" "}
      {conclusionAttendue(exercice) ? LIBELLES_OUI_NON.positif : LIBELLES_OUI_NON.negatif}
    </>
  );
}

/**
 * Réponse attendue de l'écran qui vient de se clore (`etat.phase`) — réplique les 4 blocs
 * `answer-reveal` de `ResultatPanelColinearite`, scindés par phase au lieu de par score nul : la
 * narrowing sur `exercice.variante` reste nécessaire pour les signatures `formatEquationReduiteLatex`/
 * `critereReel`/`conclusionAttendue`, qui attendent la forme spécifique à la variante.
 */
function construireReponseAttendue(etat: EtatSessionColinearite, exercice: ExerciceColinearite) {
  if (exercice.variante === "points") {
    if (etat.phase === "constructionVecteurs") return revelationConstruction(exercice);
    if (etat.phase === "test") return revelationTest(exercice);
  }
  if (exercice.variante === "vecteurs") {
    if (etat.phase === "test") return revelationTest(exercice);
  }
  if (exercice.variante === "parametre") {
    if (etat.phase === "reduction")
      return (
        <>
          Équation attendue : <Katex expression={formatEquationReduiteLatex(exercice)} />
        </>
      );
    if (etat.phase === "resolution") return <>Solution attendue : {revelationResolution(exercice)}</>;
  }
  if (exercice.variante === "pointsParametre") {
    if (etat.phase === "constructionAvecX") return revelationConstruction(exercice);
    if (etat.phase === "reductionAvecX")
      return (
        <>
          Équation attendue : <Katex expression={formatEquationReduiteLatex(exercice)} />
        </>
      );
    if (etat.phase === "resolutionAvecX") return <>Solution attendue : {revelationResolution(exercice)}</>;
  }
  return undefined;
}

const LIBELLE_PHASE: Record<PhaseColinearite, string> = {
  constructionVecteurs: "Construction des vecteurs",
  constructionAvecX: "Construction des vecteurs",
  reduction: "Réduction",
  reductionAvecX: "Réduction",
  resolution: "Résolution",
  resolutionAvecX: "Résolution",
  test: "Test de colinéarité",
};

export function AppColinearite() {
  const [etat, setEtat] = useState<EtatSessionColinearite>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionColinearite) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "constructionVecteurs" || etat.phase === "constructionAvecX"
          ? nouvelEtat.constructionRevele
          : etat.phase === "reduction" || etat.phase === "reductionAvecX"
            ? nouvelEtat.reductionRevele
            : etat.phase === "test"
              ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.testRevele
              : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.resolutionRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionColinearite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteColinearite)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : construireReponseAttendue(etat, exercice),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Colinéarité et alignement de points</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
        {etat.phase === "constructionVecteurs" && exercice.variante === "points" ? (
          <EtapeConstructionVecteursColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideConstruction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstructionVecteurs(etat, reponse))}
            validation={validation}
          />
        ) : etat.phase === "constructionAvecX" && exercice.variante === "pointsParametre" ? (
          <EtapeConstructionAvecXColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideConstruction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstructionAvecX(etat, reponse))}
            validation={validation}
          />
        ) : etat.phase === "reduction" && exercice.variante === "parametre" ? (
          <EtapeReductionColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideReduction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseReduction(etat, texte))}
            validation={validation}
          />
        ) : etat.phase === "resolution" && exercice.variante === "parametre" ? (
          <EtapeResolutionColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(valeur) => terminerEtape(soumettreReponseResolution(etat, valeur))}
            validation={validation}
          />
        ) : etat.phase === "reductionAvecX" && exercice.variante === "pointsParametre" ? (
          <EtapeReductionAvecXColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideReduction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseReductionAvecX(etat, texte))}
            validation={validation}
          />
        ) : etat.phase === "resolutionAvecX" && exercice.variante === "pointsParametre" ? (
          <EtapeResolutionAvecXColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(valeur) => terminerEtape(soumettreReponseResolutionAvecX(etat, valeur))}
            validation={validation}
          />
        ) : (exercice.variante === "vecteurs" || exercice.variante === "points") && etat.phase === "test" ? (
          <EtapeTestColinearite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideTest}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseTest(etat, reponse))}
            validation={validation}
          />
        ) : null}
        </div>
      </main>
    </div>
  );
}
