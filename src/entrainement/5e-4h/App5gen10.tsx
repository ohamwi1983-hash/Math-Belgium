import { useState } from "react";
import type { ReactNode } from "react";
import type {
  ExerciceEgaliteExpressions,
  ExerciceEquationTrig,
  ExerciceEquationTrigonometrique,
  ExerciceProduitFacteurs,
  ExercicePythagoricienne,
} from "./core5e/equationsTrigonometriques.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import {
  construireExerciceEgaliteExpressions,
  construireExercicePythagoricienne,
  genererExerciceEquationTrig,
  genererExerciceEquationTrigonometrique,
  genererExerciceProduitFacteurs,
} from "./generateurs5e/equationsTrigonometriques";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const GENERATEURS_FAMILLE: Record<string, () => ExerciceEquationTrigonometrique> = {
  directe: () => ({ famille: "directe", exercice: genererExerciceEquationTrig() }),
  produit: genererExerciceProduitFacteurs,
  pythagoricienne: construireExercicePythagoricienne,
  egalite: construireExerciceEgaliteExpressions,
};
const OPTIONS_FAMILLE = [
  { id: "directe", label: "Application directe" },
  { id: "produit", label: "Produit de facteurs" },
  { id: "pythagoricienne", label: "Substitution pythagoricienne" },
  { id: "egalite", label: "Égalité avec conversion" },
];
import {
  niveauAideMaxEquationTrig,
  activerAideSuivante,
  demarrerSessionEquationTrig,
  soumettreReponseArgument,
  soumettreReponseArgumentProduit,
  soumettreReponseConversionEgalite,
  soumettreReponseConversionPythagoricienne,
  soumettreReponseIsolerX,
  soumettreReponseIsolerXProduit,
  soumettreReponsePrefacteur,
  soumettreReponseRacinesPythagoricienne,
  soumettreReponseRacinesResolution,
  soumettreReponseReconnaissance,
  soumettreReponseResoudreEgalite,
  soumettreReponseSeparerFacteurs,
  soumettreReponseSolutions,
  soumettreReponseSolutionsEgalite,
  soumettreReponseSolutionsProduit,
  soumettreReponseSolutionsPythagoricienne,
} from "./moteur5e/sessionEquationTrig";
import {
  diagnostiquerArgument,
  diagnostiquerArgumentProduit,
  diagnostiquerConversionEgalite,
  diagnostiquerConversionPythagoricienne,
  diagnostiquerFactorisationProduit,
  diagnostiquerIsolerX,
  diagnostiquerIsolerXProduit,
  diagnostiquerRacinesPythagoricienne,
  diagnostiquerRacinesResolution,
  diagnostiquerResoudreEgalite,
  diagnostiquerSeparerFacteurs,
  diagnostiquerSolutions,
  diagnostiquerSolutionsEgalite,
  diagnostiquerSolutionsProduit,
  diagnostiquerSolutionsPythagoricienne,
} from "./moteur5e/verificationEquationTrig";
import type {
  ReponseArgument,
  ReponseDeuxFacteursArgument,
  ReponseDeuxFacteursLignes,
  ReponseRacine,
  ReponseRacinesPythagoricienne,
} from "./moteur5e/verificationEquationTrig";
import type {
  EtatSessionEquationTrigonometrique,
  PhaseEquationTrigonometrique,
} from "./moteur5e/typesEquationTrig";
import { phaseApres, phaseInitiale } from "./moteur5e/typesEquationTrig";
import { EtapeArgumentEquationTrig } from "./components5e/EtapeArgumentEquationTrig";
import { EtapeArgumentProduit } from "./components5e/EtapeArgumentProduit";
import { EtapeConversionEgalite } from "./components5e/EtapeConversionEgalite";
import { EtapeConversionPythagoricienne } from "./components5e/EtapeConversionPythagoricienne";
import { EtapeIsolerXEquationTrig } from "./components5e/EtapeIsolerXEquationTrig";
import { EtapeIsolerXProduit } from "./components5e/EtapeIsolerXProduit";
import { EtapePrefacteurProduit } from "./components5e/EtapePrefacteurProduit";
import { EtapeRacinesPythagoricienne } from "./components5e/EtapeRacinesPythagoricienne";
import { EtapeRacinesResolutionPythagoricienne } from "./components5e/EtapeRacinesResolutionPythagoricienne";
import { EtapeReconnaissanceEquationTrig } from "./components5e/EtapeReconnaissanceEquationTrig";
import { EtapeResoudreEgalite } from "./components5e/EtapeResoudreEgalite";
import { EtapeSepararFacteursProduit } from "./components5e/EtapeSepararFacteursProduit";
import { EtapeSolutionsEgalite } from "./components5e/EtapeSolutionsEgalite";
import { EtapeSolutionsEquationTrig } from "./components5e/EtapeSolutionsEquationTrig";
import { EtapeSolutionsProduit } from "./components5e/EtapeSolutionsProduit";
import { EtapeSolutionsPythagoricienne } from "./components5e/EtapeSolutionsPythagoricienne";
import { Katex } from "./components/Katex";
import {
  OPTIONS_FAMILLE as OPTIONS_FAMILLE_RECAP,
  TEXTE_ARGUMENT_AUCUNE_SOLUTION,
  formatAidePrefacteurNiveau2Latex,
  formatAideResoudreEgaliteNiveau2Latex,
  formatAideSepararFacteursNiveau2Latex,
  formatEquationConvertieEgaliteLatex,
  formatPolynomeCibleLatex,
  formatSolutionsTexte,
  formatTermesArgumentDirecteLatex,
  formatTermesArgumentProduitLatex,
  formatTermesRacinesResolutionLatex,
  formatTermesRacinesTLatex,
  formatTermesXDirecteLatex,
  formatTermesXProduitLatex,
  regimeProduit,
} from "./ui5e/formatEquationTrigonometrique";
import { calculerRecapitulatifEquationTrig } from "./ui5e/recapitulatifEquationTrig";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionEquationTrigonometrique {
  return demarrerSessionEquationTrig(REGLAGES_DEMO, genererExerciceEquationTrigonometrique);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationTrigonometrique;
  revele: boolean;
}

function commeDirecte(exercice: ExerciceEquationTrigonometrique): ExerciceEquationTrig {
  if (exercice.famille !== "directe") throw new Error("commeDirecte : exercice hors famille 'directe'");
  return exercice.exercice;
}
function commeProduit(exercice: ExerciceEquationTrigonometrique): ExerciceProduitFacteurs {
  if (exercice.famille !== "produit") throw new Error("commeProduit : exercice hors famille 'produit'");
  return exercice;
}
function commePythagoricienne(exercice: ExerciceEquationTrigonometrique): ExercicePythagoricienne {
  if (exercice.famille !== "pythagoricienne") throw new Error("commePythagoricienne : exercice hors famille 'pythagoricienne'");
  return exercice;
}
function commeEgalite(exercice: ExerciceEquationTrigonometrique): ExerciceEgaliteExpressions {
  if (exercice.famille !== "egalite") throw new Error("commeEgalite : exercice hors famille 'egalite'");
  return exercice;
}

/** Repris tel quel de l'ancien `ResultatPanelEquationTrig.tsx` (`TermesInline`, non exporté) —
 * plusieurs fragments LaTeX rendus INLINE séparés par une simple virgule, jamais un unique
 * `\quad`-joined (débordement mobile, convention transversale du projet). */
function TermesInline({ termes }: { termes: string[] }) {
  if (termes.length === 0) return null;
  return (
    <>
      {termes.map((t, i) => (
        <span key={i}>
          {i > 0 && ", "}
          <Katex expression={t} />
        </span>
      ))}
    </>
  );
}

function labelFamilleRecap(famille: ExerciceEquationTrigonometrique["famille"]): string {
  return OPTIONS_FAMILLE_RECAP.find((o) => o.id === famille)?.label ?? famille;
}

/** Reproduit exactement ce que `ResultatPanelEquationTrig.tsx` (`LignesRecap`) affichait pour UNE
 * phase donnée, scopé à l'exercice/phase qui vient juste de se terminer (`etat.exerciceCourant`/
 * `etat.phase`, jamais `enAttente.etatSuivant`). */
function reponseAttenduePhase(exercice: ExerciceEquationTrigonometrique, phase: PhaseEquationTrigonometrique): ReactNode {
  if (phase === "reconnaissance") return labelFamilleRecap(exercice.famille);

  if (exercice.famille === "directe") {
    const ex = commeDirecte(exercice);
    if (phase === "argument") return ex.aucuneSolution ? TEXTE_ARGUMENT_AUCUNE_SOLUTION : <TermesInline termes={formatTermesArgumentDirecteLatex(ex)} />;
    if (phase === "isolerX") return <TermesInline termes={formatTermesXDirecteLatex(ex)} />;
    if (phase === "solutions") return formatSolutionsTexte(ex.solutions, ex.regime);
  }
  if (exercice.famille === "produit") {
    const ex = commeProduit(exercice);
    if (phase === "prefacteur") return <Katex expression={formatAidePrefacteurNiveau2Latex(ex)} />;
    if (phase === "separerFacteurs") return <TermesInline termes={formatAideSepararFacteursNiveau2Latex(ex)} />;
    if (phase === "argumentProduit") return <TermesInline termes={formatTermesArgumentProduitLatex(ex)} />;
    if (phase === "isolerXProduit") return <TermesInline termes={formatTermesXProduitLatex(ex)} />;
    if (phase === "solutionsProduit") return formatSolutionsTexte(ex.solutionsUnion, regimeProduit(ex));
  }
  if (exercice.famille === "pythagoricienne") {
    const ex = commePythagoricienne(exercice);
    if (phase === "conversionPythagoricienne") return <Katex expression={formatPolynomeCibleLatex(ex)} />;
    if (phase === "racinesPythagoricienne") return <TermesInline termes={formatTermesRacinesTLatex(ex)} />;
    if (phase === "racinesResolution") return <TermesInline termes={formatTermesRacinesResolutionLatex(ex)} />;
    if (phase === "solutionsPythagoricienne") return formatSolutionsTexte(ex.solutionsUnion, "exact");
  }
  if (exercice.famille === "egalite") {
    const ex = commeEgalite(exercice);
    if (phase === "conversionEgalite") return <Katex expression={formatEquationConvertieEgaliteLatex(ex)} />;
    if (phase === "resoudreEgalite") return <TermesInline termes={formatAideResoudreEgaliteNiveau2Latex(ex)} />;
    if (phase === "solutionsEgalite") return formatSolutionsTexte(ex.solutions, "exact");
  }
  return null;
}

/** Marche la vraie séquence de phases de CETTE instance en suivant `phaseInitiale`/`phaseApres`
 * (moteur, `moteur5e/typesEquationTrig.ts`) pas à pas jusqu'à "termine" — jamais une table
 * recopiée à la main (la séquence dépend de la famille ET de sauts conditionnels, ex.
 * `aucuneSolution`/`sousCas`, voir le commentaire en tête de ce fichier moteur). */
function ordrePhasesPourExercice(exercice: ExerciceEquationTrigonometrique): PhaseEquationTrigonometrique[] {
  const ordre: PhaseEquationTrigonometrique[] = [];
  let phase: PhaseEquationTrigonometrique | "termine" = phaseInitiale();
  while (phase !== "termine") {
    ordre.push(phase);
    phase = phaseApres(exercice, phase);
  }
  return ordre;
}

/** Même ternaire que `calculerRecapitulatifEquationTrig` (`scoresPartiels[phase] === 0 ⟺
 * révélée`). "aide" (3e état, jaune) dès que la phase a été close avec de l'aide — le moteur ne
 * garde `niveauAide` que de façon TRANSITOIRE (remis à 0 à chaque transition de phase, voir
 * `typesEquationTrig.ts`), donc capturé localement par phase dans `aideUtiliseeParPhase`
 * (ci-dessous dans le composant, jamais recalculé depuis `etat` seul). */
function calculerSegmentsProgression(
  etat: EtatSessionEquationTrigonometrique,
  aideUtiliseeParPhase: Partial<Record<PhaseEquationTrigonometrique, boolean>>,
): EtatPuceProgression[] {
  return ordrePhasesPourExercice(etat.exerciceCourant).map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = etat.scoresPartiels[phase];
    if (score === undefined) return "a-venir";
    if (score === 0) return "revele";
    return aideUtiliseeParPhase[phase] ? "aide" : "correcte";
  });
}

/** Formateurs locaux "votreReponse" (point 4 de la fonctionnalité 1) — un format court et clair,
 * toujours dérivé directement de la réponse typée fournie à `onValider`, jamais recalculé via le
 * moteur. */
function formatReponseArgument(reponse: ReponseArgument): string {
  return reponse.aucuneSolution ? "Aucune solution" : reponse.lignes.join(" ; ");
}
function formatReponseDeuxFacteursArgument(reponse: ReponseDeuxFacteursArgument): string {
  return `Facteur 1 : ${formatReponseArgument(reponse.facteur1)} — Facteur 2 : ${formatReponseArgument(reponse.facteur2)}`;
}
function formatReponseDeuxFacteursLignes(reponse: ReponseDeuxFacteursLignes): string {
  return `Facteur 1 : ${reponse.facteur1.join(" ; ")} — Facteur 2 : ${reponse.facteur2.join(" ; ")}`;
}
function formatReponseUneRacine(racine: ReponseRacine): string {
  return racine.rejeter ? "rejetée" : racine.lignes.join(" ; ");
}
function formatReponseRacinesPythagoricienne(reponse: ReponseRacinesPythagoricienne): string {
  return `t₁ : ${formatReponseUneRacine(reponse.racine1)} — t₂ : ${formatReponseUneRacine(reponse.racine2)}`;
}

export function App5gen10() {
  const [etat, setEtat] = useState<EtatSessionEquationTrigonometrique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionEquationTrigonometrique`, jamais dans le moteur. Remis à vide à
   * chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Capture locale de `etat.niveauAide > 0` pour chaque phase CLOSE (le moteur remet
   * `niveauAide` à 0 dès la transition — voir le commentaire de `calculerSegmentsProgression`).
   * Remis à vide aux mêmes endroits que `historique`. */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseEquationTrigonometrique, boolean>>>({});

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (même garde
   * qu'`AppAnalyseFonction.tsx`). Réutilise `calculerRecapitulatifEquationTrig` pour la réponse
   * ATTENDUE : l'entrée qui vient d'être ajoutée est toujours la dernière du tableau. */
  function terminerEtape(nouvelEtat: EtatSessionEquationTrigonometrique, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereEtapeRevelee;
      setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: etat.niveauAide > 0 }));
      if (votreReponse !== undefined) {
        const recap = calculerRecapitulatifEquationTrig(nouvelEtat);
        const derniere = recap[recap.length - 1];
        if (derniere) {
          setHistorique((h) => [
            ...h,
            {
              titre: derniere.libelle,
              votreReponse,
              correcte: !derniere.revele,
              reponseAttendue: derniere.revele ? (derniere.estLatex ? <Katex expression={derniere.valeur} /> : derniere.valeur) : undefined,
            },
          ]);
        }
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele });
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

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Équations trigonométriques</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev
        options={OPTIONS_FAMILLE}
        onGenerer={(id) => {
          setEnAttente(null);
          setHistorique([]);
          setAideUtiliseeParPhase({});
          setEtat(demarrerSessionEquationTrig(REGLAGES_DEMO, GENERATEURS_FAMILLE[id]));
        }}
      />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifEquationTrig(etat)} />
          {etat.phase === "reconnaissance" && (
            <EtapeReconnaissanceEquationTrig
              key={cleEcran}
              exercice={exercice}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              onValider={(choix) => terminerEtape(soumettreReponseReconnaissance(etat, choix), labelFamilleRecap(choix))}
              validation={validation}
            />
          )}

          {etat.phase === "argument" && (
            <EtapeArgumentEquationTrig
              key={cleEcran}
              exercice={commeDirecte(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseArgument(etat, reponse), formatReponseArgument(reponse))}
              diagnostiquer={(reponse) => diagnostiquerArgument(commeDirecte(exercice), reponse)}
              validation={validation}
            />
          )}
          {etat.phase === "isolerX" && (
            <EtapeIsolerXEquationTrig
              key={cleEcran}
              exercice={commeDirecte(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(lignes) => terminerEtape(soumettreReponseIsolerX(etat, lignes), lignes.join(" ; "))}
              diagnostiquer={(lignes) => diagnostiquerIsolerX(commeDirecte(exercice), lignes)}
              validation={validation}
            />
          )}
          {etat.phase === "solutions" && (
            <EtapeSolutionsEquationTrig
              key={cleEcran}
              exercice={commeDirecte(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(textes) => terminerEtape(soumettreReponseSolutions(etat, textes), textes.join(" ; "))}
              diagnostiquer={(textes) => diagnostiquerSolutions(commeDirecte(exercice), textes)}
              validation={validation}
            />
          )}

          {etat.phase === "prefacteur" && (
            <EtapePrefacteurProduit
              key={cleEcran}
              exercice={commeProduit(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponsePrefacteur(etat, texte), texte)}
              diagnostiquer={(texte) => diagnostiquerFactorisationProduit(commeProduit(exercice), texte)}
              validation={validation}
            />
          )}
          {etat.phase === "separerFacteurs" && (
            <EtapeSepararFacteursProduit
              key={cleEcran}
              exercice={commeProduit(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(lignes) => terminerEtape(soumettreReponseSeparerFacteurs(etat, lignes), lignes.join(" ; "))}
              diagnostiquer={(lignes) => diagnostiquerSeparerFacteurs(commeProduit(exercice), lignes)}
              validation={validation}
            />
          )}
          {etat.phase === "argumentProduit" && (
            <EtapeArgumentProduit
              key={cleEcran}
              exercice={commeProduit(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseArgumentProduit(etat, reponse), formatReponseDeuxFacteursArgument(reponse))}
              diagnostiquer={(reponse) => diagnostiquerArgumentProduit(commeProduit(exercice), reponse)}
              validation={validation}
            />
          )}
          {etat.phase === "isolerXProduit" && (
            <EtapeIsolerXProduit
              key={cleEcran}
              exercice={commeProduit(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIsolerXProduit(etat, reponse), formatReponseDeuxFacteursLignes(reponse))}
              diagnostiquer={(reponse) => diagnostiquerIsolerXProduit(commeProduit(exercice), reponse)}
              validation={validation}
            />
          )}
          {etat.phase === "solutionsProduit" && (
            <EtapeSolutionsProduit
              key={cleEcran}
              exercice={commeProduit(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(textes) => terminerEtape(soumettreReponseSolutionsProduit(etat, textes), textes.join(" ; "))}
              diagnostiquer={(textes) => diagnostiquerSolutionsProduit(commeProduit(exercice), textes)}
              validation={validation}
            />
          )}

          {etat.phase === "conversionPythagoricienne" && (
            <EtapeConversionPythagoricienne
              key={cleEcran}
              exercice={commePythagoricienne(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseConversionPythagoricienne(etat, texte), texte)}
              diagnostiquer={(texte) => diagnostiquerConversionPythagoricienne(commePythagoricienne(exercice), texte)}
              validation={validation}
            />
          )}
          {etat.phase === "racinesPythagoricienne" && (
            <EtapeRacinesPythagoricienne
              key={cleEcran}
              exercice={commePythagoricienne(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(textes) => terminerEtape(soumettreReponseRacinesPythagoricienne(etat, textes), textes.join(" ; "))}
              diagnostiquer={(textes) => diagnostiquerRacinesPythagoricienne(commePythagoricienne(exercice), textes)}
              validation={validation}
            />
          )}
          {etat.phase === "racinesResolution" && (
            <EtapeRacinesResolutionPythagoricienne
              key={cleEcran}
              exercice={commePythagoricienne(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseRacinesResolution(etat, reponse), formatReponseRacinesPythagoricienne(reponse))}
              diagnostiquer={(reponse) => diagnostiquerRacinesResolution(commePythagoricienne(exercice), reponse)}
              validation={validation}
            />
          )}
          {etat.phase === "solutionsPythagoricienne" && (
            <EtapeSolutionsPythagoricienne
              key={cleEcran}
              exercice={commePythagoricienne(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(textes) => terminerEtape(soumettreReponseSolutionsPythagoricienne(etat, textes), textes.join(" ; "))}
              diagnostiquer={(textes) => diagnostiquerSolutionsPythagoricienne(commePythagoricienne(exercice), textes)}
              validation={validation}
            />
          )}

          {etat.phase === "conversionEgalite" && (
            <EtapeConversionEgalite
              key={cleEcran}
              exercice={commeEgalite(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseConversionEgalite(etat, texte), texte)}
              diagnostiquer={(texte) => diagnostiquerConversionEgalite(commeEgalite(exercice), texte)}
              validation={validation}
            />
          )}
          {etat.phase === "resoudreEgalite" && (
            <EtapeResoudreEgalite
              key={cleEcran}
              exercice={commeEgalite(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(lignes) => terminerEtape(soumettreReponseResoudreEgalite(etat, lignes), lignes.join(" ; "))}
              diagnostiquer={(lignes) => diagnostiquerResoudreEgalite(commeEgalite(exercice), lignes)}
              validation={validation}
            />
          )}
          {etat.phase === "solutionsEgalite" && (
            <EtapeSolutionsEgalite
              key={cleEcran}
              exercice={commeEgalite(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMaxEquationTrig(exercice, etat.phase)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(textes) => terminerEtape(soumettreReponseSolutionsEgalite(etat, textes), textes.join(" ; "))}
              diagnostiquer={(textes) => diagnostiquerSolutionsEgalite(commeEgalite(exercice), textes)}
              validation={validation}
            />
          )}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
