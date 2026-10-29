import { useState, type ReactNode } from "react";
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
import { SEQUENCES } from "./moteur/typesNormeDistance";
import type { EtatSessionNormeDistance, PhaseNormeDistance, ResultatExerciceNormeDistance } from "./moteur/typesNormeDistance";
import type { ExerciceNormeDistance } from "./core/normeDistance.types";
import type { Composantes } from "./core/vecteur.types";
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
import type { ReponseClassificationIsocele, ReponseTestPythagore } from "./moteur/verificationNormeDistance";
import {
  formatEquationReduiteParametreNormeLatex,
  formatLongueurIrreductibleLatex,
  formatSolutionsAttenduesTexte,
  formatVecteurLatex,
  libelleRectangleEn,
} from "./ui/formatNormeDistance";
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

function nouvelleSession(): EtatSessionNormeDistance {
  return demarrerSessionNormeDistance(REGLAGES_DEMO, genererExerciceNormeDistance);
}

/** Réutilise `SEQUENCES` (séquence réelle par variante, déjà exposée par `typesNormeDistance.ts`)
 * et `etat.scoresAccumules` (déjà rempli à chaque clôture d'écran — `score`/`revele`/`niveauAide`)
 * plutôt qu'une deuxième reconstitution divergente. La dernière phase de chaque séquence n'a jamais
 * besoin d'être lue dans `scoresAccumules` : un nouvel exercice redémarre toujours juste après,
 * donc elle reste "a-venir" jusqu'à devenir "courante" — jamais consultée comme passée (même
 * principe que la dernière phase d'`AppFormeCanoniqueTransformations`/`AppOptimisation`). Puces
 * cliquables : chaque écran clos ouvre sa fiche de consultation (`FicheReponseEcran`, même patron
 * que gen5/gen37). Variante "vecteur" (1 seul écran) : aucune barre — une puce unique n'apporte
 * rien (`ProgressionPuces` ne rend rien pour une liste vide). */
function calculerSegmentsProgression(etat: EtatSessionNormeDistance): EtatPuceProgression[] {
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

/** Titre de la fiche de consultation — mêmes libellés que le récapitulatif quand il en a un
 * (`ui/recapitulatifNormeDistance.ts`). */
const TITRES_ECRANS: Record<PhaseNormeDistance, string> = {
  normeVecteur: "Norme du vecteur",
  constructionDistance: "Vecteur construit",
  calculDistance: "Distance",
  constructionIsocele: "Vecteurs construits",
  calculIsocele: "Longueurs calculées",
  conclusionIsocele: "Nature du triangle",
  reductionParametreNorme: "Équation réduite",
  resolutionParametreNorme: "Solution(s)",
  constructionPythagore: "Vecteurs construits",
  calculPythagore: "Longueurs calculées",
  testPythagore: "Sommet de l'angle droit",
};

function vecteursTriangleLatex(labels: { labelA: string; labelB: string; labelC: string }, ab: Composantes, ac: Composantes, bc: Composantes): string {
  const { labelA, labelB, labelC } = labels;
  return `\\begin{gathered} ${formatVecteurLatex(`${labelA}${labelB}`, ab)} \\\\ ${formatVecteurLatex(`${labelA}${labelC}`, ac)} \\\\ ${formatVecteurLatex(`${labelB}${labelC}`, bc)} \\end{gathered}`;
}

function longueursTriangleLatex(labels: { labelA: string; labelB: string; labelC: string }, ab: string, ac: string, bc: string): string {
  const { labelA, labelB, labelC } = labels;
  return `\\begin{gathered} \\|\\vec{${labelA}${labelB}}\\| = ${ab} \\\\ \\|\\vec{${labelA}${labelC}}\\| = ${ac} \\\\ \\|\\vec{${labelB}${labelC}}\\| = ${bc} \\end{gathered}`;
}

function libelleClassification(classification: ReponseClassificationIsocele, labels: { labelA: string; labelB: string; labelC: string }): string {
  if (classification === "scalene") return "Scalène";
  return `Isocèle en ${classification === "isoceleA" ? labels.labelA : classification === "isoceleB" ? labels.labelB : labels.labelC}`;
}

function libelleSommetPythagore(sommet: ReponseTestPythagore, labels: { labelA: string; labelB: string; labelC: string }): string {
  return sommet === null ? "aucun sommet rectangle" : libelleRectangleEn(sommet, labels);
}

/** Saisie libre de l'élève, telle quelle (jamais réinterprétée) — champ vide affiché « — ». */
function saisieBrute(texte: string): ReactNode {
  return texte.trim() === "" ? "—" : texte;
}

/** Valeurs de x soumises à l'écran de résolution — virgule décimale. */
function formatValeursX(valeurs: number[]): string {
  if (valeurs.length === 0) return "aucune solution réelle";
  return valeurs.map((v) => `x = ${String(v).replace(".", ",")}`).join(" ou ");
}

/** Réponse attendue de l'écran `phase` — VALEUR seule : `ValidationEcran` et `FicheReponseEcran`
 * affichent déjà eux-mêmes le libellé « Réponse attendue » (jamais « Norme attendue : » en double). */
function construireReponseAttendue(exercice: ExerciceNormeDistance, phase: PhaseNormeDistance): ReactNode {
  if (phase === "normeVecteur" && exercice.variante === "vecteur") {
    return <Katex expression={`\\|\\vec{${exercice.vNom}}\\| = ${formatLongueurIrreductibleLatex(exercice.normeCarree)}`} />;
  }
  if (phase === "constructionDistance" && exercice.variante === "distance") {
    return <Katex expression={formatVecteurLatex(`${exercice.labelA}${exercice.labelB}`, exercice.vecteurAB)} />;
  }
  if (phase === "calculDistance" && exercice.variante === "distance") {
    return <Katex expression={`${exercice.labelA}${exercice.labelB} = ${formatLongueurIrreductibleLatex(exercice.distanceCarree)}`} />;
  }
  if (phase === "constructionIsocele" && exercice.variante === "isocele") {
    return <Katex expression={vecteursTriangleLatex(exercice, exercice.vecteurAB, exercice.vecteurAC, exercice.vecteurBC)} />;
  }
  if (phase === "calculIsocele" && exercice.variante === "isocele") {
    return (
      <Katex
        expression={longueursTriangleLatex(
          exercice,
          formatLongueurIrreductibleLatex(exercice.carreAB),
          formatLongueurIrreductibleLatex(exercice.carreAC),
          formatLongueurIrreductibleLatex(exercice.carreBC),
        )}
      />
    );
  }
  if (phase === "conclusionIsocele" && exercice.variante === "isocele") {
    return <>{libelleClassification(exercice.classification, exercice)}</>;
  }
  if (phase === "reductionParametreNorme" && exercice.variante === "parametre") {
    return <Katex expression={formatEquationReduiteParametreNormeLatex(exercice)} />;
  }
  if (phase === "resolutionParametreNorme" && exercice.variante === "parametre") {
    return <>{formatSolutionsAttenduesTexte(exercice)}</>;
  }
  if (phase === "constructionPythagore" && exercice.variante === "pythagore") {
    return <Katex expression={vecteursTriangleLatex(exercice, exercice.vecteurAB, exercice.vecteurAC, exercice.vecteurBC)} />;
  }
  if (phase === "calculPythagore" && exercice.variante === "pythagore") {
    return (
      <Katex
        expression={longueursTriangleLatex(
          exercice,
          formatLongueurIrreductibleLatex(exercice.carreAB),
          formatLongueurIrreductibleLatex(exercice.carreAC),
          formatLongueurIrreductibleLatex(exercice.carreBC),
        )}
      />
    );
  }
  if (phase === "testPythagore" && exercice.variante === "pythagore") {
    return <>{libelleSommetPythagore(sommetAttenduPythagore(exercice), exercice)}</>;
  }
  return null;
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
  /** Consultation en lecture seule des écrans clos (puces cliquables) — tenue ici, jamais dans le
   * moteur ; un écran clos = une entrée, dans l'ordre de `SEQUENCES` (même index que sa puce). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucune saisie de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice » (deux exercices
   * successifs de même variante partagent la même première phase). */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionNormeDistance, votreReponse: ReactNode) {
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

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const recapitulatif = calculerRecapitulatifNormeDistance(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    reinitialiserHistorique();
    setEtat(demarrerSessionNormeDistance(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteNormeDistance)));
  }

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
        <h1 className="app-title">Norme d'un vecteur et distance entre 2 points</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {phase === "calculPythagore" && !enAttente && <CalculatriceScientifique />}
        {phase === "normeVecteur" && exercice.variante === "vecteur" ? (
          <EtapeNormeVecteur
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseNormeVecteur(etat, texte), saisieBrute(texte))}
            validation={validation}
          />
        ) : phase === "constructionDistance" && exercice.variante === "distance" ? (
          <EtapeConstructionDistance
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) =>
              terminerEtape(
                soumettreReponseConstructionDistance(etat, reponse),
                <Katex expression={formatVecteurLatex(`${exercice.labelA}${exercice.labelB}`, reponse)} />,
              )
            }
            validation={validation}
          />
        ) : phase === "calculDistance" && exercice.variante === "distance" ? (
          <EtapeCalculDistance
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseCalculDistance(etat, texte), saisieBrute(texte))}
            validation={validation}
          />
        ) : phase === "constructionIsocele" && exercice.variante === "isocele" ? (
          <EtapeConstructionIsocele
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) =>
              terminerEtape(
                soumettreReponseConstructionIsocele(etat, reponse),
                <Katex
                  expression={vecteursTriangleLatex(exercice, { x: reponse.abX, y: reponse.abY }, { x: reponse.acX, y: reponse.acY }, { x: reponse.bcX, y: reponse.bcY })}
                />,
              )
            }
            validation={validation}
          />
        ) : phase === "calculIsocele" && exercice.variante === "isocele" ? (
          <EtapeCalculIsocele
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) =>
              terminerEtape(soumettreReponseCalculIsocele(etat, reponse), <LongueursSaisies labels={exercice} saisies={reponse} />)
            }
            validation={validation}
          />
        ) : phase === "conclusionIsocele" && exercice.variante === "isocele" ? (
          <EtapeConclusionIsocele
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConclusionIsocele(etat, reponse), libelleClassification(reponse, exercice))}
            validation={validation}
          />
        ) : phase === "reductionParametreNorme" && exercice.variante === "parametre" ? (
          <EtapeReductionParametreNorme
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseReductionParametreNorme(etat, texte), saisieBrute(texte))}
            validation={validation}
          />
        ) : phase === "resolutionParametreNorme" && exercice.variante === "parametre" ? (
          <EtapeResolutionParametreNorme
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(valeurs) => terminerEtape(soumettreReponseResolutionParametreNorme(etat, valeurs), formatValeursX(valeurs))}
            validation={validation}
          />
        ) : phase === "constructionPythagore" && exercice.variante === "pythagore" ? (
          <EtapeConstructionPythagore
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) =>
              terminerEtape(
                soumettreReponseConstructionPythagore(etat, reponse),
                <Katex
                  expression={vecteursTriangleLatex(exercice, { x: reponse.abX, y: reponse.abY }, { x: reponse.acX, y: reponse.acY }, { x: reponse.bcX, y: reponse.bcY })}
                />,
              )
            }
            validation={validation}
          />
        ) : phase === "calculPythagore" && exercice.variante === "pythagore" ? (
          <EtapeCalculPythagore
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) =>
              terminerEtape(soumettreReponseCalculPythagore(etat, reponse), <LongueursSaisies labels={exercice} saisies={reponse} />)
            }
            validation={validation}
          />
        ) : phase === "testPythagore" && exercice.variante === "pythagore" ? (
          <EtapeTestPythagore
            key={`${numeroExercice}-${phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseTestPythagore(etat, reponse), libelleSommetPythagore(reponse, exercice))}
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

/** Les 3 longueurs saisies (texte libre : `√29`, `2√5`, `5`...), une par ligne, telles quelles. */
function LongueursSaisies({ labels, saisies }: { labels: { labelA: string; labelB: string; labelC: string }; saisies: { ab: string; ac: string; bc: string } }) {
  const { labelA, labelB, labelC } = labels;
  return (
    <>
      <p>
        {labelA}
        {labelB} = {saisieBrute(saisies.ab)}
      </p>
      <p>
        {labelA}
        {labelC} = {saisieBrute(saisies.ac)}
      </p>
      <p>
        {labelB}
        {labelC} = {saisieBrute(saisies.bc)}
      </p>
    </>
  );
}
