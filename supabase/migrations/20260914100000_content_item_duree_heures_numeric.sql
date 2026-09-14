-- The client's module durations (1 h 30, 3 h, 2 h, 2 h, 1 h 30) do not fit an
-- integer column; two of the five modules are fractional hours.
alter table app.content_item
  alter column duree_heures type numeric(4,2)
  using duree_heures::numeric(4,2);

comment on column app.content_item.duree_heures is 'Decimal hours (1.5 = 1 h 30). Totals stay computed at read time (D-30).';
