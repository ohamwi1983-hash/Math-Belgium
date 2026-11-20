import { useState } from "react";
import type { ReactNode } from "react";
import type { EnsembleReelGuide, ExerciceDomaineDefinition } from "../core5e/domaineDefinition.types";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { GrilleQuotientDomfRecap } from "./GrilleQuotientDomfRecap";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CONSIGNE_GENERALE_DOMAINE_DEFINITION, calculerAideGrilleDomf, formatTermesEtatActuelCELatex, LATEX_DOM_F } from "../ui5e/formatDomaineDefinition";
import { aidesDomf5gen1, cibleEnsemble } from "../ui5e/retoursFonctions1";
import { Katex } from "../components/Katex";
import { MessageRetour } from "../../4e/components/RetourSaisie";
import { AidesTrig } from "./RetourSaisieTrig";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceDomaineDefinition;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  /** Bloc "données" redondant (f(x)), rendu juste APRÈS la consigne générale (A.9, ordre standard
   * des blocs). */
  donnees: ReactNode;
  onValider: (reponse: EnsembleReelGuide) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran final — domf, toujours atteint quelle que soit la famille. Bloc "état actuel" (point 1.2)
 * : la CE déjà écrite, enrichi du tableau de signes déjà complété pour "fractionSousRacine" (point
 * 6) — seule famille avec une aide sur cet écran (surlignage vert des cases pertinentes, repris du
 * gen6 4e). */
export function EtapeDomfDomaineDefinition({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, donnees, onValider, validation }: Props) {
  const montrerErreurs = tentativesUtilisees > 0;
  const [soumis, setSoumis] = useState<EnsembleReelGuide | null>(null);
  const termesEtatActuel = formatTermesEtatActuelCELatex(exercice);
  const aFractionSousRacine = exercice.famille === "fractionSousRacine" && !exercice.aucuneCE;
  // Surlignage du tableau : niveau 2 (le niveau 1 rappelle la propriété du cours).
  const highlight = aFractionSousRacine && niveauAide >= 2 ? calculerAideGrilleDomf(exercice.grille, exercice.racines) : undefined;

  return (
    <div>
      <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE_DOMAINE_DEFINITION} blocDonnees={donnees} />
      <div className="etat-actuel-box etat-actuel-box-termes">
        {termesEtatActuel.length === 0 && <span>CE : aucune</span>}
        {termesEtatActuel.map((t, i) => (
          <span key={i}>
            {i === 0 ? "CE : " : "et "}
            <Katex expression={t} />
          </span>
        ))}
      </div>
      {aFractionSousRacine && <GrilleQuotientDomfRecap exercice={exercice} highlight={highlight} />}
      <p className="prompt-text">Exprime le domaine de définition de f en notation ensembliste.</p>
      <EnsembleReelGuideBuilder
        onValider={(e) => {
          setSoumis(e);
          onValider(e);
        }}
        prefixApercu={`${LATEX_DOM_F} =`}
        contenuAvantValider={
          <>
            <AidesTrig niveauAide={niveauAide} aides={aidesDomf5gen1(exercice)} />
            <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          </>
        }
        attendu={exercice.domf}
        apresEchec={montrerErreurs}
        validation={validation}
      />
      {!validation && montrerErreurs && (
        <MessageRetour illisible={false} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={soumis ? cibleEnsemble(soumis, exercice.domf) : null} />
      )}
    </div>
  );
}
