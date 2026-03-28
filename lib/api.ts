import axios from "axios";

// const API_URL = "http://localhost:4000";
const API_URL = "https://ai-server-txsz.onrender.com";


const api = axios.create({
    baseURL: API_URL,
});

export const login = async (uniqueIdentifier: string, password: string) => {
    const response = await api.post("/login", { uniqueIdentifier, password });
    return response.data;
};

export const register = async (data: { name: string; email: string; username: string; password: string }) => {
    const response = await api.post("/register", data);
    return response.data;
};

export const startChat = async (userPrompt: string, token: string) => {
    const response = await api.post(
        "/ai-chat",
        { userPrompt },
        {
            headers: {
                Authorization: `${token}`,
            },
        }
    );
    return response.data;
};

export const getPosts = async (token: string) => {
    const response = await api.get("/getPostByUser", {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response.data;
};

export const createBlog = async (data: FormData, token: string) => {
    const response = await api.post("/createBlog", data, {
        headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getBlogs = async (token: string) => {
    const response = await api.get("/getBlogByUser", {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response.data;
};

export const getSavedBlogs = async (token: string) => {
    const response = await api.get("/getSavedBlogByUser", {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response.data;
};

export const getAllBlogs = async () => {
    const response = await api.get("/getAllBlogs");
    return response.data;
};


export const saveBlog = async (blogId: string, token: string) => {
    const response = await api.post(`/saveBlog/${blogId}`, {}, {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response.data;
};

export const getBlogById = async (id: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `${token}`;
    }
    const response = await api.get(`/getBlogById/${id}`, { headers });
    return response.data;
};

export const aiBlog = async (userPrompt: string, token: string) => {
    const response = await api.post(
        "/ai-blog",
        { userPrompt },
        {
            headers: {
                Authorization: `${token}`,
            },
        }
    );
    return response.data;
};

export const deleteBlog = async (id: number, token: string) => {
    const response = await api.delete(`/deleteBlog/${id}`, {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response.data;
};

export const updateBlog = async (id: number, data: FormData, token: string) => {
    const response = await api.put(`/updateBlog/${id}`, data, {
        headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getProfile = async (token: string) => {
    const response = await api.get("/getProfile", {
        headers: {
            Authorization: `${token}`,
        },
    });
    return response.data;
};

export const updateProfile = async (data: FormData, token: string) => {
    const response = await api.post("/updateProfile", data, {
        headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getCategories = async () => {
    const response = await api.get("/getCategories");
    return response.data;
};





