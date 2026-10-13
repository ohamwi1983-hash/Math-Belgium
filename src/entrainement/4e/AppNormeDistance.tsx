import { useRef, useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionNormeDistance,
  soumettreReponseCalculDistance,
  soumettreReponseCalculIsocele,
  soumettreReponseCalculPythagore,
  soumettreReponseConclusionIsocele,
  soumettreReponseConstructionDistance,
  soumettreReponseConstructionIsocele,
  soumettreReponseConstructionPythagore,
  soumettreReponseNormeVecteur,
  soumettreReponseReductionParametreNorme,
  soumettreReponseResolutionParametreNorme,
  soumettreReponseTestPythagore,
} from "./moteur/sessionNormeDistance";
import type { EtatSessionNormeDistance, PhaseNormeDistance, ResultatExerciceNormeDistance } from "./moteur/typesNormeDistance";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceNormeDistance } from "./generateurs/normeDistance";
import type { VarianteNormeDistance } from "./core/normeDistance.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeNormeVecteur } from "./components/EtapeNormeVecteur";
import { EtapeConstructionDistance } from "./components/EtapeConstructionDistance";
import { EtapeCalculDistance } from "./components/EtapeCalculDistance";
import { EtapeConstructionIsocele } from "./components/EtapeConstructionIsocele";
import { EtapeCalculIsocele } from "./components/EtapeCalculIsocele";
import { EtapeConclusionIsocele } from "./components/EtapeConclusionIsocele";
import { EtapeReductionParametreNorme } from "./components/EtapeReductionParametreNorme";
import { EtapeResolutionParametreNorme } from "./components/EtapeResolutionParametreNorme";
import { EtapeConstructionPythagore } from "./components/EtapeConstructionPythagore";
import { EtapeCalculPythagore } from "./components/EtapeCalculPythagore";
import { EtapeTestPythagore } from "./components/EtapeTestPythagore";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifNormeDistance } from "./ui/recapitulatifNormeDistance";
import { Katex } from "./components/Katex";
import { sommetAttenduPythagore } from "./moteur/verificationNormeDistance";
import {
  formatEquationReduiteParametreNormeLatex,
  formatLongueurIrreductibleLatex,
  formatSolutionsAttenduesTexte,
  formatVecteurLatex,
  libelleRectangleEn,
} from "./ui/formatNormeDistance";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionNormeDistance {
  return demarrerSessionNormeDistance(REGLAGES_DEMO, genererExerciceNormeDistance);
}

const LIBELLE_PHASE: Record<PhaseNormeDistance, string> = {
  normeVecteur: "Norme",
  constructionDistance: "Construction du vecteur",
  calculDistance: "Calcul de la distance",
  constructionIsocele: "Construction des côtés",
  calculIsocele: "Calcul des longueurs",
  conclusionIsocele: "Conclusion",
  reductionParametreNorme: "Réduction",
  resolutionParametreNorme: "Résolution",
  constructionPythagore: "Construction des côtés",
  calculPythagore: "Calcul des longueurs",
  testPythagore: "Rectangle en...",
};

/** Révélation de l'écran `phase` lue sur le résultat déjà clos de l'exercice (le dernier de la
 * séquence de sa variante — voir `scoresAccumules`/`SEQUENCES`, `typesNormeDistance.ts`). */
function reveleDepuisResultat(resultat: ResultatExerciceNormeDistance, phase: PhaseNormeDistance): boolean {
  switch (phase) {
    case "normeVecteur":
      return resultat.normeVecteurRevele;
    case "constructionDistance":
      return resultat.constructionDistanceRevele;
    case "calculDistance":
      return resultat.calculDistanceRevele;
    case "constructionIsocele":
      return resultat.constructionIsoceleRevele;
    case "calculIsocele":
      return resultat.calculIsoceleRevele;
    case "conclusionIsocele":
      return resultat.conclusionIsoceleRevele;
    case "reductionParametreNorme":
      return resultat.reductionParametreNormeRevele;
    case "resolutionParametreNorme":
      return resultat.resolutionParametreNormeRevele;
    case "constructionPythagore":
      return resultat.constructionPythagoreRevele;
    case "calculPythagore":
      return resultat.calculPythagoreRevele;
    case "testPythagore":
      return resultat.testPythagoreRevele;
  }
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionNormeDistance;
  revele: boolean;
}

export function AppNormeDistance() {
  const [etat, setEtat] = useState<EtatSessionNormeDistance>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionNormeDistance) {
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

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  /** `estPremierEcran` : vrai uniquement sur le premier écran vu pour CET `exercice` (change de
   * valeur quand un nouvel exercice est tiré, jamais au fil des écrans d'un même exercice) — voir
   * `EnTeteExercice.tsx`, option 1B ("plein puis compact"). */
  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;
  const recapitulatif = calculerRecapitulatifNormeDistance(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionNormeDistance(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteNormeDistance)));
  }

  const reponseAttendue =
    phase === "normeVecteur" && exercice.variante === "vecteur" ? (
      <>Norme attendue : {exercice.norme}</>
    ) : phase === "constructionDistance" && exercice.variante === "distance" ? (
      <Katex expression={formatVecteurLatex(`${exercice.labelA}${exercice.labelB}`, exercice.vecteurAB)} />
    ) : phase === "calculDistance" && exercice.variante === "distance" ? (
      <>Distance attendue : {exercice.distance}</>
    ) : phase === "constructionIsocele" && exercice.variante === "isocele" ? (
      <Katex
        expression={`\\begin{gathered} ${formatVecteurLatex(`${exercice.labelA}${exercice.labelB}`, exercice.vecteurAB)} \\\\ ${formatVecteurLatex(`${exercice.labelA}${exercice.labelC}`, exercice.vecteurAC)} \\\\ ${formatVecteurLatex(`${exercice.labelB}${exercice.labelC}`, exercice.vecteurBC)} \\end{gathered}`}
      />
    ) : phase === "calculIsocele" && exercice.variante === "isocele" ? (
      <>
        {exercice.labelA}
        {exercice.labelB} = {exercice.longueurAB} — {exercice.labelA}
        {exercice.labelC} = {exercice.longueurAC} — {exercice.labelB}
        {exercice.labelC} = {exercice.longueurBC}
      </>
    ) : phase === "conclusionIsocele" && exercice.variante === "isocele" ? (
      <>
        Conclusion attendue :{" "}
        {exercice.classification === "scalene"
          ? "Scalène"
          : `Isocèle en ${exercice.classification === "isoceleA" ? exercice.labelA : exercice.classification === "isoceleB" ? exercice.labelB : exercice.labelC}`}
      </>
    ) : phase === "reductionParametreNorme" && exercice.variante === "parametre" ? (
      <>
        Équation attendue : <Katex expression={formatEquationReduiteParametreNormeLatex(exercice)} />
      </>
    ) : phase === "resolutionParametreNorme" && exercice.variante === "parametre" ? (
      <>Solution(s) attendue(s) : {formatSolutionsAttenduesTexte(exercice)}</>
    ) : phase === "constructionPythagore" && exercice.variante === "pythagore" ? (
      <Katex
        expression={`\\begin{gathered} ${formatVecteurLatex(`${exercice.labelA}${exercice.labelB}`, exercice.vecteurAB)} \\\\ ${formatVecteurLatex(`${exercice.labelA}${exercice.labelC}`, exercice.vecteurAC)} \\\\ ${formatVecteurLatex(`${exercice.labelB}${exercice.labelC}`, exercice.vecteurBC)} \\end{gathered}`}
      />
    ) : phase === "calculPythagore" && exercice.variante === "pythagore" ? (
      <Katex
        expression={`\\begin{gathered} \\|\\vec{${exercice.labelA}${exercice.labelB}}\\|=${formatLongueurIrreductibleLatex(exercice.carreAB)} \\\\ \\|\\vec{${exercice.labelA}${exercice.labelC}}\\|=${formatLongueurIrreductibleLatex(exercice.carreAC)} \\\\ \\|\\vec{${exercice.labelB}${exercice.labelC}}\\|=${formatLongueurIrreductibleLatex(exercice.carreBC)} \\end{gathered}`}
      />
    ) : phase === "testPythagore" && exercice.variante === "pythagore" ? (
      <>
        Conclusion attendue :{" "}
        {sommetAttenduPythagore(exercice) === null
          ? "aucun sommet rectangle"
          : libelleRectangleEn(sommetAttenduPythagore(exercice) as "A" | "B" | "C", exercice)}
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
        <h1 className="app-title">Norme d'un vecteur et distance entre 2 points</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {phase === "calculPythagore" && !enAttente && <CalculatriceScientifique />}
        {phase === "normeVecteur" && exercice.variante === "vecteur" ? (
          <EtapeNormeVecteur
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseNormeVecteur(etat, texte))}
            validation={validation}
          />
        ) : phase === "constructionDistance" && exercice.variante === "distance" ? (
          <EtapeConstructionDistance
            key={phase}
            exercice={exercice}
            estPremierEcran={estPremierEcran}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstructionDistance(etat, reponse))}
            validation={validation}
          />
        ) : phase === "calculDistance" && exercice.variante === "distance" ? (
          <EtapeCalculDistance
            key={phase}
            exercice={exercice}
            estPremierEcran={estPremierEcran}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseCalculDistance(etat, texte))}
            validation={validation}
          />
        ) : phase === "constructionIsocele" && exercice.variante === "isocele" ? (
          <EtapeConstructionIsocele
            key={phase}
            exercice={exercice}
            estPremierEcran={estPremierEcran}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstructionIsocele(etat, reponse))}
            validation={validation}
          />
        ) : phase === "calculIsocele" && exercice.variante === "isocele" ? (
          <EtapeCalculIsocele
            key={phase}
            exercice={exercice}
            estPremierEcran={estPremierEcran}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseCalculIsocele(etat, reponse))}
            validation={validation}
          />
        ) : phase === "conclusionIsocele" && exercice.variante === "isocele" ? (
          <EtapeConclusionIsocele
            key={phase}
            exercice={exercice}
            estPremierEcran={estPremierEcran}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConclusionIsocele(etat, reponse))}
            validation={validation}
          />
        ) : phase === "reductionParametreNorme" && exercice.variante === "parametre" ? (
          <EtapeReductionParametreNorme
            key={phase}
            exercice={exercice}
            estPremierEcran={estPremierEcran}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseReductionParametreNorme(etat, texte))}
            validation={validation}
          />
        ) : phase === "resolutionParametreNorme" && exercice.variante === "parametre" ? (
          <EtapeResolutionParametreNorme
            key={phase}
            exercice={exercice}
            estPremierEcran={estPremierEcran}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(valeurs) => terminerEtape(soumettreReponseResolutionParametreNorme(etat, valeurs))}
            validation={validation}
          />
        ) : phase === "constructionPythagore" && exercice.variante === "pythagore" ? (
          <EtapeConstructionPythagore
            key={phase}
            exercice={exercice}
            estPremierEcran={estPremierEcran}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstructionPythagore(etat, reponse))}
            validation={validation}
          />
        ) : phase === "calculPythagore" && exercice.variante === "pythagore" ? (
          <EtapeCalculPythagore
            key={phase}
            exercice={exercice}
            estPremierEcran={estPremierEcran}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseCalculPythagore(etat, reponse))}
            validation={validation}
          />
        ) : phase === "testPythagore" && exercice.variante === "pythagore" ? (
          <EtapeTestPythagore
            key={phase}
            exercice={exercice}
            estPremierEcran={estPremierEcran}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseTestPythagore(etat, reponse))}
            validation={validation}
          />
        ) : null}
        </div>
      </main>
    </div>
  );
}
