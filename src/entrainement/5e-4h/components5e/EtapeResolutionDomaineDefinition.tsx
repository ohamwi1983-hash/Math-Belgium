import { useState } from "react";
import type { ReactNode } from "react";
import type { EnsembleReelGuide, ExerciceDomaineDefinition, SlotCE } from "../core5e/domaineDefinition.types";
import type { ReponseResolution } from "../moteur5e/sessionDomaineDefinition";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { GrilleQuotientDomfBuilder } from "./GrilleQuotientDomfBuilder";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE_DOMAINE_DEFINITION, formatEnsembleReelLatex, formatSlotConditionLatex, formatTermesEtatActuelCELatex } from "../ui5e/formatDomaineDefinition";

interface Props {
  exercice: ExerciceDomaineDefinition;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Bloc "données" redondant (f(x)), rendu juste APRÈS la consigne générale (A.9, ordre standard
   * des blocs) — jamais avant, contrairement au montage précédent d'`App5gen1.tsx`. */
  donnees: ReactNode;
  onValider: (reponse: ReponseResolution) => void;
}

function EtatActuelCE({ exercice }: { exercice: ExerciceDomaineDefinition }) {
  const termes = formatTermesEtatActuelCELatex(exercice);
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

/** Bloc "état actuel" SCOPÉ à une seule ligne LaTeX libre (B.0.2, promptcorrectionsregroupees.md)
 * — jamais réutiliser `EtatActuelCE` (qui recapitule TOUJOURS les 2 CE de l'exercice à la fois) sur
 * un écran qui ne résout qu'UNE des 2 conditions indépendantes de "racineSurD". */
function EtatActuelLignes({ termes }: { termes: string[] }) {
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

/** Écran 2 — résolution des CE (sautée pour toute famille à une seule CE, voir `phaseApresCE` ;
 * n'existe donc plus que pour "fractionSousRacine" — le tableau de signes — et
 * "racineSurFraction"/"racineSurD" — 2 CE indépendantes). Aucune aide sur cet écran (jamais
 * spécifiée par la spec pour ces 2 cas, voir `niveauAideMaxResolution`). */
export function EtapeResolutionDomaineDefinition({ exercice, tentativesUtilisees, tentativesMax, donnees, onValider }: Props) {
  const montrerErreurs = tentativesUtilisees > 0;

  if (exercice.famille === "fractionSousRacine") {
    return (
      <div>
        <p className="prompt-text">{CONSIGNE_GENERALE_DOMAINE_DEFINITION}</p>
        {donnees}
        <EtatActuelCE exercice={exercice} />
        <GrilleQuotientDomfBuilder exercice={exercice} tentativesUtilisees={tentativesUtilisees} onValider={(grille) => onValider({ famille: "fractionSousRacine", grille })} />
      </div>
    );
  }

  if (exercice.famille === "racineSurFraction") {
    return (
      <div>
        <p className="prompt-text">{CONSIGNE_GENERALE_DOMAINE_DEFINITION}</p>
        {donnees}
        <ResolutionRacineSurFraction exercice={exercice} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} onValider={onValider} />
      </div>
    );
  }

  // Jamais atteint en pratique — les autres familles n'ont plus d'écran "resolution" séparé
  // (`phaseApresCE` mène directement à "domf" pour toute famille à une seule CE) ; "pasDeCE" n'a de
  // toute façon jamais de slot à résoudre (garde défensive de narrowing, jamais exécutée).
  if (exercice.famille === "pasDeCE") return null;
  const famille = exercice.famille;
  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_DOMAINE_DEFINITION}</p>
      {donnees}
      <EtatActuelCE exercice={exercice} />
      <p className="prompt-text">Résous la condition d'existence.</p>
      <EnsembleReelGuideBuilder
        onValider={(ensemble) => onValider({ famille, ensemble })}
        prefixApercu="CE : x\in"
        attendu={exercice.resolution}
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

interface ResolutionRacineSurFractionProps {
  exercice: Extract<ExerciceDomaineDefinition, { famille: "racineSurFraction" }>;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseResolution) => void;
}

/**
 * Les 2 CE indépendantes de "racineSurD" sont résolues l'une après l'autre, chacune via le même
 * composant guidé — y compris le dénominateur, une seule valeur exclue, exprimée comme un
 * `EnsembleReelGuide` de forme "prive_points" à un point plutôt qu'un champ texte libre ad hoc
 * (promptcorrectionsregroupees.md, B.0.5 "usage systématique") : le composant guidé s'y prête déjà
 * nativement (choisir "ℝ privé de point(s)" puis remplir un seul point), aucun mécanisme nouveau.
 *
 * Bloc "état actuel" SCOPÉ (B.0.2) : le sous-écran radicande ne récapitule QUE la condition du
 * radicande (jamais aussi celle du dénominateur, pas encore atteinte) ; le sous-écran dénominateur
 * récapitule le radicande désormais CONFIRMÉ (sa vraie résolution, pas la condition symbolique
 * brute) et la condition du dénominateur encore à résoudre — jamais les 2 CE brutes de l'exercice
 * entier comme le ferait `EtatActuelCE`, réservée à l'écran domf final.
 *
 * **Piège corrigé — `key` obligatoire sur les 2 sous-instanciations** : les 2 `return` ci-dessous
 * rendent le MÊME composant (`EnsembleReelGuideBuilder`) à la MÊME position dans l'arbre JSX
 * (`ResolutionRacineSurFraction` retourne toujours un unique `<div><EnsembleReelGuideBuilder .../></div>`),
 * pour 2 cibles logiquement différentes (radicande, puis dénominateur) — sans `key` distincte, React
 * réutilise la même instance montée entre les 2 sous-écrans au lieu de la remonter, donc son état
 * interne (`forme`/`points`/`morceaux`, propre au composant, jamais remonté au parent avant
 * "Valider") restait figé sur le choix fait pour le radicande quand l'élève passait au
 * dénominateur. Corrigé par `key="radicande"`/`key="denominateur"` — cette clé change entre les 2
 * `return`, donc React démonte/remonte au lieu de réconcilier. C'est le MÊME motif que
 * `key={generationExercice}`/`key={cleEcran}` déjà utilisé partout ailleurs sur ce chantier pour
 * remonter un écran entre 2 phases — ici appliqué DANS un seul écran logique, entre 2
 * sous-instanciations séquentielles d'un composant à état interne. Voir `docs/conventions-transversales.md`
 * ("état interne non remonté entre 2 cibles séquentielles") pour la check-list à appliquer à tout
 * futur composant de ce type (sélection guidée d'ensemble/intervalle avec state interne) réutilisé
 * plus d'une fois à la même position JSX pour des cibles différentes.
 */
function ResolutionRacineSurFraction({ exercice, tentativesUtilisees, tentativesMax, onValider }: ResolutionRacineSurFractionProps) {
  const [radicande, setRadicande] = useState<EnsembleReelGuide | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const [slotRadicande, slotDenominateur] = exercice.slots as [SlotCE, SlotCE];
  // `resolutionDenominateur` n'est `null` que pour "nSurRacineD" — jamais atteinte ici en pratique
  // (voir la garde défensive de `verifierResolutionRacineSurFraction`) ; `undefined` défensif plutôt
  // qu'un cast pour ne jamais faire croire à un highlight garanti correct sur un cas non prévu.
  const attenduDenominateur: EnsembleReelGuide | undefined =
    exercice.resolutionDenominateur !== null ? { forme: "prive_points", points: [exercice.resolutionDenominateur], morceaux: [] } : undefined;

  if (radicande === null) {
    return (
      <div>
        <EtatActuelLignes termes={[`\\text{CE : } ${formatSlotConditionLatex(slotRadicande)}`]} />
        <p className="prompt-text">Résous d'abord la condition du radicande (N(x) ≥ 0).</p>
        <EnsembleReelGuideBuilder
          key="radicande"
          onValider={setRadicande}
          prefixApercu="CE : x\in"
          attendu={exercice.resolutionRadicande}
          apresEchec={montrerErreurs}
        />
      </div>
    );
  }

  return (
    <div>
      <EtatActuelLignes
        termes={[`\\text{CE : } x\\in ${formatEnsembleReelLatex(radicande)} \\text{ et }`, formatSlotConditionLatex(slotDenominateur)]}
      />
      <p className="prompt-text">Résous maintenant la condition du dénominateur (valeur exclue).</p>
      <EnsembleReelGuideBuilder
        key="denominateur"
        onValider={(denominateur) => onValider({ famille: "racineSurFraction", radicande, denominateur })}
        prefixApercu="CE : x\in"
        attendu={attenduDenominateur}
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
