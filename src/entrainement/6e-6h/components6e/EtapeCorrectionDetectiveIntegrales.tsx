import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ValeurLigne } from "../core6e/detectiveIntegrales.types";
import type { StatutChamp } from "../moteur6e/verificationDetectiveIntegrales";
import { BlocAides, type PropsAides } from "../../4e/components/EtapesDetectiveErreurs";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écran 3 de 6gen84 (« Le détective d'erreurs : intégrales et primitives ») : corriger la ligne
 * fausse puis le résultat final. La copie, l'écran 1 (ligne fausse) et l'écran 2 (description de
 * l'erreur) sont ceux de gen81/gen91 (`4e/components/EtapesDetectiveErreurs.tsx`), réutilisés tels
 * quels.
 *
 * Une valeur est un nombre exact (« Aire = … u.a. », `V = …`) ou une fonction (`F(x) = … + C`,
 * `[f(x)]^2 = …`). Champs libres jamais filtrés (règle CLAUDE.md), aperçu LaTeX en direct,
 * 3 tentatives ; une saisie illisible ou une valeur approchée ne consomme aucune tentative. Aucun
 * point affiché.
 */

export interface ValeurDemandee {
  libelle: FragmentConsigne[];
  valeur: ValeurLigne;
  /** Message quand cette valeur est fausse (« La ligne 2 corrigée est à revoir. »). */
  aRevoir: string;
}

interface Props extends PropsAides {
  consigne: ReactNode;
  valeurs: ValeurDemandee[];
  aideSaisie: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Statuts de la dernière tentative comptée, `null` avant la première. */
  statuts: StatutChamp[] | null;
  /** La dernière soumission n'a pas été comptée : saisie illisible ou valeur approchée. */
  nonComptee: "parse_error" | "approchee" | null;
  onValider: (textes: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeCorrectionDetectiveIntegrales({ consigne, valeurs, aideSaisie, tentativesUtilisees, tentativesMax, statuts, nonComptee, onValider, validation, ...aides }: Props) {
  const [textes, setTextes] = useState<string[]>(() => valeurs.map(() => ""));
  const fige = !!validation;
  const complet = textes.every((s) => s.trim() !== "");
  const faux = statuts ? valeurs.map((v, i) => ({ v, i })).filter(({ i }) => statuts[i] !== "correct") : [];

  function champ(i: number, v: ValeurLigne): ReactNode {
    const erronee = !fige && statuts !== null && statuts[i] !== "correct";
    const avant = v.genre === "nombre" ? <RenduFragments fragments={v.prefixe} /> : <Katex expression={`${v.quantite} =`} />;
    const apres = v.genre === "nombre" ? (v.unite ? <span style={{ whiteSpace: "nowrap" }}>{v.unite}</span> : null) : v.avecC ? <Katex expression="+\,C" /> : null;
    return (
      <div style={{ display: "grid", gap: 6 }}>
        <ApercuExpressionLatex texte={textes[i]!.replace(/√\s*(\d+)/g, "rac($1)").replace(/√\(/g, "rac(")} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ whiteSpace: "nowrap" }}>{avant}</span>
          <input
            id={`detective-integrales-${i}`}
            aria-label={`Valeur ${i + 1}`}
            className={`text-input${erronee ? " is-erronee" : ""}`}
            style={{ flex: "1 1 8em", minWidth: 0 }}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={textes[i]}
            disabled={fige}
            onChange={(ev) => {
              const x = normaliserSigneMoins(ev.target.value);
              setTextes((avantTextes) => avantTextes.map((s, j) => (j === i ? x : s)));
            }}
          />
          {apres}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 16, margin: "12px 0" }}>
        {valeurs.map(({ libelle, valeur }, i) => (
          <div key={i} style={{ display: "grid", gap: 6 }}>
            <span className="field-label field-label-minuscule">
              <RenduFragments fragments={libelle} />
            </span>
            {champ(i, valeur)}
          </div>
        ))}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {aideSaisie}
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(textes)}>
            Valider
          </button>
          {nonComptee === "parse_error" && (
            <p className="alert-error" role="alert">
              Une valeur n'est pas lisible : vérifie l'écriture (parenthèses, x ou t, pi, ln, rac). Aucune tentative n'est comptée.
            </p>
          )}
          {nonComptee === "approchee" && (
            <p className="alert-error" role="alert">
              C'est une valeur approchée : donne la valeur exacte (fraction, ln, pi, rac). Aucune tentative n'est comptée.
            </p>
          )}
          {nonComptee === null && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {valeurs.length > 1 && faux.length > 0 && (
                  <ul style={{ margin: "6px 0 0", paddingLeft: "1.2em" }}>
                    {faux.map(({ v, i }) => (
                      <li key={i}>{v.aRevoir}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
