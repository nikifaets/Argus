from typing import List
import ssl
from elasticsearch import Elasticsearch
from elasticsearch.connection import create_ssl_context
from elasticsearch.connection.http_requests import RequestsHttpConnection
from .config import ES_HOST, USE_SSL

class ElasticSearchClient():
    
    es : Elasticsearch = None
    default_index: str = "argus"

    def __init__(self):

        self.es = Elasticsearch([ES_HOST], verify_certs=USE_SSL)
        print(self.es.info())
    
    def retrieve_all(self, index_name=None, page_size=20) -> List[dict]:

        query = { "match_all": {} }

        return self.__search__(query, index_name, page_size)


    def keyword_search(
        self, keywords: List[str],
        index_name: str = None,
        page_size: int = 20) -> List[dict]:

        query = {
            "query_string" : {
                "query": ' OR '.join(map(lambda x: f"({x})", keywords)),
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
