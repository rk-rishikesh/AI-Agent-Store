# IPixel Product Photo Studio

A Next.js application that transforms regular product photos into professional studio-quality images using AI.

## Features

- Upload product images
- AI analysis of product images to extract detailed descriptions
- Generate professional studio-quality images based on both analysis and user input
- Customizable prompts for different styles
- Download generated images
- Option to skip image analysis to save API credits

## Setup

1. Clone the repository
2. Install dependencies: `yarn install`
3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Run the development server: `yarn dev`
5. Open http://localhost:3000 in your browser

## How It Works

1. **Upload:** User uploads a product image and optionally adds a description or specific requirements.
2. **Analysis:** The application uses OpenAI's Vision API to analyze the image and extract detailed information about the product (color, shape, material, etc.).
3. **Generation:** The detailed product analysis is combined with the user's prompt to create a comprehensive description for DALL-E 3.
4. **Result:** DALL-E 3 generates a professional studio-quality product photo based on the enhanced description.

## Architecture

The application is built with:

- Next.js 15 with App Router
- OpenAI for image analysis (Vision) and generation (DALL-E 3)
- Tailwind CSS for styling
- Sharp for image processing
- Formidable for file uploads

The architecture is designed to be modular and extensible:

- Abstract AI service layers for both image analysis and generation
- Credit-saving options (skip analysis, standard quality)
- Configurable prompts for different photo styles
- Stateless file handling (no database required)

## Credit Optimization

To minimize OpenAI API costs:

1. Use the "Skip image analysis" option for simple products
2. Provide detailed descriptions when skipping analysis
3. The app uses "standard" quality for DALL-E to save credits

## License

MIT
