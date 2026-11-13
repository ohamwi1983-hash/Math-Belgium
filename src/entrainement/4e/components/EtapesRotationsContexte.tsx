import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { OrigineRotation, RotationSens } from "../core/rotationsContexte.types";
import type { StatutChamp } from "../moteur/verificationRotationsContexte";
import { libelleOrigine, libelleRotation, nomCourtChamp, type ChampRotation } from "../ui/formatRotationsContexte";
import { BoutonAide } from "./BoutonAide";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Écrans de gen79 (« Le cercle dans le réel : rotations en contexte ») : repérage de la position de
 * départ et du sens de rotation (choix fermés, UNE tentative), puis écrans à champs numériques
 * libres (jamais de blocage de frappe, règle CLAUDE.md ; 3 tentatives). Aucun point affiché.
 */

export interface AideRotation {
  fragments: FragmentConsigne[];
  /** Figure jointe à ce palier d'aide (cercle trigonométrique annoté), facultative. */
  figure?: ReactNode;
}

interface PropsAides {
  aides: AideRotation[];
  niveauAide: number;
  onActiverAide: () => void;
}

function BlocAides({ aides, niveauAide, onActiverAide }: PropsAides) {
  return (
    <div>
      {aides.slice(0, niveauAide).map((aide, i) => (
        <div key={i} className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={aide.fragments} />
          </p>
          {aide.figure}
        </div>
      ))}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 1 — position de départ et sens de rotation
// ---------------------------------------------------------------------------------------------

const ORIGINES: OrigineRotation[] = [0, 90, 180, 270];
const ROTATIONS: RotationSens[] = [1, -1];

interface PropsRepere extends PropsAides {
  consigne: ReactNode;
  attendu: { origine: OrigineRotation; rotation: RotationSens };
  onValider: (origine: OrigineRotation, rotation: RotationSens) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeRepereRotation({ consigne, attendu, onValider, validation, ...aides }: PropsRepere) {
  const [origine, setOrigine] = useState<OrigineRotation | null>(null);
  const [rotation, setRotation] = useState<RotationSens | null>(null);
  const fige = !!validation;
  const complet = origine !== null && rotation !== null;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <p className="field-label field-label-minuscule" style={{ marginTop: 12 }}>
        Position de départ, sur le cercle trigonométrique :
      </p>
      <div className="options-grid" style={{ margin: "6px 0 14px" }}>
        {ORIGINES.map((o) => {
          const choisi = origine === o;
          return (
            <button
              key={o}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${fige && choisi && o !== attendu.origine ? " is-erronee" : ""}`}
              onClick={() => setOrigine(o)}
            >
              {libelleOrigine(o)}
            </button>
          );
        })}
      </div>
      <p className="field-label field-label-minuscule">Sens de rotation :</p>
      <div className="options-grid" style={{ margin: "6px 0 14px" }}>
        {ROTATIONS.map((r) => {
          const choisi = rotation === r;
          return (
            <button
              key={r}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${fige && choisi && r !== attendu.rotation ? " is-erronee" : ""}`}
              onClick={() => setRotation(r)}
            >
              {libelleRotation(r)}
            </button>
          );
        })}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Une seule tentative : vérifie tes deux choix avant de valider.
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(origine, rotation)}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écrans 2 à 4 — champs numériques
// ---------------------------------------------------------------------------------------------

interface PropsChamps extends PropsAides {
  identifiant: string;
  consigne: ReactNode;
  /** Champs selon le nombre de solutions choisi (`choixNombre`), ou la liste fixe. */
  champs: (nombre: number) => ChampRotation[];
  /** Écran « toutes les solutions » : l'élève choisit s'il y a une ou deux solutions (jamais
   * présélectionné selon la réponse : « Deux solutions » est toujours le choix de départ). */
  choixNombre?: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  statuts: StatutChamp[] | null;
  /** Message ciblé de la dernière soumission (piège reconnu, saisie illisible…). */
  message: string | null;
  /** La dernière soumission n'a pas compté de tentative (saisie illisible, angle non réduit). */
  nonCompte: boolean;
  onValider: (saisies: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

function messageStatut(s: StatutChamp): string {
  if (s === "signe") return "le signe est à revoir";
  if (s === "non_reduit") return "à ramener dans [0° ; 360°[";
  if (s === "parse_error") return "valeur illisible";
  return "à revoir";
}

export function EtapeChampsRotation({ identifiant, consigne, champs, choixNombre, tentativesUtilisees, tentativesMax, statuts, message, nonCompte, onValider, validation, ...aides }: PropsChamps) {
  const [nombre, setNombre] = useState(2);
  const liste = champs(choixNombre ? nombre : 0);
  const [saisies, setSaisies] = useState<string[]>(() => ["", ""]);
  const fige = !!validation;
  const valeurs = liste.map((_, i) => saisies[i] ?? "");
  const complet = valeurs.every((s) => s.trim() !== "");

  function modifier(i: number, v: string) {
    setSaisies((s) => {
      const copie = [...s];
      while (copie.length <= i) copie.push("");
      copie[i] = normaliserSigneMoins(v);
      return copie;
    });
  }

  const fautifs = statuts ? statuts.map((s, i) => ({ s, i })).filter(({ s }) => s !== "correct") : [];

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      {choixNombre && (
        <div className="options-grid" style={{ margin: "10px 0" }}>
          {[2, 1].map((n) => (
            <button key={n} type="button" disabled={fige} aria-pressed={nombre === n} className={`btn${nombre === n ? " toggle-active" : ""}`} onClick={() => setNombre(n)}>
              {n === 2 ? "Deux solutions" : "Une seule solution"}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gap: 10, margin: "12px 0" }}>
        {liste.map((champ, i) => {
          const erronee = !fige && statuts !== null && statuts[i] !== undefined && statuts[i] !== "correct";
          const id = `${identifiant}-${i}`;
          return (
            <div key={i} className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor={id}>
                <RenduFragments fragments={champ.libelle} />
              </label>
              <div className="champ-avec-unite">
                <input
                  id={id}
                  className={`text-input${erronee ? " is-erronee" : ""}`}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={valeurs[i]}
                  disabled={fige}
                  onChange={(ev) => modifier(i, ev.target.value)}
                />
                {champ.unite && <span className="champ-avec-unite-suffixe">{champ.unite}</span>}
              </div>
            </div>
          );
        })}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Un nombre décimal (virgule ou point), positif ou négatif ; une fraction comme 3/4 est acceptée.
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(valeurs)}>
            Valider
          </button>
          {nonCompte && message && (
            <p className="alert-error" role="alert">
              {message}
            </p>
          )}
          {!nonCompte && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              {/* Un seul enfant : l'alerte est en flex (icône + contenu), les lignes s'empilent. */}
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {liste.length > 1 && fautifs.length > 0 && fautifs.length < liste.length && (
                  <ul style={{ margin: "6px 0 0", paddingLeft: "1.2em" }}>
                    {fautifs.map(({ s, i }) => (
                      <li key={i}>
                        <RenduFragments fragments={nomCourtChamp(liste[i]?.libelle ?? [])} /> : {messageStatut(s)}.
                      </li>
                    ))}
                  </ul>
                )}
                {message && <p style={{ margin: "6px 0 0" }}>{message}</p>}
              </div>
            </div>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
