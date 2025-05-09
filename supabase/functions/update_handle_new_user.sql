
-- Updated function to include the country field
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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
    country
  ) 
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    new.raw_user_meta_data->>'phone_number', 
    new.raw_user_meta_data->>'job_title', 
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'country'
  ); 
  RETURN new; 
END; 
$function$
