import React, { useState } from 'react';
import { generateImage, generateImg2Img } from '../api';
import { Image as ImageIcon, Sparkles, Download, Loader2, Upload, Box } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function ImageGenerator() {
    const [mode, setMode] = useState('text2img'); // 'text2img' or 'img2img'
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [steps, setSteps] = useState(25);
    const [strength, setStrength] = useState(0.75);
    const [generatedImg, setGeneratedImg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refImage, setRefImage] = useState(null);
    const [refImagePreview, setRefImagePreview] = useState(null);

    const handleRefImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRefImage(file);
            setRefImagePreview(URL.createObjectURL(file));
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || loading) return;
        if (mode === 'img2img' && !refImage) {
            alert("Please upload a reference image for Img2Img.");
            return;
        }

        setLoading(true);
        setGeneratedImg(null);
        try {
            let data;
            if (mode === 'text2img') {
                data = await generateImage(prompt, negativePrompt, steps);
            } else {
                data = await generateImg2Img(prompt, negativePrompt, steps, strength, refImage);
            }
            setGeneratedImg(data.image);
        } catch (err) {
            alert("Failed to generate image. Ensure a compatible model is loaded.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col md:flex-row gap-6">
            {/* Controls */}
            <div className="w-full md:w-1/3 space-y-6 flex flex-col h-full overflow-y-auto pr-2">
                <div className="bg-surface/50 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">

                    {/* Mode Switcher */}
                    <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                        <button
                            onClick={() => setMode('text2img')}
                            className={clsx(
                                "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                                mode === 'text2img' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                            )}
                        >
                            Text to Image
                        </button>
                        <button
                            onClick={() => setMode('img2img')}
                            className={clsx(
                                "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                                mode === 'img2img' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                            )}
                        >
                            Image to Image
                        </button>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-4">
                        {mode === 'img2img' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Reference Image</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleRefImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className={clsx(
                                        "w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
                                        refImagePreview ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 group-hover:bg-white/10"
                                    )}>
                                        {refImagePreview ? (
                                            <img src={refImagePreview} alt="Reference" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <Upload className="text-gray-400 mb-2" />
                                                <span className="text-xs text-gray-400">Click to upload image</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={mode === 'img2img' ? "Describe changes to the image..." : "A futuristic city with flying cars..."}
                                className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent resize-none transition-all placeholder:text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Negative Prompt</label>
                            <input
                                type="text"
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder="blurry, bad quality..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent transition-all placeholder:text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 flex justify-between">
                                <span>Inference Steps</span>
                                <span className="text-accent">{steps}</span>
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="50"
                                step="1"
                                value={steps}
                                onChange={(e) => setSteps(parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                        </div>

                        {mode === 'img2img' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 flex justify-between">
                                    <span>Denoising Strength</span>
                                    <span className="text-accent">{strength}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1.0"
                                    step="0.05"
                                    value={strength}
                                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                                <p className="text-xs text-gray-500 mt-1">Lower = closer to original image</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !prompt.trim()}
                            className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin" /> Generating...</>
                            ) : (
                                <><Sparkles /> Generate</>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Output/Preview */}
            <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                {!generatedImg && !loading && (
                    <div className="text-center text-gray-500">
                        <div className="mb-4 flex justify-center opacity-20"><ImageIcon size={64} /></div>
                        <p>Enter a prompt to start dreaming</p>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-accent">AI</div>
                        </div>
                        <p className="text-accent animate-pulse text-sm tracking-widest uppercase">Rendering</p>
                    </div>
                )}

                {generatedImg && !loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full h-full flex items-center justify-center p-4"
                    >
                        <img
                            src={generatedImg}
                            alt="Generated"
                            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
                        />

                        <a
                            href={generatedImg}
                            download={`imgen-${Date.now()}.png`}
                            className="absolute bottom-8 right-8 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Download size={24} />
                        </a>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
