insert into public.products (
    part_number,
    brand,
    model,
    description
)
values
(
    'ANVAYA-001',
    'ANVAYA',
    'MODEL-100',
    'Industrial product for testing'
),
(
    'ANVAYA-002',
    'ANVAYA',
    'MODEL-200',
    'Industrial product for demonstration'
)
on conflict (part_number) do nothing;

