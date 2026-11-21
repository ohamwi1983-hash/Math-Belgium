import { useState } from "react";
import type { Fragments } from "../ui/ecransTransfertSecondDegre";
import { BoutonAide } from "./BoutonAide";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  consigne: Fragments;
  options: Fragments[];
  bonnes: number[];
  aides: Fragments[];
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (coches: number[]) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Choix MULTIPLE de la coquille `AppTransfertSecondDegre` (4e ch. 6, lot H, gen129 : cocher tous les
 * vecteurs directeurs) — cases CARRÉES (jamais la pastille ronde d'un choix unique), UNE tentative.
 * Une fois l'écran clos : case cochée à tort en rouge, bonne réponse oubliée signalée « à cocher ».
 */
export function EtapeCasesTransfert({ consigne, options, bonnes, aides, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [coches, setCoches] = useState<number[]>([]);
  const fige = !!validation;
  const basculer = (i: number) => setCoches((c) => (c.includes(i) ? c.filter((j) => j !== i) : [...c, i].sort((a, b) => a - b)));
  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>
      <div style={{ display: "grid", gap: 8, margin: "12px 0" }} role="group">
        {options.map((option, i) => {
          const coche = coches.includes(i);
          const faux = fige && coche && !bonnes.includes(i);
          const oublie = fige && !coche && bonnes.includes(i);
          return (
            <button
              key={i}
              type="button"
              role="checkbox"
              aria-checked={coche}
              disabled={fige}
              className={`btn${coche ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={{ textAlign: "left", justifyContent: "flex-start", whiteSpace: "normal", lineHeight: 1.4, minHeight: 44, gap: 10 }}
              onClick={() => basculer(i)}
            >
              <span
                aria-hidden="true"
                style={{
                  flex: "none",
                  width: 18,
                  height: 18,
                  boxSizing: "border-box",
                  borderRadius: 3,
                  border: "2px solid currentColor",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {coche ? "✓" : ""}
              </span>
              <span>
                <RenduFragments fragments={option} />
              </span>
              {oublie && <span style={{ marginLeft: "auto", fontSize: "0.85em", fontWeight: 600 }}>à cocher</span>}
            </button>
          );
        })}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Coche toutes les bonnes réponses (il peut y en avoir plusieurs), puis valide : une seule tentative.
          </p>
          {aides.slice(0, niveauAide).map((aide, i) => (
            <div key={i} className="triangle-quelconque-aide">
              <p>
                <RenduFragments fragments={aide} />
              </p>
            </div>
          ))}
          <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={coches.length === 0} onClick={() => coches.length > 0 && onValider(coches)}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
