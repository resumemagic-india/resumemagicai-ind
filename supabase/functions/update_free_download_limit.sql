
-- Update the free_downloads_remaining field for all users to 2
UPDATE profiles
SET free_downloads_remaining = 1
WHERE free_downloads_remaining != 1;

-- Make sure any new users will get 2 free downloads
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$ 
BEGIN 
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    phone_number, 
    job_title, 
    address,
    country,
    free_downloads_remaining
  ) 
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    new.raw_user_meta_data->>'phone_number', 
    new.raw_user_meta_data->>'job_title', 
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'country',
    2
  ); 
  RETURN new; 
END; 
$function$;
