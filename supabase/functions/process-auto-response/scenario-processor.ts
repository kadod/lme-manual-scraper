/**
 * Scenario Processor Module
 * Handles multi-step conversation scenario processing
 */

interface LineMessage {
  type: string;
  text?: string;
  [key: string]: unknown;
}

interface ScenarioStep {
  id: string;
  type: 'message' | 'question' | 'branch' | 'action';
  message?: LineMessage;
  validation?: {
    type: 'text' | 'number' | 'email' | 'phone' | 'regex';
    pattern?: string;
    error_message?: string;
  };
  variable?: string; // Variable name to store user input
  branches?: {
    condition: string;
    next_step_id: string;
  }[];
  actions?: any[];
  next_step_id?: string;
}

interface ScenarioResult {
  responseMessage: LineMessage | null;
  actions: any[];
}

/**
 * Validate user input based on validation rules
 */
function validateInput(input: string, validation: any): boolean {
  if (!validation) return true;

  const { type, pattern } = validation;

  switch (type) {
    case 'text':
      return input.trim().length > 0;

    case 'number':
      return !isNaN(Number(input));

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input);

    case 'phone':
      const phoneRegex = /^[0-9-+()]{10,}$/;
      return phoneRegex.test(input.replace(/\s/g, ''));

    case 'regex':
      if (!pattern) return true;
      try {
        const regex = new RegExp(pattern);
        return regex.test(input);
      } catch (error) {
        console.error('Invalid regex pattern:', pattern);
        return false;
      }

    default:
      return true;
  }
}

/**
 * Evaluate branch condition to determine next step
 */
function evaluateBranch(
  branches: any[],
  userInput: string,
  context: any
): string | null {
  for (const branch of branches) {
    const { condition, next_step_id } = branch;

    try {
      // Simple condition evaluation
      // Supports: equals, contains, gt, lt, regex
      if (condition.type === 'equals') {
        if (userInput.toLowerCase() === condition.value.toLowerCase()) {
          return next_step_id;
        }
      } else if (condition.type === 'contains') {
        if (userInput.toLowerCase().includes(condition.value.toLowerCase())) {
          return next_step_id;
        }
      } else if (condition.type === 'regex') {
        const regex = new RegExp(condition.value, 'i');
        if (regex.test(userInput)) {
          return next_step_id;
        }
      } else if (condition.type === 'gt' || condition.type === 'lt') {
        const numInput = Number(userInput);
        const numValue = Number(condition.value);
        if (!isNaN(numInput) && !isNaN(numValue)) {
          if (condition.type === 'gt' && numInput > numValue) {
            return next_step_id;
          }
          if (condition.type === 'lt' && numInput < numValue) {
            return next_step_id;
          }
        }
      } else if (condition.type === 'default') {
        return next_step_id;
      }
    } catch (error) {
      console.error('Error evaluating branch condition:', condition, error);
    }
  }

  return null;
}

/**
 * Get step by ID from scenario configuration
 */
function getStep(steps: ScenarioStep[], stepId: string): ScenarioStep | null {
  return steps.find((step) => step.id === stepId) || null;
}

/**
 * Process scenario conversation
 */
export async function processScenario(
  supabase: any,
  conversation: any,
  messageText: string,
  messageType: string
): Promise<ScenarioResult> {
  const { id: conversationId, current_step_id, context, retry_count, scenarios } =
    conversation;
  const scenario = scenarios;

  if (!scenario) {
    throw new Error('Scenario not found');
  }

  const steps: ScenarioStep[] = scenario.steps;
  const currentStep = getStep(steps, current_step_id);

  if (!currentStep) {
    throw new Error(`Step ${current_step_id} not found in scenario`);
  }

  let responseMessage: LineMessage | null = null;
  let actions: any[] = [];
  let nextStepId: string | null = null;
  let updatedContext = { ...context };
  let newRetryCount = retry_count;

  // Handle different step types
  switch (currentStep.type) {
    case 'question':
      // Validate user input
      if (messageType === 'text' && currentStep.validation) {
        const isValid = validateInput(messageText, currentStep.validation);

        if (!isValid) {
          // Invalid input - check retry limit
          newRetryCount++;

          if (newRetryCount >= scenario.max_retries) {
            // Max retries reached - abandon conversation
            await supabase
              .from('active_conversations')
              .update({
                status: 'abandoned',
                completed_at: new Date().toISOString(),
              })
              .eq('id', conversationId);

            // Update scenario statistics
            await supabase
              .from('scenarios')
              .update({
                total_abandoned: supabase.raw('total_abandoned + 1'),
              })
              .eq('id', scenario.id);

            responseMessage = {
              type: 'text',
              text: '申し訳ございません。正しい入力を確認できませんでした。最初からやり直してください。',
            };

            return { responseMessage, actions: [] };
          }

          // Send error message and retry
          responseMessage = {
            type: 'text',
            text:
              currentStep.validation.error_message ||
              '入力が正しくありません。もう一度お試しください。',
          };

          await supabase
            .from('active_conversations')
            .update({
              retry_count: newRetryCount,
              last_interaction_at: new Date().toISOString(),
            })
            .eq('id', conversationId);

          return { responseMessage, actions: [] };
        }
      }

      // Valid input - store in context
      if (currentStep.variable) {
        updatedContext[currentStep.variable] = messageText;
      }

      // Determine next step (branch or sequential)
      if (currentStep.branches && currentStep.branches.length > 0) {
        nextStepId = evaluateBranch(
          currentStep.branches,
          messageText,
          updatedContext
        );
      } else {
        nextStepId = currentStep.next_step_id || null;
      }

      newRetryCount = 0; // Reset retry count on success
      break;

    case 'message':
      // Just display message and move to next step
      nextStepId = currentStep.next_step_id || null;
      break;

    case 'action':
      // Execute actions
      if (currentStep.actions) {
        actions = currentStep.actions;
      }
      nextStepId = currentStep.next_step_id || null;
      break;

    default:
      console.error('Unknown step type:', currentStep.type);
      nextStepId = null;
  }

  // Get next step message
  if (nextStepId) {
    const nextStep = getStep(steps, nextStepId);

    if (nextStep) {
      responseMessage = nextStep.message || null;

      // Update conversation state
      await supabase
        .from('active_conversations')
        .update({
          current_step_id: nextStepId,
          context: updatedContext,
          retry_count: newRetryCount,
          last_interaction_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
    } else {
      // Next step not found - complete conversation
      await supabase
        .from('active_conversations')
        .update({
          status: 'completed',
          context: updatedContext,
          completed_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      // Update scenario statistics
      await supabase
        .from('scenarios')
        .update({
          total_completed: supabase.raw('total_completed + 1'),
        })
        .eq('id', scenario.id);

      responseMessage = {
        type: 'text',
        text: 'ありがとうございました。',
      };
    }
  } else {
    // No next step - complete conversation
    await supabase
      .from('active_conversations')
      .update({
        status: 'completed',
        context: updatedContext,
        completed_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    // Update scenario statistics
    await supabase
      .from('scenarios')
      .update({
        total_completed: supabase.raw('total_completed + 1'),
      })
      .eq('id', scenario.id);

    responseMessage = {
      type: 'text',
      text: 'ありがとうございました。',
    };
  }

  return { responseMessage, actions };
}
