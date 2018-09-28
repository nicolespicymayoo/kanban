
const token = localStorage.getItem('sessionToken')
const headers = {
  'Content-Type': 'application/json',
  'Authorization': token || ''
}

export const fetchGET = (url: string) => {
  return fetch(url, {
    headers: headers
  })
}

export const fetchPOST = (url: string, body: Object) => {
  return fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  })
}

export const fetchDELETE = (url: string, body: Object) => {
  return fetch(url, {
    method: 'DELETE',
    headers: headers,
    body: JSON.stringify(body)
  })
}