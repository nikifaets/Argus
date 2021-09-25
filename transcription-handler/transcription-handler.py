import requests
from flask import Flask, json, request

class TranscriptionHandler:
    knownKeywords = ['python', 'working']
    rasaEndpoint = 'http://localhost:5005/model/parse'

    def __init__(self):    
        self.lastUser = None
        self.lastIsAction = False
        
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
            return self.do_keyword_search(self.get_keywords(m))
        else:
            self.lastIsAction = self.is_intent_action(m)
            print("Action is ", self.lastIsAction)
            return ""
    
    def get_keywords(self, m):
        return sorted([x for x in self.knownKeywords if x.lower() in m.lower()])

    def do_keyword_search(self, keywords):
        print("Searching with kwds", keywords)
        return {'type': 'book', 'title': 'a great book'}

th = TranscriptionHandler()

api = Flask(__name__)

@api.route('/recommendation', methods=['POST'])
def get_recommendation():
    m = str(request.get_data())
    print(m)
    return th.process_incoming_message(m)

api.run()
print("Listening...")