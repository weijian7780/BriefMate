-- Create function to check if a user with the given email already exists
create or replace function public.email_exists(email_to_check text)
returns boolean
security definer
as $$
begin
  return exists (
    select 1 from auth.users where email = email_to_check
  );
end;
$$ language plpgsql;
