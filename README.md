# PDF Data Extractor

A modern web application that extracts structured data from PDF files and converts it into Excel format using AI-powered text analysis.

## Features

- 📄 **PDF Text Extraction**: Extract text from PDF files using LlamaIndex
- 🤖 **AI-Powered Analysis**: Process extracted text using OpenAI's GPT-4 for structured data extraction
- 📊 **Excel Generation**: Convert structured data into downloadable Excel files
- 🎯 **Multiple File Support**: Process multiple PDF files in one go
- 🎨 **Modern UI**: Beautiful dark theme interface with responsive design
- ⚡ **Real-time Feedback**: Instant previews and toast notifications

## Tech Stack

### Frontend
- **Next.js 14**: React framework for production
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Beautiful modern icons
- **React Dropzone**: Drag and drop file uploads

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **LlamaIndex**: PDF parsing and text extraction
- **OpenAI GPT-4**: Structured data extraction
- **XLSX**: Excel file generation

### Development Tools
- **TypeScript**: Type-safe development
- **Zod**: Runtime type validation
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn
- OpenAI API key
- LlamaIndex API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Leirgeek/pdf-converter.git
   cd pdf-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   LLAMA_CLOUD_API_KEY=your_llama_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload PDF Files**
   - Drag and drop PDF files into the upload area
   - Or click to select files from your computer
   - Multiple files can be uploaded simultaneously

2. **Preview Extracted Text**
   - Click the "Preview" button to view extracted text
   - Verify the text extraction quality

3. **Process Files**
   - Click "Start Extraction" to begin AI processing
   - Wait for the structured data extraction to complete

4. **Download Results**
   - Click "Download Excel" to get your structured data
   - Excel file includes all processed information in organized sheets

## Error Handling

The application includes comprehensive error handling:
- File validation
- PDF parsing errors
- API rate limiting
- Network issues
- Server errors

All errors are logged and displayed to users via toast notifications.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for their powerful GPT-4 API
- LlamaIndex for their PDF parsing capabilities
- The Next.js team for the amazing framework
- All contributors and users of this project
