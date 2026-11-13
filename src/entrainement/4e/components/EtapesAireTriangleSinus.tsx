import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { StatutChamp } from "../moteur/verificationAireTriangleSinus";

/**
 * Écrans de gen75 (« Aire d'un triangle quelconque ») : choix fermé (formule, nombre
 * d'amplitudes — UNE tentative) et champs numériques (une ou deux valeurs — 3 tentatives, saisie
 * libre jamais bloquée, règle CLAUDE.md ; bouton « √ » pour une valeur exacte). Aucun point.
 */

interface PropsAides {
  aides: FragmentConsigne[][];
  niveauAide: number;
  onActiverAide: () => void;
}

function BlocAides({ aides, niveauAide, onActiverAide }: PropsAides) {
  return (
    <div>
      {aides.slice(0, niveauAide).map((aide, i) => (
        <div key={i} className="triangle-quelconque-aide">
          <p>
            {/* Phrase, puis la formule sur sa propre ligne (lisible au téléphone). */}
            {aide.map((f, k) =>
              f.type === "texte" ? (
                <span key={k}>{f.valeur}</span>
              ) : (
                <span key={k} style={{ display: "block", marginTop: 4, overflowX: "auto" }}>
                  <Katex expression={f.valeur} />
                </span>
              ),
            )}
          </p>
        </div>
      ))}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Choix fermé
// ---------------------------------------------------------------------------------------------

interface PropsChoix<T extends string> extends PropsAides {
  consigne: ReactNode;
  options: { id: T; contenu: ReactNode }[];
  /** Option correcte : sert seulement à marquer l'erreur une fois l'écran clos. */
  attendu: T;
  onValider: (choix: T) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChoixAireTriangle<T extends string>({ consigne, options, attendu, onValider, validation, ...aides }: PropsChoix<T>) {
  const [choix, setChoix] = useState<T | null>(null);
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 8, margin: "12px 0" }}>
        {options.map((o) => {
          const choisi = choix === o.id;
          const faux = fige && choisi && o.id !== attendu;
          return (
            <button
              key={o.id}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={{ minHeight: 48, justifyContent: "center", overflowX: "auto", maxWidth: "100%" }}
              onClick={() => setChoix(o.id)}
            >
              {o.contenu}
            </button>
          );
        })}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
            Valider
          </button>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)" }}>
            Un seul essai pour cet écran.
          </p>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Champs numériques (un ou deux)
// ---------------------------------------------------------------------------------------------

interface PropsChamps extends PropsAides {
  consigne: ReactNode;
  /** Libellé et unité de chaque champ, en LaTeX. */
  champs: { libelle: string; suffixe: string }[];
  indication: string;
  boutonRacine: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Statuts de la dernière tentative (un par champ), `null` avant la première. */
  statuts: StatutChamp[] | null;
  /** Message ciblé sur l'erreur reconnue (jamais la valeur attendue). */
  messagePiege: string | null;
  erreurLecture: boolean;
  onValider: (saisies: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChampsAireTriangle({
  consigne,
  champs,
  indication,
  boutonRacine,
  tentativesUtilisees,
  tentativesMax,
  statuts,
  messagePiege,
  erreurLecture,
  onValider,
  validation,
  ...aides
}: PropsChamps) {
  const [saisies, setSaisies] = useState<string[]>(() => champs.map(() => ""));
  const dernier = useRef<number | null>(null);
  const [champActif, setChampActif] = useState(false);
  const fige = !!validation;
  const complet = saisies.every((s) => s.trim() !== "");

  function modifier(i: number, valeur: string) {
    setSaisies((s) => s.map((x, j) => (j === i ? valeur : x)));
  }

  function insererRacine() {
    const i = dernier.current;
    if (i === null) return;
    const champ = document.getElementById(`aire-triangle-champ-${i}`) as HTMLInputElement | null;
    const texte = saisies[i] ?? "";
    const debut = champ?.selectionStart ?? texte.length;
    const fin = champ?.selectionEnd ?? texte.length;
    modifier(i, texte.slice(0, debut) + "√" + texte.slice(fin));
    requestAnimationFrame(() => {
      champ?.focus();
      champ?.setSelectionRange(debut + 1, debut + 1);
    });
  }

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 12, margin: "12px 0" }}>
        {champs.map((c, i) => {
          const erronee = !fige && statuts !== null && statuts[i] !== "correct";
          return (
            <div key={i} className="field" style={{ margin: 0 }}>
              <label className="field-label field-label-minuscule" htmlFor={`aire-triangle-champ-${i}`}>
                <Katex expression={c.libelle} />
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  id={`aire-triangle-champ-${i}`}
                  className={`text-input${erronee ? " is-erronee" : ""}`}
                  style={{ flex: 1, minWidth: 0 }}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={saisies[i]}
                  disabled={fige}
                  onFocus={() => {
                    dernier.current = i;
                    setChampActif(true);
                  }}
                  onChange={(ev) => modifier(i, normaliserSigneMoins(ev.target.value))}
                />
                {c.suffixe && (
                  <span style={{ whiteSpace: "nowrap" }}>
                    <Katex expression={c.suffixe} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!validation && (
        <>
          {boutonRacine && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: "0.9em", color: "var(--color-text-muted)" }}>Dans le champ choisi :</span>
              <button type="button" className="btn" disabled={!champActif} style={{ minHeight: 44, minWidth: 56 }} onPointerDown={(ev) => ev.preventDefault()} onClick={insererRacine}>
                √
              </button>
            </div>
          )}
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {indication}
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisies)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Une valeur n'est pas lisible : écris un nombre (par exemple 12,5) ou une valeur exacte (par exemple 6√3). Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {messagePiege && <p style={{ margin: "6px 0 0" }}>{messagePiege}</p>}
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
