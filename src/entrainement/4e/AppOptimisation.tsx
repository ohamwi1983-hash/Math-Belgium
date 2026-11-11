import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionOptimisation,
  soumettreReponseContrainteEtGrandeur,
  soumettreReponseDecision,
  soumettreReponseDomaine,
  soumettreReponseIdentification,
  soumettreReponseInterpretation,
  soumettreReponseSommet,
  soumettreReponseSysteme,
  tentativesMaxCourant,
} from "./moteur/sessionOptimisation";
import type { EtatSessionOptimisation } from "./moteur/typesOptimisation";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceOptimisation } from "./generateurs/optimisation";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifOptimisation, sequencePourExercice } from "./ui/recapitulatifOptimisation";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { EtapeIdentificationOptimisation } from "./components/EtapeIdentificationOptimisation";
import { EtapeContrainteEtGrandeurOptimisation } from "./components/EtapeContrainteEtGrandeurOptimisation";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeSystemeOptimisation } from "./components/EtapeSystemeOptimisation";
import { EtapeDomaineOptimisation } from "./components/EtapeDomaineOptimisation";
import { EtapeSommetOptimisation } from "./components/EtapeSommetOptimisation";
import { EtapeDecisionOptimisation } from "./components/EtapeDecisionOptimisation";
import { EtapeInterpretationOptimisation } from "./components/EtapeInterpretationOptimisation";
import { Katex } from "./components/Katex";
import {
  formatDomaineLatex,
  formatFonctionDeveloppeeLatex,
  formatOptimalAttenduLatex,
  formatSommetAttenduLatex,
  formatSystemeAccoladeLatex,
  libellePositionOptimum,
} from "./ui/formatOptimisation";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { expressionLibreVersLatex } from "./ui/formatExpressionLatex";
import type { ExerciceOptimisation } from "./core/optimisation.types";
import type { PhaseOptimisation } from "./moteur/typesOptimisation";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionOptimisation {
  return demarrerSessionOptimisation(REGLAGES_DEMO, genererExerciceOptimisation);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son exercice est
 * cette instance — tirée avec les MÊMES fonctions et le même catalogue (les 7 familles) que
 * l'adaptateur d'export (`generateurs/optimisation/exportEvaluation.ts`). */
function sessionInitiale(): EtatSessionOptimisation {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionOptimisation(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_FAMILLES, genererExerciceOptimisation, (id) => construireAvecFamilleId(id as (typeof CATALOGUE_FAMILLES)[number]["id"])),
  );
}

/** Segments de la barre de puces — réutilise `sequencePourExercice` (même séquence réelle que le
 * récapitulatif, jamais une deuxième reconstitution) et la même lecture `etat.xxxRevele`/
 * `etat.niveauAideXxx` que `terminerEtape` ci-dessous. `interpretation` (dernière phase, clôture
 * l'exercice) n'a jamais besoin de sa propre branche "close" : un nouvel exercice redémarre toujours
 * juste après, donc elle reste "a-venir" jusqu'à devenir "courante" — jamais consultée comme passée
 * (même principe que la dernière phase d'`AppAnalyseFonction`/`AppMethodeRapide`). Les puces closes
 * sont cliquables (`onSegmentClick` → `FicheReponseEcran`, historique tenu dans `AppOptimisation`). */
function calculerSegmentsProgression(etat: EtatSessionOptimisation): EtatPuceProgression[] {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele =
      phase === "identification"
        ? etat.identificationRevele
        : phase === "contrainteEtGrandeur"
          ? etat.contrainteEtGrandeurRevele
          : phase === "systeme"
            ? etat.systemeRevele
            : phase === "domaine"
              ? etat.domaineRevele
              : phase === "sommet"
                ? etat.sommetRevele
                : etat.decisionRevele;
    if (revele) return "revele";
    const niveauAide =
      phase === "identification"
        ? etat.niveauAideIdentification
        : phase === "contrainteEtGrandeur"
          ? etat.niveauAideContrainteEtGrandeur
          : phase === "systeme"
            ? etat.niveauAideSysteme
            : phase === "domaine"
              ? etat.niveauAideDomaine
              : phase === "sommet"
                ? etat.niveauAideSommet
                : etat.niveauAideDecision;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** Saisie libre de l'élève rendue en KaTeX (même conversion que l'aperçu sous le champ) — texte brut
 * si elle ne se lit pas comme une expression. */
function saisieLatex(texte: string): ReactNode {
  try {
    return <Katex expression={expressionLibreVersLatex(texte)} />;
  } catch {
    return texte;
  }
}

/** Choix de l'élève à l'écran « identification » (libellés tels qu'ils étaient proposés). */
function formatIdentification(exercice: ExerciceOptimisation, reponse: { indexX: number | null; indexY: number | null }): ReactNode {
  if (exercice.variante !== "modelisation" || !exercice.identificationXY) return null;
  const id = exercice.identificationXY;
  return (
    <>
      {exercice.contexte.labelVariable} : {reponse.indexX === null ? "—" : id.candidatsX[reponse.indexX]} — {exercice.contrainte.lettreCherchee} :{" "}
      {reponse.indexY === null ? "—" : id.candidatsY[reponse.indexY]}
    </>
  );
}

/** Titre de chaque écran dans la fiche de consultation (mêmes libellés que « Ce qu'on sait déjà »). */
const TITRE_PHASE: Record<PhaseOptimisation, string> = {
  identification: "Identification",
  contrainteEtGrandeur: "Relation posée",
  systeme: "Fonction",
  domaine: "Domaine",
  sommet: "Sommet",
  decision: "Optimum",
  interpretation: "Interprétation",
};

/** Réponse attendue d'un écran — la MÊME pour l'écran de validation et pour la fiche de consultation. */
function reponseAttenduePour(exercice: ExerciceOptimisation, phase: PhaseOptimisation): ReactNode {
  if (phase === "identification" && exercice.variante === "modelisation" && exercice.identificationXY) {
    const id = exercice.identificationXY;
    return (
      <>
        {exercice.contexte.labelVariable} : {id.candidatsX[id.indexCorrectX]} — {exercice.contrainte.lettreCherchee} : {id.candidatsY[id.indexCorrectY]}
      </>
    );
  }
  if (phase === "contrainteEtGrandeur" && exercice.variante === "modelisation") return <Katex expression={formatSystemeAccoladeLatex(exercice)} />;
  if (phase === "systeme" && exercice.variante === "modelisation")
    return <Katex expression={`\\text{${exercice.contexte.nomGrandeur}} = ${formatFonctionDeveloppeeLatex(exercice.fonction, exercice.contexte.labelVariable)}`} />;
  if (phase === "domaine" && exercice.variante === "modelisation") return <Katex expression={formatDomaineLatex(exercice.domaine, exercice.contexte.labelVariable)} />;
  if (phase === "sommet") return <Katex expression={formatSommetAttenduLatex(exercice)} />;
  if (phase === "decision")
    return (
      <>
        {libellePositionOptimum(exercice)} : <Katex expression={formatOptimalAttenduLatex(exercice)} />
      </>
    );
  if (phase === "interpretation") return exercice.optionsInterpretation.find((option) => option.correcte)?.texte ?? null;
  return null;
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionOptimisation;
  revele: boolean;
}

export function AppOptimisation() {
  const [etat, setEtat] = useState<EtatSessionOptimisation>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Compteur de génération, dans la clé des écrans : « Générer » ou « Nouvel exercice » remonte
   * l'écran (champs vidés) même s'il reste sur la même phase. */
  const [generation, setGeneration] = useState(0);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables) — une entrée par écran
   * clos, dans l'ordre de `sequencePourExercice` (donc au même index que sa puce). Vidé à chaque
   * nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** `votreReponse` n'est poussé dans l'historique que lorsque l'écran se clôt réellement (jamais à
   * chaque essai raté). */
  function terminerEtape(nouvelEtat: EtatSessionOptimisation, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "identification"
          ? nouvelEtat.identificationRevele
          : etat.phase === "contrainteEtGrandeur"
            ? nouvelEtat.contrainteEtGrandeurRevele
            : etat.phase === "systeme"
              ? nouvelEtat.systemeRevele
              : etat.phase === "domaine"
                ? nouvelEtat.domaineRevele
                : etat.phase === "sommet"
                  ? nouvelEtat.sommetRevele
                  : etat.phase === "decision"
                    ? nouvelEtat.decisionRevele
                    : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.interpretationRevele;
      if (votreReponse !== undefined && etat.phase !== "interpretation") {
        const phaseClose = etat.phase;
        setHistorique((h) => [
          ...h,
          { titre: TITRE_PHASE[phaseClose], votreReponse, correcte: !revele, reponseAttendue: revele ? reponseAttenduePour(etat.exerciceCourant, phaseClose) : undefined },
        ]);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setGeneration((g) => g + 1);
      setHistorique([]);
    }
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function onGenererDev(familleId: string) {
    setEnAttente(null);
    setGeneration((g) => g + 1);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionOptimisation(REGLAGES_DEMO, () => construireAvecFamilleId(familleId as (typeof CATALOGUE_FAMILLES)[number]["id"])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const recapitulatif = calculerRecapitulatifOptimisation(etat);

  const reponseAttendue = reponseAttenduePour(exercice, phase);

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
        <h1 className="app-title">Problèmes d'optimisation (fonction du second degré)</h1>
        <p className="app-subtitle">Chapitre 1</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={recapitulatif} />
          {phase === "identification" && exercice.variante === "modelisation" ? (
            <EtapeIdentificationOptimisation
              key={`${generation}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxCourant(etat)}
              onValider={(reponse) => terminerEtape(soumettreReponseIdentification(etat, reponse), formatIdentification(exercice, reponse))}
              validation={validation}
            />
          ) : phase === "contrainteEtGrandeur" && exercice.variante === "modelisation" ? (
            <EtapeContrainteEtGrandeurOptimisation
              key={`${generation}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxCourant(etat)}
              niveauAide={etat.niveauAideContrainteEtGrandeur}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) =>
                terminerEtape(soumettreReponseContrainteEtGrandeur(etat, reponse), (
                  <>
                    {saisieLatex(reponse.texteEquation)}
                    <br />
                    {exercice.contexte.nomGrandeur} = {saisieLatex(reponse.texteGrandeur)}
                  </>
                ))
              }
              validation={validation}
            />
          ) : phase === "systeme" && exercice.variante === "modelisation" ? (
            <EtapeSystemeOptimisation
              key={`${generation}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxCourant(etat)}
              niveauAide={etat.niveauAideSysteme}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseSysteme(etat, texte), <>{exercice.contexte.nomGrandeur} = {saisieLatex(texte)}</>)}
              validation={validation}
            />
          ) : phase === "domaine" && exercice.variante === "modelisation" ? (
            <EtapeDomaineOptimisation
              key={`${generation}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxCourant(etat)}
              niveauAide={etat.niveauAideDomaine}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse), <Katex expression={`${exercice.contexte.labelVariable} \\in [${reponse.inf.trim().replace(".", "{,}")}\\,;\\,${reponse.sup.trim().replace(".", "{,}")}]`} />)}
              validation={validation}
            />
          ) : phase === "sommet" ? (
            <EtapeSommetOptimisation
              key={`${generation}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxCourant(etat)}
              niveauAide={etat.niveauAideSommet}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSommet(etat, reponse), <>S({reponse.x.trim()} ; {reponse.y.trim()})</>)}
              validation={validation}
            />
          ) : phase === "decision" ? (
            <EtapeDecisionOptimisation
              key={`${generation}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxCourant(etat)}
              niveauAide={etat.niveauAideDecision}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) =>
                terminerEtape(soumettreReponseDecision(etat, reponse), (
                  <>
                    {reponse.dansDomaine ? "Sommet dans le domaine" : "Sommet hors du domaine"}
                    <br />
                    Optimum : ({reponse.x.trim()} ; {reponse.y.trim()})
                  </>
                ))
              }
              validation={validation}
            />
          ) : phase === "interpretation" ? (
            <EtapeInterpretationOptimisation
              key={`${generation}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={tentativesMaxCourant(etat)}
              niveauAide={etat.niveauAideInterpretation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(indexChoisi) => terminerEtape(soumettreReponseInterpretation(etat, indexChoisi))}
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
