/**
 * Action Executor Module
 * Executes post-response actions like tag management, segment updates, etc.
 */

interface Action {
  type:
    | 'add_tag'
    | 'remove_tag'
    | 'add_segment'
    | 'remove_segment'
    | 'update_field'
    | 'start_scenario'
    | 'start_step_campaign';
  [key: string]: any;
}

/**
 * Add tag to friend
 */
async function addTag(
  supabase: any,
  friendId: string,
  tagId: string
): Promise<void> {
  // Check if tag already exists
  const { data: existing } = await supabase
    .from('friend_tags')
    .select('id')
    .eq('friend_id', friendId)
    .eq('tag_id', tagId)
    .single();

  if (existing) {
    return; // Tag already exists
  }

  // Add tag
  await supabase.from('friend_tags').insert({
    friend_id: friendId,
    tag_id: tagId,
  });
}

/**
 * Remove tag from friend
 */
async function removeTag(
  supabase: any,
  friendId: string,
  tagId: string
): Promise<void> {
  await supabase
    .from('friend_tags')
    .delete()
    .eq('friend_id', friendId)
    .eq('tag_id', tagId);
}

/**
 * Update custom field on friend
 */
async function updateField(
  supabase: any,
  friendId: string,
  fieldName: string,
  fieldValue: any
): Promise<void> {
  // Get current metadata
  const { data: friend } = await supabase
    .from('friends')
    .select('metadata')
    .eq('id', friendId)
    .single();

  const metadata = friend?.metadata || {};
  metadata[fieldName] = fieldValue;

  // Update metadata
  await supabase
    .from('friends')
    .update({ metadata })
    .eq('id', friendId);
}

/**
 * Start a new scenario conversation
 */
async function startScenario(
  supabase: any,
  friendId: string,
  scenarioId: string
): Promise<void> {
  // Get scenario details
  const { data: scenario } = await supabase
    .from('scenarios')
    .select('id, steps')
    .eq('id', scenarioId)
    .eq('is_active', true)
    .single();

  if (!scenario || !scenario.steps || scenario.steps.length === 0) {
    throw new Error('Scenario not found or has no steps');
  }

  // Get first step ID
  const firstStepId = scenario.steps[0].id;

  // Check for existing active conversation
  const { data: existing } = await supabase
    .from('active_conversations')
    .select('id')
    .eq('friend_id', friendId)
    .eq('status', 'active')
    .single();

  if (existing) {
    // Close existing conversation first
    await supabase
      .from('active_conversations')
      .update({
        status: 'abandoned',
        completed_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  }

  // Create new conversation
  await supabase.from('active_conversations').insert({
    friend_id: friendId,
    scenario_id: scenarioId,
    current_step_id: firstStepId,
    context: {},
    status: 'active',
  });

  // Update scenario statistics
  await supabase
    .from('scenarios')
    .update({
      total_started: supabase.raw('total_started + 1'),
    })
    .eq('id', scenarioId);
}

/**
 * Start a step campaign for the friend
 */
async function startStepCampaign(
  supabase: any,
  friendId: string,
  userId: string,
  campaignId: string
): Promise<void> {
  // Check if campaign exists
  const { data: campaign } = await supabase
    .from('step_campaigns')
    .select('id')
    .eq('id', campaignId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (!campaign) {
    throw new Error('Step campaign not found or inactive');
  }

  // Check if friend is already enrolled
  const { data: existing } = await supabase
    .from('step_campaign_enrollments')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('friend_id', friendId)
    .eq('status', 'active')
    .single();

  if (existing) {
    return; // Already enrolled
  }

  // Enroll friend in campaign
  await supabase.from('step_campaign_enrollments').insert({
    campaign_id: campaignId,
    friend_id: friendId,
    current_step: 0,
    status: 'active',
  });
}

/**
 * Execute all actions for a friend
 */
export async function executeActions(
  supabase: any,
  friendId: string,
  userId: string,
  actions: Action[]
): Promise<void> {
  if (!actions || actions.length === 0) {
    return;
  }

  for (const action of actions) {
    try {
      switch (action.type) {
        case 'add_tag':
          if (action.tag_id) {
            await addTag(supabase, friendId, action.tag_id);
          }
          break;

        case 'remove_tag':
          if (action.tag_id) {
            await removeTag(supabase, friendId, action.tag_id);
          }
          break;

        case 'update_field':
          if (action.field_name) {
            await updateField(
              supabase,
              friendId,
              action.field_name,
              action.field_value
            );
          }
          break;

        case 'start_scenario':
          if (action.scenario_id) {
            await startScenario(supabase, friendId, action.scenario_id);
          }
          break;

        case 'start_step_campaign':
          if (action.campaign_id) {
            await startStepCampaign(
              supabase,
              friendId,
              userId,
              action.campaign_id
            );
          }
          break;

        default:
          console.warn('Unknown action type:', action.type);
      }
    } catch (error) {
      console.error('Error executing action:', action, error);
      // Continue with other actions even if one fails
    }
  }
}
