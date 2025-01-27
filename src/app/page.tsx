import { FileUpload } from '@/components/FileUpload';
import { SchemaDefinition } from '@/components/SchemaDefinition';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">PDF to Excel Converter</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <FileUpload />
        </div>
        <div className="lg:col-span-2">
          <SchemaDefinition />
        </div>
      </div>
    </main>
  );
}