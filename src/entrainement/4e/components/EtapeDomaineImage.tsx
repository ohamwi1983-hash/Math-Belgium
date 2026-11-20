import { useState } from "react";
import type { ExerciceAnalyseFonction } from "../core/analyseFonction.types";
import type { Morceau } from "../core/inequation.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { MorceauFractionInput } from "./MorceauFractionInput";
import { construireMorceauFraction, crochetDroitEffectifFraction, crochetGaucheEffectifFraction, etatMorceauFractionInitial } from "../ui/morceauFraction";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { aidesImage, messageImage, MESSAGE_INTERVALLE_ILLISIBLE } from "../ui/aidesParabole";
import { formatApercuSolution } from "../ui/apercuIntervalle";
import { calculerCourbeAxeSommet, calculerSketchAxeSommet, calculerSurlignageImf } from "../ui/sketchAxeSommet";
import { SketchAxeSommet } from "./SketchAxeSommet";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceAnalyseFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: Morceau) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape 4 : domf = ℝ est une information donnée (pas une question), seule imf est construite —
 * toujours un seul intervalle semi-infini, donc un unique MorceauFractionInput (jamais les 6
 * formes générales de l'exercice "tableau de signes", inutiles ici). `MorceauFractionInput` (pas
 * `MorceauIntervalleInput`) car y_S = a·x_S²+b·x_S+c n'est pas garanti entier (bug corrigé : la
 * borne de imf était rejetée silencieusement dans ~18% des exercices, `MorceauIntervalleInput` ne
 * parsant que des décimaux — voir `ui/morceauFraction.ts`). Bouton "Aide" (point 2,
 * prompt-4-modifications-analyse-fonction.md) : même croquis Ox/Oy que l'étape précédente, avec en
 * plus un surlignage vert sur Oy de y_S jusqu'à l'extrémité de l'axe dans la direction de imf.
 */
export function EtapeDomaineImage({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [morceau, setMorceau] = useState(etatMorceauFractionInitial());
  const reponse = construireMorceauFraction(morceau);
  const saisie = useTentativeLisible<Morceau>();
  // Rempli (deux bornes écrites ou infinies, deux crochets) : une borne illisible ne coûte pas de tentative.
  const rempli =
    (morceau.borneGaucheMode === "-inf" || morceau.borneGaucheValeur.trim() !== "") &&
    (morceau.borneDroiteMode === "+inf" || morceau.borneDroiteValeur.trim() !== "") &&
    crochetGaucheEffectifFraction(morceau) !== null &&
    crochetDroitEffectifFraction(morceau) !== null;
  const apercu = formatApercuSolution("intervalle", "", morceau, morceau, morceau);

  const { enonce } = exercice.exercice;
  const signeA = enonce.a > 0 ? "+" : "-";
  const geom = calculerSketchAxeSommet(exercice.xS, exercice.yS, enonce.c);
  const surlignage = calculerSurlignageImf(geom, signeA);
  const courbe = calculerCourbeAxeSommet(geom, signeA);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      {/* `prompt-fact`, pas `prompt-text` : domf = ℝ est un fait donné (toujours vrai pour ce
       * générateur), pas une question — une classe dédiée évite qu'il partage le style de la vraie
       * question ci-dessous (et la cascade `.prompt-text:not(:has(~ .prompt-text))` de theme.css,
       * qui met en avant la question, s'applique alors correctement à elle seule). */}
      <p className="prompt-fact">
        <Katex expression="\operatorname{dom} f=\mathbb{R}" />
      </p>
      <p className="prompt-text">Quelle est l'image de cette fonction ?</p>
      <div className="field">
        <MorceauFractionInput etat={morceau} onChange={setMorceau} />
      </div>
      {apercu !== null && (
        <div className="apercu-box">
          <Katex expression={apercu} block />
        </div>
      )}
      {!validation && (
        <>
        <AidesNiveaux aides={aidesImage(exercice)} onPremiereAide={onActiverAide} figure={(niveau) => (niveau >= 2 ? <SketchAxeSommet geom={geom} courbe={courbe} signeA={signeA} surlignage={surlignage} /> : null)} />
        <button type="button" className="btn btn-primary" disabled={!rempli} onClick={() => saisie.tenter(reponse as Morceau, reponse !== null, onValider)}>
          Valider
        </button>
        <MessageRetour
          illisible={saisie.illisible}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          texteIllisible={MESSAGE_INTERVALLE_ILLISIBLE}
          cible={saisie.soumise ? messageImage(exercice, saisie.soumise) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
