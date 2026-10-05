import type { ReactNode } from "react";
import type { EnsembleReelGuide, ExerciceDomaineDefinition } from "../core5e/domaineDefinition.types";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { GrilleQuotientDomfRecap } from "./GrilleQuotientDomfRecap";
import { BoutonAide } from "./BoutonAide";
import { CONSIGNE_GENERALE_DOMAINE_DEFINITION, calculerAideGrilleDomf, formatTermesEtatActuelCELatex } from "../ui5e/formatDomaineDefinition";
import { Katex } from "../components/Katex";

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
}

/** Écran final — domf, toujours atteint quelle que soit la famille. Bloc "état actuel" (point 1.2)
 * : la CE déjà écrite, enrichi du tableau de signes déjà complété pour "fractionSousRacine" (point
 * 6) — seule famille avec une aide sur cet écran (surlignage vert des cases pertinentes, repris du
 * gen6 4e). */
export function EtapeDomfDomaineDefinition({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, donnees, onValider }: Props) {
  const montrerErreurs = tentativesUtilisees > 0;
  const termesEtatActuel = formatTermesEtatActuelCELatex(exercice);
  const aFractionSousRacine = exercice.famille === "fractionSousRacine" && !exercice.aucuneCE;
  const highlight = aFractionSousRacine && niveauAide >= 1 ? calculerAideGrilleDomf(exercice.grille, exercice.racines) : undefined;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_DOMAINE_DEFINITION}</p>
      {donnees}
      <div className="etat-actuel-box etat-actuel-box-termes">
        {termesEtatActuel.map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      {aFractionSousRacine && <GrilleQuotientDomfRecap exercice={exercice} highlight={highlight} />}
      <p className="prompt-text">Exprime le domaine de définition de f, domf, en notation ensembliste.</p>
      <EnsembleReelGuideBuilder
        onValider={onValider}
        prefixApercu="domf ="
        contenuAvantValider={<BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />}
        attendu={exercice.domf}
        apresEchec={montrerErreurs}
      />
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
