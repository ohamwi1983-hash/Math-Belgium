import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceLirePlacer } from "./core6e/lirePlacerPlanComplexe.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLirePlacer } from "./generateurs6e/lirePlacerPlanComplexe";
import { activerAideSuivante, demarrerSessionLirePlacer, niveauAideMaxPhase, soumettreReponseEcran, tentativesMaxPhase } from "./moteur6e/sessionLirePlacerPlanComplexe";
import { PHASES_LIRE_PLACER, estPhaseChoix } from "./moteur6e/typesLirePlacerPlanComplexe";
import type { EtatSessionLirePlacer, PhaseLirePlacer } from "./moteur6e/typesLirePlacerPlanComplexe";
import { diagnosticEcran, messageSaisieNonDecomptee } from "./moteur6e/verificationLirePlacerPlanComplexe";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeLirePlacerPlanComplexe } from "./components6e/EtapeLirePlacerPlanComplexe";
import type { ModeEcranLirePlacer } from "./components6e/EtapeLirePlacerPlanComplexe";
import type { FlechePlan, PointFigurePlan } from "./components6e/PlanComplexeInteractif";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  LIBELLE_PHASE,
  NOMS_IMAGES,
  OPERATION_LATEX,
  TRANSFORMATION_FRAGMENTS,
  aideNiveau1,
  aideNiveau2,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  imageDe,
  messageDiagnostic,
  optionsTransformations,
  reponseAssocierFragments,
  t,
  l,
} from "./ui6e/formatLirePlacerPlanComplexe";
import type { FragmentConsigne } from "./ui6e/formatLirePlacerPlanComplexe";
import { calculerRecapitulatifLirePlacer, calculerSegmentsProgressionLirePlacer } from "./ui6e/recapitulatifLirePlacerPlanComplexe";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen95` — « Lire et placer dans le plan complexe » (6e, chapitre 5, section « Affixes et racines
 * carrées », processus 1). Chaîne fixe de 5 écrans : lire z (et w) → placer P → placer Q →
 * associer chaque opération à sa transformation (choix fermé, une tentative) → module et argument
 * de z_C. Patron de `App6gen91.tsx`. Le `?code=` (QR code des feuilles) rejoue l'instance de
 * `generateurs6e/lirePlacerPlanComplexe/exportEvaluation.ts` avec les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionLirePlacer {
  return demarrerSessionLirePlacer(REGLAGES_DEMO, genererExerciceLirePlacer);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionLirePlacer {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionLirePlacer(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceLirePlacer, (id) => construireAvecVarianteId(id)));
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionLirePlacer;
  revele: boolean;
}

/** Points et flèches de la figure à un écran donné : données + images déjà validées. */
function figureEcran(e: ExerciceLirePlacer, phase: PhaseLirePlacer): { points: PointFigurePlan[]; fleches: FlechePlan[]; legende: string } {
  const points: PointFigurePlan[] = [{ ...e.z, label: "A", role: "donnee" }];
  if (e.w) points.push({ ...e.w, label: "B", role: "donnee" });
  points.push({ ...e.c, label: "C", role: "c" });
  const fleches: FlechePlan[] = [];
  ([0, 1] as const).forEach((i) => {
    // P est montré après son écran de placement, Q aussi ; sur l'écran de placement lui-même,
    // c'est la poignée de l'élève qui montre le point.
    if (PHASES_LIRE_PLACER.indexOf(phase) <= PHASES_LIRE_PLACER.indexOf(i === 0 ? "placer1" : "placer2")) return;
    const p = imageDe(e, i);
    points.push({ ...p, label: NOMS_IMAGES[i], role: "image" });
    fleches.push({ de: e.z, vers: p });
  });
  const noms = ["A", ...(e.w ? ["B"] : []), "C", ...points.filter((p) => p.role === "image").map((p) => p.label)];
  return { points, fleches, legende: `Plan complexe quadrillé (une unité par carreau) : points ${noms.join(", ")}` };
}

function modeEcran(e: ExerciceLirePlacer, phase: PhaseLirePlacer): ModeEcranLirePlacer {
  if (phase === "placer1" || phase === "placer2") {
    const i = phase === "placer1" ? 0 : 1;
    return { type: "placement", etiquette: NOMS_IMAGES[i], attendu: imageDe(e, i) };
  }
  if (phase === "associer") {
    return {
      type: "associer",
      groupes: e.operations.map((op, i): FragmentConsigne[] => [l(`z\\mapsto ${OPERATION_LATEX[op]}`), t(` (A est envoyé sur ${NOMS_IMAGES[i]})`)]),
      options: optionsTransformations(e),
    };
  }
  return { type: "champs", champs: champsEcran(e, phase) };
}

function reponseAttendue(e: ExerciceLirePlacer, phase: PhaseLirePlacer): ReactNode {
  if (phase === "associer") return <RenduFragments fragments={reponseAssocierFragments(e)} />;
  return <Katex expression={formatReponseAttenduePhaseLatex(e, phase).join(",\\quad ")} />;
}

export function App6gen95() {
  const [etat, setEtat] = useState<EtatSessionLirePlacer>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function votreReponse(valeurs: string[]): ReactNode {
    if (phase === "associer") {
      const fr = exercice.operations.flatMap((op, i): FragmentConsigne[] => [...(i > 0 ? [t(" ; ")] : []), l(`z\\mapsto ${OPERATION_LATEX[op]}`), t(" : "), ...(TRANSFORMATION_FRAGMENTS[valeurs[i] as keyof typeof TRANSFORMATION_FRAGMENTS] ?? [t("?")])]);
      return <RenduFragments fragments={fr} />;
    }
    if (phase === "placer1" || phase === "placer2") {
      const [x, y] = valeurs[0].split(";");
      return <Katex expression={`(${x}\\,;${y})`} />;
    }
    return valeurs.join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionLirePlacer, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setHistorique((h) => [...h, { titre: LIBELLE_PHASE[phase], votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionLirePlacer) {
    setEtat(nouvelEtat);
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setCompteur((c) => c + 1);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      reinitialiser(nouvelleSession());
      return;
    }
    setEtat(enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    reinitialiser(demarrerSessionLirePlacer(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen95?: unknown }).__debug6gen95 = { exercice, phase };
  }

  const choix = estPhaseChoix(phase);
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        ...(choix ? { messageRevele: "Ce n'était pas la bonne association (une seule tentative sur un choix fermé)." } : {}),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Lire et placer dans le plan complexe</h1>
        <p className="app-subtitle">Chapitre 5 — Nombres complexes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionLirePlacer(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLirePlacer(etat)} />
        <EtapeLirePlacerPlanComplexe
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          consigneEcran={consigneEcran(exercice, phase)}
          figure={figureEcran(exercice, phase)}
          mode={modeEcran(exercice, phase)}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={tentativesMaxPhase(etat)}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMaxPhase(phase)}
          onActiverAide={() => setEtat(activerAideSuivante(etat))}
          validation={validation}
          messageSaisie={(valeurs) => messageSaisieNonDecomptee(exercice, phase, valeurs)}
          diagnostic={(valeurs) => {
            const id = diagnosticEcran(exercice, phase, valeurs);
            return id === null ? null : messageDiagnostic(exercice, phase, id);
          }}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
