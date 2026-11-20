import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { BlocAides } from "../../4e/components/EtapesDetectiveErreurs";
import { RenduFragments } from "../../4e/components/RenduFragments";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { DiagnosticSaisie } from "../moteur5e/saisieTrig";

/**
 * Écrans communs de 5gen50–5gen53 :
 * - `EtapeChampsTrig5e` : un ou plusieurs champs libres (jamais filtrés, règle CLAUDE.md : seule
 *   `normaliserSigneMoins` pendant la frappe, ni `inputMode` ni `type="number"`), 3 tentatives ; des
 *   boutons « π », « √ » AJOUTENT un caractère au champ actif, « n'existe pas » le REMPLIT — ils ne
 *   restreignent jamais ce qu'on tape. Une saisie illisible, approchée (valeur exacte demandée) ou
 *   « juste mais pas sous la forme demandée » n'est pas transmise : message, aucune tentative comptée.
 * - `EtapeChoixTrig5e` : choix fermé, UNE tentative.
 * Aides à deux niveaux (`BlocAides`), messages ciblés en KaTeX, aucun point affiché.
 */

type Fragments = FragmentConsigne[];

export type { DiagnosticSaisie };

export interface ChampTrig {
  /** LaTeX devant le champ (« \cos\theta = »). */
  prefixe?: string;
  /** Texte après le champ (unité). */
  suffixe?: string;
  /** Nom accessible du champ. */
  nom: string;
}

export interface RaccourciTrig {
  libelle: string;
  /** `ajoute` : insère le texte à la fin du champ actif ; `remplit` : remplace son contenu. */
  mode: "ajoute" | "remplit";
  texte: string;
}

interface PropsChamps {
  consigne: Fragments;
  champs: ChampTrig[];
  raccourcis?: RaccourciTrig[];
  aideSaisie: string;
  aides: Fragments[];
  niveauAide: number;
  onActiverAide: () => void;
  tentativesUtilisees: number;
  tentativesMax: number;
  diagnostiquer: (valeurs: string[]) => DiagnosticSaisie;
  onValider: (correct: boolean, valeurs: string[]) => void;
  validation: ValidationEtapeProps | null;
  /** Identifiant DOM du premier champ (tests). */
  idChamp: string;
  /** Contenu affiché sous la consigne (graphique…). */
  avantChamps?: ReactNode;
}

const MESSAGE_ILLISIBLE = "Écriture non reconnue : écris un nombre exact, par exemple 5π/6, −√3/2 ou 1/2. Cette saisie ne compte pas comme une tentative.";
const MESSAGE_APPROCHEE = "C'est une valeur approchée : donne la valeur exacte (avec π, une fraction ou une racine). Cette saisie ne compte pas comme une tentative.";

function apercuUtile(texte: string): boolean {
  const s = texte.replace(/^[^=≈]*[=≈]/, "");
  return /[π√/]|pi|sqrt/i.test(s) && !/[a-oq-zA-OQ-Z]/.test(s.replace(/pi|sqrt/gi, ""));
}

export function EtapeChampsTrig5e(p: PropsChamps) {
  const [valeurs, setValeurs] = useState<string[]>(() => p.champs.map(() => ""));
  const [actif, setActif] = useState(0);
  const [retour, setRetour] = useState<DiagnosticSaisie | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const fige = !!p.validation;
  const complet = valeurs.every((v) => v.trim() !== "");
  const champsFaux = retour?.statut === "faux" ? (retour.champsFaux ?? valeurs.map((_, i) => i)) : [];

  function changer(i: number, v: string) {
    setValeurs((s) => s.map((x, j) => (j === i ? normaliserSigneMoins(v) : x)));
  }

  function raccourci(r: RaccourciTrig) {
    setValeurs((s) => s.map((x, j) => (j === actif ? (r.mode === "remplit" ? r.texte : x + r.texte) : x)));
    refs.current[actif]?.focus();
  }

  function valider() {
    if (!complet || fige) return;
    const d = p.diagnostiquer(valeurs);
    setRetour(d);
    if (d.statut === "correct" || d.statut === "faux") p.onValider(d.statut === "correct", valeurs);
  }

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={p.consigne} />
      </p>
      {p.avantChamps}
      <div style={{ display: "grid", gap: 12, margin: "12px 0", minWidth: 0 }}>
        {p.champs.map((c, i) => (
          <div key={i} style={{ display: "grid", gap: 4, minWidth: 0 }}>
            {apercuUtile(valeurs[i] ?? "") && <ApercuExpressionLatex texte={valeurs[i]!.replace(/^[^=≈]*[=≈]/, "")} />}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
              {c.prefixe && (
                <span style={{ whiteSpace: "nowrap" }}>
                  <Katex expression={c.prefixe} />
                </span>
              )}
              <input
                id={i === 0 ? p.idChamp : `${p.idChamp}-${i}`}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                aria-label={c.nom}
                className={`text-input${!fige && champsFaux.includes(i) ? " is-erronee" : ""}`}
                style={{ flex: "1 1 8em", minWidth: 0 }}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={valeurs[i]}
                disabled={fige}
                onFocus={() => setActif(i)}
                onChange={(ev) => changer(i, ev.target.value)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter") valider();
                }}
              />
              {c.suffixe && <span style={{ whiteSpace: "nowrap" }}>{c.suffixe}</span>}
            </div>
          </div>
        ))}
        {p.raccourcis && p.raccourcis.length > 0 && !fige && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="group" aria-label="Raccourcis de saisie">
            {p.raccourcis.map((r) => (
              <button key={r.libelle} type="button" className="btn" style={{ minHeight: 44, minWidth: 44 }} onMouseDown={(ev) => ev.preventDefault()} onClick={() => raccourci(r)}>
                {r.libelle}
              </button>
            ))}
          </div>
        )}
      </div>
      {!p.validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {p.aideSaisie}
          </p>
          <BlocAides aides={p.aides} niveauAide={p.niveauAide} onActiverAide={p.onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          <RetourChamps retour={retour} tentativesUtilisees={p.tentativesUtilisees} tentativesMax={p.tentativesMax} />
        </>
      )}
      {p.validation && <ValidationEcran {...p.validation} />}
    </div>
  );
}

function RetourChamps({ retour, tentativesUtilisees, tentativesMax }: { retour: DiagnosticSaisie | null; tentativesUtilisees: number; tentativesMax: number }) {
  if (!retour || retour.statut === "correct") return null;
  if (retour.statut === "illisible")
    return (
      <p className="alert-error" role="alert">
        {retour.message ?? MESSAGE_ILLISIBLE}
      </p>
    );
  if (retour.statut === "approchee")
    return (
      <p className="alert-error" role="alert">
        {retour.message ?? MESSAGE_APPROCHEE}
      </p>
    );
  if (retour.statut === "nonCompte")
    return (
      <p className="alert-error" role="alert">
        <span>
          <RenduFragments fragments={retour.message} /> Cette saisie ne compte pas comme une tentative.
        </span>
      </p>
    );
  if (tentativesUtilisees === 0) return null;
  return (
    <p className="alert-error" role="alert">
      {/* Un seul enfant : `.alert-error` est un conteneur flex. */}
      <span>
        {retour.message && retour.message.length > 0 && (
          <>
            <RenduFragments fragments={retour.message} />{" "}
          </>
        )}
        {`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}
      </span>
    </p>
  );
}

// ---------------------------------------------------------------------------------------------
// Choix fermé (une tentative)
// ---------------------------------------------------------------------------------------------

export interface OptionChoixTrig {
  id: string;
  fragments: Fragments;
}

interface PropsChoix {
  consigne: Fragments;
  options: OptionChoixTrig[];
  /** Largeur minimale d'une option (px) : grille qui passe à une colonne sur téléphone. */
  largeurOption?: number;
  attendue: string;
  aides: Fragments[];
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (id: string) => void;
  validation: ValidationEtapeProps | null;
  libelleGroupe: string;
  avantOptions?: ReactNode;
}

export function EtapeChoixTrig5e(p: PropsChoix) {
  const [choix, setChoix] = useState<string | null>(null);
  const fige = !!p.validation;
  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={p.consigne} />
      </p>
      {p.avantOptions}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${p.largeurOption ?? 220}px, 1fr))`, gap: 10, margin: "12px 0" }} role="group" aria-label={p.libelleGroupe}>
        {p.options.map((o) => {
          const choisi = choix === o.id;
          const faux = fige && choisi && o.id !== p.attendue;
          return (
            <button
              key={o.id}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={{ textAlign: "left", justifyContent: "flex-start", whiteSpace: "normal", lineHeight: 1.5, padding: "10px 14px", minHeight: 44, height: "auto" }}
              onClick={() => setChoix(o.id)}
            >
              <span style={{ minWidth: 0, overflowX: "auto" }}>
                <RenduFragments fragments={o.fragments} />
              </span>
            </button>
          );
        })}
      </div>
      {!p.validation && (
        <>
          <BlocAides aides={p.aides} niveauAide={p.niveauAide} onActiverAide={p.onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && p.onValider(choix)}>
            Valider
          </button>
        </>
      )}
      {p.validation && <ValidationEcran {...p.validation} />}
    </div>
  );
}
