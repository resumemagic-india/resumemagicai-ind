
create or replace function increment_download_count(user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  free_downloads integer;
  user_subscription RECORD;
begin
  -- Lock the row to prevent race conditions from multiple download attempts
  SELECT free_downloads_remaining 
    INTO free_downloads
    FROM profiles
    WHERE id = user_id
    FOR UPDATE;
    
  -- First check if user has an active one-time purchase with remaining downloads
  SELECT * INTO user_subscription
  FROM subscriptions
  WHERE user_id = $1 
    AND status = 'active'
    AND is_one_time_purchase = TRUE
    AND downloads_remaining > 0
  ORDER BY plan_type = 'plus' DESC -- prioritize plus plan if user has multiple
  LIMIT 1;
  
  -- If user has a one-time purchase with remaining downloads
  IF FOUND THEN
    -- Decrement remaining downloads
    UPDATE subscriptions
    SET downloads_remaining = downloads_remaining - 1
    WHERE id = user_subscription.id;
    
    -- Log download count for analytics
    UPDATE profiles
    SET download_count = download_count + 1
    WHERE id = user_id;
    
    RETURN;
  END IF;

  -- If no active one-time purchase with downloads, use free downloads if available
  IF free_downloads > 0 THEN
    -- Decrement free downloads
    UPDATE profiles
    SET free_downloads_remaining = free_downloads_remaining - 1
    WHERE id = user_id;
  ELSE
    -- Just increment the download count for tracking purposes
    -- (This should not happen as the UI should prevent downloads when limit is reached)
    UPDATE profiles
    SET download_count = download_count + 1
    WHERE id = user_id;
  END IF;
END;
$$;
