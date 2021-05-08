import axios from "axios";

axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// @ts-ignore
window.axios = axios; //todo: remove this line...only for development

export default axios;
