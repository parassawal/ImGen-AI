import React, { useEffect, useState } from 'react';
import { listModels, loadModel } from '../api';
import { RefreshCw, HardDrive, CheckCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function ModelSelector({ onModelLoaded }) {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingModel, setLoadingModel] = useState(false);
    const [error, setError] = useState(null);

    const fetchModels = async () => {
        setLoading(true);
        try {
            const m = await listModels();
            setModels(m);
        } catch (err) {
            setError("Failed to fetch models");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    const handleLoad = async (modelName) => {
        setLoadingModel(true);
        setError(null);
        try {
            await loadModel(modelName);
            setSelectedModel(modelName);
            if (onModelLoaded) onModelLoaded(modelName);
        } catch (err) {
            setError(`Failed to load ${modelName}`);
        } finally {
            setLoadingModel(false);
        }
    };

    return (
        <div className="p-4 bg-surface rounded-xl shadow-lg border border-white/10 text-white w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <HardDrive size={20} className="text-primary" />
                    Models
                </h2>
                <button onClick={fetchModels} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <RefreshCw size={16} className={clsx(loading && "animate-spin")} />
                </button>
            </div>

            {error && (
                <div className="bg-red-500/20 text-red-200 p-2 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {models.length === 0 && !loading && (
                    <p className="text-gray-400 italic text-sm text-center py-4">
                        No .safetensors found in /backend/models
                    </p>
                )}

                {models.map((model) => (
                    <div
                        key={model}
                        onClick={() => handleLoad(model)}
                        className={clsx(
                            "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border",
                            selectedModel === model
                                ? "bg-primary/20 border-primary"
                                : "bg-white/5 border-transparent hover:bg-white/10"
                        )}
                    >
                        <span className="truncate text-sm pr-2" title={model}>{model}</span>
                        {selectedModel === model ? (
                            <CheckCircle size={16} className="text-green-400 shrink-0" />
                        ) : (
                            loadingModel && selectedModel !== model ? (
                                <div className="w-4" />
                            ) : null
                        )}

                        {loadingModel && selectedModel !== model && (
                            // Show loader if this specific item was clicked? 
                            // Actually we state `loadingModel` globally for simplicity here.
                            // Let's just overlay a spinner if this is the target.
                            /* Not implementing per-item loader for simplicity, just global block */
                            null
                        )}
                    </div>
                ))}

                {loadingModel && (
                    <div className="flex items-center gap-2 text-primary text-sm justify-center py-2 animate-pulse">
                        <Loader2 size={16} className="animate-spin" />
                        Loading Model...
                    </div>
                )}
            </div>
        </div>
    );
}
