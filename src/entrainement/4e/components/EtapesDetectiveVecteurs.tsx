import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ValeurLigne } from "../core/detectiveVecteurs.types";
import type { SaisieCorrection, StatutChamp } from "../moteur/verificationDetectiveVecteurs";
import { BlocAides, type PropsAides } from "./EtapesDetectiveErreurs";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écran 3 de gen91 (« Le détective d'erreurs vectoriel ») : corriger la ligne fausse puis la
 * conclusion. La copie, l'écran 1 (ligne fausse) et l'écran 2 (description de l'erreur) sont ceux
 * de gen81 (`EtapesDetectiveErreurs.tsx`), réutilisés tels quels.
 *
 * Une valeur se saisit selon son genre : un nombre (un champ), un vecteur (deux composantes en
 * colonne, comme dans le cours), un point (deux coordonnées), un verdict (choix fermé : jugé à la
 * première validation puis figé). Champs libres jamais filtrés (règle CLAUDE.md), 3 tentatives ;
 * une saisie illisible ne consomme aucune tentative. Aucun point affiché.
 */

export interface ValeurDemandee {
  libelle: FragmentConsigne[];
  valeur: ValeurLigne;
  /** Message quand cette valeur est fausse (« La ligne 2 corrigée est à revoir. »). */
  aRevoir: string;
}

interface PropsCorrection extends PropsAides {
  consigne: ReactNode;
  valeurs: ValeurDemandee[];
  aideSaisie: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Statuts de la dernière tentative, `null` avant la première. */
  statuts: StatutChamp[] | null;
  /** Une saisie illisible à la dernière soumission (aucune tentative comptée). */
  erreurLecture: boolean;
  /** Verdict déjà jugé juste à une tentative précédente : il reste figé. */
  verdictFige: boolean;
  onValider: (saisie: SaisieCorrection) => void;
  validation?: ValidationEtapeProps | null;
}

const styleChamp: CSSProperties = { width: "5.5em", minWidth: 0, textAlign: "center" };

function Champ({ id, valeur, erronee, fige, onChange, label }: { id: string; valeur: string; erronee: boolean; fige: boolean; onChange: (v: string) => void; label: string }) {
  return (
    <input
      id={id}
      aria-label={label}
      className={`text-input${erronee ? " is-erronee" : ""}`}
      style={styleChamp}
      autoComplete="off"
      autoCapitalize="off"
      spellCheck={false}
      value={valeur}
      disabled={fige}
      onChange={(ev) => onChange(normaliserSigneMoins(ev.target.value))}
    />
  );
}

/** Un texte saisi contient-il autre chose qu'un nombre (racine, fraction) ? → aperçu LaTeX. */
function meriteApercu(texte: string): boolean {
  return /[a-z√/]/i.test(texte);
}

export function EtapeCorrectionVecteurs({
  consigne,
  valeurs,
  aideSaisie,
  tentativesUtilisees,
  tentativesMax,
  statuts,
  erreurLecture,
  verdictFige,
  onValider,
  validation,
  ...aides
}: PropsCorrection) {
  const [textes, setTextes] = useState<string[][]>(() => valeurs.map((v) => (v.valeur.genre === "nombre" ? [""] : v.valeur.genre === "verdict" ? [] : ["", ""])));
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const fige = !!validation;
  const avecVerdict = valeurs.some((v) => v.valeur.genre === "verdict");
  const complet = textes.every((liste) => liste.every((s) => s.trim() !== "")) && (!avecVerdict || verdict !== null);
  const faux = statuts ? valeurs.map((v, i) => ({ v, i })).filter(({ i }) => statuts[i] !== "correct") : [];

  function changer(i: number, j: number, v: string) {
    setTextes((avant) => avant.map((liste, a) => (a === i ? liste.map((x, b) => (b === j ? v : x)) : liste)));
  }

  function saisie(i: number, v: ValeurLigne): ReactNode {
    const erronee = !fige && statuts !== null && statuts[i] !== "correct";
    const id = `detective-vect-${i}`;
    if (v.genre === "verdict") {
      const bloque = fige || verdictFige;
      return (
        <div style={{ display: "grid", gap: 8 }} role="group" aria-label="Conclusion">
          {[true, false].map((choix) => {
            const choisi = verdict === choix;
            return (
              <button
                key={String(choix)}
                type="button"
                disabled={bloque}
                aria-pressed={choisi}
                className={`btn${choisi ? " toggle-active" : ""}${fige && choisi && statuts?.[i] === "faux" ? " is-erronee" : ""}`}
                style={{ textAlign: "left", justifyContent: "flex-start", whiteSpace: "normal", minHeight: 44, height: "auto", padding: "10px 14px" }}
                onClick={() => setVerdict(choix)}
              >
                {choix ? v.libelleVrai : v.libelleFaux}
              </button>
            );
          })}
        </div>
      );
    }
    if (v.genre === "nombre") {
      const texte = textes[i]![0]!;
      return (
        <div style={{ display: "grid", gap: 6 }}>
          {meriteApercu(texte) && <ApercuExpressionLatex texte={texte.replace(/√\s*(\d+)/g, "rac($1)").replace(/√\(/g, "rac(")} />}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {v.quantite && <Katex expression={`${v.quantite} =`} />}
            <Champ id={id} label="Valeur corrigée" valeur={texte} erronee={erronee} fige={fige} onChange={(x) => changer(i, 0, x)} />
          </div>
        </div>
      );
    }
    if (v.genre === "vecteur") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Katex expression={`${v.quantite} =`} />
          <div style={{ display: "grid", gap: 6, padding: "4px 8px", borderLeft: "2px solid var(--color-text)", borderRight: "2px solid var(--color-text)", borderRadius: 12 }}>
            <Champ id={`${id}-x`} label="Première composante" valeur={textes[i]![0]!} erronee={erronee} fige={fige} onChange={(x) => changer(i, 0, x)} />
            <Champ id={`${id}-y`} label="Seconde composante" valeur={textes[i]![1]!} erronee={erronee} fige={fige} onChange={(x) => changer(i, 1, x)} />
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Katex expression={`${v.nom}\\big(`} />
        <Champ id={`${id}-x`} label="Abscisse" valeur={textes[i]![0]!} erronee={erronee} fige={fige} onChange={(x) => changer(i, 0, x)} />
        <Katex expression=";" />
        <Champ id={`${id}-y`} label="Ordonnée" valeur={textes[i]![1]!} erronee={erronee} fige={fige} onChange={(x) => changer(i, 1, x)} />
        <Katex expression="\big)" />
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
            {saisie(i, valeur)}
          </div>
        ))}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {aideSaisie}
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider({ textes, verdict: avecVerdict ? verdict : null })}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Une valeur n'est pas lisible : écris un nombre exact. Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
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
