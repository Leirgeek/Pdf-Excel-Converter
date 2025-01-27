 'use client';
 
 import { useState } from 'react';
 
 export default function Home() {
   const [prompt, setPrompt] = useState('');
   const [image, setImage] = useState('');
   const [loading, setLoading] = useState(false);
 
   const generateImage = async () => {
     try {
       setLoading(true);
       const response = await fetch('/api/generate', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           prompt,
           aspect_ratio: '3:2',
         }),
       });
       const data = await response.json();
       if (data.success) {
         setImage(data.output);
       }
     } catch (error) {
       console.error('Error generating image:', error);
     } finally {
       setLoading(false);
     }
   };
 
   return (
     <main className="container mx-auto px-4 py-8">
       <div className="max-w-2xl mx-auto space-y-6">
         <h1 className="text-3xl font-bold text-center">Image Generator</h1>
         <div className="space-y-4">
           <textarea
             className="w-full p-2 border rounded-md"
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             placeholder="Enter your image description..."
             rows={4}
           />
           <button
             onClick={generateImage}
             disabled={loading}
             className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
           >
             {loading ? 'Generating...' : 'Generate Image'}
           </button>
         </div>
         {image && (
           <div className="mt-6">
             <img src={image} alt="Generated" className="w-full rounded-lg" />
           </div>
         )}
       </div>
     </main>
   );
 }