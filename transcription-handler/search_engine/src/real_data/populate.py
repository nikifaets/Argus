import json
import sys
import time

sys.path.append("../src")

from ElasticSearchClient import ElasticSearchClient

f = open('./real_data/data.json',)

data = json.load(f)['data']
es = ElasticSearchClient()

it = 0
for i in data:
    it += 1
    print(es.put(i, it, doc_type="knowledge_node"))

f.close()

time.sleep(1)

print(es.retrieve_all())
print()
# time.sleep(1)
# print(es.retrieve_all())

