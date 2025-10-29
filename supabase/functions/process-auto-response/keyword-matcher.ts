/**
 * Keyword Matcher Module
 * Handles keyword-based auto-response rule matching
 */

interface LineMessage {
  type: string;
  text?: string;
  [key: string]: unknown;
}

interface MatchResult {
  rule_id: string;
  matched_keyword: string;
  responseMessage: LineMessage;
  actions: any[];
}

/**
 * Check if current time matches rule's active hours
 */
function checkActiveHours(activeHours: any): boolean {
  if (!activeHours) return true;

  const { start_hour, end_hour, timezone } = activeHours;
  const now = new Date();

  // TODO: Handle timezone conversion properly
  const currentHour = now.getHours();

  if (start_hour <= end_hour) {
    return currentHour >= start_hour && currentHour < end_hour;
  } else {
    // Handles overnight ranges (e.g., 22:00 to 06:00)
    return currentHour >= start_hour || currentHour < end_hour;
  }
}

/**
 * Check if current day matches rule's active days
 */
function checkActiveDays(activeDays: number[]): boolean {
  if (!activeDays || activeDays.length === 0) return true;

  const currentDay = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  return activeDays.includes(currentDay);
}

/**
 * Check if friend has required tags
 */
async function checkTags(
  supabase: any,
  friendId: string,
  requiredTags?: string[],
  excludedTags?: string[]
): Promise<boolean> {
  if (
    (!requiredTags || requiredTags.length === 0) &&
    (!excludedTags || excludedTags.length === 0)
  ) {
    return true;
  }

  // Get friend's tags
  const { data: friendTags } = await supabase
    .from('friend_tags')
    .select('tag_id')
    .eq('friend_id', friendId);

  const tagIds = friendTags?.map((ft: any) => ft.tag_id) || [];

  // Check required tags
  if (requiredTags && requiredTags.length > 0) {
    const hasAllRequired = requiredTags.every((tagId) => tagIds.includes(tagId));
    if (!hasAllRequired) return false;
  }

  // Check excluded tags
  if (excludedTags && excludedTags.length > 0) {
    const hasExcluded = excludedTags.some((tagId) => tagIds.includes(tagId));
    if (hasExcluded) return false;
  }

  return true;
}

/**
 * Check if friend matches segment conditions
 */
async function checkSegments(
  supabase: any,
  friendId: string,
  userId: string,
  requiredSegments?: string[],
  excludedSegments?: string[]
): Promise<boolean> {
  if (
    (!requiredSegments || requiredSegments.length === 0) &&
    (!excludedSegments || excludedSegments.length === 0)
  ) {
    return true;
  }

  // Get friend data for segment evaluation
  const { data: friend } = await supabase
    .from('friends')
    .select('*, friend_tags(tag_id)')
    .eq('id', friendId)
    .single();

  if (!friend) return false;

  // Check required segments
  if (requiredSegments && requiredSegments.length > 0) {
    for (const segmentId of requiredSegments) {
      const { data: segment } = await supabase
        .from('segments')
        .select('conditions')
        .eq('id', segmentId)
        .eq('user_id', userId)
        .single();

      if (!segment) return false;

      // Evaluate segment conditions against friend data
      // TODO: Implement proper segment condition evaluation
      // For now, simplified check
    }
  }

  // Check excluded segments
  if (excludedSegments && excludedSegments.length > 0) {
    for (const segmentId of excludedSegments) {
      const { data: segment } = await supabase
        .from('segments')
        .select('conditions')
        .eq('id', segmentId)
        .eq('user_id', userId)
        .single();

      if (!segment) continue;

      // If friend matches excluded segment, reject
      // TODO: Implement proper segment condition evaluation
    }
  }

  return true;
}

/**
 * Check if message matches keyword based on match type
 */
function matchesKeyword(
  message: string,
  keyword: string,
  matchType: string
): boolean {
  const normalizedMessage = message.toLowerCase().trim();
  const normalizedKeyword = keyword.toLowerCase().trim();

  switch (matchType) {
    case 'exact':
      return normalizedMessage === normalizedKeyword;

    case 'partial':
      return normalizedMessage.includes(normalizedKeyword);

    case 'regex':
      try {
        const regex = new RegExp(keyword, 'i');
        return regex.test(message);
      } catch (error) {
        console.error('Invalid regex pattern:', keyword, error);
        return false;
      }

    default:
      return false;
  }
}

/**
 * Build response message from rule configuration
 */
function buildResponseMessage(rule: any): LineMessage {
  const { response_type, response_content } = rule;

  if (response_type === 'text') {
    return {
      type: 'text',
      text: response_content.text || '',
    };
  }

  if (response_type === 'template') {
    // Return template content as-is
    return response_content as LineMessage;
  }

  // Default fallback
  return {
    type: 'text',
    text: 'Response configured incorrectly',
  };
}

/**
 * Match incoming message against auto-response rules
 */
export async function matchKeyword(
  supabase: any,
  userId: string,
  friendId: string,
  messageText: string,
  messageType: string
): Promise<MatchResult | null> {
  // Only process text messages for keyword matching
  if (messageType !== 'text') {
    return null;
  }

  // Get active keyword-based rules ordered by priority
  const { data: rules, error } = await supabase
    .from('auto_response_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('trigger_type', 'keyword')
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error || !rules || rules.length === 0) {
    return null;
  }

  // Evaluate rules in priority order
  for (const rule of rules) {
    try {
      // Check keyword match
      if (!matchesKeyword(messageText, rule.keyword, rule.match_type)) {
        continue;
      }

      // Check time conditions
      if (!checkActiveHours(rule.active_hours)) {
        continue;
      }

      if (!checkActiveDays(rule.active_days)) {
        continue;
      }

      // Check tag conditions
      const tagsMatch = await checkTags(
        supabase,
        friendId,
        rule.required_tags,
        rule.excluded_tags
      );
      if (!tagsMatch) {
        continue;
      }

      // Check segment conditions
      const segmentsMatch = await checkSegments(
        supabase,
        friendId,
        userId,
        rule.required_segments,
        rule.excluded_segments
      );
      if (!segmentsMatch) {
        continue;
      }

      // All conditions met - return match result
      return {
        rule_id: rule.id,
        matched_keyword: rule.keyword,
        responseMessage: buildResponseMessage(rule),
        actions: rule.actions || [],
      };
    } catch (error) {
      console.error('Error evaluating rule:', rule.id, error);
      continue; // Try next rule
    }
  }

  // No matching rule found
  return null;
}
