import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEquationExponentielle } from "./generateurs6e/equationsExponentielles";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionEquationExponentielle,
  soumettreReponseAEcran1,
  soumettreReponseAEcran2Liste,
  soumettreReponseAEcran2Valeur,
  soumettreReponseBEcran1,
  soumettreReponseBEcran2,
  soumettreReponseCEcran1,
  soumettreReponseCEcran2,
  soumettreReponseCEcran3,
  soumettreReponseDEcran,
  soumettreReponseExistence,
  tentativesMaxCourant,
} from "./moteur6e/sessionEquationsExponentielles";
import type { EtatSessionEquationExponentielle, PhaseEquationExponentielle } from "./moteur6e/typesEquationsExponentielles";
import { phaseApres, phaseInitiale } from "./moteur6e/typesEquationsExponentielles";
import { EtapeChampEquExpo } from "./components6e/EtapeChampEquExpo";
import { EtapeListeEquExpo } from "./components6e/EtapeListeEquExpo";
import { EtapeReconnaitreImpossibleEquExpo } from "./components6e/EtapeReconnaitreImpossibleEquExpo";
import { EtapeValeurOuVideEquExpo } from "./components6e/EtapeValeurOuVideEquExpo";
import type { ReponseValeurOuVide } from "./moteur6e/verificationEquationsExponentielles";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { correctionDetailleeEquationsExponentielles, etapesExistenceEquExpo, sequenceEquationsExponentielles } from "./generateurs6e/equationsExponentielles/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { Katex } from "./components/Katex";
import { aideNiveau1, aideNiveau2, consigneEcran, formatEnonceLatex, formatReponseAttenduePhaseLatex } from "./ui6e/formatEquationsExponentielles";
import { calculerRecapitulatifEquationsExponentielles, calculerSegmentsProgressionEquationsExponentielles } from "./ui6e/recapitulatifEquationsExponentielles";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { MESSAGES_ILLISIBLE_EXPO } from "./components6e/RetourSaisieExpo";
import { lisibleExpression, lisibleNombre, lisibleRelation } from "./moteur6e/lectureSaisieExpo";
import { cibleEquationsExpo } from "./ui6e/retoursExponentielles";

/**
 * `6gen9` — Résoudre une équation exponentielle. Validation INLINE même écran (rollout UX
 * approuvé) — `enAttente`/`terminerEtape`/`ValidationEcran`, mirroir exact `App6gen13.tsx`/
 * `App6gen12.tsx` : plus de `ResultatPanelEquationExponentielle`/`ResumeSessionEquationExponentielle`
 * séparés.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionEquationExponentielle {
  return demarrerSessionEquationExponentielle(REGLAGES_DEMO, genererExerciceEquationExponentielle);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son premier
 * exercice est cette instance — tirée avec les MÊMES fonctions que l'adaptateur d'export
 * (`generateurs6e/equationsExponentielles/exportEvaluation.ts`), comme `App6gen14.tsx`. */
function sessionInitiale(): EtatSessionEquationExponentielle {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionEquationExponentielle(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_FAMILLES, genererExerciceEquationExponentielle, (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationExponentielle;
  revele: boolean;
}

/** Reconstitue la séquence RÉELLEMENT traversée par CET exercice en bouclant `phaseInitiale`/
 * `phaseApres` jusqu'à "termine" — même technique que `ui6e/recapitulatifEquationsExponentielles.ts`
 * (non exportée depuis ce fichier, reconstruite ici pour aligner `aideUtiliseeParPhase` sur les
 * segments de `calculerSegmentsProgressionEquationsExponentielles`). */
function sequencePourExercice(exercice: EtatSessionEquationExponentielle["exerciceCourant"]): PhaseEquationExponentielle[] {
  const phases: PhaseEquationExponentielle[] = [];
  let phase: PhaseEquationExponentielle | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase, exercice);
  }
  return phases;
}

/** Formate la réponse de l'élève pour la fiche de consultation — un simple texte brut suffit pour
 * les écrans à champ unique, et les cas spéciaux (liste add-as-needed, "valeur ou vide", booléen)
 * sont formatés au point d'appel, où leur forme typée précise est encore connue. */
function formatListeOuVide(textes: string[]): string {
  return textes.length === 0 ? "∅" : textes.join(" ; ");
}

function formatValeurOuVide(reponse: ReponseValeurOuVide): string {
  return reponse.existe && reponse.texte !== null ? reponse.texte : "∅ (aucune solution)";
}

export function App6gen9() {
  const [etat, setEtat] = useState<EtatSessionEquationExponentielle>(sessionInitiale);
  /** Compteur d'exercices affichés : dans la `key` des écrans, pour vider la saisie même quand deux
   * exercices successifs commencent par le même écran. */
  const [numeroExercice, setNumeroExercice] = useState(0);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionEquationExponentielle`, jamais dans le moteur (même principe que la référence 4e,
   * `AppAnalyseFonction.tsx`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Un écran "aide" s'il a été clos avec `niveauAide>0` — ce générateur ne garde `niveauAide` que
   * pour l'écran COURANT (`scoresPartiels` ne retient que le score (anciennement pénalisé), qui ne permet pas
   * de distinguer "pénalité d'aide" de "pénalité de tentatives" une fois l'écran clos) : capturé ICI
   * au moment précis de la clôture. */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseEquationExponentielle, boolean>>>({});

  function ajouterHistorique(votreReponse: string, nouvelEtat: EtatSessionEquationExponentielle) {
    const recap = calculerRecapitulatifEquationsExponentielles(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        corrigeDetaille: corrigeDetailleEcranCourant(),
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? <Katex expression={derniere.valeur} /> : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique (et `aideUtiliseeParPhase` MIS
   * À JOUR) quand l'écran se clôt RÉELLEMENT — jamais à chaque clic sur "Valider" (piège "revele
   * stale"/historique désynchronisé documenté dans la référence 4e). */
  function terminerEtape(nouvelEtat: EtatSessionEquationExponentielle, votreReponse?: string) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici — remis à zéro par `avancerPhase` DANS le même appel qui clôt l'écran, voir
    // `moteur6e/sessionEquationsExponentielles.ts` et `docs/historique-6e.md`).
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // `nouvelEtat.phase !== etat.phase` (jamais seulement `nouvelEtat.terminee`) — voir le
      // commentaire équivalent dans `App6gen58.tsx` (clôture du DERNIER écran d'un exercice :
      // `scoresPartiels`/`phase` de `nouvelEtat` restent ceux d'AVANT cette soumission, sans
      // incidence pratique puisque cette puce reste "courante" jusqu'au reset, jamais cliquable).
      if (votreReponse !== undefined && nouvelEtat.phase !== etat.phase) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      if (etat.niveauAide > 0) {
        setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: true }));
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereTransitionRevelee });
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
      setAideUtiliseeParPhase({});
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setNumeroExercice((n) => n + 1);
    setHistorique([]);
    setAideUtiliseeParPhase({});
    setEtat(demarrerSessionEquationExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const enonceLatex = formatEnonceLatex(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = tentativesMaxCourant(etat);
  const cle = `${numeroExercice}-${phase}`;
  const cibleTexte = (texte: string) => cibleEquationsExpo(exercice, phase, texte);
  const cibleListe = (textes: string[]) => cibleEquationsExpo(exercice, phase, textes);
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(phase, exercice);
  const aide2 = aideNiveau2(phase, exercice);
  const consigne = consigneEcran(phase, exercice);

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen58.tsx`/`App6gen43.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen9?: unknown }).__debug6gen9 = { exercice, phase };
  }

  // Corrigé détaillé « comme au tableau » de l'écran (source unique avec le papier).
  // L'écran de verdict « existence » (familles A, B, C) a son propre corrigé (positivité des termes).
  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={phase === "existence" ? lignesDeLEtape(etapesExistenceEquExpo(exercice), "a") : lignesDeLEtape(correctionDetailleeEquationsExponentielles(exercice), lettreEtape(sequenceEquationsExponentielles(exercice).indexOf(phase)))} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        corrigeDetaille: corrigeDetailleEcranCourant(),
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const sequencePhases = sequencePourExercice(exercice);
  const segments = calculerSegmentsProgressionEquationsExponentielles(etat).map((segment, i) =>
    segment === "correcte" && aideUtiliseeParPhase[sequencePhases[i]] ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Résoudre une équation exponentielle</h1>
        <p className="app-subtitle">Chapitre 2 — Fonctions exponentielles</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifEquationsExponentielles(etat)} />
        <div className="card-body">
          {phase === "aEcran1" && (
            <EtapeChampEquExpo
              key={cle}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              placeholder={exercice.famille === "A" && exercice.sousType === "A2" ? "équation « … = 0 »" : "exposant, ex : −2"}
              lire={(texte) => (exercice.famille === "A" && exercice.sousType === "A2" ? lisibleRelation(texte, "x") : lisibleNombre(texte))}
              messageIllisible={exercice.famille === "A" && exercice.sousType === "A2" ? MESSAGES_ILLISIBLE_EXPO.equationX : MESSAGES_ILLISIBLE_EXPO.nombre}
              cible={cibleTexte}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseAEcran1(etat, texte), texte)}
              validation={validation}
            />
          )}
          {phase === "aEcran2" && exercice.famille === "A" && exercice.sousType !== "A3" && (
            <EtapeChampEquExpo
              key={cle}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              placeholder="ex : −3/4"
              lire={lisibleNombre}
              messageIllisible={MESSAGES_ILLISIBLE_EXPO.nombre}
              cible={cibleTexte}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseAEcran2Valeur(etat, texte), `x = ${texte}`)}
              validation={validation}
            />
          )}
          {phase === "aEcran2" && exercice.famille === "A" && exercice.sousType === "A3" && (
            <EtapeListeEquExpo
              key={cle}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              placeholder="ex : −1"
              lire={lisibleNombre}
              messageIllisible={MESSAGES_ILLISIBLE_EXPO.liste}
              cible={cibleListe}
              labelAjout="+ Ajouter une solution"
              labelAucune="∅ — Aucune solution"
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(textes) => terminerEtape(soumettreReponseAEcran2Liste(etat, textes), formatListeOuVide(textes))}
              validation={validation}
            />
          )}

          {phase === "bEcran1" && (
            <EtapeChampEquExpo
              key={cle}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              placeholder="exposant en x"
              lire={(texte) => lisibleExpression(texte, ["x"])}
              messageIllisible={MESSAGES_ILLISIBLE_EXPO.expressionX}
              cible={cibleTexte}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseBEcran1(etat, texte), texte)}
              validation={validation}
            />
          )}
          {phase === "bEcran2" && (
            <EtapeValeurOuVideEquExpo
              key={cle}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              placeholder="ex : −2/3"
              lire={lisibleNombre}
              messageIllisible={MESSAGES_ILLISIBLE_EXPO.nombre}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseBEcran2(etat, reponse), formatValeurOuVide(reponse))}
              validation={validation}
            />
          )}

          {phase === "cEcran1" && (
            <EtapeChampEquExpo
              key={cle}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              placeholder="équation en t"
              lire={(texte) => lisibleRelation(texte, "t")}
              messageIllisible={MESSAGES_ILLISIBLE_EXPO.equationT}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseCEcran1(etat, texte), texte)}
              validation={validation}
            />
          )}
          {phase === "cEcran2" && (
            <EtapeListeEquExpo
              key={cle}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              placeholder="ex : −3"
              lire={lisibleNombre}
              messageIllisible={MESSAGES_ILLISIBLE_EXPO.liste}
              cible={cibleListe}
              labelAjout="+ Ajouter une valeur de t"
              labelAucune="Aucune valeur de t"
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(textes) => terminerEtape(soumettreReponseCEcran2(etat, textes), formatListeOuVide(textes))}
              validation={validation}
            />
          )}
          {phase === "cEcran3" && (
            <EtapeListeEquExpo
              key={cle}
              consigneEcran={consigne}
              enonceLatex={enonceLatex}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              placeholder="ex : 2"
              lire={lisibleNombre}
              messageIllisible={MESSAGES_ILLISIBLE_EXPO.liste}
              cible={cibleListe}
              labelAjout="+ Ajouter une solution"
              labelAucune="∅ — Aucune solution"
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(textes) => terminerEtape(soumettreReponseCEcran3(etat, textes), formatListeOuVide(textes))}
              validation={validation}
            />
          )}
          {phase === "cEcran3" && <CalculatriceScientifique />}

          {(phase === "dEcran" || phase === "existence") && (
            <EtapeReconnaitreImpossibleEquExpo
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
              onValider={(ilFautResoudre) => terminerEtape(phase === "existence" ? soumettreReponseExistence(etat, ilFautResoudre) : soumettreReponseDEcran(etat, ilFautResoudre), ilFautResoudre ? "Il faut résoudre pour conclure" : "Aucune solution, sans calcul")}
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
