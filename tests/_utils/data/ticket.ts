import { imdbValidResponse } from './movie'
import MovieModel from  '../../../source/entities/Movie'
import TicketModel from  '../../../source/entities/Ticket'

export const bonsaiValidTicketsResponse = [
  {
    _id: { $oid: "5b8701a1fc13ae656900001e"},
    title: "Les Lyonnais",
    genre: "Drama|Thriller",
    price: 27.179,
    inventory: 5,
    image: "http://dummyimage.com/978x295.png/ff4444/ffffff",
    date: "2017-12-26T15:26:45Z"
  },
  {
    _id: { $oid: "5b8701a1fc13ae656900001f"},
    title: "Heavenly Creatures",
    genre: "Crime|Drama",
    price: 24.529,
    inventory: 10,
    image: "http://dummyimage.com/587x783.jpg/dddddd/000000",
    date: "2018-03-29T04:20:01Z"
  },
  {
    _id: { $oid: "5b8701a1fc13ae6569000025" },
    title: "Straight Story, The",
    genre: "Adventure|Drama",
    price: 22.526,
    inventory: 9,
    image: "http://dummyimage.com/491x432.png/dddddd/000000",
    date: "2017-10-24T15:03:47Z"
  }
]

export const bonsaiInValidTicketsResponse = [
  {
    _id: { $oid: "5b8701a1fc13ae656900001e"},
    title: "",
    genre: "Drama|Thriller",
    price: 27.179,
    inventory: 5,
    image: "http://dummyimage.com/978x295.png/ff4444/ffffff",
    date: "2017-12-26T15:26:45Z"
  },
  {
    _id: { $oid: "6f8g01a1fc13ae656900001e"},
    title: null,
    genre: "",
    price: 34,
    inventory: 4,
    image: "http://dummyimage.com/978x295.png/ff4444/ffffff",
    date: "2017-12-28T15:26:45Z"
  },
  {
    _id: { $oid: "6f8g01a1fc13ae656900001e"},
    title: "The Other",
    genre: "Drama",
    price: 14.89,
    inventory: 12,
    image: "http://dummyimage.com/978x295.png/ff4444/ffffff",
    date: null
  }
]

export const validTickets = [
  {
    "title": "Wheelmen",
    "date": new Date("2018-08-30T21:58:50.000Z"),
    "imageUrl": "http://dummyimage.com/864x1887.bmp/5fa2dd/ffffff",
    "originId": "5b8701a2fc13ae656900013d",
    "inventory": 6,
    "price": 29.973,
    "genre": ['Drama'],
  },
  {
    "title": "Avengers",
    "date": new Date("2017-01-20T09:51:31.000Z"),
    "imageUrl": "http://dummyimage.com/1248x1733.jpg/cc0000/ffffff",
    "originId": "5b8701a2fc13ae6569000176",
    "inventory": 7,
    "price": 20.143
  },
  {
    "title": "Her",
    "date": new Date("2018-06-04T08:18:44.000Z"),
    "imageUrl": "http://dummyimage.com/1763x1520.png/5fa2dd/ffffff",
    "originId": "5b8701a4fc13ae6569000390",
    "inventory": 2,
    "price": 28.236
  }
]

export const ticketsWithoutMatchMovie = [
  {
    "title": "She No Longer Exists",
    "date": "2017-09-18T11:20:14.000Z",
    "imageUrl": "http://dummyimage.com/1222x578.png/5fa2dd/ffffff",
    "originId": "5b8701a1fc13ae6569000019",
    "inventory": 8,
    "price": 15.388
  },
  {
    "title": "City Not found, The",
    "date": "2017-10-05T09:36:11.000Z",
    "imageUrl": "http://dummyimage.com/885x835.png/5fa2dd/ffffff",
    "originId": "5b8701a1fc13ae656900002e",
    "inventory": 9,
    "price": 18.212,
    "syncMovieTries": 1
  },
  {
    "title": "Têli e Zaga!",
    "date": "2018-09-20T20:51:15.000Z",
    "imageUrl": "http://dummyimage.com/721x662.bmp/dddddd/000000",
    "originId": "5b8701a1fc13ae6569000075",
    "inventory": 3,
    "price": 29.538,
    "syncMovieTries": 2
  }
]

export const createTicketWithMovie = async () => {
  const movie = await MovieModel.create(imdbValidResponse)
  const created = await TicketModel.create({
    "title": "Movie Top",
    "date": new Date("2018-08-30T21:58:50.000Z"),
    "imageUrl": "http://dummyimage.com/864x1887.bmp/5fa2dd/ffffff",
    "originId": "5b8701a2fc13ae656900013d",
    "inventory": 6,
    "price": 29.973,
    "genre": ['Drama'],
    "movie": movie._id
  })
  return created
}