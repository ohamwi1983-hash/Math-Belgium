import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { Axe } from "../core/transformationsEnsembles.types";
import { BoutonAide } from "./BoutonAide";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { SAISIE_VIDE, saisieComplete, type SaisieIntervalle, type StatutIntervalle } from "../moteur/verificationTransformationsEnsembles";

/**
 * Écrans de gen72 (« Domaine et ensemble image après transformations ») : classement des
 * transformations (choix fermé, UNE tentative) et chaîne d'intervalles (crochets à choisir, bornes
 * en champs libres — jamais de blocage de frappe, règle CLAUDE.md —, boutons −∞ / +∞). Aucun point.
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
            <RenduFragments fragments={aide} />
          </p>
        </div>
      ))}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 1 — classement
// ---------------------------------------------------------------------------------------------

interface PropsClassement extends PropsAides {
  consigne: ReactNode;
  transformations: FragmentConsigne[][];
  /** Axe correct de chaque transformation : sert seulement à marquer les erreurs une fois l'écran clos. */
  attendu: Axe[];
  onValider: (choix: Axe[]) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeClassementTransformations({ consigne, transformations, attendu, onValider, validation, ...aides }: PropsClassement) {
  const [choix, setChoix] = useState<(Axe | null)[]>(() => transformations.map(() => null));
  const fige = !!validation;
  const complet = choix.every((c) => c !== null);
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 12, margin: "12px 0" }}>
        {transformations.map((t, i) => (
          <div key={i} style={{ display: "grid", gap: 6 }}>
            <p style={{ margin: 0 }}>
              <RenduFragments fragments={t} />
            </p>
            <div className="options-grid" style={{ margin: 0 }}>
              {(["H", "V"] as const).map((axe) => {
                const choisi = choix[i] === axe;
                const faux = fige && choisi && attendu[i] !== axe;
                return (
                  <button
                    key={axe}
                    type="button"
                    disabled={fige}
                    aria-pressed={choisi}
                    className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
                    onClick={() => setChoix((c) => c.map((x, j) => (j === i ? axe : x)))}
                  >
                    {axe === "H" ? "Modifie le domaine" : "Modifie l'ensemble image"}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(choix as Axe[])}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écrans 2 et 3 — chaîne d'intervalles
// ---------------------------------------------------------------------------------------------

type Cote = "gauche" | "droite";

function BoutonCrochet({ valeur, cote, onChange, disabled, label }: { valeur: "[" | "]" | null; cote: Cote; onChange: (v: "[" | "]") => void; disabled: boolean; label: string }) {
  // Premier clic : crochet fermé (« [ » à gauche, « ] » à droite), puis alternance.
  const suivant = (): "[" | "]" => {
    if (valeur === null) return cote === "gauche" ? "[" : "]";
    return valeur === "[" ? "]" : "[";
  };
  return (
    <button
      type="button"
      className="btn"
      disabled={disabled}
      aria-label={`${label} : ${valeur === null ? "à choisir" : valeur === (cote === "gauche" ? "[" : "]") ? "fermé" : "ouvert"} (touche pour changer)`}
      style={{ minWidth: 44, minHeight: 44, padding: "0 10px", fontSize: "1.35em", fontFamily: "KaTeX_Main, 'Times New Roman', serif", color: valeur === null ? "var(--color-text-muted)" : undefined }}
      onClick={() => onChange(suivant())}
    >
      {valeur ?? "?"}
    </button>
  );
}

interface PropsChaine extends PropsAides {
  consigne: ReactNode;
  libelles: FragmentConsigne[][];
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Statuts de la dernière tentative (une entrée par ligne), `null` avant la première. */
  statuts: StatutIntervalle[] | null;
  /** Une borne illisible à la dernière soumission (aucune tentative comptée). */
  erreurLecture: boolean;
  onValider: (saisies: SaisieIntervalle[]) => void;
  validation?: ValidationEtapeProps | null;
  axe: Axe;
}

function messageStatut(statut: StatutIntervalle): string {
  if (statut === "crochets") return "bornes justes, mais crochets à revoir";
  if (statut === "bornes") return "bornes à revoir";
  return "borne illisible";
}

export function EtapeChaineIntervalles({ consigne, libelles, tentativesUtilisees, tentativesMax, statuts, erreurLecture, onValider, validation, axe, ...aides }: PropsChaine) {
  const [saisies, setSaisies] = useState<SaisieIntervalle[]>(() => libelles.map(() => ({ ...SAISIE_VIDE })));
  const dernierChamp = useRef<{ ligne: number; cote: Cote } | null>(null);
  const [champActif, setChampActif] = useState(false);
  const fige = !!validation;
  const complet = saisies.every(saisieComplete);

  function modifier(ligne: number, champ: Partial<SaisieIntervalle>) {
    setSaisies((s) => s.map((x, j) => (j === ligne ? { ...x, ...champ } : x)));
  }

  function inserer(valeur: string) {
    const cible = dernierChamp.current;
    if (!cible) return;
    modifier(cible.ligne, { [cible.cote]: valeur });
    document.getElementById(`te-${axe}-${cible.ligne}-${cible.cote}`)?.focus();
  }

  const lignesFausses = statuts ? statuts.map((s, i) => ({ s, i })).filter(({ s }) => s !== "correct") : [];

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 14, margin: "12px 0" }}>
        {libelles.map((libelle, i) => {
          const erronee = !fige && statuts !== null && statuts[i] !== "correct";
          const classe = `text-input${erronee ? " is-erronee" : ""}`;
          return (
            <div key={i} style={{ display: "grid", gap: 6 }}>
              <span className="field-label field-label-minuscule">
                <RenduFragments fragments={libelle} />
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
                <BoutonCrochet label="Crochet de gauche" cote="gauche" valeur={saisies[i]!.crochetGauche} disabled={fige} onChange={(v) => modifier(i, { crochetGauche: v })} />
                {(["gauche", "droite"] as const).map((cote) => (
                  <span key={cote} style={{ display: "contents" }}>
                    {cote === "droite" && <span style={{ fontSize: "1.2em" }}>;</span>}
                    <input
                      id={`te-${axe}-${i}-${cote}`}
                      className={classe}
                      style={{ flex: 1, minWidth: 0, textAlign: "center" }}
                      aria-label={`Borne de ${cote}`}
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      value={saisies[i]![cote]}
                      disabled={fige}
                      onFocus={() => {
                        dernierChamp.current = { ligne: i, cote };
                        setChampActif(true);
                      }}
                      onChange={(ev) => modifier(i, { [cote]: normaliserSigneMoins(ev.target.value) })}
                    />
                  </span>
                ))}
                <BoutonCrochet label="Crochet de droite" cote="droite" valeur={saisies[i]!.crochetDroit} disabled={fige} onChange={(v) => modifier(i, { crochetDroit: v })} />
              </div>
            </div>
          );
        })}
      </div>
      {!validation && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: "0.9em", color: "var(--color-text-muted)" }}>Dans la borne choisie :</span>
            {["-∞", "+∞"].map((v) => (
              <button
                key={v}
                type="button"
                className="btn"
                disabled={!champActif}
                style={{ minHeight: 44, minWidth: 56 }}
                onPointerDown={(ev) => ev.preventDefault()}
                onClick={() => inserer(v)}
              >
                {v === "-∞" ? "−∞" : "+∞"}
              </button>
            ))}
          </div>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Touche un crochet pour le choisir ou le retourner. Une borne : un nombre, une fraction comme 5/2, ou ∞.
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisies)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Une borne n'est pas lisible : écris un nombre, une fraction ou ∞. Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              {/* Un seul enfant : l'alerte est en flex (icône + contenu), le texte et la liste s'empilent. */}
              <div>
              <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
              {libelles.length > 1 && lignesFausses.length > 0 && (
                <ul style={{ margin: "6px 0 0", paddingLeft: "1.2em" }}>
                  {lignesFausses.map(({ s, i }) => (
                    <li key={i}>{`Ligne ${i + 1} : ${messageStatut(s)}.`}</li>
                  ))}
                </ul>
              )}
              {libelles.length === 1 && lignesFausses[0] && <p style={{ margin: "6px 0 0" }}>{`${messageStatut(lignesFausses[0].s).replace(/^./, (c) => c.toUpperCase())}.`}</p>}
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
