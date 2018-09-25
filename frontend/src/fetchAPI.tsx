const fetchAPI = (url: string, method: string, params: { [key: string]: any }) => {
  const token = localStorage.getItem('sessionToken')
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token || ''
    },
    body: JSON.stringify(params)
  })
}

export default fetchAPI