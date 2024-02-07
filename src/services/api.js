import axios from 'axios';
export const getApi = async (url) => {
  return await axios
    .get(`${url}`)
    .then((res) => res.data);
};

