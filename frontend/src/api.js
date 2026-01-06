import axios from 'axios';

const API_Base = 'http://localhost:8000';

export const listModels = async () => {
    const response = await axios.get(`${API_Base}/models`);
    return response.data.models;
};

export const loadModel = async (name) => {
    const response = await axios.post(`${API_Base}/load/image`, { name });
    return response.data;
};

export const chatWithModel = async (prompt) => {
    const response = await axios.post(`${API_Base}/chat`, { prompt });
    return response.data.response;
};

export const generateImage = async (prompt, negative_prompt, steps) => {
    const response = await axios.post(`${API_Base}/generate/text2img`, {
        prompt,
        negative_prompt,
        steps
    });
    return response.data;
};

export const generateImg2Img = async (prompt, negative_prompt, steps, strength, imageFile) => {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('negative_prompt', negative_prompt);
    formData.append('steps', steps);
    formData.append('strength', strength);
    formData.append('image', imageFile);

    const response = await axios.post(`${API_Base}/generate/img2img`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const generateVideo = async (imageFile, prompt, fps = 7) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (prompt) formData.append('prompt', prompt);
    formData.append('fps', fps);

    const response = await axios.post(`${API_Base}/generate/video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};
