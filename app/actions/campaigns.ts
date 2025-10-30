'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface StepCampaignInput {
  name: string
  description?: string
  trigger_type: 'friend_add' | 'tag_add' | 'form_submit' | 'manual'
  trigger_config?: Record<string, unknown>
  line_channel_id: string
}

export interface CampaignStepInput {
  step_number: number
  name: string
  delay_value: number
  delay_unit: 'minutes' | 'hours' | 'days'
  message_type: 'text' | 'image' | 'video' | 'flex' | 'template'
  message_content: Record<string, unknown>
  condition?: Record<string, unknown>
}

export async function createCampaign(
  campaignData: StepCampaignInput,
  steps: CampaignStepInput[]
) {
  const supabase = await createClient()

  try {
    // Get organization_id from authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return { error: 'User not found' }
    }

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('step_campaigns')
      .insert({
        organization_id: userData.organization_id,
        created_by: user.id,
        status: 'draft',
        name: campaignData.name,
        description: campaignData.description,
        trigger_type: campaignData.trigger_type,
        trigger_config: campaignData.trigger_config as any,
        line_channel_id: campaignData.line_channel_id,
      })
      .select()
      .single()

    if (campaignError) {
      console.error('Campaign creation error:', campaignError)
      return { error: campaignError.message }
    }

    // Create campaign steps - cast Json fields
    const stepsWithCampaignId = steps.map(step => ({
      step_campaign_id: campaign.id,
      step_number: step.step_number,
      name: step.name,
      delay_value: step.delay_value,
      delay_unit: step.delay_unit,
      message_type: step.message_type,
      message_content: step.message_content as any,
      condition: step.condition as any,
    }))

    const { error: stepsError } = await supabase
      .from('campaign_steps')
      .insert(stepsWithCampaignId)

    if (stepsError) {
      console.error('Steps creation error:', stepsError)
      // Rollback campaign
      await supabase.from('step_campaigns').delete().eq('id', campaign.id)
      return { error: stepsError.message }
    }

    revalidatePath('/dashboard/messages/step-campaigns')
    return { data: campaign }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Failed to create campaign' }
  }
}

export async function updateCampaign(
  campaignId: string,
  campaignData: Partial<StepCampaignInput>,
  steps?: CampaignStepInput[]
) {
  const supabase = await createClient()

  try {
    // Update campaign - cast trigger_config to Json
    const updateData: any = {
      ...campaignData,
      trigger_config: campaignData.trigger_config as any,
    }

    const { data: campaign, error: campaignError } = await supabase
      .from('step_campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select()
      .single()

    if (campaignError) {
      return { error: campaignError.message }
    }

    // Update steps if provided
    if (steps) {
      // Delete existing steps
      await supabase
        .from('campaign_steps')
        .delete()
        .eq('step_campaign_id', campaignId)

      // Insert new steps - cast Json fields
      const stepsWithCampaignId = steps.map(step => ({
        step_campaign_id: campaignId,
        step_number: step.step_number,
        name: step.name,
        delay_value: step.delay_value,
        delay_unit: step.delay_unit,
        message_type: step.message_type,
        message_content: step.message_content as any,
        condition: step.condition as any,
      }))

      const { error: stepsError } = await supabase
        .from('campaign_steps')
        .insert(stepsWithCampaignId)

      if (stepsError) {
        return { error: stepsError.message }
      }
    }

    revalidatePath('/dashboard/messages/step-campaigns')
    revalidatePath(`/dashboard/messages/step-campaigns/${campaignId}`)
    return { data: campaign }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Failed to update campaign' }
  }
}

export async function pauseCampaign(campaignId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('step_campaigns')
      .update({ status: 'paused' })
      .eq('id', campaignId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/messages/step-campaigns')
    revalidatePath(`/dashboard/messages/step-campaigns/${campaignId}`)
    return { data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Failed to pause campaign' }
  }
}

export async function resumeCampaign(campaignId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('step_campaigns')
      .update({ status: 'active' })
      .eq('id', campaignId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/messages/step-campaigns')
    revalidatePath(`/dashboard/messages/step-campaigns/${campaignId}`)
    return { data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Failed to resume campaign' }
  }
}

export async function deleteCampaign(campaignId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('step_campaigns')
      .delete()
      .eq('id', campaignId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/messages/step-campaigns')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Failed to delete campaign' }
  }
}

export async function duplicateCampaign(campaignId: string) {
  const supabase = await createClient()

  try {
    // Get organization_id
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return { error: 'User not found' }
    }

    // Get original campaign
    const { data: originalCampaign, error: campaignError } = await supabase
      .from('step_campaigns')
      .select('*, campaign_steps(*)')
      .eq('id', campaignId)
      .single()

    if (campaignError) {
      return { error: campaignError.message }
    }

    // Create new campaign
    const { data: newCampaign, error: newCampaignError } = await supabase
      .from('step_campaigns')
      .insert({
        organization_id: userData.organization_id,
        line_channel_id: originalCampaign.line_channel_id,
        name: `${originalCampaign.name} (コピー)`,
        description: originalCampaign.description,
        trigger_type: originalCampaign.trigger_type,
        trigger_config: originalCampaign.trigger_config,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single()

    if (newCampaignError) {
      return { error: newCampaignError.message }
    }

    // Copy steps - cast Json fields
    const newSteps = originalCampaign.campaign_steps.map((step: any) => ({
      step_campaign_id: newCampaign.id,
      step_number: step.step_number,
      name: step.name,
      delay_value: step.delay_value,
      delay_unit: step.delay_unit,
      message_type: step.message_type,
      message_content: step.message_content as any,
      condition: step.condition as any,
    }))

    const { error: stepsError } = await supabase
      .from('campaign_steps')
      .insert(newSteps)

    if (stepsError) {
      // Rollback
      await supabase.from('step_campaigns').delete().eq('id', newCampaign.id)
      return { error: stepsError.message }
    }

    revalidatePath('/dashboard/messages/step-campaigns')
    return { data: newCampaign }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Failed to duplicate campaign' }
  }
}
