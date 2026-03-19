import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
    }

    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { badge_id } = await req.json()
    if (!badge_id) {
      return new Response(JSON.stringify({ error: 'Missing badge_id' }), { status: 400 })
    }

    // Check eligibility first
    const { data: eligibility, error: eligError } = await supabase.rpc('check_badge_upgrade_eligibility', {
      p_badge_id: badge_id,
      p_user_id: user.id
    })

    if (eligError || !eligibility?.eligible) {
      return new Response(JSON.stringify({ error: 'Badge not eligible for upgrade', eligibility }), { status: 400 })
    }

    // Get original badge
    const { data: originalBadge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badge_id)
      .eq('user_id', user.id)
      .single()

    if (badgeError || !originalBadge) {
      return new Response(JSON.stringify({ error: 'Badge not found' }), { status: 404 })
    }

    // Create upgraded badge
    const upgradedBadge = {
      user_id: user.id,
      household_id: originalBadge.household_id,
      type: originalBadge.type,
      tier: eligibility.next_tier,
      earned_at: new Date().toISOString(),
      criteria: originalBadge.criteria,
      metadata: originalBadge.metadata,
      upgraded_from: badge_id
    }

    const { data: newBadge, error: insertError } = await supabase
      .from('badges')
      .insert(upgradedBadge)
      .select()
      .single()

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
    }

    // Create upgrade record
    const { error: upgradeError } = await supabase.from('badge_upgrades').insert({
      user_id: user.id,
      badge_id: newBadge.id,
      from_badge_id: badge_id,
      badge_type: originalBadge.type,
      from_tier: originalBadge.tier,
      to_tier: eligibility.next_tier,
      upgraded_at: new Date().toISOString(),
      eligibility_criteria: eligibility.criteria_met
    })

    if (upgradeError) {
      console.error('Failed to create upgrade record:', upgradeError)
    }

    return new Response(JSON.stringify({ success: true, badge: newBadge }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
