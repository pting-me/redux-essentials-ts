// A tiny wrapper around fetch(), borrowed from
// https://kentcdodds.com/blog/replace-axios-with-a-simple-custom-fetch-wrapper

// maps to window.fetch
export const client = async (
  endpoint: RequestInfo | URL,
  { body, ...customConfig }: RequestInit = {}
) => {
  const headers = { 'Content-Type': 'application/json' };

  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  let data;
  try {
    const response = await window.fetch(endpoint, config);
    data = await response.json();
    if (response.ok) {
      // Return a result object similar to Axios
      return {
        status: response.status,
        data,
        headers: response.headers,
        url: response.url,
      };
    }
    throw new Error(response.statusText);
  } catch (err) {
    return Promise.reject(
      Object.prototype.hasOwnProperty.call(err, 'message')
        ? (err as Error).message
        : data
    );
  }
};

client.get = function (
  endpoint: RequestInfo | URL,
  customConfig: RequestInit = {}
) {
  return client(endpoint, { ...customConfig, method: 'GET' });
};

client.post = function (
  endpoint: RequestInfo | URL,
  body: RequestInit['body'],
  customConfig: RequestInit = {}
) {
  return client(endpoint, { ...customConfig, body });
};
