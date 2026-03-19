import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // This function runs on a schedule (cron job) - verify secret key
    const authHeader = req.headers.get('Authorization')
    const cronSecret = Deno.env.get('CRON_SECRET')
    
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // Use service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get all badges that might be eligible for upgrade
    const { data: badges, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .in('tier', ['bronze', 'silver', 'gold']) // Platinum is max tier
      .order('earned_at', { ascending: true })

    if (badgeError) {
      throw badgeError
    }

    const eligibleUpgrades: any[] = []
    const now = new Date()

    // Check each badge for upgrade eligibility
    for (const badge of badges || []) {
      const earnedDate = new Date(badge.earned_at)
      const daysSince = Math.floor((now.getTime() - earnedDate.getTime()) / (1000 * 60 * 60 * 24))

      // Quick time check before calling DB function
      const minDays = badge.tier === 'bronze' ? 30 : badge.tier === 'silver' ? 90 : 180
      if (daysSince < minDays) continue

      // Check full eligibility via database function
      const { data: eligibility } = await supabase.rpc('check_badge_upgrade_eligibility', {
        p_badge_id: badge.id,
        p_user_id: badge.user_id
      })

      if (eligibility?.eligible) {
        eligibleUpgrades.push({
          user_id: badge.user_id,
          badge_id: badge.id,
          badge_type: badge.type,
          current_tier: badge.tier,
          next_tier: eligibility.next_tier,
          days_since_earned: daysSince
        })
      }
    }

    // TODO: Send notifications to users about eligible upgrades
    // This would integrate with notification system (push, email, etc.)

    return new Response(JSON.stringify({
      success: true,
      checked: badges?.length || 0,
      eligible: eligibleUpgrades.length,
      upgrades: eligibleUpgrades
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
