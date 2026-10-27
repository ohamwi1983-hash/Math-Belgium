import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceSuiteGeometrique } from "./generateurs5e/suitesGeometriques";
import type { FamilleSuiteGeometriqueId } from "./generateurs5e/suitesGeometriques";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  niveauAideMaxSuiteGeometrique,
  activerAideSuivante,
  ciblesCalculerTermesAlgebrique,
  demarrerSessionSuiteGeometrique,
  soumettreReponseCalculerSn,
  soumettreReponseCalculerTermesAlgebrique,
  soumettreReponseFormuleGenerale,
  soumettreReponseFormuleGeneraleB1,
  soumettreReponseFormuleGeneraleB2,
  soumettreReponsePoserEquationAlgebrique,
  soumettreReponsePoserEquationRangN,
  soumettreReponseResoudreRangN,
  soumettreReponseResoudreXAlgebrique,
  soumettreReponseSommeInfinie,
  soumettreReponseSommeInfinieB1,
  soumettreReponseSommeInfinieB2,
  soumettreReponseSommeSn,
  soumettreReponseSommeSnB1,
  soumettreReponseSommeSnB2,
  soumettreReponseTermeEloigne,
  soumettreReponseTermeEloigneB1,
  soumettreReponseTermeEloigneB2,
  soumettreReponseTermesProches,
  soumettreReponseTermesProchesB1,
  soumettreReponseTermesProchesB2,
  soumettreReponseTrouverQ,
  soumettreReponseTrouverU1,
  soumettreReponseTrouverU1B1,
  soumettreReponseTrouverU1B2,
} from "./moteur5e/sessionSuiteGeometrique";
import type { ReponseEquation } from "./moteur5e/sessionSuiteGeometrique";
import { ordreComplet } from "./moteur5e/typesSuiteGeometrique";
import type { EtatSessionSuiteGeometrique, PhaseSuiteGeometrique } from "./moteur5e/typesSuiteGeometrique";
import {
  diagnostiquerEquationComplete,
  diagnostiquerEquationCompleteEnN,
  diagnostiquerFormuleGenerale,
  diagnostiquerNombre,
  diagnostiquerRangEntierPositif,
  diagnostiquerSommeInfinie,
  diagnostiquerSommeSn,
  diagnostiquerTermes,
  diagnostiquerTrouverQ,
} from "./moteur5e/verificationSuiteGeometrique";
import type { ReponseSommeInfinie } from "./moteur5e/verificationSuiteGeometrique";
import type { StatutVerification } from "./moteur/statutVerification";
import type { BrancheSuiteGeometrique, ExercicePrincipalSuiteGeometrique, ExerciceSuiteGeometrique } from "./core5e/suitesGeometriques.types";
import {
  diviserFractionQ,
  entierVersFractionQ,
  fractionQVersNombre,
  multiplierFractionQ,
  puissanceFractionQ,
  soustraireFractionQ,
  termeGeometriqueQ,
} from "./generateurs5e/suitesGeometriques/fraction";
import { EtapeChampSimpleSuiteGeometrique } from "./components5e/EtapeChampSimpleSuiteGeometrique";
import { EtapePoserEquationGeometrique } from "./components5e/EtapePoserEquationGeometrique";
import { EtapeSommeInfinie } from "./components5e/EtapeSommeInfinie";
import { EtapeTermesMultiplesSuiteGeometrique } from "./components5e/EtapeTermesMultiplesSuiteGeometrique";
import { EtapeTrouverQ } from "./components5e/EtapeTrouverQ";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { formatTermesReponseAttendueSuiteGeometrique } from "./ui5e/formatSuiteGeometrique";
import { calculerRecapitulatifSuiteGeometrique } from "./ui5e/recapitulatifSuiteGeometrique";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

const PHASES_CHAMP_SIMPLE = new Set<PhaseSuiteGeometrique>([
  "trouverU1",
  "trouverU1B1",
  "trouverU1B2",
  "formuleGenerale",
  "formuleGeneraleB1",
  "formuleGeneraleB2",
  "termeEloigne",
  "termeEloigneB1",
  "termeEloigneB2",
  "sommeSn",
  "sommeSnB1",
  "sommeSnB2",
  "resoudreXAlgebrique",
  "calculerSn",
  "resoudreRangN",
]);

const PHASES_TERMES_MULTIPLES = new Set<PhaseSuiteGeometrique>(["termesProches", "termesProchesB1", "termesProchesB2", "calculerTermesAlgebrique"]);
const PHASES_SOMME_INFINIE = new Set<PhaseSuiteGeometrique>(["sommeInfinie", "sommeInfinieB1", "sommeInfinieB2"]);
const PHASES_POSER_EQUATION = new Set<PhaseSuiteGeometrique>(["poserEquationAlgebrique", "poserEquationRangN"]);

/**
 * Statuts à 3 valeurs (A.1, `promptcorrectionsregroupees.md`) — wiring PRÉSENTATION uniquement,
 * jamais consommé par le score/les tentatives. Réutilise DIRECTEMENT les fonctions déjà exportées
 * par `verificationSuiteGeometrique.ts` — cibles/branches extraites ici avec EXACTEMENT la même
 * logique que `moteur5e/sessionSuiteGeometrique.ts` (`brancheActive`, répliquée localement, même
 * principe de duplication déjà établi entre les couches présentation/session/moteur de ce fichier).
 */
function brancheActiveGeo(exercice: ExercicePrincipalSuiteGeometrique, phase: PhaseSuiteGeometrique): BrancheSuiteGeometrique {
  const index = phase.endsWith("B2") ? 1 : 0;
  return exercice.branches[index];
}
/** Réplique EXACTE (fractions) — conversion en flottant réservée au point de comparaison avec la
 * saisie de l'élève, voir `prompt5gen155gen16arithmetiqueexacte.md`. */
function termeGeometriqueLocal(u1: BrancheSuiteGeometrique["u1"], q: BrancheSuiteGeometrique["q"], n: number): number {
  return fractionQVersNombre(termeGeometriqueQ(u1, q, n));
}

/** Coefficients (pente, constante) de l'équation CIBLE — même calcul que `sessionSuiteGeometrique.ts`
 * (petite duplication assumée, présentation pure, jamais un import moteur→générateur). */
function penteConstanteEquationAlgebrique(exercice: Extract<ExerciceSuiteGeometrique, { famille: "algebriqueTermeGeneral" | "algebriqueSommeSn" }>): {
  pente: number;
  constante: number;
} {
  if (exercice.famille === "algebriqueTermeGeneral") {
    const { up, un, p, n, q } = exercice;
    const C = puissanceFractionQ(q, n - p);
    const pente = soustraireFractionQ(entierVersFractionQ(un.a), multiplierFractionQ(C, entierVersFractionQ(up.a)));
    const constante = soustraireFractionQ(un.b, multiplierFractionQ(C, entierVersFractionQ(up.b)));
    return { pente: fractionQVersNombre(pente), constante: fractionQVersNombre(constante) };
  }
  if (exercice.sousCas === "A") {
    const { u1, q, n, k } = exercice;
    const C = diviserFractionQ(soustraireFractionQ(puissanceFractionQ(q, n), entierVersFractionQ(1)), soustraireFractionQ(q, entierVersFractionQ(1)));
    const pente = multiplierFractionQ(C, entierVersFractionQ(u1.a));
    const constante = soustraireFractionQ(multiplierFractionQ(C, entierVersFractionQ(u1.b)), k);
    return { pente: fractionQVersNombre(pente), constante: fractionQVersNombre(constante) };
  }
  const { sn, k } = exercice;
  return { pente: sn.a, constante: fractionQVersNombre(soustraireFractionQ(sn.b, k)) };
}

function diagnostiquerChampSimpleGeo(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique, texte: string): StatutVerification {
  if (phase === "trouverU1" || phase === "trouverU1B1" || phase === "trouverU1B2") {
    if (exercice.famille !== "principal") return "parse_error";
    return diagnostiquerNombre(texte, fractionQVersNombre(brancheActiveGeo(exercice, phase).u1));
  }
  if (phase === "formuleGenerale" || phase === "formuleGeneraleB1" || phase === "formuleGeneraleB2") {
    if (exercice.famille !== "principal") return "parse_error";
    const { u1, q } = brancheActiveGeo(exercice, phase);
    return diagnostiquerFormuleGenerale(u1, q, texte);
  }
  if (phase === "termeEloigne" || phase === "termeEloigneB1" || phase === "termeEloigneB2") {
    if (exercice.famille !== "principal") return "parse_error";
    const { u1, q } = brancheActiveGeo(exercice, phase);
    return diagnostiquerNombre(texte, termeGeometriqueLocal(u1, q, exercice.indiceTermeEloigne));
  }
  if (phase === "sommeSn" || phase === "sommeSnB1" || phase === "sommeSnB2") {
    if (exercice.famille !== "principal") return "parse_error";
    const { u1, q } = brancheActiveGeo(exercice, phase);
    return diagnostiquerSommeSn(u1, q, exercice.indiceSn, texte);
  }
  if (phase === "resoudreXAlgebrique") {
    return exercice.famille !== "algebriqueTermeGeneral" && exercice.famille !== "algebriqueSommeSn"
      ? "parse_error"
      : diagnostiquerNombre(texte, fractionQVersNombre(exercice.xReel));
  }
  if (phase === "calculerSn") {
    return exercice.famille !== "algebriqueSommeSn" || exercice.sousCas !== "B"
      ? "parse_error"
      : diagnostiquerNombre(texte, fractionQVersNombre(exercice.k));
  }
  if (phase === "resoudreRangN") {
    return exercice.famille !== "algebriqueRangN" ? "parse_error" : diagnostiquerRangEntierPositif(texte, exercice.n);
  }
  return "parse_error";
}

function diagnostiquerTermesMultiplesGeo(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique, textes: string[]): StatutVerification {
  if (phase === "termesProches" || phase === "termesProchesB1" || phase === "termesProchesB2") {
    if (exercice.famille !== "principal") return "parse_error";
    const { u1, q } = brancheActiveGeo(exercice, phase);
    const cibles = exercice.indicesTermesProches.map((n) => termeGeometriqueLocal(u1, q, n));
    return diagnostiquerTermes(textes, cibles);
  }
  if (phase === "calculerTermesAlgebrique") {
    if (exercice.famille !== "algebriqueTermeGeneral" && exercice.famille !== "algebriqueSommeSn") return "parse_error";
    return diagnostiquerTermes(textes, ciblesCalculerTermesAlgebrique(exercice));
  }
  return "parse_error";
}

function diagnostiquerSommeInfinieGeo(
  exercice: ExerciceSuiteGeometrique,
  phase: PhaseSuiteGeometrique,
  reponse: ReponseSommeInfinie,
): StatutVerification {
  if (exercice.famille !== "principal") return "parse_error";
  const { u1, q } = brancheActiveGeo(exercice, phase);
  return diagnostiquerSommeInfinie(u1, q, reponse);
}

function diagnostiquerPoserEquationGeo(
  exercice: ExerciceSuiteGeometrique,
  phase: "poserEquationAlgebrique" | "poserEquationRangN",
  reponse: ReponseEquation,
): StatutVerification {
  if (phase === "poserEquationRangN") {
    if (exercice.famille !== "algebriqueRangN") return "parse_error";
    return diagnostiquerEquationCompleteEnN(reponse.texte, exercice.u1, fractionQVersNombre(exercice.q), exercice.k);
  }
  if (exercice.famille !== "algebriqueTermeGeneral" && exercice.famille !== "algebriqueSommeSn") return "parse_error";
  const { pente, constante } = penteConstanteEquationAlgebrique(exercice);
  return diagnostiquerEquationComplete(reponse.texte, pente, constante);
}

/**
 * A.2 (surlignage rouge par champ) — diagnostics INDÉPENDANTS champ par champ, jamais consommés par
 * le score/les tentatives.
 */
function diagnostiquerChampTermesMultiplesGeo(
  exercice: ExerciceSuiteGeometrique,
  phase: PhaseSuiteGeometrique,
  index: number,
  texte: string,
): StatutVerification {
  if (phase === "termesProches" || phase === "termesProchesB1" || phase === "termesProchesB2") {
    if (exercice.famille !== "principal") return "parse_error";
    const { u1, q } = brancheActiveGeo(exercice, phase);
    return diagnostiquerNombre(texte, termeGeometriqueLocal(u1, q, exercice.indicesTermesProches[index]));
  }
  if (phase === "calculerTermesAlgebrique") {
    if (exercice.famille !== "algebriqueTermeGeneral" && exercice.famille !== "algebriqueSommeSn") return "parse_error";
    const cibles = ciblesCalculerTermesAlgebrique(exercice);
    return diagnostiquerNombre(texte, cibles[index]);
  }
  return "parse_error";
}

function diagnostiquerChampTrouverQ(exercice: ExerciceSuiteGeometrique, texte: string): StatutVerification {
  if (exercice.famille !== "principal") return "parse_error";
  for (const cible of exercice.branches.map((b) => fractionQVersNombre(b.q))) {
    if (diagnostiquerNombre(texte, cible) === "correct") return "correct";
  }
  return diagnostiquerNombre(texte, fractionQVersNombre(exercice.branches[0].q)) === "parse_error" ? "parse_error" : "not_equivalent";
}

function nouvelleSession(): EtatSessionSuiteGeometrique {
  return demarrerSessionSuiteGeometrique(REGLAGES_DEMO, genererExerciceSuiteGeometrique);
}

/** Puces de progression — pas de `ORDRE_PHASES` statique (même raison que 5gen14) : la séquence
 * réelle dépend de `exercice.famille`/`combo`/`statutQ` (branches B1/B2 dupliquées), donc toujours
 * recalculée via `ordreComplet(exercice)`. Révélation lue depuis `etat.revelesPartiels[phase]`
 * (peuplé depuis `etapeCourante.revelee` à la clôture de chaque phase,
 * `sessionSuiteGeometrique.ts::soumettreEcran`) — jamais `score === 0`, même correctif que
 * `calculerRecapitulatifSuiteGeometrique` (point A, balayage générique). */
function calculerSegmentsProgression(
  etat: EtatSessionSuiteGeometrique,
  aideUtiliseeParPhase: Partial<Record<PhaseSuiteGeometrique, boolean>>,
): EtatPuceProgression[] {
  return ordreComplet(etat.exerciceCourant).map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = etat.scoresPartiels[phase];
    if (score === undefined) return "a-venir";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideUtiliseeParPhase[phase] ? "aide" : "correcte";
  });
}

/** Formateurs locaux "votreReponse" — un format court dérivé directement de la réponse typée. */
function formatReponseSommeInfinie(reponse: ReponseSommeInfinie): string {
  return reponse.existe ? reponse.valeur : "N'existe pas";
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionSuiteGeometrique;
  revele: boolean;
}

function soumettreChampSimple(etat: EtatSessionSuiteGeometrique, phase: PhaseSuiteGeometrique, texte: string): EtatSessionSuiteGeometrique {
  switch (phase) {
    case "trouverU1":
      return soumettreReponseTrouverU1(etat, texte);
    case "trouverU1B1":
      return soumettreReponseTrouverU1B1(etat, texte);
    case "trouverU1B2":
      return soumettreReponseTrouverU1B2(etat, texte);
    case "formuleGenerale":
      return soumettreReponseFormuleGenerale(etat, texte);
    case "formuleGeneraleB1":
      return soumettreReponseFormuleGeneraleB1(etat, texte);
    case "formuleGeneraleB2":
      return soumettreReponseFormuleGeneraleB2(etat, texte);
    case "termeEloigne":
      return soumettreReponseTermeEloigne(etat, texte);
    case "termeEloigneB1":
      return soumettreReponseTermeEloigneB1(etat, texte);
    case "termeEloigneB2":
      return soumettreReponseTermeEloigneB2(etat, texte);
    case "sommeSn":
      return soumettreReponseSommeSn(etat, texte);
    case "sommeSnB1":
      return soumettreReponseSommeSnB1(etat, texte);
    case "sommeSnB2":
      return soumettreReponseSommeSnB2(etat, texte);
    case "resoudreXAlgebrique":
      return soumettreReponseResoudreXAlgebrique(etat, texte);
    case "calculerSn":
      return soumettreReponseCalculerSn(etat, texte);
    case "resoudreRangN":
      return soumettreReponseResoudreRangN(etat, texte);
    default:
      return etat;
  }
}

function soumettreTermesMultiples(etat: EtatSessionSuiteGeometrique, phase: PhaseSuiteGeometrique, textes: string[]): EtatSessionSuiteGeometrique {
  switch (phase) {
    case "termesProches":
      return soumettreReponseTermesProches(etat, textes);
    case "termesProchesB1":
      return soumettreReponseTermesProchesB1(etat, textes);
    case "termesProchesB2":
      return soumettreReponseTermesProchesB2(etat, textes);
    case "calculerTermesAlgebrique":
      return soumettreReponseCalculerTermesAlgebrique(etat, textes);
    default:
      return etat;
  }
}

function soumettreSommeInfinie(
  etat: EtatSessionSuiteGeometrique,
  phase: PhaseSuiteGeometrique,
  reponse: ReponseSommeInfinie,
): EtatSessionSuiteGeometrique {
  switch (phase) {
    case "sommeInfinie":
      return soumettreReponseSommeInfinie(etat, reponse);
    case "sommeInfinieB1":
      return soumettreReponseSommeInfinieB1(etat, reponse);
    case "sommeInfinieB2":
      return soumettreReponseSommeInfinieB2(etat, reponse);
    default:
      return etat;
  }
}

function soumettrePoserEquation(
  etat: EtatSessionSuiteGeometrique,
  phase: "poserEquationAlgebrique" | "poserEquationRangN",
  reponse: ReponseEquation,
): EtatSessionSuiteGeometrique {
  if (phase === "poserEquationRangN") return soumettreReponsePoserEquationRangN(etat, reponse);
  return soumettreReponsePoserEquationAlgebrique(etat, reponse);
}

export function App5gen15() {
  const [etat, setEtat] = useState<EtatSessionSuiteGeometrique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionSuiteGeometrique`, jamais dans le moteur. Remis à vide à chaque
   * nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Capture locale de `etat.niveauAide > 0` pour chaque phase CLOSE — le moteur remet
   * `niveauAide` à 0 à chaque transition de phase (même mécanique que les autres générateurs de
   * ce chantier). */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseSuiteGeometrique, boolean>>>({});

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (même garde
   * qu'`AppAnalyseFonction.tsx`). Réutilise `calculerRecapitulatifSuiteGeometrique` pour la réponse
   * ATTENDUE. */
  function terminerEtape(nouvelEtat: EtatSessionSuiteGeometrique, votreReponse?: string) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereEtapeRevelee;
      setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: etat.niveauAide > 0 }));
      if (votreReponse !== undefined) {
        const recap = calculerRecapitulatifSuiteGeometrique(nouvelEtat);
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

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParPhase({});
    setEtat(demarrerSessionSuiteGeometrique(REGLAGES_DEMO, () => construireAvecFamilleId(id as FamilleSuiteGeometriqueId)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatTermesReponseAttendueSuiteGeometrique(exercice, phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Suites géométriques, formule générale et termes</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifSuiteGeometrique(etat)} />
          <>
              {PHASES_CHAMP_SIMPLE.has(phase) && (
                <EtapeChampSimpleSuiteGeometrique
                  key={cleEcran}
                  exercice={exercice}
                  phase={phase}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteGeometrique(phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreChampSimple(etat, phase, texte), texte)}
                  diagnostiquer={(texte) => diagnostiquerChampSimpleGeo(exercice, phase, texte)}
                  validation={validation}
                />
              )}
              {PHASES_CHAMP_SIMPLE.has(phase) && <CalculatriceScientifique />}

              {PHASES_TERMES_MULTIPLES.has(phase) && (
                <EtapeTermesMultiplesSuiteGeometrique
                  key={cleEcran}
                  exercice={exercice}
                  phase={phase}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteGeometrique(phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreTermesMultiples(etat, phase, textes), textes.join(" ; "))}
                  diagnostiquer={(textes) => diagnostiquerTermesMultiplesGeo(exercice, phase, textes)}
                  diagnostiquerChamp={(index, texte) => diagnostiquerChampTermesMultiplesGeo(exercice, phase, index, texte)}
                  validation={validation}
                />
              )}
              {PHASES_TERMES_MULTIPLES.has(phase) && <CalculatriceScientifique />}

              {phase === "trouverQ" && (
                <EtapeTrouverQ
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteGeometrique(phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(valeurs) => terminerEtape(soumettreReponseTrouverQ(etat, valeurs), valeurs.join(" ; "))}
                  diagnostiquer={(valeurs) => (exercice.famille === "principal" ? diagnostiquerTrouverQ(exercice, valeurs) : "parse_error")}
                  diagnostiquerChamp={(_index, texte) => diagnostiquerChampTrouverQ(exercice, texte)}
                  validation={validation}
                />
              )}
              {phase === "trouverQ" && <CalculatriceScientifique />}

              {PHASES_SOMME_INFINIE.has(phase) && (
                <EtapeSommeInfinie
                  key={cleEcran}
                  exercice={exercice}
                  phase={phase as "sommeInfinie" | "sommeInfinieB1" | "sommeInfinieB2"}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteGeometrique(phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreSommeInfinie(etat, phase, reponse), formatReponseSommeInfinie(reponse))}
                  diagnostiquer={(reponse) => diagnostiquerSommeInfinieGeo(exercice, phase, reponse)}
                  validation={validation}
                />
              )}
              {PHASES_SOMME_INFINIE.has(phase) && <CalculatriceScientifique />}

              {PHASES_POSER_EQUATION.has(phase) && (
                <EtapePoserEquationGeometrique
                  key={cleEcran}
                  exercice={exercice}
                  phase={phase as "poserEquationAlgebrique" | "poserEquationRangN"}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteGeometrique(phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) =>
                    terminerEtape(soumettrePoserEquation(etat, phase as "poserEquationAlgebrique" | "poserEquationRangN", reponse), reponse.texte)
                  }
                  diagnostiquer={(reponse) =>
                    diagnostiquerPoserEquationGeo(exercice, phase as "poserEquationAlgebrique" | "poserEquationRangN", reponse)
                  }
                  validation={validation}
                />
              )}
              {PHASES_POSER_EQUATION.has(phase) && <CalculatriceScientifique />}
            </>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
