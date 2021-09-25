from typing import List
import re
from elasticsearch import Elasticsearch
from elasticsearch.connection import create_ssl_context
from elasticsearch.connection.http_requests import RequestsHttpConnection
from .config import ES_HOSTS, USE_SSL

class ElasticSearchClient():
    
    es : Elasticsearch = None
    default_index: str = "argus"

    def __init__(self):

        self.es = Elasticsearch(ES_HOSTS, verify_certs=USE_SSL)
        self.es.indices.create(index=self.default_index, ignore=400)

    def put(self, document, id, index=None, doc_type=None, params=None, headers=None):
        
        if index == None:
            index = self.default_index
        
        return self.es.create(index, id, document=document, doc_type=doc_type, params=params, headers=headers, ignore=409)
    
    def flush(self):
        return self.es.indices.delete("*", ignore=[400, 404])

    def retrieve_all(self, index_name=None, page_size=20) -> List[dict]:

        query = { "match_all": {} }

        return self.__search__(query, index_name, page_size)

    def keyword_search(
        self, keywords: List[str],
        index_name: str = None,
        page_size: int = 1) -> List[dict]:
        query = {
            "query_string" : {
                "query": ' OR '.join(map(lambda x: f"({re.sub('[^0-9a-zA-Z]+', '*', x)})", keywords)),
                "default_field": "*"
            }
        }
        
        return self.__search__(query, index_name, page_size)


    '''
        Internal method for abstracting the 
        only ElasticSearch search call
    '''
    def __search__(self, es_query: dict, index_name: str, page_size: int) -> List[dict]:
        
        if index_name is None:
            index_name = self.default_index

        res = self.es.search(
            index=index_name,
            query=es_query,
            size=page_size
        )
        
        return res
