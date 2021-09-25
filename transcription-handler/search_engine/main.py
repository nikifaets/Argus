from src import ElasticSearchClient
import asyncio

es = ElasticSearchClient()
result = es.retrieve_all()
result2 = es.keyword_search(["nani", "id02"])
print(result)
print()
print(result2)
