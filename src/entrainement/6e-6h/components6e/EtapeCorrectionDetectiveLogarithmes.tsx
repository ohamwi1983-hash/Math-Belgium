import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ReponseChampLog, ValeurLog } from "../core6e/detectiveLogarithmes.types";
import type { StatutChamp } from "../moteur6e/verificationDetectiveLogarithmes";
import { BlocAides, type PropsAides } from "../../4e/components/EtapesDetectiveErreurs";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { evaluerValeurExponentielle } from "../moteur6e/expressionExponentielle";
import { expressionLibreVersLatex } from "../ui/formatExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écran 3 de 6gen88 (« Le détective d'erreurs : logarithmes ») : corriger la ligne fausse et/ou le
 * résultat final. La copie, l'écran 1 (ligne fausse) et l'écran 2 (description de l'erreur) sont
 * ceux de gen81/gen91 (`4e/components/EtapesDetectiveErreurs.tsx`), réutilisés tels quels — comme
 * 6gen84, dont cet écran reprend la structure (`EtapeCorrectionDetectiveIntegrales.tsx`) en y
 * ajoutant deux genres de valeur :
 * - un ENSEMBLE FINI de solutions (champ libre, valeurs séparées par « ; », aperçu `S = \{…\}`) ;
 * - un INTERVALLE (CE, solution d'inéquation), construit avec `EnsembleReelGuideBuilder`, le même
 *   outil que 6gen14/6gen15 (bornes exactes : e^2, 7/2…).
 * Champs libres jamais filtrés (règle CLAUDE.md), 3 tentatives ; une saisie illisible ou une valeur
 * approchée ne consomme aucune tentative. Aucun point affiché.
 */

export interface ValeurDemandee {
  libelle: FragmentConsigne[];
  valeur: ValeurLog;
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
  onValider: (reponses: ReponseChampLog[]) => void;
  validation?: ValidationEtapeProps | null;
}

/** Saisie libre → LaTeX pour l'aperçu (« √3 » lu comme « rac(3) ») ; `null` si illisible. */
function versLatex(texte: string): string | null {
  const s = texte.trim().replace(/(\d),(\d)/g, "$1.$2").replace(/√\s*(\d+)/g, "rac($1)").replace(/√\(/g, "rac(");
  if (s === "") return null;
  try {
    return expressionLibreVersLatex(s).replace(/(\d)\.(\d)/g, "$1{,}$2");
  } catch {
    return null;
  }
}

/** Aperçu d'un ensemble fini saisi : `S = \{a;b\}` (un élément illisible s'affiche « ? »). */
export function apercuEnsembleLatex(texte: string): string | null {
  let s = texte.trim().replace(/^S\s*=\s*/i, "").trim();
  if (s === "") return null;
  if (/^(∅|vide|\{\s*\})$/i.test(s)) return "S = \\varnothing";
  s = s.replace(/^\{/, "").replace(/\}$/, "");
  const elements = s
    .split(/;|\bou\b/i)
    .map((m) => m.trim().replace(/^x\s*=\s*/i, "").trim())
    .filter((m) => m !== "")
    .map((m) => versLatex(m) ?? "?");
  if (elements.length === 0) return null;
  return `S = \\left\\{${elements.join(";")}\\right\\}`;
}

export function EtapeCorrectionDetectiveLogarithmes({ consigne, valeurs, aideSaisie, tentativesUtilisees, tentativesMax, statuts, nonComptee, onValider, validation, ...aides }: Props) {
  const [reponses, setReponses] = useState<ReponseChampLog[]>(() => valeurs.map(({ valeur }) => (valeur.genre === "intervalle" ? null : "")));
  const fige = !!validation;
  const complet = reponses.every((r) => r !== null && (typeof r !== "string" || r.trim() !== ""));
  const faux = statuts ? valeurs.map((v, i) => ({ v, i })).filter(({ i }) => statuts[i] !== "correct") : [];

  function maj(i: number, r: ReponseChampLog) {
    setReponses((avant) => avant.map((x, j) => (j === i ? r : x)));
  }

  function champ(i: number, v: ValeurLog): ReactNode {
    const erronee = !fige && statuts !== null && statuts[i] !== "correct";
    if (v.genre === "intervalle") {
      return (
        <div style={{ minWidth: 0 }}>
          <EnsembleReelGuideBuilder label={v.quantite} onChange={(ens) => maj(i, ens)} disabled={fige} erronee={erronee} parseurNombre={evaluerValeurExponentielle} />
        </div>
      );
    }
    const texte = (reponses[i] as string | null) ?? "";
    const avant = v.genre === "nombre" ? <Katex expression={v.quantite} /> : v.genre === "fonction" ? <Katex expression={`${v.quantite} =`} /> : <Katex expression="S =" />;
    const apercuEnsemble = v.genre === "ensemble" ? apercuEnsembleLatex(texte) : null;
    return (
      <div style={{ display: "grid", gap: 6 }}>
        {v.genre === "ensemble" ? (
          apercuEnsemble && (
            <div className="contenu-conditionnel" style={{ marginBottom: 4, overflowX: "auto" }}>
              <Katex expression={apercuEnsemble} />
            </div>
          )
        ) : (
          <ApercuExpressionLatex texte={texte.replace(/√\s*(\d+)/g, "rac($1)").replace(/√\(/g, "rac(")} />
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ whiteSpace: "nowrap" }}>{avant}</span>
          <input
            id={`detective-logarithmes-${i}`}
            aria-label={`Valeur ${i + 1}`}
            className={`text-input${erronee ? " is-erronee" : ""}`}
            style={{ flex: "1 1 8em", minWidth: 0 }}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={texte}
            disabled={fige}
            onChange={(ev) => maj(i, normaliserSigneMoins(ev.target.value))}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 16, margin: "12px 0" }}>
        {valeurs.map(({ libelle, valeur }, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 6, minWidth: 0 }}>
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
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(reponses)}>
            Valider
          </button>
          {nonComptee === "parse_error" && (
            <p className="alert-error" role="alert">
              Une valeur n'est pas lisible : vérifie l'écriture (parenthèses, x, e, ln, « ; » entre les solutions). Aucune tentative n'est comptée.
            </p>
          )}
          {nonComptee === "approchee" && (
            <p className="alert-error" role="alert">
              C'est une valeur approchée : donne la valeur exacte (fraction, e, ln). Aucune tentative n'est comptée.
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
