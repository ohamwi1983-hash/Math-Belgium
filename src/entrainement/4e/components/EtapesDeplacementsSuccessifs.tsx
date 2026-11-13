import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { SAISIE_VECTEUR_VIDE, saisieVecteurComplete, type SaisieVecteur, type StatutComposantes } from "../moteur/verificationDeplacementsSuccessifs";
import { messageComposantes } from "../ui/formatDeplacementsSuccessifs";

/**
 * Écrans de gen86 (« Carte au trésor et randonnée : déplacements successifs ») : composantes en
 * colonne (deux champs empilés entre parenthèses, comme dans le cours), un ou plusieurs vecteurs par
 * écran, ou un nombre (k, distance). Champs libres, jamais de blocage de frappe (règle CLAUDE.md) :
 * seule `normaliserSigneMoins` transforme la saisie. Aucun point affiché.
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

function AlerteTentative({ tentativesUtilisees, tentativesMax, details }: { tentativesUtilisees: number; tentativesMax: number; details: ReactNode }) {
  return (
    <div className="alert-error" role="alert">
      {/* Un seul enfant : l'alerte est en flex (icône + contenu), le texte et le détail s'empilent. */}
      <div>
        <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
        {details}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Saisie d'un vecteur en colonne
// ---------------------------------------------------------------------------------------------

interface PropsColonne {
  id: string;
  libelle: string;
  valeur: SaisieVecteur;
  onChange: (v: SaisieVecteur) => void;
  disabled: boolean;
  erronee: boolean;
}

export function SaisieColonne({ id, libelle, valeur, onChange, disabled, erronee }: PropsColonne) {
  const classe = `text-input${erronee ? " is-erronee" : ""}`;
  const champ = (axe: "x" | "y") => (
    <input
      id={`${id}-${axe}`}
      className={classe}
      style={{ width: "6.2em", textAlign: "center" }}
      aria-label={`Composante ${axe}`}
      autoComplete="off"
      autoCapitalize="off"
      spellCheck={false}
      value={valeur[axe]}
      disabled={disabled}
      onChange={(ev) => onChange({ ...valeur, [axe]: normaliserSigneMoins(ev.target.value) })}
    />
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <label htmlFor={`${id}-x`} className="field-label field-label-minuscule" style={{ margin: 0, fontSize: "1.15em" }}>
        <Katex expression={libelle} />
      </label>
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          gap: 6,
          padding: "4px 8px",
          borderLeft: "2px solid var(--color-text)",
          borderRight: "2px solid var(--color-text)",
          borderRadius: 14,
        }}
      >
        {champ("x")}
        {champ("y")}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 1 — traduire chaque déplacement
// ---------------------------------------------------------------------------------------------

interface PropsTraduction extends PropsAides {
  consigne: ReactNode;
  instructions: string[];
  libelles: string[];
  tentativesUtilisees: number;
  tentativesMax: number;
  statuts: StatutComposantes[] | null;
  erreurLecture: boolean;
  onValider: (saisies: SaisieVecteur[]) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeTraduction({ consigne, instructions, libelles, tentativesUtilisees, tentativesMax, statuts, erreurLecture, onValider, validation, ...aides }: PropsTraduction) {
  const [saisies, setSaisies] = useState<SaisieVecteur[]>(() => libelles.map(() => ({ ...SAISIE_VECTEUR_VIDE })));
  const fige = !!validation;
  const complet = saisies.every(saisieVecteurComplete);
  const fausses = statuts ? statuts.map((s, i) => ({ s, i })).filter(({ s }) => s !== "correct") : [];
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "grid", gap: 14, margin: "12px 0", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {libelles.map((libelle, i) => (
          <div key={i} style={{ display: "grid", gap: 6 }}>
            <span className="field-label field-label-minuscule">{`${i + 1}. ${instructions[i]}`}</span>
            <SaisieColonne
              id={`ds-u${i + 1}`}
              libelle={libelle}
              valeur={saisies[i]!}
              disabled={fige}
              erronee={!fige && statuts !== null && statuts[i] !== "correct"}
              onChange={(v) => setSaisies((s) => s.map((x, j) => (j === i ? v : x)))}
            />
          </div>
        ))}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisies)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Une composante n'est pas lisible : écris un nombre (entier ou décimal). Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <AlerteTentative
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              details={
                fausses.length > 0 && (
                  <ul style={{ margin: "6px 0 0", paddingLeft: "1.2em" }}>
                    {fausses.map(({ s, i }) => (
                      <li key={i}>{`Déplacement ${i + 1} : ${messageComposantes(s)}.`}</li>
                    ))}
                  </ul>
                )
              }
            />
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écrans à un vecteur (total, retour, dernier déplacement / rocher → trésor)
// ---------------------------------------------------------------------------------------------

interface PropsVecteur extends PropsAides {
  consigne: ReactNode;
  libelle: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  messageErreur: string | null;
  erreurLecture: boolean;
  /** Composantes fausses à la dernière tentative (marquage rouge), `null` avant. */
  champsFaux: boolean;
  onValider: (saisie: SaisieVecteur) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeVecteur({ consigne, libelle, tentativesUtilisees, tentativesMax, messageErreur, erreurLecture, champsFaux, onValider, validation, ...aides }: PropsVecteur) {
  const [saisie, setSaisie] = useState<SaisieVecteur>({ ...SAISIE_VECTEUR_VIDE });
  const fige = !!validation;
  const complet = saisieVecteurComplete(saisie);
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div style={{ margin: "12px 0" }}>
        <SaisieColonne id="ds-vecteur" libelle={libelle} valeur={saisie} disabled={fige} erronee={!fige && champsFaux} onChange={setSaisie} />
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisie)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Une composante n'est pas lisible : écris un nombre (entier ou décimal). Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <AlerteTentative tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} details={messageErreur && <p style={{ margin: "6px 0 0" }}>{messageErreur}</p>} />
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écrans à un nombre (k, distance)
// ---------------------------------------------------------------------------------------------

interface PropsNombre extends PropsAides {
  consigne: ReactNode;
  libelle: string;
  placeholder: string;
  unite: string | null;
  /** Bouton « √ » (distance exacte : pas de touche racine sur un clavier de téléphone). */
  avecRacine: boolean;
  aideSaisie: string | null;
  /** Message d'une saisie illisible (aucune tentative comptée). */
  messageIllisible: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  messageErreur: string | null;
  erreurLecture: boolean;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeNombre({
  consigne,
  libelle,
  placeholder,
  unite,
  avecRacine,
  aideSaisie,
  messageIllisible,
  tentativesUtilisees,
  tentativesMax,
  messageErreur,
  erreurLecture,
  onValider,
  validation,
  ...aides
}: PropsNombre) {
  const [texte, setTexte] = useState("");
  const champ = useRef<HTMLInputElement>(null);
  const fige = !!validation;
  const complet = texte.trim() !== "";
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <div className="field" style={{ margin: "12px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <label htmlFor="ds-nombre" className="field-label field-label-minuscule" style={{ margin: 0 }}>
            <Katex expression={libelle} />
          </label>
          <input
            ref={champ}
            id="ds-nombre"
            className={`text-input${!fige && tentativesUtilisees > 0 ? " is-erronee" : ""}`}
            style={{ flex: "1 1 8em", minWidth: 0, maxWidth: "14em" }}
            placeholder={placeholder}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={texte}
            disabled={fige}
            onChange={(ev) => setTexte(normaliserSigneMoins(ev.target.value))}
          />
          {unite && <span>{unite}</span>}
          {avecRacine && !fige && (
            <button
              type="button"
              className="btn"
              style={{ minHeight: 44, minWidth: 48 }}
              onPointerDown={(ev) => ev.preventDefault()}
              onClick={() => {
                setTexte((t) => t + "√");
                champ.current?.focus();
              }}
            >
              √
            </button>
          )}
        </div>
        {aideSaisie && !fige && (
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", margin: "6px 0 0" }}>
            {aideSaisie}
          </p>
        )}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(texte)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              {messageIllisible}
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <AlerteTentative tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} details={messageErreur && <p style={{ margin: "6px 0 0" }}>{messageErreur}</p>} />
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
