import api from "./api";

export const getAllDoctors = () => {
    return api.get("/doctors");
};