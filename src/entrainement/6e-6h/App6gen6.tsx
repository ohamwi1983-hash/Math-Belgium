import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimiteExponentielle } from "./generateurs6e/limitesExponentielles";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  tentativesMaxCourant,
  demarrerSessionLimiteExponentielle,
  soumettreReponseAExposant,
  soumettreReponseAGlobale,
  soumettreReponseBExponentielle,
  soumettreReponseBGlobale,
  soumettreReponseBPolynomiale,
  soumettreReponseCFacteurs,
  soumettreReponseCGlobale,
  soumettreReponseGCombiner,
  soumettreReponseGConclure,
  soumettreReponseGOrdre1,
  soumettreReponseHConclure,
  soumettreReponseHDenominateur,
  soumettreReponseHForme,
  soumettreReponseHNumerateur,
  soumettreReponseIConclure,
  soumettreReponseIDenominateur,
  soumettreReponseIForme,
  soumettreReponseINumerateur,
  soumettreReponseJConclure,
  soumettreReponseJDenominateur,
  soumettreReponseJForme,
  soumettreReponseJNumerateur,
  soumettreReponseKConclure,
  soumettreReponseKDenominateur1,
  soumettreReponseKDenominateur2,
  soumettreReponseKForme,
  soumettreReponseKNumerateur1,
  soumettreReponseKNumerateur2,
  soumettreReponseLConclure,
  soumettreReponseLReformuler,
  soumettreReponseNCombiner,
  soumettreReponseNConclure,
} from "./moteur6e/sessionLimitesExponentielles";
import type { EtatSessionLimiteExponentielle, PhaseLimiteExponentielle } from "./moteur6e/typesLimitesExponentielles";
import { phaseApres, phaseInitiale } from "./moteur6e/typesLimitesExponentielles";
import type { ReponseFacteursC, ReponseLimite } from "./moteur6e/verificationLimitesExponentielles";
import type { CategorieFI } from "./core6e/limitesExponentielles.types";
import { EtapeChampLimiteExpo } from "./components6e/EtapeChampLimiteExpo";
import { EtapeFacteursC } from "./components6e/EtapeFacteursC";
import { EtapeFormeFI } from "./components6e/EtapeFormeFI";
import { EtapeOrdre1G } from "./components6e/EtapeOrdre1G";
import { EtapeReponseLimite } from "./components6e/EtapeReponseLimite";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { correctionDetailleeLimitesExponentielles, reponseAttendueLimitesExpoLatex, sequenceLimitesExponentielles } from "./generateurs6e/limitesExponentielles/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { Katex } from "./components/Katex";
import { aideNiveau1, aideNiveau2, consigneEcran, formatCibleTexte, formatLimiteEnonceLatex } from "./ui6e/formatLimitesExponentielles";
import { calculerRecapitulatifLimitesExponentielles, calculerSegmentsProgressionLimitesExponentielles } from "./ui6e/recapitulatifLimitesExponentielles";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { MESSAGES_ILLISIBLE_EXPO } from "./components6e/RetourSaisieExpo";
import { lisibleExpression, lisibleNombre } from "./moteur6e/lectureSaisieExpo";
import { cibleLimitesExpo } from "./ui6e/retoursExponentielles";

/** Écrans dont la réponse est la valeur d'une limite (un nombre, forme exacte ou approchée). */
const PHASES_VALEUR_LIMITE: ReadonlySet<string> = new Set(["cGlobale", "gConclure", "hConclure", "iConclure", "jConclure", "kConclure", "lConclure", "nConclure"]);
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionLimiteExponentielle {
  return demarrerSessionLimiteExponentielle(REGLAGES_DEMO, genererExerciceLimiteExponentielle);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son premier
 * exercice est cette instance — tirée avec les MÊMES fonctions que l'adaptateur d'export
 * (`generateurs6e/limitesExponentielles/exportEvaluation.ts`), comme `App6gen14.tsx`. */
function sessionInitiale(): EtatSessionLimiteExponentielle {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionLimiteExponentielle(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_FAMILLES, genererExerciceLimiteExponentielle, (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLimiteExponentielle;
  revele: boolean;
}

/** Reconstitue la séquence RÉELLEMENT traversée par CET exercice en bouclant `phaseInitiale`/
 * `phaseApres` jusqu'à "termine" — même technique que `ui6e/recapitulatifLimitesExponentielles.ts`
 * (non exportée depuis ce fichier, reconstruite ici pour la puce "aide"). */
function sequenceDesPhases(exercice: EtatSessionLimiteExponentielle["exerciceCourant"]): PhaseLimiteExponentielle[] {
  const phases: PhaseLimiteExponentielle[] = [];
  let phase: PhaseLimiteExponentielle | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

/** Formate la réponse catégorielle/texte libre de l'écran pour la fiche de consultation — même
 * primitive `ReponseLimite` que les 7 écrans catégoriels (A×2, B×3, C-facteurs, voir
 * `verificationLimitesExponentielles.ts`). */
function formatReponseLimiteTexte(r: ReponseLimite): string {
  if (r.type === "plus_infini") return "+∞";
  if (r.type === "moins_infini") return "-∞";
  if (r.type === "zero") return "0";
  return r.texte;
}

function formatCategorieFITexte(c: CategorieFI): string {
  return c === "zero_sur_zero" ? "0/0" : c === "infini_sur_infini" ? "∞/∞" : "Pas une FI";
}

export function App6gen6() {
  const [etat, setEtat] = useState<EtatSessionLimiteExponentielle>(sessionInitiale);
  /** Compteur d'exercices affichés : dans la `key` des écrans, pour vider la saisie même quand deux
   * exercices successifs commencent par le même écran. */
  const [numeroExercice, setNumeroExercice] = useState(0);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionLimiteExponentielle`, jamais dans le moteur (même principe que la référence 4e,
   * `AppAnalyseFonction.tsx`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function ajouterHistorique(votreReponse: string, nouvelEtat: EtatSessionLimiteExponentielle) {
    const recap = calculerRecapitulatifLimitesExponentielles(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
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

  function terminerEtape(nouvelEtat: EtatSessionLimiteExponentielle, votreReponse?: string) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // La phase qui vient PRÉCISÉMENT de se fermer est `etat.phase` (pas `nouvelEtat.phase`) — son
      // détail (`revele`/`niveauAide`) vit soit dans `detailsPartiels` (écran intermédiaire), soit
      // dans le `resultats` qui vient d'être poussé (dernier écran de l'exercice, voir
      // `avancerPhase`/`cloturerExerciceOuSuivant`, `sessionLimitesExponentielles.ts`).
      const exerciceVientDeFinir = nouvelEtat.resultats.length > etat.resultats.length;
      const detail = exerciceVientDeFinir
        ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1].details[etat.phase]
        : nouvelEtat.detailsPartiels[etat.phase];
      // `nouvelEtat.phase !== etat.phase` (jamais seulement `exerciceVientDeFinir`/`terminee`) —
      // quand l'écran qui vient de clore est le DERNIER de l'exercice, `nouvelEtat.phase`/
      // `detailsPartiels` restent ceux d'AVANT cette soumission (voir `exerciceVientDeFinir`
      // ci-dessus) : `calculerRecapitulatifLimitesExponentielles(nouvelEtat)` y verrait alors
      // l'écran précédent, pas celui qui vient de clore. Sans incidence pratique : cet écran est le
      // dernier, sa puce reste "courante" jusqu'au reset du nouvel exercice (jamais cliquable), même
      // principe que `App6gen58.tsx`/la référence 4e (`tableauSignes`, jamais de `votreReponse`
      // passé).
      if (votreReponse !== undefined && nouvelEtat.phase !== etat.phase) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: detail?.revele ?? false });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setNumeroExercice((n) => n + 1);
      setHistorique([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setNumeroExercice((n) => n + 1);
    setHistorique([]);
    setEtat(demarrerSessionLimiteExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const enonceLatex = formatLimiteEnonceLatex(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = tentativesMaxCourant(etat);
  const cle = `${numeroExercice}-${phase}`;
  // Champs libres : lecture, message d'illisible et message ciblé selon la nature de l'écran
  // (valeur d'une limite, dérivée en x, reformulation dans une nouvelle variable).
  const variableL = exercice.famille === "L" && exercice.sousType === "L1" ? "u" : "t";
  const champValeur = PHASES_VALEUR_LIMITE.has(phase);
  const retourChamp = {
    placeholder: champValeur ? "ex : 3/2" : phase === "lReformuler" ? `expression en ${variableL}` : phase === "nCombiner" ? "une seule puissance" : "expression en x",
    lire: (texte: string) => (champValeur ? lisibleNombre(texte) : lisibleExpression(texte, [phase === "lReformuler" ? variableL : "x"])),
    messageIllisible: champValeur ? MESSAGES_ILLISIBLE_EXPO.nombre : phase === "lReformuler" ? MESSAGES_ILLISIBLE_EXPO.expressionU : MESSAGES_ILLISIBLE_EXPO.expressionX,
    cible: (texte: string) => cibleLimitesExpo(exercice, phase, texte),
  };
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(phase, exercice);
  const aide2 = aideNiveau2(phase, exercice);
  const consigne = consigneEcran(phase, exercice);

  // Hook de vérification Playwright/dev — même principe que les autres générateurs 6e (ex.
  // App6gen23.tsx) : exposé UNIQUEMENT en mode dev (import.meta.env.DEV OU ?dev=1), jamais en prod.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen6?: unknown }).__debug6gen6 = { exercice, phase };
  }

  // Réplique exactement le contenu (par écran RÉELLEMENT traversé) de l'ancien
  // `ResultatPanelLimiteExponentielle.tsx` — jamais une cible recalculée séparément. Narrowe
  // `exercice.famille` avant de lire ses champs propres à la famille (ex. `limiteExposant`),
  // `etat.phase` seul ne suffisant pas à TypeScript pour prouver la correspondance phase/famille,
  // même si elle est garantie à l'exécution (préfixe de phase par lettre de famille — voir
  // `typesLimitesExponentielles.ts`).
  const reponseAttenduePhase = () => {
    // Réponse attendue = « Résultat » du corrigé détaillé de l'écran (même source que le papier) :
    // valeurs EXACTES (« -\dfrac{2}{3}\ln(3) \approx -0{,}7324 »), dérivées écrites — plus de flottant
    // brut ni de « forme équivalente, vérifiée par équivalence numérique ».
    if (phase === "hForme" || phase === "iForme" || phase === "jForme" || phase === "kForme") return <Katex expression={"\\text{forme } \\dfrac{0}{0}"} />;
    if (phase === "gOrdre1") return "Non — à l'ordre 1, les termes dominants s'annulent : il faut l'ordre 2.";
    if (exercice.famille === "C" && phase === "cFacteurs")
      return <Katex expression={`${formatCibleTexte(exercice.limiteFacteur1)} \\quad , \\quad ${formatCibleTexte(exercice.limiteFacteur2)}`} />;
    const l = reponseAttendueLimitesExpoLatex(exercice, phase);
    return l ? <Katex expression={l} /> : null;
  };

  // Corrigé détaillé « comme au tableau » de l'écran (source unique avec le papier,
  // `limitesExponentielles/corrigeDetaille.ts`), affiché sous la réponse attendue.
  const corrigeDetaille = <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeLimitesExponentielles(exercice), lettreEtape(sequenceLimitesExponentielles(exercice).indexOf(phase)))} />;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        corrigeDetaille,
        reponseAttendue: reponseAttenduePhase(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  // "aide" (puce jaune) remplace "correcte" pour tout écran clos avec `niveauAide>0` —
  // `detailsPartiels[phase].niveauAide` (jamais recalculé depuis le score, voir le commentaire de
  // `DetailPhaseLimiteExponentielle`, `typesLimitesExponentielles.ts`).
  const sequencePhases = sequenceDesPhases(exercice);
  const segments = calculerSegmentsProgressionLimitesExponentielles(etat).map((segment, i) =>
    segment === "correcte" && (etat.detailsPartiels[sequencePhases[i]]?.niveauAide ?? 0) > 0 ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Calcul de limites (fonctions exponentielles)</h1>
        <p className="app-subtitle">Chapitre 2 — Fonctions exponentielles</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLimitesExponentielles(etat)} />
        <div className="card-body">
          {(phase === "aExposant" || phase === "aGlobale") && (
                <EtapeReponseLimite
                  key={cle}
                  lire={lisibleNombre}
                  messageIllisible={MESSAGES_ILLISIBLE_EXPO.nombre}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  optionsCategorielles={phase === "aExposant" ? ["plus_infini", "moins_infini"] : ["plus_infini", "zero"]}
                  autoriserValeurLibre
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) =>
                    terminerEtape(
                      phase === "aExposant" ? soumettreReponseAExposant(etat, reponse) : soumettreReponseAGlobale(etat, reponse),
                      formatReponseLimiteTexte(reponse),
                    )
                  }
                  validation={validation}
                />
              )}

              {phase === "bExponentielle" && (
                <EtapeReponseLimite
                  key={cle}
                  lire={lisibleNombre}
                  messageIllisible={MESSAGES_ILLISIBLE_EXPO.nombre}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  optionsCategorielles={["plus_infini", "zero"]}
                  autoriserValeurLibre
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseBExponentielle(etat, reponse), formatReponseLimiteTexte(reponse))}
                  validation={validation}
                />
              )}
              {(phase === "bPolynomiale" || phase === "bGlobale") && (
                <EtapeReponseLimite
                  key={cle}
                  lire={lisibleNombre}
                  messageIllisible={MESSAGES_ILLISIBLE_EXPO.nombre}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  optionsCategorielles={["plus_infini", "moins_infini"]}
                  autoriserValeurLibre={false}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) =>
                    terminerEtape(
                      phase === "bPolynomiale" ? soumettreReponseBPolynomiale(etat, reponse) : soumettreReponseBGlobale(etat, reponse),
                      formatReponseLimiteTexte(reponse),
                    )
                  }
                  validation={validation}
                />
              )}

              {phase === "cFacteurs" && (
                <EtapeFacteursC
                  key={cle}
                  labelsFacteurs={exercice.famille === "C" ? [exercice.r === 1 ? "x" : `x^{${exercice.r}}`, `e^{-x^{${exercice.s}}}`] : ["x", "x"]}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse: ReponseFacteursC) =>
                    terminerEtape(
                      soumettreReponseCFacteurs(etat, reponse),
                      `${formatReponseLimiteTexte(reponse.facteur1)} ; ${formatReponseLimiteTexte(reponse.facteur2)}`,
                    )
                  }
                  validation={validation}
                />
              )}
              {phase === "cGlobale" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCGlobale(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "gCombiner" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGCombiner(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "gOrdre1" && (
                <EtapeOrdre1G
                  key={cle}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(ordre1Suffit) => terminerEtape(soumettreReponseGOrdre1(etat, ordre1Suffit), ordre1Suffit ? "Oui" : "Non")}
                  validation={validation}
                />
              )}
              {phase === "gConclure" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGConclure(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "hForme" && (
                <EtapeFormeFI
                  key={cle}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseHForme(etat, reponse), formatCategorieFITexte(reponse))}
                  validation={validation}
                />
              )}
              {phase === "hNumerateur" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseHNumerateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "hDenominateur" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseHDenominateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "hConclure" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseHConclure(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "iForme" && (
                <EtapeFormeFI
                  key={cle}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseIForme(etat, reponse), formatCategorieFITexte(reponse))}
                  validation={validation}
                />
              )}
              {phase === "iNumerateur" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseINumerateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "iDenominateur" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseIDenominateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "iConclure" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseIConclure(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "jForme" && (
                <EtapeFormeFI
                  key={cle}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseJForme(etat, reponse), formatCategorieFITexte(reponse))}
                  validation={validation}
                />
              )}
              {phase === "jNumerateur" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseJNumerateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "jDenominateur" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseJDenominateur(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "jConclure" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseJConclure(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "kForme" && (
                <EtapeFormeFI
                  key={cle}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseKForme(etat, reponse), formatCategorieFITexte(reponse))}
                  validation={validation}
                />
              )}
              {phase === "kNumerateur1" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKNumerateur1(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "kDenominateur1" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKDenominateur1(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "kNumerateur2" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKNumerateur2(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "kDenominateur2" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKDenominateur2(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "kConclure" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKConclure(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "lReformuler" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseLReformuler(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "lConclure" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseLConclure(etat, texte), texte)}
                  validation={validation}
                />
              )}

              {phase === "nCombiner" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseNCombiner(etat, texte), texte)}
                  validation={validation}
                />
              )}
              {phase === "nConclure" && (
                <EtapeChampLimiteExpo
                  key={cle}
                  {...retourChamp}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseNConclure(etat, texte), texte)}
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
