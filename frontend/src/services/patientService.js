import api from "./api";

export const getAllPatients = () => {
    return api.get("/patients");
};