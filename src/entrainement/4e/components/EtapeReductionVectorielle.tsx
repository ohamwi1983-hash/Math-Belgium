import type { ExerciceReductionVectorielle } from "../core/reductionVectorielle.types";
import { Katex } from "./Katex";
import { OutilTraceVecteurs } from "./OutilTraceVecteurs";
import { FIGURES } from "../generateurs/reductionVectorielle/figures";
import { aideReductionNiveau1, aideReductionNiveau2, formatTermesLatex, libelleFigure } from "../ui/formatReductionVectorielle";
import { diagnostiquerReduction } from "../moteur/verificationReductionVectorielle";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { EcranChampVecteurs } from "./EcranChampVecteurs";
import { texte as tx, latex as lx } from "../../export/corrigeTableau";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceReductionVectorielle;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran`. */
  validation?: ValidationEtapeProps | null;
}

/** Aides du générateur (segments texte / KaTeX) en fragments, un niveau = toutes ses lignes. */
function versFragments(lignes: { type: "texte" | "katex"; valeur: string }[][]): FragmentConsigne[] {
  return lignes.flatMap((ligne, i) => [...(i > 0 ? [tx(" ")] : []), ...ligne.map((s) => (s.type === "katex" ? lx(s.valeur) : tx(s.valeur)))]);
}

/** Vecteur saisi (deux lettres de la figure) → composantes, ou null. */
function composantesSaisies(exercice: ExerciceReductionVectorielle, texte: string): { x: number; y: number } | null {
  const m = /^([A-Za-z])[\s,;\->]*([A-Za-z])$/.exec(texte.trim());
  if (!m) return null;
  const p = exercice.points[m[1].toUpperCase()];
  const q = exercice.points[m[2].toUpperCase()];
  return p && q ? { x: q.x - p.x, y: q.y - p.y } : null;
}

/**
 * Unique écran de gen27 : réduire une somme de vecteurs de la figure en un seul vecteur. Règles
 * communes (audit 4e ch. 6, lot B) : une saisie qui n'est pas « deux points de la figure » n'est
 * jamais transmise (aucune tentative) ; message ciblé (vecteur opposé : signe de Chasles) ; aides
 * à deux niveaux (règles de Chasles, puis lecture de l'expression).
 */
export function EtapeReductionVectorielle({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  return (
    <EcranChampVecteurs<string>
      enTete={
        <>
          <p className="prompt-text">{libelleFigure(exercice)}</p>
          <OutilTraceVecteurs points={exercice.points} aretes={FIGURES[exercice.figure].aretes} />
          <p className="prompt-text">Réduis l'expression suivante en un seul vecteur.</p>
          <div className="equation-box">
            <div className="equation-box-termes">
              {formatTermesLatex(exercice).map((terme, i) => (
                <Katex key={i} expression={terme} />
              ))}
            </div>
          </div>
        </>
      }
      consigne="Désigne le vecteur par deux points de la figure."
      id="reduction-vectorielle-reponse"
      label="Vecteur réduit ="
      placeholder="ex : PQ"
      lire={(t) => (diagnostiquerReduction(exercice, t) === "parse_error" ? null : t)}
      estFausse={(t) => diagnostiquerReduction(exercice, t) !== "correct"}
      aides={[versFragments(aideReductionNiveau1()), versFragments(aideReductionNiveau2(exercice))]}
      onPremiereAide={onActiverAide}
      cible={(t) => {
        const c = composantesSaisies(exercice, t);
        if (c && Math.abs(c.x + exercice.reponse.x) < 0.01 && Math.abs(c.y + exercice.reponse.y) < 0.01) {
          return [tx("C'est le vecteur opposé : relis le sens de chaque terme ("), lx("-\\vec{TS}=\\vec{ST}"), tx(") et l'ordre des points dans Chasles ("), lx("\\vec{RS}+\\vec{ST}=\\vec{RT}"), tx(").")];
        }
        return null;
      }}
      texteIllisible={`Vecteur non reconnu : écris deux points de la figure (${Object.keys(exercice.points).join(", ")}), par exemple ${Object.keys(exercice.points).slice(0, 2).join("")}. Cette saisie ne compte pas comme une tentative.`}
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      onValider={onValider}
      validation={validation}
    />
  );
}
