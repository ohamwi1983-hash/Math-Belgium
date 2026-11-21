import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { PiedVecteurs } from "./PiedVecteurs";
import { Katex } from "./Katex";
import { useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props<T> {
  /** Énoncé, données, récapitulatif… (au-dessus du champ). */
  enTete: ReactNode;
  consigne: ReactNode;
  id: string;
  label: string;
  /** Libellé en KaTeX (prioritaire sur `label`), ex. « \|\vec{u}\| = ». */
  labelLatex?: string;
  placeholder?: string;
  /** Saisie lue (`null` : illisible — message, aucune tentative). */
  lire: (texte: string) => T | null;
  /** Champ marqué faux après une réponse jugée. */
  estFausse: (valeur: T) => boolean;
  aides: FragmentConsigne[][];
  onPremiereAide?: () => void;
  cible: (valeur: T) => FragmentConsigne[] | null;
  /** Message d'une saisie refusée sans tentative — fonction de la saisie (illisible ou approchée). */
  texteIllisible: string | ((texte: string) => string);
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (valeur: T) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran à un seul champ libre des anciens générateurs du 4e ch. 6 (équation réduite, valeur de x,
 * critère d'un sommet…) — règles communes du lot B : saisie jamais bloquée (`normaliserSigneMoins`
 * seulement), illisible sans tentative, message ciblé, aides à deux niveaux.
 */
export function EcranChampVecteurs<T>(props: Props<T>) {
  const [texte, setTexte] = useState("");
  const saisie = useTentativeLisible<T>();
  const lu = props.lire(texte);
  const jugee = props.tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const fausse = jugee !== null && props.estFausse(jugee);

  return (
    <div>
      {props.enTete}
      <p className="prompt-text prompt-text--question-multiple">{props.consigne}</p>
      <div className="field field-inline">
        <label className={props.labelLatex ? "field-label field-label-minuscule" : "field-label"} htmlFor={props.id}>
          {props.labelLatex ? <Katex expression={props.labelLatex} /> : props.label}
        </label>
        <input
          disabled={!!props.validation}
          id={props.id}
          className={`text-input${fausse ? " is-erronee" : ""}`}
          placeholder={props.placeholder}
          value={texte}
          onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
        />
      </div>
      {!props.validation && (
        <PiedVecteurs
          aides={props.aides}
          onPremiereAide={props.onPremiereAide}
          complet={texte.trim() !== ""}
          saisie={saisie}
          reponse={() => lu as T}
          lisible={() => lu !== null}
          onValider={props.onValider}
          texteIllisible={typeof props.texteIllisible === "function" ? props.texteIllisible(texte) : props.texteIllisible}
          tentativesUtilisees={props.tentativesUtilisees}
          tentativesMax={props.tentativesMax}
          cible={props.cible}
        />
      )}
      {props.validation && <ValidationEcran {...props.validation} />}
    </div>
  );
}
