import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { MovablePoint } from "mafs";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { EcranConstruction, ExerciceConstruireSomme, Point } from "../core/construireSomme.types";
import { centreEtiquettePoint, centreEtiquetteVecteur, ecrans, fenetre, pointsConstruits, pointsDonnes, poigneeInitiale, vecteursDonnes } from "../moteur/modeleConstruireSomme";
import type { SaisieComposantes, StatutComposante } from "../moteur/verificationConstruireSomme";
import { contraindreAuNoeudDeFenetre } from "../ui/formatConstructionVectorielle";
import type { PointAffiche, VecteurAffiche } from "../ui/vecteurGraph";
import { INDICATION_GLISSER } from "../ui/formatConstruireSomme";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { VecteurGraph } from "./VecteurGraph";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

/**
 * Écrans de gen83 (« Construire une somme, une différence, un point »). Même quadrillage magnétique
 * que gen23 (`VecteurGraph` + `MovablePoint` de Mafs, accroche aux nœuds par
 * `contraindreAuNoeudDeFenetre`, fenêtre FIXE, fond non déplaçable) — ici l'ORIGINE de chaque
 * flèche est imposée et l'élève fait glisser son extrémité. Les constructions déjà validées restent
 * tracées (bleu-vert) d'un écran à l'autre ; à la révélation, la flèche attendue s'affiche en vert.
 * Aucun point affiché.
 */

export const COULEUR_U = "#1971c2";
export const COULEUR_V = "#9c36b5";
export const COULEUR_CONSTRUIT = "#0b7285";
export const COULEUR_ELEVE = "#e8590c";
export const COULEUR_ATTENDU = "#2f9e44";
const COULEUR_AB_AC = "#868e96";

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

/** Données + constructions déjà validées (écrans d'indice < `ecranCourant`). */
export function elementsFigure(e: ExerciceConstruireSomme, ecranCourant: number): { points: PointAffiche[]; vecteurs: VecteurAffiche[] } {
  const vecteurs: VecteurAffiche[] = vecteursDonnes(e).map((v) => ({
    origine: v.origine,
    vecteur: v.composantes,
    couleur: v.nom === "u" ? COULEUR_U : COULEUR_V,
    labelFleche: { base: v.nom },
  }));
  const points: PointAffiche[] = pointsDonnes(e).map((p) => ({ point: p.point, label: p.nom }));
  if (e.variante === "point") {
    const [A, B, C] = points;
    vecteurs.push({ origine: A!.point, vecteur: { x: B!.point.x - A!.point.x, y: B!.point.y - A!.point.y }, couleur: COULEUR_AB_AC });
    vecteurs.push({ origine: A!.point, vecteur: { x: C!.point.x - A!.point.x, y: C!.point.y - A!.point.y }, couleur: COULEUR_AB_AC });
  }
  ecrans(e).forEach((ec, i) => {
    if (i >= ecranCourant || ec.type !== "construction") return;
    vecteurs.push({ origine: ec.origine, vecteur: { x: ec.attendu.x - ec.origine.x, y: ec.attendu.y - ec.origine.y }, couleur: COULEUR_CONSTRUIT });
    if (e.variante === "point") points.push({ point: ec.attendu, label: ec.role === "placerPoint" ? "M" : "P", couleur: COULEUR_CONSTRUIT });
  });
  // Étiquettes de u et v : décalées perpendiculairement, loin des autres flèches. Le texte s'écrit
  // au-dessus de sa ligne de base : on la place un peu sous le centre voulu.
  for (const v of vecteurs) {
    if (!v.labelFleche) continue;
    const c = centreEtiquetteVecteur(e, v.origine, v.vecteur);
    v.labelPosition = { x: c.x, y: c.y - 0.35 };
  }
  // Étiquette d'un point : là où elle est le plus loin des flèches (figure complète). Le texte est
  // accroché sous sa position (attach « s ») : on vise un peu plus haut que le centre voulu.
  const tous = [...pointsDonnes(e).map((p) => p.point), ...(e.variante === "point" ? pointsConstruits(e) : [])];
  for (const p of points) {
    const c = centreEtiquettePoint(e, p.point, tous);
    p.labelPosition = { x: c.x, y: c.y + 0.3 };
  }
  return { points, vecteurs };
}

function Legende({ e, ecranCourant, revele }: { e: ExerciceConstruireSomme; ecranCourant: number; revele: boolean }) {
  const dejaConstruit = ecrans(e).slice(0, ecranCourant).some((ec) => ec.type === "construction");
  const items: ReactNode[] = [];
  if (dejaConstruit) items.push(<span key="c" style={{ color: COULEUR_CONSTRUIT, fontWeight: 600 }}>bleu-vert : déjà construit</span>);
  items.push(<span key="e" style={{ color: COULEUR_ELEVE, fontWeight: 600 }}>orange : ta flèche</span>);
  if (revele) items.push(<span key="a" style={{ color: COULEUR_ATTENDU, fontWeight: 600 }}>vert : la flèche attendue</span>);
  return (
    <p style={{ margin: "4px 0 10px", fontSize: "0.9em", display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
      {items}
    </p>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran de construction
// ---------------------------------------------------------------------------------------------

interface PropsConstruction extends PropsAides {
  exercice: ExerciceConstruireSomme;
  indexEcran: number;
  ecran: EcranConstruction;
  consigne: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Message ciblé de la dernière tentative fausse (`null` avant la première). */
  diagnostic: FragmentConsigne[] | null;
  onValider: (extremite: Point) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeConstruction({ exercice, indexEcran, ecran, consigne, tentativesUtilisees, tentativesMax, diagnostic, onValider, validation, ...aides }: PropsConstruction) {
  const vue = useMemo(() => fenetre(exercice), [exercice]);
  const [extremite, setExtremite] = useState<[number, number]>(() => {
    const p = poigneeInitiale(ecran);
    return [p.x, p.y];
  });
  const contraindre = (p: [number, number]) => contraindreAuNoeudDeFenetre(p, vue);
  const point: Point = { x: extremite[0], y: extremite[1] };
  const revele = validation?.revele === true;
  const { points, vecteurs } = elementsFigure(exercice, indexEcran);
  // Lettre M (dernière étape de la variante point), dans le prolongement de la flèche PM.
  const centreM = centreEtiquettePoint(exercice, ecran.attendu, [...pointsDonnes(exercice).map((p) => p.point), ...pointsConstruits(exercice)]);
  const etiquetteM = { x: centreM.x, y: centreM.y + 0.3 };

  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      <VecteurGraph
        points={validation && ecran.role === "placerPoint" ? [...points, { point: ecran.attendu, label: "M", couleur: revele ? COULEUR_ATTENDU : COULEUR_ELEVE, labelPosition: etiquetteM }] : points}
        vecteurs={[
          ...vecteurs,
          { origine: ecran.origine, vecteur: { x: point.x - ecran.origine.x, y: point.y - ecran.origine.y }, couleur: COULEUR_ELEVE },
          ...(revele ? [{ origine: ecran.origine, vecteur: { x: ecran.attendu.x - ecran.origine.x, y: ecran.attendu.y - ecran.origine.y }, couleur: COULEUR_ATTENDU }] : []),
        ]}
        viewBoxFixe={vue}
        pan={false}
        masquerAxes
        pasGrille={1}
      >
        {!validation && <MovablePoint point={extremite} onMove={(p) => setExtremite(contraindre(p))} constrain={contraindre} color={COULEUR_ELEVE} />}
      </VecteurGraph>
      <Legende e={exercice} ecranCourant={indexEcran} revele={revele} />
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            {INDICATION_GLISSER}
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" onClick={() => onValider(point)}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {diagnostic && (
                  <p style={{ margin: "6px 0 0" }}>
                    <RenduFragments fragments={diagnostic} />
                  </p>
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

// ---------------------------------------------------------------------------------------------
// Écran de choix (retourner la relation, variante point « MA ») — UNE tentative
// ---------------------------------------------------------------------------------------------

interface PropsChoix extends PropsAides {
  exercice: ExerciceConstruireSomme;
  consigne: ReactNode;
  options: string[];
  ordre: number[];
  correct: number;
  onValider: (indice: number) => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeChoixRelation({ exercice, consigne, options, ordre, correct, onValider, validation, ...aides }: PropsChoix) {
  const [choix, setChoix] = useState<number | null>(null);
  const fige = !!validation;
  const vue = useMemo(() => fenetre(exercice), [exercice]);
  const { points, vecteurs } = elementsFigure(exercice, 0);
  return (
    <div>
      <VecteurGraph points={points} vecteurs={vecteurs} viewBoxFixe={vue} pan={false} masquerAxes pasGrille={1} />
      <p className="prompt-text">{consigne}</p>
      <div className="options-grid" style={{ margin: "8px 0 12px" }}>
        {ordre.map((i) => {
          const choisi = choix === i;
          const faux = fige && choisi && i !== correct;
          return (
            <button
              key={i}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              onClick={() => setChoix(i)}
            >
              <Katex expression={`\\vec{AM} = ${options[i]!}`} />
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
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran de lecture des composantes (champs libres, en colonne)
// ---------------------------------------------------------------------------------------------

interface PropsLecture extends PropsAides {
  exercice: ExerciceConstruireSomme;
  consigne: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  statuts: StatutComposante[] | null;
  erreurLecture: boolean;
  onValider: (saisies: SaisieComposantes[]) => void;
  validation?: ValidationEtapeProps | null;
}

function ChampColonne({ nom, valeur, onChange, statuts, fige }: { nom: string; valeur: SaisieComposantes; onChange: (v: SaisieComposantes) => void; statuts: [StatutComposante, StatutComposante] | null; fige: boolean }) {
  const champ = (cle: "x" | "y", statut: StatutComposante | undefined) => (
    <input
      className={`text-input${!fige && statut && statut !== "correct" ? " is-erronee" : ""}`}
      style={{ width: 72, textAlign: "center" }}
      aria-label={`${cle === "x" ? "Première" : "Seconde"} composante de ${nom}`}
      autoComplete="off"
      autoCapitalize="off"
      spellCheck={false}
      value={valeur[cle]}
      disabled={fige}
      onChange={(ev) => onChange({ ...valeur, [cle]: normaliserSigneMoins(ev.target.value) })}
    />
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <Katex expression={`\\vec{${nom}} =`} />
      <span aria-hidden="true" style={{ fontSize: "3.4em", fontWeight: 200, lineHeight: 1, transform: "scaleX(0.55)" }}>
        (
      </span>
      <div style={{ display: "grid", gap: 6 }}>
        {champ("x", statuts?.[0])}
        {champ("y", statuts?.[1])}
      </div>
      <span aria-hidden="true" style={{ fontSize: "3.4em", fontWeight: 200, lineHeight: 1, transform: "scaleX(0.55)" }}>
        )
      </span>
    </div>
  );
}

function messageComposante(statut: StatutComposante): string {
  if (statut === "signe") return "le nombre de carreaux est juste, mais le signe est faux";
  if (statut === "faux") return "à revoir";
  return "illisible";
}

export function EtapeLecture({ exercice, consigne, tentativesUtilisees, tentativesMax, statuts, erreurLecture, onValider, validation, ...aides }: PropsLecture) {
  const [saisies, setSaisies] = useState<SaisieComposantes[]>([
    { x: "", y: "" },
    { x: "", y: "" },
  ]);
  const fige = !!validation;
  const vue = useMemo(() => fenetre(exercice), [exercice]);
  const { points, vecteurs } = elementsFigure(exercice, 0);
  const complet = saisies.every((s) => s.x.trim() !== "" && s.y.trim() !== "");
  const noms = ["u", "v"];
  const fautes = statuts
    ? statuts.flatMap((s, i) => (s === "correct" ? [] : [`${i % 2 === 0 ? "Première" : "Seconde"} composante de ${noms[Math.floor(i / 2)]} : ${messageComposante(s)}.`]))
    : [];
  return (
    <div>
      <VecteurGraph points={points} vecteurs={vecteurs} viewBoxFixe={vue} pan={false} masquerAxes pasGrille={1} />
      <p className="prompt-text">{consigne}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 28px", margin: "8px 0 14px" }}>
        {noms.map((nom, i) => (
          <ChampColonne
            key={nom}
            nom={nom}
            valeur={saisies[i]!}
            fige={fige}
            statuts={statuts ? [statuts[2 * i]!, statuts[2 * i + 1]!] : null}
            onChange={(v) => setSaisies((s) => s.map((x, j) => (j === i ? v : x)))}
          />
        ))}
      </div>
      {!validation && (
        <>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Un nombre entier par case, avec son signe (vers la gauche ou vers le bas : négatif).
          </p>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(saisies)}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              Une case n'est pas lisible : écris un nombre, par exemple −3. Aucune tentative n'est comptée.
            </p>
          )}
          {!erreurLecture && tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
                {fautes.length > 0 && (
                  <ul style={{ margin: "6px 0 0", paddingLeft: "1.2em" }}>
                    {fautes.map((f, i) => (
                      <li key={i}>{f}</li>
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
