import { GET_AREAS, GET_AREAS_SUCCESS, GET_AREAS_ERROR, ADD_AREA, ADD_AREA_SUCCESS, ADD_AREA_ERROR } from "../mutation_types";
import { getAreas, addArea } from "../../api/api.js"

export const areas_store = {
    state: {
        areas: [],
        status: "",
        message: ""
    },
    mutations: {
        [GET_AREAS](state) {
            state.status = "loading";
        },
        [GET_AREAS_SUCCESS](state, areas) {
            state.status = "success";
            state.areas = areas;
        },
        [GET_AREAS_ERROR](state, message) {
            state.status = "error";
            state.message = message;
        },
        [ADD_AREA](state) {
            state.status = "loading";
        },
        [ADD_AREA_SUCCESS](state, area) {
            state.status = "success";
            state.areas.push(area);
        },
        [ADD_AREA_ERROR](state) {
            state.status = "error";
        },
    },
    actions: {
        getAreas({ commit }) {
            commit(GET_AREAS);
            return new Promise((resolve, reject) => {
                getAreas().then((response) => {
                        commit(GET_AREAS_SUCCESS, response.data);
                        resolve(response);
                    })
                    .catch((error) => {
                        commit(GET_AREAS_ERROR);
                        reject(error);
                    })
            })
        },

        addArea({ commit }, area) {
            commit(ADD_AREA);
            return new Promise((resolve, reject) => {
                addArea(area).then((response) => {
                    commit(ADD_AREA_SUCCESS, response.data);
                    resolve(response);
                }).catch((error) => {
                    commit(ADD_AREA_ERROR);
                    reject(error);
                })
            })
        }
    },
    modules: {},
}