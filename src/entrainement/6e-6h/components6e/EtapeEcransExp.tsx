import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideEcran, Frag, LigneIntervalle, ModeEcran, TableauDonnees } from "../ui6e/ecransExp.types";
import { decoderLigne, encoderLigne } from "../ui6e/ecransExp.types";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

/** Espaces insécables avant « ? ! : ; » et après « « » : le signe ne passe jamais seul à la ligne. */
function espacesInsecables(texte: string): string {
  return texte.replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ");
}

/** Rendu de fragments texte / KaTeX en ligne, sans conteneur. */
export function Fragments({ fragments }: { fragments: Frag[] }) {
  return <>{fragments.map((f, i) => (f.type === "texte" ? <span key={i}>{espacesInsecables(f.valeur)}</span> : <Katex key={i} expression={f.valeur} />))}</>;
}

/** Figure SVG (chaîne) adaptée à la largeur du conteneur. */
export function FigureSvg({ svg, largeurMax = 360 }: { svg: string; largeurMax?: number }) {
  const adapte = svg.replace(/<svg ([^>]*?)width="([\d.]+)" height="([\d.]+)"/, '<svg $1style="width:100%;height:auto;display:block"');
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
      <div style={{ width: "100%", maxWidth: largeurMax }} dangerouslySetInnerHTML={{ __html: adapte }} />
    </div>
  );
}

export function TableauDonneesVue({ tableau }: { tableau: TableauDonnees }) {
  if (tableau.horizontal) {
    return (
      <div className="summary-table-scroll" style={{ margin: "8px 0" }}>
        <table className="summary-table">
          <tbody>
            {tableau.entetes.map((ent, i) => (
              <tr key={i}>
                <th style={{ textTransform: "none", whiteSpace: "nowrap" }}>
                  <Fragments fragments={ent} />
                </th>
                {tableau.lignes.map((l, j) => (
                  <td key={j} style={{ whiteSpace: "nowrap" }}>
                    {l[i]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="summary-table-scroll" style={{ margin: "8px 0" }}>
      <table className="summary-table">
        <thead>
          <tr>
            {tableau.entetes.map((ent, i) => (
              <th key={i} style={{ textTransform: "none" }}>
                <Fragments fragments={ent} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableau.lignes.map((l, j) => (
            <tr key={j}>
              {l.map((c, i) => (
                <td key={i}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Props {
  consigneGenerale: Frag[];
  blocDonnees: ReactNode;
  consigneEcran: Frag[];
  mode: ModeEcran;
  aide1: AideEcran;
  aide2: AideEcran | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification[];
  piege: (valeurs: string[]) => Frag[] | null;
  messageIllisible: string;
  /** Valeur lisible mais approchée alors que la forme exacte est demandée (message) : aucune tentative. */
  approchee?: (valeurs: string[]) => string | null;
  validation?: ValidationEtapeProps | null;
}

const LIGNE_VIDE: LigneIntervalle = { ouvrant: "[", gauche: "", droite: "", fermant: "]" };

function valeursInitiales(mode: ModeEcran): string[] {
  if (mode.type === "champs") return Array.from({ length: mode.champs.length + (mode.symboles ? 1 : 0) }, () => "");
  if (mode.type === "intervalles") return [encoderLigne(LIGNE_VIDE)];
  return [""];
}

function BlocAide({ aide }: { aide: AideEcran }) {
  return (
    <>
      <p>
        <Fragments fragments={aide.texte} />
      </p>
      {aide.latex && <Katex expression={aide.latex} block />}
    </>
  );
}

/**
 * Écran partagé des générateurs 6gen144–6gen147 (copie adaptée du socle 5e) : énoncé (consigne générale, figure, tableau) →
 * consigne de l'écran → champs / choix fermé / intervalles → aide à deux niveaux → « Valider ».
 * Saisie jamais filtrée (pas d'`inputMode`, pas de `type="number"`), seule transformation :
 * `normaliserSigneMoins`. Saisie illisible (`parse_error`) : message de lecture, AUCUNE tentative
 * consommée ; valeur approchée quand la forme exacte est demandée : message, aucune tentative non
 * plus. Choix fermé : une seule tentative. L'appli change la `key` à chaque écran.
 */
export function EtapeEcransExp({
  consigneGenerale,
  blocDonnees,
  consigneEcran,
  mode,
  aide1,
  aide2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  piege,
  messageIllisible,
  approchee,
  validation,
}: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => valeursInitiales(mode));
  const [statutsSoumis, setStatutsSoumis] = useState<StatutVerification[] | null>(null);
  const [messagePiege, setMessagePiege] = useState<Frag[] | null>(null);
  const [erreurLecture, setErreurLecture] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0 && statutsSoumis !== null;
  const gele = !!validation;
  const decalage = mode.type === "champs" && mode.symboles ? 1 : 0;

  const toutRempli =
    mode.type === "intervalles"
      ? valeurs.every((v) => {
          const l = decoderLigne(v);
          return l.gauche.trim() !== "" && l.droite.trim() !== "";
        })
      : valeurs.every((v) => v.trim() !== "");

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? normaliserSigneMoins(valeur) : v)));
    setErreurLecture(null);
  }

  function changerLigne(index: number, modif: Partial<LigneIntervalle>) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? encoderLigne({ ...decoderLigne(v), ...modif }) : v)));
    setErreurLecture(null);
  }

  function valider() {
    if (!toutRempli || gele) return;
    const statuts = diagnostiquer(valeurs);
    if (statuts.includes("parse_error")) {
      setErreurLecture(messageIllisible);
      return;
    }
    const approx = approchee ? approchee(valeurs) : null;
    if (approx) {
      setErreurLecture(approx);
      return;
    }
    setErreurLecture(null);
    setStatutsSoumis(statuts);
    setMessagePiege(statuts.every((s) => s === "correct") ? null : piege(valeurs));
    onValider(valeurs);
  }

  function faux(i: number): boolean {
    return montrerErreurs && statutsSoumis !== null && (statutsSoumis[i] ?? statutsSoumis[0]) !== "correct";
  }

  function saisie(i: number, label: string, placeholder: string, style?: CSSProperties) {
    return (
      <input
        type="text"
        aria-label={label}
        className={`text-input ${faux(i) ? "is-erronee" : ""}`}
        style={style}
        value={valeurs[i]}
        placeholder={placeholder}
        disabled={gele}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(e) => changer(i, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") valider();
        }}
      />
    );
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={<Fragments fragments={consigneGenerale} />} blocDonnees={blocDonnees} />
      <p className="prompt-text">
        <Fragments fragments={consigneEcran} />
      </p>

      {mode.type === "champs" && (
        <div>
          {mode.symboles && (
            <div className="field">
              <span className="field-label field-label-minuscule">{mode.symboles.label}</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label={mode.symboles.label}>
                {mode.symboles.options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={valeurs[0] === o.id}
                    className={`btn ${valeurs[0] === o.id ? "toggle-active" : ""} ${montrerErreurs && valeurs[0] === o.id && faux(0) ? "is-erronee" : ""}`}
                    style={{ minWidth: 48, minHeight: 44 }}
                    disabled={gele}
                    onClick={() => changer(0, o.id)}
                  >
                    <Katex expression={o.latex} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {mode.champs.map((champ, k) => (
            <div className="field" key={k}>
              <label className="field-label field-label-minuscule">
                {champ.labelLatex ? <Katex expression={champ.labelLatex} /> : champ.label}
                {champ.unite && <span> (en {champ.unite})</span>}
              </label>
              {saisie(k + decalage, champ.label, champ.placeholder)}
            </div>
          ))}
        </div>
      )}

      {mode.type === "choix" && (
        <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr" }}>
          {mode.options.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={valeurs[0] === option.id}
              className={`btn ${valeurs[0] === option.id ? "toggle-active" : ""} ${montrerErreurs && valeurs[0] === option.id && faux(0) ? "is-erronee" : ""}`}
              disabled={gele}
              onClick={() => changer(0, option.id)}
              style={{ whiteSpace: "normal", maxWidth: "100%", textAlign: "left", minHeight: 44 }}
            >
              <span>
                <Fragments fragments={option.fragments} />
              </span>
            </button>
          ))}
        </div>
      )}

      {mode.type === "intervalles" && (
        <div>
          {valeurs.map((v, i) => {
            const l = decoderLigne(v);
            const crochet = (cote: "ouvrant" | "fermant") => (
              <button
                type="button"
                className="btn"
                disabled={gele}
                aria-label={`${cote === "ouvrant" ? "Crochet gauche" : "Crochet droit"} de l'intervalle ${i + 1} : ${l[cote] === "[" ? "[" : "]"} (touche pour changer)`}
                style={{ minWidth: 40, minHeight: 44, padding: "0 8px", fontSize: "1.25rem", fontFamily: "serif" }}
                onClick={() => changerLigne(i, { [cote]: l[cote] === "[" ? "]" : "[" })}
              >
                {l[cote]}
              </button>
            );
            const champ = (cote: "gauche" | "droite") => (
              <input
                type="text"
                aria-label={`Borne ${cote} de l'intervalle ${i + 1}`}
                className={`text-input ${faux(0) ? "is-erronee" : ""}`}
                style={{ flex: "1 1 0", minWidth: 0, margin: 0 }}
                value={l[cote]}
                placeholder={mode.placeholders ? mode.placeholders[cote === "gauche" ? 0 : 1] : cote === "gauche" ? "ex. : −∞" : "ex. : 3/2"}
                disabled={gele}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => changerLigne(i, { [cote]: normaliserSigneMoins(e.target.value) })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") valider();
                }}
              />
            );
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, margin: "6px 0", maxWidth: "100%" }}>
                {i > 0 && <span style={{ fontFamily: "serif", fontSize: "1.1rem", width: 16, textAlign: "center" }}>∪</span>}
                {i === 0 && <span style={{ width: 16 }} />}
                {crochet("ouvrant")}
                {champ("gauche")}
                <span style={{ fontWeight: 600 }}>;</span>
                {champ("droite")}
                {crochet("fermant")}
              </div>
            );
          })}
          {!gele && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "6px 0 10px" }}>
              <button type="button" className="btn" style={{ minHeight: 44 }} onClick={() => setValeurs((p) => [...p, encoderLigne(LIGNE_VIDE)])}>
                + Ajouter un intervalle
              </button>
              {valeurs.length > 1 && (
                <button type="button" className="btn" style={{ minHeight: 44 }} onClick={() => setValeurs((p) => p.slice(0, -1))}>
                  − Retirer le dernier
                </button>
              )}
            </div>
          )}
          <p style={{ fontSize: "0.85rem", color: "var(--muted, #666)", margin: "2px 0 8px" }}>Touche un crochet pour le retourner. Un intervalle par ligne, de gauche à droite.</p>
        </div>
      )}

      {niveauAide >= 1 && (
        <div className="aide-5e">
          <BlocAide aide={aide1} />
          {niveauAide >= 2 && aide2 && <BlocAide aide={aide2} />}
        </div>
      )}

      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              {erreurLecture}
            </p>
          )}
          {!erreurLecture && montrerErreurs && (
            <p className="alert-error" role="alert">
              <span>
                {formatMessageErreur(tentativesUtilisees, tentativesMax, "not_equivalent")}
                {messagePiege && (
                  <>
                    {" "}
                    <Fragments fragments={messagePiege} />
                  </>
                )}
              </span>
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
