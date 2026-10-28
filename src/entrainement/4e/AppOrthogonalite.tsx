import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionOrthogonalite,
  soumettreReponseConclusionTriangle,
  soumettreReponseConstructionAvecXTriangle,
  soumettreReponseConstructionTriangle,
  soumettreReponseIdentificationResolution,
  soumettreReponseReductionParametre,
  soumettreReponseReductionSommet,
  soumettreReponseResolutionParametre,
  soumettreReponseTest,
  soumettreReponseTestSommet,
} from "./moteur/sessionOrthogonalite";
import { SEQUENCES } from "./moteur/typesOrthogonalite";
import type { EtatSessionOrthogonalite, PhaseOrthogonalite, ResultatExerciceOrthogonalite } from "./moteur/typesOrthogonalite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOrthogonalite } from "./generateurs/orthogonalite";
import type { VarianteOrthogonalite } from "./core/orthogonalite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeTestOrthogonalite } from "./components/EtapeTestOrthogonalite";
import { EtapeReductionParametreOrthogonalite } from "./components/EtapeReductionParametreOrthogonalite";
import { EtapeResolutionParametreOrthogonalite } from "./components/EtapeResolutionParametreOrthogonalite";
import { EtapeConstructionTriangleOrthogonalite } from "./components/EtapeConstructionTriangleOrthogonalite";
import { EtapeTestSommetOrthogonalite } from "./components/EtapeTestSommetOrthogonalite";
import { EtapeConclusionTriangleOrthogonalite } from "./components/EtapeConclusionTriangleOrthogonalite";
import { EtapeConstructionAvecXOrthogonalite } from "./components/EtapeConstructionAvecXOrthogonalite";
import { EtapeReductionSommetOrthogonalite } from "./components/EtapeReductionSommetOrthogonalite";
import { EtapeIdentificationResolutionOrthogonalite } from "./components/EtapeIdentificationResolutionOrthogonalite";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifOrthogonalite } from "./ui/recapitulatifOrthogonalite";
import { Katex } from "./components/Katex";
import { conclusionAttendueTest, conclusionAttendueTriangle, conclusionAttendueTriangleParametre, critereReelTest } from "./moteur/verificationOrthogonalite";
import {
  LIBELLES_OUI_NON,
  formatComposantesLinMatriceLatex,
  formatComposantesMatriceLatex,
  formatEquationReduiteParametreLatex,
  formatReductionLatex,
  libelleRectangleEn,
} from "./ui/formatOrthogonalite";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionOrthogonalite {
  return demarrerSessionOrthogonalite(REGLAGES_DEMO, genererExerciceOrthogonalite);
}

/** Réutilise `SEQUENCES` (séquence réelle par variante, déjà exposée par `typesOrthogonalite.ts`)
 * et `etat.scoresAccumules` (déjà rempli à chaque clôture d'écran — `score`/`revele`/`niveauAide`)
 * plutôt qu'une deuxième reconstitution divergente — même patron que `AppNormeDistance`. La
 * dernière phase de chaque séquence n'a jamais besoin d'être lue dans `scoresAccumules` : un nouvel
 * exercice redémarre toujours juste après, donc elle reste "a-venir" jusqu'à devenir "courante" —
 * jamais consultée comme passée. Puces purement visuelles (pas de `onSegmentClick`). */
function calculerSegmentsProgression(etat: EtatSessionOrthogonalite): EtatPuceProgression[] {
  const sequence = SEQUENCES[etat.exerciceCourant.variante];
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const score = etat.scoresAccumules[phase];
    if (!score) return "correcte";
    if (score.revele) return "revele";
    return score.niveauAide > 0 ? "aide" : "correcte";
  });
}

/** Révélation de l'écran `phase` lue sur le résultat déjà clos de l'exercice (le dernier de la
 * séquence de sa variante — voir `scoresAccumules`/`SEQUENCES`, `typesOrthogonalite.ts`). */
function reveleDepuisResultat(resultat: ResultatExerciceOrthogonalite, phase: PhaseOrthogonalite): boolean {
  switch (phase) {
    case "test":
      return resultat.testRevele;
    case "reductionParametre":
      return resultat.reductionParametreRevele;
    case "resolutionParametre":
      return resultat.resolutionParametreRevele;
    case "constructionTriangle":
      return resultat.constructionTriangleRevele;
    case "testSommetA":
      return resultat.testSommetARevele;
    case "testSommetB":
      return resultat.testSommetBRevele;
    case "testSommetC":
      return resultat.testSommetCRevele;
    case "conclusionTriangle":
      return resultat.conclusionTriangleRevele;
    case "constructionAvecX":
      return resultat.constructionAvecXRevele;
    case "reductionSommetA":
      return resultat.reductionSommetARevele;
    case "reductionSommetB":
      return resultat.reductionSommetBRevele;
    case "reductionSommetC":
      return resultat.reductionSommetCRevele;
    case "identificationResolution":
      return resultat.identificationResolutionRevele;
  }
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionOrthogonalite;
  revele: boolean;
}

export function AppOrthogonalite() {
  const [etat, setEtat] = useState<EtatSessionOrthogonalite>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionOrthogonalite) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        nouvelEtat.resultats.length > etat.resultats.length
          ? reveleDepuisResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!, etat.phase)
          : nouvelEtat.scoresAccumules[etat.phase]!.revele;
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

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionOrthogonalite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteOrthogonalite)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const recapitulatif = calculerRecapitulatifOrthogonalite(etat);

  const reponseAttendue =
    phase === "test" && exercice.variante === "test" ? (
      <>
        Critère attendu : {critereReelTest(exercice)} — Conclusion attendue :{" "}
        {conclusionAttendueTest(exercice) ? LIBELLES_OUI_NON.positif : LIBELLES_OUI_NON.negatif}
      </>
    ) : phase === "reductionParametre" && exercice.variante === "parametre" ? (
      <>
        Équation attendue : <Katex expression={formatEquationReduiteParametreLatex(exercice)} />
      </>
    ) : phase === "resolutionParametre" && exercice.variante === "parametre" ? (
      <>
        x attendu : <Katex expression={`x = ${exercice.solutionX}`} />
      </>
    ) : phase === "constructionTriangle" && exercice.variante === "triangle" ? (
      <Katex
        expression={`\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesMatriceLatex(exercice.vecteurAC)} \\\\ \\vec{${exercice.labelB}${exercice.labelC}} = ${formatComposantesMatriceLatex(exercice.vecteurBC)} \\end{gathered}`}
      />
    ) : phase === "testSommetA" && exercice.variante === "triangle" ? (
      <>Critère attendu (sommet {exercice.labelA}) : {exercice.critereA}</>
    ) : phase === "testSommetB" && exercice.variante === "triangle" ? (
      <>Critère attendu (sommet {exercice.labelB}) : {exercice.critereB}</>
    ) : phase === "testSommetC" && exercice.variante === "triangle" ? (
      <>Critère attendu (sommet {exercice.labelC}) : {exercice.critereC}</>
    ) : phase === "conclusionTriangle" && exercice.variante === "triangle" ? (
      <>
        Conclusion attendue :{" "}
        {(() => {
          const sommet = conclusionAttendueTriangle(exercice);
          return sommet === null ? "Pas rectangle" : libelleRectangleEn(sommet, exercice);
        })()}
      </>
    ) : phase === "constructionAvecX" && exercice.variante === "triangleParametre" ? (
      <Katex
        expression={`\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAC)} \\\\ \\vec{${exercice.labelB}${exercice.labelC}} = ${formatComposantesLinMatriceLatex(exercice.vecteurBC)} \\end{gathered}`}
      />
    ) : phase === "reductionSommetA" && exercice.variante === "triangleParametre" ? (
      <>
        Réduction attendue (sommet {exercice.labelA}) : <Katex expression={formatReductionLatex(exercice.reductionA)} />
      </>
    ) : phase === "reductionSommetB" && exercice.variante === "triangleParametre" ? (
      <>
        Réduction attendue (sommet {exercice.labelB}) : <Katex expression={formatReductionLatex(exercice.reductionB)} />
      </>
    ) : phase === "reductionSommetC" && exercice.variante === "triangleParametre" ? (
      <>
        Réduction attendue (sommet {exercice.labelC}) : <Katex expression={formatReductionLatex(exercice.reductionC)} />
      </>
    ) : phase === "identificationResolution" && exercice.variante === "triangleParametre" ? (
      <>
        Sommet attendu : {libelleRectangleEn(conclusionAttendueTriangleParametre(exercice), exercice)} — x attendu :{" "}
        <Katex expression={`x = ${exercice.solutionX}`} />
      </>
    ) : null;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Orthogonalité et théorème de Pythagore généralisé</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {phase === "test" && exercice.variante === "test" ? (
          <EtapeTestOrthogonalite
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseTest(etat, reponse))}
            validation={validation}
          />
        ) : phase === "reductionParametre" && exercice.variante === "parametre" ? (
          <EtapeReductionParametreOrthogonalite
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseReductionParametre(etat, reponse))}
            validation={validation}
          />
        ) : phase === "resolutionParametre" && exercice.variante === "parametre" ? (
          <EtapeResolutionParametreOrthogonalite
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(valeur) => terminerEtape(soumettreReponseResolutionParametre(etat, valeur))}
            validation={validation}
          />
        ) : phase === "constructionTriangle" && exercice.variante === "triangle" ? (
          <EtapeConstructionTriangleOrthogonalite
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstructionTriangle(etat, reponse))}
            validation={validation}
          />
        ) : phase === "testSommetA" && exercice.variante === "triangle" ? (
          <EtapeTestSommetOrthogonalite
            key="A"
            exercice={exercice}
            sommet="A"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(valeur) => terminerEtape(soumettreReponseTestSommet(etat, "A", valeur))}
            validation={validation}
          />
        ) : phase === "testSommetB" && exercice.variante === "triangle" ? (
          <EtapeTestSommetOrthogonalite
            key="B"
            exercice={exercice}
            sommet="B"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(valeur) => terminerEtape(soumettreReponseTestSommet(etat, "B", valeur))}
            validation={validation}
          />
        ) : phase === "testSommetC" && exercice.variante === "triangle" ? (
          <EtapeTestSommetOrthogonalite
            key="C"
            exercice={exercice}
            sommet="C"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(valeur) => terminerEtape(soumettreReponseTestSommet(etat, "C", valeur))}
            validation={validation}
          />
        ) : phase === "conclusionTriangle" && exercice.variante === "triangle" ? (
          <EtapeConclusionTriangleOrthogonalite
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConclusionTriangle(etat, reponse))}
            validation={validation}
          />
        ) : phase === "constructionAvecX" && exercice.variante === "triangleParametre" ? (
          <EtapeConstructionAvecXOrthogonalite
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstructionAvecXTriangle(etat, reponse))}
            validation={validation}
          />
        ) : phase === "reductionSommetA" && exercice.variante === "triangleParametre" ? (
          <EtapeReductionSommetOrthogonalite
            key="A"
            exercice={exercice}
            sommet="A"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseReductionSommet(etat, "A", reponse))}
            validation={validation}
          />
        ) : phase === "reductionSommetB" && exercice.variante === "triangleParametre" ? (
          <EtapeReductionSommetOrthogonalite
            key="B"
            exercice={exercice}
            sommet="B"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseReductionSommet(etat, "B", reponse))}
            validation={validation}
          />
        ) : phase === "reductionSommetC" && exercice.variante === "triangleParametre" ? (
          <EtapeReductionSommetOrthogonalite
            key="C"
            exercice={exercice}
            sommet="C"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseReductionSommet(etat, "C", reponse))}
            validation={validation}
          />
        ) : phase === "identificationResolution" && exercice.variante === "triangleParametre" ? (
          <EtapeIdentificationResolutionOrthogonalite
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(reponse) => terminerEtape(soumettreReponseIdentificationResolution(etat, reponse))}
            validation={validation}
          />
        ) : null}
        </div>
      </main>
    </div>
  );
}
