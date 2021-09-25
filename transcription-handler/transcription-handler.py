import requests
from flask import Flask, json, request

from search_engine.src import ElasticSearchClient

class TranscriptionHandler:
    knownKeywords = [ "tinder", "issues", "discord", "bot", "java", "script", "wrapper", "emotion", "recognition", "pull", "request", "argus", "design", "document", "architecture"]
    rasaEndpoint = 'http://localhost:5005/model/parse'

    def __init__(self):    
        self.lastUser = None
        self.lastIsAction = False
        self.es = ElasticSearchClient()
        
    def get_rasa_intent(self, m):
        payload = "{\"text\": \"" + m + "\"}"
        req_res = requests.post(self.rasaEndpoint, data = payload)
        req_json = req_res.json()
        return req_json['intent']['name']

    def is_intent_action(self, m):
        print(self.get_rasa_intent(m))
        return self.get_rasa_intent(m) == "action"

    def process_incoming_message(self, m):
        if self.lastIsAction:
            self.lastIsAction = False
            print("Expecting action, performing keyword search")
            kwds = self.get_keywords(m)
            res = self.do_keyword_search(kwds)
            if res is not None:
                return res
            else:
                return ""
        else:
            self.lastIsAction = self.is_intent_action(m)
            print("Action is ", self.lastIsAction)
            return ""
    
    def get_keywords(self, m):
        return sorted([x for x in self.knownKeywords if x.lower() in m.lower()])

    def do_keyword_search(self, keywords):
        if len(keywords) == 0:
            return None
        print("Searching with kwds", keywords)
        res = self.es.keyword_search(keywords)
        print(res)
        if len(res['hits']['hits']) == 0:
            return None
        return res['hits']['hits'][0]['_source']

th = TranscriptionHandler()

api = Flask(__name__)

@api.route('/recommendation/', methods=['POST'])
def get_recommendation():
    m = str(request.get_data())
    print(m)
    return th.process_incoming_message(m)

api.run(host="0.0.0.0")
print("Listening...")
