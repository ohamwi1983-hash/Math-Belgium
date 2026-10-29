import { useState, type ReactNode } from "react";
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
import type { ExerciceOrthogonalite, VarianteOrthogonalite } from "./core/orthogonalite.types";
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
import type {
  ReponseConclusionTriangle,
  ReponseConstructionAvecXTriangle,
  ReponseConstructionTriangle,
  ReponseIdentificationResolution,
  ReponseTest,
} from "./moteur/verificationOrthogonalite";
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
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";

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
 * jamais consultée comme passée. Puces cliquables : chaque écran clos ouvre sa fiche de
 * consultation (`FicheReponseEcran`, même patron que gen5/gen37). Variante "test" (1 seul écran) :
 * aucune barre — une puce unique n'apporte rien (`ProgressionPuces` ne rend rien pour une liste vide). */
function calculerSegmentsProgression(etat: EtatSessionOrthogonalite): EtatPuceProgression[] {
  const sequence = SEQUENCES[etat.exerciceCourant.variante];
  if (sequence.length <= 1) return [];
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

/** Titre de la fiche de consultation d'un écran clos. */
const TITRES_ECRANS: Record<PhaseOrthogonalite, string> = {
  test: "Test d'orthogonalité",
  reductionParametre: "Équation réduite",
  resolutionParametre: "Valeur de x",
  constructionTriangle: "Vecteurs construits",
  testSommetA: "Critère au sommet A",
  testSommetB: "Critère au sommet B",
  testSommetC: "Critère au sommet C",
  conclusionTriangle: "Conclusion",
  constructionAvecX: "Vecteurs construits",
  reductionSommetA: "Réduction — sommet A",
  reductionSommetB: "Réduction — sommet B",
  reductionSommetC: "Réduction — sommet C",
  identificationResolution: "Sommet et valeur de x",
};

type Labels = { labelA: string; labelB: string; labelC: string };

function ouiNon(valeur: boolean): string {
  return valeur ? LIBELLES_OUI_NON.positif : LIBELLES_OUI_NON.negatif;
}

function formatSaisieNombre(valeur: number): string {
  return String(valeur).replace(".", "{,}");
}

function formatSaisieNombreTexte(valeur: number): string {
  return String(valeur).replace(".", ",");
}

/** Saisie libre de l'élève, telle quelle — champ vide affiché « — ». */
function saisieBrute(texte: string): string {
  return texte.trim() === "" ? "—" : texte;
}

function libelleConclusion(sommet: "A" | "B" | "C" | null, labels: Labels): string {
  return sommet === null ? "Pas rectangle" : libelleRectangleEn(sommet, labels);
}

function saisieConstructionTriangle(labels: Labels, reponse: ReponseConstructionTriangle): ReactNode {
  const { labelA, labelB, labelC } = labels;
  const colonne = (x: number, y: number) => `\\begin{pmatrix} ${formatSaisieNombre(x)} \\\\ ${formatSaisieNombre(y)} \\end{pmatrix}`;
  return (
    <Katex
      expression={`\\begin{gathered} \\vec{${labelA}${labelB}} = ${colonne(reponse.abX, reponse.abY)} \\\\ \\vec{${labelA}${labelC}} = ${colonne(reponse.acX, reponse.acY)} \\\\ \\vec{${labelB}${labelC}} = ${colonne(reponse.bcX, reponse.bcY)} \\end{gathered}`}
    />
  );
}

/** Composantes avec x : saisies libres (`2x-1`), affichées telles quelles, jamais réinterprétées. */
function saisieConstructionAvecX(labels: Labels, reponse: ReponseConstructionAvecXTriangle): ReactNode {
  const { labelA, labelB, labelC } = labels;
  return (
    <>
      <p>
        {labelA}
        {labelB} : ({saisieBrute(reponse.abX)} ; {saisieBrute(reponse.abY)})
      </p>
      <p>
        {labelA}
        {labelC} : ({saisieBrute(reponse.acX)} ; {saisieBrute(reponse.acY)})
      </p>
      <p>
        {labelB}
        {labelC} : ({saisieBrute(reponse.bcX)} ; {saisieBrute(reponse.bcY)})
      </p>
    </>
  );
}

function saisieTest(reponse: ReponseTest): ReactNode {
  return (
    <>
      Critère = {formatSaisieNombreTexte(reponse.critere)} · Orthogonaux : {ouiNon(reponse.conclusion)}
    </>
  );
}

function saisieConclusion(labels: Labels, reponse: ReponseConclusionTriangle): string {
  return libelleConclusion(reponse.estRectangle ? reponse.sommet : null, labels);
}

function saisieIdentification(labels: Labels, reponse: ReponseIdentificationResolution): ReactNode {
  return (
    <>
      {libelleConclusion(reponse.estRectangle ? reponse.sommet : null, labels)} · <Katex expression={`x = ${formatSaisieNombre(reponse.x)}`} />
    </>
  );
}

/** Réponse attendue de l'écran `phase` — VALEUR seule : `ValidationEcran` et `FicheReponseEcran`
 * affichent déjà eux-mêmes le libellé « Réponse attendue » (jamais « Critère attendu : » en double). */
function construireReponseAttendue(exercice: ExerciceOrthogonalite, phase: PhaseOrthogonalite): ReactNode {
  if (phase === "test" && exercice.variante === "test") {
    return (
      <>
        Critère = {critereReelTest(exercice)} · Orthogonaux : {ouiNon(conclusionAttendueTest(exercice))}
      </>
    );
  }
  if (phase === "reductionParametre" && exercice.variante === "parametre") {
    return <Katex expression={formatEquationReduiteParametreLatex(exercice)} />;
  }
  if (phase === "resolutionParametre" && exercice.variante === "parametre") {
    return <Katex expression={`x = ${formatSaisieNombre(exercice.solutionX)}`} />;
  }
  if (phase === "constructionTriangle" && exercice.variante === "triangle") {
    return (
      <Katex
        expression={`\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesMatriceLatex(exercice.vecteurAC)} \\\\ \\vec{${exercice.labelB}${exercice.labelC}} = ${formatComposantesMatriceLatex(exercice.vecteurBC)} \\end{gathered}`}
      />
    );
  }
  if (exercice.variante === "triangle") {
    if (phase === "testSommetA") return <>{exercice.critereA}</>;
    if (phase === "testSommetB") return <>{exercice.critereB}</>;
    if (phase === "testSommetC") return <>{exercice.critereC}</>;
    if (phase === "conclusionTriangle") return <>{libelleConclusion(conclusionAttendueTriangle(exercice), exercice)}</>;
  }
  if (phase === "constructionAvecX" && exercice.variante === "triangleParametre") {
    return (
      <Katex
        expression={`\\begin{gathered} \\vec{${exercice.labelA}${exercice.labelB}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAB)} \\\\ \\vec{${exercice.labelA}${exercice.labelC}} = ${formatComposantesLinMatriceLatex(exercice.vecteurAC)} \\\\ \\vec{${exercice.labelB}${exercice.labelC}} = ${formatComposantesLinMatriceLatex(exercice.vecteurBC)} \\end{gathered}`}
      />
    );
  }
  if (exercice.variante === "triangleParametre") {
    if (phase === "reductionSommetA") return <Katex expression={formatReductionLatex(exercice.reductionA)} />;
    if (phase === "reductionSommetB") return <Katex expression={formatReductionLatex(exercice.reductionB)} />;
    if (phase === "reductionSommetC") return <Katex expression={formatReductionLatex(exercice.reductionC)} />;
    if (phase === "identificationResolution") {
      return (
        <>
          {libelleRectangleEn(conclusionAttendueTriangleParametre(exercice), exercice)} · <Katex expression={`x = ${formatSaisieNombre(exercice.solutionX)}`} />
        </>
      );
    }
  }
  return null;
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
  /** Consultation en lecture seule des écrans clos (puces cliquables) — tenue ici, jamais dans le
   * moteur ; un écran clos = une entrée, dans l'ordre de `SEQUENCES` (même index que sa puce). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucune saisie de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice ». */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionOrthogonalite, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        nouvelEtat.resultats.length > etat.resultats.length
          ? reveleDepuisResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!, etat.phase)
          : nouvelEtat.scoresAccumules[etat.phase]!.revele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      setHistorique((h) => [
        ...h,
        { titre: TITRES_ECRANS[etat.phase], votreReponse, correcte: !revele, reponseAttendue: construireReponseAttendue(etat.exerciceCourant, etat.phase) },
      ]);
      return;
    }
    setEtat(nouvelEtat);
  }

  function reinitialiserHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) reinitialiserHistorique();
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    reinitialiserHistorique();
    setEtat(demarrerSessionOrthogonalite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteOrthogonalite)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const recapitulatif = calculerRecapitulatifOrthogonalite(etat);

  const reponseAttendue = construireReponseAttendue(exercice, phase);

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
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {phase === "test" && exercice.variante === "test" ? (
          <EtapeTestOrthogonalite
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseTest(etat, reponse), saisieTest(reponse))}
            validation={validation}
          />
        ) : phase === "reductionParametre" && exercice.variante === "parametre" ? (
          <EtapeReductionParametreOrthogonalite
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseReductionParametre(etat, reponse), saisieBrute(reponse))}
            validation={validation}
          />
        ) : phase === "resolutionParametre" && exercice.variante === "parametre" ? (
          <EtapeResolutionParametreOrthogonalite
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(valeur) => terminerEtape(soumettreReponseResolutionParametre(etat, valeur), <Katex expression={`x = ${formatSaisieNombre(valeur)}`} />)}
            validation={validation}
          />
        ) : phase === "constructionTriangle" && exercice.variante === "triangle" ? (
          <EtapeConstructionTriangleOrthogonalite
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstructionTriangle(etat, reponse), saisieConstructionTriangle(exercice, reponse))}
            validation={validation}
          />
        ) : phase === "testSommetA" && exercice.variante === "triangle" ? (
          <EtapeTestSommetOrthogonalite
            key={`${numeroExercice}-A`}
            exercice={exercice}
            sommet="A"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(valeur) => terminerEtape(soumettreReponseTestSommet(etat, "A", valeur), formatSaisieNombreTexte(valeur))}
            validation={validation}
          />
        ) : phase === "testSommetB" && exercice.variante === "triangle" ? (
          <EtapeTestSommetOrthogonalite
            key={`${numeroExercice}-B`}
            exercice={exercice}
            sommet="B"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(valeur) => terminerEtape(soumettreReponseTestSommet(etat, "B", valeur), formatSaisieNombreTexte(valeur))}
            validation={validation}
          />
        ) : phase === "testSommetC" && exercice.variante === "triangle" ? (
          <EtapeTestSommetOrthogonalite
            key={`${numeroExercice}-C`}
            exercice={exercice}
            sommet="C"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(valeur) => terminerEtape(soumettreReponseTestSommet(etat, "C", valeur), formatSaisieNombreTexte(valeur))}
            validation={validation}
          />
        ) : phase === "conclusionTriangle" && exercice.variante === "triangle" ? (
          <EtapeConclusionTriangleOrthogonalite
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConclusionTriangle(etat, reponse), saisieConclusion(exercice, reponse))}
            validation={validation}
          />
        ) : phase === "constructionAvecX" && exercice.variante === "triangleParametre" ? (
          <EtapeConstructionAvecXOrthogonalite
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstructionAvecXTriangle(etat, reponse), saisieConstructionAvecX(exercice, reponse))}
            validation={validation}
          />
        ) : phase === "reductionSommetA" && exercice.variante === "triangleParametre" ? (
          <EtapeReductionSommetOrthogonalite
            key={`${numeroExercice}-A`}
            exercice={exercice}
            sommet="A"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseReductionSommet(etat, "A", reponse), saisieBrute(reponse))}
            validation={validation}
          />
        ) : phase === "reductionSommetB" && exercice.variante === "triangleParametre" ? (
          <EtapeReductionSommetOrthogonalite
            key={`${numeroExercice}-B`}
            exercice={exercice}
            sommet="B"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseReductionSommet(etat, "B", reponse), saisieBrute(reponse))}
            validation={validation}
          />
        ) : phase === "reductionSommetC" && exercice.variante === "triangleParametre" ? (
          <EtapeReductionSommetOrthogonalite
            key={`${numeroExercice}-C`}
            exercice={exercice}
            sommet="C"
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseReductionSommet(etat, "C", reponse), saisieBrute(reponse))}
            validation={validation}
          />
        ) : phase === "identificationResolution" && exercice.variante === "triangleParametre" ? (
          <EtapeIdentificationResolutionOrthogonalite
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(reponse) => terminerEtape(soumettreReponseIdentificationResolution(etat, reponse), saisieIdentification(exercice, reponse))}
            validation={validation}
          />
        ) : null}
        </div>
      </main>
      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
