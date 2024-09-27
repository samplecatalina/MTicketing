import axios from 'axios'

const baseURL =
  typeof window === 'undefined'
    ? 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local'
    : ''

const buildClient = ({ req }) => {
  // const { headers } = req
  // return axios.create({ baseURL, headers })

  // if (typeof window === 'undefined') {
  //   // We are on the server

  //   return axios.create({
  //     baseURL:
  //       'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
  //     headers: req.headers
  //   })
  // } else {
  //   // We must be on the browser
  //   return axios.create({
  //     baseUrl: '/'
  //   })
  // }

  const config =
    typeof window === 'undefined'
      ? {
          baseURL: 'http://www.tix-samplecatalina.xyz',
          headers: req.headers
        }
      : { baseURL: '' }

  return axios.create(config)
}
export default buildClient
