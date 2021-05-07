import axios from "axios";

axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// @ts-ignore
window.axios = axios;

export default axios;
