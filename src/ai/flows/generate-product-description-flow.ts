'use server';
/**
 * @fileOverview A Genkit flow for generating compelling product descriptions.
 *
 * - generateProductDescription - A function that handles the product description generation process.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  keywords: z
    .array(z.string())
    .describe('A list of keywords relevant to the product (e.g., handmade, eco-friendly, durable).'),
  productDetails: z.string().describe('Additional details about the product, such as materials, features, and benefits.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('A compelling and high-quality product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in creating compelling and attractive product descriptions for e-commerce listings. Your goal is to write a high-quality description that highlights the product's value and appeals to potential customers.

Generate a detailed product description based on the following information:

Product Name: {{{productName}}}
Keywords: {{{keywords}}}
Product Details: {{{productDetails}}}

Craft a description that is engaging, informative, and persuasive. Focus on the benefits for the customer, unique selling points, and the overall quality of the product. The description should be suitable for a local shop's online store.
`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await productDescriptionPrompt(input);
    return output!;
  }
);
