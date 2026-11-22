import { useState } from "react";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../ui/choixFige";
import type { ExerciceLieuxGeometriques, Lieu, TypeLieu } from "../core/lieuxGeometriques.types";
import { diagnostiquerIdentificationLieu, lieuxComparesIdentification } from "../moteur/verificationLieuxGeometriques";
import type { ReponseIdentification, ReponseIdentificationLieu } from "../moteur/verificationLieuxGeometriques";
import {
  CONSIGNE_GENERALE_IDENTIFICATION,
  LIBELLE_TYPE_LIEU,
  PLACEHOLDER_COORDONNEE_CENTRE_FOYER,
  PLACEHOLDER_ORDONNEE_ORIGINE,
  PLACEHOLDER_PARAMETRE_PARABOLE,
  PLACEHOLDER_PENTE,
  PLACEHOLDER_RAYON,
  SOUS_TITRE_CHAMPS_IDENTIFICATION,
  segmentsAideIdentificationNiveau1,
  segmentsAideIdentificationNiveau2,
} from "../ui/formatLieuxGeometriques";
import { ILLISIBLE_ANALYTIQUE, nombreOuNaN, nombresLisibles, t } from "../ui/retoursAnalytique";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

const TYPES_LIEU: TypeLieu[] = ["droite", "cercle", "parabole"];

const ARTICLE_TYPE: Record<TypeLieu, string> = { droite: "une droite", cercle: "un cercle", parabole: "une parabole" };

interface ChampsLieuBrut {
  type: TypeLieu | null;
  m: string;
  p: string;
  x0: string;
  y0: string;
  rayon: string;
  xF: string;
  yF: string;
  pParabole: string;
  /** Droite verticale x = k (variante « parallèle à l'axe », parabole d'axe vertical) : un seul champ. */
  verticale: boolean;
  k: string;
}

const CHAMPS_VIDES: ChampsLieuBrut = { type: null, m: "", p: "", x0: "", y0: "", rayon: "", xF: "", yF: "", pParabole: "", verticale: false, k: "" };

/** Entier, décimal (virgule ou point) ou fraction `p/q` (audit chapitre 7, point 60 : une pente
 * comme 3/4 doit pouvoir s'écrire telle quelle) — `NaN` si illisible (`parse_error` côté moteur). */
const nombre = nombreOuNaN;

/** Champs numériques présents (selon le type choisi) tous lisibles. */
function champsLisibles(c: ChampsLieuBrut): boolean {
  if (c.type === "droite") return c.verticale ? nombresLisibles(c.k) : nombresLisibles(c.m, c.p);
  if (c.type === "cercle") return nombresLisibles(c.x0, c.y0, c.rayon);
  if (c.type === "parabole") return nombresLisibles(c.xF, c.yF, c.pParabole);
  return true;
}

/** Bloc de saisie d'UN lieu — encadré neutre, jamais le jaune `.triangle-quelconque-aide`, réservé
 * aux aides (audit chapitre 7, point 60). */
const STYLE_BLOC_LIEU = {
  marginTop: 16,
  padding: "12px 14px",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface)",
} as const;

function construireReponseLieu(champs: ChampsLieuBrut): ReponseIdentificationLieu | null {
  if (champs.type === "droite") {
    if (champs.verticale) return champs.k.trim() === "" ? null : { type: "droite", m: 0, p: 0, abscisse: nombre(champs.k) };
    if (champs.m.trim() === "" || champs.p.trim() === "") return null;
    return { type: "droite", m: nombre(champs.m), p: nombre(champs.p) };
  }
  if (champs.type === "cercle") {
    if (champs.x0.trim() === "" || champs.y0.trim() === "" || champs.rayon.trim() === "") return null;
    return { type: "cercle", x0: nombre(champs.x0), y0: nombre(champs.y0), rayon: nombre(champs.rayon) };
  }
  if (champs.type === "parabole") {
    if (champs.xF.trim() === "" || champs.yF.trim() === "" || champs.pParabole.trim() === "") return null;
    return { type: "parabole", xF: nombre(champs.xF), yF: nombre(champs.yF), p: nombre(champs.pParabole) };
  }
  return null;
}

interface ChampsLieuInputProps {
  numero: 1 | 2;
  champs: ChampsLieuBrut;
  onChange: (champs: ChampsLieuBrut) => void;
  /** Lieu auquel ce bloc est comparé — appariement retenu par `lieuxComparesIdentification`. */
  lieuCompare: Lieu;
  apresEchec: boolean;
  /** Nature déjà jugée (figée) : plus de changement de type. */
  typeVerrouille: boolean;
  /** Nature jugée : type choisi par l'élève et bon type de ce bloc (option fausse en rouge, bonne en
   * vert) ; `null` tant qu'elle ne l'est pas. */
  typeJuge: { choisi: TypeLieu; bon: TypeLieu } | null;
}

/** Choix catégoriel (droite/cercle/parabole) puis champs numériques adaptés — un bloc par lieu,
 * réutilisé pour les 2 (`numero` ne sert plus qu'à distinguer les identifiants DOM des champs,
 * jamais affiché comme "premier"/"second" : la vérification se fait désormais PAR ENSEMBLE, voir
 * `verificationLieuxGeometriques.ts::diagnostiquerIdentification`, B.4). Un sous-titre apparaît
 * au-dessus des champs numériques une fois un type sélectionné (B.2), jamais avant. */
function ChampsLieuInput({ numero, champs, onChange, lieuCompare, apresEchec, typeVerrouille, typeJuge }: ChampsLieuInputProps) {
  const etatOptions = { selection: champs.type, choisie: typeJuge ? typeJuge.choisi : null, bonne: typeJuge ? typeJuge.bon : champs.type };
  const reponse = construireReponseLieu(champs);
  const erronee = apresEchec && reponse !== null && diagnostiquerIdentificationLieu(lieuCompare, reponse) !== "correct";
  const classeChamp = `text-input${erronee ? " is-erronee" : ""}`;
  const prefixe = `lieux-geometriques-lieu${numero}`;

  return (
    <div style={STYLE_BLOC_LIEU}>
      <div className="options-grid-compact">
        {TYPES_LIEU.map((type) => (
          <button
            key={type}
            type="button"
            className={classeOptionChoixFerme<TypeLieu | null>(type, etatOptions)}
            disabled={typeVerrouille}
            onClick={() => onChange({ ...CHAMPS_VIDES, type })}
          >
            {LIBELLE_TYPE_LIEU[type]}
            {ariaOptionChoixFerme<TypeLieu | null>(type, etatOptions) && <span className="sr-only"> — {ariaOptionChoixFerme<TypeLieu | null>(type, etatOptions)}</span>}
          </button>
        ))}
      </div>

      {champs.type !== null && <p className="field-label contenu-conditionnel">{SOUS_TITRE_CHAMPS_IDENTIFICATION[champs.type]}</p>}

      {champs.type === "droite" && (
        <button
          type="button"
          className="btn"
          style={{ marginBottom: 8 }}
          aria-pressed={champs.verticale}
          onClick={() => onChange({ ...champs, verticale: !champs.verticale, m: "", p: "", k: "" })}
        >
          {champs.verticale ? "Droite non verticale : y = mx + p" : "Droite verticale : x = k"}
        </button>
      )}

      {champs.type === "droite" && champs.verticale && (
        <div className="field-row">
          <div className="field field-inline">
            <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-k`}>
              x =
            </label>
            <input id={`${prefixe}-k`} className={classeChamp} placeholder={PLACEHOLDER_ORDONNEE_ORIGINE} value={champs.k} onChange={(e) => onChange({ ...champs, k: normaliserSigneMoins(e.target.value) })} />
          </div>
        </div>
      )}

      {champs.type === "droite" && !champs.verticale && (
        <div className="field-row">
          <div className="field field-inline">
            <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-m`}>
              m =
            </label>
            <input
              id={`${prefixe}-m`}
              className={classeChamp}
              placeholder={PLACEHOLDER_PENTE}
              value={champs.m}
              onChange={(e) => onChange({ ...champs, m: normaliserSigneMoins(e.target.value) })}
            />
          </div>
          <div className="field field-inline">
            <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-p`}>
              p =
            </label>
            <input
              id={`${prefixe}-p`}
              className={classeChamp}
              placeholder={PLACEHOLDER_ORDONNEE_ORIGINE}
              value={champs.p}
              onChange={(e) => onChange({ ...champs, p: normaliserSigneMoins(e.target.value) })}
            />
          </div>
        </div>
      )}

      {champs.type === "cercle" && (
        <>
          <div className="field-row">
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-x0`}>
                x₀ =
              </label>
              <input
                id={`${prefixe}-x0`}
                className={classeChamp}
                placeholder={PLACEHOLDER_COORDONNEE_CENTRE_FOYER}
                value={champs.x0}
                onChange={(e) => onChange({ ...champs, x0: normaliserSigneMoins(e.target.value) })}
              />
            </div>
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-y0`}>
                y₀ =
              </label>
              <input
                id={`${prefixe}-y0`}
                className={classeChamp}
                placeholder={PLACEHOLDER_COORDONNEE_CENTRE_FOYER}
                value={champs.y0}
                onChange={(e) => onChange({ ...champs, y0: normaliserSigneMoins(e.target.value) })}
              />
            </div>
          </div>
          <div className="field field-inline">
            <label className="field-label" htmlFor={`${prefixe}-rayon`}>
              r =
            </label>
            <input
              id={`${prefixe}-rayon`}
              className={classeChamp}
              placeholder={PLACEHOLDER_RAYON}
              value={champs.rayon}
              onChange={(e) => onChange({ ...champs, rayon: normaliserSigneMoins(e.target.value) })}
            />
          </div>
        </>
      )}

      {champs.type === "parabole" && (
        <>
          <div className="field-row">
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-xF`}>
                <Katex expression="x_F" /> =
              </label>
              <input
                id={`${prefixe}-xF`}
                className={classeChamp}
                placeholder={PLACEHOLDER_COORDONNEE_CENTRE_FOYER}
                value={champs.xF}
                onChange={(e) => onChange({ ...champs, xF: normaliserSigneMoins(e.target.value) })}
              />
            </div>
            <div className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-yF`}>
                <Katex expression="y_F" /> =
              </label>
              <input
                id={`${prefixe}-yF`}
                className={classeChamp}
                placeholder={PLACEHOLDER_COORDONNEE_CENTRE_FOYER}
                value={champs.yF}
                onChange={(e) => onChange({ ...champs, yF: normaliserSigneMoins(e.target.value) })}
              />
            </div>
          </div>
          <div className="field field-inline">
            <label className="field-label field-label-minuscule" htmlFor={`${prefixe}-pParabole`}>
              p =
            </label>
            <input
              id={`${prefixe}-pParabole`}
              className={classeChamp}
              placeholder={PLACEHOLDER_PARAMETRE_PARABOLE}
              value={champs.pParabole}
              onChange={(e) => onChange({ ...champs, pParabole: normaliserSigneMoins(e.target.value) })}
            />
          </div>
        </>
      )}
    </div>
  );
}

interface Props {
  exercice: ExerciceLieuxGeometriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseIdentification) => void;
  /** Nature des lieux déjà jugée par le moteur (une fois), `null` tant qu'elle ne l'est pas. */
  naturesFigees: { correct: boolean } | null;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 1 — Identification. Pour chacun des 2 lieux : choix catégoriel (droite/cercle/parabole)
 * puis champs numériques adaptés au choix. */
export function EtapeIdentificationLieuxGeometriques({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, naturesFigees, validation }: Props) {
  const [champs1, setChamps1] = useState<ChampsLieuBrut>(CHAMPS_VIDES);
  const [champs2, setChamps2] = useState<ChampsLieuBrut>(CHAMPS_VIDES);
  // Nature jugée fausse puis figée par le moteur : les deux blocs passent à la bonne nature (champs
  // vides, à compléter avec leurs trois tentatives).
  const [figeVu, setFigeVu] = useState(naturesFigees);
  // Types choisis par l'élève, mémorisés au moment du jugement (avant que les blocs passent à la
  // bonne nature) : pour marquer l'option fausse en rouge et la bonne en vert.
  const [typesChoisis, setTypesChoisis] = useState<[TypeLieu | null, TypeLieu | null] | null>(null);
  if (figeVu !== naturesFigees) {
    setFigeVu(naturesFigees);
    if (naturesFigees) setTypesChoisis([champs1.type, champs2.type]);
    if (naturesFigees && !naturesFigees.correct) {
      setChamps1({ ...CHAMPS_VIDES, type: exercice.lieu1.type });
      setChamps2({ ...CHAMPS_VIDES, type: exercice.lieu2.type });
    }
  }
  const apresEchec = tentativesUtilisees > 0;

  // Nature jugée fausse : bon type = celui de chaque bloc après la remise à la bonne nature ; nature
  // juste : le type choisi, marqué juste.
  function typeJugeBloc(i: 0 | 1): { choisi: TypeLieu; bon: TypeLieu } | null {
    const choisi = typesChoisis?.[i] ?? null;
    if (!naturesFigees || choisi === null) return null;
    const bon = naturesFigees.correct ? choisi : (i === 0 ? exercice.lieu1.type : exercice.lieu2.type);
    return { choisi, bon };
  }

  const reponseLieu1 = construireReponseLieu(champs1);
  const reponseLieu2 = construireReponseLieu(champs2);
  const complet = reponseLieu1 !== null && reponseLieu2 !== null;
  const [lieuCompare1, lieuCompare2] = lieuxComparesIdentification(exercice, reponseLieu1, reponseLieu2);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_IDENTIFICATION}</p>

      <ChampsLieuInput numero={1} champs={champs1} onChange={setChamps1} lieuCompare={lieuCompare1} apresEchec={apresEchec} typeVerrouille={!!validation || naturesFigees !== null} typeJuge={typeJugeBloc(0)} />
      <ChampsLieuInput numero={2} champs={champs2} onChange={setChamps2} lieuCompare={lieuCompare2} apresEchec={apresEchec} typeVerrouille={!!validation || naturesFigees !== null} typeJuge={typeJugeBloc(1)} />
      {naturesFigees !== null && !naturesFigees.correct && !validation && (
        <p className="alert-error" role="status">
          <span>
            <RenduFragments
              fragments={[
                t(`Ce n'étaient pas les bonnes natures : le premier lieu est ${ARTICLE_TYPE[exercice.lieu1.type]}, le second ${ARTICLE_TYPE[exercice.lieu2.type]}. Complète maintenant leurs caractéristiques.`),
              ]}
            />
          </span>
        </p>
      )}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideIdentificationNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <RenduFragments fragments={segmentsAideIdentificationNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={2}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => ({ lieu1: reponseLieu1 as ReponseIdentificationLieu, lieu2: reponseLieu2 as ReponseIdentificationLieu })}
          lisible={() => champsLisibles(champs1) && champsLisibles(champs2)}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.coefficient}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
