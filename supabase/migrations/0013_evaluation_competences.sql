-- =================================================================================================
-- Math-Belgium — carnet : compétences évaluées d'une évaluation annoncée
-- =================================================================================================
--
-- À coller APRÈS 0012_logo_ecole.sql (il suppose 0001 à 0008 déjà exécutés : séances et leurs
-- colonnes d'évaluation), dans l'éditeur SQL du projet Supabase (SQL Editor → New query → coller
-- TOUT ce fichier → Run). Idempotent : le relancer ne casse rien et ne perd aucune donnée (colonne
-- `add column if not exists`, fonction `create or replace`, contrainte ajoutée seulement si absente).
-- Aucune clé secrète, aucun jeton, aucun mot de passe : rien à remplacer.
--
-- Résultat attendu : « Success. No rows returned ». Recharger /carnet : dans « Annoncer une
-- évaluation », les compétences décochées (Connaître · Appliquer · Transférer) sont gardées avec
-- l'évaluation (Supabase peut mettre quelques secondes à voir la nouvelle colonne). Tant que ce
-- fichier n'est pas exécuté, tout marche : les compétences affichées sont DÉDUITES des exercices
-- retenus (Connaître d'office), et l'écran d'annonce le dit au professeur.
--
-- Contenu (AUCUNE donnée d'élève : des numéros de compétences) :
--   seances  + evaluation_competences : compétences évaluées par l'évaluation annoncée avec cette
--              séance — tableau de 1 à 3 entiers distincts parmi 1 (Connaître), 2 (Appliquer),
--              3 (Transférer) ; tableau vide = pas précisé (anciennes annonces : rien à migrer).
--   Pas de contrainte de cohérence avec `evaluation_type` : une valeur restée après le retrait de
--   l'évaluation n'a aucun effet (le site la remet à vide), et le carnet d'avant, qui n'écrit pas
--   cette colonne, peut toujours retirer une évaluation sans erreur.
--   RLS      inchangé : les politiques de 0002 couvrent déjà toutes les colonnes de `seances`
--            (proprietaire = auth.uid() et compte actif, pour TOUTES les opérations ; `anon` n'a
--            aucun droit). Rien n'est ouvert à l'administrateur.
-- =================================================================================================

alter table public.seances add column if not exists evaluation_competences jsonb not null default '[]'::jsonb;

-- Tableau d'entiers distincts parmi 1, 2, 3 (au plus trois). Immuable, sans dépendance au schéma.
create or replace function public.competences_evaluation_valides(j jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(j) = 'array'
     and jsonb_array_length(j) <= 3
     and not exists (
       select 1 from jsonb_array_elements(j) as e(v)
       where v not in ('1'::jsonb, '2'::jsonb, '3'::jsonb)
     )
     and (select count(distinct v) from jsonb_array_elements(j) as e(v)) = jsonb_array_length(j)
$$;

revoke all on function public.competences_evaluation_valides(jsonb) from public, anon;
grant execute on function public.competences_evaluation_valides(jsonb) to authenticated;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'seances_evaluation_competences_valides' and conrelid = 'public.seances'::regclass) then
    alter table public.seances add constraint seances_evaluation_competences_valides
      check (public.competences_evaluation_valides(evaluation_competences));
  end if;
end;
$$;

comment on column public.seances.evaluation_competences is 'Compétences évaluées par l''évaluation annoncée (1 Connaître, 2 Appliquer, 3 Transférer) ; vide = déduites des exercices retenus.';

-- Droits et RLS : ceux de 0002 (aucun changement ; rappelés pour qu'une base où ils auraient été
-- modifiés à la main retrouve l'état attendu).
revoke all on public.seances from anon;
grant select, insert, update, delete on public.seances to authenticated;
alter table public.seances enable row level security;

-- Supabase recharge son cache de schéma à chaque DDL ; on le demande quand même (sans effet ailleurs).
notify pgrst, 'reload schema';
