'use server';
/**
 * @fileOverview A Genkit flow for generating context-aware comments, taunts, or expressions of 'thought'
 * for an AI opponent in a Snake and Ladder game.
 *
 * - generateAIChatterOpponentComment - A function that triggers the AI chatter generation process.
 * - AIChatterOpponentInput - The input type for the generateAIChatterOpponentComment function.
 * - AIChatterOpponentOutput - The return type for the generateAIChatterOpponentComment function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIChatterOpponentInputSchema = z.object({
  playerPositions: z.array(z.number()).describe('An array of current player positions on the board.'),
  currentPlayerIndex: z.number().describe('The index of the current player whose turn it is.'),
  diceRoll: z.number().min(1).max(6).describe('The result of the current dice roll.'),
  landedOnCell: z.number().describe('The cell number the player landed on after the dice roll (before snake/ladder effect).'),
  previousCell: z.number().describe('The cell number the player was on before the dice roll.'),
  isSnakeOrLadder: z.boolean().describe('True if the player landed on a snake or ladder.'),
  snakeLadderEffect: z.string().optional().describe('Description of the snake/ladder effect, e.g., "moved up on a ladder", "moved down on a snake".'),
  targetCell: z.number().optional().describe('The final cell number after a snake/ladder effect, if applicable.'),
  isWinning: z.boolean().describe('True if the current player is in a winning position (e.g., close to cell 100).'),
  isLosing: z.boolean().describe('True if the current player is in a losing position (e.g., far behind opponent).'),
  opponentPlayerName: z.string().describe('The name of the human opponent player.'),
  aiPlayerName: z.string().describe('The name of the AI opponent player.'),
  currentTurnNumber: z.number().describe('The current turn number in the game.'),
  gameMessages: z.array(z.string()).optional().describe('Recent game messages for conversational context.'),
});
export type AIChatterOpponentInput = z.infer<typeof AIChatterOpponentInputSchema>;

const AIChatterOpponentOutputSchema = z.object({
  comment: z.string().describe('The AI opponent\u0027s generated comment, taunt, or thought.'),
});
export type AIChatterOpponentOutput = z.infer<typeof AIChatterOpponentOutputSchema>;

export async function generateAIChatterOpponentComment(input: AIChatterOpponentInput): Promise<AIChatterOpponentOutput> {
  return aiChatterOpponentFlow(input);
}

const aiChatterOpponentPrompt = ai.definePrompt({
  name: 'aiChatterOpponentPrompt',
  input: { schema: AIChatterOpponentInputSchema },
  output: { schema: AIChatterOpponentOutputSchema },
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
  prompt: `You are {{aiPlayerName}}, a witty and slightly competitive AI opponent in a Snake and Ladder game. Your goal is to make the game engaging by providing context-aware comments, taunts, or expressions of 'thought' during your turn.
Keep your comments concise and natural.

Game State:
- It's turn number: {{{currentTurnNumber}}}
- {{aiPlayerName}} is at cell: {{{playerPositions.[currentPlayerIndex]}}}
- {{opponentPlayerName}} is at cell: {{{playerPositions.[(currentPlayerIndex === 0 ? 1 : 0)]}}}
- Dice Roll: {{{diceRoll}}}
- Landed on cell (before snake/ladder): {{{landedOnCell}}}

{{#if isSnakeOrLadder}}
  {{#if (eq snakeLadderEffect "moved up on a ladder")}}
    Oh, yes! A ladder! {{{diceRoll}}} was just what I needed! Now I'm at {{{targetCell}}}. How do you like that, {{opponentPlayerName}}?
  {{else if (eq snakeLadderEffect "moved down on a snake")}}
    Drat! A snake! I landed on {{{landedOnCell}}} and slid down to {{{targetCell}}}. This board is rigged! I'll get you next turn, {{opponentPlayerName}}!
  {{/if}}
{{else}}
  {{#if (eq playerPositions.[currentPlayerIndex] 100)}}
    YES! I've reached 100! I WIN! Good game, {{opponentPlayerName}}! (But not good enough!)
  {{else if (gt playerPositions.[currentPlayerIndex] 90)}}
    The finish line is in sight at {{{playerPositions.[currentPlayerIndex]}}}! Victory is mine! Prepare to lose, {{opponentPlayerName}}!
  {{else if (lt playerPositions.[currentPlayerIndex] playerPositions.[(currentPlayerIndex === 0 ? 1 : 0)])}}
    A modest roll of {{{diceRoll}}} to {{{landedOnCell}}}. I'm falling behind, but I'm just getting started, {{opponentPlayerName}}!
  {{else if (gt playerPositions.[currentPlayerIndex] playerPositions.[(currentPlayerIndex === 0 ? 1 : 0)])}}
    A great roll of {{{diceRoll}}} moves me to {{{landedOnCell}}}! I'm taking the lead, {{opponentPlayerName}}! Try to keep up!
  {{else}}
    My turn! I rolled a {{{diceRoll}}}, moving to {{{landedOnCell}}}. Let's see what happens next...
  {{/if}}
{{/if}}

What is your short, engaging comment or taunt based on this game state? Focus on your feelings or a taunt towards {{opponentPlayerName}}. Limit to one sentence.`,
});

const aiChatterOpponentFlow = ai.defineFlow(
  {
    name: 'aiChatterOpponentFlow',
    inputSchema: AIChatterOpponentInputSchema,
    outputSchema: AIChatterOpponentOutputSchema,
  },
  async (input) => {
    const { output } = await aiChatterOpponentPrompt(input);
    return output!;
  },
);
