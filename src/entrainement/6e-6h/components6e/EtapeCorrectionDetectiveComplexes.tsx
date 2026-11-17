import { useState } from "react";
import type { ReactNode } from "react";
import type { ChampDetectiveComplexes } from "../core6e/detectiveComplexes.types";
import type { StatutChampComplexes } from "../moteur6e/verificationDetectiveComplexes";
import { BlocAides, type PropsAides } from "../../4e/components/EtapesDetectiveErreurs";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écran 3 de 6gen99 (« Détective d'erreurs : nombres complexes ») : les valeurs corrigées. La
 * copie, l'écran 1 (ligne fausse) et l'écran 2 (description de l'erreur) sont ceux de
 * gen81/gen91/6gen88/5gen49 (`4e/components/EtapesDetectiveErreurs.tsx`), réutilisés tels quels.
 *
 * Un champ libre par valeur (jamais filtré, règle CLAUDE.md : seule `normaliserSigneMoins` est
 * appliquée), 3 tentatives ; une saisie illisible, approchée ou en degrés ne consomme aucune
 * tentative. Les boutons « √ » et « π » d'un champ réel AJOUTENT le symbole au champ (aide au
 * clavier de téléphone) sans jamais restreindre ce qu'on peut taper. Aucun point affiché.
 */

interface Props extends PropsAides {
  consigne: ReactNode;
  champs: ChampDetectiveComplexes[];
  aideSaisie: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Statuts de la dernière tentative comptée (`null` avant la première). */
  statuts: StatutChampComplexes[] | null;
  /** Message propre à la dernière tentative fausse (« c'est le résultat de la copie »). */
  messageFaux: string | null;
  /** La dernière soumission n'a pas été comptée (message à afficher). */
  nonCompte: string | null;
  onValider: (textes: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

/** Aperçu LaTeX : seulement si la saisie n'est pas un simple nombre (« √ » → « √( ) » pour l'aperçu). */
function apercu(texte: string): string | null {
  const s = texte.replace(/^[^=]*=/, "").trim();
  if (s === "" || /^-?\d+([.,]\d+)?$/.test(s)) return null;
  return s.replace(/√\s*(\d+(?:[.,]\d+)?)/g, "√($1)");
}

export function EtapeCorrectionDetectiveComplexes({
  consigne,
  champs,
  aideSaisie,
  tentativesUtilisees,
  tentativesMax,
  statuts,
  messageFaux,
  nonCompte,
  onValider,
  validation,
  ...aides
}: Props) {
  const [textes, setTextes] = useState<string[]>(() => champs.map(() => ""));
  const fige = !!validation;
  const complet = textes.every((x) => x.trim() !== "");

  function changer(i: number, valeur: string) {
    setTextes((anciens) => anciens.map((a, j) => (j === i ? normaliserSigneMoins(valeur) : a)));
  }

  function valider() {
    if (complet && !fige) onValider(textes);
  }

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 10, margin: "12px 0", minWidth: 0 }}>
        {champs.map((champ, i) => {
          const id = `detective-complexes-champ-${i}`;
          const ap = apercu(textes[i] ?? "");
          const erronee = !fige && statuts?.[i] === "faux";
          return (
            <div key={i} style={{ display: "grid", gap: 4, minWidth: 0 }}>
              {ap !== null && <ApercuExpressionLatex texte={ap} />}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
                <label htmlFor={id} style={{ whiteSpace: "nowrap", minWidth: "4.2em" }}>
                  <Katex expression={champ.prefixe} />
                </label>
                <input
                  id={id}
                  className={`text-input${erronee ? " is-erronee" : ""}`}
                  style={{ flex: "1 1 7em", minWidth: 0 }}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={textes[i]}
                  disabled={fige}
                  onChange={(ev) => changer(i, ev.target.value)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") valider();
                  }}
                />
                {champ.genre === "reel" && !fige && (
                  <span style={{ display: "inline-flex", gap: 6 }}>
                    {["√", "π"].map((symbole) => (
                      <button
                        key={symbole}
                        type="button"
                        className="btn"
                        style={{ minHeight: 44, minWidth: 44, padding: "0 10px" }}
                        aria-label={`Ajouter ${symbole === "√" ? "une racine carrée" : "π"}`}
                        onClick={() => changer(i, `${textes[i] ?? ""}${symbole}`)}
                      >
                        {symbole}
                      </button>
                    ))}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {aideSaisie}
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          {nonCompte !== null && (
            <p className="alert-error" role="alert">
              {nonCompte}
            </p>
          )}
          {nonCompte === null && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {messageFaux && <p style={{ margin: "6px 0 0" }}>{messageFaux}</p>}
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
