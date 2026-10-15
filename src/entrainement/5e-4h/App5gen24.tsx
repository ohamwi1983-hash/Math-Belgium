import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEtudeComplete } from "./generateurs5e/etudeComplete/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionEtudeComplete,
  niveauAideMaxEtudeComplete,
  soumettreReponseAV,
  soumettreReponseAsymptoteInfini,
  soumettreReponseCasSpecial,
  soumettreReponseCoefB,
  soumettreReponseCoefDirecteur,
  soumettreReponseConstructionInverse,
  soumettreReponseDomaine,
  soumettreReponseInfini,
  soumettreReponseLimitesGD,
  soumettreReponsePointVideConclusion,
  soumettreReponsePointVideLimite,
  soumettreReponsePointVideSimplification,
  soumettreReponseTypeLimite,
} from "./moteur5e/sessionEtudeComplete";
import type { EtatSessionEtudeComplete, PhaseEtudeComplete } from "./moteur5e/typesEtudeComplete";
import { ordreComplet } from "./moteur5e/typesEtudeComplete";
import {
  diagnostiquerCasSpecial,
  diagnostiquerEnsembleEquationsAV,
  diagnostiquerEnsembleNombres,
  diagnostiquerEquationHorizontale,
  diagnostiquerEquationOblique,
  diagnostiquerNombre,
  diagnostiquerProprietesConstructionInverse,
  diagnostiquerSimplificationPointVide,
  diagnostiquerValeurOuInfini,
  verifierTypeLimite,
} from "./moteur5e/verificationEtudeComplete";
import type { CibleValeurOuInfini } from "./moteur5e/verificationEtudeComplete";
import type { ExerciceEtudeComplete } from "./core5e/etudeComplete.types";
import {
  estPhaseTexteSimple,
  formatLabelCoefBLatex,
  formatLabelCoefDirecteurLatex,
  formatLabelLimiteDroiteLatex,
  formatLabelLimiteFLatex,
  formatLabelLimiteGaucheLatex,
  formatReponseAttendueTexte,
  formatReponseAttenduePhaseLatex,
} from "./ui5e/formatEtudeComplete";
import { EtapeAVEtudeComplete } from "./components5e/EtapeAVEtudeComplete";
import { EtapeAsymptoteInfiniEtudeComplete } from "./components5e/EtapeAsymptoteInfiniEtudeComplete";
import { EtapeCasSpecialEtudeComplete } from "./components5e/EtapeCasSpecialEtudeComplete";
import { EtapeChampsEtudeComplete } from "./components5e/EtapeChampsEtudeComplete";
import { EtapeConclusionPointVideEtudeComplete } from "./components5e/EtapeConclusionPointVideEtudeComplete";
import { EtapeListeNombresEtudeComplete } from "./components5e/EtapeListeNombresEtudeComplete";
import { EtapeTypeLimiteEtudeComplete } from "./components5e/EtapeTypeLimiteEtudeComplete";
import { Katex } from "./components/Katex";
import { calculerRecapitulatifEtudeComplete } from "./ui5e/recapitulatifEtudeComplete";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEtudeComplete {
  return demarrerSessionEtudeComplete(REGLAGES_DEMO, genererExerciceEtudeComplete);
}

/** Réponse réellement attendue de la phase qui vient de se clore — même dispatch que l'ancien
 * `ResultatPanelEtudeComplete.tsx` (supprimé, remplacé par la validation inline) : texte simple
 * pour les écrans "texte simple", LaTeX sinon (uniquement en mode "etude" — la variante
 * "constructionInverse" n'a pas de réponse LaTeX représentable). */
function reponseAttendueEtudeComplete(exercice: ExerciceEtudeComplete, phase: PhaseEtudeComplete) {
  if (estPhaseTexteSimple(exercice, phase)) return <span>{formatReponseAttendueTexte(exercice, phase)}</span>;
  if (exercice.mode !== "etude") return undefined;
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionEtudeComplete;
  revele: boolean;
}

/** Une puce par phase de `ordreComplet(etat.exerciceCourant)` — pipeline linéaire à longueur
 * VARIABLE (1/2 exclusions, point vide optionnel, coefficient directeur optionnel, cas spécial
 * optionnel, ou la seule phase "constructionInverse" pour la variante bonus), jamais un
 * `ORDRE_PHASES` fixe reconstitué à la main : même source que `calculerRecapitulatifEtudeComplete`.
 * "courante" pour `etat.phase`, "correcte"/"revele" pour les phases déjà closes
 * (`scoresPartiels[phase]`, 0 ⟺ révélée), "a-venir" au-delà. */
function calculerSegmentsProgression(
  etat: EtatSessionEtudeComplete,
  aideParPhase: Partial<Record<PhaseEtudeComplete, boolean>>,
): EtatPuceProgression[] {
  return ordreComplet(etat.exerciceCourant).map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = etat.scoresPartiels[phase];
    if (score === undefined) return "a-venir";
    if (score === 0) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}

/** Texte court pour un bloc de réponse "asymptoteInfini" (écran 8) — "aucune", ou l'équation
 * saisie par l'élève (horizontale/oblique), sans jamais révéler la cible. */
function texteBlocAsymptote(bloc: { aucune: true } | { aucune: false; type: "horizontale"; valeur: string } | { aucune: false; type: "oblique"; equation: string }): string {
  if (bloc.aucune) return "aucune";
  return bloc.type === "horizontale" ? `y = ${bloc.valeur}` : `y = ${bloc.equation}`;
}

export function App5gen24() {
  const [etat, setEtat] = useState<EtatSessionEtudeComplete>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionEtudeComplete`, jamais dans le moteur (même principe que `AppAnalyseFonction.tsx`, 4e). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Niveau d'aide RÉELLEMENT utilisé par phase close — capturé ici (présentation), `niveauAide`
   * (moteur) étant remis à 0 à chaque transition (même patron que `App5gen31.tsx::aideParPhase`). */
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseEtudeComplete, boolean>>>({});

  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionEtudeComplete) {
    const recap = calculerRecapitulatifEtudeComplete(nouvelEtat);
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

  function terminerEtape(nouvelEtat: EtatSessionEtudeComplete, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) ajouterHistorique(votreReponse, nouvelEtat);
      if (etat.niveauAide > 0) setAideParPhase((m) => ({ ...m, [etat.phase]: true }));
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideParPhase({});
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setEtat(demarrerSessionEtudeComplete(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueEtudeComplete(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Étude complète</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifEtudeComplete(etat)} />
          <EcranCourant
            exercice={exercice}
            phase={phase}
            etat={etat}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cleEcran={cleEcran}
            terminerEtape={terminerEtape}
            setEtat={setEtat}
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

interface EcranProps {
  exercice: ExerciceEtudeComplete;
  phase: PhaseEtudeComplete;
  etat: EtatSessionEtudeComplete;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionEtudeComplete, votreReponse?: ReactNode) => void;
  setEtat: (etat: EtatSessionEtudeComplete) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({
  exercice,
  phase,
  etat,
  tentativesUtilisees,
  tentativesMax,
  cleEcran,
  terminerEtape,
  setEtat,
  validation,
}: EcranProps) {
  const niveauAideMax = niveauAideMaxEtudeComplete();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));
  const propsCommunes = { tentativesUtilisees, tentativesMax, niveauAide: etat.niveauAide, niveauAideMax, onActiverAide, validation };

  if (exercice.mode === "constructionInverse") {
    if (phase === "constructionInverse") {
      const { proprietes } = exercice;
      return (
        <EtapeChampsEtudeComplete
          key={cleEcran}
          exercice={exercice}
          phase={phase}
          labels={["f(x) ="]}
          placeholders={["ex : (3x+1)/(x-2)"]}
          {...propsCommunes}
          onValider={(v) => terminerEtape(soumettreReponseConstructionInverse(etat, v[0]), `f(x) = ${v[0]}`)}
          diagnostiquer={(v) => [diagnostiquerProprietesConstructionInverse(v[0], proprietes)]}
        />
      );
    }
    return null;
  }

  if (phase === "domaine") {
    const cibles = exercice.exclusions.map((e) => e.position);
    return (
      <EtapeListeNombresEtudeComplete
        key={cleEcran}
        exercice={exercice}
        {...propsCommunes}
        onValider={(v) => terminerEtape(soumettreReponseDomaine(etat, v), v.join(" ; "))}
        diagnostiquer={(v) => diagnostiquerEnsembleNombres(v, cibles)}
      />
    );
  }

  if (phase === "typeLimite") {
    return (
      <EtapeTypeLimiteEtudeComplete
        key={cleEcran}
        exercice={exercice}
        {...propsCommunes}
        onValider={(choix) => terminerEtape(soumettreReponseTypeLimite(etat, choix), choix.map((c) => (c === "infini" ? "∞" : "point vide")).join(" ; "))}
        diagnostiquer={(choix) => exercice.exclusions.map((e, i) => verifierTypeLimite(choix[i], e.type === "pointVide"))}
      />
    );
  }

  if (phase === "pointVideSimplification") {
    const coeffsM = exercice.coeffsM as number[];
    const coeffsDVraie = exercice.coeffsDVraie as number[];
    return (
      <EtapeChampsEtudeComplete
        key={cleEcran}
        exercice={exercice}
        phase={phase}
        labels={["f(x) ="]}
        placeholders={["ex : (3x+1)/(x-2)"]}
        {...propsCommunes}
        onValider={(v) => terminerEtape(soumettreReponsePointVideSimplification(etat, v[0]), `f(x) = ${v[0]}`)}
        diagnostiquer={(v) => [diagnostiquerSimplificationPointVide(v[0], coeffsM, coeffsDVraie)]}
      />
    );
  }

  if (phase === "pointVideLimite") {
    const point = exercice.exclusions.find((e) => e.type === "pointVide");
    const cible = point?.valeurPointVide as number;
    return (
      <EtapeChampsEtudeComplete
        key={cleEcran}
        exercice={exercice}
        phase={phase}
        labels={[formatLabelLimiteFLatex(point?.position as number)]}
        labelsLatex
        placeholders={["ex : 2.5"]}
        {...propsCommunes}
        onValider={(v) => terminerEtape(soumettreReponsePointVideLimite(etat, v[0]), `lim = ${v[0]}`)}
        diagnostiquer={(v) => [diagnostiquerNombre(v[0], cible)]}
      />
    );
  }

  if (phase === "pointVideConclusion") {
    return (
      <EtapeConclusionPointVideEtudeComplete
        key={cleEcran}
        exercice={exercice}
        {...propsCommunes}
        onValider={(reponse) =>
          terminerEtape(
            soumettreReponsePointVideConclusion(etat, reponse),
            `${reponse.estAV ? "AV" : "pas d'AV"} ; ${reponse.appartientDomaine ? "appartient au domaine" : "n'appartient pas au domaine"}`,
          )
        }
      />
    );
  }

  if (phase === "limitesGD1" || phase === "limitesGD2") {
    const excl = phase === "limitesGD1" ? exercice.exclusions[0] : exercice.exclusions[1];
    const cibleGauche: CibleValeurOuInfini = { fini: false, signe: excl.signeGauche as 1 | -1 };
    const cibleDroite: CibleValeurOuInfini = { fini: false, signe: excl.signeDroit as 1 | -1 };
    return (
      <EtapeChampsEtudeComplete
        key={cleEcran}
        exercice={exercice}
        phase={phase}
        labels={[formatLabelLimiteGaucheLatex(excl.position), formatLabelLimiteDroiteLatex(excl.position)]}
        labelsLatex
        placeholders={["ex : 2, -3/2, +inf, -inf", "ex : 2, -3/2, +inf, -inf"]}
        {...propsCommunes}
        onValider={(v) =>
          terminerEtape(soumettreReponseLimitesGD(etat, phase, { gauche: v[0], droite: v[1] }), `gauche : ${v[0]} ; droite : ${v[1]}`)
        }
        diagnostiquer={(v) => [diagnostiquerValeurOuInfini(v[0], cibleGauche), diagnostiquerValeurOuInfini(v[1], cibleDroite)]}
      />
    );
  }

  if (phase === "av") {
    const cibles = exercice.exclusions.filter((e) => e.type !== "pointVide").map((e) => e.position);
    return (
      <EtapeAVEtudeComplete
        key={cleEcran}
        exercice={exercice}
        {...propsCommunes}
        onValider={(reponse) =>
          terminerEtape(soumettreReponseAV(etat, reponse), reponse.aucuneAV ? "aucune AV" : reponse.textes.join(" ; "))
        }
        diagnostiquer={(v) => diagnostiquerEnsembleEquationsAV(v, cibles)}
      />
    );
  }

  if (phase === "infini") {
    const { infini } = exercice;
    const cible = (borne: "moins" | "plus"): CibleValeurOuInfini => {
      if (infini.type === "horizontale") return { fini: true, valeur: infini.limite };
      if (infini.type === "oblique") {
        const signe: 1 | -1 = borne === "plus" ? (infini.pente >= 0 ? 1 : -1) : infini.pente >= 0 ? -1 : 1;
        return { fini: false, signe };
      }
      return { fini: false, signe: borne === "plus" ? infini.signePlusInfini : infini.signeMoinsInfini };
    };
    const cibleMoins = cible("moins");
    const ciblePlus = cible("plus");
    return (
      <EtapeChampsEtudeComplete
        key={cleEcran}
        exercice={exercice}
        phase={phase}
        labels={[formatLabelLimiteFLatex("moins-infini"), formatLabelLimiteFLatex("plus-infini")]}
        labelsLatex
        placeholders={["ex : 2, -3/2, +inf, -inf", "ex : 2, -3/2, +inf, -inf"]}
        {...propsCommunes}
        onValider={(v) => terminerEtape(soumettreReponseInfini(etat, { moins: v[0], plus: v[1] }), `−∞ : ${v[0]} ; +∞ : ${v[1]}`)}
        diagnostiquer={(v) => [diagnostiquerValeurOuInfini(v[0], cibleMoins), diagnostiquerValeurOuInfini(v[1], ciblePlus)]}
      />
    );
  }

  if (phase === "coefDirecteur") {
    const { infini } = exercice;
    const cible = (borne: "moins" | "plus"): CibleValeurOuInfini => {
      if (infini.type === "oblique") return { fini: true, valeur: infini.pente };
      return {
        fini: false,
        signe:
          borne === "plus"
            ? (infini as { signeCoefDirecteurPlus: 1 | -1 }).signeCoefDirecteurPlus
            : (infini as { signeCoefDirecteurMoins: 1 | -1 }).signeCoefDirecteurMoins,
      };
    };
    const cibleMoins = cible("moins");
    const ciblePlus = cible("plus");
    return (
      <EtapeChampsEtudeComplete
        key={cleEcran}
        exercice={exercice}
        phase={phase}
        labels={[formatLabelCoefDirecteurLatex("moins-infini"), formatLabelCoefDirecteurLatex("plus-infini")]}
        labelsLatex
        placeholders={["ex : 2, -3/2, +inf, -inf", "ex : 2, -3/2, +inf, -inf"]}
        {...propsCommunes}
        onValider={(v) =>
          terminerEtape(soumettreReponseCoefDirecteur(etat, { moins: v[0], plus: v[1] }), `a(−∞) = ${v[0]} ; a(+∞) = ${v[1]}`)
        }
        diagnostiquer={(v) => [diagnostiquerValeurOuInfini(v[0], cibleMoins), diagnostiquerValeurOuInfini(v[1], ciblePlus)]}
      />
    );
  }

  if (phase === "coefB") {
    const { infini } = exercice;
    const a = infini.type === "oblique" ? infini.pente : 0;
    const b = infini.type === "oblique" ? infini.ordonnee : 0;
    const cibleB: CibleValeurOuInfini = { fini: true, valeur: b };
    // Existence PAR CÔTÉ (comme spécifié) : dans ce modèle, a fini est TOUJOURS le même des deux
    // côtés (une fraction rationnelle n'a qu'une seule asymptote oblique — voir
    // `core5e/etudeComplete.types.ts`), donc les deux bornes apparaissent toujours ensemble ici ;
    // la condition reste écrite par côté pour rester correcte si le modèle évoluait.
    const bornes: ("moins-infini" | "plus-infini")[] = [];
    if (infini.type === "oblique") bornes.push("moins-infini", "plus-infini");
    return (
      <EtapeChampsEtudeComplete
        key={cleEcran}
        exercice={exercice}
        phase={phase}
        labels={bornes.map((borne) => formatLabelCoefBLatex(borne, a))}
        labelsLatex
        placeholders={bornes.map(() => "ex : 2, -3/2, +inf, -inf")}
        {...propsCommunes}
        onValider={(v) => terminerEtape(soumettreReponseCoefB(etat, { moins: v[0], plus: v[1] }), `b(−∞) = ${v[0]} ; b(+∞) = ${v[1]}`)}
        diagnostiquer={(v) => v.map((texte) => diagnostiquerValeurOuInfini(texte, cibleB))}
      />
    );
  }

  if (phase === "asymptoteInfini") {
    const { infini } = exercice;
    function blocCorrect(
      bloc: { aucune: true } | { aucune: false; type: "horizontale"; valeur: string } | { aucune: false; type: "oblique"; equation: string },
    ): boolean {
      if (infini.type === "aucune") return bloc.aucune === true;
      if (bloc.aucune) return false;
      if (infini.type === "horizontale")
        return bloc.type === "horizontale" && diagnostiquerEquationHorizontale(bloc.valeur, infini.limite) === "correct";
      return bloc.type === "oblique" && diagnostiquerEquationOblique(bloc.equation, infini.pente, infini.ordonnee) === "correct";
    }
    return (
      <EtapeAsymptoteInfiniEtudeComplete
        key={cleEcran}
        exercice={exercice}
        {...propsCommunes}
        onValider={(reponse) =>
          terminerEtape(
            soumettreReponseAsymptoteInfini(etat, reponse),
            `vers −∞ : ${texteBlocAsymptote(reponse.moins)} ; vers +∞ : ${texteBlocAsymptote(reponse.plus)}`,
          )
        }
        diagnostiquer={(reponse) => ({ moins: blocCorrect(reponse.moins), plus: blocCorrect(reponse.plus) })}
      />
    );
  }

  if (phase === "casSpecial" && exercice.casSpecial) {
    const { x, y } = exercice.casSpecial;
    return (
      <EtapeCasSpecialEtudeComplete
        key={cleEcran}
        exercice={exercice}
        {...propsCommunes}
        onValider={(reponse) => terminerEtape(soumettreReponseCasSpecial(etat, reponse), `x = ${reponse.x} ; y = ${reponse.y}`)}
        diagnostiquer={(reponse) => diagnostiquerCasSpecial(reponse, x, y)}
      />
    );
  }

  return null;
}
