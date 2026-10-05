import { useState } from "react";
import type { ExerciceCaracteristiquesAlgebriques } from "../core/caracteristiquesAlgebriques.types";
import { diagnostiquerIsolementNiveau1 } from "../moteur/verificationCaracteristiquesAlgebriques";
import {
  formatBaseLatex,
  formatEquationRechercheZerosLatex,
  formatP1Latex,
  instructionIsolement,
  placeholderIsolement,
  placeholderRegroupe,
} from "../ui/formatCaracteristiquesAlgebriques";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceCaracteristiquesAlgebriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: string) => void;
}

/**
 * Étape "zéros — isolement" (spec section 4, point 4) : l'énoncé affiche `f(x)=...` tel quel,
 * jamais `=0` accolé (`prompt-corrections-ecrans-zeros.md`, point 2 — l'objectif `f(x)=0` est porté
 * par l'instruction elle-même, voir `instructionIsolement`, plutôt que par l'énoncé). L'instruction
 * est spécifique à la famille réellement générée ("isole la valeur absolue", "isole la racine
 * carrée"...) — jamais le gabarit générique `[base]` affiché littéralement à l'élève (point 3).
 * Aucun bloc "état actuel" sur cet écran : c'est toujours le premier de la séquence "zéros", rien
 * n'est encore confirmé (même principe que `EtapeIsolement`/`EtapeReconnaissance`, exercice 1, qui
 * n'affichent jamais ce bloc non plus). Vérification flexible par équivalence algébrique (voir
 * `verifierIsolementNiveau1`). Nommé `Niveau1` pour ne pas collisionner avec `EtapeIsolement.tsx`
 * (exercice 1, "méthode la plus rapide" — une étape totalement différente).
 *
 * Niveau 2, familles `carre`/`cube` (`prompt-corrections-niveau2-tests.md`, point 2) : cette étape
 * ne demande plus d'isoler `[base](P1)=-k(x)` mais de DÉVELOPPER le carré/cube réel de l'exercice
 * et de regrouper — l'instruction cite donc cette expression réelle, rendue en LaTeX
 * (`formatBaseLatex`), jamais la lettre-code de conception "P1" ; le champ reçoit alors
 * `placeholderRegroupe` (un exemple d'équation développée, ex. `x^2-5x+6=0`) plutôt que
 * `placeholderIsolement` (hérité de l'ancienne consigne "isole ...", incohérent avec "développe
 * puis regroupe" — `prompt-corrections-niveau2-vague2.md`, point 2).
 *
 * L'encadré du haut affiche l'équation posée pour la recherche des zéros SANS le préfixe `f(x) =`
 * (`formatEquationRechercheZerosLatex`, `prompt-corrections-niveau2-vague2.md`, point 1) — cet
 * écran appartient à la séquence "zéros", jamais à un écran portant sur `f` elle-même.
 */
export function EtapeIsolementNiveau1({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const developpementDirect = exercice.niveau === "niveau2" && (exercice.famille === "carre" || exercice.famille === "cube");
  const statut = tentativesUtilisees > 0 ? diagnostiquerIsolementNiveau1(exercice, texte) : undefined;
  const erronee = statut !== undefined && statut !== "correct";

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatEquationRechercheZerosLatex(exercice)} block />
      </div>
      {developpementDirect ? (
        <p className="prompt-text">
          Développe{" "}
          <Katex expression={formatBaseLatex(exercice.famille as "carre" | "cube", formatP1Latex(exercice.a, exercice.b))} />, puis
          regroupe tous les termes du même côté pour obtenir une équation du{" "}
          {exercice.famille === "carre" ? "second" : "troisième"} degré.
        </p>
      ) : (
        <p className="prompt-text">{instructionIsolement(exercice.famille)}</p>
      )}
      <div className="field field-inline">
        <input
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={developpementDirect ? placeholderRegroupe(exercice.famille) : placeholderIsolement(exercice.famille)}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          aria-label="Équation isolée"
        />
      </div>
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
