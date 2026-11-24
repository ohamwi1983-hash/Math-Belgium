import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceAssociation } from "../core5e/association.types";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { diagnostiquerJustification, saisieJustificationIllisible, specJustification } from "../moteur5e/justificationAssociation";
import { MESSAGES_ILLISIBLE_DERIVEES } from "../moteur5e/saisieDerivees";
import { aidesJustificationAssociation, cibleJustificationAssociation, consigneJustificationAssociation } from "../ui5e/retoursAssociation";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../../4e/ui/choixFige";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { TexteRiche5e } from "./TexteRiche5e";
import { PiedEcranFonctions } from "./PiedEcranFonctions";

interface Props {
  exercice: ExerciceAssociation;
  /** Rappel de l'élément justifié (son graphique ou sa formule) et de la lettre choisie. */
  rappel: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: Record<string, string>) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * 5gen25 — écran « Justifie ton association » (lot C, modèle 6gen5) : champs lus sur le graphique ou
 * dérivée de f_k (3 tentatives, illisible refusé sans tentative), choix fermés (une tentative, jugés
 * ✗ / ✓ une fois l'écran clos). Spécification : `moteur5e/justificationAssociation.ts`.
 */
export function EcranJustificationAssociation({ exercice, rappel, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const spec = specJustification(exercice);
  const [r, setR] = useState<Record<string, string>>(() => Object.fromEntries(spec.champs.map((c) => [c.id, ""])));
  const [soumises, setSoumises] = useState<Record<string, string> | null>(null);
  const [illisible, setIllisible] = useState(false);
  const complet = spec.champs.every((c) => (r[c.id] ?? "").trim() !== "");
  const montrer = tentativesUtilisees > 0 && soumises !== null && !validation;
  const statuts = montrer && complet ? diagnostiquerJustification(spec, r) : null;
  const choixGeles = tentativesUtilisees > 0;

  function modifier(id: string, v: string) {
    setIllisible(false);
    setR((x) => ({ ...x, [id]: v }));
  }
  function valider() {
    if (!complet) return;
    if (saisieJustificationIllisible(spec, r)) {
      setIllisible(true);
      return;
    }
    setSoumises(r);
    onValider(r);
  }

  return (
    <div>
      <p className="prompt-text">
        <TexteRiche5e texte={consigneJustificationAssociation(exercice)} />
      </p>
      {rappel}
      {spec.champs.map((c) => {
        if (c.kind === "choix") {
          const etat = { selection: r[c.id] || null, choisie: validation ? r[c.id] || null : null, bonne: c.bonne };
          return (
            <div key={c.id} className="field">
              <p className="field-label">
                <TexteRiche5e texte={c.label} />
              </p>
              <div className="options-grid" role="group">
                {c.options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={classeOptionChoixFerme<string | null>(o.id, etat)}
                    aria-pressed={r[c.id] === o.id}
                    aria-label={[o.label, ariaOptionChoixFerme<string | null>(o.id, etat)].filter(Boolean).join(", ")}
                    disabled={choixGeles || !!validation}
                    onClick={() => modifier(c.id, o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          );
        }
        const erronee = statuts !== null && statuts[c.id] !== "correct";
        return (
          <div key={c.id}>
            {c.kind === "expression" && <ApercuExpressionLatex texte={r[c.id] ?? ""} />}
            <div className="field field-inline">
              <label className="field-label field-label-minuscule">
                <Katex expression={c.label} />
              </label>
              <input
                type="text"
                className={`text-input${erronee || (illisible && (r[c.id] ?? "").trim() !== "") ? " is-erronee" : ""}`}
                value={r[c.id] ?? ""}
                placeholder={c.kind === "expression" ? "ex : 6x − 4" : "ex : −1,5"}
                disabled={!!validation}
                autoComplete="off"
                onChange={(e) => modifier(c.id, normaliserSigneMoins(e.target.value))}
              />
            </div>
          </div>
        );
      })}
      <PiedEcranFonctions
        aides={aidesJustificationAssociation(exercice)}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={illisible}
        texteIllisible={spec.famille === "symbolique" ? MESSAGES_ILLISIBLE_DERIVEES.expressionX : MESSAGES_ILLISIBLE_DERIVEES.nombre}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={montrer && soumises ? cibleJustificationAssociation(exercice, soumises) : null}
        validation={validation}
      />
    </div>
  );
}
