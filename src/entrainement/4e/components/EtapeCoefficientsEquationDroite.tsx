import { useState } from "react";
import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import { NIVEAU_AIDE_MAX_COEFFICIENTS } from "../moteur/sessionEquationDroite";
import {
  diagnostiquerExpliciteX,
  diagnostiquerExpliciteY,
  diagnostiquerImplicite,
  diagnostiquerParametrique,
} from "../moteur/verificationEquationDroite";
import type { ReponseCoefficients } from "../moteur/typesEquationDroite";
import { parserExpressionAffineT } from "../moteur/verificationDroite";
import { LATEX_GABARIT_FORME, consigneCoefficients, formatAideCoefficientsNiveau2Latex, formatEnonceLatex } from "../ui/formatEquationDroite";
import { ILLISIBLE_ANALYTIQUE, cibleEquationDroite, cibleVecteurDirecteur, l, nombreOuNaN, nombresLisibles, surDroite, t } from "../ui/retoursAnalytique";
import type { StatutVerification } from "../moteur/statutVerification";
import { ConsigneGeneraleEquationDroite } from "./ConsigneGeneraleEquationDroite";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceEquationDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCoefficients) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Exemples hors de l'espace des tirages (vecteur (7 ; −9), jamais colinéaire à un vecteur tiré
 * — composantes ≤ 5) : un placeholder ne doit jamais pouvoir être la réponse (audit chapitre 7,
 * point 10). */
const PLACEHOLDER_TEXTE_X = "ex : x=1,5+t×7";
const PLACEHOLDER_TEXTE_Y = "ex : y=-0,5-t×9";

/**
 * Écran 3 (dernière phase, atteinte ssi `exercice.possible`) — le nombre et le nom des champs
 * dépendent de `exercice.formeCible` : 2 champs de TEXTE LIBRE (paramétrique — expression complète
 * "x=x0+a*t"/"y=y0+b*t", `promptgen42modifications.md` point 2, jamais 4 champs numériques
 * séparés), 3 champs numériques (implicite), 2 champs numériques (explicite Y/X, inchangés).
 * Vérifiée par proportionnalité (paramétrique — extraction textuelle puis même critère que la
 * saisie numérique/implicite) ou égalité exacte (explicite) — voir `verificationEquationDroite.ts`,
 * jamais recalculée ici.
 */
export function EtapeCoefficientsEquationDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");
  const [champ1, setChamp1] = useState("");
  const [champ2, setChamp2] = useState("");
  const [champ3, setChamp3] = useState("");

  const forme = exercice.formeCible;
  const estParametrique = forme === "parametrique";
  const nombreChampsNumeriques = forme === "implicite" ? 3 : forme === "explicite_y" || forme === "explicite_x" ? 2 : 0;
  const champsNumeriques = [champ1, champ2, champ3].slice(0, nombreChampsNumeriques);
  const complet = estParametrique ? texteX.trim() !== "" && texteY.trim() !== "" : champsNumeriques.every((v) => v.trim() !== "");

  /** Fraction « p/q », racine « √3 » acceptées (tout triplet proportionnel est juste). */
  const nombre = nombreOuNaN;

  function construireReponse(): ReponseCoefficients {
    if (estParametrique) return { texteX, texteY };
    if (forme === "implicite") return { a: nombre(champ1), b: nombre(champ2), c: nombre(champ3) };
    if (forme === "explicite_y") return { m: nombre(champ1), p: nombre(champ2) };
    return { n: nombre(champ1), q: nombre(champ2) };
  }

  function diagnostiquer(): StatutVerification {
    const reponse = construireReponse();
    if (estParametrique) return diagnostiquerParametrique(exercice, reponse as { texteX: string; texteY: string });
    if (forme === "implicite") return diagnostiquerImplicite(exercice, reponse as { a: number; b: number; c: number });
    if (forme === "explicite_y") return diagnostiquerExpliciteY(exercice, reponse as { m: number; p: number });
    return diagnostiquerExpliciteX(exercice, reponse as { n: number; q: number });
  }

  function lisible(): boolean {
    if (estParametrique) return diagnostiquerParametrique(exercice, { texteX, texteY }) !== "parse_error";
    return nombresLisibles(...champsNumeriques);
  }

  /** Message ciblé (jamais la réponse). */
  function cible(r: ReponseCoefficients) {
    if ("texteX" in r) {
      const ex = parserExpressionAffineT(r.texteX);
      const ey = parserExpressionAffineT(r.texteY);
      if (!ex || !ey) return null;
      if (colonnesEchangees(ex.coefficient, ey.coefficient)) return [t("Chaque équation associe une coordonnée de "), l("A"), t(" à la même composante de "), l("\\vec{u}"), t(" : "), l("x=x_A+x_{\\vec{u}}\\,t"), t(".")];
      const vecteur = cibleVecteurDirecteur({ x: ex.coefficient, y: ey.coefficient }, exercice.vecteur);
      if (vecteur) return vecteur;
      if (!surDroite({ x: ex.constante, y: ey.constante }, exercice.referenceImplicite)) return [t("Pour "), l("t=0"), t(", tes équations donnent un point qui n'est pas sur la droite : les termes constants sont les coordonnées d'un point de la droite.")];
      return null;
    }
    if ("c" in r) return cibleEquationDroite({ a: r.a, b: r.b, c: r.c }, exercice.referenceImplicite, exercice.point);
    return null;
  }

  function colonnesEchangees(cx: number, cy: number): boolean {
    const u = exercice.vecteur;
    return Math.abs(u.x - u.y) > 1e-9 && Math.abs(cx - u.y) < 1e-9 && Math.abs(cy - u.x) < 1e-9;
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquer() : undefined;
  const erronee = apresEchec && statut !== "correct";

  const labelsNumeriques: [string, string, string?] = forme === "implicite" ? ["a =", "b =", "c ="] : forme === "explicite_y" ? ["m =", "p ="] : ["n =", "q ="];
  const settersNumeriques = [setChamp1, setChamp2, setChamp3];
  const valeursNumeriques = [champ1, champ2, champ3];

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<ConsigneGeneraleEquationDroite exercice={exercice} />}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">{consigneCoefficients(exercice)}</p>

      {estParametrique ? (
        <>
          <div className="field">
            <label className="field-label field-label-minuscule" htmlFor="equation-droite-coefficients-texte-x">
              Équation en <Katex expression="x" /> (<Katex expression="t" /> est le paramètre)
            </label>
            <input
              id="equation-droite-coefficients-texte-x"
              className={`text-input${erronee ? " is-erronee" : ""}`}
              placeholder={PLACEHOLDER_TEXTE_X}
              value={texteX}
              onChange={(e) => setTexteX(normaliserSigneMoins(e.target.value))}
            />
          </div>
          <div className="field">
            <label className="field-label field-label-minuscule" htmlFor="equation-droite-coefficients-texte-y">
              Équation en <Katex expression="y" /> (<Katex expression="t" /> est le paramètre)
            </label>
            <input
              id="equation-droite-coefficients-texte-y"
              className={`text-input${erronee ? " is-erronee" : ""}`}
              placeholder={PLACEHOLDER_TEXTE_Y}
              value={texteY}
              onChange={(e) => setTexteY(normaliserSigneMoins(e.target.value))}
            />
          </div>
        </>
      ) : (
        labelsNumeriques.slice(0, nombreChampsNumeriques).map((label, index) => (
          <div className="field field-inline" key={label}>
            <label className="field-label field-label-minuscule" htmlFor={`equation-droite-coefficients-${index}`}>
              {label}
            </label>
            <input
              id={`equation-droite-coefficients-${index}`}
              className={`text-input${erronee ? " is-erronee" : ""}`}
              placeholder="ex : 1,5"
              value={valeursNumeriques[index]}
              onChange={(e) => settersNumeriques[index](normaliserSigneMoins(e.target.value))}
            />
          </div>
        ))
      )}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <Katex expression={LATEX_GABARIT_FORME[forme]} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideCoefficientsNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_COEFFICIENTS}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={construireReponse}
          lisible={lisible}
          onValider={onValider}
          texteIllisible={estParametrique ? ILLISIBLE_ANALYTIQUE.parametriques : ILLISIBLE_ANALYTIQUE.coefficient}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={cible}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
