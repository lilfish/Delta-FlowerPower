import store from "../store";
import * as axios from "axios"

const ModelsApi = {
    getModels() {
        return axios
            .get("http://localhost:7080/aimodels")
            .then(response => response.data)
            .catch(err => {
                store.dispatch("api_response", {
                    err: err.response
                })
            })
    }
}

export default ModelsApi