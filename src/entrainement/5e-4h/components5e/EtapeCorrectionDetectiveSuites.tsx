import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { BlocAides, type PropsAides } from "../../4e/components/EtapesDetectiveErreurs";
import { RenduFragments } from "../../4e/components/RenduFragments";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écran 3 de 5gen49 (« Détective d'erreurs : suites ») : le résultat final corrigé. La copie,
 * l'écran 1 (ligne fausse) et l'écran 2 (description de l'erreur) sont ceux de gen81/gen91/6gen88
 * (`4e/components/EtapesDetectiveErreurs.tsx`), réutilisés tels quels.
 *
 * Un seul champ libre (jamais filtré, règle CLAUDE.md : seule `normaliserSigneMoins` est appliquée),
 * 3 tentatives ; une saisie illisible ou une valeur approchée (au lieu de la valeur exacte) ne
 * consomme aucune tentative. Des raccourcis REMPLISSENT le champ (« n'existe pas », « +∞ », « −∞ »)
 * sans jamais restreindre ce qu'on peut taper. Aucun point affiché.
 */

interface Props extends PropsAides {
  consigne: ReactNode;
  libelle: FragmentConsigne[];
  /** LaTeX avant le champ (« S = », « u_8 \approx ») ; `null` : aucun. */
  prefixe: string | null;
  unite: string | null;
  raccourcis: string[];
  aideSaisie: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Faux à la dernière tentative comptée (champ souligné). */
  erronee: boolean;
  /** Message propre à la dernière tentative fausse (« c'est le résultat de la copie »). */
  messageFaux: string | null;
  /** La dernière soumission n'a pas été comptée : saisie illisible ou valeur approchée. */
  nonComptee: "parse_error" | "approchee" | null;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

/** Aperçu LaTeX seulement pour une saisie numérique (pas « n'existe pas », pas « +∞ »). */
function apercuPossible(texte: string): boolean {
  return texte.trim() !== "" && !/[a-zA-Zàéèê∞']/.test(texte.replace(/^[^=≈]*[=≈]/, ""));
}

export function EtapeCorrectionDetectiveSuites({
  consigne,
  libelle,
  prefixe,
  unite,
  raccourcis,
  aideSaisie,
  tentativesUtilisees,
  tentativesMax,
  erronee,
  messageFaux,
  nonComptee,
  onValider,
  validation,
  ...aides
}: Props) {
  const [texte, setTexte] = useState("");
  const fige = !!validation;
  const complet = texte.trim() !== "";
  const souligne = !fige && erronee;

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 6, margin: "12px 0", minWidth: 0 }}>
        <label htmlFor="detective-suites-champ" className="field-label field-label-minuscule">
          <RenduFragments fragments={libelle} />
        </label>
        {apercuPossible(texte) && <ApercuExpressionLatex texte={texte.replace(/^[^=≈]*[=≈]/, "").replace(/(\d)[\s  ]+(?=\d)/g, "$1")} />}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
          {prefixe && (
            <span style={{ whiteSpace: "nowrap" }}>
              <Katex expression={prefixe} />
            </span>
          )}
          <input
            id="detective-suites-champ"
            className={`text-input${souligne ? " is-erronee" : ""}`}
            style={{ flex: "1 1 8em", minWidth: 0 }}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={texte}
            disabled={fige}
            onChange={(ev) => setTexte(normaliserSigneMoins(ev.target.value))}
          />
          {unite && <span style={{ whiteSpace: "nowrap" }}>{unite}</span>}
        </div>
        {raccourcis.length > 0 && !fige && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="group" aria-label="Raccourcis de saisie">
            {raccourcis.map((r) => (
              <button key={r} type="button" className="btn" style={{ minHeight: 44 }} onClick={() => setTexte(r)}>
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {aideSaisie}
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(texte)}>
            Valider
          </button>
          {nonComptee === "parse_error" && (
            <p className="alert-error" role="alert">
              Écriture non reconnue : écris un nombre (virgule décimale, fraction 16/3){raccourcis.length > 0 ? " ou utilise un bouton" : ""}. Aucune tentative n'est comptée.
            </p>
          )}
          {nonComptee === "approchee" && (
            <p className="alert-error" role="alert">
              C'est une valeur approchée : donne la valeur exacte (fraction ou entier). Aucune tentative n'est comptée.
            </p>
          )}
          {nonComptee === null && tentativesUtilisees > 0 && (
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
