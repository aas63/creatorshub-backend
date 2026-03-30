import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Media uploads will fail until they are configured."
  );
}

export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export const audioBucket =
  process.env.SUPABASE_AUDIO_BUCKET || process.env.SUPABASE_AUDIO_BUCKET_NAME || "audio";
export const imageBucket =
  process.env.SUPABASE_IMAGE_BUCKET || process.env.SUPABASE_IMAGE_BUCKET_NAME || "images";
