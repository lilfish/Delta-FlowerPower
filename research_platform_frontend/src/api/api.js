import Axios from 'axios';

export async function getAreas() {
    return Axios({
        url: "http://localhost:7080/locations",
        method: "GET",
    })
}

export async function addArea(area) {
    return Axios({
        url: "http://localhost:7080/locations",
        method: "POST",
        data: area
    })
}