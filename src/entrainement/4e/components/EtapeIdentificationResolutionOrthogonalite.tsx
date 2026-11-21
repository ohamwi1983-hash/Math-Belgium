import { useState } from "react";
import type { ExerciceOrthogonaliteTriangleParametre, Sommet } from "../core/orthogonalite.types";
import type { ReponseIdentificationResolution } from "../moteur/verificationOrthogonalite";
import { diagnostiquerResolutionTriangleParametre } from "../moteur/verificationOrthogonalite";
import type { ChoixFigeOrthogonalite } from "../moteur/typesOrthogonalite";
import {
  LIBELLES_OUI_NON,
  PLACEHOLDER_SOLUTION_X,
  QUESTION_SOMMET_RECTANGLE,
  QUESTION_TRIANGLE_RECTANGLE,
  consigneGlobaleOrthogonalite,
  formatReductionLatex,
  formatTermesEnonceTriangleParametreLatex,
} from "../ui/formatOrthogonalite";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesIdentification, messageChoixIdentification, messageIdentification } from "../ui/retoursVecteurs3";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { PiedVecteurs } from "./PiedVecteurs";
import { useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceOrthogonaliteTriangleParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** « Rectangle ? en quel sommet ? » jugé à la première validation, puis figé. */
  choixFige: ChoixFigeOrthogonalite | null;
  onActiverAide: () => void;
  onValider: (reponse: ReponseIdentificationResolution) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

const SOMMETS: Sommet[] = ["A", "B", "C"];

function labelSommet(exercice: ExerciceOrthogonaliteTriangleParametre, sommet: Sommet): string {
  return sommet === "A" ? exercice.labelA : sommet === "B" ? exercice.labelB : exercice.labelC;
}

/**
 * Dernier écran de « triangle avec x » : résoudre la seule équation résoluble (champ x) et dire en
 * quel sommet le triangle est rectangle (choix fermé). Audit 4e ch. 6, lot B (G3) : le choix est
 * jugé UNE fois puis figé (révélé s'il était faux) ; seul x garde ses tentatives. Illisible sans
 * tentative, aides à deux niveaux (il n'y en avait aucune).
 */
export function EtapeIdentificationResolutionOrthogonalite({ exercice, tentativesUtilisees, tentativesMax, choixFige, onActiverAide, onValider, validation }: Props) {
  const [estRectangleChoisi, setEstRectangle] = useState<boolean | null>(null);
  const [sommetChoisi, setSommet] = useState<Sommet | null>(null);
  const [premier, setPremier] = useState<{ estRectangle: boolean; sommet: Sommet | null } | null>(null);
  const [texteX, setTexteX] = useState("");
  const saisie = useTentativeLisible<ReponseIdentificationResolution>();
  const lu = lireNombreSaisi(texteX);

  const fige = choixFige !== null;
  const estRectangle = fige ? (choixFige.correct ? (premier?.estRectangle ?? true) : true) : estRectangleChoisi;
  const sommet = fige ? (choixFige.correct ? (premier?.sommet ?? null) : exercice.sommetResoluble) : sommetChoisi;
  const complet = texteX.trim() !== "" && (estRectangle === false || (estRectangle === true && sommet !== null));
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const erronee = jugee !== null && diagnostiquerResolutionTriangleParametre(exercice, jugee.x) !== "correct";
  const bloque = !!validation || fige;

  const reductions: Record<Sommet, string> = {
    A: formatReductionLatex(exercice.reductionA),
    B: formatReductionLatex(exercice.reductionB),
    C: formatReductionLatex(exercice.reductionC),
  };

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGlobaleOrthogonalite(exercice)}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesEnonceTriangleParametreLatex(exercice).map((t, i) => (
              <Katex key={i} expression={t} />
            ))}
          </div>
        }
      />
      <div className="equation-box">
        {SOMMETS.map((s) => (
          <div key={s}>
            <p>Sommet {labelSommet(exercice, s)} :</p>
            <Katex expression={reductions[s]} />
          </div>
        ))}
      </div>
      <p className="prompt-text prompt-text--question-multiple">Résous la seule équation qui a une solution.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="orthogonalite-identification-x">
          x =
        </label>
        <input
          disabled={!!validation}
          id="orthogonalite-identification-x"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_SOLUTION_X}
          value={texteX}
          onChange={(e) => setTexteX(normaliserSigneMoins(e.target.value))}
        />
      </div>

      <p className="prompt-text prompt-text--question-multiple">{QUESTION_TRIANGLE_RECTANGLE}</p>
      <div className="options-grid-compact">
        <button disabled={bloque} type="button" className={estRectangle === true ? "btn toggle-active" : "btn"} onClick={() => setEstRectangle(true)}>
          {LIBELLES_OUI_NON.positif}
        </button>
        <button
          disabled={bloque}
          type="button"
          className={estRectangle === false ? "btn toggle-active" : "btn"}
          onClick={() => {
            setEstRectangle(false);
            setSommet(null);
          }}
        >
          {LIBELLES_OUI_NON.negatif}
        </button>
      </div>

      {estRectangle === true && (
        <>
          <p className="prompt-text prompt-text--question-multiple contenu-conditionnel">{QUESTION_SOMMET_RECTANGLE}</p>
          <div className="options-grid-compact">
            {SOMMETS.map((s) => (
              <button disabled={bloque} key={s} type="button" className={sommet === s ? "btn toggle-active" : "btn"} onClick={() => setSommet(s)}>
                {labelSommet(exercice, s)}
              </button>
            ))}
          </div>
        </>
      )}
      {fige && !choixFige.correct && !validation && (
        <p className="alert-error" role="status">
          <span>
            <RenduFragments fragments={messageChoixIdentification(exercice)} />
          </span>
        </p>
      )}

      {!validation && (
        <PiedVecteurs
          aides={aidesIdentification(exercice)}
          onPremiereAide={onActiverAide}
          complet={complet}
          saisie={saisie}
          reponse={() => ({ estRectangle: estRectangle as boolean, sommet, x: lu ?? Number.NaN })}
          lisible={() => lu !== null}
          onValider={(r) => {
            if (!fige) setPremier({ estRectangle: r.estRectangle, sommet: r.sommet });
            onValider(r);
          }}
          texteIllisible={ILLISIBLE_VECTEURS.valeurX}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => messageIdentification(exercice, r.x)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
