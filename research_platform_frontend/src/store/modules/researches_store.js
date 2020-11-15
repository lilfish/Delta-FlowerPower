import { addResearch, getResearches } from "../../api/api";
import { ADD_RESEARCH, ADD_RESEARCH_ERROR, ADD_RESEARCH_SUCCESS, GET_RESEARCHES, GET_RESEARCHES_ERROR, GET_RESEARCHES_SUCCESS } from "../mutation_types";
import { STATUS, StoreResponse } from "../storeResponse";

export const researches_store = {
    state: {
        researches: [],
        status: ""
    },
    mutations: {
        [GET_RESEARCHES](state) {
            state.status = "loading";
        },
        [GET_RESEARCHES_SUCCESS](state, researches) {
            state.researches = researches;
            state.status = "success";
        },
        [GET_RESEARCHES_ERROR](state) {
            state.status = "error";
        },
        [ADD_RESEARCH](state) {
            state.status = "loading";
        },
        [ADD_RESEARCH_SUCCESS](state, research) {
            state.researches.push(research);
            state.status = "success";
        },
        [ADD_RESEARCH_ERROR](state) {
            state.status = "errror";
        }
    },
    actions: {
        async getResearches({ commit }) {
            commit(GET_RESEARCHES);
            try {
                const response = await getResearches();
                commit(GET_RESEARCHES_SUCCESS, response.data);
                return new StoreResponse(STATUS.SUCCESS, "Succesfully fetched researches", response.data);
            } catch (error) {
                commit(GET_RESEARCHES_ERROR);
                return new StoreResponse(STATUS.ERROR, "Error fetching researches", error);
            }
        },

        async addResearch({ commit }, research) {
            commit(ADD_RESEARCH);
            try {
                const response = await addResearch(research);
                commit(ADD_RESEARCH_SUCCESS, response.data);
                return new StoreResponse(STATUS.SUCCESS, "Succesfully added research", response.data);
            } catch (error) {
                commit(ADD_RESEARCH_ERROR);
                return new StoreResponse(STATUS.ERROR, "Error adding research", error);
            }
        }
    }
}