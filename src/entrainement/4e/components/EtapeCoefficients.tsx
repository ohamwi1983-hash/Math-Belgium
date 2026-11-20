import { useState } from "react";
import type { ExerciceAnalyseFonction } from "../core/analyseFonction.types";
import { Katex } from "./Katex";
import { formatFonctionColoreeLatex } from "../ui/formatAnalyseFonction";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { aidesCoefficients, messageCoefficients, MESSAGE_COEFFICIENT_ILLISIBLE } from "../ui/aidesParabole";

interface Props {
  exercice: ExerciceAnalyseFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: { a: number; b: number; c: number }) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape 1 : f(x) affiché avec les termes non nuls dans l'ordre mélangé, 3 champs a/b/c. Règles
 * communes (audit 4e ch. 1, lot B) : un nombre illisible n'est jamais transmis au moteur (aucune
 * tentative consommée), fractions et « − » acceptés (`parserNombreOuFraction`), aides à deux niveaux
 * (le niveau 2 montre f(x) rangé, coefficients colorés), message ciblé (signes, ordre d'écriture).
 */
export function EtapeCoefficients({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const saisie = useTentativeLisible<{ a: number; b: number; c: number }>();

  const complet = a.trim() !== "" && b.trim() !== "" && c.trim() !== "";
  const lus = [a, b, c].map(parserNombreOuFraction);
  const lisible = lus.every((v) => v !== null);
  const reponse = { a: lus[0] ?? NaN, b: lus[1] ?? NaN, c: lus[2] ?? NaN };
  const erronee = tentativesUtilisees > 0 && !validation;

  const champ = (id: string, nom: string, valeur: string, maj: (v: string) => void) => (
    <div className="field field-inline">
      <label className="field-label field-label-minuscule" htmlFor={id}>
        {nom} =
      </label>
      <input id={id} className={`text-input${erronee ? " is-erronee" : ""}`} value={valeur} disabled={!!validation} onChange={(e) => maj(normaliserSigneMoins(e.target.value))} />
    </div>
  );

  return (
    <div>
      <p className="prompt-text">Identifie les coefficients a, b et c.</p>
      <div className="field-row">
        {champ("coeff-a", "a", a, setA)}
        {champ("coeff-b", "b", b, setB)}
        {champ("coeff-c", "c", c, setC)}
      </div>
      {!validation && (
        <>
          <AidesNiveaux
            aides={aidesCoefficients()}
            onPremiereAide={onActiverAide}
            figure={(niveau) =>
              niveau >= 2 ? (
                <div className="template-box">
                  <Katex expression={formatFonctionColoreeLatex(exercice.exercice.enonce)} block />
                </div>
              ) : null
            }
          />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(reponse, lisible, onValider)}>
            Valider
          </button>
          <MessageRetour
            illisible={saisie.illisible}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            texteIllisible={MESSAGE_COEFFICIENT_ILLISIBLE}
            cible={saisie.soumise ? messageCoefficients(exercice, saisie.soumise) : null}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
