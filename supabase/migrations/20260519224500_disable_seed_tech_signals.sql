update public.tech_signals
set active = false,
    updated_at = now()
where source_name = 'BriefMate seed data';
