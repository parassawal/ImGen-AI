import React, { useState } from 'react';
import { generateVideo } from '../api';
import { Video as VideoIcon, Upload, Loader2, Play } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function VideoGenerator() {
    const [fps, setFps] = useState(7);
    const [prompt, setPrompt] = useState('');
    const [refImage, setRefImage] = useState(null);
    const [refImagePreview, setRefImagePreview] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleRefImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRefImage(file);
            setRefImagePreview(URL.createObjectURL(file));
            setVideoUrl(null); // Reset result
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!refImage || loading) return;

        setLoading(true);
        setVideoUrl(null);
        try {
            const data = await generateVideo(refImage, prompt, fps);
            // Construct full URL if relative
            const url = data.video_url.startsWith('http')
                ? data.video_url
                : `http://localhost:8000${data.video_url}`;
            setVideoUrl(url);
        } catch (err) {
            alert("Failed to generate video. Ensure a Video Model (SVD) is loaded.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col md:flex-row gap-6">
            {/* Controls */}
            <div className="w-full md:w-1/3 space-y-6">
                <div className="bg-surface/50 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                        <VideoIcon className="text-accent" />
                        Image to Video
                    </h2>
                    <p className="text-xs text-gray-500 mb-6">
                        Animate your images using Stable Video Diffusion. Load an SVD safetensors model first.
                    </p>

                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Input Image</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleRefImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={clsx(
                                    "w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
                                    refImagePreview ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 group-hover:bg-white/10"
                                )}>
                                    {refImagePreview ? (
                                        <img src={refImagePreview} alt="Reference" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <Upload className="text-gray-400 mb-2" size={32} />
                                            <span className="text-sm text-gray-400">Upload source image</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Prompt (Optional)</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the motion or scene (if model supports it)..."
                                className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent resize-none transition-all placeholder:text-gray-600 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 flex justify-between">
                                <span>Frames Per Second</span>
                                <span className="text-accent">{fps} FPS</span>
                            </label>
                            <input
                                type="range"
                                min="4"
                                max="24"
                                step="1"
                                value={fps}
                                onChange={(e) => setFps(parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !refImage}
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin" /> Animating...</>
                            ) : (
                                <><Play fill="currentColor" /> Generate Video</>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Output */}
            <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                {!videoUrl && !loading && (
                    <div className="text-center text-gray-500">
                        <div className="mb-4 flex justify-center opacity-20"><VideoIcon size={64} /></div>
                        <p>Upload an image to animate it</p>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-accent" size={48} />
                        <p className="text-accent animate-pulse text-sm">Processing Frames...</p>
                    </div>
                )}

                {videoUrl && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full flex items-center justify-center p-4"
                    >
                        <video
                            controls
                            autoPlay
                            loop
                            src={videoUrl}
                            className="max-h-full rounded-lg shadow-2xl"
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
