import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceExponentiellesProblemes } from "./generateurs6e/exponentiellesProblemes";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  tentativesMaxCourant,
  demarrerSessionExponentiellesProblemes,
  soumettreReponseAEcran1,
  soumettreReponseAEcran2,
  soumettreReponseBEcran1,
  soumettreReponseBEcran2,
  soumettreReponseBEcran3,
  soumettreReponseBEcran4,
  soumettreReponseCEcran1,
  soumettreReponseCEcran2,
  soumettreReponseCEcran3,
  soumettreReponseDEcran1,
  soumettreReponseDEcran2,
  soumettreReponseDEcran3,
  soumettreReponseDEcran4,
  soumettreReponseEEcran1,
  soumettreReponseEEcran2,
  soumettreReponseEEcran3,
  soumettreReponseFEcran1,
  soumettreReponseFEcran2,
  soumettreReponseFEcran3,
  soumettreReponseFEcran4,
  soumettreReponseGEcran1,
  soumettreReponseGEcran2,
  soumettreReponseGEcran3,
} from "./moteur6e/sessionExponentiellesProblemes";
import type { EtatSessionExponentiellesProblemes, PhaseExponentiellesProblemes } from "./moteur6e/typesExponentiellesProblemes";
import { EtapeChampExpoProblemes } from "./components6e/EtapeChampExpoProblemes";
import { EtapeDeuxValeursExpoProblemes } from "./components6e/EtapeDeuxValeursExpoProblemes";
import { EtapeListeExpoProblemes } from "./components6e/EtapeListeExpoProblemes";
import { EtapeChoixOuiNonExpoProblemes } from "./components6e/EtapeChoixOuiNonExpoProblemes";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { LIBELLE_PHASE, PHASES_PAR_FAMILLE, aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "./ui6e/formatExponentiellesProblemes";
import { calculerRecapitulatifExponentiellesProblemes, calculerSegmentsProgressionExponentiellesProblemes } from "./ui6e/recapitulatifExponentiellesProblemes";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { MESSAGES_ILLISIBLE_EXPO } from "./components6e/RetourSaisieExpo";
import { lisibleExpression, lisibleNombre } from "./moteur6e/lectureSaisieExpo";
import { cibleProblemesExpo } from "./ui6e/retoursExponentielles";

/** Écrans dont la réponse est une expression en t (modèle, dérivée) ; les autres attendent un nombre. */
const PHASES_EXPRESSION_T: ReadonlySet<string> = new Set(["aEcran1", "bEcran1", "bEcran2", "dEcran3", "eEcran1"]);
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeExponentiellesProblemes, lettrePhaseExponentiellesProblemes } from "./generateurs6e/exponentiellesProblemes/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lignesDeLEtape } from "../export/corrigeTableau";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionExponentiellesProblemes {
  return demarrerSessionExponentiellesProblemes(REGLAGES_DEMO, genererExerciceExponentiellesProblemes);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son premier
 * exercice est cette instance — tirée avec les MÊMES fonctions que l'adaptateur d'export
 * (`generateurs6e/exponentiellesProblemes/exportEvaluation.ts`), comme `App6gen14.tsx`. */
function sessionInitiale(): EtatSessionExponentiellesProblemes {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionExponentiellesProblemes(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_FAMILLES, genererExerciceExponentiellesProblemes, (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionExponentiellesProblemes;
  revele: boolean;
}

export function App6gen12() {
  const [etat, setEtat] = useState<EtatSessionExponentiellesProblemes>(sessionInitiale);
  /** Compteur d'exercices affichés : dans la `key` des écrans, pour vider la saisie même quand deux
   * exercices successifs commencent par le même écran. */
  const [numeroExercice, setNumeroExercice] = useState(0);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionExponentiellesProblemes`, jamais dans le moteur. Remis à vide
   * à chaque nouvel exercice (mêmes endroits que `enAttente`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Aide utilisée PAR PHASE DÉJÀ CLOSE — le moteur ne garde aucune trace persistante de l'aide une
   * fois la phase refermée (`niveauAide` est remis à 0 à chaque transition), capturé ICI au moment
   * exact de la clôture réelle (même garde que `terminerEtape`). Remis à vide comme `historique`. */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseExponentiellesProblemes, boolean>>>({});

  function terminerEtape(nouvelEtat: EtatSessionExponentiellesProblemes, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereTransitionRevelee;
      // `votreReponse`/`niveauAide` : UNIQUEMENT capturés dans la branche de transition RÉELLE —
      // jamais à chaque clic sur "Valider".
      if (votreReponse !== undefined) {
        const valeurs = formatReponseAttenduePhaseLatex(exercice, etat.phase);
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE[etat.phase],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? (
              <span className="equation-box-termes">
                {valeurs.map((frag, i) => (
                  <Katex key={i} expression={frag} />
                ))}
              </span>
            ) : undefined,
          },
        ]);
      }
      if (etat.niveauAide > 0) {
        setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: true }));
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
    setEtat(
      demarrerSessionExponentiellesProblemes(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook de vérification Playwright (mode dev ou ?dev=1 seulement), comme les autres générateurs
  // du chapitre : l'exercice tiré, pour contrôler qu'un `?code=` rouvre la même instance.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen12?: unknown }).__debug6gen12 = { exercice, phase };
  }
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = tentativesMaxCourant(etat);
  const cle = `${numeroExercice}-${phase}`;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(exercice, phase);
  const aide2 = aideNiveau2(exercice, phase);
  const consigneG = consigneGenerale(exercice);
  const donnees = blocDonnees(exercice);
  const consigne = consigneEcran(exercice, phase);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        // Corrigé détaillé « comme au tableau » de l'étape (mêmes lignes que le papier, `corrigeDetaille.ts`).
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeExponentiellesProblemes(exercice), lettrePhaseExponentiellesProblemes(exercice, phase))} />,
      }
    : null;

  const propsChampCommun = {
    consigneGenerale: consigneG,
    blocDonnees: donnees,
    consigneEcran: consigne,
    aideNiveau1: aide1,
    aideNiveau2: aide2,
    tentativesUtilisees,
    tentativesMax,
    niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    validation,
    lire: (texte: string) => (PHASES_EXPRESSION_T.has(phase) ? lisibleExpression(texte, ["t"]) : lisibleNombre(texte)),
    messageIllisible: PHASES_EXPRESSION_T.has(phase) ? MESSAGES_ILLISIBLE_EXPO.expressionT : MESSAGES_ILLISIBLE_EXPO.nombre,
    cible: (texte: string) => cibleProblemesExpo(exercice, phase, texte),
  };

  // Wiring calculatrice scientifique — inventaire écran par écran (voir rapport de livraison) :
  // toute case où le calcul à la main implique une puissance décimale, un logarithme ou une
  // exponentielle non triviale l'obtient ; les écrans purement symboliques (poser un modèle,
  // factoriser, un statut oui/non, une soustraction/division entière simple) ne l'obtiennent pas.
  const calculatriceVisible =
    (phase === "aEcran2" && exercice.famille === "A" && exercice.sousType === "evaluer") ||
    phase === "bEcran3" ||
    phase === "bEcran4" ||
    phase === "cEcran1" ||
    phase === "cEcran2" ||
    phase === "cEcran3" ||
    phase === "dEcran1" ||
    phase === "dEcran2" ||
    phase === "dEcran3" ||
    phase === "dEcran4" ||
    phase === "eEcran3" ||
    phase === "fEcran2" ||
    phase === "fEcran3" ||
    phase === "fEcran4" ||
    phase === "gEcran1" ||
    phase === "gEcran2";

  // "aide" (puce jaune) : post-traite les segments déjà calculés par `calculerSegmentsProgressionExponentiellesProblemes`
  // avec `aideUtiliseeParPhase` capturé localement ci-dessus.
  const sequence = PHASES_PAR_FAMILLE[exercice.famille];
  const segments: EtatPuceProgression[] = calculerSegmentsProgressionExponentiellesProblemes(etat).map((segment, index) =>
    segment === "correcte" && aideUtiliseeParPhase[sequence[index]] ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Exponentielles : problèmes</h1>
        <p className="app-subtitle">Chapitre 2 — Fonctions exponentielles</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifExponentiellesProblemes(etat)} />
        <div className="card-body">
          {phase === "aEcran1" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="expression en t"
              onValider={(texte) => terminerEtape(soumettreReponseAEcran1(etat, texte), texte)}
            />
          )}
          {phase === "aEcran2" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 12,5"
              onValider={(texte) => terminerEtape(soumettreReponseAEcran2(etat, texte), texte)}
            />
          )}

          {phase === "bEcran1" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="expression en t"
              onValider={(texte) => terminerEtape(soumettreReponseBEcran1(etat, texte), texte)}
            />
          )}
          {phase === "bEcran2" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="expression en t"
              onValider={(texte) => terminerEtape(soumettreReponseBEcran2(etat, texte), texte)}
            />
          )}
          {phase === "bEcran3" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 12,5"
              onValider={(texte) => terminerEtape(soumettreReponseBEcran3(etat, texte), texte)}
            />
          )}
          {phase === "bEcran4" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 8,3"
              onValider={(texte) => terminerEtape(soumettreReponseBEcran4(etat, texte), texte)}
            />
          )}

          {phase === "cEcran1" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 0,9"
              onValider={(texte) => terminerEtape(soumettreReponseCEcran1(etat, texte), texte)}
            />
          )}
          {phase === "cEcran2" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 15,2"
              onValider={(texte) => terminerEtape(soumettreReponseCEcran2(etat, texte), texte)}
            />
          )}
          {phase === "cEcran3" && exercice.famille === "C" && (
            <EtapeListeExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 42,3"
              messageIllisible={MESSAGES_ILLISIBLE_EXPO.liste}
              cible={() => null}
              labelAjout="+ Ajouter une valeur"
              onValider={(textes) => terminerEtape(soumettreReponseCEcran3(etat, textes), textes.join(" ; "))}
            />
          )}

          {phase === "dEcran1" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 0,64"
              onValider={(texte) => terminerEtape(soumettreReponseDEcran1(etat, texte), texte)}
            />
          )}
          {phase === "dEcran2" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 20"
              onValider={(texte) => terminerEtape(soumettreReponseDEcran2(etat, texte), texte)}
            />
          )}
          {phase === "dEcran3" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="expression en t"
              onValider={(texte) => terminerEtape(soumettreReponseDEcran3(etat, texte), texte)}
            />
          )}
          {phase === "dEcran4" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 25,4"
              onValider={(texte) => terminerEtape(soumettreReponseDEcran4(etat, texte), texte)}
            />
          )}

          {phase === "eEcran1" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="dérivée f′(t) factorisée"
              onValider={(texte) => terminerEtape(soumettreReponseEEcran1(etat, texte), texte)}
            />
          )}
          {phase === "eEcran2" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 2"
              onValider={(texte) => terminerEtape(soumettreReponseEEcran2(etat, texte), texte)}
            />
          )}
          {phase === "eEcran3" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 10,8"
              onValider={(texte) => terminerEtape(soumettreReponseEEcran3(etat, texte), texte)}
            />
          )}

          {phase === "fEcran1" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 1"
              onValider={(texte) => terminerEtape(soumettreReponseFEcran1(etat, texte), texte)}
            />
          )}
          {phase === "fEcran2" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 0,86"
              onValider={(texte) => terminerEtape(soumettreReponseFEcran2(etat, texte), texte)}
            />
          )}
          {phase === "fEcran3" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 950 000"
              onValider={(texte) => terminerEtape(soumettreReponseFEcran3(etat, texte), texte)}
            />
          )}
          {phase === "fEcran4" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 125 000"
              onValider={(texte) => terminerEtape(soumettreReponseFEcran4(etat, texte), texte)}
            />
          )}

          {phase === "gEcran1" && exercice.famille === "G" && (
            <EtapeDeuxValeursExpoProblemes
              key={cle}
              consigneGenerale={consigneG}
              blocDonnees={donnees}
              consigneEcran={consigne}
              labelChamp1={`f(${exercice.tEval1})=`}
              labelChamp2={`f(${exercice.tEval2})=`}
              lire={lisibleNombre}
              messageIllisible={MESSAGES_ILLISIBLE_EXPO.nombre}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte1, texte2) => terminerEtape(soumettreReponseGEcran1(etat, { texte1, texte2 }), `f(${exercice.tEval1})=${texte1} ; f(${exercice.tEval2})=${texte2}`)}
              validation={validation}
            />
          )}
          {phase === "gEcran2" && (
            <EtapeChampExpoProblemes
              key={cle}
              {...propsChampCommun}
              placeholder="ex : 4,2"
              onValider={(texte) => terminerEtape(soumettreReponseGEcran2(etat, texte), texte)}
            />
          )}
          {phase === "gEcran3" && (
            <EtapeChoixOuiNonExpoProblemes
              key={cle}
              consigneGenerale={consigneG}
              blocDonnees={donnees}
              consigneEcran={consigne}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(atteignable) => terminerEtape(soumettreReponseGEcran3(etat, atteignable), atteignable ? "Oui" : "Non")}
              validation={validation}
            />
          )}

          {calculatriceVisible && <CalculatriceScientifique />}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
