import { useId } from "react";
import type { FonctionTransformee } from "../core/portraitRobotFonction.types";
import { evaluerFonction } from "../moteur/modelePortraitRobot";
import { LETTRES_COURBES } from "../ui/formatPortraitRobot";

/**
 * Les 4 courbes de la famille C de « Le portrait-robot d'une fonction » (gen71) : fenêtre fixe
 * [−6 ; 6] × [−6 ; 6], grille d'une unité (les conditions portent sur des valeurs entières),
 * asymptotes en pointillé, point de départ marqué pour la racine carrée. Couleurs issues des
 * variables du thème (clair/sombre), jamais en dur.
 */

const TAILLE = 204;
const MARGE = 6;
const MIN = -6;
const MAX = 6;
const ECHELLE = (TAILLE - 2 * MARGE) / (MAX - MIN);

const sx = (x: number) => MARGE + (x - MIN) * ECHELLE;
const sy = (y: number) => MARGE + (MAX - y) * ECHELLE;

function cheminCourbe(f: FonctionTransformee): string {
  const morceaux: string[] = [];
  let courant: string[] = [];
  const pas = (MAX - MIN) / 480;
  const abscisses: number[] = [];
  for (let i = 0; i <= 480; i++) abscisses.push(MIN + i * pas);
  if (f.famille === "racine_carree" && f.h > MIN && f.h < MAX) abscisses.push(f.h);
  abscisses.sort((a, b) => a - b);
  for (const x of abscisses) {
    const y = evaluerFonction(f, x);
    if (y === null || y < MIN - 3 || y > MAX + 3) {
      if (courant.length > 1) morceaux.push(courant.join(" "));
      courant = [];
      continue;
    }
    courant.push(`${courant.length === 0 ? "M" : "L"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
  }
  if (courant.length > 1) morceaux.push(courant.join(" "));
  return morceaux.join(" ");
}

interface PropsCourbe {
  fonction: FonctionTransformee;
  lettre: string;
  surlignee?: boolean;
}

export function CourbePortraitRobot({ fonction, lettre, surlignee }: PropsCourbe) {
  const graduations: number[] = [];
  for (let v = MIN; v <= MAX; v++) graduations.push(v);
  const etiquettes = [-4, -2, 2, 4];
  const idClip = `clip-portrait-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <figure
      style={{
        margin: 0,
        border: `${surlignee ? 3 : 1}px solid ${surlignee ? "var(--color-primary)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
        padding: 4,
      }}
    >
      <figcaption style={{ fontWeight: 700, padding: "0 4px", color: "var(--color-text)" }}>Courbe {lettre}</figcaption>
      <svg viewBox={`0 0 ${TAILLE} ${TAILLE}`} role="img" aria-label={`Courbe ${lettre}`} style={{ display: "block", width: "100%", height: "auto" }}>
        <defs>
          <clipPath id={idClip}>
            <rect x={MARGE} y={MARGE} width={TAILLE - 2 * MARGE} height={TAILLE - 2 * MARGE} />
          </clipPath>
        </defs>
        {graduations.map((v) => (
          <g key={v}>
            <line x1={sx(v)} y1={MARGE} x2={sx(v)} y2={TAILLE - MARGE} stroke="var(--color-border)" strokeWidth={0.8} />
            <line x1={MARGE} y1={sy(v)} x2={TAILLE - MARGE} y2={sy(v)} stroke="var(--color-border)" strokeWidth={0.8} />
          </g>
        ))}
        <line x1={MARGE} y1={sy(0)} x2={TAILLE - MARGE} y2={sy(0)} stroke="var(--color-text-muted)" strokeWidth={1.4} />
        <line x1={sx(0)} y1={MARGE} x2={sx(0)} y2={TAILLE - MARGE} stroke="var(--color-text-muted)" strokeWidth={1.4} />
        {etiquettes.map((v) => (
          <g key={`e${v}`} fontSize={9} fill="var(--color-text-muted)">
            <text x={sx(v)} y={sy(0) + 10} textAnchor="middle">
              {String(v).replace("-", "−")}
            </text>
            <text x={sx(0) - 3} y={sy(v) + 3} textAnchor="end">
              {String(v).replace("-", "−")}
            </text>
          </g>
        ))}
        <g clipPath={`url(#${idClip})`}>
          {fonction.famille === "inverse" && (
            <>
              <line x1={sx(fonction.h)} y1={MARGE} x2={sx(fonction.h)} y2={TAILLE - MARGE} stroke="var(--color-text-muted)" strokeWidth={1.2} strokeDasharray="5 4" />
              <line x1={MARGE} y1={sy(fonction.k)} x2={TAILLE - MARGE} y2={sy(fonction.k)} stroke="var(--color-text-muted)" strokeWidth={1.2} strokeDasharray="5 4" />
            </>
          )}
          <path d={cheminCourbe(fonction)} fill="none" stroke="var(--color-primary)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          {fonction.famille === "racine_carree" && <circle cx={sx(fonction.h)} cy={sy(fonction.k)} r={3.4} fill="var(--color-primary)" />}
        </g>
      </svg>
    </figure>
  );
}

interface PropsGrille {
  courbes: FonctionTransformee[];
  /** Courbe mise en évidence (écrans « courbe écartée »). */
  surlignee?: number | null;
}

export function GrilleCourbesPortraitRobot({ courbes, surlignee }: PropsGrille) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginTop: 12 }}>
      {courbes.map((f, i) => (
        <CourbePortraitRobot key={i} fonction={f} lettre={LETTRES_COURBES[i]!} surlignee={surlignee === i} />
      ))}
    </div>
  );
}
