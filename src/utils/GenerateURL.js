export const generateURL = (req, query) => {
  //   console.log(req.route);

  const protocal = req.get('host').includes('localhost') ? 'http' : 'https';
  const host = req.get('host');
  let apiPath = `/api${req.route.path}`;

  if (apiPath.includes(':slug')) {
    apiPath = apiPath.replace(':slug', req.params.slug);
  }

  const currentRoute = `${protocal}://${host}${apiPath}?${query}`;
  return currentRoute;

  //   const currentRoute = `${
  //     req.get('host').includes('localhost') ? 'http' : 'https'
  //   }://${req.get('host')}/api${req.route.path}?${query}`;

  //   return currentRoute;
};
