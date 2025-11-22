/**
 * OpenAI Translation Helper
 * Translates Korean funeral-service related text into natural Vietnamese
 * STRICT: No English words allowed in Vietnamese output
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Translates Korean text to Vietnamese using OpenAI API
 * Ensures Vietnamese output contains NO English words
 * @param koreanText - Korean text to translate
 * @returns Translated Vietnamese text (Vietnamese only, no English)
 */
export async function translateKRtoVI(koreanText: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.error('[TRANSLATE] OPENAI_API_KEY is not set');
    throw new Error('OpenAI API key is not configured');
  }

  if (!koreanText || koreanText.trim().length === 0) {
    return '';
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using gpt-4o model
        messages: [
          {
            role: 'system',
            content:
              'You are a professional translator specializing in funeral service content. Translate Korean funeral-related text into natural Vietnamese. The Vietnamese must sound native, smooth, and professional. Do not output any English words at all. If you encounter English terms, translate them to Vietnamese equivalents. The output must be 100% Vietnamese only.',
          },
          {
            role: 'user',
            content: `Translate the following Korean text to Vietnamese. Output ONLY Vietnamese text, no English words:\n\n${koreanText}`,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[TRANSLATE] OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    let translatedText =
      data.choices?.[0]?.message?.content?.trim() || '';

    if (!translatedText) {
      console.error('[TRANSLATE] No translation in response:', data);
      throw new Error('No translation received from OpenAI API');
    }

    // Strip any accidental English tokens (basic cleanup)
    // Remove common English words that might slip through
    translatedText = stripEnglishWords(translatedText);

    console.log('[TRANSLATE] Translation successful:', {
      originalLength: koreanText.length,
      translatedLength: translatedText.length,
    });

    return translatedText;
  } catch (error) {
    console.error('[TRANSLATE] Translation error:', error);
    throw error;
  }
}

/**
 * Strips English words from Vietnamese text
 * Basic cleanup to ensure Vietnamese-only output
 */
function stripEnglishWords(text: string): string {
  // Common English words that should not appear in Vietnamese
  const englishWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'it', 'they', 'we', 'you', 'he', 'she',
  ];

  let cleaned = text;
  
  // Remove standalone English words (surrounded by spaces or punctuation)
  englishWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });

  // Clean up extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Translates multiple Korean texts to Vietnamese
 * @param koreanTexts - Array of Korean texts to translate
 * @returns Array of translated Vietnamese texts
 */
export async function translateMultipleKRtoVI(
  koreanTexts: string[]
): Promise<string[]> {
  const translations = await Promise.all(
    koreanTexts.map((text) => translateKRtoVI(text))
  );
  return translations;
}
