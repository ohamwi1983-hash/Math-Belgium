import { useState, type ReactNode } from "react";
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
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifColinearite } from "./ui/recapitulatifColinearite";
import { conclusionAttendue, critereReel } from "./moteur/verificationColinearite";
import type { ReponseConstructionAvecX, ReponseConstructionVecteurs, ReponseTest } from "./moteur/verificationColinearite";
import { formatComposantesLinMatriceLatex, formatComposantesMatriceLatex, formatEquationReduiteLatex, LIBELLES_OUI_NON } from "./ui/formatColinearite";
import { Katex } from "./components/Katex";
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
  if (exercice.typeSolution === "unique") return <Katex expression={`x = ${String(exercice.solutionX).replace(".", "{,}")}`} />;
  if (exercice.typeSolution === "identite") return <span>Tout x convient (une infinité de solutions).</span>;
  return <span>Aucun x ne convient (aucune solution).</span>;
}

function ouiNon(valeur: boolean): string {
  return valeur ? LIBELLES_OUI_NON.positif : LIBELLES_OUI_NON.negatif;
}

/** Critère + conclusion(s) d'un écran "test" — partagé par la réponse attendue et par la fiche de
 * consultation (même mise en forme pour « ta réponse » et « réponse attendue »). */
function resumeTest(critere: number, colineaires: boolean, alignes: boolean | null): ReactNode {
  return (
    <>
      Critère = {String(critere).replace(".", ",")} · Colinéaires : {ouiNon(colineaires)}
      {alignes !== null && <> · Alignés : {ouiNon(alignes)}</>}
    </>
  );
}

/** Révélation de l'écran "Test de colinéarité" (V1/V3, phase "test" uniquement) — VALEURS seules :
 * `ValidationEcran` affiche déjà « Réponse attendue : » (jamais « Critère attendu : » en double). */
function revelationTest(exercice: ExerciceColinearite) {
  if (exercice.variante !== "vecteurs" && exercice.variante !== "points") return null;
  const conclusion = conclusionAttendue(exercice);
  return resumeTest(critereReel(exercice), conclusion, exercice.variante === "points" ? conclusion : null);
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
    if (etat.phase === "reduction") return <Katex expression={formatEquationReduiteLatex(exercice)} />;
    if (etat.phase === "resolution") return revelationResolution(exercice);
  }
  if (exercice.variante === "pointsParametre") {
    if (etat.phase === "constructionAvecX") return revelationConstruction(exercice);
    if (etat.phase === "reductionAvecX") return <Katex expression={formatEquationReduiteLatex(exercice)} />;
    if (etat.phase === "resolutionAvecX") return revelationResolution(exercice);
  }
  return undefined;
}

/** Titre de la fiche de consultation d'un écran clos. */
const TITRES_ECRANS: Record<PhaseColinearite, string> = {
  constructionVecteurs: "Vecteurs construits",
  constructionAvecX: "Vecteurs construits",
  reduction: "Équation réduite",
  reductionAvecX: "Équation réduite",
  resolution: "Valeur de x",
  resolutionAvecX: "Valeur de x",
  test: "Test de colinéarité",
};

function formatSaisieNombre(valeur: number): string {
  return String(valeur).replace(".", "{,}");
}

/** Saisie libre de l'élève, telle quelle — champ vide affiché « — ». */
function saisieBrute(texte: string): string {
  return texte.trim() === "" ? "—" : texte;
}

function saisieConstructionVecteurs(exercice: { labelA: string; labelB: string; labelC: string }, reponse: ReponseConstructionVecteurs): ReactNode {
  const { labelA, labelB, labelC } = exercice;
  return (
    <Katex
      expression={`\\begin{gathered} \\vec{${labelA}${labelB}} = \\begin{pmatrix} ${formatSaisieNombre(reponse.abX)} \\\\ ${formatSaisieNombre(reponse.abY)} \\end{pmatrix} \\\\ \\vec{${labelA}${labelC}} = \\begin{pmatrix} ${formatSaisieNombre(reponse.acX)} \\\\ ${formatSaisieNombre(reponse.acY)} \\end{pmatrix} \\end{gathered}`}
    />
  );
}

/** Composantes avec x : saisies libres (`2x-1`), affichées telles quelles, jamais réinterprétées. */
function saisieConstructionAvecX(exercice: { labelA: string; labelB: string; labelC: string }, reponse: ReponseConstructionAvecX): ReactNode {
  const { labelA, labelB, labelC } = exercice;
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
    </>
  );
}

function saisieTest(reponse: ReponseTest): ReactNode {
  return resumeTest(reponse.critere, reponse.conclusionColinearite, reponse.conclusionAlignement);
}

/** Séquence de phases pour l'exercice courant — dépend de la variante (voir `typesColinearite.ts`,
 * doc de `PhaseColinearite`). "vecteurs" ne traverse qu'un seul écran ("test") : pas de barre de
 * puces dans ce cas (même principe qu'un écran unique), géré par `calculerSegmentsProgression`. */
function sequencePourExercice(exercice: ExerciceColinearite): PhaseColinearite[] {
  switch (exercice.variante) {
    case "vecteurs":
      return ["test"];
    case "points":
      return ["constructionVecteurs", "test"];
    case "parametre":
      return ["reduction", "resolution"];
    case "pointsParametre":
      return ["constructionAvecX", "reductionAvecX", "resolutionAvecX"];
  }
}

/** Segments de la barre de puces — seules "constructionVecteurs"/"constructionAvecX" et
 * "reduction"/"reductionAvecX" peuvent être des phases PASSÉES (non terminales) : `test`/
 * `resolution`/`resolutionAvecX` sont toujours la dernière phase de leur variante, jamais
 * consultées comme passées (même principe que `AppOptimisation.tsx`). `niveauAideConstruction`/
 * `niveauAideReduction` restent lisibles après la clôture de leur écran (champs dédiés, jamais
 * remis à 0 par un changement de phase — contrairement à un `niveauAide` unique partagé). */
function calculerSegmentsProgression(etat: EtatSessionColinearite): EtatPuceProgression[] {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const estConstruction = phase === "constructionVecteurs" || phase === "constructionAvecX";
    if (estConstruction ? etat.constructionRevele : etat.reductionRevele) return "revele";
    const niveauAide = estConstruction ? etat.niveauAideConstruction : etat.niveauAideReduction;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

export function AppColinearite() {
  const [etat, setEtat] = useState<EtatSessionColinearite>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans clos (puces cliquables) — tenue ici, jamais dans le
   * moteur ; un écran clos = une entrée, dans l'ordre de la séquence (même index que sa puce). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucune saisie de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice ». */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionColinearite, votreReponse: ReactNode) {
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
      setHistorique((h) => [
        ...h,
        { titre: TITRES_ECRANS[etat.phase], votreReponse, correcte: !revele, reponseAttendue: construireReponseAttendue(etat, etat.exerciceCourant) },
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

  const exercice = etat.exerciceCourant;

  const recapitulatif = calculerRecapitulatifColinearite(etat);
  const sequence = sequencePourExercice(exercice);
  const segmentsProgression = sequence.length > 1 ? calculerSegmentsProgression(etat) : null;

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    reinitialiserHistorique();
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
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        {segmentsProgression && <ProgressionPuces segments={segmentsProgression} onSegmentClick={(index) => setFicheOuverteIndex(index)} />}
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {etat.phase === "constructionVecteurs" && exercice.variante === "points" ? (
          <EtapeConstructionVecteursColinearite
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideConstruction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstructionVecteurs(etat, reponse), saisieConstructionVecteurs(exercice, reponse))}
            validation={validation}
          />
        ) : etat.phase === "constructionAvecX" && exercice.variante === "pointsParametre" ? (
          <EtapeConstructionAvecXColinearite
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideConstruction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstructionAvecX(etat, reponse), saisieConstructionAvecX(exercice, reponse))}
            validation={validation}
          />
        ) : etat.phase === "reduction" && exercice.variante === "parametre" ? (
          <EtapeReductionColinearite
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideReduction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseReduction(etat, texte), saisieBrute(texte))}
            validation={validation}
          />
        ) : etat.phase === "resolution" && exercice.variante === "parametre" ? (
          <EtapeResolutionColinearite
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(valeur) => terminerEtape(soumettreReponseResolution(etat, valeur), <Katex expression={`x = ${formatSaisieNombre(valeur)}`} />)}
            validation={validation}
          />
        ) : etat.phase === "reductionAvecX" && exercice.variante === "pointsParametre" ? (
          <EtapeReductionAvecXColinearite
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideReduction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseReductionAvecX(etat, texte), saisieBrute(texte))}
            validation={validation}
          />
        ) : etat.phase === "resolutionAvecX" && exercice.variante === "pointsParametre" ? (
          <EtapeResolutionAvecXColinearite
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(valeur) => terminerEtape(soumettreReponseResolutionAvecX(etat, valeur), <Katex expression={`x = ${formatSaisieNombre(valeur)}`} />)}
            validation={validation}
          />
        ) : (exercice.variante === "vecteurs" || exercice.variante === "points") && etat.phase === "test" ? (
          <EtapeTestColinearite
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideTest}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseTest(etat, reponse), saisieTest(reponse))}
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
