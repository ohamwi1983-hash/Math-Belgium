import { useState } from "react";
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
import type { EtatSessionEtudeComplete, PhaseEtudeComplete, ResultatExerciceEtudeComplete } from "./moteur5e/typesEtudeComplete";
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
  formatLabelCoefBLatex,
  formatLabelCoefDirecteurLatex,
  formatLabelLimiteDroiteLatex,
  formatLabelLimiteFLatex,
  formatLabelLimiteGaucheLatex,
} from "./ui5e/formatEtudeComplete";
import { EtapeAVEtudeComplete } from "./components5e/EtapeAVEtudeComplete";
import { EtapeAsymptoteInfiniEtudeComplete } from "./components5e/EtapeAsymptoteInfiniEtudeComplete";
import { EtapeCasSpecialEtudeComplete } from "./components5e/EtapeCasSpecialEtudeComplete";
import { EtapeChampsEtudeComplete } from "./components5e/EtapeChampsEtudeComplete";
import { EtapeConclusionPointVideEtudeComplete } from "./components5e/EtapeConclusionPointVideEtudeComplete";
import { EtapeListeNombresEtudeComplete } from "./components5e/EtapeListeNombresEtudeComplete";
import { EtapeTypeLimiteEtudeComplete } from "./components5e/EtapeTypeLimiteEtudeComplete";
import { ResultatPanelEtudeComplete } from "./components5e/ResultatPanelEtudeComplete";
import { ResumeSessionEtudeComplete } from "./components5e/ResumeSessionEtudeComplete";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEtudeComplete {
  return demarrerSessionEtudeComplete(REGLAGES_DEMO, genererExerciceEtudeComplete);
}

interface Bilan {
  resultat: ResultatExerciceEtudeComplete;
  aideParPhase: Partial<Record<PhaseEtudeComplete, { niveauAide: number; revele: boolean }>>;
}

export function App5gen24() {
  const [etat, setEtat] = useState<EtatSessionEtudeComplete>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseEtudeComplete, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionEtudeComplete) {
    const miseAJour = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereEtapeRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Étude complète</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionEtudeComplete(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <EcranCourant
              exercice={exercice}
              phase={phase}
              etat={etat}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              cleEcran={cleEcran}
              terminerEtape={terminerEtape}
              setEtat={setEtat}
            />
          )}
          {dernierBilan && (
            <ResultatPanelEtudeComplete
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionEtudeComplete resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
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
  terminerEtape: (nouvelEtat: EtatSessionEtudeComplete) => void;
  setEtat: (etat: EtatSessionEtudeComplete) => void;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat }: EcranProps) {
  const niveauAideMax = niveauAideMaxEtudeComplete();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));
  const propsCommunes = { tentativesUtilisees, tentativesMax, niveauAide: etat.niveauAide, niveauAideMax, onActiverAide };

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
          onValider={(v) => terminerEtape(soumettreReponseConstructionInverse(etat, v[0]))}
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
        onValider={(v) => terminerEtape(soumettreReponseDomaine(etat, v))}
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
        onValider={(choix) => terminerEtape(soumettreReponseTypeLimite(etat, choix))}
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
        onValider={(v) => terminerEtape(soumettreReponsePointVideSimplification(etat, v[0]))}
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
        onValider={(v) => terminerEtape(soumettreReponsePointVideLimite(etat, v[0]))}
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
        onValider={(reponse) => terminerEtape(soumettreReponsePointVideConclusion(etat, reponse))}
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
        onValider={(v) => terminerEtape(soumettreReponseLimitesGD(etat, phase, { gauche: v[0], droite: v[1] }))}
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
        onValider={(reponse) => terminerEtape(soumettreReponseAV(etat, reponse))}
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
        onValider={(v) => terminerEtape(soumettreReponseInfini(etat, { moins: v[0], plus: v[1] }))}
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
        onValider={(v) => terminerEtape(soumettreReponseCoefDirecteur(etat, { moins: v[0], plus: v[1] }))}
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
        onValider={(v) => terminerEtape(soumettreReponseCoefB(etat, { moins: v[0], plus: v[1] }))}
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
        onValider={(reponse) => terminerEtape(soumettreReponseAsymptoteInfini(etat, reponse))}
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
        onValider={(reponse) => terminerEtape(soumettreReponseCasSpecial(etat, reponse))}
        diagnostiquer={(reponse) => diagnostiquerCasSpecial(reponse, x, y)}
      />
    );
  }

  return null;
}
