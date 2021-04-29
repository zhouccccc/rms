export default function requestAPI() {
  let nameSpace = {
    i18n: 'https://translation-api-dev.mushiny.com',
    sso: 'https://sso-api-dev.mushiny.com',
    WS: 'ws://52.83.125.230:35674/ws',
    mixrobot: 'http://52.83.125.230:8085',
    'latent-lifting': 'http://52.83.125.230:8085',
    'tote-wcs-gui': 'http://52.83.125.230:8085',
    forklift: 'http://52.83.125.230:8085',
    sorter: 'http://52.83.125.230:8085',
  };
  const nameSpaceInfo = window.localStorage.getItem('nameSpacesInfo');
  if (nameSpaceInfo) {
    nameSpace = { ...JSON.parse(nameSpaceInfo) };
  }
  return nameSpace;
}