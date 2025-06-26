-- Creates a trigger to automatically create a user profile upon new user registration.

-- 1. Define the function to be executed on new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (user_id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger to execute the function after a new user is added to auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
