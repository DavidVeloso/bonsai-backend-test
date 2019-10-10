# Welcome to the Bonsai Backend Test!

We want to test your skills in a few key areas, especially with respect to how you think about problems and the values you bring to the code you write. Take your time, we want to see your best work.

We've prepared a basic skeleton of a project to help you work a little bit faster. Feel free to change out anything in the project as long as you meet the `Requirements`. Just because something is written doesn't mean it is right!

## Requirements

- [ ] Provide a GraphQL endpoint to initiate cleaning and storing of ticket data into MonogDB from the provided external API
  - API: `https://us-central1-bonsai-interview-endpoints.cloudfunctions.net/movieTickets?skip=0&limit=10`
  - The `skip` and `limit` parameters are the only ones that exist.
  - There are only `1000` movie tickets in this test feed but you should be able to consume more than that
- [ ] Clean and store additional data about the imported movie tickets from this API: http://www.omdbapi.com/
- [ ] Create a GraphQL endpoint that can deliver data from both data sources
  - Support pagination
- [ ] Sufficiently and effectively unit test functions as you see fit
- [ ] Fix any bugs or bad code you happen to find along the way
- [ ] Optimize one previously written function (`(method) TicketResolver.listTickets(input: ListTicketsInput): Promise<Ticket[]>` in `source/resolvers/Ticket.resolver.ts`). It should get resolved in under 15ms when fetching for 10 items out of 1000+ documents

## Evaluation

Please document your changes well and make as many atomic commits as you feel are necessary for someone to see how you work.

We will be evaluating the following:

- How well and completely you meet the requirements
- Attention to detail
- Following modern best practices
- Robustness of testing, both manual and automatic
- Communication clarity in code, documentation and pull request

People who do well will be contacted through email within a week of acknowledgement of pull request submission.

Thanks and good luck!

## Instructions

1. Create a GraphQL endpoint to initiate ticket syncing
2. Implement consuming ticket API and saving tickets to the database
3. Get an API key for OMDB: http://www.omdbapi.com/apikey.aspx
4. Consume OMDB API to populate a movies collection for each of the tickets (you might get rate limited, so consume OMDB API key from environment variables)
5. You might have a few tickets without matching movies, adjust the logic to find those as well (you might still not be able to find 100% of them, but do your best)
6. Create a GraphQL endpoint with pagination to fetch tickets without matching movies
7. Extend existing `TicketResolver.listTickets` to output movie information for each ticket
8. `TicketResolver.listTickets` method is highly unoptimized. Optimize it to the best of your abilities. You can modify any file that you think would improve the response time
9. Create effective unit tests for the functions you see fit
10. You might have a few tickets with `inventory` equaled to `-1`. This should never be the case. Figure out where this is happening & fix the bug
11. There is a query to fetch a ticket by its ID. However, it's not working. Figure out why & fix the bug
