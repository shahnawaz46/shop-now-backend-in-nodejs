export const generateURL = (req, query, admin = false) => {
  //   console.log(req.route);

  const protocal = req.get('host').includes('localhost') ? 'http' : 'https';
  const host = req.get('host');
  let apiPath = '';

  if (admin) {
    apiPath = `/api/admin${req.route.path}`;
  } else {
    apiPath = `/api${req.route.path}`;
  }

  if (apiPath.includes(':slug')) {
    apiPath = apiPath.replace(':slug', req.params.slug);
  }

  let currentRoute = '';
  if (query) {
    currentRoute = `${protocal}://${host}${apiPath}?${query}`;
  } else {
    currentRoute = `${protocal}://${host}${apiPath}`;
  }

  return currentRoute;

  //   const currentRoute = `${
  //     req.get('host').includes('localhost') ? 'http' : 'https'
  //   }://${req.get('host')}/api${req.route.path}?${query}`;

  //   return currentRoute;
};
