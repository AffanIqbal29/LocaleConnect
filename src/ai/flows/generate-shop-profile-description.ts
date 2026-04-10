'use server';
/**
 * @fileOverview A Genkit flow for generating a compelling shop profile description.
 *
 * - generateShopProfileDescription - A function that handles the generation of the shop description.
 * - GenerateShopProfileDescriptionInput - The input type for the generateShopProfileDescription function.
 * - GenerateShopProfileDescriptionOutput - The return type for the generateShopProfileDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateShopProfileDescriptionInputSchema = z.object({
  shopName: z.string().describe("The name of the local shop."),
  shopType: z.string().describe("The type of shop (e.g., 'bakery', 'bookstore', 'boutique', 'cafe')."),
  uniqueSellingPoints: z.array(z.string()).describe("A list of unique selling points or features that make the shop stand out.").optional(),
  location: z.string().describe("The general location or neighborhood of the shop.").optional(),
  productsSold: z.array(z.string()).describe("A list of key products or categories of products sold.").optional(),
});
export type GenerateShopProfileDescriptionInput = z.infer<typeof GenerateShopProfileDescriptionInputSchema>;

const GenerateShopProfileDescriptionOutputSchema = z.object({
  shopDescription: z.string().describe("A compelling and engaging 'About Us' or shop description for the profile."),
});
export type GenerateShopProfileDescriptionOutput = z.infer<typeof GenerateShopProfileDescriptionOutputSchema>;

export async function generateShopProfileDescription(input: GenerateShopProfileDescriptionInput): Promise<GenerateShopProfileDescriptionOutput> {
  return generateShopProfileDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShopProfileDescriptionPrompt',
  input: { schema: GenerateShopProfileDescriptionInputSchema },
  output: { schema: GenerateShopProfileDescriptionOutputSchema },
  prompt: `You are an AI assistant specialized in writing compelling and engaging "About Us" descriptions for local businesses.

Generate an "About Us" or shop description for a local business with the following details:

Shop Name: {{{shopName}}}
Shop Type: {{{shopType}}}
{{#if location}}Location: {{{location}}}{{/if}}
{{#if productsSold}}Products Sold: {{#each productsSold}}- {{{this}}}\n{{/each}}{{/if}}
{{#if uniqueSellingPoints}}Unique Selling Points:
{{#each uniqueSellingPoints}}- {{{this}}}\n{{/each}}{{/if}}

Create a description that highlights the shop's unique appeal and attracts customers. Focus on warmth, community, and the specific offerings of the shop. Make it engaging, inviting, and concise, around 2-3 paragraphs long.
`,
});

const generateShopProfileDescriptionFlow = ai.defineFlow(
  {
    name: 'generateShopProfileDescriptionFlow',
    inputSchema: GenerateShopProfileDescriptionInputSchema,
    outputSchema: GenerateShopProfileDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
