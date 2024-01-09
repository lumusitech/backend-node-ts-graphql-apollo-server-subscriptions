import { JSONResponse, User } from '../models/jsonResponse'

// Demo response from reqres.in api: https://reqres.in/api/users?page=2
// const users = [
//   {
//     id: '7',
//     email: 'michael.lawson@reqres.in',
//     first_name: 'Michael',
//     last_name: 'Lawson',
//     avatar: 'https://reqres.in/img/faces/7-image.jpg',
//   },
//   {
//     id: '8',
//     email: 'tom@reqres.in',
//     first_name: 'Tom',
//     last_name: 'Lee',
//     avatar: 'https://reqres.in/img/faces/8-image.jpg',
//   },
// ]

export const resolvers = {
  User: {
    completeName: (parent: User) => `${parent.first_name} ${parent.last_name}`,
  },

  Query: {
    allUsers: async () => {
      // TODO: add api request to reqres.in
      const URL = 'https://reqres.in/api/users'

      const response: any = await fetch(URL)
      const { data }: JSONResponse = await response.json()

      return data
    },
  },
}
