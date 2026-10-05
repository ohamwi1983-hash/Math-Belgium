import type { ExerciceEquationTrigonometrique } from "../core5e/equationsTrigonometriques.types";
import type { PhaseEquationTrigonometrique, ResultatExerciceEquationTrigonometrique } from "../moteur5e/typesEquationTrig";
import {
  OPTIONS_FAMILLE,
  TEXTE_ARGUMENT_AUCUNE_SOLUTION,
  formatAidePrefacteurNiveau2Latex,
  formatAideResoudreEgaliteNiveau2Latex,
  formatAideSepararFacteursNiveau2Latex,
  formatEnonceEquationTrigonometriqueLatex,
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
} from "../ui5e/formatEquationTrigonometrique";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { Katex } from "../components/Katex";
import { CercleTrigEquationSketch } from "./CercleTrigEquationSketch";
import { LigneRecap, statutRecap, RecapTotalPoints, type StatutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseEquationTrigonometrique, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceEquationTrigonometrique;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

function versExerciceComplet(resultat: ResultatExerciceEquationTrigonometrique): ExerciceEquationTrigonometrique {
  if (resultat.famille === "directe") return { famille: "directe", exercice: resultat.exercice };
  return resultat.exercice;
}

/** Statut d'une ligne, capturé PRÉCISÉMENT (niveau d'aide réellement utilisé + révélation
 * éventuelle) au moment où l'écran `phase` s'est fermé, plutôt que déduit d'un score déjà pénalisé
 * (voir `App5gen10.tsx::terminerEtape`, qui alimente `aideParPhase`). */
function statutPhase(aideParPhase: AideParPhase, phase: PhaseEquationTrigonometrique): StatutRecap {
  const info = aideParPhase[phase];
  return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
}

function labelFamille(famille: ExerciceEquationTrigonometrique["famille"]): string {
  return OPTIONS_FAMILLE.find((o) => o.id === famille)?.label ?? famille;
}

/** Phases RÉELLEMENT affichées par `LignesRecap`, dans le même ordre et sous les mêmes conditions —
 * source unique pour construire l'`ecrans` de `RecapTotalPoints` (jamais une seconde liste divergente). */
function phasesAffichees(resultat: ResultatExerciceEquationTrigonometrique): PhaseEquationTrigonometrique[] {
  if (resultat.famille === "directe") {
    return [
      "reconnaissance",
      "argument",
      ...(resultat.scoreIsolerX !== null ? (["isolerX"] as const) : []),
      ...(resultat.scoreSolutions !== null ? (["solutions"] as const) : []),
    ];
  }
  if (resultat.famille === "produit") {
    return [
      "reconnaissance",
      ...(resultat.scorePrefacteur !== null ? (["prefacteur"] as const) : []),
      "separerFacteurs",
      "argumentProduit",
      "isolerXProduit",
      "solutionsProduit",
    ];
  }
  if (resultat.famille === "pythagoricienne") {
    return ["reconnaissance", "conversionPythagoricienne", "racinesPythagoricienne", "racinesResolution", "solutionsPythagoricienne"];
  }
  return ["reconnaissance", "conversionEgalite", "resoudreEgalite", "solutionsEgalite"];
}

/** Plusieurs fragments LaTeX rendus INLINE, séparés par une simple virgule — jamais un unique
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

function LignesRecap({ resultat, aideParPhase }: { resultat: ResultatExerciceEquationTrigonometrique; aideParPhase: AideParPhase }) {
  if (resultat.famille === "directe") {
    const exercice = resultat.exercice;
    return (
      <>
        <LigneRecap label="Reconnaissance de la technique" statut={statutPhase(aideParPhase, "reconnaissance")}>
          {labelFamille("directe")}
        </LigneRecap>
        <LigneRecap label="Résolution de l'angle" statut={statutPhase(aideParPhase, "argument")}>
          {exercice.aucuneSolution ? TEXTE_ARGUMENT_AUCUNE_SOLUTION : <TermesInline termes={formatTermesArgumentDirecteLatex(exercice)} />}
        </LigneRecap>
        {resultat.scoreIsolerX !== null && (
          <LigneRecap label="Isolement de x" statut={statutPhase(aideParPhase, "isolerX")}>
            <TermesInline termes={formatTermesXDirecteLatex(exercice)} />
          </LigneRecap>
        )}
        {resultat.scoreSolutions !== null && (
          <LigneRecap label="Solutions distinctes" statut={statutPhase(aideParPhase, "solutions")}>
            {formatSolutionsTexte(exercice.solutions, exercice.regime)}
          </LigneRecap>
        )}
      </>
    );
  }

  if (resultat.famille === "produit") {
    const exercice = resultat.exercice;
    return (
      <>
        <LigneRecap label="Reconnaissance de la technique" statut={statutPhase(aideParPhase, "reconnaissance")}>
          {labelFamille("produit")}
        </LigneRecap>
        {resultat.scorePrefacteur !== null && (
          <LigneRecap label="Factorisation" statut={statutPhase(aideParPhase, "prefacteur")}>
            <Katex expression={formatAidePrefacteurNiveau2Latex(exercice)} />
          </LigneRecap>
        )}
        <LigneRecap label="Séparation en 2 équations" statut={statutPhase(aideParPhase, "separerFacteurs")}>
          <TermesInline termes={formatAideSepararFacteursNiveau2Latex(exercice)} />
        </LigneRecap>
        <LigneRecap label="Argument (les 2 facteurs)" statut={statutPhase(aideParPhase, "argumentProduit")}>
          <TermesInline termes={formatTermesArgumentProduitLatex(exercice)} />
        </LigneRecap>
        <LigneRecap label="Isolement de x (les 2 facteurs)" statut={statutPhase(aideParPhase, "isolerXProduit")}>
          <TermesInline termes={formatTermesXProduitLatex(exercice)} />
        </LigneRecap>
        <LigneRecap label="Solutions distinctes" statut={statutPhase(aideParPhase, "solutionsProduit")}>
          {formatSolutionsTexte(exercice.solutionsUnion, regimeProduit(exercice))}
        </LigneRecap>
      </>
    );
  }

  if (resultat.famille === "pythagoricienne") {
    const exercice = resultat.exercice;
    return (
      <>
        <LigneRecap label="Reconnaissance de la technique" statut={statutPhase(aideParPhase, "reconnaissance")}>
          {labelFamille("pythagoricienne")}
        </LigneRecap>
        <LigneRecap label="Conversion pythagoricienne" statut={statutPhase(aideParPhase, "conversionPythagoricienne")}>
          <Katex expression={formatPolynomeCibleLatex(exercice)} />
        </LigneRecap>
        <LigneRecap label="Racines du polynôme" statut={statutPhase(aideParPhase, "racinesPythagoricienne")}>
          <TermesInline termes={formatTermesRacinesTLatex(exercice)} />
        </LigneRecap>
        <LigneRecap label="Rejet/résolution des racines" statut={statutPhase(aideParPhase, "racinesResolution")}>
          <TermesInline termes={formatTermesRacinesResolutionLatex(exercice)} />
        </LigneRecap>
        <LigneRecap label="Solutions distinctes" statut={statutPhase(aideParPhase, "solutionsPythagoricienne")}>
          {formatSolutionsTexte(exercice.solutionsUnion, "exact")}
        </LigneRecap>
      </>
    );
  }

  const exercice = resultat.exercice;
  return (
    <>
      <LigneRecap label="Reconnaissance de la technique" statut={statutPhase(aideParPhase, "reconnaissance")}>
        {labelFamille("egalite")}
      </LigneRecap>
      <LigneRecap label="Conversion de l'identité" statut={statutPhase(aideParPhase, "conversionEgalite")}>
        <Katex expression={formatEquationConvertieEgaliteLatex(exercice)} />
      </LigneRecap>
      <LigneRecap label="Résolution de x" statut={statutPhase(aideParPhase, "resoudreEgalite")}>
        <TermesInline termes={formatAideResoudreEgaliteNiveau2Latex(exercice)} />
      </LigneRecap>
      <LigneRecap label="Solutions distinctes" statut={statutPhase(aideParPhase, "solutionsEgalite")}>
        {formatSolutionsTexte(exercice.solutions, "exact")}
      </LigneRecap>
    </>
  );
}

/** Récapitulatif final — liste à plat (`LigneRecap`, code couleur), une ligne PAR ÉCRAN RÉELLEMENT
 * TRAVERSÉ par l'instance, dispatchée par `resultat.famille` (4 séquences structurellement
 * disjointes, voir CLAUDE.md section 5gen10). Le cercle trigonométrique final reste affiché en bas
 * (déjà en place avant ce correctif), inchangé dans sa logique. */
export function ResultatPanelEquationTrig({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <div className="equation-box equation-box-termes">
        {decouperEquationLongueLatex(formatEnonceEquationTrigonometriqueLatex(versExerciceComplet(resultat))).map((morceau, i) => (
          <Katex key={i} expression={morceau} />
        ))}
      </div>
      <LignesRecap resultat={resultat} aideParPhase={aideParPhase} />
      {resultat.famille === "directe" && resultat.exercice.aucuneSolution ? (
        <p className="prompt-text">Cette équation n'a aucune solution : |k| dépasse 1.</p>
      ) : (
        <CercleTrigEquationSketch
          points={
            resultat.famille === "directe"
              ? resultat.exercice.solutions
              : resultat.famille === "produit"
                ? resultat.exercice.solutionsUnion
                : resultat.famille === "pythagoricienne"
                  ? resultat.exercice.solutionsUnion
                  : resultat.exercice.solutions
          }
          regime={resultat.famille === "produit" ? regimeProduit(resultat.exercice) : resultat.famille === "directe" ? resultat.exercice.regime : "exact"}
        />
      )}
      <RecapTotalPoints
        ecrans={phasesAffichees(resultat).map((phase) => {
          const info = aideParPhase[phase];
          return { revele: info?.revele ?? false, niveauAide: info?.niveauAide ?? null };
        })}
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
