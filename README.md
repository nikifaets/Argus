# Argus

## Inspiration

The path to success, mainly lies within efficiency, productivity and organization. Success often is followed by rapid growth, which in turn decreases efficiency and productivity as the organization becomes harder to manage. Different teams start working on the same tasks, work is repeated and company knowledge networks are under utilized.

Our team has had experience with that exact problem as employees at tech giants among which are VMWare and Amazon, which is why we were led to believe that this is a relevant problem.

## What is Argus?

Argus aims to solve the aforementioned problem by automating the process of going through numerous internal knowledge platforms (e.g wikis, discussion boards, ticketing systems, code repositories etc.).

Argus starts when the discussion starts. It keeps track of the ongoing conversation, and extracts relevant keywords. Those keywords are later used to efficiently traverse the knowledge network of the company and let the meeting participants know if the discussed topic has already been looked into.

Argus is a knowledge network ingestion pipeline. The main functionality it features is:
- Seamless integration with existing internal communication services.
- Detection of intent via NLP whether people in a meeting are about to discuss something to work on.
- Relevant keyword extraction.
- Performant ingestion, which allows for keyword searching.
- Horizontally Scalable architecture to accommodate for any business needs.

## How we built it

Our first goal was to define the scope of the technical solution. We reached to the following goals for HackZurich
- Design a highly scalable, fault-tolerant and easily integretable ingestion system
- Build a reliable proof of concept, which includes 
- - Setting up and configuring an ElasticSearch cluster
- - Utilizing state-of-the-art NLP methods for intent and keywords detection via Rasa
- - Set up Google Cloud as our speech-to-text service, allowing Argus to seemingly integrate with almost every video conferencing platform.
- - Tie everything together in a neat PoC with Discord, as an example of a communication platform.

## Challenges we ran into

- Dividing tasks efficiently
- Dealing with numerous technologies that are new to us
- Integrate everything together

## Accomplishments that we're proud of

- We managed to build a seemingly reliable user experience, covering everyday work situations.
- We covered our goals for HackZurich
- Despite all of the different services, we managed to tie everything together into one user experience.

## What we learned

- With the right time management and organization we can achieve a lot.
- ElasticSearch is an incredibly powerful platform.

## What's next for Argus - eliminate duplicate work at scale

We are really hyped about the idea, and have been in touch with company representatives who have echoed this exact problem. Improving reliability and extensibility are some of our goals for the future. We'll be doing that by gathering more data and leveraging more sophisticated approaches for keyword detection, subsequently verifying the customer experience and keeping in touch with what is actually needed.

HackZurich has been a great experience and an insane kickstart to a great idea, with a lot of potential. Can't wait to see what the future holds.

