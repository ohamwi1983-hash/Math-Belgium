import { useState } from "react";
import type { ExerciceInequation, SolutionEnsemble } from "../core/inequation.types";
import { Katex } from "./Katex";
import { formatInequationLatex } from "../ui/formatInequation";
import { MorceauIntervalleInput } from "./MorceauIntervalleInput";
import { construireMorceau, etatMorceauInitial } from "../ui/morceauIntervalle";
import type { EtatMorceau } from "../ui/morceauIntervalle";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { calculerCroquisColore, calculerCroquisVrai } from "../ui/parabolaSketch";
import { ParabolaSketch } from "./ParabolaSketch";
import { formatTermesApercuSolution } from "../ui/apercuIntervalle";

type Forme = SolutionEnsemble["forme"];

const OPTIONS_FORME: { valeur: Forme; libelle: string }[] = [
  { valeur: "vide", libelle: "∅" },
  { valeur: "reel", libelle: "ℝ" },
  { valeur: "point", libelle: "Un point" },
  { valeur: "reel_sauf_point", libelle: "Tous les réels sauf un point" },
  { valeur: "intervalle", libelle: "Un intervalle" },
  { valeur: "union", libelle: "Union de deux intervalles" },
];

interface Props {
  exercice: ExerciceInequation;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: SolutionEnsemble) => void;
}

/**
 * Étape "intervalle" (finale, après racines et signe de a) : construction guidée de l'ensemble-
 * solution — 6 boutons mutuellement exclusifs pour la forme générale, puis les champs
 * complémentaires propres à la forme choisie. Aucun texte libre.
 *
 * Le croquis de la parabole reste affiché ici, en plus du récapitulatif texte déjà en place —
 * construit depuis les vraies valeurs confirmées (calculerCroquisVrai), pas depuis une saisie de
 * l'élève : contrairement à l'étape signe de a, ici l'exercice a avancé, donc la référence
 * visuelle doit être correcte, stable pour toute la durée de l'étape (ne dépend que de
 * `exercice`, jamais de l'état local de construction de la réponse).
 *
 * Deux ajouts : un aperçu KaTeX de la réponse en cours de construction (mis à jour en direct,
 * jamais de saisie figée, préfixé "S = " — prompt-generateurs123vague2.md, générateur 2, point 1 —
 * le préfixe est ajouté ici, à l'appel, jamais dans formatApercuSolution elle-même, réutilisée
 * telle quelle par "Analyse d'une fonction du second degré" pour son propre aperçu `imf`, sans
 * rapport avec la notation "S =" de cet exercice) et un bouton "Aide" à sens unique (état porté par
 * la session, pas un état local, pour respecter la révélation permanente pour le reste de l'étape)
 * qui colore le croquis vert/rouge selon la classification déjà calculée (exercice.solution).
 */
export function EtapeInequation({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const [forme, setForme] = useState<Forme | null>(null);
  const [valeurPoint, setValeurPoint] = useState("");
  const [morceau, setMorceau] = useState<EtatMorceau>(etatMorceauInitial());
  const [morceau1, setMorceau1] = useState<EtatMorceau>(etatMorceauInitial());
  const [morceau2, setMorceau2] = useState<EtatMorceau>(etatMorceauInitial());

  function choisirForme(nouvelleForme: Forme) {
    setForme(nouvelleForme);
    setValeurPoint("");
    setMorceau(etatMorceauInitial());
    setMorceau1(etatMorceauInitial());
    setMorceau2(etatMorceauInitial());
  }

  function construireReponse(): SolutionEnsemble | null {
    if (forme === null) return null;
    if (forme === "vide") return { forme: "vide" };
    if (forme === "reel") return { forme: "reel" };
    if (forme === "point" || forme === "reel_sauf_point") {
      const texte = valeurPoint.trim();
      const valeur = Number(texte.replace(",", "."));
      if (texte === "" || !Number.isFinite(valeur)) return null;
      return { forme, valeur };
    }
    if (forme === "intervalle") {
      const m = construireMorceau(morceau);
      return m ? { forme: "intervalle", morceau: m } : null;
    }
    const m1 = construireMorceau(morceau1);
    const m2 = construireMorceau(morceau2);
    return m1 && m2 ? { forme: "union", morceau1: m1, morceau2: m2 } : null;
  }

  const reponse = construireReponse();
  const croquisVrai = calculerCroquisVrai(exercice);
  const croquisColore = aideActivee ? calculerCroquisColore(exercice) : undefined;
  const termesApercu = formatTermesApercuSolution(forme, valeurPoint, morceau, morceau1, morceau2);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <ParabolaSketch croquis={croquisVrai} couleurs={croquisColore} />
      <div className="equation-box">
        <Katex expression={formatInequationLatex(exercice.enonce, exercice.symbole)} block />
      </div>
      {termesApercu !== null && (
        <div className="apercu-box apercu-box-termes">
          {termesApercu.map((terme, i) => (
            <Katex key={i} expression={terme} />
          ))}
        </div>
      )}
      <p className="prompt-text">Quel est l'ensemble-solution de cette inéquation ?</p>
      <div className="options-grid">
        {OPTIONS_FORME.map((option) => (
          <button
            key={option.valeur}
            type="button"
            className={forme === option.valeur ? "btn toggle-active" : "btn"}
            onClick={() => choisirForme(option.valeur)}
          >
            {option.libelle}
          </button>
        ))}
      </div>

      {(forme === "point" || forme === "reel_sauf_point") && (
        <div className="field contenu-conditionnel">
          <label className="field-label" htmlFor="valeur-point">
            {forme === "point" ? "Valeur du point" : "Point exclu"}
          </label>
          <input
            id="valeur-point"
            className="text-input"
            value={valeurPoint}
            onChange={(e) => setValeurPoint(e.target.value)}
          />
        </div>
      )}

      {forme === "intervalle" && (
        <div className="field">
          <MorceauIntervalleInput etat={morceau} onChange={setMorceau} />
        </div>
      )}

      {forme === "union" && (
        <div className="field">
          <MorceauIntervalleInput etat={morceau1} onChange={setMorceau1} />
          <p className="union-separator">∪</p>
          <MorceauIntervalleInput etat={morceau2} onChange={setMorceau2} />
        </div>
      )}

      <button type="button" className="btn btn-aide" disabled={aideActivee} onClick={onActiverAide}>
        {aideActivee ? "Aide utilisée" : "Aide"}
      </button>

      <button
        type="button"
        className="btn btn-primary"
        disabled={reponse === null}
        onClick={() => reponse !== null && onValider(reponse)}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
